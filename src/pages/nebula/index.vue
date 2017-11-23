<template>
    <div class="wrap" ref='wrap'></div>
</template>

<script type="text/javascript">
   import Nebula from 'assets/js/nebula.js'
   import $ from 'assets/js/jquery-1.9.0.js'

    export default {
        name: 'Nebula',
        title:'星云',

        created(){
            //this.$emit('setTitle', this.title);
            console.log(this.$route.params.title)
        },
        mounted(){

            this.$data.title='nebula';
               let opt={
                   el:this.$refs.wrap,
                   pointsCloud:[
                       {count:50000,color:0xf1d6ef,size:1,opacity:.8,offset:0.0003},
                       {count:10000,color:0x3366ff,size:1,opacity:1,offset:0.0001},
                       {count:10000,color:0xff0000,size:1,offset:0.00005},
                   ],
               }

               let nebula = new Nebula(opt);
               nebula.rotate({x:2*Math.PI},1000);

        }
    }
</script>

<style lang="scss" scoped>
 .wrap{
     width: 100%;
     height: 100%;
     background:url('./../../assets/img/bg.jpg');
 }
</style>

