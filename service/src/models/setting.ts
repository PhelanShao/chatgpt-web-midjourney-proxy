import db from '../database';
import { v4 as uuidv4 } from 'uuid';

export interface ISetting {
  _id?: string;
  user_id: string;
  theme: 'light' | 'dark';
  language: string;
  model_name: string;
  created_at?: Date;
  updated_at?: Date;
}

// 创建设置
export const createSetting = async (settingData: Omit<ISetting, '_id' | 'created_at' | 'updated_at'>): Promise<ISetting> => {
  const now = new Date();
  
  const setting: ISetting = {
    _id: uuidv4(),
    ...settingData,
    created_at: now,
    updated_at: now
  };
  
  return new Promise((resolve, reject) => {
    db.settings.insert(setting, (err, newSetting) => {
      if (err) reject(err);
      else resolve(newSetting);
    });
  });
};

// 查找用户设置
export const findSettingByUserId = async (userId: string): Promise<ISetting | null> => {
  return new Promise((resolve, reject) => {
    db.settings.findOne({ user_id: userId }, (err, setting) => {
      if (err) reject(err);
      else resolve(setting || null);
    });
  });
};

// 更新设置
export const updateSetting = async (userId: string, updateData: Partial<ISetting>): Promise<ISetting | null> => {
  const updateObj = { ...updateData, updated_at: new Date() };
  
  return new Promise((resolve, reject) => {
    db.settings.update({ user_id: userId }, { $set: updateObj }, { returnUpdatedDocs: true }, (err, numAffected, updatedSetting) => {
      if (err) reject(err);
      else if (numAffected === 0) resolve(null);
      else resolve(updatedSetting);
    });
  });
};

// 删除设置
export const deleteSetting = async (userId: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.settings.remove({ user_id: userId }, {}, (err, numRemoved) => {
      if (err) reject(err);
      else resolve(numRemoved > 0);
    });
  });
};

export default {
  createSetting,
  findSettingByUserId,
  updateSetting,
  deleteSetting
};