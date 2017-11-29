/**
 * Created by jusfoun-fe.github.io on 2017/10/26.
 * 星云特效
 */

import Detector from './Detector.js'
import * as THREE from './three.js'
import TWEEN from './tween.min.js'
import './OrbitControls.js'

let scene;
let camera;
let renderer;
let render_w;
let render_h;
let controls;
/*
* 参数格式
 {
    el:document.body,           //渲染元素，默认为body
    pointsCloud:[               //星云集合
                 {size:1,       //星点大小
                 color:0xffffff,//星点颜色
                 opacity:1,     //星点透明度
                 count:10000,   //星点数量
                 offset:0.001   //移动速度
                 map:null}      //星点图片 Image对象, 注意：如果使用map,请保证Image图片完全加载。
                 ],
    wireframe:false,            //调试线框
 }
* */
function Nebula(o){
    let opt={
        wireframe:false,
        el:document.body,
        pointsCloud:[],
    }
    Object.assign(opt,o);
    this.opt=opt;
    let self=this;

    if(!Detector.webgl) {
        console.log('不支持webgl,停止星云效果渲染.');
        return;
    }

    this.pointsCloudObjects=[];
    render_w=window.innerWidth;
    render_h=window.innerHeight;

    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(70, render_w/render_h, 1, 5000);
    renderer = new THREE.WebGLRenderer({alpha:true});
    camera.position.set(30,30,150);
    camera.lookAt(scene.position);
    renderer.setSize(render_w,render_h);

    //视角
    let rotateV={
        x:0.15*Math.PI,
        y:0.1*Math.PI,
        z:0
    }
    if(opt.wireframe){
        let boxGeom = new THREE.BoxGeometry(100,100,100);
        let boxMate = new THREE.MeshBasicMaterial({wireframe:true});
        let box = new THREE.Mesh(boxGeom,boxMate);
        box.rotation.set(rotateV.x,rotateV.y,rotateV.z);
        scene.add(box);
    }

    //创建星云
    for(let pc of opt.pointsCloud){
        let pcObject=createPointsCloud(pc);
        pcObject.offset=pc.offset;
        this.pointsCloudObjects.push(pcObject);
        scene.add(pcObject)
    }


    camera.lookAt(scene.position);
    renderer.domElement.style.position='absolute';
    renderer.domElement.style.top='0';
    opt.el.appendChild(renderer.domElement);

    controls  = new THREE.OrbitControls(camera,renderer.domElement);
    controls.userPan=false;
    controls.autoRotate=false;


    renderScene();
    window.addEventListener('resize', onWindowResize, false);

    function renderScene(){
        for(let pco of self.pointsCloudObjects){
            pco.rotation.y+=pco.offset
        }

        requestAnimationFrame(renderScene);
        TWEEN.update();
        renderer.render(scene,camera);
        controls.update();
    }
}

Nebula.prototype={
    /*
    * opt:{
    *   x:2 * Math.PI,    //x轴旋转一周
    *   y:2 * Math.PI,    //y轴旋转一周
    *   z:2 * Math.PI,    //z轴旋转一周
    *   }
    * time:1000 //旋转时间
    * */
    rotate:function(opt,time){
        if(!Detector.webgl) {return}
        time=time||2000;
        Object.assign(opt,{x:0,y:2,z:0},opt)
        let rotateValue={
            x:scene.rotation.x+opt.x,
            y:scene.rotation.y+opt.y,
            z:scene.rotation.z+opt.z
        }

        new TWEEN.Tween(scene.rotation).to(rotateValue,time).start();
    }
}


function getTexture(img) {
    let w=128
    let h=128
    let canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    let ctx = canvas.getContext('2d');

    if(img){
        ctx.drawImage(img,0,0);
    }
    else{
        let gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
        gradient.addColorStop(0, 'rgba(255,255,255,1)');
        gradient.addColorStop(1, 'rgba(255,255,255,0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
        ctx.beginPath();
    }

    var texture = new THREE.Texture(canvas);
    texture.needsUpdate = true;
    return texture;
}

function createPointsCloud(o){
    let opt={
        size:1,
        color:0xffffff,
        opacity:1,
        count:0,
        map:null,
    }
    Object.assign(opt,o);


    let starsGeometry = new THREE.Geometry();
    for ( let i = 0; i < opt.count; i ++ ) {
        let star = new THREE.Vector3();
        star.x = THREE.Math.randFloatSpread( 1000 );
        star.y = THREE.Math.randFloatSpread( 1000 );
        star.z = THREE.Math.randFloatSpread( 1000 );
        star.fog=false;
        starsGeometry.vertices.push( star );
    }

    let starsMaterial = new THREE.PointsMaterial( {
        size:opt.size,
        // vertexColors: true,
        color: opt.color,
        transparent: true,
        blending:THREE.AdditiveBlending,
        depthWrite: false,
        opacity: opt.opacity,
        map:getTexture(opt.map),
    } );

    var starField = new THREE.Points( starsGeometry, starsMaterial );
    return starField;
}




function onWindowResize() {
    render_w=window.innerWidth;
    render_h=window.innerHeight;
    camera.aspect = render_w/ render_h;
    camera.updateProjectionMatrix();
    renderer.setSize( render_w, render_h );
    console.log('resize')
}

"undefined" != typeof module && module.exports && (module.exports = Nebula);
export default Nebula;
