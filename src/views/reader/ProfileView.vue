<template>
  <div class="profile-container" v-loading="loading">
    <div class="profile-header">
      <h2>个人中心</h2>
    </div>
    
    <div class="profile-content">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="用户ID">{{ readerInfo.id }}</el-descriptions-item>
        <el-descriptions-item label="用户名">{{ readerInfo.username }}</el-descriptions-item>
        <el-descriptions-item label="姓名">{{ readerInfo.name }}</el-descriptions-item>
        <el-descriptions-item label="邮箱">
          <span>{{ readerInfo.email }}</span>
          <el-button type="primary" size="mini" style="margin-left: 10px;" @click="showEditDialog('email')">修改</el-button>
        </el-descriptions-item>
        <el-descriptions-item label="手机号">
          <span>{{ readerInfo.phone }}</span>
          <el-button type="primary" size="mini" style="margin-left: 10px;" @click="showEditDialog('phone')">修改</el-button>
        </el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="readerInfo.status === 1 ? 'success' : 'danger'">
            {{ readerInfo.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="注册时间">{{ readerInfo.createTime }}</el-descriptions-item>
      </el-descriptions>
    </div>

    <!-- 修改邮箱弹窗 -->
    <el-dialog title="修改邮箱" :visible.sync="emailDialogVisible" width="400px">
      <el-form :model="emailForm" :rules="emailRules" ref="emailForm">
        <el-form-item prop="email">
          <el-input v-model="emailForm.email" placeholder="请输入新邮箱"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="emailDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdateEmail" :loading="updating">确定</el-button>
      </span>
    </el-dialog>

    <!-- 修改手机号弹窗 -->
    <el-dialog title="修改手机号" :visible.sync="phoneDialogVisible" width="400px">
      <el-form :model="phoneForm" :rules="phoneRules" ref="phoneForm">
        <el-form-item prop="phone">
          <el-input v-model="phoneForm.phone" placeholder="请输入新手机号"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer">
        <el-button @click="phoneDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleUpdatePhone" :loading="updating">确定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import { getReaderInfo, updateEmail, updatePhone } from '@/api/reader';

export default {
  name: "ProfileView",
  data() {
    return {
      loading: false,
      updating: false,
      readerInfo: {
        id: 0,
        username: '',
        password: null,
        name: '',
        email: '',
        phone: '',
        status: 0,
        createTime: ''
      },
      // 邮箱编辑
      emailDialogVisible: false,
      emailForm: {
        email: ''
      },
      emailRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: 'blur' }
        ]
      },
      // 手机号编辑
      phoneDialogVisible: false,
      phoneForm: {
        phone: ''
      },
      phoneRules: {
        phone: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
        ]
      }
    };
  },
  mounted() {
    this.loadReaderInfo();
  },
  methods: {
    async loadReaderInfo() {
      this.loading = true;
      try {
        const response = await getReaderInfo();
        if (response.code === 1) {
          this.readerInfo = response.data;
        } else {
          this.$message.error(response.msg || '获取个人信息失败');
        }
      } catch (error) {
        console.error('获取个人信息失败:', error);
        this.$message.error('获取个人信息失败');
      } finally {
        this.loading = false;
      }
    },
    
    // 显示编辑弹窗
    showEditDialog(type) {
      if (type === 'email') {
        this.emailForm.email = this.readerInfo.email;
        this.emailDialogVisible = true;
      } else if (type === 'phone') {
        this.phoneForm.phone = this.readerInfo.phone;
        this.phoneDialogVisible = true;
      }
    },
    
    // 更新邮箱
    async handleUpdateEmail() {
      try {
        const valid = await this.$refs.emailForm.validate();
        if (!valid) return;
        
        this.updating = true;
        const response = await updateEmail({ email: this.emailForm.email });
        
        if (response.code === 1) {
          this.$message.success('邮箱修改成功');
          this.emailDialogVisible = false;
          this.loadReaderInfo(); // 重新加载用户信息
        } else {
          this.$message.error(response.msg || '邮箱修改失败');
        }
      } catch (error) {
        console.error('邮箱修改失败:', error);
        this.$message.error('邮箱修改失败');
      } finally {
        this.updating = false;
      }
    },
    
    // 更新手机号
    async handleUpdatePhone() {
      try {
        const valid = await this.$refs.phoneForm.validate();
        if (!valid) return;
        
        this.updating = true;
        const response = await updatePhone({ phone: this.phoneForm.phone });
        
        if (response.code === 1) {
          this.$message.success('手机号修改成功');
          this.phoneDialogVisible = false;
          this.loadReaderInfo(); // 重新加载用户信息
        } else {
          this.$message.error(response.msg || '手机号修改失败');
        }
      } catch (error) {
        console.error('手机号修改失败:', error);
        this.$message.error('手机号修改失败');
      } finally {
        this.updating = false;
      }
    }
  }
};
</script>

<style scoped>
.profile-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.profile-header {
  margin-bottom: 30px;
}

.profile-header h2 {
  font-size: 24px;
  color: #303133;
  font-weight: 500;
}

.profile-content {
  background: #fff;
  padding: 30px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>