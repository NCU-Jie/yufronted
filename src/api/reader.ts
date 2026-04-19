import request from '@/utils/request';

// ==================== 类型定义 ====================

export interface LoginParams {
  username: string;
  password: string;
}

export interface FeedbackAddDTO {
  content: string;
}

export interface SubscribeAddDTO {
  bookName: string;
  author: string;
  remark: string;
}

export interface BorrowRecord {
  id: number;
  bookId: number;
  bookName?: string;
  borrowTime: string;
  returnTime: string;
  status: number; // 0-借阅中, 1-已归还
}

export interface Announcement {
  id: number;
  adminId: number;
  title: string;
  content: string;
  createTime: string;
}

export interface Feedback {
  id: number;
  readerId: number;
  content: string;
  reply: string;
  createTime: string;
}

export interface Reserve {
  id: number;
  bookId: number;
  bookName?: string;
  readerId: number;
  reserveTime: string;
  status: number; // 0-预约中, 1-已完成, 2-已取消
}

export interface PageResult<T = any> {
  records: T[];
  total: number;
}

export interface Result<T = any> {
  code: number;
  data: T;
  msg: string;
}

// ==================== 读者登录注册 ====================

// 读者登录
export function readerLogin(data: LoginParams) {
  return request<Result<Map<string, object>>>({
    url: '/reader/login',
    method: 'post',
    data
  });
}

// 读者注册
export function readerRegister(data: LoginParams & { name: string }) {
  return request<Result>({
    url: '/reader/register',
    method: 'post',
    data
  });
}

// ==================== 借阅相关（读者） ====================

// 分页查询我的借阅列表
export function getMyBorrowPage(params: {
  page: number;
  pageSize: number;
  status?: number;
}) {
  return request<Result<PageResult<BorrowRecord>>>({
    url: '/reader/borrow/my/page',
    method: 'get',
    params
  });
}

// 归还书籍
export function returnBook(borrowId: number) {
  return request<Result>({
    url: `/reader/borrow/return/${borrowId}`,
    method: 'put'
  });
}

// 借阅书籍
export function borrowBook(bookId: number) {
  return request<Result>({
    url: `/reader/borrow/${bookId}`,
    method: 'post'
  });
}

// ==================== 公告相关（读者） ====================

// 分页查询公告列表
export function getAnnouncementPage(page: number, pageSize: number) {
  return request<Result<PageResult<Announcement>>>({
    url: '/reader/announcement/page',
    method: 'get',
    params: { page, pageSize }
  });
}

// 根据ID查询公告详情
export function getAnnouncementById(announcementId: number) {
  return request<Result<Announcement>>({
    url: `/reader/announcement/${announcementId}`,
    method: 'get'
  });
}

// ==================== 反馈相关（读者） ====================

// 提交反馈
export function submitFeedback(data: FeedbackAddDTO) {
  return request<Result>({
    url: '/reader/feedback',
    method: 'post',
    data
  });
}

// 分页查询我的反馈列表
export function getMyFeedbackPage(page: number, pageSize: number) {
  return request<Result<PageResult<Feedback>>>({
    url: '/reader/feedback/my/page',
    method: 'get',
    params: { page, pageSize }
  });
}

// ==================== 订阅相关（读者） ====================

// 提交书籍订阅
export function submitSubscribe(data: SubscribeAddDTO) {
  return request<Result>({
    url: '/reader/subscribe',
    method: 'post',
    data
  });
}

// ==================== 预约相关（读者） ====================

// 取消预约
export function cancelReserve(reserveId: number) {
  return request<Result>({
    url: `/reader/reserve/cancel/${reserveId}`,
    method: 'put'
  });
}

// 分页查询我的预约列表
export function getMyReservePage(params: {
  page: number;
  pageSize: number;
  status?: number;
}) {
  return request<Result<PageResult<Reserve>>>({
    url: '/reader/reserve/my/page',
    method: 'get',
    params
  });
}

// 预约书籍
export function reserveBook(bookId: number) {
  return request<Result>({
    url: `/reader/reserve/${bookId}`,
    method: 'post'
  });
}
