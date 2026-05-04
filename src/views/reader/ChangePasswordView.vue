<template>
  <div class="change-password-container">
    <div class="change-password-header">
      <h2>修改密码</h2>
    </div>
    
    <div class="change-password-content">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordForm" label-width="100px">
        <el-form-item label="原密码" prop="oldPassword">
          <el-input 
            v-model="passwordForm.oldPassword" 
            type="password" 
            placeholder="请输入原密码" 
            show-password
          ></el-input>
        </el-form-item>
        
        <el-form-item label="新密码" prop="newPassword">
          <el-input 
            v-model="passwordForm.newPassword" 
            type="password" 
            placeholder="请输入新密码" 
            show-password
          ></el-input>
        </el-form-item>
        
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input 
            v-model="passwordForm.confirmPassword" 
            type="password" 
            placeholder="请再次输入新密码" 
            show-password
          ></el-input>
        </el-form-item>
        
        <el-form-item>
          <el-button type="primary" @click="handleSubmit" :loading="loading">确认修改</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import { updatePassword } from '@/api/reader';

export default {
  name: "ChangePasswordView",
  data() {
    // 确认密码验证
    const validateConfirmPassword = (rule, value, callback) => {
      if (value === '') {
        callback(new Error('请再次输入密码'));
      } else if (value !== this.passwordForm.newPassword) {
        callback(new Error('两次输入密码不一致!'));
      } else {
        callback();
      }
    };

    return {
      loading: false,
      passwordForm: {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      },
      passwordRules: {
        oldPassword: [
          { required: true, message: '请输入原密码', trigger: 'blur' }
        ],
        newPassword: [
          { required: true, message: '请输入新密码', trigger: 'blur' },
          { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
        ],
        confirmPassword: [
          { required: true, validator: validateConfirmPassword, trigger: 'blur' }
        ]
      }
    };
  },
  methods: {
    async handleSubmit() {
      try {
        const valid = await this.$refs.passwordForm.validate();
        if (!valid) return;
        
        this.loading = true;
        const response = await updatePassword({
          oldPassword: this.passwordForm.oldPassword,
          newPassword: this.passwordForm.newPassword
        });
        
        if (response.code === 1) {
          this.$message.success('密码修改成功，请重新登录');
          // 清空表单
          this.handleReset();
          // 跳转到登录页
          setTimeout(() => {
            this.$router.push('/login');
          }, 1500);
        } else {
          this.$message.error(response.msg || '密码修改失败');
        }
      } catch (error) {
        console.error('密码修改失败:', error);
        this.$message.error('密码修改失败');
      } finally {
        this.loading = false;
      }
    },
    
    handleReset() {
      this.passwordForm = {
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
      this.$refs.passwordForm.clearValidate();
    }
  }
};
</script>

<style scoped>
.change-password-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.change-password-header {
  margin-bottom: 30px;
}

.change-password-header h2 {
  font-size: 24px;
  color: #303133;
  font-weight: 500;
}

.change-password-content {
  background: #fff;
  padding: 30px;
  border-radius: 4px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}
</style>