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

    function onmouseout(area){
        self.isOverMap=false;
    }
    function onmouseover(area){
        //console.log(obj._name+"x:"+event.clientX+",y:"+event.clientY);
        self.mapName=area.userData.name;//+":"+(area.userData.value||0);
        self.isOverMap=true;
        self.mapTitlePositon.left=$(window).scrollLeft()+event.clientX+20+'px';
        self.mapTitlePositon.top=$(window).scrollTop()+event.clientY+20+'px';
    }
export default {
  name: 'map3d',
  title:'3D地图',

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
            map1.setCameraPosition({x:0,y:-25,z:3},300);
            //map.setCameraPosition({x:0,y:30,z:30});
          // setTimeout(()=>{map1.setCameraPosition({x:0,y:-30,z:3});},1000)

        },
        openChinaMap(){
            self.mapActiveLevel='china';
            map1 && map1.disable();
            map && map.disable(false);
           // map.setCameraPosition({x:0,y:-30,z:-30});
           // map1.setCameraPosition({x:0,y:30,z:30});
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
                shininess:300,
                opacity:.5,
                userData:[
                  //  {name:'内蒙古',color:'rgb(66,140,255)',value:1155},
                    {name:'北京',color:'#ff6666',value:155},
                 //   {name:'湖南',color:'rgb(33,255,100)',value:25,opacity:0.6}
                    ],
                onmouseout,
                onmouseover,
                onmousedown:function(area){
                    console.log(area);
                    console.log('selected:'+area.userData.name+",id:"+area.userData.id);
                    //console.log('selected:'+area.userData.name);
                    //map.setAreaData(area,{color:'#ff6666',value:2155});
                    //map.load('./static/mapdata/geometryProvince/'+area.userData.id+'.json')
                    //obj.position.z=4;
                    //map.camera.lookAtWorld(area.position);
                  //  map.camera.lookAtWorld(area.position);
                    $.getJSON('./static/mapdata/geometryProvince/'+area.userData.id+'.json',(data)=> {
                        map1 = new Map3D({el: self.$refs.map1,data,color:null,lineColor:0,
                            hasStats:false,
                            onmouseout,
                            onmouseover,
                            onmousedown(area){
                                console.log('selected:'+area.userData.name+",id:"+area.userData.id);
//                                let id=(''+area.userData.id).split('');
//                                id.splice(4,2,...[0,0]);
//                                let areaid=id.join('');
//                                $.getJSON('./static/mapdata/geometryCouties/'+areaid+'.json',(data)=> {
//                                    map1.setAreaData(area,{color:Math.random() * 0xffffff});
//                                });
                            }
                        });

                       // map1.camera.position.set(1.44,12.302,15.76)
                       // map.setCameraPosition({x:0,y:0,z:50});
                       // window.map.setCameraPosition({x:0,y:30,z:30});
                        self.openProvMap();
                       // map1.setCameraPosition({x:20,y:-30,z:-10})
                        window.map1=map1;

                    });
                    return false;

                }
            }
            map = new Map3D(opt);
           // map.setCameraPosition({x:0,y:45,z:45});
           // map.setCameraPosition({x:0,y:-45,z:-45},1000);
           // map.setCameraPosition({x:0,y:-105,z:-105},1000,2000);
            window.map=map;

            //map.mapObject.applyMatrix(matrix)
//            let opt1=opt;
//            opt1.userData=[
//                {name:'四川',color:'rgb(66,140,255)',value:21},
//                {name:'湖北',color:'#ff9933',value:551},
//                {name:'河南',color:'rgb(133,255,30)',value:215,opacity:0.6}
//            ],
//            delete opt1.el
//            map1 = new Map3D(opt1);

//            for(let i=0;i<data.features.length;i++)
//            {
//                let item =data.features[i]
//                setTimeout(()=>{
//                    map.setAreaData(item.properties.name,{color:Math.random() * 0xffffff,value:i++});
//                    console.log(item.properties.name+':'+i)
//                    },1000+(i*100));
//            }


            //map.load('./static/china.json')
           // map.setData('./static/china.json',[{_name:'北京',_value:'11',_color:'#336699'}])
        });


    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss"  scoped>
  @import './../../assets/css/index.sass';

  .wrap{
    width:100%;
    height:100%;
    position: absolute;
    top:0px;
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
