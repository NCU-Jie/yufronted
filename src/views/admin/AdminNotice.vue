<template>
  <div style="padding: 20px;">
    <h3 style="margin-bottom: 20px;">公告与反馈管理</h3>

    <el-tabs v-model="activeTab" type="card">
      <!-- 公告管理 -->
      <el-tab-pane label="公告管理" name="notice">
        <div style="margin:15px 0;">
          <el-button type="primary" @click="openAddNoticeDialog">
            发布新公告
          </el-button>
        </div>

        <el-table :data="noticeList" border style="width:100%;" v-loading="loading">
          <el-table-column label="ID" prop="id" align="center" width="80" />
          <el-table-column label="公告标题" prop="title" align="center" />
          <el-table-column label="公告内容" prop="content" align="center" show-overflow-tooltip />
          <el-table-column label="发布时间" prop="createTime" align="center" />
          <el-table-column label="操作" align="center" width="120">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="delNotice(scope.row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          @size-change="handleNoticeSizeChange"
          @current-change="handleNoticeCurrentChange"
          :current-page="noticePage"
          :page-size="noticePageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="noticeTotal"
          style="margin-top: 20px;text-align:right;"
        >
        </el-pagination>
      </el-tab-pane>

      <!-- 读者反馈 -->
      <el-tab-pane label="读者反馈" name="feedback">
        <el-table :data="feedbackList" border style="width:100%;" v-loading="loading">
          <el-table-column label="ID" prop="id" align="center" width="80" />
          <el-table-column label="读者ID" prop="readerId" align="center" />
          <el-table-column label="反馈内容" prop="content" align="center" show-overflow-tooltip />
          <el-table-column label="回复内容" prop="reply" align="center" show-overflow-tooltip />
          <el-table-column label="反馈时间" prop="createTime" align="center" />
          <el-table-column label="操作" align="center" width="200">
            <template slot-scope="scope">
              <el-button 
                size="mini" 
                type="primary" 
                @click="openReplyDialog(scope.row)"
                v-if="!scope.row.reply"
              >
                回复
              </el-button>
              <el-button size="mini" type="danger" @click="delFeedback(scope.row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <!-- 分页 -->
        <el-pagination
          @size-change="handleFeedbackSizeChange"
          @current-change="handleFeedbackCurrentChange"
          :current-page="feedbackPage"
          :page-size="feedbackPageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="feedbackTotal"
          style="margin-top: 20px;text-align:right;"
        >
        </el-pagination>
      </el-tab-pane>
    </el-tabs>

    <!-- 发布公告弹窗 -->
    <el-dialog title="发布公告" :visible.sync="addNoticeDialog" width="500px">
      <el-form :model="noticeForm" label-width="100px" ref="noticeFormRef" :rules="noticeRules">
        <el-form-item label="公告标题" prop="title">
          <el-input v-model="noticeForm.title" placeholder="请输入公告标题" />
        </el-form-item>
        <el-form-item label="公告内容" prop="content">
          <el-input type="textarea" v-model="noticeForm.content" :rows="4" placeholder="请输入公告内容" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addNoticeDialog = false">取消</el-button>
        <el-button type="primary" @click="submitNotice">发布</el-button>
      </div>
    </el-dialog>

    <!-- 回复反馈弹窗 -->
    <el-dialog title="回复反馈" :visible.sync="replyDialog" width="500px">
      <el-form :model="replyForm" label-width="100px" ref="replyFormRef" :rules="replyRules">
        <el-form-item label="反馈内容">
          <el-input type="textarea" v-model="currentFeedback.content" :rows="3" disabled />
        </el-form-item>
        <el-form-item label="回复内容" prop="reply">
          <el-input type="textarea" v-model="replyForm.reply" :rows="4" placeholder="请输入回复内容" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="replyDialog = false">取消</el-button>
        <el-button type="primary" @click="submitReply">回复</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAnnouncementPage, addAnnouncement, deleteAnnouncement, getFeedbackPage, replyFeedback, deleteFeedback } from '@/api/admin';

export default {
  name: "AdminNotice",
  data() {
    return {
      activeTab: "notice",
      loading: false,
      
      // 公告相关
      noticeList: [],
      noticePage: 1,
      noticePageSize: 10,
      noticeTotal: 0,
      addNoticeDialog: false,
      noticeForm: {
        title: "",
        content: ""
      },
      noticeRules: {
        title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
        content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }]
      },
      
      // 反馈相关
      feedbackList: [],
      feedbackPage: 1,
      feedbackPageSize: 10,
      feedbackTotal: 0,
      replyDialog: false,
      currentFeedback: {},
      replyForm: {
        feedbackId: null,
        reply: ""
      },
      replyRules: {
        reply: [{ required: true, message: '请输入回复内容', trigger: 'blur' }]
      }
    };
  },
  mounted() {
    this.loadNotices();
    this.loadFeedbacks();
  },
  watch: {
    activeTab(val) {
      if (val === 'notice') {
        this.loadNotices();
      } else {
        this.loadFeedbacks();
      }
    }
  },
  methods: {
    // 加载公告列表
    async loadNotices() {
      this.loading = true;
      try {
        const res = await getAnnouncementPage(this.noticePage, this.noticePageSize);
        if (res.code === 1 || res.code === 200) {
          this.noticeList = res.data.records || [];
          this.noticeTotal = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '加载失败');
        }
      } catch (error) {
        this.$message.error('加载公告列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    // 加载反馈列表
    async loadFeedbacks() {
      this.loading = true;
      try {
        const res = await getFeedbackPage({
          page: this.feedbackPage,
          pageSize: this.feedbackPageSize
        });
        if (res.code === 1 || res.code === 200) {
          this.feedbackList = res.data.records || [];
          this.feedbackTotal = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '加载失败');
        }
      } catch (error) {
        this.$message.error('加载反馈列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    
    openAddNoticeDialog() {
      this.noticeForm = { title: "", content: "" };
      this.addNoticeDialog = true;
    },
    
    async submitNotice() {
      this.$refs.noticeFormRef.validate(async (valid) => {
        if (valid) {
          try {
            const res = await addAnnouncement(this.noticeForm);
            if (res.code === 1 || res.code === 200) {
              this.$message.success("公告发布成功");
              this.addNoticeDialog = false;
              this.loadNotices();
            } else {
              this.$message.error(res.msg || '发布失败');
            }
          } catch (error) {
            this.$message.error('发布失败');
            console.error(error);
          }
        }
      });
    },
    
    async delNotice(id) {
      this.$confirm("确定删除该公告吗？", "提示", { type: "warning" }).then(async () => {
        try {
          const res = await deleteAnnouncement(id);
          if (res.code === 1 || res.code === 200) {
            this.$message.success("删除成功");
            this.loadNotices();
          } else {
            this.$message.error(res.msg || '删除失败');
          }
        } catch (error) {
          this.$message.error('删除失败');
          console.error(error);
        }
      });
    },
    
    openReplyDialog(row) {
      this.currentFeedback = row;
      this.replyForm = {
        feedbackId: row.id,
        reply: ""
      };
      this.replyDialog = true;
    },
    
    async submitReply() {
      this.$refs.replyFormRef.validate(async (valid) => {
        if (valid) {
          try {
            const res = await replyFeedback(this.replyForm);
            if (res.code === 1 || res.code === 200) {
              this.$message.success("回复成功");
              this.replyDialog = false;
              this.loadFeedbacks();
            } else {
              this.$message.error(res.msg || '回复失败');
            }
          } catch (error) {
            this.$message.error('回复失败');
            console.error(error);
          }
        }
      });
    },
    
    async delFeedback(id) {
      this.$confirm("确定删除该反馈吗？", "提示", { type: "warning" }).then(async () => {
        try {
          const res = await deleteFeedback(id);
          if (res.code === 1 || res.code === 200) {
            this.$message.success("删除成功");
            this.loadFeedbacks();
          } else {
            this.$message.error(res.msg || '删除失败');
          }
        } catch (error) {
          this.$message.error('删除失败');
          console.error(error);
        }
      });
    },
    
    handleNoticeSizeChange(val) {
      this.noticePageSize = val;
      this.loadNotices();
    },
    handleNoticeCurrentChange(val) {
      this.noticePage = val;
      this.loadNotices();
    },
    handleFeedbackSizeChange(val) {
      this.feedbackPageSize = val;
      this.loadFeedbacks();
    },
    handleFeedbackCurrentChange(val) {
      this.feedbackPage = val;
      this.loadFeedbacks();
    }
  }
};
</script>