import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

Vue.config.productionTip = false
Vue.use(ElementUI);

// 在应用启动时恢复登录状态
store.dispatch('admin/initialize');
store.dispatch('reader/initialize');

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')