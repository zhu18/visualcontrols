/**
 * 3D地图
 * Created by zhu18.github.io on 2017/11/19.
 * @author 朱润亚 <zhu18@vip.qq.com>
 * @version beta v1.0.3
 * @module Map3D
 */

import Detector from './Detector.js'
import * as THREE from './three.js'
import * as $ from './util'
import Font3D from './Font3D.js'
import TWEEN from './tween.min.js'
import OrbitControls from './OrbitControls.js'
import Event from './Event.js'
import Stats from './stats.js'
import Area from './Map3D.Area'
import DataRange from './Map3D.DataRange'
import Mark from './Map3D.Mark'
import Line from './Map3D.Line'


/**
 * 地图立体参数设置
 * @type {{amount: number, bevelThickness: number, bevelSize: number, bevelEnabled: boolean, bevelSegments: number, curveSegments: number, steps: number}}
 */
var extrudeOption = {
  amount : 1,//厚度
  bevelThickness : 1,
  bevelSize : .2,
  bevelEnabled : false,
  bevelSegments : 5,
  curveSegments :1,
  steps : 1,
};


/**
 * 创建3D地图.
 * @class
 * @example
 * //配置默认值
 * let opt={
 *      name:'',                // 调试使用，window['name']为该实例对象，注意设置debugger:true启用
 *      el:document.body,       // 容器
 *      geoData:null,           // 地图geojson数据
 *      hasStats:true,          // 是否显示性能面板
 *      hasControls:true,       // 用户是否能控制视角
 *      autoRotate:false,       // 是否自动旋转视角
 *      ambientColor:0x333333,  // 环境光颜色
 *      directionalColor:0xffffff,// 平行光颜色
 *      hasLoadEffect:false,    // 是否有加载效果
 *      debugger:false,         // 调试模式
 *      cameraPosition:{x:0,y:0,z:40},// 相机位置
 *      visualMap:null,         // 直观图图例
 *      extrude:extrudeOption,  // 立体厚度参数
 *
 *      area:{
 *          data:[],            // 地图用户数据[{ name:'北京', value:, color:0xff3333 }...]
 *          // area参数默认值
 *          name:'',            // 区域名称
 *          color:0x3366ff,     // 地图颜色
 *          hoverColor:0xff9933,// 鼠标移入颜色
 *          lineColor:0xffffff, // 线颜色
 *          opacity:1,          // 地图透明度
 *          hasPhong:true,      // 是否反光材质
 *          shininess:50,       // 反光材质光滑度
 *          hoverAnimaTime:100, // 鼠标移入动画过渡时间
 *          loadEffect:false,   // 区域加载效果
 *          hasHoverHeight:true,// 鼠标移入区域升高
 *      },
 *
 *      mark:{
 *          data:[],            // 标注点数据[{ name:'XXX', coord:[11,22], value:13 }...]
 *          // mark参数默认值
 *          name:'',            // 标注名称
 *          color:0xffffff,     // 标注点颜色
 *          hoverColor:0xff9933,// 鼠标移入颜色
 *          hoverAnimaTime:100, // 鼠标移入动画过渡时间
 *          min:0.01,
 *          max:5,
 *      },
 *
 *      line:{
 *          data:[],                        //线数据[{ fromName:'', toName:'', coords:[toCoord, fromCoord] }...]
 *          // line参数默认值
 *          color:0x55eeff,                 // 颜色
 *          hoverColor:0xff9933,            // 鼠标移入颜色
 *          hoverExclusive:true,            // 鼠标移入排除其他线条
 *          hoverAnimaTime:100,             // 鼠标移入动画过渡时间
 *          spaceHeight:5,                  // 曲线空间高度
 *          hasHalo:true,                   // 是否开启光晕效果
 *          hasHaloAnimate:true,            // 是否开启光晕动画效果
 *          haloDensity:2,                  // 光点密度 值越大 越浓密，越消耗性能
 *          haloRunRate:0.01,               // 光点运动频率
 *          haloColor:0xffffff,             // 默认继承color颜色[不建议修改]
 *          haloSize:10,                    // 光晕大小
 *          decayColor:0x222222,            // 未激活线条颜色
 *      },
 *
 *      //内置对象
 *      mapObject:null,     // 地图对象
 *      areaGroup:null,     // 区域组
 *      lineGroup:null,     // 线条组
 *      markGroup:null,     // 标记组
 *      scene:null,         // 场景对象
 *      camera:null,        // 相机对象
 *      renderer:null,      // 渲染器对象
 *      stats:null,         // 性能对象
 *      controls:null,      // 控制器对象
 *      _w:0,               // 呈现宽度
 *      _h:0,               // 呈现高度
 *      __event:null,        // 事件对象
 *  }
 *
 * let map = new Map3D(opt);
 *
 * //事件注册
 *   map.addEventListener('mousedown', function (event) {
 *        let obj = event.target;
 *        if(obj.type==='Area') //type='Area|Line|Mark'
 *          obj.setColor('#ff6666', 500);
 *      });
 *
 *   map.addEventListener('mouseout', (event) => {
 *        let obj = event.target;
 *        console.log(obj.type+':out')
 *      });
 *
 *   map.addEventListener('mouseover', (event) => {
 *        let obj = event.target;
 *        console.log(obj.userData.name);
 *        //self.mapTitlePositon.left = $(window).scrollLeft() + event.clientX + 20 + 'px';
 *        //self.mapTitlePositon.top = $(window).scrollTop() + event.clientY + 20 + 'px';
 *      })
 *
 *   map.addEventListener('resize', function (event) {
 *        console.log('resize...');
 *      });
 */
class Map3D{
  constructor(o){
    if(!Detector.webgl) {
      console.warn('不支持webgl,停止渲染.');
      return;
    }
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
        opacity:1,          //地图透明度
        hasPhong:true,      //是否反光材质
        shininess:50,      //反光材质光滑度
        hoverAnimaTime:300, //鼠标移入动画过渡时间
        loadEffect:false,      //区域加载效果
        hasHoverHeight:true,  //鼠标移入区域升高
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
    $.extend(true,opt,o);
    $.extend(true,this,opt);



    if(!this.geoData)
    {
      console.warn('Map3D no geoData.')
      return;
    }

    this._w=this.el.offsetWidth;
    this._h=this.el.offsetHeight;
    console.time('init');
    this.init()
    console.timeEnd('init');
    this.initEvent()
  }
  /**
   * 初始化方法
   */
  init(){
    this.el.innerHTML='';
    this.scene = new THREE.Scene({antialias:true});
    this.camera = new THREE.PerspectiveCamera(70, this._w/this._h, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({alpha:true });
    this.renderer.setPixelRatio( window.devicePixelRatio );
    this.camera.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);

    this.camera.lookAt(this.scene.position);
    this.renderer.setSize(this._w,this._h);
    //场景雾化
    //this.scene.fog=new THREE.FogExp2(0xaaffff,0.005)
    this.scene.fog = new THREE.Fog(0xffffff, 0.15, 1000);
    this.scene.add(new THREE.AmbientLight($.colorToHex(this.ambientColor)));
    this.dirLight = new THREE.DirectionalLight($.colorToHex(this.directionalColor));
    this.dirLight.position.set(0,50,50);
    this.scene.add(this.dirLight);
    this.dirLightDown = new THREE.DirectionalLight($.colorToHex(this.directionalColor));
    this.dirLightDown.position.set(0,-50,0);
    this.scene.add(this.dirLightDown);

    this.spotLight = new THREE.SpotLight($.colorToHex(this.color));
    this.spotLight.position.set(0,150,150);
    this.spotLight.intensity = 0.7;
    this.spotLight.target = this.scene;
    this.scene.add(this.spotLight);

    //创建地图区域添加到 mapObject
    this.mapObject = new THREE.Group();

    this.initControls()
    this.initDebug();

    console.time('initArea');
    //初始化区域
    this.initArea();
    console.timeEnd('initArea');

    console.time('initMark');
    //初始化标注点
    this.initMark();
    console.timeEnd('initMark');

    console.time('initLine');
    //初始化线条
    this.initLine();
    console.timeEnd('initLine');

    console.time('inintDataRange');
    //初始化数据等级范围
    this.inintDataRange();
    console.timeEnd('inintDataRange');

    //根据数据中心位置偏移
    if(this.geoData.cp){
      this.mapObject.position.set(-this.geoData.cp[0],-this.geoData.cp[1],0);
    }
    this.scene.add(this.mapObject);
    this.scene.add(this.camera);
    this.el.appendChild(this.renderer.domElement);
    this.renderScene();
  }
  /**
   * 地图区域初始化方法
   * @param {json} areaOpt - 区域配置
   */
  initArea(areaOpt){
    Object.assign(this.area,areaOpt);
    Area.count=0;
    if(this.areaGroup)
    {
      this.areaGroup.remove(...this.areaGroup.children);
    }
    this.areaGroup = new THREE.Group();
    this.geoData.features.forEach((item)=>{
      //地图属性 & 用户属性合并
      let itemUserData = this.area.data.find(val=> val.name===item.properties.name );
      Object.assign(item.properties,itemUserData);
      this.createArea(item);
    })
    this.mapObject.add(this.areaGroup);
  }

  inintDataRange(dataRangeOpt){
    Object.assign(this.dataRange,dataRangeOpt);
    //继承map立体高度
    let dataRangeOptClone = Object.assign({extrudeHeight:this.extrude.amount/2},this.dataRange);
    delete dataRangeOptClone.data;
    if(this.dataRangeGroup){
      this.dataRangeGroup.remove(...this.dataRangeGroup.children);
    }
    DataRange.count=0;

    this.dataRangeGroup  = new THREE.Group();

    this.dataRange.data.forEach((userData)=>{
      let opt=Object.assign({},dataRangeOptClone,userData);
      //数据范围创建
      let range = new DataRange(opt);
      //区域与范围关联
      range.rangeAreas=[];
      this.dataRangeGroup.add(range);

      //根据范围调整区域颜色显示
      let min = typeof userData.min==='undefined'?-999999999999:userData.min;
      let max = typeof userData.max==='undefined'?999999999999:userData.max;
      let tempArea=null;
      //区域与范围关联
      this.area.data.forEach((area)=>{
        if(typeof area.value !== 'undefined'){
          if(min<area.value && area.value < max)
          {
            tempArea=this.getArea(area.name);
            if(tempArea)
            {
              range.rangeAreas.push(tempArea);
              tempArea.setColor(userData.color)
            }
          }
        }

      })
    })

    //txt 设置
    if(this.dataRange.data.length>0)
    {
      if(this.dataRange.text[0]){
        let txt=Font3D.create(this.dataRange.text[0],{color:this.dataRange.textColor})
        txt.position.add({x:0,y:1,z:0})
        this.dataRangeGroup.add(txt);
      }
      if(this.dataRange.text[1]){
        let txt=Font3D.create(this.dataRange.text[1],{color:this.dataRange.textColor})
        txt.position.add({x:0,y:-(this.dataRange.height+DataRange.count * (this.dataRange.height + this.dataRange.spacing)),z:0})
        this.dataRangeGroup.add(txt);
      }
    }

    //调整整体位置
    this.dataRangeGroup.position.add(this.dataRange.position);
    this.scene.add(this.dataRangeGroup);
  }
  /**
   * 标注初始化方法
   * @param markOpt - 标注配置
   */
  initMark(markOpt){
    Object.assign(this.mark,markOpt);
    //继承map立体高度
    let markClone = Object.assign({extrudeHeight:this.extrude.amount},this.mark);
    delete markClone.data;
    Mark.count=0;
    if(this.markGroup)
    {
      this.markGroup.remove(...this.markGroup.children);
    }
    this.markGroup  = new THREE.Group();
    this.mark.data.forEach((userData)=>{
      let opt=Object.assign({},markClone,userData);
      let mark = new Mark(opt);
      this.markGroup.add(mark);
    })
    this.mapObject.add(this.markGroup);
  }

  /**
   * 线条初始化方法
   * @param lineOpt - 线条配置
   */
  initLine(lineOpt){
    Object.assign(this.line,lineOpt);
    let lineClone = Object.assign({extrudeHeight:this.extrude.amount},this.line);
    delete lineClone.data;
    Line.count=0;
    //重新生成所有线条
    if(this.lineGroup)
    {
      this.lineGroup.remove(...this.lineGroup.children);
    }
    this.lineGroup  = new THREE.Group();
    this.line.data.forEach((userData)=>{
      let opt=Object.assign({},lineClone,userData);
      let line = new Line(opt);
      this.lineGroup.add(line);
    })
    this.mapObject.add(this.lineGroup);

  }

  /**
   * 相机位置-现有位置追加
   * @param {v3} ps - 如：{x:0,y:0,y:2}
   * @param {number} [time] - 动画时间
   * @param {int} [delay=0] - 延时
   */
  addCameraPosition(v3,time,delay,callback){
    let v=new THREE.Vector3(v3.x,v3.y,v3.z);
    if(typeof time ==='number'){
      let to = this.camera.position.clone().add(v);
      if(!callback)callback=()=>{}
      new TWEEN.Tween(this.camera.position).to(to,time).delay(delay||0).start().onComplete(callback);
    }
    else
      this.camera.position.add(v3.x,v3.y,v3.z);
  }
  /**
   * 相机位置-新位置设置
   * @param {v3} ps - 如：{x:0,y:0,y:2}
   * @param {number} [time] - 动画时间
   * @param {int} [delay=0] - 延时
   */
  setCameraPosition(v3,time,delay,easing,callback){
    if(time && typeof time==='number')
      $.transition(this.camera.position,v3,time,delay,easing,callback);
    else
      this.camera.position.set(v3.x,v3.y,v3.z);
  }

  /**
   * 销毁地图对象
   */
  dispose(){
    this.el.innerHTML='';
    this.__event.dispose();
  }
  /**
   * 禁用
   * @param {boolean} disable - 是否禁用
   */
  disable(disable){
    disable=typeof disable==='undefined'?true:disable;
    if(disable){
      this.el.style.pointerEvents='none';
      this.__event.enable=!disable;
    }
    else
    {
      this.el.style.pointerEvents='';
      this.__event.enable=!disable;
    }
  }

  /**
   * 初始化地图事件
   * @private
   */
  initEvent(){
    this.__event=new THREE.Event(this);
  }

  /**
   * 初始化控制器,返回{@link https://threejs.org/docs/#examples/controls/OrbitControls|THREE.OrbitControls}
   * @returns {THREE.OrbitControls}
   */
  initControls(){
    if(!this.hasControls)return
    this.controls = new THREE.OrbitControls(this.camera,this.renderer.domElement);
    this.controls.userPan=false;
    this.controls.autoRotate=this.autoRotate;
    this.controls.userPanSpeed=1;
    return this.controls;
  }

  /**
   * 初始化性能监控器 - debugger:true 自动开启，返回{@link https://github.com/mrdoob/stats.js|stats}
   * @returns {Stats}
   */
  initStats(){
    this.stats = new Stats();
    this.stats.setMode(0);//0:fps |1:ms
    this.stats.domElement.style.position='absolute';
    this.stats.domElement.style.top='70px';
    this.stats.domElement.style.right='0px';
    this.el.appendChild(this.stats.domElement);
    return this.stats;
  }

  /**
   * 初始化调试模式
   * @see Map3d#initStats
   */
  initDebug(){
    if(!this.debugger) return
    if(this.name){
      window[this.name]=this;
    }
    this.initStats();
    let helper = new THREE.DirectionalLightHelper( this.dirLight, 5 );
    this.scene.add( helper );
    let spotLightHelper = new THREE.SpotLightHelper( this.spotLight );
    this.scene.add( spotLightHelper );
    let size = 300;
    let divisions = 40;
    let gridHelper = new THREE.GridHelper( size, divisions );
    this.scene.add( gridHelper );
    let axisHelper = new THREE.AxisHelper( 50 );
    this.scene.add( axisHelper );

    this.infoPlane = document.createElement('div');
    this.infoPlane.contentEditable=true;
    this.infoPlane.style.position='absolute';
    this.infoPlane.style.bottom='70px';
    this.infoPlane.style.right='10px';
    this.infoPlane.style.padding ='5px 10px';
    this.infoPlane.style.background ='rbga(0,0,0,.5)';
    this.infoPlane.style.border ='1px solid #aaa';
    this.infoPlane.style.borderRadius='5px';
    this.infoPlane.style.color='#eee';
    this.el.appendChild(this.infoPlane);
  }
  printCameraPosition(){
    let v3=this.camera.position;
    this.infoPlane.textContent='相机位置 {x:'+v3.x.toFixed(4)+",y:"+v3.y.toFixed(4)+",z:"+v3.z.toFixed(4)+'}';
  }

  /**
   * 删除区域
   * @param {string|Area} area - 要删除的区域名称或者区域对象
   */
  reomveArea(area){
    if(typeof area === 'string')
      area=this.getArea(area);
    this.areaGroup.remove(area);
  }

  /**
   * 删除标注
   * @param {string|Mark} mark - 要删除的标注名称或者标注对象
   */
  removeMark(mark){
    if(typeof mark === 'string')
      mark=this.getMark(mark);
    this.markGroup.remove(mark);
  }
  /**
   * 得到地图区域
   * @param {string} areaName - 地图区域名称
   * @returns {Area}
   */
  getArea(areaName){
    return this.areaGroup.getObjectByName(areaName);
  }
  /**
   * 得到地图标注
   * @param {string} markName - 地图标注名称
   * @returns {Mark}
   */
  getMark(markName){
    return this.markGroup.getObjectByName(areaName);
  }

  /**
   * 通过name得到地图相关对象集合
   * @param {string} name - 对象名称
   * @returns {Array}
   */
  getObjectsByName(name){
    let objects=[];
    this.scene.traverse((obj)=>{
      if(obj.name===name){
        objects.push(obj);
      }
    })
    return objects;
  }

  /**
   * 地图呈现
   * @protected
   */
  renderScene(){
    this.renderer.clear();
    requestAnimationFrame(this.renderScene.bind(this));

    // this.pos=this.pos||0;
    // let light = this.scene.getObjectByName('pointLight');
    // let p = this.scene.getObjectByName('point');
    // if(this.pos < 1){
    //   let v3=this.curve.getPointAt(this.pos);
    //   light.position.set(v3.x,v3.y,v3.z);
    //   p.position.set(v3.x,v3.y,v3.z);
    //     this.pos += 0.001
    // }else{
    //   this.pos = 0;
    // }
    this.areaGroup.children.map((area)=>{
      if(area)
        area.update();
    })


    this.lineGroup.children.map((line)=>{
      if(line.halo)
        line.halo.update();
    })

    this.markGroup.children.map((mark)=>{
      mark.update();
    })

    TWEEN.update();

    if(this.hasControls)
      this.controls.update();

    if(this.debugger){
      this.stats.update();
      this.printCameraPosition();
    }

    this.renderer.render(this.scene, this.camera);

  }

  /**
   * 地图大小改变时事件
   * @private
   */
  _onResize(){
    this.dispatchEvent({ type: 'resize', el:null});
  }

  /**
   *
   * 鼠标移动时触发
   * @param event
   * @param intersects
   * @private
   */
  _onMouseMove(event,intersects){
    if ( intersects.length > 0 ) {
      //之前选中对象ID
      let preSelectedObjID=this.selectedObj?this.selectedObj.id:'';
      this.selectedObj=null;

      for(let i=0;i<intersects.length;i++){
        if(intersects[i].object && intersects[i].object.type==='Mesh' && intersects[i].object.parent.type && intersects[i].object.parent.type==='Area')
        {
          this.selectedObj=intersects[ i ].object.parent;
          break;
        }
        else if(intersects[i].object && intersects[i].object.type==='Mark')
        {
          this.selectedObj=intersects[ i ].object;
          break;
        }
        else if(intersects[i].object && intersects[i].object.parent == this.lineGroup && intersects[i].object.type==='Line')
        {
          this.selectedObj=intersects[ i ].object;
          break;
        }
        else if(intersects[i].object && intersects[i].object.parent && intersects[i].object.parent.type==='DataRange')
        {
          this.selectedObj=intersects[ i ].object.parent;
          break;
        }
      }
      /* 选中区域元素 */
      //已选中对象
      if(this.selectedObj)
      {
        //如果不是同一个对象
        if(preSelectedObjID!=this.selectedObj.id)
        {
          //老对象触发mouseout
          if(preSelectedObjID){
            let preSelectedObj=this.scene.getObjectById(preSelectedObjID);
            //移出区域还原
            if(preSelectedObj)
              preSelectedObj.onmouseout(this, event);
          }
          //新对象触发mouseover
          this.selectedObj.onmouseover(this, event);
        }
      }
      else{
        //未选中对象,老对象触发mouseout
        if(preSelectedObjID){
          let preSelectedObj=this.scene.getObjectById(preSelectedObjID);
          //移出区域还原
          if(preSelectedObj)
            preSelectedObj.onmouseout(this, event);
        }
      }

    } else {
      /* 没有选中任何对象，还原已选中元素 */
      if(this.selectedObj){
        //移出区域还原
        this.selectedObj.onmouseout(this, event);
      }
      this.selectedObj=null
    }
  }

  /**
   * 鼠标单击触发
   * @param event
   * @param intersects
   * @private
   */
  _onMouseDown(event,intersects){

    if ( intersects.length > 0 ) {
      let selectedObj=null;
      for(let i=0;i<intersects.length;i++){
        if(intersects[i].object && intersects[i].object.type=='Mesh' && intersects[i].object.parent.type && intersects[i].object.parent.type=='Area')
        {
          selectedObj=intersects[ i ].object.parent;
          break;
        }
        else if(intersects[i].object && intersects[i].object.type==='Mark')
        {
          selectedObj=intersects[ i ].object;
          break;
        }
        else if(intersects[i].object && intersects[i].object.parent && intersects[i].object.parent.type==='DataRange')
        {
          selectedObj=intersects[ i ].object.parent;
          break;
        }
      }
      if(selectedObj)
      {
        this.debugger && console.log(selectedObj)
        selectedObj.onmousedown(this,event)
      }
    }
  }
  //创建地图区域块
  //结构 parentObj:[area1,area2...]
  /**
   * 创建区域
   * @param {Object} item
   * @param {string} [item.name=''] - 区域名称
   * @param {color} [item.color=0x3366ff] - 区域颜色
   * @param {color} [item.hoverColor=0xff9933] - 区域鼠标选中颜色
   * @param {number} [item.opacity=1] - 区域透明度
   * @param {boolean} [item.hasPhong=true] - 是否反光材质
   * @param {number} [item.shininess=50] - 反光材质光滑度
   * @param {number} [item.hoverAnimaTime=100] - 鼠标移入动画过渡时间
   * @param {number} [item.loadEffect=false] - 区域加载效果
   * @param {boolean} [item.hasHoverHeight=true] - 鼠标移入区域升高
   */
  createArea(item){
    // item.properties 一般有{id,name,cp,childNum,color,value,extrude}
    // Area继承Map3D属性
    let pros=Object.assign({
      color:this.area.color,           //地图颜色
      hoverColor:this.area.hoverColor, //鼠标移入颜色
      lineColor:this.area.lineColor,   //线颜色
      opacity:this.area.opacity,        //地图透明度
      hasPhong:this.area.hasPhong,      //是否反光材质
      shininess:this.area.shininess,    //反光材质光滑度
      hoverAnimaTime:this.area.hoverAnimaTime, //鼠标移入动画过渡时间
      extrude:this.extrude,             //立体厚度参数
      loadEffect:this.area.loadEffect,  //加载效果
      hasHoverHeight:this.area.hasHoverHeight    //有标注，选中区域不升高
    },item.properties)

    let coords=[];
    if(!item.geometry)return;
    if(item.geometry.type=='Polygon'){
      coords.push(item.geometry.coordinates[0]);
    }
    else if (item.geometry.type=='MultiPolygon') {
      for(var i=0;i<item.geometry.coordinates.length;i++){
        coords.push(item.geometry.coordinates[i][0]);
      }
    }
    pros.coords=coords;
    let area=new Area(pros);
    this.areaGroup.add(area);
  }


  


}

/**
 * 重写three自定义事件
 */
Object.assign(THREE.EventDispatcher.prototype,{dispatchEvent: function ( event) {
  if ( this._listeners === undefined ) return;
  var listeners = this._listeners;
  var listenerArray = listeners[ event.type ];
  if ( listenerArray !== undefined ) {
    //Object.assign(event, event.orgEvent);
    let target=event.target;
    //通过原始事件构造自定义事件
    for(let a in event.orgEvent)
      event[a] = event.orgEvent[a];
    //覆盖原始事件目标对象
    event.target = target||this;
    var array = listenerArray.slice( 0 );
    for ( var i = 0, l = array.length; i < l; i ++ ) {
      array[ i ].call( this, event );
    }
  }
}})
Object.assign( Map3D.prototype, THREE.EventDispatcher.prototype );

export {
  Map3D as default,
  Area,
  Mark,
  Line
}
