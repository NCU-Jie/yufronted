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
          <el-menu-item index="/reader/reserve">我的预约</el-menu-item>
          <el-menu-item index="/reader/collection">我的收藏</el-menu-item>
          <el-menu-item index="/reader/notice" class="notice-menu-item">
            <i class="el-icon-bell"></i> 站内消息
            <el-badge :value="unreadNoticeCount" :max="99" v-if="unreadNoticeCount > 0" class="notice-badge">
            </el-badge>
          </el-menu-item>
        </el-menu>
      </div>

      <div class="header-right">
        <el-dropdown @command="handleCommand">
          <span class="el-dropdown-link">
            <i class="el-icon-user"></i>
            {{ username }}<i class="el-icon-arrow-down el-icon--right"></i>
          </span>
          <el-dropdown-menu slot="dropdown">
            <el-dropdown-item command="profile">个人中心</el-dropdown-item>
            <el-dropdown-item command="changePassword">修改密码</el-dropdown-item>
            <el-dropdown-item command="feedback">我要反馈</el-dropdown-item>
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
    ...mapGetters('reader', ['readerInfo', 'unreadNoticeCount']),
    username() {
      return this.readerInfo?.name || '用户';
    }
  },
  methods: {
    handleCommand(command) {
      if (command === 'profile') {
        this.$router.push('/reader/profile');
      } else if (command === 'changePassword') {
        this.$router.push('/reader/change-password');
      } else if (command === 'feedback') {
        this.$router.push('/reader/feedback');
      } else if (command === 'logout') {
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

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
}

.logo {
  font-size: 18px;
  font-weight: bold;
  color: white;
}

.top-menu {
  background-color: transparent;
  border-bottom: none;
}

.top-menu .el-menu-item {
  color: white;
}

.top-menu .el-menu-item:hover,
.top-menu .el-menu-item.is-active {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
}

.header-right {
  color: white;
  cursor: pointer;
}

.el-dropdown-link {
  color: white;
  cursor: pointer;
}

/* 站内消息菜单项样式 */
.notice-menu-item {
  position: relative;
}

.notice-badge {
  margin-left: 8px;
}

.notice-badge :deep(.el-badge__content) {
  background-color: #f56c6c;
  border: none;
}

.main-box {
  background-color: #f5f7fa;
  padding: 0;
}
</style>