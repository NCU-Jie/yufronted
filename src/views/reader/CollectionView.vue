<template>
  <div style="padding: 20px;">
    <h3>我的收藏</h3>

    <el-table :data="collectList" border style="width:100%;margin-top:20px" v-loading="loading">
      <el-table-column label="ID" prop="id" width="80" />
      <el-table-column label="书名" prop="bookName" />
      <el-table-column label="作者" prop="author" />
      <el-table-column label="ISBN" prop="isbn" />
      <el-table-column label="出版社" prop="publish" />
      <el-table-column label="书架位置" prop="shelfCode" />
      <el-table-column label="库存状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.stock > 0 ? 'success' : 'warning'">
            {{ scope.row.stock > 0 ? '可借' : '不可借' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" width="300">
        <template slot-scope="scope">
          <!-- 借阅 -->
          <el-button
            size="mini"
            type="primary"
            @click="borrow(scope.row)"
            :disabled="scope.row.stock <= 0"
          >
            借阅
          </el-button>

          <!-- 预约 -->
          <el-button
            size="mini"
            type="warning"
            @click="reserve(scope.row)"
            :disabled="scope.row.stock > 0"
          >
            预约
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
import { getBookPage, borrowBook, reserveBook } from '@/api/reader';

export default {
  name: "MyCollect",
  data() {
    return {
      loading: false,
      // 收藏列表(这里使用书籍列表模拟,实际应该有专门的收藏接口)
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
    // 加载收藏列表(暂时用书籍列表代替)
    async loadCollectList() {
      this.loading = true;
      try {
        const res = await getBookPage(this.page, this.pageSize);
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
    
    // 借阅
    async borrow(row) {
      this.$confirm(`确定借阅《${row.bookName}》吗？`, '提示', { type: 'warning' }).then(async () => {
        try {
          const res = await borrowBook(row.id);
          if (res.code === 1 || res.code === 200) {
            this.$message.success(`《${row.bookName}》借阅成功`);
            this.loadCollectList();
          } else {
            this.$message.error(res.msg || '借阅失败');
          }
        } catch (error) {
          this.$message.error('借阅失败');
          console.error(error);
        }
      });
    },

    // 预约
    async reserve(row) {
      this.$confirm(`确定预约《${row.bookName}》吗？`, '提示', { type: 'warning' }).then(async () => {
        try {
          const res = await reserveBook(row.id);
          if (res.code === 1 || res.code === 200) {
            this.$message.success(`《${row.bookName}》预约成功`);
          } else {
            this.$message.error(res.msg || '预约失败');
          }
        } catch (error) {
          this.$message.error('预约失败');
          console.error(error);
        }
      });
    },

    // 取消收藏
    cancelCollect(row) {
      this.$confirm(`确定取消收藏《${row.bookName}》吗？`, '提示', { type: 'warning' }).then(() => {
        // TODO: 调用取消收藏接口
        this.collectList = this.collectList.filter((item) => item.id !== row.id);
        this.$message.success(`已取消收藏《${row.bookName}》`);
      });
    },
    
    handleSizeChange(val) {
      this.pageSize = val;
      this.loadCollectList();
    },
    handleCurrentChange(val) {
      this.page = val;
      this.loadCollectList();
    }
  }
};
</script>