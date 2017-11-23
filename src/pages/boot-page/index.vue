<template>
  <div class="boot-page">
    <nav>
      <ul>
        <router-link tag='li' v-for="i in 6" class="list-item" to='/scenes-1' key='i'>
          tab
        </router-link>
      </ul>
    </nav>
    <List-tab class="tab-list"></List-tab>
    <div class="testCss">
      <span>
        测试sassssssssssssssssssssssss
      </span>
      
    </div>
    <div class="btn btn-submit" @click="changeChartsData">click</div>

    <div class="echarts-wrapper" style="height:300px;">
      <echartsBar :echartsData="echartsData" @handleCharts="handleCharts"></echartsBar>
    </div>  


    <div class="btn btn-submit" @click="showDialog">element dialog</div>
    
    <div class="dialog-wrapper">
        <el-dialog title="收货地址" 
                   :visible.sync="dialogVisible"
                   size = "small"
                   @close="close">
            <p>1213123213</p>
            <p>12312313123</p>
        </el-dialog>
    </div>
    
  </div>
</template>

<script>
import ListTab from '@/pages/boot-page/sub-components/list.vue'
import echartsBar from 'components/echartsBar/echartsbar.vue'
import {getArrayMax} from 'assets/js/utility.js'
export default {
  name: 'bootPage',
  data () {
    return {
      msg: 'Welcome to 金融小场景',
      dialogVisible:false,
      echartsData:{}
    }
  },
  created(){
    this.echartsData = {
        xdata:["2001","2002","2003","2004","2005"],
        data:[111,222,333,444,555]
    }

    let arr = [2,3,4,1,5]
    console.log(getArrayMax(arr))
  },
  methods:{
    changeChartsData(){
        this.echartsData = {
            xdata:["2001","2002","2003","2004","2005"],
            data:[555,111,333,444,222]
        }
    },
    showDialog(){
        this.dialogVisible = true;
    },
    close(){
      console.log('弹窗关闭回调')
    },
    handleCharts(name){
      alert(name)
    }
  },
  components:{
    ListTab,
    echartsBar
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>
@import "./../../assets/css/variable.scss";
@import "./../../assets/css/mixin.scss";

.testCss{
  color:$cl-text;
  font-size: 30px;
  height: 100px;
  width: 200px;
  @include linear(#00b8fe,#1846a3,90deg);
  @extend %no-wrap;
  span{
    color:$cl-text;
  }  
}




.boot-page,nav {
  width: 1280px;
  margin: auto;
}
  nav ul{
    display: flex;
    width: 100%;
    height:55px;
  }

  nav li{
    flex:1;
    display: flex;
    align-items: center;
    justify-content: center;
    border:1px solid #333333;
  }
  .tab-list{
    display: flex;
    min-height:calc(100vh - 165px);
    align-items: center;
    justify-content: center;
  }
</style>
