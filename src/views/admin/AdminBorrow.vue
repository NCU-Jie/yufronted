<template>
  <div class="admin-borrow" style="padding: 20px;">
    <div class="header-tool" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
      <h3>借阅管理</h3>
    </div>

    <!-- 搜索栏 -->
    <el-form :inline="true" :model="searchForm" class="search-form" style="margin-bottom: 20px;">
      <el-form-item label="书名">
        <el-input v-model="searchForm.bookName" placeholder="请输入书名" clearable />
      </el-form-item>
      <el-form-item label="读者姓名">
        <el-input v-model="searchForm.readerName" placeholder="请输入读者姓名" clearable />
      </el-form-item>
      <el-form-item label="借阅状态">
        <el-select v-model="searchForm.status" placeholder="请选择状态" clearable style="width: 150px;">
          <el-option label="借阅中" :value="0" />
          <el-option label="已归还" :value="1" />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadBorrows">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 借阅列表 -->
    <el-table :data="borrowList" border stripe style="width: 100%;" highlight-current-row v-loading="loading">
      <el-table-column label="序号" align="center" width="80">
        <template slot-scope="scope">
          {{ (page - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="图书封面" align="center" width="100">
        <template slot-scope="scope">
          <img 
            :src="getImageUrl(scope.row.imgUrl)" 
            alt="图书封面"
            style="width: 60px; height: 80px; object-fit: cover; cursor: pointer;"
            @click="showBookDetail(scope.row)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="bookName" label="书名" align="center" min-width="150" />
      <el-table-column prop="readerName" label="读者姓名" align="center" width="120" />
      <el-table-column prop="borrowTime" label="借阅时间" align="center" width="180" />
      <el-table-column prop="dueTime" label="应还日期" align="center" width="180">
        <template slot-scope="scope">
          {{ scope.row.dueTime || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="returnTime" label="归还时间" align="center" width="180">
        <template slot-scope="scope">
          {{ scope.row.returnTime || '-' }}
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag type="primary" v-if="scope.row.status === 0">借阅中</el-tag>
          <el-tag type="success" v-else-if="scope.row.status === 1">已归还</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="scope">
          <el-button 
            v-if="scope.row.status === 0" 
            type="success" 
            size="mini" 
            @click="handleReturn(scope.row)"
          >
            归还
          </el-button>
          <el-button 
            type="info" 
            size="mini" 
            @click="showDetail(scope.row)"
          >
            查看详情
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

    <!-- 查看详情对话框 -->
    <el-dialog title="借阅详情" :visible.sync="detailDialogVisible" width="600px">
      <el-descriptions :column="1" border v-if="currentBorrow">
        <el-descriptions-item label="借阅ID">{{ currentBorrow.id }}</el-descriptions-item>
        <el-descriptions-item label="书名">{{ currentBorrow.bookName }}</el-descriptions-item>
        <el-descriptions-item label="读者姓名">{{ currentBorrow.readerName }}</el-descriptions-item>
        <el-descriptions-item label="借阅时间">{{ currentBorrow.borrowTime }}</el-descriptions-item>
        <el-descriptions-item label="应还日期">{{ currentBorrow.dueTime || '-' }}</el-descriptions-item>
        <el-descriptions-item label="归还时间">{{ currentBorrow.returnTime || '未归还' }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="currentBorrow.status === 0 ? 'primary' : 'success'">
            {{ currentBorrow.status === 0 ? '借阅中' : '已归还' }}
          </el-tag>
        </el-descriptions-item>
      </el-descriptions>
      <div slot="footer" class="dialog-footer">
        <el-button @click="detailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>

    <!-- 图书详情对话框 -->
    <el-dialog title="图书详情" :visible.sync="bookDetailDialogVisible" width="700px">
      <div v-if="currentBook" style="display: flex; gap: 20px;">
        <div style="flex-shrink: 0;">
          <el-image 
            :src="getImageUrl(currentBook.imgUrl)" 
            fit="cover"
            style="width: 150px; height: 200px; border-radius: 4px;"
          >
            <div slot="error" class="image-slot" style="width: 150px; height: 200px; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; border-radius: 4px;">
              <i class="el-icon-picture-outline" style="font-size: 48px;"></i>
            </div>
          </el-image>
        </div>
        <div class="detail-info" style="flex: 1;">
          <h3 style="margin-top: 0;">{{ currentBook.bookName }}</h3>
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
          <div v-if="currentBook.description" class="book-description" style="margin-top: 15px;">
            <strong>图书简介：</strong>
            <p style="margin-top: 8px; line-height: 1.6; max-height: 150px; overflow-y: auto;">{{ currentBook.description }}</p>
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
import { getBorrowPage, adminReturnBook, getAdminBookById } from '@/api/admin';

export default {
  name: "AdminBorrow",
  data() {
    return {
      searchForm: {
        bookName: '',
        readerName: '',
        status: undefined
      },
      loading: false,
      borrowList: [],
      page: 1,
      pageSize: 10,
      total: 0,
      // 详情对话框
      detailDialogVisible: false,
      currentBorrow: null,
      // 图书详情对话框
      bookDetailDialogVisible: false,
      currentBook: null
    };
  },
  mounted() {
    this.loadBorrows();
  },
  methods: {
    getImageUrl(url) {
      if (!url) return '';
      // 去除非预期字符
      const cleanUrl = url.replace(/[`'"]/g, '');
      // 如果是相对路径，拼接后端地址
      if (cleanUrl.startsWith('/')) {
        return process.env.VUE_APP_BASE_API ? `${process.env.VUE_APP_BASE_API}${cleanUrl}` : `http://localhost:8080${cleanUrl}`;
      }
      return cleanUrl;
    },
    async loadBorrows() {
      this.loading = true;
      try {
        const res = await getBorrowPage({
          page: this.page,
          pageSize: this.pageSize,
          bookName: this.searchForm.bookName || undefined,
          readerName: this.searchForm.readerName || undefined,
          status: this.searchForm.status
        });
        if (res.code === 1 || res.code === 200) {
          this.borrowList = res.data.records || [];
          this.total = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '加载失败');
        }
      } catch (error) {
        this.$message.error('加载借阅列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    resetSearch() {
      this.searchForm.bookName = '';
      this.searchForm.readerName = '';
      this.searchForm.status = undefined;
      this.page = 1;
      this.loadBorrows();
    },
    async handleReturn(row) {
      this.$confirm('确认归还该书籍？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await adminReturnBook(row.id);
          if (res.code === 1 || res.code === 200) {
            this.$message.success('归还成功');
            this.loadBorrows();
          } else {
            this.$message.error(res.msg || '归还失败');
          }
        } catch (error) {
          this.$message.error('归还操作失败');
          console.error(error);
        }
      }).catch((error) => {
        // 用户取消操作，不做处理
        if (error !== 'cancel') {
          console.error(error);
        }
      });
    },
    showDetail(row) {
      this.currentBorrow = row;
      this.detailDialogVisible = true;
    },
    async showBookDetail(row) {
      try {
        const res = await getAdminBookById(row.bookId);
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
    handleSizeChange(val) {
      this.pageSize = val;
      this.page = 1;
      this.loadBorrows();
    },
    handleCurrentChange(val) {
      this.page = val;
      this.loadBorrows();
    }
  }
};
</script>

<style scoped>
.admin-borrow {
  background: #fff;
}
</style>
