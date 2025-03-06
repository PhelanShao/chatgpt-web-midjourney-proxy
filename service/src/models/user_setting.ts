import db from '../database';
import { v4 as uuidv4 } from 'uuid';

export interface IUserSetting {
  _id?: string;
  user_id: string;
  theme: string;
  language: string;
  model_name: string;
  background_image?: string;
  chat_settings?: any;
  api_settings?: {
    OPENAI_API_KEY?: string;
    OPENAI_API_BASE_URL?: string;
    MJ_SERVER?: string;
    MJ_API_SECRET?: string;
    UPLOADER_URL?: string;
    MJ_CDN_WSRV?: boolean;
    SUNO_SERVER?: string;
    SUNO_KEY?: string;
    LUMA_SERVER?: string;
    LUMA_KEY?: string;
    VIGGLE_SERVER?: string;
    VIGGLE_KEY?: string;
    RUNWAY_SERVER?: string;
    RUNWAY_KEY?: string;
    IDEO_SERVER?: string;
    IDEO_KEY?: string;
    KLING_SERVER?: string;
    KLING_KEY?: string;
    PIKA_SERVER?: string;
    PIKA_KEY?: string;
    UDIO_SERVER?: string;
    UDIO_KEY?: string;
    PIXVERSE_SERVER?: string;
    PIXVERSE_KEY?: string;
    IS_SET_SYNC?: boolean;
    GPTS_GX?: boolean;
    IS_LUMA_PRO?: boolean;
    RRUNWAY_VERSION?: string;
    DRAW_TYPE?: string;
    IS_VIGGLE_PRO?: boolean;
    TAB_VIDEO?: string;
    TTS_VOICE?: string;
    REALTIME_SYSMSG?: string;
    REALTIME_MODEL?: string;
    REALTIME_IS_WHISPER?: boolean;
    TAB_MUSIC?: string;
  };
  created_at?: Date;
  updated_at?: Date;
}

// 创建用户设置
export const createUserSetting = async (settingData: Omit<IUserSetting, '_id' | 'created_at' | 'updated_at'>): Promise<IUserSetting> => {
  const now = new Date();
  
  const setting: IUserSetting = {
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
export const findUserSettingByUserId = async (userId: string): Promise<IUserSetting | null> => {
  return new Promise((resolve, reject) => {
    db.settings.findOne({ user_id: userId }, (err, setting) => {
      if (err) reject(err);
      else resolve(setting || null);
    });
  });
};

// 更新用户设置
export const updateUserSetting = async (userId: string, updateData: Partial<IUserSetting>): Promise<IUserSetting | null> => {
  const updateObj = { ...updateData, updated_at: new Date() };
  
  return new Promise((resolve, reject) => {
    db.settings.update({ user_id: userId }, { $set: updateObj }, { returnUpdatedDocs: true }, (err, numAffected, updatedSetting) => {
      if (err) reject(err);
      else if (numAffected === 0) resolve(null);
      else resolve(updatedSetting);
    });
  });
};

// 保存用户聊天设置
export const saveUserChatSettings = async (userId: string, chatSettings: any): Promise<IUserSetting | null> => {
  return updateUserSetting(userId, { chat_settings: chatSettings });
};

// 获取用户聊天设置
export const getUserChatSettings = async (userId: string): Promise<any | null> => {
  const setting = await findUserSettingByUserId(userId);
  return setting?.chat_settings || null;
};

// 保存用户API设置
export const saveUserApiSettings = async (userId: string, apiSettings: any): Promise<IUserSetting | null> => {
  return updateUserSetting(userId, { api_settings: apiSettings });
};

// 获取用户API设置
export const getUserApiSettings = async (userId: string): Promise<any | null> => {
  const setting = await findUserSettingByUserId(userId);
  return setting?.api_settings || null;
};

export default {
  createUserSetting,
  findUserSettingByUserId,
  updateUserSetting,
  saveUserChatSettings,
  getUserChatSettings,
  saveUserApiSettings,
  getUserApiSettings
};