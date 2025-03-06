import db from '../database';
import { v4 as uuidv4 } from 'uuid';

export interface IConversation {
  _id?: string;
  user_id: string;
  title: string;
  model: string;
  created_at?: Date;
  updated_at?: Date;
}

// 创建会话
export const createConversation = async (conversationData: Omit<IConversation, '_id' | 'created_at' | 'updated_at'>, customId?: string): Promise<IConversation> => {
  const now = new Date();
  
  const conversation: IConversation = {
    _id: customId || uuidv4(),
    ...conversationData,
    created_at: now,
    updated_at: now
  };
  
  return new Promise((resolve, reject) => {
    db.conversations.insert(conversation, (err, newConversation) => {
      if (err) reject(err);
      else resolve(newConversation);
    });
  });
};

// 查找用户的所有会话
export const findConversationsByUserId = async (userId: string): Promise<IConversation[]> => {
  return new Promise((resolve, reject) => {
    db.conversations.find({ user_id: userId }).sort({ updated_at: -1 }).exec((err, conversations) => {
      if (err) reject(err);
      else resolve(conversations);
    });
  });
};

// 查找会话
export const findConversationById = async (id: string): Promise<IConversation | null> => {
  return new Promise((resolve, reject) => {
    db.conversations.findOne({ _id: id }, (err, conversation) => {
      if (err) reject(err);
      else resolve(conversation || null);
    });
  });
};

// 更新会话
export const updateConversation = async (id: string, updateData: Partial<IConversation>): Promise<IConversation | null> => {
  const updateObj = { ...updateData, updated_at: new Date() };
  
  return new Promise((resolve, reject) => {
    db.conversations.update({ _id: id }, { $set: updateObj }, { returnUpdatedDocs: true }, (err, numAffected, updatedConversation) => {
      if (err) reject(err);
      else if (numAffected === 0) resolve(null);
      else resolve(updatedConversation);
    });
  });
};

// 删除会话
export const deleteConversation = async (id: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.conversations.remove({ _id: id }, {}, (err, numRemoved) => {
      if (err) reject(err);
      else resolve(numRemoved > 0);
    });
  });
};

export default {
  createConversation,
  findConversationsByUserId,
  findConversationById,
  updateConversation,
  deleteConversation
};