import { defineStore } from 'pinia'
import { store } from '@/store/helper'
import { getUserSettings, updateUserSettings, saveUserChatSettings, getUserChatSettings, saveUserApiSettings, getUserApiSettings } from '@/api/user_setting'
import { defaultSetting, getLocalSetting, setLocalSetting } from './helper'

export interface UserSettingState {
  theme: string
  language: string
  model_name: string
  background_image?: string
  chat_settings: any
  api_settings?: any
  loading: boolean
}

export const useUserSettingStore = defineStore('user-setting-store', {
  state: (): UserSettingState => {
    const localSetting = getLocalSetting()
    return {
      theme: localSetting.theme,
      language: localSetting.language,
      model_name: localSetting.model_name,
      background_image: localSetting.background_image,
      chat_settings: localSetting.chat_settings,
      api_settings: localSetting.api_settings,
      loading: false
    }
  },

  actions: {
    async fetchUserSettings() {
      try {
        this.loading = true
        const { data } = await getUserSettings()
        if (data) {
          this.theme = data.theme || 'dark'
          this.language = data.language || 'zh-CN'
          this.model_name = data.model_name || 'gpt-3.5-turbo'
          this.background_image = data.background_image || ''
          this.chat_settings = data.chat_settings || {}
          
          // 更新本地存储
          this.saveToLocalStorage()
        }
        return Promise.resolve(data)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },

    async updateSettings(settings: Partial<UserSettingState>) {
      try {
        this.loading = true
        const { data } = await updateUserSettings(settings)
        if (data) {
          if (settings.theme) this.theme = settings.theme
          if (settings.language) this.language = settings.language
          if (settings.model_name) this.model_name = settings.model_name
          if (settings.background_image !== undefined) this.background_image = settings.background_image
          
          // 更新本地存储
          this.saveToLocalStorage()
        }
        return Promise.resolve(data)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },

    async saveChatSettings(chatSettings: any) {
      try {
        this.loading = true
        const { data } = await saveUserChatSettings(chatSettings)
        if (data) {
          this.chat_settings = chatSettings
          
          // 更新本地存储
          this.saveToLocalStorage()
        }
        return Promise.resolve(data)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },

    async fetchChatSettings() {
      try {
        this.loading = true
        const { data } = await getUserChatSettings()
        if (data) {
          this.chat_settings = data
          
          // 更新本地存储
          this.saveToLocalStorage()
        }
        return Promise.resolve(data)
      } catch (error) {
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },
    
    // 保存API设置到后端
    async saveApiSettings(apiSettings: any) {
      console.log('开始保存API设置:', apiSettings);
      try {
        this.loading = true
        console.log('调用saveUserApiSettings API');
        const { data } = await saveUserApiSettings(apiSettings)
        console.log('API设置保存成功:', data);
        if (data) {
          console.log('更新本地API设置');
          this.api_settings = apiSettings
          
          // 更新本地存储
          this.saveToLocalStorage()
          console.log('本地存储更新完成');
        } else {
          console.warn('服务器返回的数据无效:', data);
        }
        return Promise.resolve(data)
      } catch (error) {
        console.error('保存API设置失败:', error);
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },
    
    // 获取API设置
    async fetchApiSettings() {
      console.log('开始获取API设置');
      try {
        this.loading = true
        console.log('调用getUserApiSettings API');
        const { data } = await getUserApiSettings()
        console.log('获取API设置成功:', data);
        if (data) {
          console.log('更新本地API设置');
          this.api_settings = data
          
          // 更新本地存储
          this.saveToLocalStorage()
          console.log('本地存储更新完成');
        } else {
          console.warn('服务器返回的数据无效或为空:', data);
        }
        return Promise.resolve(data)
      } catch (error) {
        console.error('获取API设置失败:', error);
        return Promise.reject(error)
      } finally {
        this.loading = false
      }
    },
    
    // 保存设置到本地存储
    saveToLocalStorage() {
      setLocalSetting({
        theme: this.theme,
        language: this.language,
        model_name: this.model_name,
        background_image: this.background_image,
        chat_settings: this.chat_settings,
        api_settings: this.api_settings
      })
    }
  }
})

export function useUserSettingStoreWithout() {
  return useUserSettingStore(store)
}