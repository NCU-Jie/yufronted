import axios from 'axios';
import store from '@/store'; 

const request = axios.create({
    baseURL: '/api',
});

// 请求拦截器
request.interceptors.request.use(
    (config) => {
      // 确保config存在且有url属性
      if (config && config.url) {
        // 排除登录请求（更安全的判断方式）
        const isLoginRequest = /\/login$/i.test(config.url);
        
        if (!isLoginRequest) {
          // 优先从Vuex获取token，admin和reader独立
          let token = null;
          
          // 尝试从admin模块获取token
          const adminToken = store.getters['admin/adminToken'];
          if (adminToken) {
            token = adminToken;
          } else {
            // 尝试从reader模块获取token
            const readerToken = store.getters['reader/readerToken'];
            if (readerToken) {
              token = readerToken;
            }
          }
          
          // 如果Vuex中没有，尝试从localStorage获取（兼容处理）
          if (!token) {
            token = localStorage.getItem('admin_token') || localStorage.getItem('reader_token');
          }
          
          // 如果有token，添加到请求头
          if (token) {
            config.headers = config.headers || {};
            config.headers['token'] = token;
            console.log('JWT校验：已添加token到请求头');
          } else {
            console.warn('JWT校验：未找到token，请求可能失败');
          }
        }
      }
      return config;
    },
    (error) => {
      console.error('请求拦截器错误:', error);
      return Promise.reject(error);
    }
);

// 响应拦截器 - 处理401未授权错误
request.interceptors.response.use(
    (response) => {
      // 重要:返回 response.data 而不是整个 response 对象
      // 这样组件中接收到的就是 { code: 1, msg: null, data: {...} }
      return response.data;
    },
    (error) => {
      if (error.response && error.response.status === 401) {
        console.error('JWT校验：token无效或已过期');
        
        // 清除对应的token和用户信息
        const adminToken = localStorage.getItem('admin_token');
        const readerToken = localStorage.getItem('reader_token');
        
        if (adminToken) {
          store.dispatch('admin/logout');
        }
        if (readerToken) {
          store.dispatch('reader/logout');
        }
        
        // 跳转到登录页
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
);
  
export default request;