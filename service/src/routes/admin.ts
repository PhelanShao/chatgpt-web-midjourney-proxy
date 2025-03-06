import express from 'express';
import { adminAuth } from '../middleware/auth';
import { 
  getAllUsers, 
  updateUserStatus, 
  resetUserPassword 
} from '../controllers/user';

const router = express.Router();

// 所有管理员路由都需要管理员认证
router.use(adminAuth);

// 获取所有用户
router.get('/users', getAllUsers);

// 更新用户状态
router.put('/users/status', updateUserStatus);

// 重置用户密码
router.put('/users/reset-password', resetUserPassword);

export default router;