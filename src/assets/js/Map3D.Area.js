/**
 * 3D地图.区域
 * Created by zhu18.github.io on 2017/11/19.
 * @author 朱润亚 <zhu18@vip.qq.com>
 * @version beta v1.0.3
 * @module Map3D
 */

import * as THREE from './three.js'
import TWEEN from './tween.min.js'
import * as $ from './util'
import Shaderlib from './three.ShaderLibExp'
import Font3D  from './Font3D.js'



/**
 * 地图区域,继承{@link https://threejs.org/docs/#api/core/Object3D|THREE.Object3D}
 * @class
 * @extends THREE.Object3D
 * @example
 *
 *  let opt = {
 *     color:0x3366ff,     //地图颜色
 *     hoverColor:0xff9933,//鼠标移入颜色
 *     lineColor:0xffffff, //线颜色
 *     opacity:1,          //地图透明度
 *     hasPhong:true,      //是否反光材质
 *     shininess:50,       //反光材质光滑度
 *     hoverAnimaTime:100, //鼠标移入动画过渡时间
 *     loadEffect:false,      //区域加载效果
 *     hasHoverHeight:true,  //鼠标移入区域升高
 *     showText:false,      //是否显示地区名称
 *  }
 *  // 创建一个区域
 *  let area = new Area(opt);
 *  // map 初始化以后可以获取
 *  let area = map.areaGroup.getObjectByName('北京')
 */
class Area extends THREE.Object3D{
    /**
     * 构造函数
     * @param pros
     */
    constructor(pros){
      //调用实现父类的构造函数
      super(pros);
      this.type="Area";
      this.name=pros.name;
      Object.assign(this.userData,pros);
      let coords = pros.coords;
      this._mesh = this.getMesh(coords,pros);
      this._line = this.getLine(coords,pros);
    
      this.add(this._mesh);
      this.add(this._line);
      

      if(pros.showText)
      {
        this._text = this.getText(pros);
        this.add(this._text);
      }
  
  
      if(pros.loadEffect){
        this.setPosition({x:0,y:-40,z:-1000});
        this.setPosition({x:0,y:0,z:0}, 500, Area.count*10, TWEEN.Easing.Quartic.Out);
      }
      Area.count++;
    }
  
    /**
     * 创建区域文字
     * @param {object} pros  - 区域初始化属性
     * @returns {Font3D}
     */
    getText(pros){
      if(!pros.cp)return;
      let text = new Font3D(pros.name,{follow:true})
      text.position.set(pros.cp[0],pros.cp[1],2.1)

      return text
    }
    /**
     * 创建立体块
     * @param {array} coords -  坐标经纬度，如：[112,22]
     * @param {object} pros - 区域初始化属性
     * @returns {*}
     * @protected
     */
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
  
    /**
     * 创建块的边缘线
     * @param {array} coords -  坐标经纬度，如：[112,22]
     * @param {object} pros - 区域初始化属性
     * @returns {THREE.Group}
     */
    getLine(coords,pros){
      if(!coords)return;
  
      //mate
      let material = new THREE.LineBasicMaterial({
        opacity: this.userData.lineOpacity,
        transparent:this.userData.lineOpacity<1,
        linewidth: 1,
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
  
    /**
     * 得到顶点数据
     * @param coord
     * @returns {Array}
     * @protected
     */
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
  
    /**
     * 拉伸块高度
     * @param {array} pts - 顶点数组
     * @returns {THREE.ExtrudeGeometry}
     * @protected
     */
    getExtrudeGeometry(pts){
      let shape = new THREE.Shape(pts);
      let extrude =Object.assign({},this.userData.extrude);
      let geo = new THREE.ExtrudeGeometry(shape, extrude);
      return geo;
    }
  
    /**
     * 拉伸块高度
     * @param geo
     * @param pros
     * @returns {*}
     */
    getGeoMesh(geo,pros){
      let mateOption={};
      mateOption.color = pros.color!=null ? $.colorToHex(pros.color) : Math.random() * 0xffffff;
      mateOption.shininess= pros.shininess || 100;
      mateOption.transparent= true;
      mateOption.opacity = (typeof pros.opacity === 'undefined') ? this.userData.opacity : pros.opacity;
  
      geo.computeFlatVertexNormals()
      let geoMesh=null;

    //   var shader = {
    //     uniforms:
    //     {
    //         glowColor: { type: "c", value: new THREE.Color(mateOption.color) },
    //         iTime: { type: "f", value: 1.0}
    //     },
    //     vertexShader: [
    //         "varying vec2 vUv;",
    //         "void main() {",
    //         "vUv = uv;",
    //         "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
    //         "}"
    //     ].join("\n"),
    //     fragmentShader: [
    //         "uniform vec3 glowColor;",
    //         "uniform float iTime;",
    //         "varying vec2 vUv;",
    //         "float t=iTime;",
    //         "vec3 col;",
    //         "void main() {",
    //         "col = 0.5 + 0.1 * sqrt(sin(iTime * dot(vUv,vUv) /glowColor));",
    //         "gl_FragColor = vec4(1.0,col);",
    //         "}"
    //     ].join("\n")
    // }
    

    // var customMaterial = new THREE.ShaderMaterial({
    //     uniforms: shader.uniforms,
    //     vertexShader: shader.vertexShader,
    //     fragmentShader: shader.fragmentShader,
    //     side: THREE.FrontSide,
    //     blending: THREE.AdditiveBlending,
    //     transparent: true
    // })

    this.update=function(){
         //shader.uniforms.iTime.value += 0.05;
    }
      if(this.userData.hasPhong)
       geoMesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial(mateOption));
      else
        geoMesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial(mateOption));
     
      //var geoMesh = THREE.SceneUtils.createMultiMaterialObject(geo,[new THREE.MeshPhongMaterial(mateOption),new THREE.MeshBasicMaterial({wireframe:true,color:0xffffff,transparent:true,opacity:0.35})])
      return geoMesh;
    }
  
    /**
     * Area的网格对象
     * @returns {HTREE.Mesh}
     */
    get mesh(){
      return this._mesh;
    }
  
    /**
     * Area的边缘线对象
     * @returns {THREE.Group}
     */
    get line(){
      return this._line;
    }
  
    /**
     * 设置区域颜色
     * @param {color} color - 格式 0xff9933,'#ff9933','rgb(255,160,50)','hsl(340,100%,50%)'
     * @param {number} [time] - 动画完成时间,与transition时间类似
     * @param {number} [delay=0] - 动画延迟时间
     * @param {Tween.Easing} [easing=line] -动画类型
     * @param {callback} [callback] - 动画完成后回调
     */
    setColor(color,time,delay,easing,callback){
      this.userData.color=$.colorToHex(color);
      if(time && typeof time==='number'){
        color=new THREE.Color($.colorToHex(color));
        $.transition(this.mesh.material.color,color,time,delay,easing,callback);
      }
      else {
        this.mesh.material.color.set($.colorToHex(color));
      }
    }
  
    /**
     * 设置区域位置
     * @param {v3} v3 - 格式{x:0,y:0,z:0}
     * @param {number} [time] - 动画完成时间,与transition时间类似
     * @param {number} [delay=0] - 动画延迟时间
     * @param {Tween.Easing} [easing=line] -动画类型
     * @param {callback} [callback] - 动画完成后回调
     */
    setPosition(v3,time,delay,easing,callback){
      if(time && typeof time==='number')
        $.transition(this.position,v3,time,delay,easing,callback);
      else
        this.position.set(v3.x,v3.y,v3.z);
    }
    /**
     * 设置区域旋转
     * @param {v3} v3 - 格式{x:0,y:0,z:0}
     * @param {number} [time] - 动画完成时间,与transition时间类似
     * @param {number} [delay=0] - 动画延迟时间
     * @param {Tween.Easing} [easing=line] -动画类型
     * @param {callback} [callback] - 动画完成后回调
     */
    setRotation(v3,time,delay,easing,callback){
      v3.x=v3.x * (Math.PI / 180)
      v3.y=v3.y * (Math.PI / 180)
      v3.z=v3.z * (Math.PI / 180)
      $.transition(this.rotation,v3,time,delay,easing,callback);
    }
    /**
     * 设置区域大小
     * @param {v3} v3 - 格式{x:0,y:0,z:0}
     * @param {number} [time] - 动画完成时间,与transition时间类似
     * @param {number} [delay=0] - 动画延迟时间
     * @param {Tween.Easing} [easing=line] -动画类型
     * @param {callback} [callback] - 动画完成后回调
     */
    setScale(v3,time,delay,easingcallback){
      if(time && typeof time==='number')
        $.transition(this.scale,v3,time,delay,easing,callback);
      else
        this.scale.set(v3.x,v3.y,v3.z);
    }
  
    /**
     * 鼠标移出事件
     * @param dispatcher
     * @param event
     * @example
     *
     * map.addEventListener('mouseout', (event) => {
       *    let obj = event.target;
       *    console.log(obj.type+':out')
       *  });
     */
    onmouseout(dispatcher,event){
      if(this.userData.hasHoverHeight)
        new TWEEN.Tween( this.position ).to({z: 0,}, this.userData.hoverAnimaTime)
        //.easing(TWEEN.Easing.Quartic.Out)
        .start()
      new TWEEN.Tween(this.mesh.material.color).to(new THREE.Color($.colorToHex(this.userData.color)), this.userData.hoverAnimaTime)
      //.easing(TWEEN.Easing.Quartic.Out)
      .start();
      dispatcher.dispatchEvent({ type: 'mouseout', target:this, orgEvent:event});
  
    }
    /**
     * 鼠标移入事件
     * @param dispatcher
     * @param event
     * @example
     *
     * map.addEventListener('mouseover', (event) => {
       *    let obj = event.target;
       *    console.log(obj.type+':over')
       *  });
     */
    onmouseover(dispatcher,event){
      //区域移入高度
      //this.selectedArea.position.z=1;
      if(this.userData.hasHoverHeight)
        new TWEEN.Tween( this.position ).to({z: this.userData.extrude.amount/2,}, this.userData.hoverAnimaTime)
        //.easing(TWEEN.Easing.Quartic.Out)
        .start();
      //区域移入颜色
      new TWEEN.Tween(this.mesh.material.color).to(new THREE.Color($.colorToHex(this.userData.hoverColor)), this.userData.hoverAnimaTime)
      //.easing(TWEEN.Easing.Quartic.Out)
      .start();
      dispatcher.dispatchEvent({ type: 'mouseover', target:this, orgEvent:event});
    }
    /**
     * 鼠标单击事件
     * @param dispatcher
     * @param event
     * @example
     *
     * map.addEventListener('mousedown', (event) => {
       *    let obj = event.target;
       *    console.log(obj.type+':click')
       *  });
     */
    onmousedown(dispatcher,event) {
      dispatcher.dispatchEvent({ type: 'mousedown', target:this, orgEvent:event});
    }
  }
  /**
   * 区域数量
   * @static
   * @type {number}
   */
  Area.count=0;

  export default Area;