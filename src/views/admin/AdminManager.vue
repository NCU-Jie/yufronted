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
    <el-table :data="list" border stripe style="width: 100%;" highlight-current-row>
      <el-table-column prop="id" label="ID" align="center" />
      <el-table-column prop="username" label="登录账号" align="center" />
      <el-table-column prop="name" label="姓名" align="center" />
      <el-table-column prop="role" label="角色" align="center">
        <template slot-scope="scope">
          <el-tag type="success" v-if="scope.row.role === 'admin'">超级管理员</el-tag>
          <el-tag type="info" v-else>普通管理员</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="openEditDialog(scope.row)">编辑</el-button>
          <el-button type="danger" size="mini" @click="handleDelete(scope.row.id)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页（已修复 Vue2 正确写法） -->
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
      <el-form :model="form" label-width="80px" ref="formRef">
        <el-form-item label="账号" prop="username" :rules="[{ required: true, message: '请输入账号' }]">
          <el-input v-model="form.username" placeholder="请输入登录账号" />
        </el-form-item>
        <el-form-item label="姓名" prop="name" :rules="[{ required: true, message: '请输入姓名' }]">
          <el-input v-model="form.name" placeholder="请输入姓名" />
        </el-form-item>
        <el-form-item label="密码" prop="password" :rules="[{ required: !isEdit, message: '请输入密码' }]">
          <el-input v-model="form.password" type="password" placeholder="新增时必填" show-password />
        </el-form-item>
        <el-form-item label="角色" prop="role">
          <el-select v-model="form.role" placeholder="请选择角色">
            <el-option label="超级管理员" value="admin" />
            <el-option label="普通管理员" value="manager" />
          </el-select>
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
export default {
  name: 'AdminManager',
  data() {
    return {
      searchForm: {
        username: '',
        name: ''
      },
      list: [
        { id: 1, username: 'admin', name: '系统管理员', role: 'admin' },
        { id: 2, username: 'lib001', name: '图书管理员', role: 'manager' }
      ],
      page: 1,
      size: 10,
      total: 20,

      dialogVisible: false,
      isEdit: false,
      form: {
        id: null,
        username: '',
        name: '',
        password: '',
        role: 'manager'
      }
    }
  },
  methods: {
    getList() {
  console.log('获取管理员列表')
},
    resetSearch() {
      this.searchForm.username = ''
      this.searchForm.name = ''
    },
    handleSizeChange(val) { this.size = val },
    handleCurrentChange(val) { this.page = val },

    openAddDialog() {
      this.isEdit = false
      this.form = { id: null, username: '', name: '', password: '', role: 'manager' }
      this.dialogVisible = true
    },
    openEditDialog(row) {
      this.isEdit = true
      this.form = { ...row, password: '' }
      this.dialogVisible = true
    },
    submitForm() {
      this.$refs.formRef.validate((valid) => {
        if (valid) {
          this.$message.success(this.isEdit ? '编辑成功' : '新增成功')
          this.dialogVisible = false
        }
      })
    },
    handleDelete(id) {
      this.$confirm('确定删除该管理员吗？', '提示', { type: 'warning' }).then(() => {
        this.list = this.list.filter(item => item.id !== id)
        this.$message.success('删除成功')
      })
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