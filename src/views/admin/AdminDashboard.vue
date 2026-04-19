<template>
  <div class="admin-dashboard" style="padding: 20px;">
    <h2 style="margin-bottom: 20px;">管理控制台</h2>

    <!-- 数据概览卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">总用户数</div>
          <div class="stat-num"></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">馆藏书籍</div>
          <div class="stat-num"></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">待处理预约</div>
          <div class="stat-num"></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">待处理订阅</div>
          <div class="stat-num"></div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">公告总数</div>
          <div class="stat-num"></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">读者反馈</div>
          <div class="stat-num"></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">借阅记录</div>
          <div class="stat-num"></div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">今日登录</div>
          <div class="stat-num"></div>
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
export default {
  name: "AdminDashboard",
  data() {
    return {
    
    };
  },
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