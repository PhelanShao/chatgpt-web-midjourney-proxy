import bcrypt from 'bcrypt';
import db from '../database';
import { v4 as uuidv4 } from 'uuid';

export interface IUser {
  _id?: string;
  username: string;
  email: string;
  password_hash: string;
  role: 'user' | 'admin';
  api_key: string | null;
  created_at: Date;
  updated_at: Date;
  last_login: Date | null;
  status: 'active' | 'inactive';
}

// 密码比较函数
export const comparePassword = async (candidatePassword: string, passwordHash: string): Promise<boolean> => {
  return bcrypt.compare(candidatePassword, passwordHash);
};

// 密码哈希函数
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

// 创建用户
export const createUser = async (userData: Omit<IUser, '_id' | 'created_at' | 'updated_at'>): Promise<IUser> => {
  const now = new Date();
  const hashedPassword = await hashPassword(userData.password_hash);
  
  const user: IUser = {
    _id: uuidv4(),
    ...userData,
    password_hash: hashedPassword,
    created_at: now,
    updated_at: now
  };
  
  return new Promise((resolve, reject) => {
    db.users.insert(user, (err, newUser) => {
      if (err) reject(err);
      else resolve(newUser);
    });
  });
};

// 查找用户
export const findUserById = async (id: string): Promise<IUser | null> => {
  return new Promise((resolve, reject) => {
    db.users.findOne({ _id: id }, (err, user) => {
      if (err) reject(err);
      else resolve(user || null);
    });
  });
};

// 通过邮箱查找用户
export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  return new Promise((resolve, reject) => {
    db.users.findOne({ email }, (err, user) => {
      if (err) reject(err);
      else resolve(user || null);
    });
  });
};

// 更新用户
export const updateUser = async (id: string, updateData: Partial<IUser>): Promise<IUser | null> => {
  const updateObj = { ...updateData, updated_at: new Date() };
  
  // 如果更新包含密码，则哈希密码
  if (updateObj.password_hash) {
    updateObj.password_hash = await hashPassword(updateObj.password_hash);
  }
  
  return new Promise((resolve, reject) => {
    db.users.update({ _id: id }, { $set: updateObj }, { returnUpdatedDocs: true }, (err, numAffected, updatedUser) => {
      if (err) reject(err);
      else if (numAffected === 0) resolve(null);
      else resolve(updatedUser);
    });
  });
};

// 删除用户
export const deleteUser = async (id: string): Promise<boolean> => {
  return new Promise((resolve, reject) => {
    db.users.remove({ _id: id }, {}, (err, numRemoved) => {
      if (err) reject(err);
      else resolve(numRemoved > 0);
    });
  });
};

// 查找所有用户
export const findAllUsers = async (): Promise<IUser[]> => {
  return new Promise((resolve, reject) => {
    db.users.find({}, (err, users) => {
      if (err) reject(err);
      else resolve(users);
    });
  });
};

export default {
  createUser,
  findUserById,
  findUserByEmail,
  updateUser,
  deleteUser,
  findAllUsers,
  comparePassword,
  hashPassword
};