
### 使用案例
```javascript
  import Map3D from 'assets/js/Map3D.js'
   
   let opt = {
          name: 'map1',
          el: document.getElementById('div'),
          // debugger:true,
          // 地图数据参考,标准geojson格式 https://zhu18.github.io/visualcontrols/static/mapdata/china.json
          geoData,
          // 地图区域设置
          area:{
            data:[],
            loadEffect:true,
            color:0x052659,
            lineColor:0x1481ba,
            lineOpacity:0.1,//线透明度
            opacity:.5,
          }
        }
        //创建3D地图
        let map = new Map3D(opt);
        //重新调整视角
        map.setCameraPosition({x:-2,y:-26,z:30},1000,300);

```
### Map3D完整配置项说明

```javascript
let opt={
      name:'',            //调试使用，window['name']为该实例对象，注意设置debugger:true启用
      el:document.body,   //容器
      geoData:null,       //地图geojson数据
      hasStats:true,      //是否显示性能面板
      hasControls:true,   //用户是否能控制视角
      autoRotate:false,   //是否自动旋转视角
      ambientColor:0x333333,//环境光颜色
      directionalColor:0xffffff,//平行光颜色
      hasLoadEffect:false,//是否有加载效果
      debugger:false,     //调试模式
      cameraPosition:{x:0,y:0,z:40},//相机位置
      extrude:extrudeOption,//立体厚度参数

      area:{
        data:[],            //地图用户数据[{name:'北京',value:,color:0xff3333}...]
        //area参数默认值
        name:'',            // 区域名称
        color:0x3366ff,     //地图颜色
        hoverColor:0xff9933,//鼠标移入颜色
        lineColor:0xffffff, //线颜色
        lineOpacity:1,      //线透明度
        opacity:1,          //地图透明度
        hasPhong:true,      //是否反光材质
        shininess:50,      //反光材质光滑度
        hoverAnimaTime:300, //鼠标移入动画过渡时间
        loadEffect:false,      //区域加载效果
        hasHoverHeight:true,  //鼠标移入区域升高
        showText:false,       //是否显示区域名称
      },

      dataRange:{
        data:[],
        width:1,
        height:0.7,
        position:{x:23,y:-8,z:1},
        spacing:0.2,
        text:['高','低'],
        textColor:'#ffffff',
        showName:false,
        namePosition:{x:-2,y:0,z:0},
        hoverColor:0xff9933,
        hoverAnimaTime:100,
        hasHoverHeight:true,  //鼠标移入区域升高
        hasEvent:true,
      },

      mark:{
        data:[],          //标注点数据[{name:'XXX',coord:[11,22],value:13}...]
        // mark参数默认值
        name:'',             // 标注名称
        color:0xffffff,     //标注点颜色
        hoverColor:0xff9933,//鼠标移入颜色
        hoverAnimaTime:100, //鼠标移入动画过渡时间
        min:0.01,
        max:5,
      },
      bar:{
        data:[],          //标注点数据[{name:'XXX',coord:[11,22],value:13}...]
        // mark参数默认值
        name:'',             // 标注名称
        color:0xffffff,     //标注点颜色
        hoverColor:0xff9933,//鼠标移入颜色
        hoverAnimaTime:100, //鼠标移入动画过渡时间
        size:1,             //柱子大小
        value:1,            //柱子高度
      },
      line:{
        data:[],        //线数据[{fromName:'',toName:'',coords:[toCoord,fromCoord]}...]
        //line可继承参数
        color:0x55eeff,
        hoverColor:0xff9933,            // 鼠标移入颜色
        hoverExclusive:true,            // 鼠标移入排除其他线条
        hoverAnimaTime:100,             // 鼠标移入动画过渡时间
        spaceHeight:5,                  // 曲线空间高度
        hasHalo:true,                   // 是否开启光晕效果
        hasHaloAnimate:true,            // 是否开启光晕动画效果
        haloDensity:2,                  // 光点密度 值越大 越浓密，越消耗性能
        haloRunRate:0.01,               // 光点运动频率
        haloColor:0xffffff,             // 默认继承color颜色[不建议修改]
        haloSize:10,                    // 光晕大小
        decayColor:0x222222,            // 未激活线条颜色
      },

      //内置对象
      mapObject:null,//地图对象
      areaGroup:null,//区域组
      lineGroup:null,//线条组
      markGroup:null,//标记组
      scene:null,//场景对象-内部调用
      camera:null,//相机对象-内部调用
      renderer:null,//渲染器对象-内部调用
      stats:null,//性能对象-内部调用
      controls:null,//控制器对象-内部调用
      areaCount:0,
      _w:0,
      _h:0,
      __event:null,//事件对象
    }
```


### 事件使用说明
```javascript
    let map = new Map3D(opt);

    //鼠标单击
    map.addEventListener('mousedown', function (event) {
        let area = event.target;
        if(area.type==='Area'){
            console.log('当前选择的区域是:'+area.name)
        }
    });

    //鼠标移出
    map.addEventListener('mouseout', (event) => {
        let obj = event.target;
        if(obj.type==='Line')
        {
        
        }
    });

    //鼠标移入
    map.addEventListener('mouseover', (event) => {
        let obj = event.target;
        if(obj.type==='Line')
        {
        
        }
    })

    //resize
    map.addEventListener('resize', function (event) {
        console.log('map resize...');
    });
```