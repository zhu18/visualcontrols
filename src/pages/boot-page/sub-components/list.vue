<template>
  <div class="list">
      <router-link v-for="item in dataList" class="list-item" :to="item.path" key='item'>
        {{item.name}}
      </router-link>
  </div>
</template>

<script>
export default {
  name: 'list',
  data () {
    return {
      dataList: [
        {name:'小场景1',path:'scenes-1'},
        {name:'小场景2',path:'scenes-2'},
        {name:'小场景3',path:'scenes-3'},
        {name:'小场景4',path:'scenes-4'},
        {name:'小场景5',path:'scenes-5'},
        {name:'小场景6',path:'scenes-6'},
      ]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.list-item{
  width: 100px;
  height: 100px;
  line-height: 100px;
  text-align: center;
  display: inline-block;
  border:1px dashed #f90;
  font-size: 22px;
  text-decoration: none;
}
</style>
