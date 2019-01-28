/**
 * 3D地图.标注点
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
 *  name:'台风-依安',
 *  coord:[116,23],
 *  color:0xff0000,
 *  size:4,
 *  value:2,
 *  userAttrA:'A'
 * }
 * let mark = new Mark(opt);
 * console.log(mark.userData.value +  mark.userData.userAttrA)  //'2A'
 */
class Mark extends THREE.Sprite{
  /**
   * 光点纹理样式,返回一个纹理 {@link https://threejs.org/docs/#api/textures/Texture|THREE.Texture}
   * @returns {THREE.Texture}
   * @example
   * Mark.texture()
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
   * 光点纹理样式,如果你对canvas熟悉可以重写.否则使用默认样式
   * @static
   * @param {context} context - Canvas上下文对象 {@link https://developer.mozilla.org/zh-CN/docs/Web/API/HTMLCanvasElement/getContext|Canvas.context}
   * @example
   *
   * Mark.draw=(ctx)=>{
     *  context.clearRect(0, 0, 128, 128);
     *  context.fillStyle = '#ff0000';
     *  context.arc(64, 64, 20, 0, Math.PI * 2, false);
     *  context.fill();
     * }
   */
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

  /**
   * 创建一个标注
   * @param {Object} pros - The mark options | 标注的配置
   * @param {string} [pros.name=''] - mark name | 标注名称
   * @param {array} pros.coord - mark coord | 标注坐标,如:[112,33]
   * @param {string} [pros.color=0xffffff] - mark color | 标注颜色
   * @param {string} [pros.hoverColor=0xff9933] - mark hoverColor | 标注的鼠标移入颜色
   * @param {number} [pros.hoverAnimaTime=300] - mark hover Animate time | 鼠标移入动画过渡时间
   * @param {string} [pros.value=''] - mark value | 标注值
   * @param {*} [pros.*] - User extended attributes | 用户扩展属性
   *
   */
  constructor(pros){
    super();
    this.material = new THREE.SpriteMaterial( { map: Mark.texture, color: pros.color , blending: THREE.AdditiveBlending} );
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
     *    if(obj.type==='Mark')
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
    let size=this.userData.size*1
    new TWEEN.Tween(this.scale).to({x:size,y:size}, this.userData.hoverAnimaTime).start();
    new TWEEN.Tween(this.material.color).to(new THREE.Color($.colorToHex(this.userData.color)), this.userData.hoverAnimaTime).start();
    dispatcher.dispatchEvent({ type: 'mouseout', target:this, orgEvent:event});

  }
  onmouseover(dispatcher,event){
    let size=this.userData.size*1.5
    new TWEEN.Tween(this.scale).to({x:size,y:size}, this.userData.hoverAnimaTime).start();
    //区域移入颜色
    new TWEEN.Tween(this.material.color).to(new THREE.Color($.colorToHex(this.userData.hoverColor)), this.userData.hoverAnimaTime).start();
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
 * console.log(Mark.count);
 */
Mark.count=0;
Mark._texture=null;

export default Mark