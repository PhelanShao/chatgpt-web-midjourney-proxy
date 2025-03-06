import type { Router } from 'vue-router'
import { useAuthStoreWithout } from '@/store/modules/auth'

export function setupPageGuard(router: Router) {
  router.beforeEach(async (to, from, next) => {
    const authStore = useAuthStoreWithout()
    
    // 获取会话信息
    if (!authStore.session) {
      try {
        const data = await authStore.getSession()
        
        // 检查用户管理系统是否可用
        const userManagementEnabled = data.userManagementEnabled !== false;
        
        // 如果用户管理系统不可用，则不检查认证
        if (!userManagementEnabled) {
          next();
          return;
        }
        
        // 用户管理系统可用，执行认证检查
        if (to.meta.requiresAuth) {
          // 检查是否已登录
          if (!authStore.isLoggedIn) {
            next({ name: 'Login', query: { redirect: to.fullPath } })
            return
          }
          
          // 检查是否需要管理员权限
          if (to.meta.requiresAdmin && !authStore.isAdmin) {
            next({ name: '403' })
            return
          }
        }
        
        // 已登录用户访问登录/注册页面，重定向到首页
        if (authStore.isLoggedIn && (to.name === 'Login' || to.name === 'Register')) {
          next({ name: 'Root' })
          return
        }
        
        if (String(data.auth) === 'false' && authStore.token)
          authStore.removeToken()
        if (to.path === '/500')
          next({ name: 'Root' })
        else
          next()
      }
      catch (error) {
        if (to.path !== '/500')
          next({ name: '500' })
        else
          next()
      }
    }
    else {
      // 检查用户管理系统是否可用
      const userManagementEnabled = authStore.session.userManagementEnabled !== false;
      
      // 如果用户管理系统不可用，则不检查认证
      if (!userManagementEnabled) {
        next();
        return;
      }
      
      // 用户管理系统可用，执行认证检查
      if (to.meta.requiresAuth) {
        // 检查是否已登录
        if (!authStore.isLoggedIn) {
          next({ name: 'Login', query: { redirect: to.fullPath } })
          return
        }
        
        // 检查是否需要管理员权限
        if (to.meta.requiresAdmin && !authStore.isAdmin) {
          next({ name: '403' })
          return
        }
      }
      
      // 已登录用户访问登录/注册页面，重定向到首页
      if (authStore.isLoggedIn && (to.name === 'Login' || to.name === 'Register')) {
        next({ name: 'Root' })
        return
      }
      
      next()
    }
  })
}
