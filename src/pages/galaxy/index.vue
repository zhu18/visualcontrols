<template>
    <div class="wrap" ref='wrap'></div>
</template>


<script type="text/javascript">
    import Nebula from 'assets/js/nebula.js'
    import Galaxy from 'assets/js/galaxy.js'

    export default {
        name: 'component_name',
        title:'太阳系',

        created(){
            //this.$emit('setTitle',this.title);
        },
        mounted(){
            let galaxy = new Galaxy({el:this.$refs.wrap});
        }
    }
</script>
<style>
    .star-text{
        z-index: 1;
        border:1px solid #eee;
        height: 30px;
        border-radius: 5px;
        width:100px;
        color:#fff;
        line-height: 30px;
        text-align: center;
        transition: opacity .5s,transform .5s;
        opacity: 0;
        transform: translate3d(0,-30px,0);
    }

    .star-text-hover{
        opacity: 1;
        transform: translate3d(0,0,0);
    }
</style>
<style lang="scss" scoped>
    .wrap{
      background-image:url('./../../assets/img/bg2.jpg');
    }
</style>
