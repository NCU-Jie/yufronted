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
    <div class="announcement-section" style="margin-bottom: 20px;" v-loading="announcementLoading">
      <h3 style="margin-bottom: 15px;">最新公告</h3>
      <div v-if="announcements.length > 0">
        <div 
          v-for="item in announcements.slice(0, 3)" 
          :key="item.id" 
          class="announcement-item"
          @click="showAnnouncementDetail(item)"
        >
          <span class="announcement-title">{{ item.title }}</span>
          <span class="announcement-time">{{ formatDate(item.createTime) }}</span>
        </div>
      </div>
      <el-empty v-else description="暂无公告"></el-empty>
    </div>

    <!-- 公告详情对话框 -->
    <el-dialog 
      title="公告详情" 
      :visible.sync="detailDialogVisible" 
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentAnnouncement">
        <h4 style="margin-bottom: 15px;">{{ currentAnnouncement.title }}</h4>
        <div style="color: #909399; font-size: 12px; margin-bottom: 20px;">
          发布时间：{{ formatDate(currentAnnouncement.createTime) }}
        </div>
        <div class="announcement-content" v-html="currentAnnouncement.content"></div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

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
          <el-input v-model="searchForm.bookName" placeholder="书籍名"></el-input>
          <el-input v-model="searchForm.author" placeholder="作者"></el-input>
          <el-input v-model="searchForm.publish" placeholder="出版社"></el-input>
        </div>

        <!-- 搜索按钮 -->
        <div style="margin-top: 15px;">
          <el-button type="primary" icon="el-icon-search" @click="handleSearch">搜索图书</el-button>
          <el-button style="margin-left:10px" @click="handleReset">重置</el-button>
        </div>
      </div>
    </el-card>

    <!-- 热门推荐图书 -->
    <div class="books-section" v-loading="booksLoading">
      <h3 style="margin-bottom: 15px;">热门图书</h3>
      <div v-if="hotBooks.length > 0" class="book-list">
        <div 
          v-for="book in hotBooks" 
          :key="book.id" 
          class="book-item"
          @click="showBookDetail(book)"
        >
          <div class="book-cover">
            <el-image 
              v-if="book.imgUrl"
              :src="getImageUrl(book.imgUrl)"
              fit="cover"
              class="book-img"
            >
              <div slot="error" class="image-error">
                <i class="el-icon-picture-outline"></i>
              </div>
            </el-image>
            <div v-else class="no-image">
              <i class="el-icon-picture-outline"></i>
            </div>
          </div>
          <div class="book-info">
            <div class="book-title">{{ book.bookName }}</div>
            <div class="book-author">作者：{{ book.author }}</div>
            <div class="book-publish">出版社：{{ book.publish }}</div>
            <div class="book-stock">
              <span class="stock-label">库存：</span>
              <span :class="book.stock > 0 ? 'stock-available' : 'stock-unavailable'">
                {{ book.stock > 0 ? `${book.stock} 本可借` : '暂无库存' }}
              </span>
            </div>
          </div>
        </div>
      </div>
      <el-empty v-else description="暂无图书"></el-empty>
    </div>

    <!-- 图书详情对话框 -->
    <el-dialog 
      title="图书详情" 
      :visible.sync="bookDetailDialogVisible" 
      width="600px"
      :close-on-click-modal="false"
    >
      <div v-if="currentBook" class="book-detail">
        <div class="detail-header">
          <div class="detail-cover">
            <el-image 
              v-if="currentBook.imgUrl"
              :src="getImageUrl(currentBook.imgUrl)"
              fit="cover"
              style="width: 150px; height: 200px;"
            >
              <div slot="error" class="image-error">
                <i class="el-icon-picture-outline" style="font-size: 48px;"></i>
              </div>
            </el-image>
            <div v-else class="no-image" style="width: 150px; height: 200px;">
              <i class="el-icon-picture-outline" style="font-size: 48px;"></i>
            </div>
          </div>
          <div class="detail-info">
            <h3>{{ currentBook.bookName }}</h3>
            <p><strong>作者：</strong>{{ currentBook.author }}</p>
            <p><strong>ISBN：</strong>{{ currentBook.isbn }}</p>
            <p><strong>出版社：</strong>{{ currentBook.publish }}</p>
            <p><strong>书架编号：</strong>{{ currentBook.shelfCode }}</p>
            <p><strong>总数量：</strong>{{ currentBook.total }} 本</p>
            <p>
              <strong>可借数量：</strong>
              <span :style="{ color: currentBook.stock > 0 ? '#67C23A' : '#F56C6C' }">
                {{ currentBook.stock }} 本
              </span>
            </p>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="bookDetailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

  </div>
</template>

<script>
import { getAnnouncementPage, getBookPage, searchBooks } from '@/api/reader';
import { getStatistics } from '@/api/admin';

export default {
  name: "DashboardView",
  data() {
    return {
      selectedCategories: [],
      searchForm: {
        page: 1,
        pageSize: 10,
        bookName: "",
        author: "",
        publish: "",
        category: ""
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
      
      // 公告详情对话框
      detailDialogVisible: false,
      currentAnnouncement: null,
      
      // 热门图书
      hotBooks: [],
      booksLoading: false,
      
      // 搜索结果
      searchResults: [],
      searchTotal: 0,
      isSearching: false,
      
      // 图书详情对话框
      bookDetailDialogVisible: false,
      currentBook: null
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
        const res = await getAnnouncementPage(1, 3);
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
    
    // 显示公告详情
    showAnnouncementDetail(item) {
      this.currentAnnouncement = item;
      this.detailDialogVisible = true;
    },
    
    // 加载热门图书
    async loadHotBooks() {
      this.booksLoading = true;
      try {
        const res = await getBookPage(1, 10);
        if (res.code === 1 || res.code === 200) {
          this.hotBooks = res.data.records || [];
        } else {
          this.$message.error(res.msg || '加载图书失败');
        }
      } catch (error) {
        this.$message.error('加载图书失败');
        console.error(error);
      } finally {
        this.booksLoading = false;
      }
    },
    
    // 搜索图书
    async handleSearch() {
      this.booksLoading = true;
      try {
        // 使用searchBooks接口，传入搜索条件
        const res = await searchBooks({
          page: 1,
          pageSize: 10,
          bookName: this.searchForm.bookName || undefined,
          author: this.searchForm.author || undefined,
          publish: this.searchForm.publish || undefined,
          category: this.selectedCategories.length > 0 ? this.selectedCategories[0] : undefined
        });
        
        if (res.code === 1 || res.code === 200) {
          this.hotBooks = res.data.records || [];
          this.isSearching = true;
          if (this.hotBooks.length > 0) {
            this.$message.success(`找到 ${this.hotBooks.length} 本图书`);
          } else {
            this.$message.info('未找到匹配的图书');
          }
        } else {
          this.$message.error(res.msg || '搜索失败');
        }
      } catch (error) {
        this.$message.error('搜索出错');
        console.error(error);
      } finally {
        this.booksLoading = false;
      }
    },
    handleReset() {
      this.selectedCategories = [];
      this.searchForm = {
        page: 1,
        pageSize: 10,
        bookName: "",
        author: "",
        publish: "",
        category: ""
      };
      this.isSearching = false;
      this.loadHotBooks();
      this.$message.success("已重置搜索条件");
    },
    
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN');
    },
    
    // 获取图片完整URL
    getImageUrl(imgUrl) {
      if (!imgUrl) return '';
      // 清理URL中的特殊字符
      const cleanUrl = imgUrl.replace(/[`'"]/g, '');
      // 拼接完整URL
      return 'http://localhost:8080' + cleanUrl;
    },
    
    // 显示图书详情
    showBookDetail(book) {
      this.currentBook = book;
      this.bookDetailDialogVisible = true;
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

/* 公告列表样式 */
.announcement-section {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.announcement-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  border-bottom: 1px solid #ebeef5;
  cursor: pointer;
  transition: background-color 0.2s;
  width: 100%;
}

.announcement-item:last-child {
  border-bottom: none;
}

.announcement-item:hover {
  background-color: #f5f7fa;
  padding-left: 8px;
  padding-right: 8px;
  margin-left: -8px;
  margin-right: -8px;
}

.announcement-title {
  font-size: 14px;
  color: #303133;
}

.announcement-time {
  font-size: 12px;
  color: #909399;
  margin-left: 8px;
  white-space: nowrap;
}

/* 公告详情对话框内容样式 */
.announcement-content {
  line-height: 1.8;
  color: #606266;
  font-size: 14px;
}

.announcement-content p {
  margin-bottom: 10px;
}

/* 书籍列表样式 */
.books-section {
  background: #fff;
  padding: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.book-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.book-item {
  display: flex;
  align-items: center;
  padding: 15px;
  border: 1px solid #ebeef5;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.book-item:hover {
  border-color: #409eff;
  box-shadow: 0 2px 8px rgba(64, 158, 255, 0.2);
}

.book-cover {
  width: 80px;
  height: 100px;
  margin-right: 15px;
  flex-shrink: 0;
}

.book-img {
  width: 100%;
  height: 100%;
  border-radius: 4px;
}

.image-error,
.no-image {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 24px;
  border-radius: 4px;
}

.book-info {
  flex: 1;
}

.book-title {
  font-size: 16px;
  font-weight: 500;
  color: #303133;
  margin-bottom: 8px;
}

.book-author,
.book-publish {
  font-size: 14px;
  color: #606266;
  margin-bottom: 4px;
}

.book-stock {
  font-size: 14px;
  margin-top: 8px;
}

.stock-label {
  color: #606266;
}

.stock-available {
  color: #67C23A;
  font-weight: 500;
}

.stock-unavailable {
  color: #F56C6C;
  font-weight: 500;
}

/* 图书详情对话框内容样式 */
.book-detail {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.detail-header {
  display: flex;
  gap: 20px;
}

.detail-cover {
  width: 150px;
  height: 200px;
  position: relative;
}

.detail-info {
  text-align: left;
}

.detail-info h3 {
  font-size: 24px;
  color: #303133;
}

.detail-info p {
  font-size: 14px;
  color: #606266;
}

</style>