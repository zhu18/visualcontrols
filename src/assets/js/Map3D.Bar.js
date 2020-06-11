/**
 * 3D地图.柱状图
 * Created by zhu18.github.io on 2017/11/19.
 * @author 朱润亚 <zhu18@vip.qq.com>
 * @version beta v1.0.3
 * @module Map3D
 */

import * as THREE from './three.js'
import TWEEN from './tween.min.js'
import * as $ from './util'


/**
 * 地图标注,继承{@link https://threejs.org/docs/#api/objects/Sprite|THREE.Sprite}
 * @class
 * @extends THREE.Sprite
 * @example
 *
 * let opt={
 *  name:'湖南-GDP',
 *  coord:[116,23],
 *  color:0xff0000,
 *  size:4,
 *  value:2,
 *  userAttrA:'A'
 * }
 * let bar = new Bar(opt);
 * console.log(bar.userData.value +  bar.userData.userAttrA)  //'2A'
 */
class Bar extends THREE.Object3D{
  
  /**
   * 创建一个柱状图
   * @param {Object} opt - The mark options | 标注的配置
   * @param {string} [opt.name=''] - mark name | 标注名称
   * @param {array} opt.coord - mark coord | 标注坐标,如:[112,33]
   * @param {string} [opt.color=0xffffff] - mark color | 标注颜色
   * @param {string} [opt.hoverColor=0xff9933] - mark hoverColor | 标注的鼠标移入颜色
   * @param {number} [opt.hoverAnimaTime=300] - mark hover Animate time | 鼠标移入动画过渡时间
   * @param {number} [opt.barType='box'] - bar type | 柱类型, 如：'box','cylinder'
   * @param {number} [opt.value=''] - bar height | 标注值
   * @param {number} [opt.size='1'] - bar size | 柱大小
   * @param {*} [opt.*] - User extended attributes | 用户扩展属性
   *
   */
  constructor(opt){
    super();
    //opt.additiveBlending=true
    let texture=opt.texture||new THREE.TextureLoader().load(opt.url)
    this.material =  new THREE.MeshStandardMaterial({
      color: opt.color,
      emissive: opt.emissive||0x000000,
      transparent:true,
      opacity:opt.opacity,
      blending: opt.additiveBlending?THREE.AdditiveBlending:THREE.NormalBlending,
      side:THREE.DoubleSide,
      map:texture||null,
      alphaMap:opt.useAlphaMap?texture:null,
      depthTest: opt.depthTest
    });
    this.type="Bar";
    this.name=opt.name;
    Object.assign(this.userData,opt);

    this.geometry = opt.barType==='box'?new THREE.BoxGeometry(opt.size,opt.size,opt.value):new THREE.CylinderGeometry( opt.size, opt.size, opt.value, 32 );
    this.add(new THREE.Mesh(this.geometry, this.material))
    this.position.x=opt.coord[0];
    this.position.y=opt.coord[1];
    this.position.z=opt.extrudeHeight+opt.value/2;
    if(opt.barType!=='box')
    {
      this.rotation.x=Math.PI/180*-90
    }
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

    Bar.count++;
  }

  /**
   * 设置标注颜色
   * @param {color} color - 颜色格式0xff9933,'#ff9933','rgb(255,255,255)','hsl(100,100%,50%)'
   * @param {number} [time] - 动画完成时间,与transition时间类似
   * @param {number} [delay=0] - 动画延迟时间
   * @param {Tween.Easing} [easing=line] -动画类型
   * @param {callback} [callback] - 动画完成后回调
   * @example
   *  map.addEventListener('mouseover', (event) => {
     *    let obj = event.target;
     *    if(obj.type==='Bar')
     *    {
     *      obj.setColor('#ff5555',100);// 鼠标移入设置为红色
     *    }
     *  });
   */
  setColor(color, time, delay, easing,callback){
    this.userData.color=$.colorToHex(color);
    if(time && typeof time==='number'){
      color=new THREE.Color($.colorToHex(color));
      $.transition(this.material.color,color,time,delay,easing,callback);
    }
    else {
      this.material.color.set($.colorToHex(color));
    }
  }

  /**
   * 设置标注位置
   * @param {v3} v3 - 格式{x:11,y:33,z:2}
   * @param {number} [time] - 动画完成时间,与transition时间类似
   * @param {number} [delay=0] - 动画延迟时间
   * @param {Tween.Easing} [easing=line] -动画类型
   * @param {callback} [callback] - 动画完成后回调
   * @example
   *
   * map.addEventListener('mouseover', (event) => {
     *     let obj = event.target;
     *     if(obj.type==='Mark')
     *     {
     *       obj.setPosition({x:0,y:0,z:4},300) //标注升高
     *     }
     *   });
   *
   */
  setPosition(v3,time,delay,easing,callback){
    if(time && typeof time==='number')
      $.transition(this.position,v3,time,delay,easing,callback);
    else
      this.position.set(v3.x,v3.y,v3.z);
  }

  /**
   * 设置标注旋转
   * @param {v3} v3 - 格式{x:11,y:33,z:2}
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
   * 设置标注大小
   * @param {v3} v3 - 格式{x:11,y:33,z:2}
   * @param {number} [time] - 动画完成时间,与transition时间类似
   * @param {number} [delay=0] - 动画延迟时间
   * @param {Tween.Easing} [easing=line] -动画类型
   * @param {callback} [callback] - 动画完成后回调
   */
  setScale(v3,time,delay,easing,callback){
    if(time && typeof time==='number')
      $.transition(this.scale,v3,time,delay,easing,callback);
    else
      this.scale.set(v3.x,v3.y,v3.z);
  }
  /* 事件 */
  onmouseout(dispatcher,event){
   // let size=1
    //new TWEEN.Tween(this.scale).to({x:size,y:size}, this.userData.hoverAnimaTime).start();
    new TWEEN.Tween(this.material.emissive).to(new THREE.Color($.colorToHex(this.userData.emissive)), this.userData.hoverAnimaTime).start();
    dispatcher.dispatchEvent({ type: 'mouseout', target:this, orgEvent:event});

  }
  onmouseover(dispatcher,event){
    console.log(this.userData)
    // let size=1.5
    // new TWEEN.Tween(this.scale).to({x:size,y:size}, this.userData.hoverAnimaTime).start();
    //区域移入颜色
    new TWEEN.Tween(this.material.emissive).to(new THREE.Color($.colorToHex(this.userData.hoverColor)), this.userData.hoverAnimaTime).start();
    dispatcher.dispatchEvent({ type: 'mouseover', target:this, orgEvent:event});
  }
  onmousedown(dispatcher,event) {
    dispatcher.dispatchEvent({ type: 'mousedown', target:this, orgEvent:event});
  }
}
/**
 * 所有标注数量,静态属性
 * @type {number}
 * @example
 * //查看地图所有标注数
 * console.log(Bar.count);
 */
Bar.count=0;
Bar._texture=null;

export default Bar