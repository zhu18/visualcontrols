<template>
  <div class="wrap" >
    <div id="map" :class="['map',mapActiveLevel=='china'?'map-act':'']" ref='map'></div>
    <div :class="['map1',mapActiveLevel=='province'?'map-act1':'']">
      <div id="map1" class="inner-map"  ref='map1'></div>
      <div id="btn" class="btn btn-colse" @click="openChinaMap">关闭</div>
    </div>

    <div id="" :class="['map-title',isOverMap ? 'map-title-over' : '']" :style="mapTitlePositon">{{mapName}}</div>
  </div>

</template>

<script>
    import Map3D from 'assets/js/Map3D.js'

    let self;
    let map,map1;

    function onmouseout(event,area){
      self.isOverMap=false;
    }
    function onmouseover(event,area){
      //console.log(obj._name+"x:"+event.clientX+",y:"+event.clientY);
      self.mapName=area.userData.name;//+":"+(area.userData.value||0);
      self.isOverMap=true;
      self.mapTitlePositon.left=$(window).scrollLeft()+event.clientX+20+'px';
      self.mapTitlePositon.top=$(window).scrollTop()+event.clientY+20+'px';
    }
    function onmousedown(event,area){
      console.log(area);
      console.log('selected:'+area.userData.name+",id:"+area.userData.id);
      $.getJSON('./static/mapdata/geometryProvince/'+area.userData.id+'.json',(data)=> {
        map1 = new Map3D({
          el: self.$refs.map1,
          data,
          color:null,
          lineColor:0,
          opacity:.8,
          onmouseout,
          onmouseover,
          extrude:{
            amount : .8,
            bevelThickness : 1,
            bevelSize : .2,
            bevelEnabled : false,
            bevelSegments : 5,
            curveSegments :1,
            steps : 1,
          }
        });
        self.openProvMap();
        map1.onmousedown=function(event,area){
          console.log('selected:'+area.userData.name+",id:"+area.userData.id);
        }
        map1.setCameraPosition({x:0,y:-10,z:10},500);

      });
    }

export default {
  name: 'map3d',
  title:'3D地图-中国',

  data () {
    return {
        isOverMap:false,
        mapName:'',
        mapTitlePositon:{
            left:'800px',
            top:'600px'
        },
        mapActiveLevel:'china' // 'province'
    }
  },
    methods:{
        openProvMap(){
            self.mapActiveLevel='province';
            map && map.disable()
            map1 && map1.disable(false);


        },
        openChinaMap(){
            self.mapActiveLevel='china';
            map1 && map1.disable();
            map && map.disable(false);
        }
    },
    mounted(){

        self=this;
        $.getJSON("./static/mapdata/china.json",(data)=>{
//            let sc=data.features.find(item=>item.properties.name=='新疆');
//            Object.assign(sc.properties,{color:'#ff9933',value:'2341'});

            let opt={
                el:self.$refs.map,
                data,
                color:0x3366ff,
                lineColor:0,
                hoverColor:0x99aaff,
                shininess:300,
                opacity:.5,
                userData:[
                   // {name:'内蒙古',color:'rgb(66,140,255)',value:1155},
                    {name:'北京',color:'#ff6666',value:155},
                   // {name:'湖南',color:'rgb(33,255,100)',value:25,opacity:0.6}
                    ],
              onmousedown,
            }
          map = new Map3D(opt);
          map.onmouseout=onmouseout;
          map.onmouseover=onmouseover;
          //map['onmousedown']=onmousedown;

        });


    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss"  scoped>
  @import './../../assets/css/index.sass';

  .wrap{

  }
  .map{
    width:100%;
    height:100%;
    position: absolute;
    top:0px;
    z-index: 0;
    opacity: 0.5;
    transition: all .3s;
  }
  .map1{
    width:100%;
    height:100%;
    position: absolute;
    top: 0px;
    right:0px;
    z-index: 0;
    opacity: 0;
    /*border: 1px solid #fff;*/
    /*box-shadow: 0 0 20px rgba(255, 255, 255, 0.5);*/
    transition: all .3s;
    z-index: 0;
    border-radius: 5px;
    background: rgba(0,0,0,.3);
  }
  .map-act{
    opacity: 1;
    z-index: 1;
  }
  .map-act1{
    right:0;
    opacity: 1;
    z-index: 10;
  }
  .inner-map{
    width:100%;
    height:100%;
  }
  .map-title{
    border-radius: 5px;
    border:1px solid #ddd;
    color:#eee;
    background:rgba(0,0,0,.4);
    position: absolute;
    z-index: 10;
    width: 100px;
    height: 50px;
    opacity: 0;
    line-height: 50px;
    text-align: center;
    transition: all .2s;
  }
  .map-title-over{
    opacity: 1;
  }
  .btn-colse{
    position: absolute;
    top:170px;
    right:100px;
    width:60px;
    height:30px;
    line-height:30px;
    cursor: pointer;
    color:#aaa;
    border:1px solid #aaa;
    border-radius: 5px;
    font-size:14px;
    transition: all .3s;
  }
  .btn-colse:hover{
    color:#fff;
    border:1px solid #fff;
    background:rgba(255,255,255,0.2);
  }
</style>
