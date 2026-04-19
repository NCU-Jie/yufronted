<template>
  <el-container style="height: 100vh">
    <!-- 顶部：标题 + 导航 + 用户 -->
    <el-header class="header-box">
      <div class="header-left">
        <div class="logo">智能图书管理系统</div>

        <!-- 顶部导航栏 ↓↓↓ 核心修改在这里 -->
        <el-menu
          mode="horizontal"
          :default-active="activeMenu"
          router
          class="top-menu"
        >
          <el-menu-item index="/reader/dashboard">首页</el-menu-item>
          <el-menu-item index="/reader/borrow">我的借阅</el-menu-item>
          <el-menu-item index="/reader/collection">我的收藏</el-menu-item>
        
        </el-menu>
      </div>

      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            <i class="el-icon-user"></i>
            {{ username }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="logout">注销登录</el-dropdown-item>
          </el-dropdown-menu>
        </el-dropdown>
      </div>
    </el-header>

    <!-- 内容区域 -->
    <el-main class="main-box">
      <router-view />
    </el-main>
  </el-container>
</template>

<script>
import { mapGetters } from 'vuex';

export default {
  name: "HomeView",
  data() {
    return {
      activeMenu: this.$route.path,
    };
  },
  computed: {
    ...mapGetters('reader', ['readerInfo']),
    username() {
      return this.readerInfo?.name || '用户';
    }
  },
  methods: {
    handleCommand(command) {
      if (command === 'logout') {
        this.logout();
      }
    },
    async logout() {
      try {
        await this.$store.dispatch('reader/logout');
        this.$message.success('注销成功');
        this.$router.push('/login');
      } catch (error) {
        this.$message.error(error.message || '注销失败');
      }
    }
  },
  watch: {
    $route(to) {
      this.activeMenu = to.path;
    }
  }
};
</script>

<style scoped>
/* 整体顶部栏 */
.header-box {
  background-color: #409eff;
  color: white;
  height: 60px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
}

/* 左侧：logo + 导航 */
.header-left {
  display: flex;
  align-items: center;
  gap: 30px;
}

.logo {
  font-size: 20px;
  font-weight: bold;
}

/* 顶部导航菜单 */
.top-menu {
  background: transparent !important;
  border: none !important;
  color: white !important;
}

.top-menu :deep(.el-menu-item) {
  color: white !important;
}

.top-menu :deep(.el-menu-item.is-active) {
  background: #3388e5 !important;
  border-bottom: 3px solid #fff !important;
}

/* 用户区域 */
.header-right {
  color: #fff;
}

.el-dropdown-link {
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.el-icon-user {
  margin-right: 5px;
}

/* 内容区域 */
.main-box {
  padding: 20px;
  background: #f5f7fa;
}
</style>