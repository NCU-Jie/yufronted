<template>
  <div style="padding: 20px;">
    <h3 style="margin-bottom: 20px;">订阅管理</h3>

    <!-- 搜索 -->
    <div style="margin-bottom: 20px;">
      <el-input
        v-model="searchText"
        placeholder="搜索读者姓名/书名"
        style="width: 300px;"
        clearable
        @keyup.enter.native="loadSubscribes"
      />
      <el-button type="primary" @click="loadSubscribes" style="margin-left: 10px;">搜索</el-button>
    </div>

    <!-- 列表 -->
    <el-table :data="subscribeList" border style="width: 100%;" v-loading="loading">
      <el-table-column label="序号" align="center" width="80">
        <template slot-scope="scope">
          {{ (page - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="读者姓名" prop="readerName" align="center" width="120" />
      <el-table-column label="书名" prop="bookName" align="center" />
      <el-table-column label="作者" prop="author" align="center" />
      <el-table-column label="备注" prop="remark" align="center" show-overflow-tooltip />
      <el-table-column label="订阅时间" prop="createTime" align="center" width="180" />
      <el-table-column label="状态" align="center" width="120">
        <template slot-scope="scope">
          <el-tag type="warning" v-if="scope.row.status === 0">待处理</el-tag>
          <el-tag type="success" v-else>已处理</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="processSubscribe(scope.row)"
            v-if="scope.row.status === 0"
          >
            处理
          </el-button>
          <el-button
            size="mini"
            type="danger"
            @click="deleteSubscribe(scope.row.id)"
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
import { getSubscribePage, processSubscribe as apiProcessSubscribe, deleteSubscribe as apiDeleteSubscribe } from '@/api/admin';

export default {
  name: 'AdminSubscribe',
  data() {
    return {
      searchText: '',
      loading: false,
      subscribeList: [],
      page: 1,
      pageSize: 10,
      total: 0
    }
  },
  mounted() {
    this.loadSubscribes();
  },
  methods: {
    // 加载订阅列表
    async loadSubscribes() {
      this.loading = true;
      try {
        const params = {
          page: this.page,
          pageSize: this.pageSize
        };
        if (this.searchText) {
          params.keyword = this.searchText;
        }
        const res = await getSubscribePage(params);
        if (res.code === 1 || res.code === 200) {
          this.subscribeList = res.data.records || [];
          this.total = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '加载订阅列表失败');
        }
      } catch (error) {
        this.$message.error('加载订阅列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    // 处理订阅
    async processSubscribe(row) {
      try {
        await this.$confirm('确认处理该订阅申请吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        const res = await apiProcessSubscribe(row.id);
        if (res.code === 1 || res.code === 200) {
          this.$message.success('处理成功');
          this.loadSubscribes();
        } else {
          this.$message.error(res.msg || '处理失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('处理失败');
          console.error(error);
        }
      }
    },

    // 删除订阅
    async deleteSubscribe(id) {
      try {
        await this.$confirm('确认删除该订阅记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        const res = await apiDeleteSubscribe(id);
        if (res.code === 1 || res.code === 200) {
          this.$message.success('删除成功');
          this.loadSubscribes();
        } else {
          this.$message.error(res.msg || '删除失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('删除失败');
          console.error(error);
        }
      }
    },

    // 分页大小改变
    handleSizeChange(val) {
      this.pageSize = val;
      this.page = 1;
      this.loadSubscribes();
    },

    // 当前页改变
    handleCurrentChange(val) {
      this.page = val;
      this.loadSubscribes();
    }
  }
}
</script>

<style scoped>
</style>
