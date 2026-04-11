import { Module } from 'vuex';
import { readerLogin } from "@/api/reader";
import { isValidToken } from "@/utils/auth";

interface LoginParams {
  username: string;
  password: string;
}

interface ReaderInfo {
  id: number;
  userName: string;
  name: string;
  token: string;
}

interface ReaderState {
  readerInfo: ReaderInfo | null;
}

const readerModule: Module<ReaderState, any> = {
  namespaced: true,

  state: {
    readerInfo: null
  },

  mutations: {
    SET_READER_INFO(state, payload: ReaderInfo) {
      state.readerInfo = payload;
      localStorage.setItem('reader_token', payload.token);
      
      sessionStorage.setItem('readerInfo', JSON.stringify({
        id: payload.id,
        userName: payload.userName,
        name: payload.name || ''
      }));
    },

    CLEAR_READER_INFO(state) {
      state.readerInfo = null;
      localStorage.removeItem('reader_token');
      sessionStorage.removeItem('readerInfo');
    }
  },

  actions: {
    async login({ commit }, credentials: LoginParams) {
      const res = await readerLogin(credentials);
      const responseData = res.data;

      if (responseData.code === 1 || responseData.code === 200) {
        const data = responseData.data || responseData;
        commit('SET_READER_INFO', data);
        return true;
      }
      throw new Error(responseData.msg || '登录失败');
    },

    logout({ commit }) {
      commit('CLEAR_READER_INFO');
    },

    initialize({ commit }) {
      const token = localStorage.getItem('reader_token');
      if (!token || !isValidToken(token)) {
        localStorage.removeItem('reader_token');
        return;
      }

      const sessionData = sessionStorage.getItem('readerInfo');
      if (sessionData) {
        try {
          const { id, name, userName } = JSON.parse(sessionData);
          commit('SET_READER_INFO', { id, name, userName, token });
        } catch (e) {
          sessionStorage.removeItem('readerInfo');
        }
      }
    }
  },

  getters: {
    isReaderAuthenticated: state => !!state.readerInfo?.token,
    readerToken: state => state.readerInfo?.token || null,
    readerInfo: state => state.readerInfo || null,
    readerName: state => state.readerInfo?.name || ''
  }
};

export default readerModule;