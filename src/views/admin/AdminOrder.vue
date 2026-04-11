<template>
  <div style="padding: 20px;">
    <h3 style="margin-bottom: 20px;">预约与订阅管理</h3>

    <!-- 搜索 -->
    <div style="margin-bottom: 20px;">
      <el-input
        v-model="searchText"
        placeholder="搜索书名/用户"
        style="width: 300px;"
        clearable
      />
    </div>

    <!-- 列表 -->
    <el-table :data="list" border style="width: 100%;">
      <el-table-column label="ID" prop="id" align="center" />
      <el-table-column label="用户" prop="username" align="center" />
      <el-table-column label="书籍名称" prop="bookName" align="center" />
      <el-table-column label="类型" align="center">
        <template slot-scope="scope">
          <el-tag type="warning" v-if="scope.row.type === 'reserve'">预约</el-tag>
          <el-tag type="info" v-else>订阅</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" align="center">
        <template slot-scope="scope">
          <el-tag type="danger" v-if="scope.row.status === 0">待处理</el-tag>
          <el-tag type="success" v-else>已处理</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleStatus(scope.row)"
            v-if="scope.row.status === 0"
          >
            标记已处理
          </el-button>
          <el-button
            size="mini"
            type="danger"
            @click="handleDelete(scope.row.id)"
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
  name: 'AdminOrder',
  data() {
    return {
      searchText: '',
      list: [
        { id: 1, username: '张三', bookName: 'Vue.js实战', type: 'reserve', status: 0 },
        { id: 2, username: '李四', bookName: '深入理解Java', type: 'subscribe', status: 0 },
        { id: 3, username: '王五', bookName: '计算机网络', type: 'reserve', status: 1 },
      ]
    }
  },
  computed: {
    filteredList() {
      if (!this.searchText) return this.list
      return this.list.filter(item => {
        return item.username.includes(this.searchText) || item.bookName.includes(this.searchText)
      })
    }
  },
  methods: {
    // 标记状态
    handleStatus(row) {
      row.status = 1
      this.$message.success('已标记为已处理')
    },
    // 删除
    handleDelete(id) {
      this.$confirm('确定删除该记录吗？', '提示', { type: 'warning' }).then(() => {
        this.list = this.list.filter(item => item.id !== id)
        this.$message.success('删除成功')
      })
    }
  }
}
</script>