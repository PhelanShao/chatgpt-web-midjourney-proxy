# 用户系统实施步骤

本文档提供了实施用户管理系统的详细步骤和代码示例，作为对实施计划的补充。

## 第一阶段：环境准备和数据库设置

### 步骤 1: 安装必要的依赖

```bash
cd chatgpt-web-midjourney-proxy/service
npm install mongoose bcrypt jsonwebtoken express-validator
```

### 步骤 2: 配置环境变量

在 `service/.env` 文件中添加以下环境变量：

```
# 数据库配置
MONGODB_URI=mongodb://localhost:27017/chatgpt-web
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d

# 现有配置保持不变
AUTH_SECRET_KEY=...
```

### 步骤 3: 创建数据库连接模块

创建 `service/src/database/index.ts` 文件：

```typescript
import mongoose from 'mongoose';
import { mlog } from '../middleware/auth';

export const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    
    if (!mongoURI) {
      throw new Error('MongoDB URI is not defined in environment variables');
    }
    
    const conn = await mongoose.connect(mongoURI);
    mlog('MongoDB Connected:', conn.connection.host);
    return conn;
  } catch (error) {
    mlog('error', 'MongoDB connection error:', error.message);
    process.exit(1);
  }
};
```

## 第二阶段：后端模型开发

### 步骤 1: 创建用户模型

创建 `service/src/models/user.ts` 文件，实现用户模型，包括用户名、邮箱、密码哈希等字段，以及密码比较方法。

### 步骤 2: 创建对话模型

创建 `service/src/models/conversation.ts` 文件，实现对话模型，关联用户ID。

### 步骤 3: 创建消息模型

创建 `service/src/models/message.ts` 文件，实现消息模型，关联对话ID。

### 步骤 4: 创建用户设置模型

创建 `service/src/models/setting.ts` 文件，实现用户设置模型，关联用户ID。

## 第三阶段：后端控制器和路由开发

### 步骤 1: 创建请求验证中间件

创建 `service/src/middleware/validator.ts` 文件，实现请求数据验证功能。

### 步骤 2: 修改认证中间件

修改 `service/src/middleware/auth.ts` 文件，添加JWT认证功能，同时保留原有的密钥认证功能以兼容旧版本。

### 步骤 3: 创建认证控制器

创建 `service/src/controllers/auth.ts` 文件，实现注册、登录、获取当前用户信息等功能。

### 步骤 4: 创建用户控制器

创建 `service/src/controllers/user.ts` 文件，实现用户资料管理、设置管理等功能。

### 步骤 5: 创建认证路由

创建 `service/src/routes/auth.ts` 文件，定义认证相关的API路由。

### 步骤 6: 创建用户路由

创建 `service/src/routes/user.ts` 文件，定义用户相关的API路由。

### 步骤 7: 创建管理员路由

创建 `service/src/routes/admin.ts` 文件，定义管理员相关的API路由。

## 第四阶段：前端开发

### 步骤 1: 创建认证API

创建 `src/api/auth.ts` 文件，实现登录、注册、登出等API请求函数。

### 步骤 2: 创建用户API

创建 `src/api/user.ts` 文件，实现获取用户设置、更新用户资料等API请求函数。

### 步骤 3: 更新认证状态管理

修改 `src/store/modules/auth/index.ts` 文件，添加用户信息存储，修改认证逻辑，使用JWT。

### 步骤 4: 更新认证辅助函数

修改 `src/store/modules/auth/helper.ts` 文件，添加用户信息存储和获取函数。

### 步骤 5: 更新路由守卫

修改 `src/router/permission.ts` 文件，实现基于用户的权限控制。

### 步骤 6: 更新路由配置

修改 `src/router/index.ts` 文件，添加认证和用户相关路由，为现有路由添加权限控制。

### 步骤 7: 创建认证相关页面

创建登录、注册、忘记密码等页面，实现用户认证界面。

### 步骤 8: 创建用户相关页面

创建用户资料、设置管理等页面，实现用户管理界面。

## 第五阶段：数据迁移

### 步骤 1: 创建数据迁移脚本

创建 `service/src/scripts/migrate.ts` 文件，实现数据迁移功能，包括创建默认管理员用户和迁移现有数据。

## 第六阶段：集成和测试

### 步骤 1: 更新主入口文件

修改 `service/src/index.ts` 文件，添加数据库连接、注册新的路由、配置错误处理中间件。

### 步骤 2: 编写测试用例

为关键功能编写测试用例，确保各个组件正常工作。

### 步骤 3: 进行集成测试

测试前后端交互，确保数据流正确。

## 第七阶段：部署

### 步骤 1: 准备环境变量

更新 `.env.example` 文件，添加新的环境变量，确保部署环境有正确的环境变量。

### 步骤 2: 数据库部署

设置生产环境数据库，确保数据库安全性。

### 步骤 3: 应用部署

更新部署脚本，确保平滑升级。

## 注意事项

1. 在实施过程中，保持与现有功能的兼容性，特别是认证部分。
2. 确保数据安全，特别是用户密码的存储和传输。
3. 实施过程中可能需要根据实际情况调整计划。
