import { ss } from '@/utils/storage'
import { useAuthStore } from '@/store'

// 使用用户ID作为存储键的一部分，确保每个用户有自己的聊天记录
function getStorageKey() {
  const authStore = useAuthStore()
  const userId = authStore.userInfo?.id || 'guest'
  return `chatStorage_${userId}`
}

export function defaultState(): Chat.ChatState {
  const uuid = 1002
  return {
    active: uuid,
    usingContext: true,
    history: [{ uuid, title: 'New Chat', isEdit: false }],
    chat: [{ uuid, data: [] }],
  }
}

export function getLocalState(): Chat.ChatState {
  const LOCAL_NAME = getStorageKey()
  const localState = ss.get(LOCAL_NAME)
  return { ...defaultState(), ...localState }
}

export function setLocalState(state: Chat.ChatState) {
  const LOCAL_NAME = getStorageKey()
  ss.set(LOCAL_NAME, state)
}
