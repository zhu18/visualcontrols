/**
 * Created by jusfoun-fe.github.io on 2017/11/19.
 * 3D地图
 */
import Detector from './Detector.js'
import * as THREE from './three.js'
import Font3D from './Font3D.js'
import TWEEN from './tween.min.js'
import './OrbitControls.js'
import './Event.js'
import Stats from './stats.js'
import * as Text2D from './Text2D.js'
import './jquery-1.9.0.js'

//地图立体参数设置
var extrudeOption = {
    amount : 2,
    bevelThickness : 1,
    bevelSize : .2,
    bevelEnabled : false,
    bevelSegments : 5,
    curveSegments :1,
    steps : 1,
};


export default class Map3D{
    constructor(o){
        if(!Detector.webgl) {
            console.log('不支持webgl,停止渲染.');
            return;
        }
        let opt={
            /*外部参数*/
            name:'',            //调试使用，window['name']为该实例对象，注意设置debugger:true启用
            el:document.body,   //容器
            geoData:null,       //地图geojson数据
            hasStats:true,      //是否显示性能面板
            hasControls:true,   //用户是否能控制视角
            autoRotate:false,   //是否自动旋转视角
            ambientColor:0x333333,//环境光颜色
            directionalColor:0xffffff,//平行光颜色
            hasLoadEffect:false,//是否有加载效果
            // areaData:[],
            // markData:[],
            debugger:false,     //调试模式
            cameraPosition:{x:0,y:0,z:40},//相机位置
            visualMap:null,     //直观图图例
            extrude:extrudeOption,//立体厚度参数

            area:{
              data:[],            //地图用户数据[{name:'北京',value:,color:0xff3333}...]
              /*area可继承参数*/
              color:0x3366ff,     //地图颜色
              hoverColor:0xff9933,//鼠标移入颜色
              lineColor:0xffffff, //线颜色
              opacity:1,          //地图透明度
              hasPhong:true,      //是否反光材质
              shininess:50,      //反光材质光滑度
              hoverAnimaTime:100, //鼠标移入动画过渡时间
              loadEffect:false,      //区域加载效果
              hasHoverHeight:true,  //鼠标移入区域升高
            },

            mark:{
              data:[],          //标注点数据[{name:'XXX',coord:[11,22],value:13}...]
              /* mark可继承参数 */
              color:0xffffff,     //标注点颜色
              hoverColor:0xff9933,//鼠标移入颜色
              hoverAnimaTime:100, //鼠标移入动画过渡时间
              min:0.01,
              max:5,
            },
            line:{
              data:[],        //线数据[{fromName:'',toName:'',coords:[toCoord,fromCoord]}...]
              color:0x55eeff,
              hoverColor:0xff3333,
              spaceHeight:5,                  // 曲线空间高度
              hasHalo:true,                   // 是否开启光晕效果
              hasHaloAnimate:true,            // 是否开启光晕动画效果
              haloDensity:2,                  // 光点密度 值越大 越浓密，越消耗性能
              haloRunRate:0.01,               // 光点运动频率
              haloColor:0xffffff,             // 默认继承color颜色
              haloSize:10,                    // 光晕大小
              haloMap:"static/particleA.png", // 光晕图片
            },



            /* 事件 addEventListener 注册*/
            // resize:null,
            // mouseover:null,
            // mouseout:null,
            // mousedown:null,

            /*内部对象*/
            mapObject:null,//地图对象-内部调用
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
        $.extend(true,this,opt,o);

       //Object.assign(this,opt,o);


        if(!this.geoData)
        {
            console.warn('Map3D no geoData.')
            return;
        }
        this._w=this.el.offsetWidth;
        this._h=this.el.offsetHeight;
        this.init()
        this.initEvent()
    }
    init(){
      this.el.innerHTML='';
      this.scene = new THREE.Scene({antialias:true});
      this.camera = new THREE.PerspectiveCamera(70, this._w/this._h, 0.1, 10000);
      this.renderer = new THREE.WebGLRenderer({alpha:true });
      this.renderer.setPixelRatio( window.devicePixelRatio );
      this.camera.position.set(this.cameraPosition.x, this.cameraPosition.y, this.cameraPosition.z);

      this.camera.lookAt(this.scene.position);
      this.renderer.setSize(this._w,this._h);

      this.scene.add(new THREE.AmbientLight(colorToHex(this.ambientColor)));
      this.dirLight = new THREE.DirectionalLight(colorToHex(this.directionalColor));
      this.dirLight.position.set(0,50,50);
      this.scene.add(this.dirLight);

      this.spotLight = new THREE.SpotLight(colorToHex(this.color));
      this.spotLight.position.set(0,150,150);
      this.spotLight.intensity = 0.7;
      this.spotLight.target = this.scene;
      this.scene.add(this.spotLight);

      //创建地图区域添加到 mapObject
      this.mapObject = new THREE.Group();

      this.initControls()
      this.initDebug();
      //初始化区域
      this.initArea();
      //初始化标注点
      this.initMark();
      //初始化线条
      this.initLine();

      //根据数据中心位置偏移
      if(this.geoData.cp){
        this.mapObject.position.set(-this.geoData.cp[0],-this.geoData.cp[1],0);
      }
      this.scene.add(this.mapObject);
      this.scene.add(this.camera);
      this.el.appendChild(this.renderer.domElement);
      this.renderScene();
    }
    initArea(areaOpt){
      areaOpt=areaOpt||this.area;
      if(this.areaGroup)
      {
        this.areaGroup.remove(...this.areaGroup.children);
      }
      this.areaGroup = new THREE.Group();
      this.geoData.features.forEach((item)=>{
        //地图属性 & 用户属性合并
        let itemUserData = areaOpt.data.find(val=> val.name===item.properties.name );
        Object.assign(item.properties,itemUserData);
        this.createArea(item);
      })
      this.mapObject.add(this.areaGroup);
    }
    initMark(markOpt){
      markOpt=markOpt||this.mark;
      //继承map立体高度
      let markClone = Object.assign({extrudeHeight:this.extrude.amount},markOpt);
      delete markClone.data;

      if(this.markGroup)
      {
        this.markGroup.remove(...this.markGroup.children);
      }
      this.markGroup  = new THREE.Group();
      markOpt.data.forEach((userData)=>{
        let opt=Object.assign({},markClone,userData);
        let mark = new Mark(opt);
        this.markGroup.add(mark);
      })
      this.mapObject.add(this.markGroup);
    }
    initLine(lineOpt){
      lineOpt=lineOpt||this.line;
      let lineClone = Object.assign({extrudeHeight:this.extrude.amount},this.line,lineOpt);
      delete lineClone.data;
      if(this.lineGroup)
      {
        this.lineGroup.remove(...this.lineGroup.children);
      }
      this.lineGroup  = new THREE.Group();
      lineOpt.data.forEach((userData)=>{
        let opt=Object.assign({},lineClone,userData);
        let line = new Line(opt);
        this.lineGroup.add(line);
      })
      this.mapObject.add(this.lineGroup);

    }
    //相机位置-现有位置追加
    addCameraPosition(ps,time,delay){
      let v=new THREE.Vector3(ps.x,ps.y,ps.z);
      if(typeof time ==='number'){
        let to = this.camera.position.clone().add(v);
        new TWEEN.Tween(this.camera.position).to(to,time).delay(delay||0).start();
      }
      else
        this.camera.position.add(v);
    }
    //相机位置-新位置设置
    setCameraPosition(ps,time,delay){
        let v=new THREE.Vector3(ps.x,ps.y,ps.z);
        if(typeof time ==='number'){
            new TWEEN.Tween(this.camera.position).to(v,time).delay(delay||0).start();
        }
        else
            this.camera.position.set(v);
    }
    dispose(){
        this.el.innerHTML='';
        this.__event.dispose();
    }
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
    initEvent(){
        this.__event=new THREE.Event(this);
    }
    initControls(){
      if(!this.hasControls)return
      this.controls = new THREE.OrbitControls(this.camera,this.renderer.domElement);
      this.controls.userPan=false;
      this.controls.autoRotate=this.autoRotate;
      this.controls.userPanSpeed=1;
      return this.controls;
    }
    initStats(){
        this.stats = new Stats();
        this.stats.setMode(0);//0:fps |1:ms
        this.stats.domElement.style.position='absolute';
        this.stats.domElement.style.top='70px';
        this.stats.domElement.style.right='0px';
        this.el.appendChild(this.stats.domElement);
        return this.stats;
    }
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
    setArea(area,userData){
        if(typeof area === 'string')
            area=this.findArea(area);
        if(userData.name)
        {
            delete userData.name;
            console.warn('setAreaData():No name parameters are required')
        }
        //重新构造区域
        let item=this.geoData.features.find(item=>item.properties.name===area.name);
        if(item){
            this.reomveArea(area);
            Object.assign(item.properties,userData);
            this.createArea(item,this.mapObject);
        }
    }
    reomveArea(area){
        if(typeof area === 'string')
            area=this.findArea(area);
        this.mapObject.remove(area);
    }
    findArea(areaName){
        return this.mapObject.getObjectByName(areaName);
    }
    getObjectsByName(name){
        let objects=[];
        this.scene.traverse((obj)=>{
          if(obj.name===name){
            objects.push(obj);
          }
        })
      return objects;
    }
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
    _onResize(){
      this.dispatchEvent({ type: 'resize', el:null});
    }

    _onMouseMove(event,intersects){
        if ( intersects.length > 0 ) {
            /* 还原已选中元素 */
            if(this.selectedArea){
              //移出区域还原
              this.selectedArea.onmouseout(this, event);
            }
            if(this.selectedMark){
              //移出区域还原
              this.selectedMark.onmouseout(this, event);
            }
            /* 选中当前元素 */
            let hasArea=false;
            let hasMark=false;
            for(let i=0;i<intersects.length;i++){
                if(intersects[i].object && intersects[i].object.type==='Mesh' && intersects[i].object.parent.type && intersects[i].object.parent.type==='Area')
                {
                    this.selectedArea=intersects[ i ].object.parent;
                    hasArea=true;
                    break;
                }
                else if(intersects[i].object && intersects[i].object.type==='Mark')
                {
                    this.selectedMark=intersects[ i ].object;
                    hasMark=true;
                    break;
                }
            }
            /* 选中区域元素 */
            if(hasArea)
            {
              this.selectedArea.onmouseover(this, event);
            }
            else{
              if(this.selectedArea){
                //移出区域还原
                this.selectedArea.onmouseout(this, event);
              }
            }
          /* 选中标注元素 */
            if(hasMark)
            {
              this.selectedMark.onmouseover(this, event);
            }
            else{
              if(this.selectedMark){
                //移出区域还原
                this.selectedMark.onmouseout(this, event);
              }
            }
        } else {
          /* 没有选中任何对象，还原选中元素 */
            if(this.selectedArea){
              //移出区域还原
              this.selectedArea.onmouseout(this, event);
            }
            if(this.selectedMark){
              //移出区域还原
              this.selectedMark.onmouseout(this, event);
            }
        }
    }
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
        /* 内部使用 */
        hasHoverHeight:this.area.hasHoverHeight    //有标注，选中区域不升高
      },item.properties)



      let coords=[];
      if(item.geometry.type=='Polygon'){
        coords.push(item.geometry.coordinates[0]);
      }
      else if (item.geometry.type=='MultiPolygon') {
          for(var i=0;i<item.geometry.coordinates.length;i++){
            coords.push(item.geometry.coordinates[i][0]);
          }
      }
      let area=new Area(coords,pros);
      this.areaGroup.add(area);
    }


    /* Map3D静态方法 */
    //过渡动画
    static transition(from,to,time,delay,callback){
        if(typeof time !=='number'){
          time=1000;
        }
        if(!callback)callback=()=>{};
      new TWEEN.Tween(from).to(to,time).delay(delay||0).start().onComplete(callback);
   }


}

//重写three自定义事件
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


//地图区域
class Area extends THREE.Object3D{
  static count=0;
  //构造函数
  constructor(coords,pros){
    //调用实现父类的构造函数
    super(pros);
    this.type="Area";
    this.name=pros.name;
    Object.assign(this.userData,pros);

    this._mesh = this.getMesh(coords,pros);
    this._line = this.getLine(coords,pros);

    this.add(this._mesh);
    this.add(this._line);


    // 文字添加 待完善
    // let tg=new THREE.Group();
    // tg.name=this.name+'_text';
    // tg.position.z=0.01;
    // this._text = Font3D.create(this.name,{size:30,color:'#333333'});
    // this._text.position.z=2.01;
    // tg.add(this._text)
    // this.add(tg);


    if(pros.loadEffect){
      this.setPosition({x:0,y:0,z:-100});
      this.setPosition({x:0,y:0,z:0}, 100, Area.count*10);
    }
    Area.count++;
  }
  /* 内部方法 */
  //创建立体块
  getMesh(coords,pros){
    if(!coords)return;
    try{
      let geo=new THREE.Geometry();
      coords.forEach((coord)=>{
        let pts=this.getGeoPoints(coord);
        let g=this.getExtrudeGeometry(pts);
        geo.merge(g, g.matrix);
      })

      return this.getGeoMesh(geo,pros);
    }catch(e)
    {
      console.warn("Area.getMesh:"+e.message);
    }
  }
  //创建块的边缘线
  getLine(coords,pros){
    if(!coords)return;

    //mate
    let material = new THREE.LineBasicMaterial({
      opacity: 1.0,
      linewidth: 2,
      polygonOffset:true,polygonOffsetFactor:1,
      color:this.userData.lineColor
    });

    //geo
    let lines = new THREE.Group();
    coords.forEach((coord)=>{
      let pts=this.getGeoPoints(coord);
      let line = new THREE.Geometry();
      for(let i=0,l=pts.length;i<l;i++){
        line.vertices.push(new THREE.Vector3(pts[i].x,pts[i].y,this.userData.extrude.amount + this.userData.extrude.amount/100));
      }

      let lineMesh=new THREE.Line(line, material);

      lines.add(lineMesh);
    });

    return lines;
  }
  //得到顶点数据
  getGeoPoints(coord){
    try{
      let pts=[];
      for(let i=0,l=coord.length;i<l;i++){
        pts.push(new THREE.Vector2(coord[i][0],coord[i][1]));
      }
      return pts;
    }catch(e)
    {
      console.log('getGeoPoints:parse coord error:'+JSON.stringify(coord));
    }
  }
  //拉伸块高度
  getExtrudeGeometry(pts){
    let shape = new THREE.Shape(pts);
    let extrude =Object.assign({},this.userData.extrude);
    let geo = new THREE.ExtrudeGeometry(shape, extrude);
    return geo;
  }
  //创建平面块
  getGeoMesh(geo,pros){
    let mateOption={};
    mateOption.color = pros.color!=null ? colorToHex(pros.color) : Math.random() * 0xffffff;
    mateOption.shininess= pros.shininess || 100;
    mateOption.transparent= true;
    mateOption.opacity = (typeof pros.opacity === 'undefined') ? this.userData.opacity : pros.opacity;

    let geoMesh=null;
    if(this.userData.hasPhong)
      geoMesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial(mateOption));
    else
      geoMesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial(mateOption));
    //var geoMesh = THREE.SceneUtils.createMultiMaterialObject(geo,[new THREE.MeshPhongMaterial(mateOption),new THREE.MeshBasicMaterial({wireframe:true,color:0xffffff,transparent:true,opacity:0.35})])
    return geoMesh;
  }
  /* 属性 */
  get mesh(){
    return this._mesh;
  }
  get line(){
    return this._line;
  }
  /* 实例方法 */
  setColor(color,time,delay,callback){
    this.userData.color=colorToHex(color);
    if(time && typeof time==='number'){
      color=new THREE.Color(colorToHex(color));
      Map3D.transition(this.mesh.material.color,color,time,delay,callback);
    }
    else {
      this.mesh.material.color.set(colorToHex(color));
    }
  }
  setPosition(v3,time,delay,callback){
    if(time && typeof time==='number')
      Map3D.transition(this.position,v3,time,delay,callback);
    else
      this.position.set(v3.x,v3.y,v3.z);
  }
  setRotation(v3,time,delay,callback){
    v3.x=v3.x * (Math.PI / 180)
    v3.y=v3.y * (Math.PI / 180)
    v3.z=v3.z * (Math.PI / 180)
    Map3D.transition(this.rotation,v3,time,delay,callback);
  }
  setScale(v3,time,delay,callback){
    if(time && typeof time==='number')
      Map3D.transition(this.scale,v3,time,delay,callback);
    else
      this.scale.set(v3.x,v3.y,v3.z);
  }

  /* 事件 */
  onmouseout(dispatcher,event){
    if(this.userData.hasHoverHeight)
      new TWEEN.Tween( this.position ).to({z: 0,}, this.userData.hoverAnimaTime).start()
    new TWEEN.Tween(this.mesh.material.color).to(new THREE.Color(colorToHex(this.userData.color)), this.userData.hoverAnimaTime).start();
    dispatcher.dispatchEvent({ type: 'mouseout', target:this, orgEvent:event});

  }
  onmouseover(dispatcher,event){
    //区域移入高度
    //this.selectedArea.position.z=1;
    if(this.userData.hasHoverHeight)
      new TWEEN.Tween( this.position ).to({z: this.userData.extrude.amount/2,}, this.userData.hoverAnimaTime).start();
    //区域移入颜色
    new TWEEN.Tween(this.mesh.material.color).to(new THREE.Color(colorToHex(this.userData.hoverColor)), this.userData.hoverAnimaTime).start();
    dispatcher.dispatchEvent({ type: 'mouseover', target:this, orgEvent:event});
  }
  onmousedown(dispatcher,event) {
    dispatcher.dispatchEvent({ type: 'mousedown', target:this, orgEvent:event});
  }
}
//地图标注
class Mark extends THREE.Sprite{
  static count=0;
  static _texture=null;
  //标注样式
  static get texture(){
    if(!Mark._texture)
    {
      let canvas = document.createElement("canvas");
      canvas.width=128;
      canvas.height=128;
      let context = canvas.getContext('2d');
      Mark.draw(context);
      let texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      Mark._texture=texture;
    }
    return Mark._texture;
  }
  //可以重写
  static draw(context,v){
    v=v||1;
    context.clearRect(0, 0, 128, 128);
    context.fillStyle = '#ffffff';
    context.arc(64, 64, 20, 0, Math.PI * 2, false);
    context.fill();

    context.fillStyle = 'rgba(255,255,255,.5)';
    context.arc(64, 64, 60*v, 0, Math.PI * 2, false);
    context.fill();

    // context.fillStyle = 'rgba(0,0,0,.5)';
    // context.rect(0, 0, 128, 128, Math.PI * 2, false);
    // context.fill();
  }
  constructor(pros){
    super();
    this.material = new THREE.SpriteMaterial( { map: Mark.texture, color: pros.color } );
    this.type="Mark";
    this.name=pros.name;
    Object.assign(this.userData,pros);

    let size=pros.size||this.userData.min;
    size=size<this.userData.min?this.userData.min:size;
    size=size>this.userData.max?this.userData.max:size;
    this.userData.size=size;
    this.scale.set(size, size, 1);
    //console.log(size);
    this.position.x=pros.coord[0];
    this.position.y=pros.coord[1];
    this.position.z=2+size*35/100;

      this.update = function(){
      // if(!line.userData.hasHalo || !line.userData.hasHaloAnimate)
      //   return;

        let time = Date.now() * 0.005 ;
        let size = Math.abs(Math.sin(0.1+time))
       // new TWEEN.Tween(this.scale).to({x:size,y:size},100).delay(Mark.count*10).start()

        // let context = this.material.map.image.getContext('2d');
        // Mark.draw(context,size);
        // this.material.map.needsUpdate = true;

      // let geometry = this.geometry;
      // let attributes = geometry.attributes;
      // for ( let i = 0; i < attributes.size.array.length; i++ ) {
      //   attributes.size.array[ i ] = size + size * Math.sin( 0.1 * i + time );
      // }
      // attributes.size.needsUpdate = true;
    }

    Mark.count++;
  }

  /* 事件 */
  onmouseout(dispatcher,event){
    let size=this.userData.size*1
    new TWEEN.Tween(this.scale).to({x:size,y:size}, this.userData.hoverAnimaTime).start();
    new TWEEN.Tween(this.material.color).to(new THREE.Color(colorToHex(this.userData.color)), this.userData.hoverAnimaTime).start();
    dispatcher.dispatchEvent({ type: 'mouseout', target:this, orgEvent:event});

  }
  onmouseover(dispatcher,event){
    let size=this.userData.size*1.5
    new TWEEN.Tween(this.scale).to({x:size,y:size}, this.userData.hoverAnimaTime).start();
    //区域移入颜色
    new TWEEN.Tween(this.material.color).to(new THREE.Color(colorToHex(this.userData.hoverColor)), this.userData.hoverAnimaTime).start();
    dispatcher.dispatchEvent({ type: 'mouseover', target:this, orgEvent:event});
  }
  onmousedown(dispatcher,event) {
    dispatcher.dispatchEvent({ type: 'mousedown', target:this, orgEvent:event});
  }
}

class Line extends THREE.Line{
  static count=0;
  static _texture=null;
  //标注样式
  static get texture(){
    if(!Mark._texture)
    {
      let canvas = document.createElement("canvas");
      canvas.width=128;
      canvas.height=128;
      let context = canvas.getContext('2d');
      Mark.draw(context);
      let texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      Mark._texture=texture;
    }
    return Mark._texture;
  }
  //可以重写
  static draw(context){
    context.clearRect(0, 0, 128, 128);
    context.fillStyle = '#ffffff';
    context.arc(64, 64, 20, 0, Math.PI * 2, false);
    context.fill();

    context.fillStyle = 'rgba(255,255,255,.5)';
    context.arc(64, 64, 60, 0, Math.PI * 2, false);
    context.fill();

    context.fillStyle = 'rgba(0,0,0,1)';
    context.arc(64, 64, 80, 0, Math.PI * 2, false);
    context.fill();
  }
  constructor(pros){
    let fromCoord=pros.coords[0];
    let toCoord=pros.coords[1];
    let x1 = fromCoord[0];
    let y1 = fromCoord[1];
    let x2 = toCoord[0];
    let y2 = toCoord[1];
    let xdiff = x2 - x1;
    let ydiff = y2 - y1;
    let dif = Math.pow((xdiff * xdiff + ydiff * ydiff), 0.5);//二点间距离
    let v3s=[
      new THREE.Vector3( x1, y1, pros.extrudeHeight ),
      new THREE.Vector3( (x1+x2)/2, (y1+y2)/2, pros.extrudeHeight + pros.spaceHeight),
      new THREE.Vector3( x2, y2, pros.extrudeHeight )
    ]

    //画弧线
    let curve = new THREE.QuadraticBezierCurve3(...v3s);
    var geometry = new THREE.Geometry();
    var amount = (dif+0.1) * pros.haloDensity;
    if(amount<30)amount=30;

    geometry.vertices = curve.getPoints(amount).reverse();
    geometry.vertices.forEach(()=>{
      geometry.colors.push(new THREE.Color(pros.color));
    })

    let material =  new THREE.LineBasicMaterial({
      color:0xffffff,
      opacity: 1.0,
      blending:THREE.AdditiveBlending,
      transparent:true,
      depthWrite: false,
      vertexColors: true,
      linewidth: 1 })

    super(geometry, material)

    Object.assign(this.userData,pros);

    //线条光晕效果
    if(pros.hasHalo) {
      this.initHalo(geometry);
    }
    //当前线条索引
    this.index=Line.count++;
  }
  initHalo(geometry){
    let line = this;
    let amount=geometry.vertices.length;
    let positions = new Float32Array(amount * 3);
    let colors = new Float32Array(amount * 3);
    let sizes = new Float32Array(amount);
    let vertex = new THREE.Vector3();
    let color = new THREE.Color(this.userData.color);
    for (let i = 0; i < amount; i++) {

      vertex.x = geometry.vertices[i].x;
      vertex.y = geometry.vertices[i].y;
      vertex.z = geometry.vertices[i].z;
      vertex.toArray(positions, i * 3);

      // if ( vertex.x < 0 ) {
      //   color.setHSL( 0.5 + 0.1 * ( i / amount ), 0.7, 0.5 );
      // } else {
      //   color.setHSL( 0.0 + 0.1 * ( i / amount ), 0.9, 0.5 );
      // }
      color.toArray(colors, i * 3);
      sizes[i] = line.userData.haloSize;
    }
    //positions = geometry.vertices;

    let psBufferGeometry = new THREE.BufferGeometry();
    psBufferGeometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
    psBufferGeometry.addAttribute('customColor', new THREE.BufferAttribute(colors, 3));
    psBufferGeometry.addAttribute('size', new THREE.BufferAttribute(sizes, 1));

    let uniforms = {
      amplitude: {value: 1.0},
      color: {value: new THREE.Color(this.userData.haloColor)},
      texture: {value: Line.texture},
    };

    let shaderMaterial = new THREE.ShaderMaterial({

      uniforms: uniforms,
      vertexShader: shader.vertexShader,
      fragmentShader: shader.fragmentShader,

      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      // sizeAttenuation: true,
    });

    //线条光晕
    let halo = new THREE.Points(psBufferGeometry, shaderMaterial);
    halo.dynamic = true;
    this.add(halo);
    this.halo = halo;


    halo.update = function(){
      if(!line.userData.hasHalo || !line.userData.hasHaloAnimate)
        return;

      let time = Date.now() * 0.005 + line.index * 3;

      let geometry = this.geometry;
      let attributes = geometry.attributes;
      for ( let i = 0; i < attributes.size.array.length; i++ ) {
        attributes.size.array[ i ] = line.userData.haloSize + line.userData.haloSize * Math.sin( line.userData.haloRunRate * i + time );
      }
      attributes.size.needsUpdate = true;
    }

  }
  update(){
    //if(!this.userData.hasHalo || !this.userData.hasHaloAnimate)
      this.halo.update();
  }

}
let shader={
vertexShader: [
"uniform float amplitude;",
"attribute float size;",
"attribute vec3 customColor;",
"varying vec3 vColor;",
"void main() {",
    "vColor = customColor;",
    "vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );",
    "gl_PointSize = size;",
    "gl_Position = projectionMatrix * mvPosition;",
  "}"
].join("\n"),
  fragmentShader: [
"uniform vec3 color;",
"uniform sampler2D texture;",
"varying vec3 vColor;",
  "void main() {",
    "gl_FragColor = vec4( color * vColor, 1.0 );",
    "gl_FragColor = gl_FragColor * texture2D( texture, gl_PointCoord );",
  "}"
].join("\n")
}



//颜色格式化 '#999999','rgb','hsl',0x999999
function colorToHex(color){
  if(typeof color==="string" )
  {
    if(color.indexOf('#')!==-1)
      color = parseInt(color.replace('#',''),16);
    else
      color = new THREE.Color(color).getHex();
  }
  return color;
}
