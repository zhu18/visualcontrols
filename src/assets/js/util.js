/**
 * Created by ADMIN on 2017/12/18.
 */
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

export const $ = function() {
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

  return { extend: extend };
}();


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



