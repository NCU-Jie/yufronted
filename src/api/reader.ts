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

export interface Book {
  id: number;
  bookName: string;
  author: string;
  isbn: string;
  publish: string;
  shelfCode: string;
  stock: number;
  total: number;
  imgUrl?: string;
  createTime: string;
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

// 确认领取
export function confirmPickup(reserveId: number) {
  return request<Result>({
    url: `/reader/reserve/confirm/${reserveId}`,
    method: 'put'
  });
}

// 取消领取
export function cancelPickup(reserveId: number) {
  return request<Result>({
    url: `/reader/reserve/cancel-pickup/${reserveId}`,
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

// ==================== 书籍相关（读者） ====================

// 分页查询书籍列表（无查询条件）
export function getBookPage(page: number, pageSize: number) {
  return request<Result<PageResult<Book>>>({
    url: '/reader/book/page',
    method: 'post',
    data: { page, pageSize }
  });
}

// 分页查询书籍列表（带查询条件）
export function searchBooks(data: {
  page: number;
  pageSize: number;
  bookName?: string;
  author?: string;
  publish?: string;
  category?: string;
}) {
  return request<Result<PageResult<Book>>>({
    url: '/reader/book/page',
    method: 'post',
    data
  });
}

// 根据ID查询书籍详情
export function getBookById(bookId: number) {
  return request<Result<Book>>({
    url: `/reader/book/${bookId}`,
    method: 'get'
  });
}

// ==================== 收藏相关（读者） ====================

// 添加收藏
export function addCollect(bookId: number) {
  return request<Result>({
    url: '/reader/collect/add',
    method: 'post',
    params: { bookId }
  });
}

// 取消收藏
export function deleteCollect(bookId: number) {
  return request<Result>({
    url: '/reader/collect/delete',
    method: 'post',
    params: { bookId }
  });
}

// 查询我的收藏列表（分页）
export function getMyCollectList(page: number, pageSize: number) {
  return request<Result<PageResult<any>>>({
    url: '/reader/collect/list',
    method: 'get',
    params: { page, pageSize }
  });
}
