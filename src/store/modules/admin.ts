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
      
      sessionStorage.setItem('adminInfo', JSON.stringify({
        id: payload.id,
        userName: payload.userName,
        name: payload.name || ''
      }));
    },

    CLEAR_ADMIN_INFO(state) {
      state.adminInfo = null;
      localStorage.removeItem('admin_token');
      sessionStorage.removeItem('adminInfo');
    }
  },

  actions: {
    async login({ commit }, credentials: LoginParams) {
      const res = await adminLogin(credentials);
      const responseData = res.data;

      if (responseData.code === 1 || responseData.code === 200) {
        const data = responseData.data || responseData;
        commit('SET_ADMIN_INFO', data);
        return true;
      }
      throw new Error(responseData.msg || '登录失败');
    },

    logout({ commit }) {
      commit('CLEAR_ADMIN_INFO');
    },

    initialize({ commit }) {
      const token = localStorage.getItem('admin_token');
      if (!token || !isValidToken(token)) {
        localStorage.removeItem('admin_token');
        return;
      }

      const sessionData = sessionStorage.getItem('adminInfo');
      if (sessionData) {
        try {
          const { id, name, userName } = JSON.parse(sessionData);
          commit('SET_ADMIN_INFO', { id, name, userName, token });
        } catch (e) {
          sessionStorage.removeItem('adminInfo');
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