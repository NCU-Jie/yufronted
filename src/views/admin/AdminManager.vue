<template>
  <div class="admin-manager" style="padding: 20px;">
    <div class="header-tool" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
      <h3>管理员信息管理</h3>
      <el-button type="primary" @click="openAddDialog">+ 新增管理员</el-button>
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
      <el-table-column prop="id" label="ID" align="center" width="80" />
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
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="openEditDialog(scope.row)">编辑</el-button>
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

    <!-- 新增/编辑弹窗 -->
    <el-dialog :title="isEdit ? '编辑管理员' : '新增管理员'" :visible.sync="dialogVisible" width="500px">
      <el-form :model="form" label-width="80px" ref="formRef" :rules="rules">
        <el-form-item label="账号" prop="username">
          <el-input v-model="form.username" placeholder="请输入登录账号" :disabled="isEdit" />
        </el-form-item>
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="form.password" type="password" placeholder="新增时必填，编辑时留空则不修改" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="超级管理员" :value="0" />
            <el-option label="普通管理员" :value="1" />
          </el-select>
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
  </div>
</template>

<script>
import { getAdminPage, addAdmin, updateAdmin, deleteAdmin } from '@/api/admin';

export default {
  name: 'AdminManager',
  data() {
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

      dialogVisible: false,
      isEdit: false,
      form: {
        id: null,
        username: '',
        name: '',
        password: '',
        role: 1,
        status: 1
      },
      rules: {
        username: [{ required: true, message: '请输入账号', trigger: 'blur' }],
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        password: [{ 
          validator: (rule, value, callback) => {
            if (!this.isEdit && !value) {
              callback(new Error('请输入密码'));
            } else {
              callback();
            }
          }, 
          trigger: 'blur' 
        }],
        role: [{ required: true, message: '请选择角色', trigger: 'change' }]
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
        const res = await getAdminPage(this.page, this.size);
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
      this.isEdit = false;
      this.form = { 
        id: null, 
        username: '', 
        name: '', 
        password: '', 
        role: 1,
        status: 1
      };
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.formRef && this.$refs.formRef.clearValidate();
      });
    },
    openEditDialog(row) {
      this.isEdit = true;
      this.form = { 
        ...row, 
        password: '' // 编辑时密码默认为空
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
            let res;
            if (this.isEdit) {
              // 编辑时，如果密码为空则不传password字段
              const data = { ...this.form };
              if (!data.password) {
                delete data.password;
              }
              res = await updateAdmin(data);
            } else {
              res = await addAdmin(this.form);
            }
            
            if (res.code === 1 || res.code === 200) {
              this.$message.success(this.isEdit ? '编辑成功' : '新增成功');
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