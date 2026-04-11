import Vue from 'vue'
import Vuex from 'vuex'
import admin from './modules/admin'    // 管理员
import reader from './modules/reader'  // 读者

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    admin,  // 管理员模块
    reader  // 读者模块
  }
})