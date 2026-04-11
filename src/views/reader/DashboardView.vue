<template>
  <div class="dashboard" style="padding: 20px;">
    <h2>智能图书管理系统 - 首页</h2>

    <!-- 馆藏统计卡片 -->
    <el-row :gutter="20" style="margin: 20px 0;">
      <el-col :span="8">
        <el-card class="box-card">
          <div class="text">馆藏总量</div>
          <div class="num">1260</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div class="text">可借图书</div>
          <div class="num">890</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div class="text">已借出</div>
          <div class="num">370</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最新公告 -->
    <el-card style="margin-bottom: 20px;">
      <h3>最新公告</h3>
      <el-timeline>
        <el-timeline-item timestamp="2025-04-01">图书馆周末正常开放</el-timeline-item>
        <el-timeline-item timestamp="2025-03-28">新书上架：Java 编程思想</el-timeline-item>
        <el-timeline-item timestamp="2025-03-25">借阅期限调整为 30 天</el-timeline-item>
      </el-timeline>
    </el-card>

    <!-- 图书搜索筛选区域 -->
    <el-card style="margin-bottom: 20px; padding: 20px;">
      <div class="search-filter-container">
        <!-- 分类多选 -->
        <div class="category-section">
          <span class="label">图书分类（多选）：</span>
          <el-checkbox-group v-model="selectedCategories" style="display: flex; flex-wrap: wrap; gap: 15px; align-items: center;">
            <el-checkbox label="科学技术"></el-checkbox>
            <el-checkbox label="艺术类"></el-checkbox>
            <el-checkbox label="计算机"></el-checkbox>
            <el-checkbox label="AI技术"></el-checkbox>
            <el-checkbox label="软件工程"></el-checkbox>
            <el-checkbox label="建筑学"></el-checkbox>
            <el-checkbox label="文学"></el-checkbox>
            <el-checkbox label="中国文学"></el-checkbox>
            <el-checkbox label="外国文学"></el-checkbox>
            <el-checkbox label="现代小说"></el-checkbox>
            <el-checkbox label="古代小说"></el-checkbox>
          </el-checkbox-group>
        </div>

        <!-- 搜索条件 -->
        <div style="margin-top: 20px; display: flex; gap: 15px; max-width: 500px;">
          <el-input v-model="form.bookName" placeholder="书籍名"></el-input>
          <el-input v-model="form.author" placeholder="作者"></el-input>
          <el-input v-model="form.publisher" placeholder="出版社"></el-input>
        </div>

        <!-- 搜索按钮 -->
        <div style="margin-top: 15px;">
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索图书</el-button>
          <el-button style="margin-left:10px" @click="handleReset">重置</el-button>
        </div>
      </div>
    </el-card>

    <!-- 热门推荐图书 -->
    <el-card>
      <h3>热门推荐图书</h3>
      <ul style="padding-left:20px;line-height:2">
        <li>Vue 从入门到精通</li>
        <li>SpringBoot 实战</li>
        <li>计算机网络</li>
        <li>数据结构与算法</li>
      </ul>
    </el-card>

  </div>
</template>

<script>
export default {
  name: "DashboardView",
  data() {
    return {
      selectedCategories: [],
      form: {
        bookName: "",
        author: "",
        publisher: ""
      }
    };
  },
  methods: {
    handleSearch() {
      const params = {
        categories: this.selectedCategories,
        bookName: this.form.bookName,
        author: this.form.author,
        publisher: this.form.publisher
      };
      console.log("搜索条件：", params);
      this.$message.success("搜索成功！");
    },
    handleReset() {
      this.selectedCategories = [];
      this.form = {
        bookName: "",
        author: "",
        publisher: ""
      };
      this.$message.success("已重置搜索条件");
    }
  }
};
</script>

<style scoped>
.box-card {
  text-align: center;
}
.text {
  font-size: 16px;
  color: #666;
}
.num {
  font-size: 28px;
  font-weight: bold;
  margin-top: 10px;
  color: #409eff;
}
.label {
  font-size: 15px;
  font-weight: 500;
  margin-right: 10px;
}
.category-section {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>