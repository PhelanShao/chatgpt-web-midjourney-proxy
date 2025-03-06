import Datastore from 'nedb';
import path from 'path';
import fs from 'fs';
import { mlog } from '../middleware/auth';

// 确保数据目录存在
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 创建数据库实例
const db = {
  users: new Datastore({ filename: path.join(dataDir, 'users.db'), autoload: true }),
  settings: new Datastore({ filename: path.join(dataDir, 'settings.db'), autoload: true }),
  conversations: new Datastore({ filename: path.join(dataDir, 'conversations.db'), autoload: true }),
  messages: new Datastore({ filename: path.join(dataDir, 'messages.db'), autoload: true }),
};

// 创建索引
db.users.ensureIndex({ fieldName: 'email', unique: true });
db.settings.ensureIndex({ fieldName: 'user_id', unique: true });

export const connectDB = async () => {
  try {
    mlog('NeDB Connected: Local database initialized');
    return db;
  } catch (error) {
    mlog('error', 'NeDB connection error:', error.message);
    mlog('warning', '用户管理系统需要数据库。请确保应用程序有写入权限。');
    mlog('info', '系统将继续运行，但用户管理功能将不可用。');
    return null;
  }
};

export default db;