import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import WebSocketManager from './utils/websocket';

Vue.config.productionTip = false
Vue.use(ElementUI);

const app = new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app');

// 保存 app 和 router 实例供 WebSocket 使用
(window as any).__app__ = app;
(window as any).__router__ = router;

// 在应用启动时恢复登录状态
Promise.all([
  store.dispatch('admin/initialize'),
  store.dispatch('reader/initialize')
]).then(() => {
  // 初始化完成后，如果读者已登录，建立 WebSocket 连接
  const readerInfo = store.getters['reader/readerInfo'];
  if (readerInfo && readerInfo.readerId) {
    WebSocketManager.connect(readerInfo.readerId);
  }
});
