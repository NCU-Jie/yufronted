<template>
  <div class="admin-dashboard" style="padding: 20px;">
    <h2 style="margin-bottom: 20px;">管理控制台</h2>

    <!-- 数据概览卡片 -->
    <el-row :gutter="20" style="margin-bottom: 20px;">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">总用户数</div>
          <div class="stat-num">218</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">馆藏书籍</div>
          <div class="stat-num">1260</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">待处理预约</div>
          <div class="stat-num">8</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">待处理订阅</div>
          <div class="stat-num">5</div>
        </el-card>
      </el-col>
    </el-row>

    <el-row :gutter="20">
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">公告总数</div>
          <div class="stat-num">16</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">读者反馈</div>
          <div class="stat-num">12</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">借阅记录</div>
          <div class="stat-num">532</div>
        </el-card>
      </el-col>
      <el-col :span="6">
        <el-card class="stat-card">
          <div class="stat-title">今日登录</div>
          <div class="stat-num">43</div>
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
      menus: [
        { name: "管理员信息管理", path: "/admin/manager", icon: "el-icon-user-solid" },
        { name: "用户管理", path: "/admin/user", icon: "el-icon-user" },
        { name: "书籍管理", path: "/admin/book", icon: "el-icon-book" },
        { name: "书架管理", path: "/admin/shelf", icon: "el-icon-shelf" },
        { name: "订阅管理", path: "/admin/order", icon: "el-icon-bell" },
        { name: "预约管理", path: "/admin/order", icon: "el-icon-time" },
        { name: "订阅通知管理", path: "/admin/order", icon: "el-icon-message" },
        { name: "公告管理", path: "/admin/notice", icon: "el-icon-document" },
        { name: "读者反馈管理", path: "/admin/notice", icon: "el-icon-chat-dot-round" },
        { name: "用户行为日志", path: "/admin/log", icon: "el-icon-document-copy" },
      ],
      todoList: [
        { title: "《Vue实战》预约申请", type: "预约", user: "张三", path: "/admin/order" },
        { title: "《Java编程》订阅申请", type: "订阅", user: "李四", path: "/admin/order" },
        { title: "希望增加新书", type: "反馈", user: "王五", path: "/admin/notice" },
      ],
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