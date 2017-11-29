// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import 'babel-polyfill'
import Vue from 'vue'
import App from './App'
import router from './router'
import echarts from 'echarts'
import ElementUI from 'element-ui'
import $ from './assets/js/jquery-1.9.0.js'
Vue.config.productionTip = false
import './assets/css/index.sass'

Vue.prototype.$ = $
Vue.prototype.$echarts = echarts

Vue.config.productionTip = false
Vue.use(ElementUI);
/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
