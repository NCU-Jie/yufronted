import request from '@/utils/request';

// ==================== 类型定义 ====================

export interface LoginParams {
  username: string;
  password: string;
}

export interface BookAddDTO {
  bookName: string;
  author: string;
  isbn: string;
  publish: string;
  shelfCode: string;
  stock: number;
  total: number;
  imgUrl?: string;
}

export interface BookUpdateDTO extends BookAddDTO {
  id: number;
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

export interface ReaderAddDTO {
  username: string;
  password: string;
  name: string;
}

export interface ReaderUpdateDTO {
  id: number;
  name: string;
}

export interface Reader {
  id: number;
  username: string;
  name: string;
  password: string;
  status: number;
  createTime: string;
}

export interface BorrowAddDTO {
  readerId: number;
  bookId: number;
}

export interface Borrow {
  id: number;
  readerId: number;
  bookId: number;
  borrowTime: string;
  returnTime: string;
  status: number;
}

export interface AnnouncementAddDTO {
  title: string;
  content: string;
}

export interface Announcement {
  id: number;
  adminId: number;
  title: string;
  content: string;
  createTime: string;
}

export interface FeedbackReplyDTO {
  feedbackId: number;
  reply: string;
}

export interface Feedback {
  id: number;
  readerId: number;
  content: string;
  reply: string;
  createTime: string;
}

export interface Log {
  id: number;
  userId: number;
  userType: string;
  name: string;
  operation: string;
  createTime: string;
}

export interface AdminAddDTO {
  username: string;
  password: string;
  name: string;
  role: number;
  status: number;
}

export interface AdminUpdateDTO {
  id: number;
  name: string;
  role: number;
  status: number;
}

export interface Admin {
  id: number;
  username: string;
  name: string;
  password: string;
  role: number;
  status: number;
  createTime: string;
}

export interface ReserveAddDTO {
  readerId: number;
  bookId: number;
}

export interface Reserve {
  id: number;
  readerId: number;
  bookId: number;
  reserveTime: string;
  status: number;
}

export interface SubscribeAddDTO {
  bookName: string;
  author: string;
  remark: string;
}

export interface Subscribe {
  id: number;
  readerId: number;
  bookName: string;
  author: string;
  remark: string;
  status: number;
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

// ==================== 管理员登录相关 ====================

// 管理员登录
export function adminLogin(data: LoginParams) {
  return request<Result<Map<string, object>>>({
    url: '/admin/login',
    method: 'post',
    data
  });
}

// ==================== 管理员管理 ====================

// 新增管理员
export function addAdmin(data: AdminAddDTO) {
  return request<Result>({
    url: '/admin',
    method: 'post',
    data
  });
}

// 修改管理员信息
export function updateAdmin(data: AdminUpdateDTO) {
  return request<Result>({
    url: '/admin',
    method: 'put',
    data
  });
}

// 分页查询管理员列表
export function getAdminPage(data: {
  page: number;
  pageSize: number;
  username?: string;
  name?: string;
}) {
  return request<Result<PageResult>>({
    url: '/admin/page',
    method: 'post',
    data
  });
}

// 根据ID查询管理员详情
export function getAdminById(adminId: number) {
  return request<Result<Admin>>({
    url: `/admin/${adminId}`,
    method: 'get'
  });
}

// 删除管理员
export function deleteAdmin(adminId: number) {
  return request<Result>({
    url: `/admin/${adminId}`,
    method: 'delete'
  });
}

// 重置管理员密码
export function resetAdminPassword(data: { id: number; newPassword: string }) {
  return request<Result>({
    url: '/admin/reset-password',
    method: 'put',
    data
  });
}

// ==================== 书籍管理 ====================

// 新增书籍
export function addBook(data: BookAddDTO) {
  return request<Result>({
    url: '/admin/book',
    method: 'post',
    data
  });
}

// 修改书籍信息
export function updateBook(data: BookUpdateDTO) {
  return request<Result>({
    url: '/admin/book',
    method: 'put',
    data
  });
}

// 删除书籍
export function deleteBook(bookId: number) {
  return request<Result>({
    url: `/admin/book/${bookId}`,
    method: 'delete'
  });
}

// ==================== 公共接口 ====================

// 分页查询书籍列表（管理员专用接口，支持搜索条件）
export function getBookPage(data: {
  page: number;
  pageSize: number;
  bookName?: string;
  author?: string;
  publish?: string;
  category?: string;
}) {
  return request<Result<PageResult<Book>>>({
    url: '/admin/book/page',
    method: 'post',
    data
  });
}

// 根据ID查询书籍详情（公共接口）
export function getBookById(bookId: number) {
  return request<Result<Book>>({
    url: `/common/book/${bookId}`,
    method: 'get'
  });
}

// 获取统计数据(公共接口)
export function getStatistics() {
  return request<Result<{ totalBooks: number; borrowedBooks: number; availableBooks: number }>>({
    url: '/common/statistics',
    method: 'get'
  });
}

// ==================== 管理员仪表盘统计 ====================

// 获取管理员仪表盘统计数据
export function getAdminDashboardStatistics() {
  return request<Result<{
    totalUsers: number;
    totalBooks: number;
    pendingReserves: number;
    pendingSubscribes: number;
    totalAnnouncements: number;
    totalFeedbacks: number;
    totalBorrows: number;
    todayLogins: number;
  }>>({
    url: '/admin/statistics/dashboard',
    method: 'get'
  });
}

// ==================== 读者管理（管理员） ====================

// 新增读者
export function addReader(data: ReaderAddDTO) {
  return request<Result>({
    url: '/admin/reader',
    method: 'post',
    data
  });
}

// 修改读者信息
export function updateReader(data: ReaderUpdateDTO) {
  return request<Result>({
    url: '/admin/reader',
    method: 'put',
    data
  });
}

// 分页查询读者列表
export function getReaderPage(data: {
  page: number;
  pageSize: number;
  username?: string;
  name?: string;
}) {
  return request<Result<PageResult<Reader>>>({
    url: '/admin/reader/page',
    method: 'post',
    data
  });
}

// 启用-禁用读者账号
export function updateReaderStatus(readerId: number, status: number) {
  return request<Result>({
    url: `/admin/reader/status/${readerId}`,
    method: 'put',
    params: { status }
  });
}

// 根据ID查询读者详情
export function getReaderById(readerId: number) {
  return request<Result<Reader>>({
    url: `/admin/reader/${readerId}`,
    method: 'get'
  });
}

// 删除读者
export function deleteReader(readerId: number) {
  return request<Result>({
    url: `/admin/reader/${readerId}`,
    method: 'delete'
  });
}

// 重置读者密码
export function resetReaderPassword(data: { id: number; newPassword: string }) {
  return request<Result>({
    url: '/admin/reader/reset-password',
    method: 'put',
    data
  });
}

// ==================== 借阅管理（管理员） ====================

// 借阅书籍（代借）
export function adminBorrowBook(data: BorrowAddDTO) {
  return request<Result>({
    url: '/admin/borrow',
    method: 'post',
    data
  });
}

// 分页查询借阅列表
export function getBorrowPage(params: {
  page: number;
  pageSize: number;
  bookId?: number;
  readerId?: number;
  status?: number;
}) {
  return request<Result<PageResult<Borrow>>>({
    url: '/admin/borrow/page',
    method: 'get',
    params
  });
}

// 归还书籍（管理员操作）
export function adminReturnBook(borrowId: number) {
  return request<Result>({
    url: `/admin/borrow/return/${borrowId}`,
    method: 'put'
  });
}

// 根据ID查询借阅详情
export function getBorrowById(borrowId: number) {
  return request<Result<Borrow>>({
    url: `/admin/borrow/${borrowId}`,
    method: 'get'
  });
}

// 删除借阅记录
export function deleteBorrow(borrowId: number) {
  return request<Result>({
    url: `/admin/borrow/${borrowId}`,
    method: 'delete'
  });
}

// ==================== 公告管理 ====================

// 新增公告
export function addAnnouncement(data: AnnouncementAddDTO) {
  return request<Result>({
    url: '/admin/announcement',
    method: 'post',
    data
  });
}

// 修改公告
export function updateAnnouncement(data: Announcement) {
  return request<Result>({
    url: '/admin/announcement',
    method: 'put',
    data
  });
}

// 分页查询公告列表
export function getAnnouncementPage(page: number, pageSize: number) {
  return request<Result<PageResult<Announcement>>>({
    url: '/admin/announcement/page',
    method: 'get',
    params: { page, pageSize }
  });
}

// 根据ID查询公告详情
export function getAnnouncementById(announcementId: number) {
  return request<Result<Announcement>>({
    url: `/admin/announcement/${announcementId}`,
    method: 'get'
  });
}

// 删除公告
export function deleteAnnouncement(announcementId: number) {
  return request<Result>({
    url: `/admin/announcement/${announcementId}`,
    method: 'delete'
  });
}

// ==================== 反馈管理 ====================

// 分页查询反馈列表
export function getFeedbackPage(params: {
  page: number;
  pageSize: number;
  readerId?: number;
}) {
  return request<Result<PageResult<Feedback>>>({
    url: '/admin/feedback/page',
    method: 'get',
    params
  });
}

// 回复反馈
export function replyFeedback(data: FeedbackReplyDTO) {
  return request<Result>({
    url: '/admin/feedback/reply',
    method: 'put',
    data
  });
}

// 根据ID查询反馈详情
export function getFeedbackById(feedbackId: number) {
  return request<Result<Feedback>>({
    url: `/admin/feedback/${feedbackId}`,
    method: 'get'
  });
}

// 删除反馈
export function deleteFeedback(feedbackId: number) {
  return request<Result>({
    url: `/admin/feedback/${feedbackId}`,
    method: 'delete'
  });
}

// ==================== 日志管理 ====================

// 分页查询日志列表
export function getLogPage(page: number, pageSize: number) {
  return request<Result<PageResult<Log>>>({
    url: '/admin/log/page',
    method: 'get',
    params: { page, pageSize }
  });
}

// 根据ID查询日志详情
export function getLogById(logId: number) {
  return request<Result<Log>>({
    url: `/admin/log/${logId}`,
    method: 'get'
  });
}

// 删除日志
export function deleteLog(logId: number) {
  return request<Result>({
    url: `/admin/log/${logId}`,
    method: 'delete'
  });
}

// ==================== 预约管理（管理员） ====================

// 代读者预约书籍
export function adminReserveBook(data: ReserveAddDTO) {
  return request<Result>({
    url: '/admin/reserve',
    method: 'post',
    data
  });
}

// 取消预约（管理员操作）
export function adminCancelReserve(reserveId: number) {
  return request<Result>({
    url: `/admin/reserve/cancel/${reserveId}`,
    method: 'put'
  });
}

// 完成预约
export function completeReserve(reserveId: number) {
  return request<Result>({
    url: `/admin/reserve/complete/${reserveId}`,
    method: 'put'
  });
}

// 分页查询预约列表
export function getReservePage(params: {
  page: number;
  pageSize: number;
  readerId?: number;
  status?: number;
}) {
  return request<Result<PageResult<Reserve>>>({
    url: '/admin/reserve/page',
    method: 'get',
    params
  });
}

// 根据ID查询预约详情
export function getReserveById(reserveId: number) {
  return request<Result<Reserve>>({
    url: `/admin/reserve/${reserveId}`,
    method: 'get'
  });
}

// 删除预约记录
export function deleteReserve(reserveId: number) {
  return request<Result>({
    url: `/admin/reserve/${reserveId}`,
    method: 'delete'
  });
}

// ==================== 订阅管理（管理员） ====================

// 分页查询订阅列表
export function getSubscribePage(page: number, pageSize: number) {
  return request<Result<PageResult<Subscribe>>>({
    url: '/admin/subscribe/page',
    method: 'get',
    params: { page, pageSize }
  });
}

// 处理订阅
export function processSubscribe(subscribeId: number) {
  return request<Result>({
    url: `/admin/subscribe/process/${subscribeId}`,
    method: 'put'
  });
}

// 根据ID查询订阅详情
export function getSubscribeById(subscribeId: number) {
  return request<Result<Subscribe>>({
    url: `/admin/subscribe/${subscribeId}`,
    method: 'get'
  });
}

// 删除订阅
export function deleteSubscribe(subscribeId: number) {
  return request<Result>({
    url: `/admin/subscribe/${subscribeId}`,
    method: 'delete'
  });
}
