<template>
  <div class="admin-user" style="padding: 20px;">
    <div class="header-tool" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
      <h3>用户管理</h3>
      <el-button type="primary" size="default" @click="showAddDialog">+ 新增读者</el-button>
    </div>

    <!-- 搜索栏 -->
    <el-form :inline="true" :model="searchForm" class="search-form" style="margin-bottom: 20px;">
      <el-form-item label="账号">
        <el-input v-model="searchForm.username" placeholder="请输入账号" />
      </el-form-item>
      <el-form-item label="姓名">
        <el-input v-model="searchForm.name" placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="loadReaders">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 用户列表 -->
    <el-table :data="readerList" border stripe style="width: 100%;" highlight-current-row v-loading="loading">

      <el-table-column prop="username" label="用户名" align="center" />
      <el-table-column prop="name" label="姓名" align="center" />
      <el-table-column prop="status" label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.status === 1">启用</el-tag>
          <el-tag type="danger" v-else>禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" align="center" />
      <el-table-column label="操作" align="center" width="350">
        <template slot-scope="scope">
          <el-button
            size="mini"
            :type="scope.row.status === 1 ? 'warning' : 'success'"
            @click="toggleStatus(scope.row)"
          >
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button type="warning" size="mini" @click="showResetPasswordDialog(scope.row)">重置密码</el-button>
          <el-button type="danger" size="mini" @click="deleteReader(scope.row.id)">删除</el-button>
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

    <!-- 新增读者对话框 -->
    <el-dialog title="新增读者" :visible.sync="addDialogVisible" width="500px">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="80px">
        <el-form-item label="账号" prop="username">
          <el-input v-model="addForm.username" placeholder="请输入账号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="addForm.name" placeholder="请输入姓名" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddForm" :loading="addLoading">确定</el-button>
      </div>
    </el-dialog>

    <!-- 重置密码对话框 -->
    <el-dialog title="重置密码" :visible.sync="resetPasswordDialogVisible" width="500px">
      <el-form :model="resetPasswordForm" :rules="resetPasswordRules" ref="resetPasswordFormRef" label-width="100px">
        <el-form-item label="用户名">
          <el-input v-model="resetPasswordForm.username" disabled />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetPasswordForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="resetPasswordForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetPasswordDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitResetPassword" :loading="resetPasswordLoading">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getReaderPage, updateReaderStatus, deleteReader, addReader, resetReaderPassword } from '@/api/admin';

export default {
  name: "AdminUser",
  data() {
    // 确认密码验证规则
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.resetPasswordForm.newPassword) {
        callback(new Error('两次输入密码不一致'));
      } else {
        callback();
      }
    };

    return {
      searchForm: {
        username: '',
        name: ''
      },
      loading: false,
      readerList: [],
      page: 1,
      pageSize: 10,
      total: 0,
      // 新增读者相关
      addDialogVisible: false,
      addLoading: false,
      addForm: {
        username: '',
        password: '',
        name: ''
      },
      addRules: {
        username: [
          { required: true, message: '请输入账号', trigger: 'blur' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        name: [
          { required: true, message: '请输入姓名', trigger: 'blur' }
        ]
      },
      // 重置密码相关
      resetPasswordDialogVisible: false,
      resetPasswordLoading: false,
      resetPasswordForm: {
        id: null,
        username: '',
        newPassword: '',
        confirmPassword: ''
      },
      resetPasswordRules: {
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请再次输入密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    };
  },
  mounted() {
    this.loadReaders();
  },
  methods: {
    async loadReaders() {
      this.loading = true;
      try {
        const res = await getReaderPage({
          page: this.page,
          pageSize: this.pageSize,
          username: this.searchForm.username || undefined,
          name: this.searchForm.name || undefined
        });
        if (res.code === 1 || res.code === 200) {
          this.readerList = res.data.records || [];
          this.total = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '加载失败');
        }
      } catch (error) {
        this.$message.error('加载读者列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    resetSearch() {
      this.searchForm.username = '';
      this.searchForm.name = '';
      this.page = 1;
      this.loadReaders();
    },
    async toggleStatus(row) {
      const newStatus = row.status === 1 ? 0 : 1;
      const action = newStatus === 1 ? '启用' : '禁用';
      this.$confirm(`确定要${action}该用户吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await updateReaderStatus(row.id, newStatus);
          if (res.code === 1 || res.code === 200) {
            this.$message.success(`${action}成功`);
            this.loadReaders();
          } else {
            this.$message.error(res.msg || `${action}失败`);
          }
        } catch (error) {
          this.$message.error(`${action}失败`);
          console.error(error);
        }
      });
    },
    async deleteReader(id) {
      this.$confirm("确定要删除该用户吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      }).then(async () => {
        try {
          const res = await deleteReader(id);
          if (res.code === 1 || res.code === 200) {
            this.$message.success("删除成功");
            this.loadReaders();
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
      this.loadReaders();
    },
    handleCurrentChange(val) {
      this.page = val;
      this.loadReaders();
    },
    // 显示新增对话框
    showAddDialog() {
      this.addDialogVisible = true;
      this.resetAddForm();
    },
    // 重置表单
    resetAddForm() {
      this.addForm = {
        username: '',
        password: '',
        name: ''
      };
      if (this.$refs.addFormRef) {
        this.$refs.addFormRef.clearValidate();
      }
    },
    // 提交新增表单
    submitAddForm() {
      this.$refs.addFormRef.validate(async (valid) => {
        if (!valid) return;
        
        this.addLoading = true;
        try {
          const res = await addReader(this.addForm);
          if (res.code === 1 || res.code === 200) {
            this.$message.success('新增成功');
            this.addDialogVisible = false;
            this.loadReaders();
          } else {
            this.$message.error(res.msg || '新增失败');
          }
        } catch (error) {
          this.$message.error('新增失败');
          console.error(error);
        } finally {
          this.addLoading = false;
        }
      });
    },
    // 显示重置密码对话框
    showResetPasswordDialog(row) {
      this.resetPasswordForm = {
        id: row.id,
        username: row.username,
        newPassword: '',
        confirmPassword: ''
      };
      this.resetPasswordDialogVisible = true;
      // 清除验证
      this.$nextTick(() => {
        if (this.$refs.resetPasswordFormRef) {
          this.$refs.resetPasswordFormRef.clearValidate();
        }
      });
    },
    // 提交重置密码
    submitResetPassword() {
      this.$refs.resetPasswordFormRef.validate(async (valid) => {
        if (!valid) return;

        this.resetPasswordLoading = true;
        try {
          const res = await resetReaderPassword({
            id: this.resetPasswordForm.id,
            newPassword: this.resetPasswordForm.newPassword
          });
          if (res.code === 1 || res.code === 200) {
            this.$message.success('密码重置成功');
            this.resetPasswordDialogVisible = false;
          } else {
            this.$message.error(res.msg || '密码重置失败');
          }
        } catch (error) {
          this.$message.error('密码重置失败');
          console.error(error);
        } finally {
          this.resetPasswordLoading = false;
        }
      });
    }
  }
};
</script>