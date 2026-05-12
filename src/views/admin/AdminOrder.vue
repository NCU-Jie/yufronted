<template>
  <div style="padding: 20px;">
    <h3 style="margin-bottom: 20px;">预约管理</h3>

    <!-- 搜索 -->
    <div style="margin-bottom: 20px; display: flex; align-items: center; justify-content: center; gap: 10px;">
      <el-input
        v-model="bookName"
        placeholder="请输入书名"
        style="width: 300px;"
        clearable
        @keyup.enter.native="loadReserves"
      />
      <el-select v-model="statusFilter" placeholder="预约状态" clearable style="width: 150px;" @change="loadReserves">
        <el-option label="预约中" :value="0"></el-option>
        <el-option label="已完成" :value="1"></el-option>
        <el-option label="已取消" :value="2"></el-option>
        <el-option label="待领取" :value="3"></el-option>
      </el-select>
      <el-button type="primary" @click="loadReserves">搜索</el-button>
      <el-button @click="resetSearch">重置</el-button>
    </div>

    <!-- 列表 -->
    <el-table :data="reserveList" border style="width: 100%;" v-loading="loading">
      <el-table-column label="序号" align="center" width="80">
        <template slot-scope="scope">
          {{ (reservePage - 1) * reservePageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="封面" prop="imgUrl" align="center" width="120">
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
            无图片
          </div>
        </template>
      </el-table-column>
      <el-table-column label="书名" prop="bookName" align="center" />
      <el-table-column label="作者" prop="author" align="center" />
      <el-table-column label="读者姓名" prop="readerName" align="center" />
      <el-table-column label="预约时间" prop="reserveTime" align="center" width="180" />
      <el-table-column label="状态" align="center" width="120">
        <template slot-scope="scope">
          <el-tag type="warning" v-if="scope.row.status === 0">预约中</el-tag>
          <el-tag type="success" v-else-if="scope.row.status === 1">已完成</el-tag>
          <el-tag type="info" v-else-if="scope.row.status === 2">已取消</el-tag>
          <el-tag type="danger" v-else-if="scope.row.status === 3">待领取</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="通知时间" prop="notifyTime" align="center" width="180">
        <template slot-scope="scope">
          {{ scope.row.notifyTime || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="领取截止时间" prop="pickupDeadline" align="center" width="180">
        <template slot-scope="scope">
          {{ scope.row.pickupDeadline || '-' }}
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
            type="primary"
            @click="confirmPickup(scope.row)"
            v-if="scope.row.status === 3"
          >
            确认领取
          </el-button>
          <el-button
            size="mini"
            type="info"
            @click="cancelPickup(scope.row)"
            v-if="scope.row.status === 3"
          >
            取消领取
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
          <p><strong>分类：</strong>{{ currentBook.category }}</p>
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
import { getReservePage, completeReserve as apiCompleteReserve, adminCancelReserve, deleteReserve, adminConfirmPickup, adminCancelPickup, getAdminBookById } from '@/api/admin';

export default {
  name: 'AdminOrder',
  data() {
    return {
      bookName: '',
      loading: false,
      reserveList: [],
      reservePage: 1,
      reservePageSize: 10,
      reserveTotal: 0,
      bookDetailDialogVisible: false,
      currentBook: null,
      statusFilter: ''
    }
  },
  mounted() {
    this.loadReserves();
  },
  methods: {
    // 加载预约列表
    async loadReserves() {
      this.loading = true;
      try {
        const params = {
          page: this.reservePage,
          pageSize: this.reservePageSize
        };
        if (this.bookName) {
          params.bookName = this.bookName;
        }
        if (this.statusFilter !== '' && this.statusFilter !== null) {
          params.status = this.statusFilter;
        }
        const res = await getReservePage(params);
        if (res.code === 1 || res.code === 200) {
          this.reserveList = res.data.records || [];
          this.reserveTotal = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '加载预约列表失败');
        }
      } catch (error) {
        this.$message.error('加载预约列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    // 完成预约
    async completeReserve(row) {
      try {
        await this.$confirm('确认完成该预约吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        const res = await apiCompleteReserve(row.id);
        if (res.code === 1 || res.code === 200) {
          this.$message.success('完成预约成功');
          this.loadReserves();
        } else {
          this.$message.error(res.msg || '完成预约失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('完成预约失败');
          console.error(error);
        }
      }
    },

    // 取消预约
    async cancelReserve(row) {
      try {
        await this.$confirm('确认取消该预约吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        const res = await adminCancelReserve(row.id);
        if (res.code === 1 || res.code === 200) {
          this.$message.success('取消预约成功');
          this.loadReserves();
        } else {
          this.$message.error(res.msg || '取消预约失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('取消预约失败');
          console.error(error);
        }
      }
    },

    // 确认领取
    async confirmPickup(row) {
      try {
        await this.$confirm('确认用户已领取图书吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        const res = await adminConfirmPickup(row.id);
        if (res.code === 1 || res.code === 200) {
          this.$message.success('确认领取成功');
          this.loadReserves();
        } else {
          this.$message.error(res.msg || '确认领取失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('确认领取失败');
          console.error(error);
        }
      }
    },

    // 取消领取
    async cancelPickup(row) {
      try {
        await this.$confirm('确认取消该领取吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        const res = await adminCancelPickup(row.id);
        if (res.code === 1 || res.code === 200) {
          this.$message.success('取消领取成功');
          this.loadReserves();
        } else {
          this.$message.error(res.msg || '取消领取失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error('取消领取失败');
          console.error(error);
        }
      }
    },

    // 删除预约
    async deleteReserve(id) {
      try {
        await this.$confirm('确认删除该预约记录吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        const res = await deleteReserve(id);
        if (res.code === 1 || res.code === 200) {
          this.$message.success('删除成功');
          this.loadReserves();
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

    // 显示图书详情
    async showBookDetail(row) {
      try {
        const res = await getAdminBookById(row.bookId);
        if (res.code === 1 || res.code === 200) {
          this.currentBook = res.data;
          this.bookDetailDialogVisible = true;
        } else {
          this.$message.error(res.msg || '加载图书详情失败');
        }
      } catch (error) {
        this.$message.error('加载图书详情失败');
        console.error(error);
      }
    },

    // 获取图片完整URL
    getImageUrl(imgUrl) {
      if (!imgUrl) return '';
      const cleanUrl = imgUrl.replace(/[`'"]/g, '');
      return 'http://localhost:8080' + cleanUrl;
    },

    // 分页大小改变
    handleReserveSizeChange(val) {
      this.reservePageSize = val;
      this.reservePage = 1;
      this.loadReserves();
    },

    // 当前页改变
    handleReserveCurrentChange(val) {
      this.reservePage = val;
      this.loadReserves();
    },

    // 重置搜索条件
    resetSearch() {
      this.bookName = '';
      this.statusFilter = '';
      this.loadReserves();
    }
  }
}
</script>

<style scoped>
</style>
