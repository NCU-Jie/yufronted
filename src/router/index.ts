import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    redirect: '/login',
  },
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/login/index.vue"),
    meta: {
      title: "登录",
      notNeedAuth: true
    }
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("@/views/reader/RegisterView.vue"),
    meta: {
      title: "注册",
      notNeedAuth: true
    }
  },


  // ====================
  // 读者端路由
  // ====================
  {
    path: '/reader',
    component: () => import("@/views/reader/HomeView.vue"),
    redirect: '/reader/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'UserDashboard',
        component: () => import("@/views/reader/DashboardView.vue"),
        meta: { title: "系统首页" }
      },
      {
        path: 'collection',
        name: 'UserCollect',
        component: () => import("@/views/reader/CollectionView.vue"),
        meta: { title: "我的收藏" }
      },
      {
        path: 'borrow',
        name: 'UserBorrow',
        component: () => import("@/views/reader/BorrowView.vue"),
        meta: { title: "我的借阅" }
      },
      {
        path: 'reserve',
        name: 'UserReserve',
        component: () => import("@/views/reader/ReserveView.vue"),
        meta: { title: "我的预约" }
      },
      {
        path: 'search',
        name: 'UserSearch',
        component: () => import("@/views/reader/SearchView.vue"),
        meta: { title: "图书检索" }
      }
    ]
  },

  // ====================
  // 管理员端路由
  // ====================
  {
    path: '/admin',
    component: () => import("@/views/admin/AdminHome.vue"),
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'AdminDashboard',
        component: () => import("@/views/admin/AdminDashboard.vue"),
        meta: { title: "管理控制台" }
      },
      {
        path: 'user',
        name: 'AdminUser',
        component: () => import("@/views/admin/AdminUser.vue"),
        meta: { title: "用户管理" }
      },
      {
        path: 'book',
        name: 'AdminBook',
        component: () => import("@/views/admin/AdminBook.vue"),
        meta: { title: "图书管理" }
      },
      {
        path: 'order',
        name: 'AdminOrder',
        component: () => import("@/views/admin/AdminOrder.vue"),
        meta: { title: "预约/订阅管理" }
      },
      {
        path: 'notice',
        name: 'AdminNotice',
        component: () => import("@/views/admin/AdminNotice.vue"),
        meta: { title: "公告/反馈管理" }
      },
      {
        path: 'log',
        name: 'AdminLog',
        component: () => import("@/views/admin/AdminLog.vue"),
        meta: { title: "行为日志" }
      },
      {
        path: 'manager',
        name: 'AdminManager',
        component: () => import("@/views/admin/AdminManager.vue"),
        meta: { title: "管理员管理" }
      },
    ]
  },
]

const router = new VueRouter({
  mode: 'hash',
  routes
})

// ===========================
// 🔥 路由守卫 - 最终修复版
// ===========================
router.beforeEach(async (to, from, next) => {
  document.title = (to.meta?.title) || '图书管理系统';

  // 白名单直接放行（安全写法，解决 TS 报错）
  if (to.meta?.notNeedAuth) {
    return next();
  }

  // 获取登录状态
  const isAdminLogin = store.getters['admin/isAdminAuthenticated']
  const isReaderLogin = store.getters['reader/isReaderAuthenticated']

  // 未登录 → 去登录
  if (!isAdminLogin && !isReaderLogin) {
    return next('/login');
  }

  // 访问管理员页面
  if (to.path.startsWith('/admin')) {
    if (isAdminLogin) {
      return next();
    } else {
      alert('无管理员权限');
      return next('/reader/dashboard');
    }
  }

  // 访问读者页面
  if (to.path.startsWith('/reader')) {
    return next();
  }

  next();
})

export default router