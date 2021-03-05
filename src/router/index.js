import Vue from 'vue'
import Router from 'vue-router'
import webRTC from '@/components/webrtc_server'
import SayHi from '@/components/SayHi'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'webRTC',
      component: webRTC
    }
    ,
    {
      path: '/SayHi',
      name: 'SayHi',
      component: SayHi
    }
  ]
})
