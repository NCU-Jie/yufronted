<template>
  <div style="padding: 20px;">
    <h3 style="margin-bottom: 20px;">用户行为日志</h3>

    <!-- 搜索 -->
    <div style="margin-bottom: 20px;">
      <el-input
        v-model="searchText"
        placeholder="搜索用户名/操作内容"
        style="width: 320px;"
        clearable
      />
    </div>

    <!-- 日志表格 -->
    <el-table :data="logList" border style="width: 100%;">
      <el-table-column label="ID" prop="id" align="center" />
      <el-table-column label="操作用户" prop="username" align="center" />
      <el-table-column label="操作内容" prop="content" align="center" />
      <el-table-column label="操作时间" prop="createTime" align="center" />
      <el-table-column label="IP地址" prop="ip" align="center" />
      
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            type="danger"
            size="mini"
            @click="deleteLog(scope.row.id)"
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
  name: 'AdminLog',
  data() {
    return {
      searchText: '',
      logList: [
        { id: 1, username: '张三', content: '登录系统', createTime: '2025-04-08 10:10:10', ip: '192.168.1.10' },
        { id: 2, username: '李四', content: '借阅书籍《Vue实战》', createTime: '2025-04-08 11:20:30', ip: '192.168.1.11' },
        { id: 3, username: '王五', content: '订阅书籍《Java编程思想》', createTime: '2025-04-08 14:30:00', ip: '192.168.1.12' },
        { id: 4, username: 'admin', content: '删除用户', createTime: '2025-04-08 15:00:00', ip: '192.168.1.1' }
      ]
    }
  },
  computed: {
    // 搜索过滤
    filteredList() {
      if (!this.searchText) return this.logList
      return this.logList.filter(item => {
        return item.username.includes(this.searchText) || item.content.includes(this.searchText)
      })
    }
  },
  methods: {
    // 删除日志
    deleteLog(id) {
      this.$confirm('确定删除该日志吗？', '提示', { type: 'warning' }).then(() => {
        this.logList = this.logList.filter(item => item.id !== id)
        this.$message.success('删除成功')
      })
    }
  }
}
</script>