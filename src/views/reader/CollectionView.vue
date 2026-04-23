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
            style="width: 60px; height: 80px; border-radius: 4px;"
            :preview-src-list="[getImageUrl(scope.row.imgUrl)]"
          >
            <div slot="error" class="image-error">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
          <div v-else class="no-image" style="width: 60px; height: 80px; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; border-radius: 4px;">
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
            @click="scope.row.stock > 0 ? borrow(scope.row) : reserve(scope.row)"
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
  </div>
</template>

<script>
import { getMyCollectList, deleteCollect, borrowBook, reserveBook } from '@/api/reader';

export default {
  name: "MyCollect",
  data() {
    return {
      loading: false,
      collectList: [],
      page: 1,
      pageSize: 10,
      total: 0
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
    
    // 借阅
    async borrow(row) {
      try {
        await this.$confirm(`确定借阅《${row.bookName}》吗？`, '提示', { 
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning' 
        });
        
        const res = await borrowBook(row.bookId);
        if (res.code === 1 || res.code === 200) {
          this.$message.success(`《${row.bookName}》借阅成功`);
          this.loadCollectList();
        } else {
          this.$message.error(res.msg || '借阅失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(error.message || '借阅失败');
        }
      }
    },

    // 预约
    async reserve(row) {
      try {
        await this.$confirm(`确定预约《${row.bookName}》吗？`, '提示', { 
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'info' 
        });
        
        const res = await reserveBook(row.bookId);
        if (res.code === 1 || res.code === 200) {
          this.$message.success(`《${row.bookName}》预约成功`);
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
</style>