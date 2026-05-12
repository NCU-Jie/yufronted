<template>
  <div style="padding: 20px;">
    <h3 style="margin-bottom: 20px;">读者反馈管理</h3>

    <el-tabs v-model="activeTab" type="card" @tab-click="handleTabClick">
      <!-- 待处理反馈 -->
      <el-tab-pane label="待处理反馈" name="pending">
        <el-table :data="feedbackList" border style="width:100%;" v-loading="loading">
          <el-table-column label="序号" align="center" width="80">
            <template slot-scope="scope">
              {{ (page - 1) * pageSize + scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="读者姓名" prop="readerName" align="center" width="120" />
          <el-table-column label="反馈内容" prop="content" align="center" show-overflow-tooltip />
          <el-table-column label="反馈时间" prop="createTime" align="center" width="180" />
          <el-table-column label="操作" align="center" width="200">
            <template slot-scope="scope">
              <el-button 
                size="mini" 
                type="primary" 
                @click="openReplyDialog(scope.row)"
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
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="page"
          :page-size="pageSize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
          style="margin-top: 20px;text-align:right;"
        >
        </el-pagination>
      </el-tab-pane>

      <!-- 已回复反馈 -->
      <el-tab-pane label="已回复反馈" name="replied">
        <el-table :data="feedbackList" border style="width:100%;" v-loading="loading">
          <el-table-column label="序号" align="center" width="80">
            <template slot-scope="scope">
              {{ (page - 1) * pageSize + scope.$index + 1 }}
            </template>
          </el-table-column>
          <el-table-column label="读者姓名" prop="readerName" align="center" width="120" />
          <el-table-column label="反馈内容" prop="content" align="center" show-overflow-tooltip />
          <el-table-column label="回复内容" prop="reply" align="center" show-overflow-tooltip />
          <el-table-column label="反馈时间" prop="createTime" align="center" width="180" />
          <el-table-column label="操作" align="center" width="120">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="delFeedback(scope.row.id)">
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
      </el-tab-pane>
    </el-tabs>

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
import { getFeedbackPage, replyFeedback, deleteFeedback } from '@/api/admin';

export default {
  name: "AdminFeedback",
  data() {
    return {
      activeTab: 'pending',
      loading: false,
      feedbackList: [],
      page: 1,
      pageSize: 10,
      total: 0,
      replied: 0,
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
    this.loadFeedbacks();
  },
  methods: {
    // 标签页切换
    handleTabClick(tab) {
      this.page = 1;
      this.replied = tab.name === 'pending' ? 0 : 1;
      this.loadFeedbacks();
    },
    
    // 加载反馈列表
    async loadFeedbacks() {
      this.loading = true;
      try {
        const res = await getFeedbackPage({
          page: this.page,
          pageSize: this.pageSize,
          replied: this.replied
        });
        if (res.code === 1 || res.code === 200) {
          this.feedbackList = res.data.records || [];
          this.total = res.data.total || 0;
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
    
    handleSizeChange(val) {
      this.pageSize = val;
      this.page = 1;
      this.loadFeedbacks();
    },
    
    handleCurrentChange(val) {
      this.page = val;
      this.loadFeedbacks();
    }
  }
};
</script>