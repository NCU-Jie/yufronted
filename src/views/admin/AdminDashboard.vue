<template>
  <div class="admin-dashboard" style="padding: 20px;">
    <h2 style="margin-bottom: 20px;">管理控制台</h2>

    <!-- 数据概览卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">总用户数</div>
          <div class="stat-num">{{ statistics.totalUsers }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">馆藏书籍</div>
          <div class="stat-num">{{ statistics.totalBooks }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">待处理预约</div>
          <div class="stat-num">{{ statistics.pendingReserves }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">待处理订阅</div>
          <div class="stat-num">{{ statistics.pendingSubscribes }}</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">公告总数</div>
          <div class="stat-num">{{ statistics.totalAnnouncements }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">读者反馈</div>
          <div class="stat-num">{{ statistics.totalFeedbacks }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">借阅记录</div>
          <div class="stat-num">{{ statistics.totalBorrows }}</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">今日登录</div>
          <div class="stat-num">{{ statistics.todayLogins }}</div>
        </el-card>
      </el-col>
    </el-row>

   

    <!-- 待处理事项 -->
    <el-card style="margin-top: 20px;">
      <h3 style="margin-bottom: 15px;">待处理事项</h3>
      <el-table :data="todoList" border style="width: 100%">
        <el-table-column prop="title" label="事项" />
        <el-table-column prop="type" label="类型" />
        <el-table-column prop="user" label="用户" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button type="primary" size="mini" @click="$router.push(scope.row.path)">
              去处理
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
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
        totalFeedbacks: 0,
        totalBorrows: 0,
        todayLogins: 0
      },
      todoList: [
        { title: '处理新书入库申请', type: '书籍管理', user: '管理员A', path: '/admin/book' },
        { title: '审核读者注册申请', type: '用户管理', user: '张三', path: '/admin/user' },
        { title: '处理逾期归还提醒', type: '借阅管理', user: '李四', path: '/admin/order' }
      ]
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
            totalFeedbacks: res.data.totalFeedbacks || 0,
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
    }
  }
};
</script>

<style scoped>
.stat-card {
  text-align: center;
  padding: 15px 0;
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