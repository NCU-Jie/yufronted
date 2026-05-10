<template>
  <div class="notice-container" style="padding: 20px;">
    <h3>站内消息</h3>

    <el-button 
      type="primary" 
      size="small" 
      @click="refreshNotices"
      style="margin-bottom: 20px;"
    >
      <i class="el-icon-refresh"></i> 刷新消息
    </el-button>

    <el-table :data="noticeList" border style="width:100%" v-loading="loading">
      <el-table-column label="消息内容" prop="content" min-width="400">
        <template slot-scope="scope">
          <div :class="{ 'unread-text': scope.row.isRead === 0 }">
            {{ scope.row.content }}
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="100">
        <template slot-scope="scope">
          <el-tag :type="scope.row.isRead === 0 ? 'warning' : 'info'" size="small">
            {{ scope.row.isRead === 0 ? '未读' : '已读' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="时间" width="180">
        <template slot-scope="scope">
          {{ formatDate(scope.row.createTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="200">
        <template slot-scope="scope">
          <el-button 
            v-if="scope.row.isRead === 0"
            type="success" 
            size="mini" 
            @click="markAsRead(scope.row)"
          >
            标记已读
          </el-button>
          <el-button 
            type="danger" 
            size="mini" 
            @click="deleteNoticeItem(scope.row)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <div v-if="noticeList.length === 0 && !loading" class="empty-state">
      <i class="el-icon-message" style="font-size: 48px; color: #c0c4cc;"></i>
      <p>暂无消息</p>
    </div>
  </div>
</template>

<script>
import { getMyNoticeList, markNoticeAsRead, deleteNotice } from '@/api/reader';
import { mapGetters } from 'vuex';

export default {
  name: "NoticeView",
  data() {
    return {
      loading: false,
      noticeList: []
    };
  },
  computed: {
    ...mapGetters('reader', ['unreadNoticeCount'])
  },
  mounted() {
    this.loadNotices();
    // 监听 WebSocket 消息
    window.addEventListener('reserve-notify', this.handleReserveNotify);
  },
  beforeDestroy() {
    window.removeEventListener('reserve-notify', this.handleReserveNotify);
  },
  methods: {
    // 加载站内信列表
    async loadNotices() {
      this.loading = true;
      try {
        const res = await getMyNoticeList();
        if (res.code === 1 || res.code === 200) {
          this.noticeList = res.data || [];
          // 更新未读消息数
          const unreadCount = this.noticeList.filter(n => n.isRead === 0).length;
          this.$store.dispatch('reader/setUnreadNoticeCount', unreadCount);
        } else {
          this.$message.error(res.msg || '加载失败');
        }
      } catch (error) {
        this.$message.error('加载站内信失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },

    // 刷新消息
    refreshNotices() {
      this.loadNotices();
      this.$message.success('刷新成功');
    },

    // 标记为已读
    async markAsRead(notice) {
      try {
        const res = await markNoticeAsRead(notice.id);
        if (res.code === 1 || res.code === 200) {
          notice.isRead = 1;
          this.$message.success('已标记为已读');
          // 重新计算未读消息数
          const unreadCount = this.noticeList.filter(n => n.isRead === 0).length;
          this.$store.dispatch('reader/setUnreadNoticeCount', unreadCount);
        } else {
          this.$message.error(res.msg || '操作失败');
        }
      } catch (error) {
        this.$message.error('操作失败');
        console.error(error);
      }
    },

    // 删除站内信
    async deleteNoticeItem(notice) {
      try {
        await this.$confirm('确定删除此消息吗？', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        });

        const res = await deleteNotice(notice.id);
        if (res.code === 1 || res.code === 200) {
          this.noticeList = this.noticeList.filter(n => n.id !== notice.id);
          this.$message.success('删除成功');
          // 重新计算未读消息数
          const unreadCount = this.noticeList.filter(n => n.isRead === 0).length;
          this.$store.dispatch('reader/setUnreadNoticeCount', unreadCount);
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

    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    },

    // 处理 WebSocket 消息
    handleReserveNotify() {
      // 自动刷新消息列表
      this.loadNotices();
    }
  }
};
</script>

<style scoped>
.notice-container h3 {
  margin-bottom: 10px;
}

.unread-text {
  font-weight: 600;
  color: #409EFF;
}

.empty-state {
  text-align: center;
  padding: 60px 20px;
  color: #909399;
}

.empty-state p {
  margin-top: 20px;
  font-size: 14px;
}
</style>
