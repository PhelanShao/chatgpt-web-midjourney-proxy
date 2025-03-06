import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import User, { findUserByEmail, createUser, findUserById, comparePassword, updateUser } from '../models/user';
import { createSetting } from '../models/setting';
import { mlog } from '../middleware/auth';

// 生成JWT令牌
const generateToken = (id: string, role: string): string => {
  const secret = process.env.JWT_SECRET || 'your-default-secret-key';
  // 使用any类型断言暂时解决类型问题
  return (jwt.sign as any)(
    { id, role },
    secret,
    { expiresIn: process.env.JWT_EXPIRE || '7d' }
  );
};

// 用户注册
export const register = async (req: Request, res: Response) => {
  try {
    mlog('Register Request Body:', req.body);
    const { username, email, password } = req.body;
    
    // 添加请求参数验证
    if (!username || !email || !password) {
      mlog('Register Error: Missing required fields');
      return res.status(400).json({
        status: 'Fail',
        message: '用户名、邮箱和密码是必填项',
        data: null
      });
    }
    
    // 检查用户是否已存在
    const existingUser = await findUserByEmail(email);
    if (existingUser) {
      mlog('Register Error: Email already exists');
      return res.status(400).json({
        status: 'Fail',
        message: '邮箱已被注册',
        data: null
      });
    }
    
    // 创建新用户
    const user = await createUser({
      username,
      email,
      password_hash: password,
      role: 'user',
      api_key: null,
      last_login: null,
      status: 'active'
    });
    
    mlog('User created:', user);
    
    // 创建用户默认设置
    await createSetting({
      user_id: user._id,
      theme: 'dark',
      language: 'zh-CN',
      model_name: 'gpt-3.5-turbo'
    });
    
    // 生成JWT
    const token = generateToken(user._id, user.role);
    
    // 更新最后登录时间
    await updateUser(user._id, { last_login: new Date() });
    
    res.status(201).json({
      status: 'Success',
      message: '注册成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    mlog('Register Error:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message || '注册失败',
      data: null
    });
  }
};

// 用户登录
export const login = async (req: Request, res: Response) => {
  try {
    mlog('Login Request Body:', req.body);
    const { email, password } = req.body;
    
    // 查找用户
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(400).json({
        status: 'Fail',
        message: '邮箱或密码错误',
        data: null
      });
    }
    
    // 验证密码
    const isMatch = await comparePassword(password, user.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        status: 'Fail',
        message: '邮箱或密码错误',
        data: null
      });
    }
    
    // 检查用户状态
    if (user.status !== 'active') {
      return res.status(400).json({
        status: 'Fail',
        message: '账号已被禁用',
        data: null
      });
    }
    
    // 更新最后登录时间
    await updateUser(user._id, { last_login: new Date() });
    
    // 生成JWT
    const token = generateToken(user._id, user.role);
    
    res.json({
      status: 'Success',
      message: '登录成功',
      data: {
        token,
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    mlog('Login Error:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message || '登录失败',
      data: null
    });
  }
};

// 获取当前用户信息
export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await findUserById(req.user.id);
    if (!user) {
      return res.status(404).json({
        status: 'Fail',
        message: '用户不存在',
        data: null
      });
    }
    
    res.json({
      status: 'Success',
      message: '获取用户信息成功',
      data: {
        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          role: user.role,
          created_at: user.created_at,
          last_login: user.last_login
        }
      }
    });
  } catch (error) {
    mlog('Get Current User Error:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message || '获取用户信息失败',
      data: null
    });
  }
};

// 用户登出
export const logout = async (req: Request, res: Response) => {
  try {
    // JWT是无状态的，客户端只需删除令牌
    // 这里可以添加令牌黑名单功能，但需要额外的存储
    
    res.json({
      status: 'Success',
      message: '登出成功',
      data: null
    });
  } catch (error) {
    mlog('Logout Error:', error);
    res.status(500).json({
      status: 'Error',
      message: error.message || '登出失败',
      data: null
    });
  }
};

// 忘记密码
export const forgotPassword = async (req: Request, res: Response) => {
  // 实现忘记密码功能
  // 这里可以发送重置密码邮件等
  res.status(501).json({
    status: 'Error',
    message: '功能尚未实现',
    data: null
  });
};

// 重置密码
export const resetPassword = async (req: Request, res: Response) => {
  // 实现重置密码功能
  res.status(501).json({
    status: 'Error',
    message: '功能尚未实现',
    data: null
  });
};