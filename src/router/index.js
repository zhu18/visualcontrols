import Vue from 'vue'
import Router from 'vue-router'
import App from '@/App'
import Index from '@/pages/index'
import nebula from '@/pages/nebula'
import galaxy from '@/pages/galaxy'
import map3d_base from '@/pages/map3d'
import map3d_event from '@/pages/map3d/event'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',

        redirect:'index',
    },
    {
      path: '/index',
      name: 'index',
        isMenu:true,
        menuIcon:'icon-shouye-copy',
      component: Index
    },
      {
          path: '/nebula',
          name: 'nebula',
          isMenu:true,
          menuIcon:'icon-sandian',
          component: nebula
      },
      {
          path: '/galaxy',
          name: 'galaxy',
          isMenu:true,
          menuIcon:'icon-xingqiu',
          component: galaxy
      },
      {
          path: '/map3d_base',
          name: 'map3d_base',
          isMenu:true,
          menuIcon:'icon-chinamap-chart',
          component: map3d_base
      },
      {
          path: '/map3d/event',
          name: 'map3d_event',
          isMenu:true,
          menuIcon:'icon-chinamap-chart',
          component: map3d_event
      },
  ]
})

// router.afterEach(function(to,form,next){
//     console.log(to)
//     console.log(App)
//     window.App=App;
//     App.$set(title,to.matched[0].components.default.title);
//     if(next)next();
// })
// router.beforeResolve(guard)
// router.afterEach(hook)
