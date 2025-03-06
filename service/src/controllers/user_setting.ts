import { Request, Response } from 'express';
import userSettingModel, { IUserSetting } from '../models/user_setting';

// 获取用户设置
export const getUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '未授权' });
    }

    const settings = await userSettingModel.findUserSettingByUserId(userId);
    if (!settings) {
      // 如果没有找到设置，创建默认设置
      const defaultSettings: Omit<IUserSetting, '_id' | 'created_at' | 'updated_at'> = {
        user_id: userId,
        theme: 'dark',
        language: 'zh-CN',
        model_name: 'gpt-3.5-turbo',
        chat_settings: {}
      };
      
      const newSettings = await userSettingModel.createUserSetting(defaultSettings);
      return res.json({ success: true, data: newSettings });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('获取用户设置失败:', error);
    res.status(500).json({ message: '获取用户设置失败' });
  }
};

// 更新用户设置
export const updateUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '未授权' });
    }

    const { theme, language, model_name, background_image } = req.body;
    const updateData: Partial<IUserSetting> = {};
    
    if (theme) updateData.theme = theme;
    if (language) updateData.language = language;
    if (model_name) updateData.model_name = model_name;
    if (background_image !== undefined) updateData.background_image = background_image;

    const settings = await userSettingModel.updateUserSetting(userId, updateData);
    if (!settings) {
      return res.status(404).json({ message: '用户设置不存在' });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('更新用户设置失败:', error);
    res.status(500).json({ message: '更新用户设置失败' });
  }
};

// 保存用户聊天设置
export const saveUserChatSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '未授权' });
    }

    const { chat_settings } = req.body;
    if (!chat_settings) {
      return res.status(400).json({ message: '聊天设置不能为空' });
    }

    const settings = await userSettingModel.saveUserChatSettings(userId, chat_settings);
    if (!settings) {
      return res.status(404).json({ message: '用户设置不存在' });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('保存用户聊天设置失败:', error);
    res.status(500).json({ message: '保存用户聊天设置失败' });
  }
};

// 获取用户聊天设置
export const getUserChatSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '未授权' });
    }

    const chatSettings = await userSettingModel.getUserChatSettings(userId);
    res.json({ success: true, data: chatSettings || {} });
  } catch (error) {
    console.error('获取用户聊天设置失败:', error);
    res.status(500).json({ message: '获取用户聊天设置失败' });
  }
};

// 保存用户API设置
export const saveUserApiSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '未授权' });
    }

    const { api_settings } = req.body;
    if (!api_settings) {
      return res.status(400).json({ message: 'API设置不能为空' });
    }

    const settings = await userSettingModel.saveUserApiSettings(userId, api_settings);
    if (!settings) {
      return res.status(404).json({ message: '用户设置不存在' });
    }

    res.json({ success: true, data: settings });
  } catch (error) {
    console.error('保存用户API设置失败:', error);
    res.status(500).json({ message: '保存用户API设置失败' });
  }
};

// 获取用户API设置
export const getUserApiSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: '未授权' });
    }

    const apiSettings = await userSettingModel.getUserApiSettings(userId);
    res.json({ success: true, data: apiSettings || {} });
  } catch (error) {
    console.error('获取用户API设置失败:', error);
    res.status(500).json({ message: '获取用户API设置失败' });
  }
};

export default {
  getUserSettings,
  updateUserSettings,
  saveUserChatSettings,
  getUserChatSettings,
  saveUserApiSettings,
  getUserApiSettings
};