import { post } from '@/utils/request';

export interface IConversation {
  _id?: string;
  user_id: string;
  title: string;
  model: string;
  created_at?: Date;
  updated_at?: Date;
}

export interface IMessage {
  _id?: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: Date;
}

// 获取用户的所有会话
export function getUserConversations() {
  return post<IConversation[]>({
    url: '/conversation/list',
  });
}

// 创建新会话
export function createConversation(title: string, model: string, id?: string) {
  return post<IConversation>({
    url: '/conversation/create',
    data: { title, model, id },
  });
}

// 更新会话标题
export function updateConversationTitle(id: string, title: string) {
  return post<IConversation>({
    url: '/conversation/update',
    data: { id, title },
  });
}

// 删除会话
export function deleteConversation(id: string) {
  return post<boolean>({
    url: '/conversation/delete',
    data: { id },
  });
}

// 获取会话的所有消息
export function getConversationMessages(conversationId: string) {
  return post<IMessage[]>({
    url: '/conversation/messages',
    data: { conversationId },
  });
}

// 添加消息到会话
export function addMessageToConversation(conversationId: string, role: 'user' | 'assistant' | 'system', content: string) {
  return post<IMessage>({
    url: '/conversation/message/add',
    data: { conversationId, role, content },
  });
}

// 删除会话中的消息
export function deleteMessage(messageId: string) {
  return post<boolean>({
    url: '/conversation/message/delete',
    data: { messageId },
  });
}

// 清空会话中的所有消息
export function clearConversationMessages(conversationId: string) {
  return post<boolean>({
    url: '/conversation/message/clear',
    data: { conversationId },
  });
}