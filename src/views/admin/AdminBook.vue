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
        @keyup.enter.native="loadBooks"
      />
      <el-button type="primary" @click="openAddDialog">
        添加图书
      </el-button>
    </div>

    <!-- 表格 -->
    <el-table :data="bookList" border style="width: 100%;" v-loading="loading">
      <el-table-column label="ID" prop="id" align="center" width="80" />
      <el-table-column label="书名" prop="bookName" align="center" />
      <el-table-column label="作者" prop="author" align="center" />
      <el-table-column label="ISBN" prop="isbn" align="center" />
      <el-table-column label="出版社" prop="publish" align="center" />
      <el-table-column label="书架编号" prop="shelfCode" align="center" />
      <el-table-column label="库存" prop="stock" align="center" width="100" />
      <el-table-column label="总数" prop="total" align="center" width="100" />
      <el-table-column label="操作" align="center" width="200">
        <template slot-scope="scope">
          <el-button
            type="primary"
            size="mini"
            @click="openEditDialog(scope.row)"
          >
            编辑
          </el-button>
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

    <!-- 添加/编辑弹窗 -->
    <el-dialog :title="isEdit ? '编辑图书' : '添加图书'" :visible.sync="dialogVisible" width="500px">
      <el-form :model="bookForm" label-width="100px" ref="formRef" :rules="rules">
        <el-form-item label="书名" prop="bookName">
          <el-input v-model="bookForm.bookName" placeholder="请输入书名" />
        </el-form-item>
        <el-form-item label="作者" prop="author">
          <el-input v-model="bookForm.author" placeholder="请输入作者" />
        </el-form-item>
        <el-form-item label="ISBN" prop="isbn">
          <el-input v-model="bookForm.isbn" placeholder="请输入ISBN" />
        </el-form-item>
        <el-form-item label="出版社" prop="publish">
          <el-input v-model="bookForm.publish" placeholder="请输入出版社" />
        </el-form-item>
        <el-form-item label="书架编号" prop="shelfCode">
          <el-input v-model="bookForm.shelfCode" placeholder="请输入书架编号" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input v-model.number="bookForm.stock" type="number" placeholder="请输入库存" />
        </el-form-item>
        <el-form-item label="总数" prop="total">
          <el-input v-model.number="bookForm.total" type="number" placeholder="请输入总数" />
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getBookPage, addBook, updateBook, deleteBook } from '@/api/admin';

export default {
  name: 'AdminBook',
  data() {
    return {
      searchText: '',
      loading: false,
      dialogVisible: false,
      isEdit: false,
      bookList: [],
      page: 1,
      pageSize: 10,
      total: 0,
      bookForm: {
        id: null,
        bookName: '',
        author: '',
        isbn: '',
        publish: '',
        shelfCode: '',
        stock: 0,
        total: 0
      },
      rules: {
        bookName: [{ required: true, message: '请输入书名', trigger: 'blur' }],
        author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
        isbn: [{ required: true, message: '请输入ISBN', trigger: 'blur' }],
        stock: [{ required: true, message: '请输入库存', trigger: 'blur' }],
        total: [{ required: true, message: '请输入总数', trigger: 'blur' }]
      }
    }
  },
  mounted() {
    this.loadBooks();
  },
  methods: {
    async loadBooks() {
      this.loading = true;
      try {
        const res = await getBookPage(this.page, this.pageSize);
        if (res.code === 1 || res.code === 200) {
          this.bookList = res.data.records || [];
          this.total = res.data.total || 0;
        } else {
          this.$message.error(res.msg || '加载失败');
        }
      } catch (error) {
        this.$message.error('加载书籍列表失败');
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    openAddDialog() {
      this.isEdit = false;
      this.bookForm = {
        id: null,
        bookName: '',
        author: '',
        isbn: '',
        publish: '',
        shelfCode: '',
        stock: 0,
        total: 0
      };
      this.dialogVisible = true;
    },
    openEditDialog(row) {
      this.isEdit = true;
      this.bookForm = { ...row };
      this.dialogVisible = true;
    },
    async submitForm() {
      this.$refs.formRef.validate(async (valid) => {
        if (valid) {
          try {
            let res;
            if (this.isEdit) {
              res = await updateBook(this.bookForm);
            } else {
              res = await addBook(this.bookForm);
            }
            if (res.code === 1 || res.code === 200) {
              this.$message.success(this.isEdit ? '编辑成功' : '添加成功');
              this.dialogVisible = false;
              this.loadBooks();
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
    async deleteBook(id) {
      this.$confirm('确定删除该图书吗？', '提示', { type: 'warning' }).then(async () => {
        try {
          const res = await deleteBook(id);
          if (res.code === 1 || res.code === 200) {
            this.$message.success('删除成功');
            this.loadBooks();
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
      this.loadBooks();
    },
    handleCurrentChange(val) {
      this.page = val;
      this.loadBooks();
    }
  }
}
</script>