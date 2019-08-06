import Vue from 'vue'
import Router from 'vue-router'
import Login from './views/login'
import Home from './views/home'
import Pdf from './components/pdf'

Vue.use(Router)

export const constantRouterMap = [{
  path: '/', redirect: '/home'
}, {
  path: '/login',
  name: 'login',
  component: Login
}, {
  path: '/home',
  name: 'home',
  component: Home,
  children: [{
    path: '/home/pdf',
    name: 'pdf',
    component: Pdf
  }]
}]

export default new Router({
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRouterMap
})
