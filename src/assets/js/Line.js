/**
 * Created by ADMIN on 2017/12/18.
 */
import * as THREE from './three.js'
import './util.js'

/** Class representing a Line.
 * @extends THREE.Line
 *
 * @example
 * var opt={
 *      color:0x55eeff,                  // 基线颜色
 *      hoverColor:0xff9933,            //鼠标移入颜色
 *      spaceHeight:5,                  // 曲线空间高度
 *      hasHalo:true,                   // 是否开启光晕效果
 *      hasHaloAnimate:true,            // 是否开启光晕动画效果
 *      haloDensity:2,                  // 光点密度 值越大 越浓密，越消耗性能
 *      haloRunRate:0.01,               // 光点运动频率
 *      haloColor:0xffffff,             // 默认继承color颜色
 *      haloSize:10,                    // 光晕大小
 *    }
 * let line = new Line(opt);
 * */
class Line extends THREE.Line{
  static count=0;
  static array=[];
  static _texture=null;
  /**
   * 标注纹理样式
   * @returns {THREE.Texture}
   * @example
   * Line.texture()
   */
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

  /**
   * 可以重写
   * @static
   * @param context
   */
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

  /**
   * Create a Line (创建一条线)
   * @param {Object} pros - The Line options | 线的配置
   * @param {string} pros.color - Line base Color | 线的基础颜色
   * @param {string} pros.hoverColor - Line base hoverColor | 线的鼠标移入颜色
   */
  constructor(pros){
    // pros:
    // {
    //   color:0x55eeff,                  // 基线颜色
    //   hoverColor:0xff9933,            //鼠标移入颜色
    //   spaceHeight:5,                  // 曲线空间高度
    //   hasHalo:true,                   // 是否开启光晕效果
    //   hasHaloAnimate:true,            // 是否开启光晕动画效果
    //   haloDensity:2,                  // 光点密度 值越大 越浓密，越消耗性能
    //   haloRunRate:0.01,               // 光点运动频率
    //   haloColor:0xffffff,             // 默认继承color颜色
    //   haloSize:10,                    // 光晕大小
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
  initHalo(geometry){
    let line = this;
    let amount=geometry.vertices.length;
    let positions = new Float32Array(amount * 3);
    let colors = new Float32Array(amount * 3);
    let sizes = new Float32Array(amount);
    let vertex = new THREE.Vector3();
    let color = new THREE.Color(colorToHex(this.userData.color));
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
      color: {value: new THREE.Color(colorToHex(this.userData.haloColor))},
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
        attributes.size.array[ i ] = line.userData.haloSize + line.userData.haloSize * Math.sin( (line.userData.haloRunRate * i + time) ) ;
      }
      attributes.size.needsUpdate = true;
    }

  }
  update(){
    //if(!this.userData.hasHalo || !this.userData.hasHaloAnimate)
    this.halo.update();
  }
  //修改线颜色 基线颜色，光线颜色
  setColor(color,haloColor){
    //基线
    if(typeof color!=='undefined')
      this.material.color=new THREE.Color(colorToHex(color));
    // //光线
    // if(typeof haloColor!=='undefined' && this.userData.hasHalo )
    // {
    //   let color = new THREE.Color(colorToHex(haloColor));
    //   let colors=this.halo.geometry.attributes.customColor;
    //   for ( let i = 0; i < colors.array.length; i+=3 ) {
    //     colors.array[ i ] = color.r;
    //     colors.array[ i + 1] = color.g;
    //     colors.array[ i + 2] = color.b;
    //   }
    //   this.halo.geometry.attributes.customColor.needsUpdate = true;
    // }
  }
  setLineWidth(size){
    if(!this.userData.hasHalo)
    {
      console.warn('Setting the LineWidth must be hasHalo:true')
    }
    //粗细
    this.userData.haloSize=size;
  }

  /* 事件 */
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
  onmouseover(dispatcher,event){
    if(this.userData.hoverExclusive)
    {
      Line.array.map((line)=>{
        if(line.halo){
          line.halo.visible=false
        }
        console.log(line.material.color.getHex().toString(16));
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
  onmousedown(dispatcher,event) {
    dispatcher.dispatchEvent({ type: 'mousedown', target:this, orgEvent:event});
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

export default Line;
