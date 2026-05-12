<template>
  <div style="padding: 20px;">
    <h3 style="margin-bottom: 20px;">公告管理</h3>

    <div style="margin-bottom: 20px;">
      <el-button type="primary" @click="openAddNoticeDialog">
        发布新公告
      </el-button>
    </div>

    <el-table :data="noticeList" border style="width:100%;" v-loading="loading">
      <el-table-column label="序号" align="center" width="80">
        <template slot-scope="scope">
          {{ (page - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column label="公告标题" prop="title" align="center" />
      <el-table-column label="公告内容" prop="content" align="center" show-overflow-tooltip />
      <el-table-column label="发布时间" prop="createTime" align="center" width="180" />
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
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="page"
      :page-size="pageSize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      style="margin-top: 20px;text-align:right;"
    >
    </el-pagination>

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
  </div>
</template>

<script>
import { getAnnouncementPage, addAnnouncement, deleteAnnouncement } from '@/api/admin';

export default {
  name: "AdminNotice",
  data() {
    return {
      loading: false,
      noticeList: [],
      page: 1,
      pageSize: 10,
      total: 0,
      addNoticeDialog: false,
      noticeForm: {
        title: "",
        content: ""
      },
      noticeRules: {
        title: [{ required: true, message: '请输入公告标题', trigger: 'blur' }],
        content: [{ required: true, message: '请输入公告内容', trigger: 'blur' }]
      }
    };
  },
  mounted() {
    this.loadNotices();
  },
  methods: {
    // 加载公告列表
    async loadNotices() {
      this.loading = true;
      try {
        const res = await getAnnouncementPage(this.page, this.pageSize);
        if (res.code === 1 || res.code === 200) {
          this.noticeList = res.data.records || [];
          this.total = res.data.total || 0;
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
    
    handleSizeChange(val) {
      this.pageSize = val;
      this.page = 1;
      this.loadNotices();
    },
    
    handleCurrentChange(val) {
      this.page = val;
      this.loadNotices();
    }
  }
};
</script>