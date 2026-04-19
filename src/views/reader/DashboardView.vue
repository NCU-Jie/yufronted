<template>
  <div class="dashboard" style="padding: 20px;">
    <h2>智能图书管理系统 - 首页</h2>

    <!-- 馆藏统计卡片 -->
    <el-row :gutter="20" style="margin: 20px 0;">
      <el-col :span="8">
        <el-card class="box-card">
          <div class="text">馆藏总量</div>
          <div class="num">{{ statistics.total }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div class="text">可借图书</div>
          <div class="num">{{ statistics.available }}</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card class="box-card">
          <div class="text">已借出</div>
          <div class="num">{{ statistics.borrowed }}</div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 最新公告 -->
    <el-card style="margin-bottom: 20px;" v-loading="announcementLoading">
      <h3>最新公告</h3>
      <el-timeline v-if="announcements.length > 0">
        <el-timeline-item 
          v-for="item in announcements" 
          :key="item.id" 
          :timestamp="formatDate(item.createTime)"
        >
          {{ item.title }}
        </el-timeline-item>
      </el-timeline>
      <el-empty v-else description="暂无公告"></el-empty>
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
    <el-card v-loading="booksLoading">
      <h3>热门推荐图书</h3>
      <ul style="padding-left:20px;line-height:2">
        <li v-for="book in hotBooks" :key="book.id">
          {{ book.bookName }} - {{ book.author }}
        </li>
      </ul>
    </el-card>

  </div>
</template>

<script>
import { getAnnouncementPage, getBookPage } from '@/api/reader';
import { getStatistics } from '@/api/admin';

export default {
  name: "DashboardView",
  data() {
    return {
      selectedCategories: [],
      form: {
        bookName: "",
        author: "",
        publisher: ""
      },
      
      // 统计数据
      statistics: {
        total: 0,
        available: 0,
        borrowed: 0
      },
      
      // 公告列表
      announcements: [],
      announcementLoading: false,
      
      // 热门图书
      hotBooks: [],
      booksLoading: false
    };
  },
  mounted() {
    this.loadStatistics();
    this.loadAnnouncements();
    this.loadHotBooks();
  },
  methods: {
    // 加载统计数据 - 使用公共统计接口
    async loadStatistics() {
      try {
        const res = await getStatistics();
        if (res.code === 1 || res.code === 200) {
          // 后端返回: { totalBooks, borrowedBooks, availableBooks }
          this.statistics.total = res.data.totalBooks || 0;
          this.statistics.borrowed = res.data.borrowedBooks || 0;
          this.statistics.available = res.data.availableBooks || 0;
        } else {
          console.error('加载统计数据失败:', res.msg);
        }
      } catch (error) {
        console.error('加载统计数据失败', error);
      }
    },
    
    // 加载公告列表
    async loadAnnouncements() {
      this.announcementLoading = true;
      try {
        const res = await getAnnouncementPage(1, 5);
        if (res.code === 1 || res.code === 200) {
          this.announcements = res.data.records || [];
        } else {
          this.$message.error(res.msg || '加载公告失败');
        }
      } catch (error) {
        this.$message.error('加载公告失败');
        console.error(error);
      } finally {
        this.announcementLoading = false;
      }
    },
    
    // 加载热门图书
    async loadHotBooks() {
      this.booksLoading = true;
      try {
        const res = await getBookPage(1, 6);
        if (res.code === 1 || res.code === 200) {
          this.hotBooks = res.data.records || [];
        } else {
          this.$message.error(res.msg || '加载热门图书失败');
        }
      } catch (error) {
        this.$message.error('加载图书失败');
        console.error(error);
      } finally {
        this.booksLoading = false;
      }
    },
    
    handleSearch() {
      const params = {
        categories: this.selectedCategories,
        bookName: this.form.bookName,
        author: this.form.author,
        publisher: this.form.publisher
      };
      console.log("搜索条件：", params);
      // TODO: 调用搜索接口
      this.$message.success("搜索功能开发中...");
    },
    handleReset() {
      this.selectedCategories = [];
      this.form = {
        bookName: "",
        author: "",
        publisher: ""
      };
      this.$message.success("已重置搜索条件");
    },
    
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN');
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