<template>
  <div class="my-borrow-container" style="padding: 20px;">
    <h3>我的借阅</h3>

    <el-tabs v-model="activeTab" style="margin-top: 20px;" @tab-click="handleTabClick">
      <!-- 在借图书 -->
      <el-tab-pane label="在借图书" name="borrowing">
        <el-table :data="borrowingList" border style="width:100%" v-loading="loading">
          <el-table-column label="封面" prop="imgUrl" align="center" width="100">
            <template slot-scope="scope">
              <el-image
                v-if="scope.row.imgUrl"
                :src="getImageUrl(scope.row.imgUrl)"
                fit="cover"
                style="width: 60px; height: 80px; border-radius: 4px; cursor: pointer;"
                @click="showBookDetail(scope.row)"
              >
                <div slot="error" class="image-error">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
              <div v-else class="no-image" style="cursor: pointer;" @click="showBookDetail(scope.row)">
                <i class="el-icon-picture-outline"></i>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="bookName" label="书名" />
          <el-table-column prop="borrowTime" label="借阅日期" />
          <el-table-column prop="dueTime" label="应还日期" />
          <el-table-column label="剩余天数">
            <template slot-scope="scope">
              {{ calculateDaysLeft(scope.row.dueTime) }}
            </template>
          </el-table-column>
          <el-table-column label="操作" width="150">
            <template slot-scope="scope">
              <el-button type="success" size="mini" @click="returnBook(scope.row)">
                归还
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <el-pagination
          @size-change="handleBorrowingSizeChange"
          @current-change="handleBorrowingCurrentChange"
          :current-page="borrowingPage"
          :page-size="borrowingPageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="borrowingTotal"
          style="margin-top: 20px;text-align:right;"
        >
        </el-pagination>
      </el-tab-pane>

      <!-- 已还图书 -->
      <el-tab-pane label="已还图书" name="returned">
        <el-table :data="returnedList" border style="width:100%" v-loading="loading">
          <el-table-column label="封面" prop="imgUrl" align="center" width="100">
            <template slot-scope="scope">
              <el-image
                v-if="scope.row.imgUrl"
                :src="getImageUrl(scope.row.imgUrl)"
                fit="cover"
                style="width: 60px; height: 80px; border-radius: 4px; cursor: pointer;"
                @click="showBookDetail(scope.row)"
              >
                <div slot="error" class="image-error">
                  <i class="el-icon-picture-outline"></i>
                </div>
              </el-image>
              <div v-else class="no-image" style="cursor: pointer;" @click="showBookDetail(scope.row)">
                <i class="el-icon-picture-outline"></i>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="bookName" label="书名" />
          <el-table-column prop="borrowTime" label="借阅日期" />
          <el-table-column prop="returnTime" label="实际归还日期" />
        </el-table>
        
        <!-- 分页 -->
        <el-pagination
          @size-change="handleReturnedSizeChange"
          @current-change="handleReturnedCurrentChange"
          :current-page="returnedPage"
          :page-size="returnedPageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="returnedTotal"
          style="margin-top: 20px;text-align:right;"
        >
        </el-pagination>
      </el-tab-pane>
    </el-tabs>

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
            <div v-if="currentBook.description" class="book-description">
              <strong>图书简介：</strong>
              <p>{{ currentBook.description }}</p>
            </div>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="bookDetailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getMyBorrowPage, returnBook as apiReturnBook, getBookById } from '@/api/reader';

export default {
  name: "MyBorrow",
  data() {
    return {
      activeTab: "borrowing",
      loading: false,
      
      // 在借图书
      borrowingList: [],
      borrowingPage: 1,
      borrowingPageSize: 10,
      borrowingTotal: 0,
      
      // 已还图书
      returnedList: [],
      returnedPage: 1,
      returnedPageSize: 10,
      returnedTotal: 0,
      
      // 图书详情对话框
      bookDetailDialogVisible: false,
      currentBook: null
    };
  },
  mounted() {
    this.loadBorrowingList();
  },
  methods: {
    // 显示图书详情
    async showBookDetail(book) {
      try {
        const res = await getBookById(book.bookId);
        if (res.code === 1 || res.code === 200) {
          this.currentBook = res.data;
          this.bookDetailDialogVisible = true;
        } else {
          this.$message.error(res.msg || '获取图书详情失败');
        }
      } catch (error) {
        this.$message.error('获取图书详情失败');
        console.error(error);
      }
    },
    
    // 加载在借列表 (status=0 表示借阅中)
    async loadBorrowingList() {
      this.loading = true;
      try {
        const res = await getMyBorrowPage({
          page: this.borrowingPage,
          pageSize: this.borrowingPageSize,
          status: 0
        });
        if (res.code === 1 || res.code === 200) {
          this.borrowingList = res.data.records || [];
          this.borrowingTotal = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '加载失败');
        }
      } catch (error) {
        this.$message.error('加载在借列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    // 加载已还列表 (status=1 表示已归还)
    async loadReturnedList() {
      this.loading = true;
      try {
        const res = await getMyBorrowPage({
          page: this.returnedPage,
          pageSize: this.returnedPageSize,
          status: 1
        });
        if (res.code === 1 || res.code === 200) {
          this.returnedList = res.data.records || [];
          this.returnedTotal = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '加载失败');
        }
      } catch (error) {
        this.$message.error('加载已还列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    handleTabClick(tab) {
      if (tab.name === 'borrowing') {
        this.loadBorrowingList();
      } else {
        this.loadReturnedList();
      }
    },
    
    // 计算剩余天数
    calculateDaysLeft(dueTime) {
      if (!dueTime) return '-';
      const dueDate = new Date(dueTime);
      const today = new Date();
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays > 0 ? `${diffDays}天` : '已逾期';
    },
    
    // 获取图片完整URL
    getImageUrl(imgUrl) {
      if (!imgUrl) return '';
      // 清理URL中的特殊字符（反引号、引号等）
      const cleanUrl = imgUrl.replace(/[`'"]/g, '');
      // 拼接完整URL
      return 'http://localhost:8080' + cleanUrl;
    },
    
    // 归还书籍
    async returnBook(row) {
      try {
        await this.$confirm(`确定归还该书籍吗？`, '提示', { 
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning' 
        });
        
        const res = await apiReturnBook(row.id);
        if (res.code === 1 || res.code === 200) {
          this.$message.success('归还成功');
          this.loadBorrowingList();
        } else {
          this.$message.error(res.msg || '归还失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('归还失败');
          console.error(error);
        }
      }
    },
    
    handleBorrowingSizeChange(val) {
      this.borrowingPageSize = val;
      this.loadBorrowingList();
    },
    handleBorrowingCurrentChange(val) {
      this.borrowingPage = val;
      this.loadBorrowingList();
    },
    handleReturnedSizeChange(val) {
      this.returnedPageSize = val;
      this.loadReturnedList();
    },
    handleReturnedCurrentChange(val) {
      this.returnedPage = val;
      this.loadReturnedList();
    }
  }
};
</script>

<style scoped>
.my-borrow-container h3 {
  margin-bottom: 10px;
}

.image-error,
.no-image {
  width: 60px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  color: #c0c4cc;
  font-size: 24px;
  border-radius: 4px;
}

.book-detail {
  padding: 10px;
}

.detail-header {
  display: flex;
  gap: 20px;
}

.detail-cover {
  flex-shrink: 0;
}

.detail-info h3 {
  margin-top: 0;
  margin-bottom: 15px;
  font-size: 18px;
  color: #303133;
}

.detail-info p {
  margin: 8px 0;
  font-size: 14px;
  color: #606266;
  line-height: 1.6;
}

.detail-info strong {
  color: #303133;
  font-weight: 600;
}

.book-description {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #EBEEF5;
}

.book-description strong {
  display: block;
  margin-bottom: 8px;
}

.book-description p {
  margin: 0;
  line-height: 1.8;
  color: #606266;
  font-size: 13px;
  text-align: justify;
}

.dialog-footer {
  text-align: right;
}
</style>
