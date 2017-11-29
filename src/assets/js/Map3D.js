/**
 * Created by jusfoun-fe.github.io on 2017/11/19.
 * 3D地图
 */
import Detector from './Detector.js'
import * as THREE from './three.js'
import TWEEN from './tween.min.js'
import './OrbitControls.js'
import './Event.js'
import Stats from './stats.js'


var extrudeOption = {
    amount : 2,
    bevelThickness : 1,
    bevelSize : .2,
    bevelEnabled : false,
    bevelSegments : 5,
    curveSegments :1,
    steps : 1,
};


export default class Map3D{
    constructor(o){
        if(!Detector.webgl) {
            console.log('不支持webgl,停止渲染.');
            return;
        }
        let opt={
            /*外部参数*/
            el:document.body,
            hasStats:true,      //是否显示性能面板
            hasControls:true,   //用户是否能控制视角
            autoRotate:false,   //是否自动旋转视角
            hasLoadEffect:false,   //是否有加载效果
            data:null,          //地图geojson数据
            userData:[],        //地图用户数据[{name:'北京',value:,color:0xff3333}...]
            debugger:false,     //调试模式
            color:0x3366ff,     //地图颜色
            lineColor:0xffffff, //线颜色
            opacity:1,          //地图透明度
            hasPhong:true,      //是否反光材质
            shininess:100,      //反光材质光滑度
            onresize:null,
            onmouseover:null,
            onmouseout:null,
            onmousedown:null,

            /*内部对象*/
            mapObject:null,//地图对象-内部调用
            scene:null,//场景对象-内部调用
            camera:null,//相机对象-内部调用
            renderer:null,//渲染器对象-内部调用
            stats:null,//性能对象-内部调用
            controls:null,//控制器对象-内部调用
            areaCount:0,
            _w:0,
            _h:0,
            __event:null,//事件对象
        }
        Object.assign(this,opt,o)
        if(!this.data)
        {
            console.warn('Map3D no data.')
            return;
        }
        this._w=this.el.offsetWidth;
        this._h=this.el.offsetHeight;
        this.init()
        this.initEvent()
    }
    init(){
        this.el.innerHTML='';
        this.scene = new THREE.Scene({antialias:true});
        this.camera = new THREE.PerspectiveCamera(70, this._w/this._h, 1, 10000);
        this.renderer = new THREE.WebGLRenderer({alpha:true});
        this.camera.position.set(0,40,0);

        //this.camera.position.set(4.5,30.6,21.08)
        this.camera.lookAt(this.scene.position);
        //this.renderer.setClearColor(new THREE.Color(0x000000));
        this.renderer.setSize(this._w,this._h);

        this.hasStats && this.initStats()
        this.hasControls && this.initControls()

        this.scene.add(new THREE.AmbientLight(0x333333));
        var dirLight = new THREE.DirectionalLight(0xffffff);
        dirLight.position.set(0,50,50);
        this.scene.add(dirLight);

        var spotLight = new THREE.SpotLight(this.color);
        spotLight.position.set(0,50,0);
        spotLight.intensity = 0.7;
        spotLight.target = this.scene;
        this.scene.add(spotLight);

        if(this.debugger)
        {
            var helper = new THREE.DirectionalLightHelper( dirLight, 5 );
            this.scene.add( helper );
            var spotLightHelper = new THREE.SpotLightHelper( spotLight );
            this.scene.add( spotLightHelper );
            var size = 100;
            var divisions = 40;
            var gridHelper = new THREE.GridHelper( size, divisions );
            this.scene.add( gridHelper );
            var axisHelper = new THREE.AxisHelper( 5 );
            this.scene.add( axisHelper );
        }

        this.mapObject = new THREE.Group();
        this.data.features.forEach((item)=>{
            //地图属性 & 用户属性合并
            let itemUserData = this.userData.find(val=> val.name==item.properties.name );
            Object.assign(item.properties,itemUserData);
            this.createArea(item,this.mapObject);
        })

        //根据数据中心位置偏移
        if(this.data.cp){
            this.mapObject.position.set(-this.data.cp[0],0,this.data.cp[1]);
        }
        //this.mapObject.position.add(new THREE.Vector3(0,0,-5));
      //  new TWEEN.Tween( this.mapObject.scale ).to({x: 2,y:2,z:2}, 600).start()
        //this.mapObject.position.set(-105,0,37);
        this.mapObject.rotateX(-.5*Math.PI);
        this.scene.add(this.mapObject);

        this.scene.add(this.camera);
        this.el.appendChild(this.renderer.domElement);
        this.renderScene();
    }
    setCameraPosition(ps,time,delay){
        let v=new THREE.Vector3(ps.x,ps.y,ps.z);
        if(typeof time =='number'){
            let to = this.camera.position.clone().add(v);
            new TWEEN.Tween(this.camera.position).to(to,time).delay(delay||0).start();
        }
        else
            this.camera.position.add(v);
    }
    setPosition(p){
        let x=p.x||0;
        let y=p.y||0;
        let z=p.z||0;

        let to=this.camera.position.clone().add(new THREE.Vector3(x,y,z));

        console.log(this.camera.position);
        console.log(to);
        new TWEEN.Tween(this.camera.position).to(to,1000).start()
            //this.mapObject.position.add(new THREE.Vector3(x,y,z));
    }
    dispose(){
        this.el.innerHTML='';
        this.__event.dispose();
    }
    disable(disable){
        disable=typeof disable=='undefined'?true:disable;
        if(disable){
            this.el.style.pointerEvents='none';
            this.__event.enable=!disable;
        }
        else
        {
            this.el.style.pointerEvents='';
            this.__event.enable=!disable;
        }
    }
    initEvent(){
        this.__event=new THREE.Event(this);
    }
    initControls(){
        this.controls = new THREE.OrbitControls(this.camera,this.renderer.domElement);
        this.controls.userPan=false;
        this.controls.autoRotate=this.autoRotate;
        this.controls.userPanSpeed=0.5;
        return this.controls;
    }
    initStats(){
        this.stats = new Stats();
        this.stats.setMode(0);//0:fps |1:ms
        this.stats.domElement.style.position='absolute';
        this.stats.domElement.style.top='70px';
        this.stats.domElement.style.right='0px';
        this.el.appendChild(this.stats.domElement);
        return this.stats;
    }
    load(path){
        $.getJSON(path,(data)=>{
            this.mapObject.remove(...this.mapObject.children);
            this.data=data;
            this.data.features.forEach((item)=>{
                //地图属性 & 用户属性合并
                let itemUserData = this.userData.find(val=> val.name==item.properties.name );
                Object.assign(item.properties,itemUserData);
                this.createArea(item,this.mapObject);
            })
        });
    }
    setAreaData(area,userData){
        if(typeof area == 'string')
            area=this.findArea(area);
        if(userData.name)
        {
            delete userData.name;
            console.warn('setAreaData():No name parameters are required')
        }
        //重新构造区域
        let item=this.data.features.find(item=>item.properties.name==area.name);
        if(item){
            this.reomveArea(area);
            Object.assign(item.properties,userData);
            this.createArea(item,this.mapObject);
        }
    }
    reomveArea(area){
        if(typeof area == 'string')
            area=this.findArea(area);
        this.mapObject.remove(area);
    }
    findArea(areaName){
        return this.mapObject.getObjectByName(areaName);
    }
    renderScene(){
        this.renderer.clear();
        requestAnimationFrame(this.renderScene.bind(this));

        TWEEN.update();
        if(this.hasControls)
            this.controls.update();
        if(this.hasStats)
            this.stats.update();

        this.renderer.render(this.scene, this.camera);

    }
    _onResize(){

    }
    _onMouseMove(intersects){
        if ( intersects.length > 0 ) {
            if(this.selectedMap)
            {
                new TWEEN.Tween( this.selectedMap.position ).to({z: 0,}, 100).start()
                if(this.onmouseout)
                    this.onmouseout(this.selectedMap)
                this.selectedMap = null;
            }
            for(let i=0;i<intersects.length;i++){
                if(intersects[i].object && intersects[i].object.type=='Mesh' && intersects[i].object.parent.userData.type && intersects[i].object.parent.userData.type=='Map')
                {
                    this.selectedMap=intersects[ i ].object.parent;
                    break;
                }
            }
            if(this.selectedMap)
            {
                this.selectedMap.position.z=1;
                new TWEEN.Tween( this.selectedMap.position ).to({z: 1,}, 100).start()
                if(this.onmouseover)
                    this.onmouseover(this.selectedMap)
            }
        } else {
            if(this.selectedMap){
                new TWEEN.Tween( this.selectedMap.position ).to({z: 0,},100).start()
                if(this.onmouseout)
                    this.onmouseout(this.selectedMap)
            }
        }
    }
    _onMouseDown(intersects){

        if ( intersects.length > 0 ) {
            for(let i=0;i<intersects.length;i++){
                if(intersects[i].object && intersects[i].object.type=='Mesh' && intersects[i].object.parent.userData.type && intersects[i].object.parent.userData.type=='Map')
                {
                    this.selectedMap=intersects[ i ].object.parent;
                    break;
                }
            }
            if(this.selectedMap)
            {
                this.debugger && console.log(this.selectedMap)
                if(this.onmousedown)
                    this.onmousedown(this.selectedMap)
            }
        }
    }
    //创建地图区域块
    //结构 parentObj:[{g:[mesh,line]},{g:[mesh,line]}...]
    createArea(item,parentObj){
        //item.properties 一般有{id,name,cp,childNum,color,value}

        if(item.geometry.type=='Polygon'){
            this.addMesh(item.properties,
                item.geometry.coordinates[0],
                parentObj);
        }
        else if (item.geometry.type=='MultiPolygon') {
            for(var i=0;i<item.geometry.coordinates.length;i++){
                this.addMesh(item.properties,
                    item.geometry.coordinates[i][0],
                    parentObj);
            }
        }
    }
    addMesh(pros,coord,parentObj){
        let g=new THREE.Group();
        g.name=pros.name;
        Object.assign(g.userData,pros,{type:'Map'});
        let mesh=this.GetMesh(coord,pros);
        let line=this.GetLine(coord,pros);
        g.add(mesh);
        g.add(line);
        //
        // if(this.hasLoadEffect){
        //     g.position.z=300;
        //     new TWEEN.Tween( g.position ).to( {
        //         z: 0,}, 300+(this.areaCount++*80) )
        //         .easing( TWEEN.Easing.Elastic.In)
        //         .start().onComplete(function(){
        //
        //     });
        // }
        parentObj.add(g);
    }
    //创建立体块
    GetMesh(coord,pros){
        var pts=this.getGeoPoints(coord);
        var geo=this.getExtrudeGeometry(pts,extrudeOption);
        return this.getGeoMesh(geo,pros);
    }
    //创建块的边缘线
    GetLine(coord,pros){
        var pts=this.getGeoPoints(coord);
        var lines = new THREE.Geometry();

        for(let i=0,l=pts.length;i<l;i++){
            lines.vertices.push(new THREE.Vector3(pts[i].x,pts[i].y,2 + 0.02));
        }

        var material = new THREE.LineBasicMaterial({
            opacity: 1.0,
            linewidth: 2,
            color:this.lineColor
        });
        return new THREE.Line(lines, material);
    }
    //得到顶点数据
    getGeoPoints(coordinates){
        var pts=[];
        for(var i=0,l=coordinates.length;i<l;i++){
            pts.push(new THREE.Vector2(coordinates[i][0],coordinates[i][1]));
        }
        return pts;
    }
    //拉伸块高度
    getExtrudeGeometry(pts,extrudeOption){
        var shape = new THREE.Shape(pts);
        var geo = new THREE.ExtrudeGeometry(shape, extrudeOption);
        return geo;
    }
    //创建平面块
    getGeoMesh(geo,pros){
        let mateOption={};
        mateOption.color = colorToHex(pros.color) || this.color || Math.random() * 0xffffff;
        mateOption.shininess= pros.shininess || 100;
        mateOption.transparent= true;
        mateOption.opacity = typeof pros.opacity =='undefined' ? this.opacity : pros.opacity;

        var geoMesh=null;
        if(this.hasPhong)
            geoMesh = new THREE.Mesh(geo, new THREE.MeshPhongMaterial(mateOption));
        else
            geoMesh = new THREE.Mesh(geo, new THREE.MeshLambertMaterial(mateOption));
        //var geoMesh = THREE.SceneUtils.createMultiMaterialObject(geo,[new THREE.MeshPhongMaterial(mateOption),new THREE.MeshBasicMaterial({wireframe:true,color:0xffffff,transparent:true,opacity:0.35})])
        return geoMesh;
    }

}

//颜色格式化 '#999999','rgb','hsl',0x999999
function colorToHex(color){
    if(typeof color=="string" )
    {
        if(color.indexOf('#')!=-1)
            color = parseInt(color.replace('#',''),16);
        else
            color = new THREE.Color(color).getHex();
    }
    return color;
}



THREE.Object3D.prototype.lookAtWorld = function( vector ) {
    vector = vector.clone();
    this.parent.worldToLocal( vector );
    this.lookAt( vector );
};

THREE.Object3D.prototype.worldToLocal = function ( vector ) {
    if ( !this.__inverseMatrixWorld ) this.__inverseMatrixWorld = new THREE.Matrix4();
    return  vector.applyMatrix4( this.__inverseMatrixWorld.getInverse( this.matrixWorld ));
};
