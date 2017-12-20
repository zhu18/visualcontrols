<template>
  <div class="wrap">
    <div class="map" ref='map'></div>
    <div id="" :class="['map-title',isOverMap ? 'map-title-over' : '']" :style="mapTitlePositon">{{mapName}}</div>
  </div>

</template>

<script>
import Map3D from "assets/js/Map3D.js";

export default {
  name: "map3d",
  title: "3D地图-数据范围",

  data() {
    return {
      isOverMap: false,
      mapName: "",
      mapTitlePositon: {
        left: "800px",
        top: "600px"
      }
    };
  },
  methods: {},
  mounted() {
    self = this;

    $.getJSON("./static/mapdata/china.json", geoData => {
      let opt = {
        name: "map1",
        el: self.$refs.map,
        geoData,
        //debugger: true,
        area: {
          data: [],
          color: 0x052659,
          lineColor: 0x1481ba
        },
        mark: {
          data: [],
          color: 0xffffff
        },
        line: {
          data: []
        },
        dataRange: {
          data: [
            { name: "高", min: 90, color: 0x0066e4 },
            { name: "高", min: 80, max: 90, color: 0x207be6 },
            { name: "中", min: 60, max: 80, color: 0x329de8 },
            { name: "低", max: 60, min: 30, color: 0x66b6fd }
          ]
        }
      };

      //添加区域数据
      geoData.features.forEach(i => {
        //线数据
        opt.area.data.push({
          name: i.properties.name,
          value: Math.random() * 100,
          color: 0x3399ff
          //loadEffect:true,
        });
      });

      let map = new Map3D(opt);
      map.setCameraPosition({ x: -2, y: -26, z: 30 }, 1000, 300);

      map.addEventListener("mousedown", function(event) {
        let area = event.target;
        if (area.type === "Area") {
          //map.mark.data=[];
          // map.mark.data.push({name:'台风-依安',coord:[116,23],value:2,color:0xff0000,size:4,value:12},);
          // map.initMark();
        }
      });

      map.addEventListener("mouseout", event => {
        let obj = event.target;
        self.isOverMap = false;
      });
      var haloColorR, haloColorG, haloColorB;
      map.addEventListener("mouseover", event => {
        let obj = event.target;
        switch (obj.type) {
          case "Line":
            self.mapName = obj.userData.fromName + "-" + obj.userData.toName;
            break;
          case "Mark":
            break;
          case "DataRange":
            self.mapName =
              obj.userData.name +
              ":" +
              (obj.userData.min || "") +
              "-" +
              (obj.userData.max || "");
            break;
          case "Area":
            self.mapName = obj.userData.name;
            break;
          default:
            self.mapName = obj.userData.name;
            break;
        }

        self.isOverMap = true;
        self.mapTitlePositon.left =
          $(window).scrollLeft() + event.clientX + 20 + "px";
        self.mapTitlePositon.top =
          $(window).scrollTop() + event.clientY + 20 + "px";
      });

      map.addEventListener("resize", function(event) {
        console.log("map resize...");
      });
      // map.addCameraPosition({x:-30,y:15,z:15},1000)
      //map.setPosition({x:-13,y:0,z:35})
    });
  }
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import "./../../assets/css/index.sass";

.wrap {
  background-image: url("./../../assets/img/bg2.jpg");
}

.map {
  width: 100%;
  height: 100%;
}

.map-title {
  border-radius: 5px;
  border: 1px solid #ddd;
  color: #eee;
  background: rgba(0, 0, 0, 0.4);
  position: absolute;
  z-index: 2;
  opacity: 0;
  padding: 15px;
  text-align: center;
  transition: all 0.2s;
  pointer-events: none;
}

.map-title-over {
  opacity: 1;
}
</style>
