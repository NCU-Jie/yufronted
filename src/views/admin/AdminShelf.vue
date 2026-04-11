<template>
  <div style="padding: 20px;">
    <h3 style="margin-bottom: 20px;">书架管理</h3>

    <!-- 搜索 + 添加 -->
    <div style="display: flex; gap: 10px; margin-bottom: 20px;">
      <el-input
        v-model="searchText"
        placeholder="搜索书架名称/位置"
        style="width: 300px;"
        clearable
      />
      <el-button type="primary" @click="dialogVisible = true">
        添加书架
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="shelfList" border style="width: 100%;">
      <el-table-column label="ID" prop="id" align="center" />
      <el-table-column label="书架名称" prop="name" align="center" />
      <el-table-column label="位置" prop="location" align="center" />
      <el-table-column label="备注" prop="remark" align="center" />
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            type="danger"
            size="mini"
            @click="deleteShelf(scope.row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加弹窗 -->
    <el-dialog title="添加书架" :visible.sync="dialogVisible" width="450px">
      <el-form :model="form" label-width="70px">
        <el-form-item label="书架名称">
          <el-input v-model="form.name" placeholder="例如：文学区" />
        </el-form-item>
        <el-form-item label="位置">
          <el-input v-model="form.location" placeholder="例如：一楼A区" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="form.remark" type="textarea" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="addShelf">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'AdminShelf',
  data() {
    return {
      searchText: '',
      dialogVisible: false,
      shelfList: [
        { id: 1, name: '文学类书架', location: '一楼A区', remark: '存放小说、散文' },
        { id: 2, name: '科技类书架', location: '一楼B区', remark: '计算机、理工' },
        { id: 3, name: '少儿类书架', location: '二楼C区', remark: '儿童读物' }
      ],
      form: {
        name: '',
        location: '',
        remark: ''
      }
    }
  },
  computed: {
    filteredList() {
      if (!this.searchText) return this.shelfList
      return this.shelfList.filter(item => {
        return item.name.includes(this.searchText) || item.location.includes(this.searchText)
      })
    }
  },
  methods: {
    addShelf() {
      const newId = Math.max(...this.shelfList.map(s => s.id), 0) + 1
      this.shelfList.push({ ...this.form, id: newId })
      this.dialogVisible = false
      this.form = { name: '', location: '', remark: '' }
      this.$message.success('添加成功')
    },
    deleteShelf(id) {
      this.$confirm('确定删除该书架吗？', '提示', { type: 'warning' }).then(() => {
        this.shelfList = this.shelfList.filter(item => item.id !== id)
        this.$message.success('删除成功')
      })
    }
  }
}
</script>