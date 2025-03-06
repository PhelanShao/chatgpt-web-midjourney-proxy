# 用户管理系统使用指南

本文档提供了用户管理系统的使用说明，包括系统配置、启动方法和功能介绍。

## 系统配置

在启动系统之前，需要进行以下配置：

1. **配置环境变量**：
   - 在 `service/.env` 文件中设置 `JWT_SECRET` 环境变量，用于生成和验证 JWT 令牌
   - 设置 `JWT_EXPIRE` 环境变量，指定令牌过期时间（默认为7天）
   - 可选：设置 `ADMIN_EMAIL` 和 `ADMIN_PASSWORD` 环境变量，自定义管理员账户

示例配置：
```
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=admin123
```

## 启动系统

1. **启动后端服务**：
   ```bash
   cd chatgpt-web-midjourney-proxy/service
   npm run dev
   ```

2. **启动前端服务**：
   ```bash
   cd chatgpt-web-midjourney-proxy
   npm run dev
   ```

3. **初始化数据库**：
   首次启动时，需要运行数据迁移脚本创建默认管理员账户：
   ```bash
   cd chatgpt-web-midjourney-proxy/service
   npx ts-node src/scripts/migrate.ts
   ```
   
   默认管理员账户：
   - 邮箱：admin@example.com
   - 密码：admin123

## 功能介绍

### 用户认证

1. **注册**：
   - 访问 `/auth/register` 页面
   - 填写用户名、邮箱和密码
   - 点击"注册"按钮

2. **登录**：
   - 访问 `/auth/login` 页面
   - 输入邮箱和密码
   - 点击"登录"按钮

3. **忘记密码**：
   - 访问 `/auth/forgot-password` 页面
   - 输入注册邮箱
   - 系统将发送重置密码链接到邮箱

### 用户中心

登录后，可以访问用户中心进行以下操作：

1. **个人资料管理**：
   - 访问 `/user/profile` 页面
   - 修改用户名
   - 查看注册邮箱（不可修改）

2. **密码修改**：
   - 在用户中心的"修改密码"选项卡
   - 输入当前密码和新密码
   - 点击"修改密码"按钮

3. **偏好设置**：
   - 在用户中心的"偏好设置"选项卡
   - 设置主题（light/dark）
   - 设置语言（zh-CN/en-US等）
   - 设置默认模型

### 管理员功能

管理员用户可以访问管理功能：

1. **用户管理**：
   - 查看所有用户列表
   - 启用/禁用用户账号
   - 重置用户密码

## 系统集成

用户管理系统已与现有功能集成：

1. **聊天功能**：
   - 聊天历史与用户账号关联
   - 不同用户的聊天记录相互隔离

2. **设置功能**：
   - 用户设置与账号关联
   - 不同用户可以有不同的偏好设置

## 数据存储

本系统使用本地文件数据库（NeDB）存储用户数据，无需安装额外的数据库软件。数据文件存储在 `service/data` 目录下：

- `users.db`：用户数据
- `settings.db`：用户设置
- `conversations.db`：对话数据
- `messages.db`：消息数据

## 注意事项

1. 首次使用时，请确保运行数据迁移脚本创建默认管理员账户
2. 请妥善保管管理员账户信息
3. 系统使用 JWT 进行认证，令牌默认有效期为7天
4. 为了安全起见，请定期修改密码
5. 数据文件存储在本地，请定期备份 `service/data` 目录

## 故障排除

1. **JWT 认证失败**：
   - 检查 `JWT_SECRET` 环境变量是否正确设置
   - 清除浏览器缓存和 localStorage，重新登录

2. **页面访问权限问题**：
   - 检查用户角色是否正确
   - 确认路由权限配置是否正确

3. **数据文件访问问题**：
   - 确保应用程序对 `service/data` 目录有读写权限
   - 检查磁盘空间是否充足