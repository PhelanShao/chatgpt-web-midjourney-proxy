import { ss } from '@/utils/storage'
import { useAuthStore } from '@/store'

// 使用用户ID作为存储键的一部分，确保每个用户有自己的设置
function getStorageKey() {
  const authStore = useAuthStore()
  const userId = authStore.userInfo?.id || 'guest'
  return `userSetting_${userId}`
}

export interface UserSetting {
  theme: string
  language: string
  model_name: string
  background_image?: string
  chat_settings: any
  api_settings?: any
}

export function defaultSetting(): UserSetting {
  return {
    theme: 'dark',
    language: 'zh-CN',
    model_name: 'gpt-3.5-turbo',
    background_image: '',
    chat_settings: {},
    api_settings: {}
  }
}

export function getLocalSetting(): UserSetting {
  const LOCAL_NAME = getStorageKey()
  const localSetting = ss.get(LOCAL_NAME)
  return { ...defaultSetting(), ...localSetting }
}

export function setLocalSetting(setting: UserSetting) {
  const LOCAL_NAME = getStorageKey()
  ss.set(LOCAL_NAME, setting)
}