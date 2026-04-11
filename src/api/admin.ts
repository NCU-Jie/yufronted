import request from '@/utils/request';

// 直接在这里定义类型
export interface LoginParams {
  username: string;
  password: string;
}

// 管理员登录
export function adminLogin(data: LoginParams) {
  return request({
    url: '/admin/login',
    method: 'post',
    data
  });
}