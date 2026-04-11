<template>
  <div class="my-borrow-container" style="padding: 20px;">
    <h3>我的借阅</h3>

    <el-tabs v-model="activeTab" style="margin-top: 20px;">
      <!-- 在借图书 -->
      <el-tab-pane label="在借图书" name="borrowing">
        <el-table :data="borrowingList" border style="width:100%">
          <el-table-column prop="bookName" label="书名" />
          <el-table-column prop="location" label="书架位置" />
          <el-table-column prop="borrowDate" label="借阅日期" />
          <el-table-column prop="returnDate" label="应还日期" />
          <el-table-column prop="daysLeft" label="剩余天数" />
          <el-table-column label="操作">
            <template slot-scope="scope">
              <el-button type="primary" size="mini" @click="renew(scope.row)">
                续借
              </el-button>
              <el-button type="success" size="mini" @click="returnBook(scope.row)">
                归还
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>

      <!-- 已还图书 -->
      <el-tab-pane label="已还图书" name="returned">
        <el-table :data="returnedList" border style="width:100%">
          <el-table-column prop="bookName" label="书名" />
          <el-table-column prop="location" label="书架位置" />
          <el-table-column prop="borrowDate" label="借阅日期" />
          <el-table-column prop="realReturnDate" label="实际归还日期" />
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script>
export default {
  name: "MyBorrow",
  data() {
    return {
      activeTab: "borrowing",
      // 在借图书列表（带书架位置 + 倒计时）
      borrowingList: [
        {
          id: 1,
          bookName: "Vue从入门到精通",
          location: "A区-1号书架-第2层", // 书架位置
          borrowDate: "2025-03-20",
          returnDate: "2025-04-20",
          daysLeft: 12,
        },
        {
          id: 2,
          bookName: "SpringBoot实战",
          location: "B区-3号书架-第1层",
          borrowDate: "2025-03-25",
          returnDate: "2025-04-25",
          daysLeft: 17,
        },
      ],
      // 已还记录
      returnedList: [
        {
          id: 3,
          bookName: "计算机网络",
          location: "C区-2号书架-第3层",
          borrowDate: "2025-01-10",
          realReturnDate: "2025-02-10",
        },
      ],
    };
  },
  methods: {
    // 续借
    renew(row) {
      this.$message.success(`《${row.bookName}》续借成功！`);
    },
    // 归还
    returnBook(row) {
      this.$message.success(`《${row.bookName}》归还成功！`);
      // 归还后从在借列表移除
      this.borrowingList = this.borrowingList.filter((item) => item.id !== row.id);
      this.returnedList.push({
        ...row,
        realReturnDate: new Date().toLocaleDateString(),
      });
    },
  },
};
</script>