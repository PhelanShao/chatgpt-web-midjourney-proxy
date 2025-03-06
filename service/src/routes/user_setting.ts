import express from 'express';
import { jwtAuth } from '../middleware/auth';
import {
  getUserSettings,
  updateUserSettings,
  saveUserChatSettings,
  getUserChatSettings,
  saveUserApiSettings,
  getUserApiSettings
} from '../controllers/user_setting';

const router = express.Router();

// 所有用户设置路由都需要JWT认证
router.use(jwtAuth);

// 获取用户设置
router.get('/', getUserSettings);

// 更新用户设置
router.put('/', updateUserSettings);

// 保存用户聊天设置
router.post('/chat', saveUserChatSettings);

// 获取用户聊天设置
router.get('/chat', getUserChatSettings);

// 保存用户API设置
router.post('/api', saveUserApiSettings);

// 获取用户API设置
router.get('/api', getUserApiSettings);

export default router;