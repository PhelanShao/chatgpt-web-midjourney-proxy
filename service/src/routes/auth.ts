import express from 'express';
import { 
  register, 
  login, 
  logout, 
  getCurrentUser, 
  forgotPassword, 
  resetPassword 
} from '../controllers/auth';
import { jwtAuth } from '../middleware/auth';

const router = express.Router();

// 注册
router.post('/register', register);

// 登录
router.post('/login', login);

// 登出
router.post('/logout', logout);

// 获取当前用户信息（需要JWT认证）
router.get('/me', jwtAuth, getCurrentUser);

// 忘记密码
router.post('/forgot-password', forgotPassword);

// 重置密码
router.post('/reset-password', resetPassword);

export default router;