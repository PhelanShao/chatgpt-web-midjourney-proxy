import { defineStore } from 'pinia'
import { getToken, removeToken, setToken, getUserInfo, setUserInfo, removeUserInfo } from './helper'
import { store } from '@/store/helper'
import { fetchSession } from '@/api'
import { login, register, logout, getCurrentUser } from '@/api/auth'
import { gptConfigStore, homeStore } from '@/store/homeStore'
import { useAppStore } from '@/store'
const appStore = useAppStore()

export interface UserInfo {
  id: string
  username: string
  email: string
  role: string
}

interface SessionResponse {
  theme?: string
  auth: boolean
  model: 'ChatGPTAPI' | 'ChatGPTUnofficialProxyAPI'
}

export interface AuthState {
  token: string | undefined
  userInfo: UserInfo | null
  session: SessionResponse | null
}

export const useAuthStore = defineStore('auth-store', {
  state: (): AuthState => ({
    token: getToken(),
    userInfo: getUserInfo(),
    session: null,
  }),

  getters: {
    isChatGPTAPI(state): boolean {
      return state.session?.model === 'ChatGPTAPI'
    },
    
    isLoggedIn(state): boolean {
      return !!state.token && !!state.userInfo
    },
    
    isAdmin(state): boolean {
      return state.userInfo?.role === 'admin'
    }
  },

  actions: {
    async getSession() {
      try {
        const { data } = await fetchSession<SessionResponse>()
        this.session = { ...data }
        
        homeStore.setMyData({session: data });
        if(appStore.$state.theme=='auto' ){
            appStore.setTheme(  data.theme && data.theme=='light' ?'light':'dark')
        }

        let str = localStorage.getItem('gptConfigStore');
        if( ! str ) setTimeout( ()=>  gptConfigStore.setInit() , 500);
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },
    
    async login(email: string, password: string) {
      try {
        const { data } = await login(email, password)
        this.token = data.token
        this.userInfo = data.user
        setToken(data.token)
        setUserInfo(data.user)
        
        // 登录成功后重新加载页面，确保加载正确的用户数据
        // 使用延时确保数据已保存
        setTimeout(() => {
          window.location.reload()
        }, 500)
        
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    async register(username: string, email: string, password: string) {
      try {
        const { data } = await register(username, email, password)
        this.token = data.token
        this.userInfo = data.user
        setToken(data.token)
        setUserInfo(data.user)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    async logout() {
      try {
        await logout()
        this.token = undefined
        this.userInfo = null
        removeToken()
        removeUserInfo()
        
        // 注销后重新加载页面，确保加载正确的用户数据
        // 使用延时确保数据已清除
        setTimeout(() => {
          window.location.reload()
        }, 500)
        
        return Promise.resolve()
      }
      catch (error) {
        return Promise.reject(error)
      }
    },
    
    async fetchCurrentUser() {
      try {
        const { data } = await getCurrentUser()
        this.userInfo = data.user
        setUserInfo(data.user)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    setToken(token: string) {
      this.token = token
      setToken(token)
    },

    removeToken() {
      this.token = undefined
      this.userInfo = null
      removeToken()
      removeUserInfo()
    },
  },
})

export function useAuthStoreWithout() {
  return useAuthStore(store)
}
