import express from 'express';
import { jwtAuth } from '../middleware/auth';
import { 
  getUserConversations,
  createConversation,
  updateConversationTitle,
  deleteConversation,
  getConversationMessages,
  addMessageToConversation,
  deleteMessage,
  clearConversationMessages
} from '../controllers/conversation';

const router = express.Router();

// 所有会话路由都需要JWT认证
router.use(jwtAuth);

// 获取用户的所有会话
router.post('/list', getUserConversations);

// 创建新会话
router.post('/create', createConversation);

// 更新会话标题
router.post('/update', updateConversationTitle);

// 删除会话
router.post('/delete', deleteConversation);

// 获取会话的所有消息
router.post('/messages', getConversationMessages);

// 添加消息到会话
router.post('/message/add', addMessageToConversation);

// 删除消息
router.post('/message/delete', deleteMessage);

// 清空会话中的所有消息
router.post('/message/clear', clearConversationMessages);

export default router;