import { createUser, findUserByEmail } from '../models/user';
import { createSetting } from '../models/setting';
import { mlog } from '../middleware/auth';

/**
 * 数据迁移脚本
 * 用于初始化数据库，创建默认管理员账户
 */
async function migrate() {
  try {
    mlog('开始数据迁移...');
    
    // 检查默认管理员账户是否存在
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
    const existingAdmin = await findUserByEmail(adminEmail);
    
    if (!existingAdmin) {
      // 创建默认管理员账户
      const admin = await createUser({
        username: 'Admin',
        email: adminEmail,
        password_hash: process.env.ADMIN_PASSWORD || 'admin123',
        role: 'admin',
        api_key: null,
        last_login: null,
        status: 'active'
      });
      
      // 创建管理员默认设置
      await createSetting({
        user_id: admin._id,
        theme: 'dark',
        language: 'zh-CN',
        model_name: 'gpt-3.5-turbo'
      });
      
      mlog('默认管理员账户创建成功');
      mlog(`邮箱: ${adminEmail}`);
      mlog(`密码: ${process.env.ADMIN_PASSWORD || 'admin123'}`);
    } else {
      mlog('默认管理员账户已存在，跳过创建');
    }
    
    mlog('数据迁移完成');
  } catch (error) {
    mlog('error', '数据迁移失败:', error.message);
    process.exit(1);
  }
}

// 执行迁移
migrate();