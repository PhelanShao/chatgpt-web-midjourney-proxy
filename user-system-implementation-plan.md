# 用户管理系统实施计划

根据对项目代码的分析，我制定了一个详细的实施计划，将现有的基于密钥的简单认证系统改造为完整的多用户系统。

## 当前系统分析

当前的认证机制是基于密钥的简单认证：

1. **后端认证**：
   - 通过环境变量 `AUTH_SECRET_KEY` 设置密钥
   - 在 `auth.ts` 中间件验证请求头中的 `Authorization` 是否匹配密钥
   - 没有用户概念，只有密钥验证

2. **前端认证**：
   - 将密钥存储在 localStorage 中（通过 `ss.set(LOCAL_NAME, token)`）
   - 请求时通过拦截器添加 `Authorization: Bearer ${token}` 头
   - 路由守卫通过 `getSession` 验证会话状态

3. **数据存储**：
   - 没有用户数据隔离，所有使用相同密钥的用户共享数据

## 实施计划

### 1. 数据库设置

首先需要设置数据库来存储用户信息和相关数据。

1. **安装依赖**：
   ```bash
   cd chatgpt-web-midjourney-proxy/service
   npm install mongoose bcrypt jsonwebtoken
   ```

2. **创建数据库连接**：
   - 创建 `service/src/database/index.ts` 文件
   - 实现 MongoDB 连接功能
   - 在 `.env` 文件中添加 `MONGODB_URI` 和 `JWT_SECRET` 环境变量

### 2. 后端开发

#### 2.1 创建数据模型

1. **用户模型**：
   - 创建 `service/src/models/user.ts`
   - 实现用户模型（用户名、邮箱、密码哈希等）

2. **对话模型**：
   - 创建 `service/src/models/conversation.ts`
   - 实现对话模型（关联用户ID）

3. **消息模型**：
   - 创建 `service/src/models/message.ts`
   - 实现消息模型（关联对话ID）

4. **用户设置模型**：
   - 创建 `service/src/models/setting.ts`
   - 实现用户设置模型（关联用户ID）

#### 2.2 创建认证控制器和路由

1. **认证控制器**：
   - 创建 `service/src/controllers/auth.ts`
   - 实现注册、登录、密码重置等功能

2. **用户控制器**：
   - 创建 `service/src/controllers/user.ts`
   - 实现用户资料管理、设置管理等功能

3. **认证路由**：
   - 创建 `service/src/routes/auth.ts`
   - 定义认证相关的API路由

4. **用户路由**：
   - 创建 `service/src/routes/user.ts`
   - 定义用户相关的API路由

#### 2.3 修改现有中间件和控制器

1. **修改认证中间件**：
   - 更新 `service/src/middleware/auth.ts`
   - 从基于密钥的认证改为基于JWT的用户认证

2. **修改聊天控制器**：
   - 更新聊天相关控制器，添加用户关联
   - 确保对话和消息与用户关联

3. **添加请求验证中间件**：
   - 创建 `service/src/middleware/validator.ts`
   - 实现请求数据验证功能

#### 2.4 更新主入口文件

1. **修改 `service/src/index.ts`**：
   - 添加数据库连接
   - 注册新的路由
   - 配置错误处理中间件

### 3. 前端开发

#### 3.1 创建认证相关页面

1. **登录页面**：
   - 创建 `src/views/auth/Login.vue`
   - 实现用户登录表单和逻辑

2. **注册页面**：
   - 创建 `src/views/auth/Register.vue`
   - 实现用户注册表单和逻辑

3. **忘记密码页面**：
   - 创建 `src/views/auth/ForgotPassword.vue`
   - 实现密码重置功能

4. **认证布局**：
   - 创建 `src/views/auth/Layout.vue`
   - 为认证页面提供统一布局

#### 3.2 创建用户相关页面

1. **用户资料页面**：
   - 创建 `src/views/user/Profile.vue`
   - 实现用户资料管理功能

2. **用户布局**：
   - 创建 `src/views/user/Layout.vue`
   - 为用户页面提供统一布局

#### 3.3 修改状态管理

1. **更新认证状态管理**：
   - 修改 `src/store/modules/auth/index.ts`
   - 添加用户信息存储
   - 修改认证逻辑，使用JWT

2. **更新认证辅助函数**：
   - 修改 `src/store/modules/auth/helper.ts`
   - 添加用户信息存储和获取函数

3. **创建用户状态管理**：
   - 创建 `src/store/modules/user/index.ts`
   - 实现用户状态管理

#### 3.4 修改路由和权限控制

1. **更新路由配置**：
   - 修改 `src/router/index.ts`
   - 添加认证和用户相关路由
   - 为现有路由添加权限控制

2. **更新路由守卫**：
   - 修改 `src/router/permission.ts`
   - 实现基于用户的权限控制

#### 3.5 修改API请求

1. **创建认证API**：
   - 创建 `src/api/auth.ts`
   - 实现注册、登录、密码重置等API

2. **创建用户API**：
   - 创建 `src/api/user.ts`
   - 实现用户资料、设置管理等API

3. **更新请求拦截器**：
   - 修改 `src/utils/request/axios.ts`
   - 更新认证头处理逻辑

### 4. 数据迁移

1. **设计数据迁移策略**：
   - 确定如何将现有数据迁移到新的用户系统
   - 可能需要创建默认用户并关联现有数据

2. **实现数据迁移脚本**：
   - 创建迁移脚本，将现有数据迁移到新系统
   - 确保数据完整性和一致性

### 5. 测试计划

1. **单元测试**：
   - 为关键功能编写单元测试
   - 确保各个组件正常工作

2. **集成测试**：
   - 测试前后端交互
   - 确保数据流正确

3. **用户测试**：
   - 测试用户注册、登录流程
   - 测试数据隔离功能

### 6. 部署计划

1. **准备环境变量**：
   - 更新 `.env.example` 文件，添加新的环境变量
   - 确保部署环境有正确的环境变量

2. **数据库部署**：
   - 设置生产环境数据库
   - 确保数据库安全性

3. **应用部署**：
   - 更新部署脚本
   - 确保平滑升级

## 实施时间表

1. **准备阶段**（1-2天）：
   - 环境设置
   - 依赖安装
   - 详细设计确认

2. **后端开发**（3-5天）：
   - 数据模型创建
   - 控制器和路由实现
   - 中间件修改

3. **前端开发**（3-5天）：
   - 页面创建
   - 状态管理更新
   - 路由和权限控制

4. **集成和测试**（2-3天）：
   - 前后端集成
   - 功能测试
   - 问题修复

5. **数据迁移和部署**（1-2天）：
   - 数据迁移
   - 生产环境部署
   - 监控和调整

总计：约10-17天的开发时间，具体取决于项目复杂度和团队规模。

## 代码示例

### 后端示例

#### 数据库连接 (service/src/database/index.ts)

```typescript
import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
};
```

#### 用户模型 (service/src/models/user.ts)

```typescript
import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password_hash: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  api_key: {
    type: String,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  },
  last_login: {
    type: Date,
    default: null
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  }
});

const User = mongoose.model('User', userSchema);

export default User;
```

#### 认证中间件 (service/src/middleware/auth.ts)

```typescript
import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) throw new Error('认证失败');
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).send({ status: 'Unauthorized', message: error.message, data: null });
  }
};

export const adminAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    auth(req, res, () => {
      if (req.user.role !== 'admin') 
        return res.status(403).send({ status: 'Forbidden', message: '需要管理员权限', data: null });
      next();
    });
  } catch (error) {
    res.status(401).send({ status: 'Unauthorized', message: error.message, data: null });
  }
};
```

### 前端示例

#### 认证状态管理 (src/store/modules/auth/index.ts)

```typescript
import { defineStore } from 'pinia'
import { getToken, removeToken, setToken, getUserInfo, setUserInfo, removeUserInfo } from './helper'
import { store } from '@/store/helper'
import { fetchSession, login, register, logout } from '@/api/auth'

export interface UserInfo {
  id: string
  username: string
  email: string
  role: string
}

export interface AuthState {
  token: string | undefined
  userInfo: UserInfo | null
  session: any | null
}

export const useAuthStore = defineStore('auth-store', {
  state: (): AuthState => ({
    token: getToken(),
    userInfo: getUserInfo(),
    session: null,
  }),

  getters: {
    isLoggedIn(state): boolean {
      return !!state.token && !!state.userInfo
    },
    
    isAdmin(state): boolean {
      return state.userInfo?.role === 'admin'
    }
  },

  actions: {
    async getSession() {
      try {
        const { data } = await fetchSession()
        this.session = { ...data }
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    async login(email: string, password: string) {
      try {
        const { data } = await login(email, password)
        this.token = data.token
        this.userInfo = data.user
        setToken(data.token)
        setUserInfo(data.user)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    async register(username: string, email: string, password: string) {
      try {
        const { data } = await register(username, email, password)
        this.token = data.token
        this.userInfo = data.user
        setToken(data.token)
        setUserInfo(data.user)
        return Promise.resolve(data)
      }
      catch (error) {
        return Promise.reject(error)
      }
    },

    async logout() {
      try {
        await logout()
        this.token = undefined
        this.userInfo = null
        removeToken()
        removeUserInfo()
        return Promise.resolve()
      }
      catch (error) {
        return Promise.reject(error)
      }
    },
  },
})

export function useAuthStoreWithout() {
  return useAuthStore(store)
}
```

#### 登录页面 (src/views/auth/Login.vue)

```vue
<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NCard, NForm, NFormItem, NInput, NButton, useMessage } from 'naive-ui'
import { useAuthStore } from '@/store'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const ms = useMessage()

const email = ref('')
const password = ref('')
const loading = ref(false)

async function handleLogin() {
  if (!email.value || !password.value) {
    ms.error('请输入邮箱和密码')
    return
  }
  
  try {
    loading.value = true
    await authStore.login(email.value, password.value)
    ms.success('登录成功')
    
    // 重定向到之前的页面或首页
    const redirectPath = route.query.redirect as string || '/'
    router.push(redirectPath)
  } catch (error) {
    ms.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <NCard title="登录" class="w-full max-w-md">
      <NForm>
        <NFormItem label="邮箱" required>
          <NInput v-model:value="email" placeholder="请输入邮箱" />
        </NFormItem>
        <NFormItem label="密码" required>
          <NInput
            v-model:value="password"
            type="password"
            placeholder="请输入密码"
            @keypress.enter="handleLogin"
          />
        </NFormItem>
        <div class="flex justify-between items-center">
          <router-link to="/auth/forgot-password" class="text-blue-500">
            忘记密码?
          </router-link>
          <router-link to="/auth/register" class="text-blue-500">
            注册账号
          </router-link>
        </div>
        <div class="mt-4">
          <NButton
            type="primary"
            block
            :loading="loading"
            @click="handleLogin"
          >
            登录
          </NButton>
        </div>
      </NForm>
    </NCard>
  </div>
</template>
```

## 下一步行动

1. 确认此计划是否符合需求
2. 确定优先级和实施顺序
3. 准备开发环境
4. 开始实施第一阶段