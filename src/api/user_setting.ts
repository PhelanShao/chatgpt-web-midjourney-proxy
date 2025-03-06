import { post, get } from '@/utils/request';

// 获取用户设置
export function getUserSettings() {
  return get<any>({
    url: '/user-setting',
  });
}

// 更新用户设置
export function updateUserSettings(settings: any) {
  return post<any>({
    url: '/user-setting',
    data: settings,
  });
}

// 保存用户聊天设置
export function saveUserChatSettings(chatSettings: any) {
  return post<any>({
    url: '/user-setting/chat',
    data: { chat_settings: chatSettings },
  });
}

// 获取用户聊天设置
export function getUserChatSettings() {
  return get<any>({
    url: '/user-setting/chat',
  });
}

// 保存用户API设置
export function saveUserApiSettings(apiSettings: any) {
  return post<any>({
    url: '/user-setting/api',
    data: { api_settings: apiSettings },
  });
}

// 获取用户API设置
export function getUserApiSettings() {
  return get<any>({
    url: '/user-setting/api',
  });
}