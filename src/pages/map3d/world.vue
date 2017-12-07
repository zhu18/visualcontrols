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
  title:'3D地图-世界',

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

    },
    mounted(){
        self=this;

        $.getJSON("./static/mapdata/world.geo.json",(data)=>{
            let opt={
                name:'map1',
                el:self.$refs.map,
                data,
                color:0x99ee33,
                lineColor:0x000000,
                hoverColor:0x33ff99,
                debugger:true,
                userData:[
                    {name:'China',color:'#ff6666',value:15},
                    ]
            }
            let map = new Map3D(opt);
            map.addCameraPosition({x:0,y:100,z:100},1100)

          map.addEventListener( 'mousedown', function (event) {
            let area = event.target;
            console.log(area);
          });

          map.addEventListener( 'mouseout',(event)=>{
            self.isOverMap=false;
          });

          map.addEventListener( 'mouseover',(event)=>{
            let area = event.target;
            // console.log(event);
            //console.log(obj._name+"x:"+event.clientX+",y:"+event.clientY);
            self.mapName=area.userData.name;
            self.isOverMap=true;
            self.mapTitlePositon.left=$(window).scrollLeft()+event.clientX+20+'px';
            self.mapTitlePositon.top=$(window).scrollTop()+event.clientY+20+'px';

          })

          map.addEventListener( 'resize', function ( event ) {
            console.log('map resize...');

          } );
        });


    }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss"  scoped>
  @import './../../assets/css/index.sass';

  .wrap{
    background:#000;
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
    padding:10px;
    opacity: 0;

    text-align: center;
    transition: all .2s;
  }
  .map-title-over{
    opacity: 1;
  }
</style>
