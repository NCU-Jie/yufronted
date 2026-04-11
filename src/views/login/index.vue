<template>
  <div class="login-container">
    <h1>登录</h1>

    <el-radio-group v-model="loginType" class="login-type-switch">
      <el-radio label="reader">读者登录</el-radio>
      <el-radio label="admin">管理员登录</el-radio>
    </el-radio-group>

    <el-form :model="loginForm" ref="loginForm" class="login-form">
      <el-form-item prop="username">
        <el-input v-model="loginForm.username" placeholder="用户名"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input v-model="loginForm.password" type="password" placeholder="密码"></el-input>
      </el-form-item>

      <el-button 
        type="primary" 
        @click="handleLogin"
        :loading="loading"
        class="custom-login-btn"
      >
        {{ loginType === 'admin' ? '管理员登录' : '读者登录' }}
      </el-button>

      <div class="custom-login-link" v-if="loginType === 'reader'">
        还没有账号？<el-link type="primary" @click="goToRegister">立即注册</el-link>
      </div>
    </el-form>
  </div>
</template>

<script>
// 直接引入你的两个登录接口
import { readerLogin } from '@/api/reader'
import { adminLogin } from '@/api/admin'

export default {
  name: "LoginPage",
  data() {
    return {
      loginType: "reader",
      loginForm: {
        username: "",
        password: "",
      },
      loading: false
    };
  },
  methods: {
    goToRegister() {
      this.$router.push('/register');
    },
    async handleLogin() {
  if (!this.loginForm.username || !this.loginForm.password) {
    this.$message.error('请输入用户名和密码');
    return;
  }

  this.loading = true;
  try {
    // 管理员登录
    if (this.loginType === 'admin') {
      await this.$store.dispatch('admin/login', {
        username: this.loginForm.username,
        password: this.loginForm.password
      });
      this.$message.success('管理员登录成功');
      this.$router.push('/admin/dashboard');
    } 
    // 读者登录
    else {
      await this.$store.dispatch('reader/login', {
        username: this.loginForm.username,
        password: this.loginForm.password
      });
      this.$message.success('读者登录成功');
      this.$router.push('/reader/dashboard');
    }

  } catch (error) {
    this.$message.error(error.message || '登录失败');
  } finally {
    this.loading = false;
  }
}
  }
}
</script>

<style scoped>
.login-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #f5f5f5;
}

.login-type-switch {
  margin-bottom: 20px;
}

.login-form {
  width: 360px;
  padding: 30px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}

.custom-login-btn {
  width: 100%;
  margin-top: 10px;
  height: 40px;
  font-size: 16px;
  border-radius: 4px;
  background-color: #409EFF;
  border-color: #409EFF;
}

.custom-login-btn:hover {
  background-color: #66b1ff;
  border-color: #66b1ff;
}

.custom-login-btn:active {
  background-color: #3a8ee6;
  border-color: #3a8ee6;
}

.custom-login-link {
  margin-top: 15px;
  text-align: center;
  font-size: 14px;
  color: #606266;
}
</style>