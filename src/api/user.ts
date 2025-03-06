import { post } from '@/utils/request';

export function getUserSettings() {
  return post<any>({
    url: '/user/settings',
  });
}

export function updateUserSettings(settings: any) {
  return post<any>({
    url: '/user/settings',
    data: settings,
  });
}

export function updateUserProfile(profile: any) {
  return post<any>({
    url: '/user/profile',
    data: profile,
  });
}

export function changePassword(currentPassword: string, newPassword: string) {
  return post<any>({
    url: '/user/change-password',
    data: { currentPassword, newPassword },
  });
}

// 管理员API
export function getAllUsers(page: number = 1, limit: number = 10) {
  return post<any>({
    url: '/admin/users',
    data: { page, limit },
  });
}

export function updateUserStatus(userId: string, status: 'active' | 'inactive') {
  return post<any>({
    url: '/admin/user/status',
    data: { userId, status },
  });
}