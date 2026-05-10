import { Module } from 'vuex';
import { readerLogin } from "@/api/reader";
import { isValidToken } from "@/utils/auth";

interface LoginParams {
  username: string;
  password: string;
}

interface ReaderInfo {
  readerId: number;
  userName: string;
  name: string;
  token: string;
}

interface ReaderState {
  readerInfo: ReaderInfo | null;
  unreadNoticeCount: number; // 未读站内信数量
}

const readerModule: Module<ReaderState, any> = {
  namespaced: true,

  state: {
    readerInfo: null,
    unreadNoticeCount: 0
  },

  mutations: {
    SET_READER_INFO(state, payload: ReaderInfo) {
      state.readerInfo = payload;
      localStorage.setItem('reader_token', payload.token);
      
      // 修改:使用localStorage替代sessionStorage,确保持久化
      localStorage.setItem('readerInfo', JSON.stringify({
        readerId: payload.readerId,
        userName: payload.userName,
        name: payload.name || ''
      }));
    },

    CLEAR_READER_INFO(state) {
      state.readerInfo = null;
      state.unreadNoticeCount = 0;
      localStorage.removeItem('reader_token');
      localStorage.removeItem('readerInfo');
    },

    SET_UNREAD_NOTICE_COUNT(state, count: number) {
      state.unreadNoticeCount = count;
    },

    INCREMENT_UNREAD_NOTICE_COUNT(state) {
      state.unreadNoticeCount++;
    }
  },

  actions: {
    async login({ commit }, credentials: LoginParams) {
      const res: any = await readerLogin(credentials);
      // 注意: 响应拦截器已经返回了 response.data,所以 res 就是业务数据
      // res 的结构: { code: 1, msg: null, data: {...} }

      if (res.code === 1 || res.code === 200) {
        const data = res.data || res;
        commit('SET_READER_INFO', data);
        
        // 登录成功后建立 WebSocket 连接
        import('@/utils/websocket').then(({ default: WebSocketManager }) => {
          WebSocketManager.connect(data.readerId);
        });
        
        return true;
      }
      
      // 登录失败时,抛出包含后端msg的错误
      throw new Error(res.msg || '登录失败');
    },

    logout({ commit }) {
      // 退出登录时关闭 WebSocket 连接
      import('@/utils/websocket').then(({ default: WebSocketManager }) => {
        WebSocketManager.close();
      });
      commit('CLEAR_READER_INFO');
    },

    async initialize({ commit }) {
      const token = localStorage.getItem('reader_token');
      if (!token || !isValidToken(token)) {
        localStorage.removeItem('reader_token');
        localStorage.removeItem('readerInfo');
        return;
      }

      // 修改:从localStorage读取用户信息
      const readerData = localStorage.getItem('readerInfo');
      if (readerData) {
        try {
          const { readerId, name, userName } = JSON.parse(readerData);
          commit('SET_READER_INFO', { readerId, name, userName, token });
        } catch (e) {
          localStorage.removeItem('readerInfo');
          localStorage.removeItem('reader_token');
        }
      }
    },

    // 增加未读消息数
    incrementUnreadNoticeCount({ commit }) {
      commit('INCREMENT_UNREAD_NOTICE_COUNT');
    },

    // 设置未读消息数
    setUnreadNoticeCount({ commit }, count: number) {
      commit('SET_UNREAD_NOTICE_COUNT', count);
    }
  },

  getters: {
    isReaderAuthenticated: state => !!state.readerInfo?.token,
    readerToken: state => state.readerInfo?.token || null,
    readerInfo: state => state.readerInfo || null,
    readerName: state => state.readerInfo?.name || '',
    unreadNoticeCount: state => state.unreadNoticeCount
  }
};

export default readerModule;