<template>
  <div id="app" class="app">
    <header>
      <div class="inner">
        <h1 @click="setTitle()"><img class="logo" src="./assets/img/logo.png"/>前端可视化组件{{title?' - '+title:''}}</h1>
        <div class="user-area"><a href="https://jusfoun-fe.github.io" target="_blank" >前端官网</a></div>
      </div>
    </header>

    <ul :class="isMax?'left-menu max':'left-menu'">
      <router-link v-for="item in items" class="list-item" :to="{name:item.name,params:{title:item.title}}" @click.native="setTitle" key='item' tag="li">
        <i :class="item.menuIcon"></i>{{item.title}}
      </router-link>
      <div class="handler" @click="isMax=!isMax"><i class="iconfont icon-shouqi"></i></div>
    </ul>

    <router-view @setTitle="setTitle" class="main" ></router-view>

    <footer>
       <span> 版权所有 九次方大数据信息集团有限公司</span>
      <span>Copyright 2017 by Jusfoun.com. All Right Reserved</span>
    </footer>
  </div>
</template>

<script>

  export default {
    name: 'app',
    data(){
         return {
             title:'',
             isMax:false,
         }
    },
      methods:{
        setTitle(title){
            this.title=this.$route.params.title;
        },
          max(){

          }
      },
      created(){
         // this.$on('setTitle',this.setTitle);
          //init menu
          this.items=this.$router.options.routes.filter(route=>route.isMenu).map((route)=>{
                return {
                    name:route.name,
                    title:route.component.title,
                    path:route.path,
                    menuIcon:'icon iconfont '+route.menuIcon
                }
          })
      },
      mounted(){

      }
  }
</script>
<style lang="scss"  scoped>
  @import './assets/css/index.sass';
  @import './assets/css/iconfont.css';

  .app,appmax{
    min-width:1280px;
    height: 100%;
  }
  header{
    height:55px;
    color:#fff;
    width: 100%;
    position: fixed;
    top:0;
    z-index: 10;
    background: rgba(0, 0, 0, 0.2);
    border-bottom: 1px solid #333;
  }
  .inner{
    display: flex;
    justify-content: space-between;
    margin:auto;
  }
  header h1{
    color: #fff;
    font-size: 20px;
    line-height: 55px;
  }
  .logo{
    border: 0 none;
    margin: 10px;
    width: 35px;
  }
  .left-menu{
    width:200px;
    height: calc(100% - 110px);
    border-right:1px solid #333;
    position:absolute;
    top:55px;
    z-index: 999;
    background: rgba(0,0,0,.2);
    transition: all .3s;
    transform: translate3d(0,0,0);
  }
  .left-menu.max{
    transform: translate3d(-200px,0,0);
  }
  .left-menu .handler{
    position: absolute;
    top: 10px;
    right: -25px;
    width: 25px;
    height: 25px;
    border: 1px solid #333;
    box-sizing: border-box;
    padding: 3px 3px 2px;
    cursor: pointer;
    color:rgba(255,255,255,.4);
  }
  .left-menu.max .handler{
    transform: rotate(180deg);
  }
  .left-menu .handler:hover{
    color:#ffffff;
  }
  .left-menu li{
    width: 100%;
    float: left;
    line-height: 30px;
    padding: 5px 10px;
    background: rgba(0,0,0,.2);
    border-bottom: 1px solid #333;
    color: rgba(255,255,255,.4);
    box-sizing: border-box;
    transition: all .3s;
    cursor: pointer;
  }
  .left-menu li:hover{
    background: rgba(255,255,255,.1);
  }
  .left-menu li.router-link-active{
    color:#ddd;
    background: rgba(255,255,255,.1);
  }
  .icon {
    font-size: 24px;
    margin-right: 10px;
  }
  .user-area{
    width: 100px;
    height: 55px;
    line-height: 55px;
    border-left: 1px solid #333;
    text-align: center;
    transition: all .3s;
  }
  .user-area:hover{
    background:rgba(255,255,255,.1);
    color:#fff;
    cursor: pointer;
  }
  .user-area:hover a{
    color:#fff;
  }

  .main{
    width: 100%;
    height: 100%;
    position: absolute;
    top:0;
    overflow: hidden;
    background:url('./assets/img/bg2.jpg');
    background-size: 100% 100%;
 }
  footer{
    line-height:55px;
    height:55px;
    background: rgba(0, 0, 0, 0.2);
    border-top: 1px solid #333;
    color: rgba(255,255,255,.6);
    position: fixed;
    bottom:0;
    width: 100%;
    display: flex;
    justify-content:space-around;
  }
</style>

