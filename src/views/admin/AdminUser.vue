<template>
  <div style="padding: 20px;">
    <h3 style="margin-bottom: 20px;">用户管理</h3>

    <!-- 搜索栏 -->
    <el-form :inline="true" class="search-form" style="margin-bottom: 20px;">
      <el-form-item label="账号">
        <el-input v-model="searchForm.username" placeholder="请输入账号" clearable />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="searchForm.name" placeholder="请输入姓名" clearable />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadReaders">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 用户列表 -->
    <el-table :data="readerList" border style="width: 100%;" v-loading="loading">

      <el-table-column label="用户名" prop="username" align="center" />
      <el-table-column label="姓名" prop="name" align="center" />
      <el-table-column label="状态" align="center" width="120">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.status === 1">启用</el-tag>
          <el-tag type="danger" v-else>禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="创建时间" prop="createTime" align="center" />
      <el-table-column label="操作" align="center" width="250">
        <template slot-scope="scope">
          <el-button
            size="mini"
            :type="scope.row.status === 1 ? 'warning' : 'success'"
            @click="toggleStatus(scope.row)"
          >
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button
            type="danger"
            size="mini"
            @click="deleteReader(scope.row.id)"
          >
            删除
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
import { getReaderPage, updateReaderStatus, deleteReader } from '@/api/admin';

export default {
  name: "AdminUser",
  data() {
    return {
      searchForm: {
        username: '',
        name: ''
      },
      loading: false,
      readerList: [],
      page: 1,
      pageSize: 10,
      total: 0
    };
  },
  mounted() {
    this.loadReaders();
  },
  methods: {
    async loadReaders() {
      this.loading = true;
      try {
        const res = await getReaderPage({
          page: this.page,
          pageSize: this.pageSize,
          username: this.searchForm.username || undefined,
          name: this.searchForm.name || undefined
        });
        if (res.code === 1 || res.code === 200) {
          this.readerList = res.data.records || [];
          this.total = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '加载失败');
        }
      } catch (error) {
        this.$message.error('加载读者列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    resetSearch() {
      this.searchForm.username = '';
      this.searchForm.name = '';
      this.page = 1;
      this.loadReaders();
    },
    async toggleStatus(row) {
      const newStatus = row.status === 1 ? 0 : 1;
      const action = newStatus === 1 ? '启用' : '禁用';
      this.$confirm(`确定要${action}该用户吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await updateReaderStatus(row.id, newStatus);
          if (res.code === 1 || res.code === 200) {
            this.$message.success(`${action}成功`);
            this.loadReaders();
          } else {
            this.$message.error(res.msg || `${action}失败`);
          }
        } catch (error) {
          this.$message.error(`${action}失败`);
          console.error(error);
        }
      });
    },
    async deleteReader(id) {
      this.$confirm("确定要删除该用户吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(async () => {
        try {
          const res = await deleteReader(id);
          if (res.code === 1 || res.code === 200) {
            this.$message.success("删除成功");
            this.loadReaders();
          } else {
            this.$message.error(res.msg || '删除失败');
          }
        } catch (error) {
          this.$message.error('删除失败');
          console.error(error);
        }
      });
    },
    handleSizeChange(val) {
      this.pageSize = val;
      this.loadReaders();
    },
    handleCurrentChange(val) {
      this.page = val;
      this.loadReaders();
    }
  }
};
</script>