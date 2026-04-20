<template>
  <div style="padding: 20px;">
    <h3 style="margin-bottom: 20px;">用户行为日志</h3>

    <!-- 搜索 -->
    <div style="margin-bottom: 20px;">
      <el-input
        v-model="searchText"
        placeholder="搜索操作用户/操作内容"
        style="width: 320px;"
        clearable
        @keyup.enter.native="loadLogs"
      />
    </div>

    <!-- 日志表格 -->
    <el-table :data="logList" border style="width: 100%;" v-loading="loading">

      <el-table-column label="操作人" prop="name" align="center" />
      <el-table-column label="用户类型" prop="userType" align="center" />
      <el-table-column label="操作内容" prop="operation" align="center" show-overflow-tooltip />
      <el-table-column label="操作时间" prop="createTime" align="center" />
      
      <el-table-column label="操作" align="center" width="120">
        <template slot-scope="scope">
          <el-button
            type="danger"
            size="mini"
            @click="deleteLog(scope.row.id)"
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
import { getLogPage, deleteLog } from '@/api/admin';

export default {
  name: 'AdminLog',
  data() {
    return {
      searchText: '',
      loading: false,
      logList: [],
      page: 1,
      pageSize: 10,
      total: 0
    }
  },
  mounted() {
    this.loadLogs();
  },
  methods: {
    async loadLogs() {
      this.loading = true;
      try {
        const res = await getLogPage(this.page, this.pageSize);
        if (res.code === 1 || res.code === 200) {
          this.logList = res.data.records || [];
          this.total = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '加载失败');
        }
      } catch (error) {
        this.$message.error('加载日志列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    async deleteLog(id) {
      this.$confirm('确定删除该日志吗？', '提示', { type: 'warning' }).then(async () => {
        try {
          const res = await deleteLog(id);
          if (res.code === 1 || res.code === 200) {
            this.$message.success('删除成功');
            this.loadLogs();
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
      this.loadLogs();
    },
    handleCurrentChange(val) {
      this.page = val;
      this.loadLogs();
    }
  }
}
</script>