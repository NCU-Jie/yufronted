<template>
  <div style="padding: 20px;">
    <h3 style="margin-bottom: 20px;">公告与反馈管理</h3>

    <el-tabs v-model="activeTab" type="card">
      <!-- 公告管理 -->
      <el-tab-pane label="公告管理" name="notice">
        <div style="margin:15px 0;">
          <el-button type="primary" @click="addNoticeDialog = true">
            发布新公告
          </el-button>
        </div>

        <el-table :data="noticeList" border style="width:100%;">
          <el-table-column label="ID" prop="id" align="center" />
          <el-table-column label="公告标题" prop="title" align="center" />
          <el-table-column label="发布时间" prop="createTime" align="center" />
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="delNotice(scope.row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 读者反馈 -->
      <el-tab-pane label="读者反馈" name="feedback">
        <el-table :data="feedbackList" border style="width:100%;">
          <el-table-column label="ID" prop="id" align="center" />
          <el-table-column label="用户" prop="username" align="center" />
          <el-table-column label="反馈内容" prop="content" align="center" />
          <el-table-column label="时间" prop="createTime" align="center" />
          <el-table-column label="操作" align="center">
            <template slot-scope="scope">
              <el-button size="mini" type="danger" @click="delFeedback(scope.row.id)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>

    <!-- 发布公告弹窗 -->
    <el-dialog title="发布公告" :visible.sync="addNoticeDialog" width="500px">
      <el-form :model="noticeForm" label-width="70px">
        <el-form-item label="公告标题">
          <el-input v-model="noticeForm.title" />
        </el-form-item>
        <el-form-item label="公告内容">
          <el-input type="textarea" v-model="noticeForm.content" :rows="4" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addNoticeDialog = false">取消</el-button>
        <el-button type="primary" @click="addNotice">发布</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "AdminNotice",
  data() {
    return {
      activeTab: "notice",
      addNoticeDialog: false,

      noticeList: [
        { id: 1, title: "图书馆周末正常开放", createTime: "2025-01-01" },
        { id: 2, title: "新书上架通知", createTime: "2025-01-02" },
      ],
      
      feedbackList: [
        { id: 1, username: "张三", content: "希望增加更多计算机类书籍", createTime: "2025-01-01" },
        { id: 2, username: "李四", content: "借书流程很方便", createTime: "2025-01-02" },
      ],

      noticeForm: {
        title: "",
        content: "",
      },
    };
  },
  methods: {
    addNotice() {
      const newId = this.noticeList.length + 1;
      this.noticeList.unshift({
        id: newId,
        title: this.noticeForm.title,
        createTime: new Date().toLocaleString(),
      });
      this.addNoticeDialog = false;
      this.noticeForm = { title: "", content: "" };
      this.$message.success("公告发布成功");
    },
    delNotice(id) {
      this.$confirm("确定删除该公告吗？", "提示", { type: "warning" }).then(() => {
        this.noticeList = this.noticeList.filter((item) => item.id !== id);
        this.$message.success("删除成功");
      });
    },
    delFeedback(id) {
      this.$confirm("确定删除该反馈吗？", "提示", { type: "warning" }).then(() => {
        this.feedbackList = this.feedbackList.filter((item) => item.id !== id);
        this.$message.success("删除成功");
      });
    },
  },
};
</script>