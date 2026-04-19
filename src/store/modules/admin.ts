import { Module } from 'vuex';
import { adminLogin } from "@/api/admin";
import { isValidToken } from "@/utils/auth";

interface LoginParams {
  username: string;
  password: string;
}

interface AdminInfo {
  id: number;
  userName: string;
  name: string;
  token: string;
}

interface AdminState {
  adminInfo: AdminInfo | null;
}

const adminModule: Module<AdminState, any> = {
  namespaced: true,

  state: {
    adminInfo: null
  },

  mutations: {
    SET_ADMIN_INFO(state, payload: AdminInfo) {
      state.adminInfo = payload;
      localStorage.setItem('admin_token', payload.token);
      
      // 修改:使用localStorage替代sessionStorage,确保持久化
      localStorage.setItem('adminInfo', JSON.stringify({
        id: payload.id,
        userName: payload.userName,
        name: payload.name || ''
      }));
    },

    CLEAR_ADMIN_INFO(state) {
      state.adminInfo = null;
      localStorage.removeItem('admin_token');
      localStorage.removeItem('adminInfo');
    }
  },

  actions: {
    async login({ commit }, credentials: LoginParams) {
      const res: any = await adminLogin(credentials);
      // 注意: 响应拦截器已经返回了 response.data,所以 res 就是业务数据
      // res 的结构: { code: 1, msg: null, data: {...} }

      if (res.code === 1 || res.code === 200) {
        const data = res.data || res;
        commit('SET_ADMIN_INFO', data);
        return true;
      }
      
      // 登录失败时,抛出包含后端msg的错误
      throw new Error(res.msg || '登录失败');
    },

    logout({ commit }) {
      commit('CLEAR_ADMIN_INFO');
    },

    initialize({ commit }) {
      const token = localStorage.getItem('admin_token');
      if (!token || !isValidToken(token)) {
        localStorage.removeItem('admin_token');
        localStorage.removeItem('adminInfo');
        return;
      }

      // 修改:从localStorage读取用户信息
      const adminData = localStorage.getItem('adminInfo');
      if (adminData) {
        try {
          const { id, name, userName } = JSON.parse(adminData);
          commit('SET_ADMIN_INFO', { id, name, userName, token });
        } catch (e) {
          localStorage.removeItem('adminInfo');
          localStorage.removeItem('admin_token');
        }
      }
    }
  },

  getters: {
    isAdminAuthenticated: state => !!state.adminInfo?.token,
    adminToken: state => state.adminInfo?.token || null,
    adminInfo: state => state.adminInfo || null,
    adminName: state => state.adminInfo?.name || ''
  }
};

export default adminModule;