import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './styles/index.scss'

// ????
import './permission'

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import moment from 'moment'
import md5 from 'js-md5'
import 'moment/locale/zh-cn'

// echarts
import echarts from 'echarts'

// swiper
import swiper from 'swiper'
import 'swiper/dist/css/swiper.min.css'

Vue.use(ElementUI);
Vue.prototype.$md5 = md5
Vue.prototype.$moment = moment
Vue.prototype.$echarts = echarts
Vue.prototype.$swiper = swiper

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')
