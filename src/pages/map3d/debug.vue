<template>
  <div class="wrap" >
    <div class="map" ref='map'></div>
    <div id="" :class="['map-title',isOverMap ? 'map-title-over' : '']" :style="mapTitlePositon">{{mapName}}</div>
  </div>

</template>

<script>
    import Map3D from 'assets/js/Map3D.js'


export default {
  name: 'map3d',
  title:'3D地图-调试模式',

  data () {
    return {
        isOverMap:false,
        mapName:'',
        mapTitlePositon:{
            left:'800px',
            top:'600px'
        },
    }
  },
    methods:{
        openProvMap(){
            self.mapActiveLevel='province';
            map.disable();
            map1.disable(false);
        },
        openChinaMap(){
            self.mapActiveLevel='china';
            map1.disable();
            map.disable(false);
        }
    },
    mounted(){
        self=this;

        $.getJSON("./static/mapdata/china.json",(data)=>{
//            let sc=data.features.find(item=>item.properties.name=='湖南');
//            Object.assign(sc.properties,{color:0x336698,value:'2341',opacity:.3});

            let opt={
                name:'map1',
                el:self.$refs.map,
                data,
                color:0x336699,
                lineColor:0xffffff,
                debugger:true,
//                shininess:300,
//                opacity:.5,
                userData:[
                    {name:'新疆',color:0xff9933,value:85,},
                    {name:'内蒙古',color:'rgb(66,140,255)',value:15},
                    {name:'北京',color:'#ff6666',value:155},
                    {name:'四川',color:'#ff3333',value:200,hoverColor:'#ff33ff'},
                    //{name:'湖南',color:'rgb(33,255,100)',value:25,opacity:0.1}
                    ],
                onmouseout(event,area){
                    self.isOverMap=false;
                },
                onmouseover(event,area){
                   // console.log(event);
                    //console.log(obj._name+"x:"+event.clientX+",y:"+event.clientY);
                    self.mapName=area.userData.name;
                    self.isOverMap=true;
                    self.mapTitlePositon.left=$(window).scrollLeft()+event.clientX+20+'px';
                    self.mapTitlePositon.top=$(window).scrollTop()+event.clientY+20+'px';

                },
                onmousedown(event,area){
                    console.log(area);
                    console.log('selected:'+area.userData.name+",id:"+area.userData.id);
                    map.setArea(area,{color:'#ff6666'});
                    //map.setAreaData(area,{color:'#ff6666',value:2155});
                    //map.load('./static/mapdata/geometryProvince/'+area.userData.id+'.json')
                    //obj.position.z=4;
                    //map.camera.lookAtWorld(area.position);

                }
            }
            let map = new Map3D(opt);
            map.addCameraPosition({x:-30,y:15,z:15},1000)
            //map.setPosition({x:-13,y:0,z:35})
        });


    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss"  scoped>
  @import './../../assets/css/index.sass';

  .wrap{
    background-image:url('./../../assets/img/bg2.jpg');
  }
  .map{
    width:100%;
    height:100%;
  }

  .map-title{
    border-radius: 5px;
    border:1px solid #ddd;
    color:#eee;
    background:rgba(0,0,0,.4);
    position: absolute;
    z-index: 2;
    width: 100px;
    height: 50px;
    opacity: 0;
    line-height: 50px;
    text-align: center;
    transition: all .2s;
    pointer-events: none;
  }
  .map-title-over{
    opacity: 1;
  }
</style>
