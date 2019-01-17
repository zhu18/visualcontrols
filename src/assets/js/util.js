/**
 * Created by ADMIN on 2017/12/18.
 */
import * as THREE from './three.js'
import TWEEN from './tween.min.js'

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

/**
   * 过渡动画
   * @param {Object|*} from - 修改的启始值
   * @param {Object|*} to - 修改的结束值
   * @param {number} [time] - 完成时间
   * @param {number} [delay=0] - 延迟时间
   * @param {Tween.Easing} [easing=TWEEN.Easing.Linear.None] -动画类型
   * @param {callback} [callback] - 完成回调
   * @example
   * $.transition(area.position, {x:0,y:0,z:10}, 1000, 500, TWEEN.Easing.Quartic.Out, callback)
   */
   function transition(from,to,time,delay,easing,callback){
    if(typeof time !=='number'){
      time=1000;
    }
    if(!callback)callback=()=>{};
    
    new TWEEN.Tween(from).to(to,time).delay(delay||0)
    .easing(easing||TWEEN.Easing.Linear.None)
    .start().onComplete(callback);
  }

  let extend = function() {
  var copyIsArray,
    toString = Object.prototype.toString,
    hasOwn = Object.prototype.hasOwnProperty,

    class2type = {
      '[object Boolean]': 'boolean',
      '[object Number]': 'number',
      '[object String]': 'string',
      '[object Function]': 'function',
      '[object Array]': 'array',
      '[object Date]': 'date',
      '[object RegExp]': 'regExp',
      '[object Object]': 'object'
    },

    type = function(obj) {
      return obj == null ? String(obj) : class2type[toString.call(obj)] || "object";
    },

    isWindow = function(obj) {
      return obj && typeof obj === "object" && "setInterval" in obj;
    },

    isArray = Array.isArray || function(obj) {
        return type(obj) === "array";
      },

    isPlainObject = function(obj) {
      if (!obj || type(obj) !== "object" || obj.nodeType || isWindow(obj)) {
        return false;
      }

      if (obj.constructor && !hasOwn.call(obj, "constructor") &&
        !hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
        return false;
      }

      var key;
      for (key in obj) {}

      return key === undefined || hasOwn.call(obj, key);
    },

    extend = function(deep, target, options) {
      for (var name in options) {
        var src = target[name];
        var copy = options[name];

        if (target === copy) {
          continue;
        }

        if (deep && copy &&
          (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
          if (copyIsArray) {
            copyIsArray = false;
            var clone = src && isArray(src) ? src : [];

          } else {
            var clone = src && isPlainObject(src) ? src : {};
          }

          target[name] = extend(deep, clone, copy);
        } else if (copy !== undefined) {
          target[name] = copy;
        }
      }

      return target;
    };

  return extend;
}();


export {
  colorToHex,
  extend,
  transition
}