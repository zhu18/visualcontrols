<template>
  <div class="wrap">
    <div class="map" ref='map'></div>
    <div id="" :class="['map-title',isOverMap ? 'map-title-over' : '']" :style="mapTitlePositon">{{mapName}}</div>
  </div>

</template>

<script>
  import Map3D from 'assets/js/Map3D.js'
  import barImg from './../../assets/img/building.png'
import barImg1 from './../../assets/img/1s.png'
  export default {
    name: 'map3d',
    title: '地图-柱状图',

    data () {
      return {
        isOverMap: false,
        mapName: '',
        mapTitlePositon: {
          left: '800px',
          top: '600px'
        },
      }
    },
    methods: {

    },
    mounted(){
      self = this;

      $.getJSON("./static/mapdata/china.json", (geoData) => {

        // for(let i=0;i<1000;i++){
        //   let lat=Math.random()*100+50;
        //   let lon=Math.random()*20+10;
        //   this.mark.data.push({name:'test'+i,coord:[lat,lon],size:Math.random()*3})
        // }
        let opt = {
          name: 'map1',
          el: self.$refs.map,
          // debugger:true,
          geoData,
          area:{
            data:[],
            loadEffect:true,
            color:0x052659,
            lineColor:0x1481ba,
            hoverColor:0x44ffff,
            opacity:.3,
          },
          mark:{
            data:[],
            color:0xffffff,
          },
          bar:{
              data:[],
             url:barImg1,
            // hoverColor:0xff00ff,
             additiveBlending:true,
             emissive:0x0066ff,
             depthTest:false,
             opacity:1,
             useAlphaMap:true,
            hoverExclusive:false
          },
          line:{
            data:[]
          }
        }

        geoData.features.forEach((i)=>{
          //点数据
       //   opt.mark.data.push({name:i.properties.name,color:0xcaffff,coord:i.properties.cp,size:Math.random()*0.5});
          //线数据
          let h= Math.random()*7
          let sz=Math.random()*10
          opt.bar.data.push({coord:i.properties.cp,
            name:'北京',
            size:.2,
            barType:'cylinder',
            color:0x0dbdff,
            value:h});

            // opt.line.data.push({
            //     fromName:i.properties.name,
            //     toName:sz,
            //     haloDensity:100,
            //     spaceHeight:h*2,
            //     haloRunRate:0.9,
            //     color:0x0dbdff,
            //     haloSize:10,
            //     haloColor:0xffffff,
            //     coords:[i.properties.cp,i.properties.cp],
            //     value:Math.random()*1})

                // opt.line.data.push({
                // fromName:i.properties.name,
                // toName:sz,
                // haloDensity:30,
                // spaceHeight:h*2,
                // haloRunRate:0.01,
                // color:Math.random()*0xffffff,
                // haloSize:sz,
                // haloColor:0xffffff,
                // coords:[i.properties.cp,i.properties.cp],
                // value:Math.random()*1})
        })


        let map = new Map3D(opt);
        map.setCameraPosition({x:-2,y:-26,z:30},1000,300);

        map.addEventListener('mousedown', function (event) {
          let area = event.target;
          console.log(area)

          if(area.type==='Area'){
            let data=[];
            let color = Math.random() * 0xffffff;
            
            data.push({
              fromName:area.name,
              toName:area.name,
              hasHaloAnimate:false,
              haloDensity:800,
              spaceHeight:20,
              haloRunRate:-8,
              color:color,
              haloSize:20,
              coords:[area.userData.cp,area.userData.cp],
              value:Math.random()*1});

            map.initLine({data});
            //map.mark.data=[];
           // map.mark.data.push({name:'台风-依安',coord:[116,23],value:2,color:0xff0000,size:4,value:12},);
           // map.initMark();
          }
        });

        map.addEventListener('mouseout', (event) => {
          let obj = event.target;
          self.isOverMap = false;

          if(obj.type==='Line')
          {

          }
        });
        var haloColorR,haloColorG,haloColorB;
        map.addEventListener('mouseover', (event) => {
          let obj = event.target;
          if(obj.type==='Bar')
          {
            self.mapName = obj.userData.fromName +'-'+obj.userData.toName;
            obj.set
          }
          else
          {
            self.mapName = obj.userData.name + ':'+obj.userData.value;
          }
          self.isOverMap = true;
          self.mapTitlePositon.left = $(window).scrollLeft() + event.clientX + 20 + 'px';
          self.mapTitlePositon.top = $(window).scrollTop() + event.clientY + 20 + 'px';
        })

        map.addEventListener('resize', function (event) {
          console.log('map resize...');
        });
        // map.addCameraPosition({x:-30,y:15,z:15},1000)
        //map.setPosition({x:-13,y:0,z:35})
      });


    }
  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
  @import './../../assets/css/index.sass';

  .wrap {
    background-image: url('./../../assets/img/bg2.jpg');
  }

  .map {
    width: 100%;
    height: 100%;
  }

  .map-title {
    border-radius: 5px;
    border: 1px solid #ddd;
    color: #eee;
    background: rgba(0, 0, 0, .4);
    position: absolute;
    z-index: 2;
    opacity: 0;
    padding: 15px;
    text-align: center;
    transition: all .2s;
    pointer-events: none;
  }

  .map-title-over {
    opacity: 1;
  }
</style>
