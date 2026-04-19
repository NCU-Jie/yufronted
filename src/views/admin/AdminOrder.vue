<template>
  <div style="padding: 20px;">
    <h3 style="margin-bottom: 20px;">预约与订阅管理</h3>

    <!-- Tab切换 -->
    <el-tabs v-model="activeTab" type="card">
      <!-- 预约管理 -->
      <el-tab-pane label="预约管理" name="reserve">
        <!-- 搜索 -->
        <div style="margin-bottom: 20px;">
          <el-input
            v-model="searchText"
            placeholder="搜索读者ID/书籍ID"
            style="width: 300px;"
            clearable
            @keyup.enter.native="loadReserves"
          />
        </div>

        <!-- 列表 -->
        <el-table :data="reserveList" border style="width: 100%;" v-loading="loading">
          <el-table-column label="ID" prop="id" align="center" width="80" />
          <el-table-column label="读者ID" prop="readerId" align="center" />
          <el-table-column label="书籍ID" prop="bookId" align="center" />
          <el-table-column label="预约时间" prop="reserveTime" align="center" />
          <el-table-column label="状态" align="center" width="120">
            <template slot-scope="scope">
              <el-tag type="warning" v-if="scope.row.status === 0">预约中</el-tag>
              <el-tag type="success" v-else-if="scope.row.status === 1">已完成</el-tag>
              <el-tag type="info" v-else>已取消</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" align="center" width="250">
            <template slot-scope="scope">
              <el-button
                size="mini"
                type="success"
                @click="completeReserve(scope.row)"
                v-if="scope.row.status === 0"
              >
                完成预约
              </el-button>
              <el-button
                size="mini"
                type="warning"
                @click="cancelReserve(scope.row)"
                v-if="scope.row.status === 0"
              >
                取消预约
              </el-button>
              <el-button
                size="mini"
                type="danger"
                @click="deleteReserve(scope.row.id)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          @size-change="handleReserveSizeChange"
          @current-change="handleReserveCurrentChange"
          :current-page="reservePage"
          :page-size="reservePageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="reserveTotal"
          style="margin-top: 20px;text-align:right;"
        >
        </el-pagination>
      </el-tab-pane>

      <!-- 订阅管理 -->
      <el-tab-pane label="订阅管理" name="subscribe">
        <!-- 列表 -->
        <el-table :data="subscribeList" border style="width: 100%;" v-loading="loading">
          <el-table-column label="ID" prop="id" align="center" width="80" />
          <el-table-column label="读者ID" prop="readerId" align="center" />
          <el-table-column label="书名" prop="bookName" align="center" />
          <el-table-column label="作者" prop="author" align="center" />
          <el-table-column label="备注" prop="remark" align="center" />
          <el-table-column label="订阅时间" prop="createTime" align="center" />
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
          @size-change="handleSubscribeSizeChange"
          @current-change="handleSubscribeCurrentChange"
          :current-page="subscribePage"
          :page-size="subscribePageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="subscribeTotal"
          style="margin-top: 20px;text-align:right;"
        >
        </el-pagination>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getReservePage, completeReserve as apiCompleteReserve, adminCancelReserve, deleteReserve, getSubscribePage, processSubscribe as apiProcessSubscribe, deleteSubscribe as apiDeleteSubscribe } from '@/api/admin';

export default {
  name: 'AdminOrder',
  data() {
    return {
      activeTab: 'reserve',
      searchText: '',
      loading: false,
      
      // 预约相关
      reserveList: [],
      reservePage: 1,
      reservePageSize: 10,
      reserveTotal: 0,
      
      // 订阅相关
      subscribeList: [],
      subscribePage: 1,
      subscribePageSize: 10,
      subscribeTotal: 0
    }
  },
  mounted() {
    this.loadReserves();
    this.loadSubscribes();
  },
  watch: {
    activeTab(val) {
      if (val === 'reserve') {
        this.loadReserves();
      } else {
        this.loadSubscribes();
      }
    }
  },
  methods: {
    // 加载预约列表
    async loadReserves() {
      this.loading = true;
      try {
        const res = await getReservePage({
          page: this.reservePage,
          pageSize: this.reservePageSize
        });
        if (res.code === 1 || res.code === 200) {
          this.reserveList = res.data.records || [];
          this.reserveTotal = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '加载失败');
        }
      } catch (error) {
        this.$message.error('加载预约列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    // 加载订阅列表
    async loadSubscribes() {
      this.loading = true;
      try {
        const res = await getSubscribePage(this.subscribePage, this.subscribePageSize);
        if (res.code === 1 || res.code === 200) {
          this.subscribeList = res.data.records || [];
          this.subscribeTotal = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '加载失败');
        }
      } catch (error) {
        this.$message.error('加载订阅列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    // 完成预约
    async completeReserve(row) {
      this.$confirm('确定完成该预约吗？', '提示', { type: 'warning' }).then(async () => {
        try {
          const res = await apiCompleteReserve(row.id);
          if (res.code === 1 || res.code === 200) {
            this.$message.success('预约已完成');
            this.loadReserves();
          } else {
            this.$message.error(res.msg || '操作失败');
          }
        } catch (error) {
          this.$message.error('操作失败');
          console.error(error);
        }
      });
    },
    
    // 取消预约
    async cancelReserve(row) {
      this.$confirm('确定取消该预约吗？', '提示', { type: 'warning' }).then(async () => {
        try {
          const res = await adminCancelReserve(row.id);
          if (res.code === 1 || res.code === 200) {
            this.$message.success('预约已取消');
            this.loadReserves();
          } else {
            this.$message.error(res.msg || '操作失败');
          }
        } catch (error) {
          this.$message.error('操作失败');
          console.error(error);
        }
      });
    },
    
    // 删除预约
    async deleteReserve(id) {
      this.$confirm('确定删除该预约记录吗？', '提示', { type: 'warning' }).then(async () => {
        try {
          const res = await deleteReserve(id);
          if (res.code === 1 || res.code === 200) {
            this.$message.success('删除成功');
            this.loadReserves();
          } else {
            this.$message.error(res.msg || '删除失败');
          }
        } catch (error) {
          this.$message.error('删除失败');
          console.error(error);
        }
      });
    },
    
    // 处理订阅
    async processSubscribe(row) {
      this.$confirm('确定处理该订阅吗？', '提示', { type: 'warning' }).then(async () => {
        try {
          const res = await apiProcessSubscribe(row.id);
          if (res.code === 1 || res.code === 200) {
            this.$message.success('订阅已处理');
            this.loadSubscribes();
          } else {
            this.$message.error(res.msg || '操作失败');
          }
        } catch (error) {
          this.$message.error('操作失败');
          console.error(error);
        }
      });
    },
    
    // 删除订阅
    async deleteSubscribe(id) {
      this.$confirm('确定删除该订阅记录吗？', '提示', { type: 'warning' }).then(async () => {
        try {
          const res = await apiDeleteSubscribe(id);
          if (res.code === 1 || res.code === 200) {
            this.$message.success('删除成功');
            this.loadSubscribes();
          } else {
            this.$message.error(res.msg || '删除失败');
          }
        } catch (error) {
          this.$message.error('删除失败');
          console.error(error);
        }
      });
    },
    
    handleReserveSizeChange(val) {
      this.reservePageSize = val;
      this.loadReserves();
    },
    handleReserveCurrentChange(val) {
      this.reservePage = val;
      this.loadReserves();
    },
    handleSubscribeSizeChange(val) {
      this.subscribePageSize = val;
      this.loadSubscribes();
    },
    handleSubscribeCurrentChange(val) {
      this.subscribePage = val;
      this.loadSubscribes();
    }
  }
}
</script>