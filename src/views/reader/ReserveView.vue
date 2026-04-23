<template>
  <div class="my-reserve-container" style="padding: 20px;">
    <h3>我的预约</h3>

    <el-tabs v-model="activeTab" style="margin-top: 20px;" @tab-click="handleTabClick">
      <!-- 预约中 -->
      <el-tab-pane label="预约中" name="reserving">
        <el-table :data="reservingList" border style="width:100%" v-loading="loading">
          <el-table-column label="封面" prop="imgUrl" align="center" width="100">
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
              <span v-else class="no-image">无图片</span>
            </template>
          </el-table-column>
          <el-table-column prop="bookName" label="书名" />
          <el-table-column prop="reserveTime" label="预约时间" />
          <el-table-column label="状态">
            <template slot-scope="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
z          <el-table-column label="操作" width="250">
            <template slot-scope="scope">
              <el-button 
                v-if="scope.row.status === 3"
                type="success" 
                size="mini" 
                @click="confirmBorrow(scope.row)"
              >
                确认借阅
              </el-button>
              <el-button 
                v-if="scope.row.status === 3"
                type="danger" 
                size="mini" 
                @click="cancelReserve(scope.row)"
              >
                取消预约
              </el-button>
              <el-button 
                v-if="scope.row.status === 0"
                type="danger" 
                size="mini" 
                @click="cancelReserve(scope.row)"
              >
                取消预约
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <el-pagination
          @size-change="handleReservingSizeChange"
          @current-change="handleReservingCurrentChange"
          :current-page="reservingPage"
          :page-size="reservingPageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="reservingTotal"
          style="margin-top: 20px;text-align:right;"
        >
        </el-pagination>
      </el-tab-pane>

      <!-- 历史记录 -->
      <el-tab-pane label="历史记录" name="history">
        <el-table :data="historyList" border style="width:100%" v-loading="loading">
          <el-table-column label="封面" prop="imgUrl" align="center" width="100">
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
              <span v-else class="no-image">无图片</span>
            </template>
          </el-table-column>
          <el-table-column prop="bookName" label="书名" />
          <el-table-column prop="reserveTime" label="预约时间" />
          <el-table-column label="通知时间" prop="notifyTime" width="180" />
          <el-table-column label="领取截止" prop="pickupDeadline" width="180" />
          <el-table-column label="状态" width="100">
            <template slot-scope="scope">
              <el-tag :type="getStatusType(scope.row.status)">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="200">
            <template slot-scope="scope">
              <el-button 
                v-if="scope.row.status === 3"
                type="success" 
                size="mini" 
                @click="confirmPickup(scope.row)"
              >
                确认领取
              </el-button>
              <el-button 
                v-if="scope.row.status === 3"
                type="warning" 
                size="mini" 
                @click="cancelPickup(scope.row)"
              >
                取消领取
              </el-button>
              <el-button 
                v-if="scope.row.status === 0"
                type="danger" 
                size="mini" 
                @click="cancelReserve(scope.row)"
              >
                取消预约
              </el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <!-- 分页 -->
        <el-pagination
          @size-change="handleHistorySizeChange"
          @current-change="handleHistoryCurrentChange"
          :current-page="historyPage"
          :page-size="historyPageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="historyTotal"
          style="margin-top: 20px;text-align:right;"
        >
        </el-pagination>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
import { getMyReservePage, cancelReserve as apiCancelReserve, confirmPickup as apiConfirmPickup, cancelPickup as apiCancelPickup } from '@/api/reader';

export default {
  name: "MyReserve",
  data() {
    return {
      activeTab: "reserving",
      loading: false,
      
      // 预约中列表
      reservingList: [],
      reservingPage: 1,
      reservingPageSize: 10,
      reservingTotal: 0,
      
      // 历史记录列表
      historyList: [],
      historyPage: 1,
      historyPageSize: 10,
      historyTotal: 0
    };
  },
  mounted() {
    this.loadReservingList();
  },
  methods: {
    // 加载预约中列表 (status=0 预约中, status=3 待领取)
    async loadReservingList() {
      this.loading = true;
      try {
        // 先查询status=0的预约
        const res1 = await getMyReservePage({
          page: this.reservingPage,
          pageSize: this.reservingPageSize,
          status: 0
        });
        
        // 再查询status=3的待领取
        const res2 = await getMyReservePage({
          page: this.reservingPage,
          pageSize: this.reservingPageSize,
          status: 3
        });
        
        if ((res1.code === 1 || res1.code === 200) && (res2.code === 1 || res2.code === 200)) {
          // 合并两个结果
          const list1 = res1.data.records || [];
          const list2 = res2.data.records || [];
          this.reservingList = [...list1, ...list2];
          this.reservingTotal = (res1.data.total || 0) + (res2.data.total || 0);
        } else {
          this.$message.error('加载失败');
        }
      } catch (error) {
        this.$message.error('加载预约列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    // 加载历史记录列表 (status=1或2)
    async loadHistoryList() {
      this.loading = true;
      try {
        const res = await getMyReservePage({
          page: this.historyPage,
          pageSize: this.historyPageSize
        });
        if (res.code === 1 || res.code === 200) {
          // 过滤出已完成和已取消的记录
          this.historyList = (res.data.records || []).filter(
            item => item.status === 1 || item.status === 2
          );
          this.historyTotal = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '加载失败');
        }
      } catch (error) {
        this.$message.error('加载历史记录失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    handleTabClick(tab) {
      if (tab.name === 'reserving') {
        this.loadReservingList();
      } else {
        this.loadHistoryList();
      }
    },
    
    // 获取状态文本
    getStatusText(status) {
      const statusMap = {
        0: '预约中',
        1: '已完成',
        2: '已取消',
        3: '待领取'
      };
      return statusMap[status] || '未知';
    },
    
    // 获取状态标签类型
    getStatusType(status) {
      const typeMap = {
        0: 'info',
        1: 'success',
        2: 'info',
        3: 'warning'
      };
      return typeMap[status] || '';
    },
    
    // 获取图片完整URL
    getImageUrl(imgUrl) {
      if (!imgUrl) return '';
      // 清理URL中的特殊字符（反引号、引号等）
      const cleanUrl = imgUrl.replace(/[`'"]/g, '');
      // 拼接完整URL
      return 'http://localhost:8080' + cleanUrl;
    },
    
    // 取消预约
    async cancelReserve(row) {
      try {
        await this.$confirm('确认取消该预约吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        const res = await apiCancelReserve(row.id);
        if (res.code === 1 || res.code === 200) {
          this.$message.success('取消预约成功');
          this.loadReservingList();
        } else {
          this.$message.error(res.msg || '取消失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(error.message || '取消失败');
        }
      }
    },
    
    // 确认领取
    async confirmPickup(row) {
      try {
        await this.$confirm('确认领取该图书吗？领取后请尽快到图书馆取书。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success'
        });
        
        const res = await apiConfirmPickup(row.id);
        if (res.code === 1 || res.code === 200) {
          this.$message.success('确认领取成功，请尽快到图书馆取书');
          this.loadReservingList();
        } else {
          this.$message.error(res.msg || '确认失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(error.message || '确认失败');
        }
      }
    },
    
    // 取消领取
    async cancelPickup(row) {
      try {
        await this.$confirm('确认取消领取吗？取消后将重新排队。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });
        
        const res = await apiCancelPickup(row.id);
        if (res.code === 1 || res.code === 200) {
          this.$message.success('已取消领取');
          this.loadReservingList();
        } else {
          this.$message.error(res.msg || '取消失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(error.message || '取消失败');
        }
      }
    },
    
    // 确认领取（待领取状态点击后变为已完成）
    async confirmBorrow(row) {
      try {
        await this.$confirm('确认领取该图书吗？确认后请尽快到图书馆完成借阅手续。', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'success'
        });
        
        // 调用确认领取接口，将状态从待领取改为已完成
        const res = await apiConfirmPickup(row.id);
        if (res.code === 1 || res.code === 200) {
          this.$message.success('确认领取成功，请前往图书馆办理借阅手续');
          // 确认后刷新列表，该记录会移动到历史记录中
          this.loadReservingList();
        } else {
          this.$message.error(res.msg || '确认失败');
        }
      } catch (error) {
        if (error !== 'cancel') {
          this.$message.error(error.message || '确认失败');
        }
      }
    },
    
    // 预约中 - 每页条数变化
    handleReservingSizeChange(val) {
      this.reservingPageSize = val;
      this.reservingPage = 1;
      this.loadReservingList();
    },
    
    // 预约中 - 页码变化
    handleReservingCurrentChange(val) {
      this.reservingPage = val;
      this.loadReservingList();
    },
    
    // 历史记录 - 每页条数变化
    handleHistorySizeChange(val) {
      this.historyPageSize = val;
      this.historyPage = 1;
      this.loadHistoryList();
    },
    
    // 历史记录 - 页码变化
    handleHistoryCurrentChange(val) {
      this.historyPage = val;
      this.loadHistoryList();
    }
  }
};
</script>

<style scoped>
.my-reserve-container h3 {
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
</style>
