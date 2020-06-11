/**
 * 3D地图.线
 * Created by zhu18.github.io on 2017/11/19.
 * @author 朱润亚 <zhu18@vip.qq.com>
 * @version beta v1.0.3
 * @module Map3D
 */

import * as THREE from './three.js'
import TWEEN from './tween.min.js'
import * as $ from './util'
import Shaderlib from './three.ShaderLibExp'

/** Class representing a Line.
 * @extends THREE.Line
 *
 * @example
 * var opt={
 *   color:0x55eeff,                 // 基线颜色
 *   hoverColor:0xff9933,            // 线的鼠标移入基线颜色
 *   spaceHeight:5,                  // 曲线空间高度
 *   hasHalo:true,                   // 是否有发光线
 *   hasHaloAnimate:true,            // 是否开启发光线动画效果
 *   haloDensity:2,                  // 光点密度 值越大 越浓密，越消耗性能
 *   haloRunRate:0.01,               // 光点运动频率
 *   haloColor:0xffffff,             // 发光线颜色，默认继承color
 *   haloSize:10,                    // 发光线粗细
 * }
 * let line = new Line(opt);
 * */
class Line extends THREE.Line{
  /**
   * 光点纹理样式,返回一个纹理 {@link https://threejs.org/docs/#api/textures/Texture|THREE.Texture}
   * @returns {THREE.Texture}
   * @example
   * Line.texture()
   */
  static get texture(){
    if(!Line._texture)
    {
      let canvas = document.createElement("canvas");
      canvas.width=128;
      canvas.height=128;
      let context = canvas.getContext('2d');
      Line.draw(context);
      let texture = new THREE.Texture(canvas);
      texture.needsUpdate = true;
      Line._texture=texture;
    }
    return Line._texture;
  }

  /**
   * 光点纹理样式,如果你对canvas熟悉可以重写.否则使用默认样式
   * @static
   * @param {context} context - Canvas上下文对象 {@link https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/getContext|Canvas.context}
   * @example
   *
   * Line.draw=(ctx)=>{
     *  context.clearRect(0, 0, 128, 128);
     *  context.fillStyle = '#ff0000';
     *  context.arc(64, 64, 20, 0, Math.PI * 2, false);
     *  context.fill();
     * }
   */
  static draw(context){
    context.clearRect(0, 0, 128, 128);
    context.fillStyle = '#ffffff';
    context.arc(64, 64, 20, 0, Math.PI * 2, false);
    context.fill();

    context.fillStyle = 'rgba(255,255,255,.7)';
    context.arc(64, 64, 60, 0, Math.PI * 2, false);
    context.fill();

  }

  /**
   * 创建一条线
   * @param {Object} pros - The Line options | 线的配置
   * @param {string} pros.color - Line base color | 基线颜色
   * @param {string} pros.hoverColor - Line base hoverColor | 线的鼠标移入基线颜色
   * @param {number} pros.spaceHeight - Line space height | 曲线空间高度
   * @param {boolean} pros.hasHalo - Has light emitting line| 是否有发光线
   * @param {boolean} pros.hasHaloAnimate - Has light emitting line Animate| 是否有发光线动画效果
   * @param {number} pros.haloDensity - Spot density becomes more dense, more consumption performance | 光点密度 值越大 越浓密，越消耗性能
   * @param {number} pros.haloRunRate - Light point motion frequency | 光点运动频率
   * @param {color} pros.haloColor - Halo line color, default inheritance of color | 发光线颜色，默认继承color
   * @param {number} pros.haloSize - Halo line color width | 发光线粗细
   */
  constructor(pros){
    // pros:
    // {
    //   color:0x55eeff,                 // 基线颜色
    //   hoverColor:0xff9933,            // 线的鼠标移入基线颜色
    //   spaceHeight:5,                  // 曲线空间高度
    //   hasHalo:true,                   // 是否有发光线
    //   hasHaloAnimate:true,            // 是否开启发光线动画效果
    //   haloDensity:2,                  // 光点密度 值越大 越浓密，越消耗性能
    //   haloRunRate:0.01,               // 光点运动频率
    //   haloColor:0xffffff,             // 发光线颜色，默认继承color
    //   haloSize:10,                    // 发光线粗细
    // }
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
      geometry.colors.push(new THREE.Color(0xffffff));
    })

    let material =  new THREE.LineBasicMaterial({
      color:pros.color,
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
    Line.array.push(this);
  }

  /**
   * 初始化发光线
   * @param {THREE.Geometry} geometry - 通过线条几何体初始化发光线 {@link https://threejs.org/docs/#api/core/Geometry|THREE.Geometry}
   * @protected
   */
  initHalo(geometry){
    let line = this;
    let amount=geometry.vertices.length;
    let positions = new Float32Array(amount * 3);
    let colors = new Float32Array(amount * 3);
    let sizes = new Float32Array(amount);
    let vertex = new THREE.Vector3();
    let color = new THREE.Color($.colorToHex(this.userData.color));
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

    let shader = THREE.ShaderLib.line;
    shader.uniforms = {
      amplitude: {value: 1.0},
      color: {value: new THREE.Color($.colorToHex(this.userData.haloColor))},
      texture: {value: Line.texture},
    };

    let shaderMaterial = new THREE.ShaderMaterial({
      uniforms: shader.uniforms,
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
        attributes.size.array[ i ] = line.userData.haloSize + line.userData.haloSize * Math.sin( (line.userData.haloRunRate * i + time) ) ;
      }
      attributes.size.needsUpdate = true;
    }

  }

  /**
   * 发光线的动画更新方法
   * @private
   */
  update(){
    //if(!this.userData.hasHalo || !this.userData.hasHaloAnimate)
    this.halo.update();
  }

  /**
   * 修改线颜色
   * @param {color} color - 线条颜色
   * @example
   *
   * line.setColor(0xff0000);
   * line.setColor('hsl(240,100%,50%)');
   * line.setColor('rgb(255,255,0)');
   */
  setColor(color,haloColor){
    //基线
    if(typeof color!=='undefined')
      this.material.color=new THREE.Color($.colorToHex(color));
    // //光线
    // if(typeof haloColor!=='undefined' && this.userData.hasHalo )
    // {
    //   let color = new THREE.Color($.colorToHex(haloColor));
    //   let colors=this.halo.geometry.attributes.customColor;
    //   for ( let i = 0; i < colors.array.length; i+=3 ) {
    //     colors.array[ i ] = color.r;
    //     colors.array[ i + 1] = color.g;
    //     colors.array[ i + 2] = color.b;
    //   }
    //   this.halo.geometry.attributes.customColor.needsUpdate = true;
    // }
  }

  /**
   * 设置发光线宽度,基线永远是1
   * @param {number} size - 发光线粗细大小
   */
  setLineWidth(size){
    if(!this.userData.hasHalo)
    {
      console.warn('Setting the LineWidth must be hasHalo:true')
    }
    //粗细
    this.userData.haloSize=size;
  }

  /**
   * 线条鼠标移出事件
   *
   * @param dispatcher
   * @param event
   * @protected
   * @example
   *  // 注册事件
   *  map.addEventListener('mouseout', (event) => {
     *        let obj = event.target;
     *
     *        if(obj.type==='Line')
     *        {
     *           // 这里做鼠标移出操作
     *        }
     *      });
   */
  onmouseout(dispatcher,event){
    if(this.userData.hoverExclusive){
      //所有线条回复初始
      Line.array.map((line)=>{
        if(line.halo){
          line.halo.visible=true
        }
        line.setColor(line.userData.color);
      });
    }

    //选中线条
    if(this.userData.hasHalo)
    {
      //粗细
      let size=this.userData.haloSize/1.5
      this.userData.haloSize=size;
    }
    //颜色
    this.setColor(this.userData.color);
    dispatcher.dispatchEvent({ type: 'mouseout', target:this, orgEvent:event});
  }
  /**
   * 线条鼠标移入事件
   * @param dispatcher
   * @param event
   * @protected
   * @example
   *  // 注册事件
   *  map.addEventListener('mouseover', (event) => {
     *        let obj = event.target;
     *
     *        if(obj.type==='Line')
     *        {
     *           // 这里做鼠标移入操作
     *        }
     *      });
   */
  onmouseover(dispatcher,event){
    if(this.userData.hoverExclusive)
    {
      Line.array.map((line)=>{
        if(line.halo){
          line.halo.visible=false
        }
        line.setColor(this.userData.decayColor);

      });
    }

    //选中线条
    if(this.userData.hasHalo)
    {
      //修改光点线 大小
      let size=this.userData.haloSize*1.5
      this.userData.haloSize=size;
      this.halo.visible=true;
    }
    //颜色
    this.setColor(this.userData.hoverColor?this.userData.hoverColor:this.userData.color);
    dispatcher.dispatchEvent({ type: 'mouseover', target:this, orgEvent:event});
  }
  /**
   * 线条鼠标单击事件
   * @param dispatcher
   * @param event
   * @protected
   * @example
   *  // 注册事件
   *  map.addEventListener('mousedown', (event) => {
     *        let obj = event.target;
     *
     *        if(obj.type==='Line')
     *        {
     *           // 这里做鼠标单击操作
     *        }
     *      });
   */
  onmousedown(dispatcher,event) {
    dispatcher.dispatchEvent({ type: 'mousedown', target:this, orgEvent:event});
  }
}
/**
 * 线条数量
 * @static
 * @type {number}
 */
Line.count=0;
Line.array=[];
Line._texture=null;

export default Line