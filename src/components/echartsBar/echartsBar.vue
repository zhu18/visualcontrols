<template>
    <div class="chart-wrapper" ref="chart" style="height:100%;width:100%">

    </div>
</template>

<script>
  export default {
  name: 'bar',
  props: {
    echartsData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {}
  },
  watch: {
      echartsData: {
        handler: function (val, oldVal) {
          this.initChart()
        },
        deep: true  //增加deep 观察对象的子对象变化
      }
  },
  mounted() {
    this.$nextTick(()=>{
         this.myChart = this.$echarts.init(this.$refs.chart);
      this.initChart()
    })
  },
  methods: {
   initChart() {
                            
      let option = {
          color: ['#3398DB'],
          tooltip : {
              trigger: 'axis',
              axisPointer : {
                  type : 'shadow'
              }
          },
          grid: {
              left: '3%',
              right: '4%',
              bottom: '3%',
              containLabel: true
          },
          xAxis : [
              {
                  type : 'category',
                  data : this.echartsData.xdata,
                  axisTick: {
                      alignWithLabel: true
                  }
              }
          ],
          yAxis : [
              {
                  type : 'value',
                  name:  'tes1'
              }
          ],
          series : [
              {
                  name:'直接访问',
                  type:'bar',
                  barWidth: '60%',
                  itemStyle: {
                      normal: {
                          color: (d)=> {
                              if (d.data > 0) {
                                  return new this.$echarts.graphic.LinearGradient(
                                      0, 0, 0, 1, [{
                                          offset: 0,
                                          color: '#00b8fe'
                                      }, {
                                          offset: 1,
                                          color: '#1846a3'
                                      }]
                                  )
                              } else {
                                  return new this.$echarts.graphic.LinearGradient(
                                      0, 0, 0, 1, [{
                                          offset: 0,
                                          color: '#d0bf44'
                                      }, {
                                          offset: 1,
                                          color: '#d0bc44'
                                      }]
                                  )
                              }
                          },
                          opacity: 0.6,
                          barBorderRadius: 10,
                      },
                      emphasis: {
                          opacity: 1
                      }
                  },
                  data:this.echartsData.data
              }
          ]
      }  
      this.myChart.on('click',(params) =>{
          this.$emit('handleCharts',params.name)
      })
      this.myChart.setOption(option);

    }
   
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss" scoped>

</style>
