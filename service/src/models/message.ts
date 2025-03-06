import db from '../database';
import { v4 as uuidv4 } from 'uuid';

export interface IMessage {
  _id?: string;
  conversation_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: Date;
}

// 创建消息
export const createMessage = async (messageData: Omit<IMessage, '_id' | 'created_at'>): Promise<IMessage> => {
  const now = new Date();
  
  const message: IMessage = {
    _id: uuidv4(),
    ...messageData,
    created_at: now
  };
  
  return new Promise((resolve, reject) => {
    db.messages.insert(message, (err, newMessage) => {
      if (err) reject(err);
      else resolve(newMessage);
    });
  });
};

// 查找会话的所有消息
export const findMessagesByConversationId = async (conversationId: string): Promise<IMessage[]> => {
  return new Promise((resolve, reject) => {
    db.messages.find({ conversation_id: conversationId }).sort({ created_at: 1 }).exec((err, messages) => {
      if (err) reject(err);
      else resolve(messages);
    });
  });
};

// 查找消息
export const findMessageById = async (id: string): Promise<IMessage | null> => {
  return new Promise((resolve, reject) => {
    db.messages.findOne({ _id: id }, (err, message) => {
      if (err) reject(err);
      else resolve(message || null);
    });
  });
};

// 删除消息
export const deleteMessage = async (id: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.messages.remove({ _id: id }, {}, (err, numRemoved) => {
      if (err) reject(err);
      else resolve(numRemoved > 0);
    });
  });
};

// 删除会话的所有消息
export const deleteMessagesByConversationId = async (conversationId: string): Promise<number> => {
  return new Promise((resolve, reject) => {
    db.messages.remove({ conversation_id: conversationId }, { multi: true }, (err, numRemoved) => {
      if (err) reject(err);
      else resolve(numRemoved);
    });
  });
};

export default {
  createMessage,
  findMessagesByConversationId,
  findMessageById,
  deleteMessage,
  deleteMessagesByConversationId
};