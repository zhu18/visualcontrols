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

        $.getJSON("./static/mapdata/world.json",(geoData)=>{
            let opt={
                name:'map1',
                el:self.$refs.map,
                geoData,
               // debugger:true,
                area:{
                  color:0x25313d,//0x99ee33,
                  lineColor:0x7093ab,
                  hoverColor:0x33ff99,
                  hasHoverHeight:true,
                  data:[
                    {name:'China',color:'#55677a',value:15}
                  ]
                },
              line:{
                data:[],
              }

            }

          geoData.features.forEach((i)=>{
            //opt.area.data.push({name:i.properties.name,color:Math.random()*0x99ee33})
            //线数据

            opt.line.data.push({fromName:i.properties.name,
              toName:'',
              haloDensity:1000,
              hasHaloAnimate:false,
              spaceHeight:Math.random() * 30,
              color:0x57d2ff,
              haloSize:Math.random() * 5,
              coords:[i.properties.cp,i.properties.cp],//[116.4551,40.2539]
              value:Math.random()*7});
          })

            let map = new Map3D(opt);
            map.setCameraPosition({x:0,y:-200,z:0});
            map.setCameraPosition({x:0,y:0,z:150},1000,500)

          map.addEventListener( 'mousedown', function (event) {
            let area = event.target;
            let data=[];
            let lineColor = Math.random() * 0xffffff;
            geoData.features.forEach((i)=>{
              //线数据
              data.push({
                fromName:i.properties.name,
                toName:area.name,
                haloDensity:2,
                hasHalo:false,
                spaceHeight:30,
                color:lineColor,
                haloSize:Math.random() * 10,
                coords:[i.properties.cp,area.userData.cp],
                value:Math.random()*1});

            })


            map.initLine({data});
          });

          map.addEventListener( 'mouseout',(event)=>{
            self.isOverMap=false;
          });

          map.addEventListener( 'mouseover',(event)=>{
            let obj = event.target;
            switch(obj.type)
            {
              case 'Line':
                self.mapName = obj.userData.fromName +'-'+obj.userData.toName;
                break;
              case 'Mark':
                break;
              case 'DataRange':
                self.mapName = obj.userData.name +':'+(obj.userData.min||'')+'-'+(obj.userData.max||'');
                break;
              case 'Area':
                self.mapName = obj.userData.name
                break;
              default:
                self.mapName = obj.userData.name
                break;
            }

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
