<template>
    <div class="txt">
        <div class="txt-c">
            <h1>需求收集</h1>
            <br>前端组件目前在需求收集阶段，
            <br>如果你有问题或者好的建议，欢迎反馈，
            <br>如果你建议被采纳有机会获取幸运奖品!!!
            <br><br><a class='btn' href="https://wj.qq.com/s/1699161/b994" target="_blank">我要反馈</a>
        </div>

    </div>
</template>

<script>
    export default {
        name: 'index',
        title:'首页',
        data () {
            return {
                msg: '前端可视化效果展示'
            }
        }
    }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

    .txt .txt-c{
        font-size: 20px;
        text-align: center;
        padding-top: 15%;
        line-height: 2em;
    }
    .txt-c h1{
        font-size: 30px;
    }
    .tip{
        color:#ddd;
        font-size: 14px;
    }
    .btn{
        display: inline-block;
        border:1px solid #666;
        padding:3px 10px;
        font-size: 16px;
        color:#999;
        transition: all .3s;
    }
    .btn:hover{
        color:#fff;
        border:1px solid #999;
        background: rgba(255,255,255,.2);
    }
</style>
