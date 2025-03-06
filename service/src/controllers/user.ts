import { Request, Response } from 'express';
import User, { findUserById, updateUser, findAllUsers, comparePassword, hashPassword } from '../models/user';
import Setting, { findSettingByUserId, updateSetting, createSetting } from '../models/setting';
import { mlog } from '../middleware/auth';

// 获取用户设置
export const getUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    
    // 查找用户设置
    let setting = await findSettingByUserId(userId);
    
    // 如果设置不存在，创建默认设置
    if (!setting) {
      setting = await createSetting({
        user_id: userId,
        theme: 'dark',
        language: 'zh-CN',
        model_name: 'gpt-3.5-turbo'
      });
    }
    
    res.json({
      status: 'Success',
      message: '获取用户设置成功',
      data: {
        setting
      }
    });
  } catch (error) {
    mlog('Get User Settings Error:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message || '获取用户设置失败',
      data: null
    });
  }
};

// 更新用户设置
export const updateUserSettings = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { theme, language, model_name } = req.body;
    
    // 查找用户设置
    let setting = await findSettingByUserId(userId);
    
    // 如果设置不存在，创建默认设置
    if (!setting) {
      setting = await createSetting({
        user_id: userId,
        theme: theme || 'dark',
        language: language || 'zh-CN',
        model_name: model_name || 'gpt-3.5-turbo'
      });
    } else {
      // 更新设置
      setting = await updateSetting(userId, {
        theme,
        language,
        model_name
      });
    }
    
    res.json({
      status: 'Success',
      message: '更新用户设置成功',
      data: {
        setting
      }
    });
  } catch (error) {
    mlog('Update User Settings Error:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message || '更新用户设置失败',
      data: null
    });
  }
};

// 更新用户资料
export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { username } = req.body;
    
    // 查找用户
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'Fail',
        message: '用户不存在',
        data: null
      });
    }
    
    // 更新用户资料
    const updatedUser = await updateUser(userId, { username });
    
    res.json({
      status: 'Success',
      message: '更新用户资料成功',
      data: {
        user: {
          id: updatedUser._id,
          username: updatedUser.username,
          email: updatedUser.email,
          role: updatedUser.role
        }
      }
    });
  } catch (error) {
    mlog('Update User Profile Error:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message || '更新用户资料失败',
      data: null
    });
  }
};

// 更新用户密码
export const updateUserPassword = async (req: Request, res: Response) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // 查找用户
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'Fail',
        message: '用户不存在',
        data: null
      });
    }
    
    // 验证当前密码
    const isMatch = await comparePassword(currentPassword, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        status: 'Fail',
        message: '当前密码错误',
        data: null
      });
    }
    
    // 更新密码
    await updateUser(userId, { password_hash: newPassword });
    
    res.json({
      status: 'Success',
      message: '更新密码成功',
      data: null
    });
  } catch (error) {
    mlog('Update User Password Error:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message || '更新密码失败',
      data: null
    });
  }
};

// 获取所有用户（管理员功能）
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    // 分页参数
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    
    // 查找所有用户
    const users = await findAllUsers();
    const paginatedUsers = users.slice(skip, skip + limit);
    
    // 计算总数
    const total = users.length;
    
    res.json({
      status: 'Success',
      message: '获取用户列表成功',
      data: {
        users: paginatedUsers.map(user => ({
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          status: user.status,
          created_at: user.created_at,
          last_login: user.last_login
        })),
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    mlog('Get All Users Error:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message || '获取用户列表失败',
      data: null
    });
  }
};

// 更新用户状态（管理员功能）
export const updateUserStatus = async (req: Request, res: Response) => {
  try {
    const { userId, status } = req.body;
    
    // 查找用户
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'Fail',
        message: '用户不存在',
        data: null
      });
    }
    
    // 不能修改自己的状态
    if (userId === req.user.id) {
      return res.status(400).json({
        status: 'Fail',
        message: '不能修改自己的状态',
        data: null
      });
    }
    
    // 更新用户状态
    await updateUser(userId, { status });
    
    res.json({
      status: 'Success',
      message: '更新用户状态成功',
      data: null
    });
  } catch (error) {
    mlog('Update User Status Error:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message || '更新用户状态失败',
      data: null
    });
  }
};

// 重置用户密码（管理员功能）
export const resetUserPassword = async (req: Request, res: Response) => {
  try {
    const { userId, newPassword } = req.body;
    
    // 查找用户
    const user = await findUserById(userId);
    if (!user) {
      return res.status(404).json({
        status: 'Fail',
        message: '用户不存在',
        data: null
      });
    }
    
    // 更新密码
    await updateUser(userId, { password_hash: newPassword });
    
    res.json({
      status: 'Success',
      message: '重置密码成功',
      data: null
    });
  } catch (error) {
    mlog('Reset User Password Error:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message || '重置密码失败',
      data: null
    });
  }
};