<template>
  <div style="padding: 20px;">
    <h3 style="margin-bottom: 20px;">用户管理</h3>

    <!-- 搜索栏 -->
    <div style="margin-bottom: 20px;">
      <el-input
        v-model="searchText"
        placeholder="搜索用户名/姓名"
        style="width: 300px;"
        clearable
      />
    </div>

    <!-- 用户列表 -->
    <el-table :data="userList" border style="width: 100%;">
      <el-table-column label="ID" prop="id" align="center" />
      <el-table-column label="用户名" prop="username" align="center" />
      <el-table-column label="姓名" prop="name" align="center" />
      <el-table-column label="角色" align="center">
        <template slot-scope="scope">
          <el-tag type="primary" v-if="scope.row.role === 'admin'">
            管理员
          </el-tag>
          <el-tag type="success" v-else>
            普通用户
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            type="danger"
            size="mini"
            @click="deleteUser(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "AdminUser",
  data() {
    return {
      searchText: "",
      userList: [
        { id: 1, username: "user01", name: "张三", role: "user" },
        { id: 2, username: "user02", name: "李四", role: "user" },
        { id: 3, username: "admin", name: "系统管理员", role: "admin" },
      ],
    };
  },
  computed: {
    // 搜索过滤
    filteredList() {
      if (!this.searchText) return this.userList;
      return this.userList.filter((item) => {
        return (
          item.username.includes(this.searchText) ||
          item.name.includes(this.searchText)
        );
      });
    },
  },
  methods: {
    deleteUser(id) {
      this.$confirm("确定要删除该用户吗？", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      }).then(() => {
        this.userList = this.userList.filter((item) => item.id !== id);
        this.$message.success("删除成功！");
      });
    },
  },
};
</script>