<template>
  <div class="wrap" ref='wrap'></div>
</template>


<script type="text/javascript">
  import Nebula from 'assets/js/nebula.js'
  import Galaxy from 'assets/js/galaxy.js'

  export default {
    name: 'component_name',
    title: '太阳系',

    created(){
      //this.$emit('setTitle',this.title);
    },
    mounted(){
//      let stars = [{
//        name: '太阳',
//        size: 20,
//        emissive: 0xe65f05,
//        mapUrl: 'static/sun.jpg',
//        revspeed: 0.01,//公转速度
//        rotspeed: 0.01//自转速度
//      },
//        {
//          name: '水星',
//          size: 3,   //大小
//          dist: 40,  //距离
//          emissive: 0xe65f05,
//          mapUrl: 'static/shuixin.png',
//          revspeed: 0.01,
//          rotspeed: 0.01
//        },
//        {
//          name:'金星',
//          color:0xcceeff,
//          dist:-60,
//          mateType:2,
//          mapUrl:'static/jinxin.png',
//          revspeed:0.007,
//          rotspeed:0.01
//        },{
//          name:'地球',
//          color:0xcceeff,dist:80,
//          mateType:2,
//          mapUrl:'static/world.jpg',
//          revspeed:0.007,
//          rotspeed:0.01
//        },
//        {name:'月球',color:0x888888,size:1,dist:13,mateType:2,parent:'地球',
//          revspeed:0.03,
//          rotspeed:0.01
//        },
//        {name:'火星',color:0xff9933,size:5,dist:-100,mateType:2,mapUrl:'static/a.jpg',
//          revspeed:0.005,
//          rotspeed:0.01
//        },
//        {name:'木星',color:0xcceeff,size:15,dist:120,mateType:2,mapUrl:'static/muxin.png',
//          revspeed:0.003,
//          rotspeed:0.01
//        },
//        {name:'土星',color:0x669966,size:12,dist:-140,mateType:2,mapUrl:'static/tuxin.png',
//          revspeed:0.01,
//          rotspeed:0.02
//        },
//        {name:'天王星',color:0x663333,size:10,dist:160,mateType:1,mapUrl:'static/tianwangxin.png',
//          revspeed:0.01,
//          rotspeed:0.02
//        },
//        {name:'海王星',color:0x663333,size:9,dist:-180,mateType:1,mapUrl:'static/haiwangxin.png',
//          revspeed:0.006,
//          rotspeed:0.02
//        },
//        {name:'冥王星',color:0x663333,size:2,dist:200,mateType:1,
//          revspeed:0.005,
//          rotspeed:0.02
//        }]
      let galaxy = new Galaxy({el: this.$refs.wrap,starOpts:[]});
    }
  }
</script>
<style>
  .star-text {
    z-index: 1;
    border: 1px solid #eee;
    height: 30px;
    border-radius: 5px;
    width: 100px;
    color: #fff;
    line-height: 30px;
    text-align: center;
    transition: opacity .5s, transform .5s;
    opacity: 0;
    transform: translate3d(0, -30px, 0);
  }

  .star-text-hover {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
</style>
<style lang="scss" scoped>
  .wrap {
    background-image: url('./../../assets/img/bg2.jpg');
  }
</style>
