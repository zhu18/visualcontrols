<template>
  <div class="wrap">
    <div class="map" ref='map'></div>
    <div id="" :class="['map-title',isOverMap ? 'map-title-over' : '']" :style="mapTitlePositon">{{mapName}}</div>
  </div>

</template>

<script>
  import Map3D from 'assets/js/Map3D.js'


  export default {
    name: 'map3d',
    title: '3D地图-标注点',

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
      openProvMap(){
        self.mapActiveLevel = 'province';
        map.disable();
        map1.disable(false);
      },
      openChinaMap(){
        self.mapActiveLevel = 'china';
        map1.disable();
        map.disable(false);
      }
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
          geoData,
        //  debugger: true,

          mark:{
            data:[
                {name:'台风-依安',coord:[116,23],value:2,color:0xff0000,size:4,value:12},
                {name:'台风-戴旭',coord:[120,36],value:2,color:0xff0000,size:3,value:11}
                ],
            color:0xffffff,
          }
        }

        //点数据
//        geoData.features.forEach((geo)=>{
//          opt.mark.data.push({name:geo.properties.name,coord:geo.properties.cp,color:0xffffff,size:Math.random()*1})
//        })

        let map = new Map3D(opt);

        //事件
        map.addEventListener('mousedown', function (event) {
          let area = event.target;
          area.setColor('#ff6666', 500);
        });

        map.addEventListener('mouseout', (event) => {
          let obj = event.target;
          console.log(obj.type+':out')
          self.isOverMap = false;

        });

        map.addEventListener('mouseover', (event) => {
          let obj = event.target;
          console.log(obj.type+':over...')
          self.mapName = obj.userData.name;
          self.isOverMap = true;
          self.mapTitlePositon.left = $(window).scrollLeft() + event.clientX + 20 + 'px';
          self.mapTitlePositon.top = $(window).scrollTop() + event.clientY + 20 + 'px';
        })


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
