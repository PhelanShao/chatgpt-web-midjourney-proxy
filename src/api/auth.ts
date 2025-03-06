import { post } from '@/utils/request';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  email: string;
  password: string;
}

export function login(email: string, password: string) {
  return post<any>({
    url: '/auth/login',
    data: { email, password },
  });
}

export function register(username: string, email: string, password: string) {
  return post<any>({
    url: '/auth/register',
    data: { username, email, password },
  });
}

export function logout() {
  return post<any>({
    url: '/auth/logout',
  });
}

export function getCurrentUser() {
  return post<any>({
    url: '/auth/me',
  });
}

export function forgotPassword(email: string) {
  return post<any>({
    url: '/auth/forgot-password',
    data: { email },
  });
}

export function resetPassword(token: string, password: string) {
  return post<any>({
    url: '/auth/reset-password',
    data: { token, password },
  });
}