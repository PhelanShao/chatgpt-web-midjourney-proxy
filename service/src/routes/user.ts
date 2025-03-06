import express from 'express';
import { jwtAuth } from '../middleware/auth';
import { 
  getUserSettings, 
  updateUserSettings, 
  updateUserProfile, 
  updateUserPassword 
} from '../controllers/user';

const router = express.Router();

// 所有用户路由都需要JWT认证
router.use(jwtAuth);

// 获取用户设置
router.get('/settings', getUserSettings);

// 更新用户设置
router.put('/settings', updateUserSettings);

// 更新用户资料
router.put('/profile', updateUserProfile);

// 更新用户密码
router.put('/password', updateUserPassword);

export default router;