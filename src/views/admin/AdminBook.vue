<template>
  <div style="padding: 20px;">
    <h3 style="margin-bottom: 20px;">书籍管理</h3>

    <!-- 搜索 + 添加 -->
    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
      <el-input
        v-model="searchText"
        placeholder="搜索书名/作者"
        style="width: 300px;"
        clearable
      />
      <el-button type="primary" @click="addDialog = true">
        添加图书
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="bookList" border style="width: 100%;">
      <el-table-column label="ID" prop="id" align="center" />
      <el-table-column label="书名" prop="name" align="center" />
      <el-table-column label="作者" prop="author" align="center" />
      <el-table-column label="库存" prop="stock" align="center" />
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            type="danger"
            size="mini"
            @click="deleteBook(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加弹窗 -->
    <el-dialog title="添加图书" :visible.sync="addDialog" width="450px">
      <el-form :model="bookForm" label-width="70px">
        <el-form-item label="书名">
          <el-input v-model="bookForm.name" />
        </el-form-item>
        <el-form-item label="作者">
          <el-input v-model="bookForm.author" />
        </el-form-item>
        <el-form-item label="库存">
          <el-input v-model.number="bookForm.stock" type="number" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="addDialog = false">取消</el-button>
        <el-button type="primary" @click="addBook">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AdminBook',
  data() {
    return {
      searchText: '',
      addDialog: false,
      bookList: [
        { id: 1, name: 'Vue.js 实战', author: '张三', stock: 10 },
        { id: 2, name: 'Java 编程思想', author: '李四', stock: 5 },
        { id: 3, name: '计算机网络', author: '王五', stock: 8 }
      ],
      bookForm: {
        name: '',
        author: '',
        stock: 0
      }
    }
  },
  computed: {
    filteredList() {
      if (!this.searchText) return this.bookList
      return this.bookList.filter(item => {
        return item.name.includes(this.searchText) || item.author.includes(this.searchText)
      })
    }
  },
  methods: {
    addBook() {
      const newId = Math.max(...this.bookList.map(b => b.id), 0) + 1
      this.bookList.push({ ...this.bookForm, id: newId })
      this.addDialog = false
      this.bookForm = { name: '', author: '', stock: 0 }
      this.$message.success('添加成功')
    },
    deleteBook(id) {
      this.$confirm('确定删除该图书吗？', '提示', { type: 'warning' }).then(() => {
        this.bookList = this.bookList.filter(item => item.id !== id)
        this.$message.success('删除成功')
      })
    }
  }
}
</script>