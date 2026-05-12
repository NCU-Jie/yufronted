<template>
  <div style="padding: 20px;">
    <div class="header-tool" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
      <h3>书籍管理</h3>
      <el-button type="primary" size="default" @click="openAddDialog">+ 添加图书</el-button>
    </div>

    <!-- 搜索栏 -->
    <el-form :inline="true" :model="searchForm" class="search-form" style="margin-bottom: 20px;">
      <el-form-item label="书名">
        <el-input v-model="searchForm.bookName" placeholder="请输入书名" clearable />
      </el-form-item>
      <el-form-item label="作者">
        <el-input v-model="searchForm.author" placeholder="请输入作者" clearable />
      </el-form-item>
      <el-form-item label="出版社">
        <el-input v-model="searchForm.publish" placeholder="请输入出版社" clearable />
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="searchForm.category" placeholder="请选择分类" clearable>
          <el-option label="计算机" value="计算机"></el-option>
          <el-option label="文学" value="文学"></el-option>
          <el-option label="科普" value="科普"></el-option>
          <el-option label="教育" value="教育"></el-option>
          <el-option label="历史人文" value="历史人文"></el-option>
          <el-option label="经济管理" value="经济管理"></el-option>
          <el-option label="艺术" value="艺术"></el-option>
          <el-option label="哲学心理" value="哲学心理"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">搜索</el-button>
        <el-button @click="handleReset">重置</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table :data="bookList" border style="width: 100%;" v-loading="loading">

      <el-table-column label="序号" align="center" width="80">
        <template slot-scope="scope">
          {{ (page - 1) * pageSize + scope.$index + 1 }}
        </template>
      </el-table-column>

      <el-table-column label="封面" prop="imgUrl" align="center" width="120">
        <template slot-scope="scope">
          <el-image
            v-if="scope.row.imgUrl"
            :src="getImageUrl(scope.row.imgUrl)"
            fit="cover"
            style="width: 60px; height: 80px; border-radius: 4px; cursor: pointer;"
            @click="showBookDetail(scope.row)"
          >
            <div slot="error" class="image-error">
              <i class="el-icon-picture-outline"></i>
            </div>
          </el-image>
          <div v-else class="no-image" style="cursor: pointer;" @click="showBookDetail(scope.row)">
            无图片
          </div>
        </template>
      </el-table-column>
      <el-table-column label="书名" prop="bookName" align="center" />
      <el-table-column label="作者" prop="author" align="center" />
      <el-table-column label="ISBN" prop="isbn" align="center" />
      <el-table-column label="出版社" prop="publish" align="center" />
      <el-table-column label="分类" prop="category" align="center" />
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
        <el-form-item label="封面图片" prop="imgUrl">
          <el-input v-model="bookForm.imgUrl" placeholder="请输入图片路径，如：/images/book/java.jpg" />
          <div v-if="bookForm.imgUrl" class="image-preview">
            <el-image
              :src="getImageUrl(bookForm.imgUrl)"
              fit="cover"
              style="width: 100px; height: 130px; margin-top: 8px; border-radius: 4px;"
            >
              <div slot="error" class="image-error">
                <i class="el-icon-picture-outline"></i>
              </div>
            </el-image>
          </div>
        </el-form-item>
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
        <el-form-item label="分类" prop="category">
          <el-select v-model="bookForm.category" placeholder="请选择分类" style="width: 100%;">
            <el-option label="计算机" value="计算机"></el-option>
            <el-option label="文学" value="文学"></el-option>
            <el-option label="科普" value="科普"></el-option>
            <el-option label="教育" value="教育"></el-option>
            <el-option label="历史人文" value="历史人文"></el-option>
            <el-option label="经济管理" value="经济管理"></el-option>
            <el-option label="艺术" value="艺术"></el-option>
            <el-option label="哲学心理" value="哲学心理"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="书架编号" prop="shelfCode">
          <el-input v-model="bookForm.shelfCode" placeholder="请输入书架编号" />
        </el-form-item>
        <el-form-item label="库存" prop="stock">
          <el-input-number v-model="bookForm.stock" :min="0" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="总数" prop="total">
          <el-input-number v-model="bookForm.total" :min="0" style="width: 100%;" />
        </el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitForm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 图书详情对话框 -->
    <el-dialog title="图书详情" :visible.sync="bookDetailDialogVisible" width="700px">
      <div v-if="currentBook" style="display: flex; gap: 20px;">
        <div style="flex-shrink: 0;">
          <el-image 
            :src="getImageUrl(currentBook.imgUrl)" 
            fit="cover"
            style="width: 150px; height: 200px; border-radius: 4px;"
          >
            <div slot="error" class="image-slot" style="width: 150px; height: 200px; display: flex; align-items: center; justify-content: center; background-color: #f5f7fa; border-radius: 4px;">
              <i class="el-icon-picture-outline" style="font-size: 48px;"></i>
            </div>
          </el-image>
        </div>
        <div class="detail-info" style="flex: 1;">
          <h3 style="margin-top: 0;">{{ currentBook.bookName }}</h3>
          <p><strong>作者：</strong>{{ currentBook.author }}</p>
          <p><strong>ISBN：</strong>{{ currentBook.isbn }}</p>
          <p><strong>出版社：</strong>{{ currentBook.publish }}</p>
          <p><strong>分类：</strong>{{ currentBook.category }}</p>
          <p><strong>书架编号：</strong>{{ currentBook.shelfCode }}</p>
          <p><strong>总数量：</strong>{{ currentBook.total }} 本</p>
          <p>
            <strong>可借数量：</strong>
            <span :style="{ color: currentBook.stock > 0 ? '#67C23A' : '#F56C6C' }">
              {{ currentBook.stock }} 本
            </span>
          </p>
          <div v-if="currentBook.description" class="book-description" style="margin-top: 15px;">
            <strong>图书简介：</strong>
            <p style="margin-top: 8px; line-height: 1.6; max-height: 150px; overflow-y: auto;">{{ currentBook.description }}</p>
          </div>
        </div>
      </div>
      <div slot="footer" class="dialog-footer">
        <el-button @click="bookDetailDialogVisible = false">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { getBookPage, addBook, updateBook, deleteBook, getAdminBookById } from '@/api/admin';

export default {
  name: 'AdminBook',
  data() {
    return {
      loading: false,
      bookList: [],
      page: 1,
      pageSize: 10,
      total: 0,
      searchForm: {
        bookName: '',
        author: '',
        publish: '',
        category: ''
      },
      dialogVisible: false,
      isEdit: false,
      bookForm: {
        id: null,
        imgUrl: '',
        bookName: '',
        author: '',
        isbn: '',
        publish: '',
        category: '',
        shelfCode: '',
        stock: 0,
        total: 0
      },
      rules: {
        bookName: [{ required: true, message: '请输入书名', trigger: 'blur' }],
        author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
        isbn: [{ required: true, message: '请输入ISBN', trigger: 'blur' }],
        publish: [{ required: true, message: '请输入出版社', trigger: 'blur' }],
        category: [{ required: true, message: '请选择分类', trigger: 'change' }],
        shelfCode: [{ required: true, message: '请输入书架编号', trigger: 'blur' }]
      },
      // 图书详情对话框
      bookDetailDialogVisible: false,
      currentBook: null
    };
  },
  mounted() {
    this.loadBooks();
  },
  methods: {
    // 处理图片URL
    getImageUrl(url) {
      if (!url) return '';
      // 去除可能存在的反引号、引号等特殊字符
      const cleanUrl = url.replace(/[`'"]/g, '');
      // 如果是相对路径，添加后端服务器地址
      if (cleanUrl.startsWith('/')) {
        return process.env.VUE_APP_BASE_API ? `${process.env.VUE_APP_BASE_API}${cleanUrl}` : `http://localhost:8080${cleanUrl}`;
      }
      return cleanUrl;
    },
    async loadBooks() {
      this.loading = true;
      try {
        const res = await getBookPage({
          page: this.page,
          pageSize: this.pageSize,
          bookName: this.searchForm.bookName || undefined,
          author: this.searchForm.author || undefined,
          publish: this.searchForm.publish || undefined,
          category: this.searchForm.category || undefined
        });
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
    handleSearch() {
      this.page = 1;
      this.loadBooks();
    },
    handleReset() {
      this.searchForm = {
        bookName: '',
        author: '',
        publish: '',
        category: ''
      };
      this.page = 1;
      this.loadBooks();
    },
    openAddDialog() {
      this.isEdit = false;
      this.bookForm = {
        id: null,
        imgUrl: '',
        bookName: '',
        author: '',
        isbn: '',
        publish: '',
        category: '',
        shelfCode: '',
        stock: 0,
        total: 0
      };
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.formRef && this.$refs.formRef.clearValidate();
      });
    },
    openEditDialog(row) {
      this.isEdit = true;
      this.bookForm = { ...row };
      this.dialogVisible = true;
      this.$nextTick(() => {
        this.$refs.formRef && this.$refs.formRef.clearValidate();
      });
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
              this.$message.success(this.isEdit ? '修改成功' : '添加成功');
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
      }).catch(() => {
        // 用户取消操作，不做处理
      });
    },
    async showBookDetail(row) {
      try {
        const res = await getAdminBookById(row.id);
        if (res.code === 1 || res.code === 200) {
          this.currentBook = res.data;
          this.bookDetailDialogVisible = true;
        } else {
          this.$message.error(res.msg || '获取图书详情失败');
        }
      } catch (error) {
        this.$message.error('获取图书详情失败');
        console.error(error);
      }
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
};
</script>