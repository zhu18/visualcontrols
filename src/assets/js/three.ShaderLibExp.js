/**
 * Webgl Shader Library for three.js
 *
 * @author alteredq / http://alteredqualia.com/
 * @author mrdoob / http://mrdoob.com/
 * @author mikael emtinger / http://gomo.se/
 */

import * as THREE from './three.js'

/**
 * 线条着色器,color,texure需要指定，流动效果请参考update实现
 * @type {{vertexShader: string, fragmentShader: string}}
 */
THREE.ShaderLib.line = {
        uniforms: {
                amplitude: { value: 1.0 },
                color: { value: 0xffffff },
                texture: { value: null },
        },
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

/**
 * 物体内边缘发光
 */
THREE.ShaderLib.edgelight = {
        uniforms:
        {
                "s": { type: "f", value: -1.0 },
                "b": { type: "f", value: 1.0 },
                "p": { type: "f", value: 2.0 },
                glowColor: { type: "c", value: new THREE.Color(0x00ffff) }
        },
        vertexShader: [
                "varying vec3 vNormal;",
                "varying vec3 vPositionNormal;",
                "void main() {",
                "vNormal = normalize( normalMatrix * normal ); ",// 转换到视图空间
                "vPositionNormal = normalize(( modelViewMatrix * vec4(position, 1.0) ).xyz);",
                "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
                "}"
        ].join("\n"),
        fragmentShader: [
                "uniform vec3 glowColor;",
                "uniform float p;",
                "uniform float b;",
                "uniform float s;",
                "varying vec3 vNormal;",
                "varying vec3 vPositionNormal;",
                "void main() ",
                "{",
                "  float a = pow( b + s * abs(dot(vNormal, vPositionNormal)), p );",
                "  gl_FragColor = vec4( glowColor, a );",
                "}"
        ].join("\n")
}

/**
 * 创建着色器材质，根据shader
 * @param {shader} shader  shader in three.ShaderlibExp
 * @param {*} side default THREE.FrontSide
 * @param {*} blending default THREE.AdditiveBlending
 */
THREE.ShaderLib.createShaderMaterial = function (shader,side,blending) {
        var customMaterial = new THREE.ShaderMaterial({
                uniforms:shader.uniforms,
                vertexShader: shader.vertexShader,
                fragmentShader: shader.fragmentShader,
                side: side||THREE.FrontSide,
                blending: blending||THREE.AdditiveBlending,
                transparent: true
        })
        return customMaterial;
}


console.log(THREE.ShaderLib)
