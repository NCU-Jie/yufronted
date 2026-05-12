<template>
  <div style="padding: 20px;">
    <h3>我的收藏</h3>

    <el-table :data="collectList" border style="width:100%;margin-top:20px" v-loading="loading">
      <el-table-column label="封面" width="100">
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
          <div v-else class="no-image" style="width: 60px; height: 80px; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; border-radius: 4px; cursor: pointer;" @click="showBookDetail(scope.row)">
            <i class="el-icon-picture-outline" style="font-size: 24px; color: #909399;"></i>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="书名" prop="bookName" />
      <el-table-column label="作者" prop="author" width="120" />
      <el-table-column label="库存状态" width="120">
        <template slot-scope="scope">
          <el-tag :type="scope.row.stock > 0 ? 'success' : 'warning'">
            {{ scope.row.stock > 0 ? `${scope.row.stock} 本可借` : '暂无库存' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="收藏时间" width="180">
        <template slot-scope="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="250">
        <template slot-scope="scope">
          <!-- 借阅或预约按钮 -->
          <el-button
            size="mini"
            :type="scope.row.stock > 0 ? 'primary' : 'warning'"
            @click="showBookDetail(scope.row)"
          >
            {{ scope.row.stock > 0 ? '借阅' : '预约' }}
          </el-button>

          <!-- 取消收藏 -->
          <el-button
            size="mini"
            type="danger"
            @click="cancelCollect(scope.row)"
          >
            取消收藏
          </el-button>
        </template>
      </el-table-column>
    </el-table>
    
    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="page"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      style="margin-top: 20px;text-align:right;"
    >
    </el-pagination>

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
        <el-button 
          v-if="currentBook && currentBook.stock > 0"
          type="primary" 
          @click="confirmBorrow"
        >
          借阅
        </el-button>
        <el-button 
          v-else-if="currentBook"
          type="warning" 
          @click="confirmReserve"
        >
          预约
        </el-button>
        <el-button @click="bookDetailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 借阅期限选择对话框 -->
    <el-dialog 
      title="选择借阅期限" 
      :visible.sync="borrowPeriodDialogVisible" 
      width="400px"
      :close-on-click-modal="false"
    >
      <div v-if="currentBook" style="text-align: center;">
        <p style="margin-bottom: 20px; font-size: 16px;">
          请选择《{{ currentBook.bookName }}》的借阅期限：
        </p>
        <el-radio-group v-model="selectedBorrowPeriod" size="medium">
          <el-radio-button :label="7">7天</el-radio-button>
          <el-radio-button :label="30">30天</el-radio-button>
        </el-radio-group>
        <div style="margin-top: 20px; color: #909399; font-size: 14px;">
          到期时间：{{ new Date(new Date().getTime() + selectedBorrowPeriod * 24 * 60 * 60 * 1000).toLocaleDateString('zh-CN') }}
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="borrowPeriodDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitBorrow">确认借阅</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getMyCollectList, deleteCollect, borrowBook, reserveBook, getBookById } from '@/api/reader';

export default {
  name: "MyCollect",
  data() {
    return {
      loading: false,
      collectList: [],
      page: 1,
      pageSize: 10,
      total: 0,
      // 图书详情对话框
      bookDetailDialogVisible: false,
      currentBook: null,
      // 借阅期限选择对话框
      borrowPeriodDialogVisible: false,
      selectedBorrowPeriod: 30 // 默认30天
    };
  },
  mounted() {
    this.loadCollectList();
  },
  methods: {
    // 加载收藏列表
    async loadCollectList() {
      this.loading = true;
      try {
        const res = await getMyCollectList(this.page, this.pageSize);
        if (res.code === 1 || res.code === 200) {
          this.collectList = res.data.records || [];
          this.total = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '加载失败');
        }
      } catch (error) {
        this.$message.error('加载收藏列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    // 获取图片完整URL
    getImageUrl(imgUrl) {
      if (!imgUrl) return '';
      // 清理URL中的特殊字符（反引号、引号等）
      const cleanUrl = imgUrl.replace(/[`'"]/g, '');
      // 拼接完整URL
      return 'http://localhost:8080' + cleanUrl;
    },
    
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    },
    
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
    
    // 确认借阅
    async confirmBorrow() {
      if (!this.currentBook) return;
      
      // 打开借阅期限选择对话框
      this.selectedBorrowPeriod = 30; // 默认30天
      this.borrowPeriodDialogVisible = true;
    },
    
    // 确认借阅期限并提交
    async submitBorrow() {
      if (!this.currentBook) return;
      
      try {
        // 计算到期时间
        const now = new Date();
        const dueDate = new Date(now.getTime() + this.selectedBorrowPeriod * 24 * 60 * 60 * 1000);
        const dueTime = dueDate.toISOString().slice(0, 19).replace('T', ' ');
        
        const res = await borrowBook({
          bookId: this.currentBook.id,
          dueTime: dueTime
        });
        
        if (res.code === 1 || res.code === 200) {
          this.$message.success(`《${this.currentBook.bookName}》借阅成功，到期时间：${dueTime}`);
          this.borrowPeriodDialogVisible = false;
          this.bookDetailDialogVisible = false;
          this.loadCollectList();
        } else {
          this.$message.error(res.msg || '借阅失败');
        }
      } catch (error) {
        this.$message.error(error.message || '借阅失败');
        console.error(error);
      }
    },
    
    // 确认预约
    async confirmReserve() {
      if (!this.currentBook) return;
      
      try {
        // 先显示确认对话框
        await this.$confirm(`确认预约《${this.currentBook.bookName}》吗？`, '确认预约', { 
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning' 
        });
        
        const res = await reserveBook(this.currentBook.id);
        if (res.code === 1 || res.code === 200) {
          this.$message.success(`《${this.currentBook.bookName}》预约成功`);
          this.bookDetailDialogVisible = false;
        } else {
          this.$message.error(res.msg || '预约失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(error.message || '预约失败');
        }
      }
    },
    
    // 取消收藏
    async cancelCollect(row) {
      try {
        await this.$confirm(`确定取消收藏《${row.bookName}》吗？`, '提示', { 
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning' 
        });
        
        const res = await deleteCollect(row.bookId);
        if (res.code === 1 || res.code === 200) {
          this.$message.success(`已取消收藏《${row.bookName}》`);
          this.loadCollectList();
        } else {
          this.$message.error(res.msg || '取消失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(error.message || '取消失败');
        }
      }
    },
    
    handleSizeChange(val) {
      this.pageSize = val;
      this.page = 1;
      this.loadCollectList();
    },
    handleCurrentChange(val) {
      this.page = val;
      this.loadCollectList();
    }
  }
};
</script>

<style scoped>
.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f5f7fa;
  color: #909399;
  font-size: 24px;
}

.no-image {
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  color: #909399;
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