<template>
  <div class="admin-dashboard" style="padding: 20px;">
    <h2 style="margin-bottom: 20px;">管理控制台</h2>

    <!-- 数据概览卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="stat-card" @click.native="navigateTo('/admin/user')" style="cursor: pointer;">
          <div class="stat-title">总用户数</div>
          <div class="stat-num">{{ statistics.totalUsers }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" @click.native="navigateTo('/admin/book')" style="cursor: pointer;">
          <div class="stat-title">馆藏书籍</div>
          <div class="stat-num">{{ statistics.totalBooks }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" @click.native="navigateTo('/admin/order')" style="cursor: pointer;">
          <div class="stat-title">待处理预约</div>
          <div class="stat-num">{{ statistics.pendingReserves }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" @click.native="navigateTo('/admin/subscribe')" style="cursor: pointer;">
          <div class="stat-title">待处理订阅</div>
          <div class="stat-num">{{ statistics.pendingSubscribes }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card" @click.native="navigateTo('/admin/notice')" style="cursor: pointer;">
          <div class="stat-title">公告总数</div>
          <div class="stat-num">{{ statistics.totalAnnouncements }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" @click.native="navigateTo('/admin/feedback')" style="cursor: pointer;">
          <div class="stat-title">待处理反馈</div>
          <div class="stat-num">{{ statistics.pendingFeedbacks }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" @click.native="navigateTo('/admin/borrow')" style="cursor: pointer;">
          <div class="stat-title">在借记录</div>
          <div class="stat-num">{{ statistics.totalBorrows }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card" @click.native="navigateTo('/admin/log')" style="cursor: pointer;">
          <div class="stat-title">今日登录读者</div>
          <div class="stat-num">{{ statistics.todayLogins }}</div>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import { getAdminDashboardStatistics } from '@/api/admin';

export default {
  name: "AdminDashboard",
  data() {
    return {
      statistics: {
        totalUsers: 0,
        totalBooks: 0,
        pendingReserves: 0,
        pendingSubscribes: 0,
        totalAnnouncements: 0,
        pendingFeedbacks: 0,
        totalBorrows: 0,
        todayLogins: 0
      },
    };
  },
  mounted() {
    this.loadStatistics();
  },
  methods: {
    async loadStatistics() {
      try {
        const res = await getAdminDashboardStatistics();
        if (res.code === 1 || res.code === 200) {
          this.statistics = {
            totalUsers: res.data.totalUsers || 0,
            totalBooks: res.data.totalBooks || 0,
            pendingReserves: res.data.pendingReserves || 0,
            pendingSubscribes: res.data.pendingSubscribes || 0,
            totalAnnouncements: res.data.totalAnnouncements || 0,
            pendingFeedbacks: res.data.pendingFeedbacks || 0,
            totalBorrows: res.data.totalBorrows || 0,
            todayLogins: res.data.todayLogins || 0
          };
        } else {
          console.error('加载统计数据失败:', res.msg);
          this.$message.error(res.msg || '加载统计数据失败');
        }
      } catch (error) {
        console.error('加载统计数据失败', error);
        this.$message.error('加载统计数据失败');
      }
    },
    navigateTo(path) {
      this.$router.push(path);
    }
  }
};
</script>

<style scoped>
.stat-card {
  text-align: center;
  padding: 15px 0;
  transition: all 0.3s;
}
.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}
.stat-title {
  font-size: 14px;
  color: #666;
}
.stat-num {
  font-size: 26px;
  font-weight: bold;
  color: #409eff;
  margin-top: 10px;
}
.menu-item {
  text-align: center;
  cursor: pointer;
  transition: 0.3s;
}
.menu-item:hover {
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>