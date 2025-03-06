import { ss } from '@/utils/storage'

const TOKEN_KEY = 'SECRET_TOKEN'
const USER_INFO_KEY = 'USER_INFO'

export function getToken() {
  return ss.get(TOKEN_KEY)
}

export function setToken(token: string) {
  return ss.set(TOKEN_KEY, token)
}

export function removeToken() {
  return ss.remove(TOKEN_KEY)
}

export function getUserInfo() {
  return ss.get(USER_INFO_KEY)
}

export function setUserInfo(userInfo: any) {
  return ss.set(USER_INFO_KEY, userInfo)
}

export function removeUserInfo() {
  return ss.remove(USER_INFO_KEY)
}
