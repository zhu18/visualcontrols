/**
 * Created by jusfoun-fe.github.io on 2017/11/08.
 * 星系运动
 */
import Detector from './Detector.js'
import * as THREE from './three.js'
import TWEEN from './tween.min.js'
import './OrbitControls.js'
import Stats from './stats.js'

let scene;
let sceneAir;
let camera;
let renderer;
let controls;
let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();
let stats;

let starTextClass='star-text';
let starTextHoverClass='star-text-hover';
let el;

var Shaders = {
    'earth' : {
        uniforms: {
            "texture": { type:'t',texture: null }
        },
        vertexShader: [
            "varying vec3 vNormal;",
            "varying vec2 vUv;",
            "void main() {",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
            "vNormal = normalize( normalMatrix * normal );",
            "vUv = uv;",
            "}"
        ].join("\n"),
        fragmentShader: [
            "uniform sampler2D texture;",
            "varying vec3 vNormal;",
            "varying vec2 vUv;",
            "void main() {",
            "vec3 diffuse = texture2D( texture, vUv ).xyz;",
            "float intensity = 1.05 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) );",
            "vec3 atmosphere = vec3( 1.0, 1.0, 1.0 ) * pow( intensity,3.0 );",
            "gl_FragColor = vec4( diffuse + atmosphere, 1.0 );",
            "}"
        ].join("\n")
    },
    'atmosphere' : {
        uniforms: {},
        vertexShader: [
            "varying vec3 vNormal;",

            "void main() {",

            "vNormal = normalize( normalMatrix * normal );",

            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.2 );",

            "}"
        ].join("\n"),
        fragmentShader: [
            "varying vec3 vNormal;",

            "void main() {",

            "float intensity = pow( 0.8 - dot( vNormal, vec3( 0, 0, 1.0 ) ), 12.0 );",

            "gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;",

            "}"
        ].join("\n")
    }
};
function initStats(){
    var stats = new Stats();
    stats.setMode(0);//0:fps |1:ms
    stats.domElement.style.position='absolute';
    stats.domElement.style.top='60px';
    stats.domElement.style.right='0px';
    el.appendChild(stats.domElement);
    return stats;
}


// 星点
let starsPoint;
function stars() {
    var starsGeometry = new THREE.Geometry();
    for (var i = 0; i < 10000; i ++) {
        var starVector = new THREE.Vector3(
            THREE.Math.randFloatSpread(2000),
            THREE.Math.randFloatSpread(2000),
            THREE.Math.randFloatSpread(2000),
        );
        starsGeometry.vertices.push(starVector);
    }
    var starsMaterial = new THREE.PointsMaterial( { color:0x888888, size: 1, sizeAttenuation: false,  alphaTest: 0.5, transparent: true } );
    starsPoint = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(starsPoint);
}

class Galaxy{
    constructor(o) {


        if(!Detector.webgl) {
            console.log('不支持webgl,停止渲染.');
            return;
        }

        this.stars=[];

        let opt={
            el:document.body
        }
        Object.assign(opt,o);
        el=opt.el;

        stats=initStats();

        scene = new THREE.Scene( { antialias: true } );
        camera = new THREE.PerspectiveCamera(70, window.innerWidth/window.innerHeight, 1, 5000);
        renderer = new THREE.WebGLRenderer({alpha:true});
        renderer.clear();
        renderer.setSize( window.innerWidth, window.innerHeight );
        camera.position.set(30,300,1500);
        camera.lookAt(scene.position);
        controls  = new THREE.OrbitControls(camera,renderer.domElement);
        controls.userPan=false;
        controls.autoRotate=false;

        stars();

        let spotLight = new THREE.PointLight(0xffffff, 1, 0, 2);
        scene.add(spotLight);

        let spotLighth = new THREE.PointLight(spotLight);
        scene.add(spotLighth);

        let al = new THREE.AmbientLight(0x333333);
        scene.add(al);


        let sun = createStar({name:'太阳',size:20,emissive:0xe65f05,map:THREE.ImageUtils.loadTexture('static/sun.jpg'),
            revspeed:0.01,//公转速度
            rotspeed:0.01//自转速度
        });
        this.stars.push(sun);


        let suixin = createStar({name:'水星',size:3,dist:40,emissive:0xe65f05,map:THREE.ImageUtils.loadTexture('static/shuixin.png'),
            revspeed:0.01,
            rotspeed:0.01
        });
        this.stars.push(suixin);

        let jinxin =createStar({name:'金星',color:0xcceeff,dist:-60,mateType:2,map:THREE.ImageUtils.loadTexture('static/jinxin.png'),
            revspeed:0.007,
            rotspeed:0.01
        });
        this.stars.push(jinxin);

        let s2 =createStar({name:'地球',color:0xcceeff,dist:80,mateType:2,map:THREE.ImageUtils.loadTexture('static/world.jpg'),
            revspeed:0.007,
            rotspeed:0.01
        });
        s2.rotation.x=0.3;
        this.stars.push(s2);

        let s21 =createStar({name:'月球',color:0x888888,size:1,dist:13,mateType:2,parent:s2,
            revspeed:0.03,
            rotspeed:0.01
        });
        this.stars.push(s21);


        let s3 =createStar({name:'火星',color:0xff9933,size:5,dist:-100,mateType:2,map:THREE.ImageUtils.loadTexture('static/a.jpg'),
            revspeed:0.005,
            rotspeed:0.01
        });
        this.stars.push(s3);

        let s4 =createStar({name:'木星',color:0xcceeff,size:15,dist:120,mateType:2,map:THREE.ImageUtils.loadTexture('static/muxin.png'),
            revspeed:0.003,
            rotspeed:0.01
        });
        this.stars.push(s4);

        let s5 =createStar({name:'土星',color:0x669966,size:12,dist:-140,mateType:2,map:THREE.ImageUtils.loadTexture('static/tuxin.png'),
            revspeed:0.01,
            rotspeed:0.02
        });
        this.stars.push(s5);
        //土星光环
        var tu_huan_geometry = new THREE.CylinderGeometry(15, 22, 0, 50, 100, true);
        var tu_huan_material = new THREE.MeshLambertMaterial({
            emissive:0x669966,
            map: THREE.ImageUtils.loadTexture("static/tuxin1.png"),
            side: THREE.DoubleSide,
        });
        let tu_huan = new THREE.Mesh(tu_huan_geometry, tu_huan_material);
        tu_huan.rotation.set(0.5, 0, 0);
        s5.add(tu_huan);



        let s6 =createStar({name:'天王星',color:0x663333,size:10,dist:160,mateType:1,map:THREE.ImageUtils.loadTexture('static/tianwangxin.png'),
            revspeed:0.01,
            rotspeed:0.02
        });
        this.stars.push(s6);

        let s7 =createStar({name:'海王星',color:0x663333,size:9,dist:-180,mateType:1,map:THREE.ImageUtils.loadTexture('static/haiwangxin.png'),
            revspeed:0.006,
            rotspeed:0.02
        });
        this.stars.push(s7);

        let s8 =createStar({name:'冥王星',color:0x663333,size:2,dist:200,mateType:1,
            revspeed:0.005,
            rotspeed:0.02
        });
        this.stars.push(s8);

        this.stars.forEach((star)=>{
            if(!star.opt.parent){
                scene.add(star);
                scene.add(star.line);
            }
            else{
                star.opt.parent.add(star);
                star.opt.parent.add(star.line);
            }
        })


        renderer.domElement.style.position='absolute';
        renderer.domElement.style.top='0';
        opt.el.appendChild(renderer.domElement);
        this.renderScene();

        window.addEventListener('resize', _onResize,false);
        el.addEventListener('mousemove', _onMouseMove, false );
        el.addEventListener('mousedown', _onMouseDown, false );

        let rotateValue={
            x:scene.rotation.x,
            y:scene.rotation.y+2*Math.PI,
            z:scene.rotation.z
        }

        new TWEEN.Tween(scene.rotation).to(rotateValue,2000).start();
        new TWEEN.Tween(camera.position).to({x:30,y:30,z:150},2000).start();
    };

    renderScene(){
        starsPoint.rotation.y+=0.0005;
        if(!isSelectedStar){
            this.stars.forEach((star)=>{
                let starOpt = star.opt;
                star.rotation.y = star.rotation.y + starOpt.rotspeed ;//自转
                starOpt.positionOffset = starOpt.positionOffset+starOpt.revspeed;
                star.position.set(starOpt.dist * Math.sin(starOpt.positionOffset), 0, starOpt.dist * Math.cos(starOpt.positionOffset));//公转
            })
        }

        requestAnimationFrame(this.renderScene.bind(this));
        TWEEN.update();
        stats.update();
        controls.update();
        renderer.render(scene,camera);


    }

}


function createStar(o){
    let opt={
        name:'',
        size:10,
        dist:0,//距离中心距离
        color:0xffffff,
        emissive:0x000000,
        line:true,// 是否显示轨迹
        mateType:1,// 1发光星球,2粗糙表面,3光滑表面
        map:null,
        side: THREE.DoubleSide,
        revspeed:0.01,//公转速度
        rotspeed:0.01,//自转速度
        positionOffset:0,//公转位移
    }
    Object.assign(opt,o);
    //球体
    let geo = new THREE.SphereGeometry(opt.size, 40, 40);
    let mate = getMateByType(opt.mateType)(opt);
    let mesh = new THREE.Mesh(geo,mate);
    mesh.position.set(opt.dist,0,0);
    mesh.opt = opt;
    mesh.isStar=true;

    //txt
    var div = document.createElement('div');
    div.className = starTextClass;
    div.innerHTML = opt.name;
    div.style.position = 'absolute';
    el.appendChild(div);
    mesh.txt=div;

    if(opt.line){
    //line
    let track = new THREE.Mesh( new THREE.RingGeometry (opt.dist-0.2, opt.dist+0.2, 64,1),
        new THREE.MeshBasicMaterial( { color: 0x888888, side: THREE.DoubleSide, transparent:true,opacity:0.3 } )
    );
    track.rotation.x = - Math.PI / 2;
    mesh.line=track;
    }

    return mesh;
}


function getMateByType(type){
    let mate=null;
    switch (type){
        //1发光星球
        case 1:
            mate = function(opt){
                opt.emissiveMap=opt.map;
                return new THREE.MeshLambertMaterial(opt);
            }
            break;
        //2粗糙表面
        case 2:
            mate = function(opt){
                return new THREE.MeshLambertMaterial(opt);
            }
            break;
        //3光滑表面
        case 3:
            mate = function(opt){
                opt.shininess=300;
                return new THREE.MeshPhongMaterial(opt);
            }
            break;
    }
    return mate;
}


function getXY(world_vector){
    var vector = world_vector.project(camera);
    var halfWidth = window.innerWidth / 2;
    var halfHeight = window.innerHeight / 2;
    var result = {
        x: Math.round(vector.x * halfWidth + halfWidth),
        y: Math.round(-vector.y * halfHeight + halfHeight)
     }
     return result;
}

let isSelectedStar=false;
function showName(star,isShow){
    if(!star)return;
    isSelectedStar=isShow;

    let v3=star.position;
    if(star.opt.parent){
        v3=star.opt.parent.position;
    }
    var xy=getXY(new THREE.Vector3(v3.x,v3.y+star.opt.size,v3.z));
    star.txt.style.top= xy.y - 50 +'px';
    star.txt.style.left= xy.x - 50 +'px';
    let className = star.txt.className;
    if(isShow){
        if(className.indexOf(starTextHoverClass)==-1)
            star.txt.className=className + ' ' + starTextHoverClass;
    }
    else {
        star.txt.className=className.replace(' '+starTextHoverClass,'');
    }

}

function _onResize(){

    camera.aspect = window.innerWidth/ window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );


}

let mouseOverObj,mouseOverObjMate;
function _onMouseMove() {
    event.preventDefault();
    mouse.x = ( event.offsetX  / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.offsetY  / window.innerHeight ) * 2 + 1;

    raycaster.setFromCamera( mouse, camera );
    let intersects = raycaster.intersectObjects( scene.children ,true);


    if ( intersects.length > 0) {

        if(mouseOverObj) {
            showName(mouseOverObj,false);
            mouseOverObj.material=mouseOverObjMate;
        }

        for(let i=0;i<intersects.length;i++){
            if(intersects[i].object instanceof THREE.Mesh && intersects[ i ].object.isStar)
            {
                mouseOverObj=intersects[ i ].object;
                break;
            }
        }
        if(!mouseOverObj)return;
        //显示名称

        showName(mouseOverObj,true);
        //高亮显示
        let shader = Shaders[ 'earth' ];
        var uniforms = THREE.UniformsUtils.clone( shader.uniforms );
        uniforms.texture.value = mouseOverObj.opt.map;
        var material = new THREE.ShaderMaterial( {
            uniforms: uniforms,
            vertexShader: shader.vertexShader,
            fragmentShader: shader.fragmentShader,
            transparent:true,
            opacity:1,
        } );
        mouseOverObjMate=mouseOverObj.material;
        mouseOverObj.material=material;
    }
    else{
        if(mouseOverObj){
            showName(mouseOverObj,false);
            mouseOverObj.material=mouseOverObjMate;
            mouseOverObj=null;
        }
    }
}

let selectObj,selectObjMate;
function _onMouseDown() {
    event.preventDefault();
    raycaster.setFromCamera( mouse, camera );
    let intersects = raycaster.intersectObjects( scene.children ,true);

        if ( intersects.length > 0 ) {

            for(let i=0;i<intersects.length;i++){
                if(intersects[i].object instanceof THREE.Mesh && intersects[ i ].object.isStar)
                {
                    selectObj=intersects[ i ].object;
                    break;
                }
            }
            if(!selectObj)return;



            // let ghost = new THREE.Mesh(selectObj.geometry, new THREE.MeshBasicMaterial({color:0xcceeff,transparent:true, opacity:0.1}));
            // ghost.scale.set(1.03,1.03,1.03);
            // selectObj.add(ghost);
            //
            // let ghost1 = ghost.clone();
            // ghost1.scale.set(1.06,1.06,1.06);
            // selectObj.add(ghost1);
            //
            // let ghost2 = ghost.clone();
            // ghost2.scale.set(1.1,1.1,1.1);
            // selectObj.add(ghost2);

            // camera.lookAt(selectObj.position)
            //
            // new TWEEN.Tween( camera.position ).to( selectObj.position, 1000 )
            //     .easing( TWEEN.Easing.Elastic.Out).start().onComplete(function(){
            //     //selectMesh=intersects[ 0 ].object;
            // });
        }

}

export default Galaxy
