<template>
  <div style="padding: 20px;">
    <h3>我的收藏</h3>

    <el-table :data="collectList" border style="width:100%;margin-top:20px">
      <el-table-column label="书名" prop="bookName" />
      <el-table-column label="作者" prop="author" />
      <el-table-column label="书架位置" prop="location" />
      <el-table-column label="状态">
        <template slot-scope="scope">
          <el-tag :type="scope.row.status === '可借' ? 'success' : 'warning'">
            {{ scope.row.status }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <!-- 借阅 -->
          <el-button
            size="mini"
            type="primary"
            @click="borrow(scope.row)"
            :disabled="scope.row.status !== '可借'"
          >
            借阅
          </el-button>

          <!-- 预约 -->
          <el-button
            size="mini"
            type="warning"
            @click="reserve(scope.row)"
            :disabled="scope.row.status === '可借'"
          >
            预约
          </el-button>

          <!-- 取消收藏 -->
          <el-button
            size="mini"
            type="danger"
            @click="cancelCollect(scope.row)"
          >
            取消收藏
          </el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script>
export default {
  name: "MyCollect",
  data() {
    return {
      // 收藏列表
      collectList: [
        {
          id: 1,
          bookName: "Vue从入门到精通",
          author: "张三",
          location: "A区-1号书架",
          status: "可借",
        },
        {
          id: 2,
          bookName: "SpringBoot实战",
          author: "李四",
          location: "B区-2号书架",
          status: "不可借",
        },
        {
          id: 3,
          bookName: "计算机网络",
          author: "王五",
          location: "C区-3号书架",
          status: "可借",
        },
      ],
    };
  },
  methods: {
    // 借阅
    borrow(row) {
      this.$message.success(`《${row.bookName}》借阅成功`);
    },

    // 预约
    reserve(row) {
      this.$message.success(`《${row.bookName}》预约成功`);
    },

    // 取消收藏
    cancelCollect(row) {
      this.collectList = this.collectList.filter((item) => item.id !== row.id);
      this.$message.success(`已取消收藏《${row.bookName}》`);
    },
  },
};
</script>