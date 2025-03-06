import { Request, Response } from 'express';
import conversationModel, { IConversation } from '../models/conversation';
import messageModel, { IMessage } from '../models/message';

// 获取用户的所有会话
export const getUserConversations = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '未授权' });
    }

    const conversations = await conversationModel.findConversationsByUserId(userId);
    res.json({ success: true, data: conversations });
  } catch (error) {
    console.error('获取会话列表失败:', error);
    res.status(500).json({ message: '获取会话列表失败' });
  }
};

// 创建新会话
export const createConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '未授权' });
    }

    const { title, model, id } = req.body;
    if (!title || !model) {
      return res.status(400).json({ message: '标题和模型不能为空' });
    }

    const conversation = await conversationModel.createConversation({
      user_id: userId,
      title,
      model
    }, id);

    res.json({ success: true, data: conversation });
  } catch (error) {
    console.error('创建会话失败:', error);
    res.status(500).json({ message: '创建会话失败' });
  }
};

// 更新会话标题
export const updateConversationTitle = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '未授权' });
    }

    const { id, title } = req.body;
    if (!id || !title) {
      return res.status(400).json({ message: '会话ID和标题不能为空' });
    }

    // 检查会话是否属于当前用户
    const conversation = await conversationModel.findConversationById(id);
    if (!conversation) {
      return res.status(404).json({ message: '会话不存在' });
    }

    if (conversation.user_id !== userId) {
      return res.status(403).json({ message: '无权限修改此会话' });
    }

    const updatedConversation = await conversationModel.updateConversation(id, { title });
    res.json({ success: true, data: updatedConversation });
  } catch (error) {
    console.error('更新会话标题失败:', error);
    res.status(500).json({ message: '更新会话标题失败' });
  }
};

// 删除会话
export const deleteConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '未授权' });
    }

    const { id } = req.body;
    if (!id) {
      return res.status(400).json({ message: '会话ID不能为空' });
    }

    // 检查会话是否属于当前用户
    const conversation = await conversationModel.findConversationById(id);
    if (!conversation) {
      return res.status(404).json({ message: '会话不存在' });
    }

    if (conversation.user_id !== userId) {
      return res.status(403).json({ message: '无权限删除此会话' });
    }

    // 删除会话及其所有消息
    await messageModel.deleteMessagesByConversationId(id);
    const success = await conversationModel.deleteConversation(id);

    res.json({ success });
  } catch (error) {
    console.error('删除会话失败:', error);
    res.status(500).json({ message: '删除会话失败' });
  }
};

// 获取会话的所有消息
export const getConversationMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '未授权' });
    }

    const { conversationId } = req.body;
    if (!conversationId) {
      return res.status(400).json({ message: '会话ID不能为空' });
    }

    // 检查会话是否属于当前用户
    const conversation = await conversationModel.findConversationById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: '会话不存在' });
    }

    if (conversation.user_id !== userId) {
      return res.status(403).json({ message: '无权限查看此会话' });
    }

    const messages = await messageModel.findMessagesByConversationId(conversationId);
    res.json({ success: true, data: messages });
  } catch (error) {
    console.error('获取会话消息失败:', error);
    res.status(500).json({ message: '获取会话消息失败' });
  }
};

// 添加消息到会话
export const addMessageToConversation = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '未授权' });
    }

    const { conversationId, role, content } = req.body;
    if (!conversationId || !role || !content) {
      return res.status(400).json({ message: '会话ID、角色和内容不能为空' });
    }

    // 检查会话是否属于当前用户
    const conversation = await conversationModel.findConversationById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: '会话不存在' });
    }

    if (conversation.user_id !== userId) {
      return res.status(403).json({ message: '无权限添加消息到此会话' });
    }

    const message = await messageModel.createMessage({
      conversation_id: conversationId,
      role,
      content
    });

    // 更新会话的更新时间
    await conversationModel.updateConversation(conversationId, { updated_at: new Date() });

    res.json({ success: true, data: message });
  } catch (error) {
    console.error('添加消息失败:', error);
    res.status(500).json({ message: '添加消息失败' });
  }
};

// 删除消息
export const deleteMessage = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '未授权' });
    }

    const { messageId } = req.body;
    if (!messageId) {
      return res.status(400).json({ message: '消息ID不能为空' });
    }

    // 获取消息
    const message = await messageModel.findMessageById(messageId);
    if (!message) {
      return res.status(404).json({ message: '消息不存在' });
    }

    // 检查消息所属的会话是否属于当前用户
    const conversation = await conversationModel.findConversationById(message.conversation_id);
    if (!conversation) {
      return res.status(404).json({ message: '会话不存在' });
    }

    if (conversation.user_id !== userId) {
      return res.status(403).json({ message: '无权限删除此消息' });
    }

    // 删除消息
    const success = await messageModel.deleteMessage(messageId);

    res.json({ success });
  } catch (error) {
    console.error('删除消息失败:', error);
    res.status(500).json({ message: '删除消息失败' });
  }
};

// 清空会话中的所有消息
export const clearConversationMessages = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '未授权' });
    }

    const { conversationId } = req.body;
    if (!conversationId) {
      return res.status(400).json({ message: '会话ID不能为空' });
    }

    // 检查会话是否属于当前用户
    const conversation = await conversationModel.findConversationById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: '会话不存在' });
    }

    if (conversation.user_id !== userId) {
      return res.status(403).json({ message: '无权限清空此会话' });
    }

    // 删除会话中的所有消息
    const numRemoved = await messageModel.deleteMessagesByConversationId(conversationId);

    res.json({ success: true, numRemoved });
  } catch (error) {
    console.error('清空会话消息失败:', error);
    res.status(500).json({ message: '清空会话消息失败' });
  }
};

export default {
  getUserConversations,
  createConversation,
  updateConversationTitle,
  deleteConversation,
  getConversationMessages,
  addMessageToConversation,
  deleteMessage,
  clearConversationMessages
};