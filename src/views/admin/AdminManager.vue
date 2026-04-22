<template>
  <div class="admin-manager" style="padding: 20px;">
    <div class="header-tool" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
      <h3>管理员信息管理</h3>
      <el-button type="primary" size="default" @click="openAddDialog">+ 新增管理员</el-button>
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
        <el-button type="primary" @click="getList">搜索</el-button>
        <el-button @click="resetSearch">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table :data="list" border stripe style="width: 100%;" highlight-current-row v-loading="loading">

      <el-table-column prop="username" label="登录账号" align="center" />
      <el-table-column prop="name" label="姓名" align="center" />
      <el-table-column prop="role" label="角色" align="center">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.role === 0">超级管理员</el-tag>
          <el-tag type="info" v-else>普通管理员</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" align="center" width="100">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.status === 1">启用</el-tag>
          <el-tag type="danger" v-else>禁用</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="280">
        <template slot-scope="scope">
          <el-button
            size="mini"
            :type="scope.row.status === 1 ? 'warning' : 'success'"
            @click="toggleStatus(scope.row)"
          >
            {{ scope.row.status === 1 ? '禁用' : '启用' }}
          </el-button>
          <el-button type="warning" size="mini" @click="openResetPwdDialog(scope.row)">重置密码</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="page"
      :page-size="size"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      style="margin-top: 20px;text-align:right;"
    >
    </el-pagination>

    <!-- 新增管理员弹窗 -->
    <el-dialog title="新增管理员" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" label-width="80px" ref="formRef" :rules="rules">
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入登录账号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 重置密码弹窗 -->
    <el-dialog title="重置密码" :visible.sync="resetPwdDialogVisible" width="500px">
      <el-form :model="resetPwdForm" label-width="100px" ref="resetPwdFormRef" :rules="resetPwdRules">
        <el-form-item label="管理员">
          <el-input v-model="resetPwdForm.adminName" disabled />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="resetPwdForm.newPassword" type="password" placeholder="请输入新密码" show-password />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="resetPwdForm.confirmPassword" type="password" placeholder="请再次输入新密码" show-password />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="resetPwdDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitResetPwd">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getAdminPage, addAdmin, deleteAdmin, resetAdminPassword, updateAdmin } from '@/api/admin';

export default {
  name: 'AdminManager',
  data() {
    // 确认密码验证
    const validateConfirmPassword = (rule, value, callback) => {
      if (value !== this.resetPwdForm.newPassword) {
        callback(new Error('两次输入的密码不一致'));
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
      list: [],
      page: 1,
      size: 10,
      total: 0,

      // 新增管理员相关
      dialogVisible: false,
      form: {
        username: '',
        name: '',
        password: '',
        status: 1
      },
      rules: {
        username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
      },

      // 重置密码相关
      resetPwdDialogVisible: false,
      resetPwdForm: {
        id: null,
        adminName: '',
        newPassword: '',
        confirmPassword: ''
      },
      resetPwdRules: {
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, message: '请确认密码', trigger: 'blur' },
          { validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    }
  },
  mounted() {
    this.getList();
  },
  methods: {
    async getList() {
      this.loading = true;
      try {
        const res = await getAdminPage({
          page: this.page,
          pageSize: this.size,
          username: this.searchForm.username || undefined,
          name: this.searchForm.name || undefined
        });
        if (res.code === 1 || res.code === 200) {
          this.list = res.data.records || [];
          this.total = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '加载失败');
        }
      } catch (error) {
        this.$message.error('加载管理员列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    resetSearch() {
      this.searchForm.username = '';
      this.searchForm.name = '';
      this.page = 1;
      this.getList();
    },
    handleSizeChange(val) { 
      this.size = val;
      this.getList();
    },
    handleCurrentChange(val) { 
      this.page = val;
      this.getList();
    },

    openAddDialog() {
      this.form = { 
        username: '', 
        name: '', 
        password: '', 
        status: 1
      };
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.formRef && this.$refs.formRef.clearValidate();
      });
    },
    submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          try {
            const res = await addAdmin(this.form);
            
            if (res.code === 1 || res.code === 200) {
              this.$message.success('新增成功');
              this.dialogVisible = false;
              this.getList();
            } else {
              this.$message.error(res.msg || '操作失败');
            }
          } catch (error) {
            this.$message.error('操作失败');
            console.error(error);
          }
        }
      });
    },
    handleDelete(id) {
      this.$confirm('确定删除该管理员吗？', '提示', { type: 'warning' }).then(async () => {
        try {
          const res = await deleteAdmin(id);
          if (res.code === 1 || res.code === 200) {
            this.$message.success('删除成功');
            this.getList();
          } else {
            this.$message.error(res.msg || '删除失败');
          }
        } catch (error) {
          this.$message.error('删除失败');
          console.error(error);
        }
      });
    },

    // 切换管理员状态（启用/禁用）
    async toggleStatus(row) {
      const newStatus = row.status === 1 ? 0 : 1;
      const action = newStatus === 1 ? '启用' : '禁用';
      
      this.$confirm(`确定要${action}该管理员吗？`, '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(async () => {
        try {
          const res = await updateAdmin({
            id: row.id,
            name: row.name,
            status: newStatus
          });
          
          if (res.code === 1 || res.code === 200) {
            this.$message.success(`${action}成功`);
            this.getList();
          } else {
            this.$message.error(res.msg || `${action}失败`);
          }
        } catch (error) {
          this.$message.error(`${action}失败`);
          console.error(error);
        }
      });
    },

    // 打开重置密码弹窗
    openResetPwdDialog(row) {
      this.resetPwdForm = {
        id: row.id,
        adminName: `${row.username} (${row.name})`,
        newPassword: '',
        confirmPassword: ''
      };
      this.resetPwdDialogVisible = true;
      this.$nextTick(() => {
        this.$refs.resetPwdFormRef && this.$refs.resetPwdFormRef.clearValidate();
      });
    },

    // 提交重置密码
    submitResetPwd() {
      this.$refs.resetPwdFormRef.validate(async (valid) => {
        if (valid) {
          try {
            const res = await resetAdminPassword({
              id: this.resetPwdForm.id,
              newPassword: this.resetPwdForm.newPassword
            });
            
            if (res.code === 1 || res.code === 200) {
              this.$message.success('密码重置成功');
              this.resetPwdDialogVisible = false;
            } else {
              this.$message.error(res.msg || '密码重置失败');
            }
          } catch (error) {
            this.$message.error('密码重置失败');
            console.error(error);
          }
        }
      });
    }
  }
}
</script>

<style scoped>
.header-tool {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.dialog-footer {
  text-align: right;
}
</style>