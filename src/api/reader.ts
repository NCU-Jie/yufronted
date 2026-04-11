import request from '@/utils/request';

// 直接在这里定义类型
export interface LoginParams {
  username: string;
  password: string;
}

// 读者登录
export function readerLogin(data: LoginParams) {
  return request({
    url: '/reader/login',
    method: 'post',
    data
  });
}

// 读者注册
export function readerRegister(data: LoginParams) {
  return request({
    url: '/reader/register',
    method: 'post',
    data
  });
}