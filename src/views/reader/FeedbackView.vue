<template>
  <div class="feedback-page" style="padding: 20px;">
    <h2>我要反馈</h2>

    <!-- 新增反馈表单 -->
    <el-card style="margin-bottom: 30px;">
      <h4 style="margin-bottom: 15px;">提交反馈</h4>
      <el-form :model="feedbackForm" :rules="feedbackRules" ref="feedbackForm" label-width="80px">
        <el-form-item label="反馈内容" prop="content">
          <el-input
            type="textarea"
            v-model="feedbackForm.content"
            placeholder="请输入您的反馈意见或建议"
            :rows="5"
            maxlength="500"
            show-word-limit
          ></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="submitLoading">提交反馈</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <!-- 我的反馈列表 -->
    <el-card>
      <h4 style="margin-bottom: 15px;">我的反馈</h4>
      <div v-loading="listLoading">
        <el-table :data="feedbackList" style="width: 100%" v-if="feedbackList.length > 0">
          <el-table-column prop="content" label="反馈内容" min-width="300"></el-table-column>
          <el-table-column prop="reply" label="回复内容" min-width="300">
            <template slot-scope="scope">
              <span v-if="scope.row.reply">{{ scope.row.reply }}</span>
              <el-tag v-else type="info" size="mini">暂无回复</el-tag>
            </template>
          </el-table-column>
          <el-table-column label="反馈时间" width="180">
            <template slot-scope="scope">
              {{ formatDate(scope.row.createTime) }}
            </template>
          </el-table-column>
        </el-table>
        <el-empty v-else description="暂无反馈记录"></el-empty>
        
        <!-- 分页 -->
        <el-pagination
          v-if="total > 0"
          style="margin-top: 20px; text-align: right;"
          @current-change="handlePageChange"
          :current-page="page"
          :page-size="pageSize"
          layout="total, prev, pager, next"
          :total="total"
        ></el-pagination>
      </div>
    </el-card>
  </div>
</template>

<script>
import { submitFeedback, getMyFeedbackPage } from '@/api/reader';

export default {
  name: "FeedbackView",
  data() {
    return {
      // 表单数据
      feedbackForm: {
        content: ""
      },
      feedbackRules: {
        content: [
          { required: true, message: '请输入反馈内容', trigger: 'blur' },
          { min: 5, message: '反馈内容至少5个字符', trigger: 'blur' }
        ]
      },
      submitLoading: false,
      
      // 列表数据
      feedbackList: [],
      listLoading: false,
      page: 1,
      pageSize: 10,
      total: 0
    };
  },
  mounted() {
    this.loadFeedbackList();
  },
  methods: {
    // 提交反馈
    handleSubmit() {
      this.$refs.feedbackForm.validate(async valid => {
        if (valid) {
          this.submitLoading = true;
          try {
            const res = await submitFeedback(this.feedbackForm);
            if (res.code === 1 || res.code === 200) {
              this.$message.success('反馈提交成功');
              this.handleReset();
              // 刷新反馈列表
              this.loadFeedbackList();
            } else {
              this.$message.error(res.msg || '提交失败');
            }
          } catch (error) {
            this.$message.error('提交出错');
            console.error(error);
          } finally {
            this.submitLoading = false;
          }
        }
      });
    },
    
    // 重置表单
    handleReset() {
      this.feedbackForm = {
        content: ""
      };
      this.$refs.feedbackForm.clearValidate();
    },
    
    // 加载反馈列表
    async loadFeedbackList() {
      this.listLoading = true;
      try {
        const res = await getMyFeedbackPage(this.page, this.pageSize);
        if (res.code === 1 || res.code === 200) {
          this.feedbackList = res.data.records || [];
          this.total = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '加载反馈列表失败');
        }
      } catch (error) {
        this.$message.error('加载反馈列表失败');
        console.error(error);
      } finally {
        this.listLoading = false;
      }
    },
    
    // 分页切换
    handlePageChange(page) {
      this.page = page;
      this.loadFeedbackList();
    },
    
    // 格式化日期
    formatDate(dateStr) {
      if (!dateStr) return '';
      const date = new Date(dateStr);
      return date.toLocaleString('zh-CN');
    }
  }
};
</script>

<style scoped>
.feedback-page h2 {
  margin-bottom: 20px;
}
</style>
