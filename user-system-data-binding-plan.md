# 用户系统数据绑定计划

## 项目概述

本项目是一个基于Vue 3和Express的Web应用，集成了ChatGPT、Midjourney等多种AI服务。我们正在实现用户系统，确保不同用户的数据（聊天记录、API设置等）能够正确绑定到各自的账户。

## 已修改的文件和功能

### 前端部分

1. **src/utils/request/axios.ts**
   - 修改了响应拦截器，使其接受201状态码作为成功响应
   - 解决了注册成功但显示"请求错误201"的问题

2. **src/store/modules/chat/helper.ts**
   - 修改了聊天数据的本地存储机制，将聊天数据与用户ID关联
   - 添加了getStorageKey函数，使用用户ID作为存储键的一部分

3. **src/store/modules/chat/index.ts**
   - 添加了与后端API交互的方法，将聊天记录保存到后端数据库
   - 添加了loadUserConversations方法，从后端加载用户的会话
   - 修改了addHistory、updateHistory、deleteHistory等方法，使其与后端同步

4. **src/store/homeStore.ts**
   - 修改了gptServerStore，使其使用用户ID作为存储键的一部分
   - 添加了getServerStorageKey函数，确保每个用户有自己的API设置
   - 添加了reloadUserSettings方法，用于重新加载用户的API设置

5. **src/store/modules/auth/index.ts**
   - 修改了login和logout方法，在登录和注销时重新加载页面
   - 确保在用户切换时加载正确的用户数据

6. **src/App.vue**
   - 添加了loadUserData方法，在应用启动时加载用户数据
   - 添加了对用户登录状态的监听，在用户登录时加载数据
   - 集成了用户设置、API设置和会话的加载

7. **src/api/conversation.ts**
   - 创建了新文件，提供与后端会话API交互的方法
   - 包括创建会话、更新会话标题、删除会话、获取会话消息等功能

8. **src/api/user_setting.ts**
   - 创建了新文件，提供与后端用户设置API交互的方法
   - 包括获取用户设置、更新用户设置、保存用户聊天设置等功能

9. **src/store/modules/user_setting/index.ts**
   - 创建了新文件，提供用户设置的状态管理
   - 包括加载用户设置、更新用户设置、保存用户设置等功能

10. **src/store/modules/user_setting/helper.ts**
    - 创建了新文件，提供用户设置的本地存储机制
    - 使用用户ID作为存储键的一部分，确保每个用户有自己的设置

11. **src/components/common/Setting/General.vue**
    - 修改了"总览"页面，添加了修改密码和注销功能
    - 添加了修改密码的弹窗和注销按钮

### 后端部分

1. **service/src/models/user_setting.ts**
   - 创建了新文件，定义了用户设置的数据模型
   - 提供了创建、查找、更新用户设置的方法

2. **service/src/controllers/user_setting.ts**
   - 创建了新文件，提供用户设置的控制器
   - 包括获取用户设置、更新用户设置、保存用户聊天设置等功能

3. **service/src/routes/user_setting.ts**
   - 创建了新文件，定义了用户设置的路由
   - 将控制器方法与路由路径关联

4. **service/src/models/conversation.ts**
   - 定义了会话的数据模型
   - 提供了创建、查找、更新、删除会话的方法

5. **service/src/models/message.ts**
   - 定义了消息的数据模型
   - 提供了创建、查找、删除消息的方法
   - 添加了deleteMessage方法，用于删除单条消息

6. **service/src/controllers/conversation.ts**
   - 创建了新文件，提供会话的控制器
   - 包括获取用户会话、创建会话、更新会话标题、删除会话等功能

7. **service/src/routes/conversation.ts**
   - 创建了新文件，定义了会话的路由
   - 将控制器方法与路由路径关联

8. **service/src/index.ts**
   - 修改了服务器入口文件，注册了新的路由
   - 添加了会话和用户设置的路由

## 当前遇到的问题

1. **聊天记录绑定问题**：
   - 虽然我们修改了聊天记录的存储机制，但注销后再次登录，聊天记录仍然消失
   - 可能是因为聊天记录没有正确保存到后端数据库，或者从后端加载失败

2. **服务端设置绑定问题**：
   - 服务端保存的内容（API设置）所有用户都能看到，没有与用户绑定
   - 虽然我们修改了gptServerStore，但可能没有正确实现与后端的同步

## 下一步计划

1. **调试聊天记录绑定**：
   - 检查loadUserConversations方法是否正确调用
   - 确认后端API是否正确返回用户的会话
   - 添加日志，跟踪数据流向

2. **完善服务端设置绑定**：
   - 创建后端API，保存用户的API设置
   - 修改gptServerStore，使其与后端同步
   - 确保API设置与用户ID正确关联

3. **添加数据迁移功能**：
   - 添加功能，将本地存储的数据迁移到后端数据库
   - 确保用户不会丢失之前的聊天记录和设置

4. **增强错误处理**：
   - 添加更详细的错误处理和日志记录
   - 提供用户友好的错误提示

## 关键文件路径

### 前端

- **API接口**：
  - `src/api/auth.ts`：认证API
  - `src/api/user.ts`：用户API
  - `src/api/conversation.ts`：会话API
  - `src/api/user_setting.ts`：用户设置API

- **状态管理**：
  - `src/store/modules/auth/index.ts`：认证状态
  - `src/store/modules/chat/index.ts`：聊天状态
  - `src/store/modules/user_setting/index.ts`：用户设置状态
  - `src/store/homeStore.ts`：全局状态和API设置

- **视图组件**：
  - `src/views/auth/Login.vue`：登录页面
  - `src/views/auth/Register.vue`：注册页面
  - `src/views/chat/index.vue`：聊天页面
  - `src/components/common/Setting/General.vue`：设置页面
  - `src/views/mj/aiSetServer.vue`：服务端设置页面

### 后端

- **模型**：
  - `service/src/models/user.ts`：用户模型
  - `service/src/models/conversation.ts`：会话模型
  - `service/src/models/message.ts`：消息模型
  - `service/src/models/user_setting.ts`：用户设置模型

- **控制器**：
  - `service/src/controllers/auth.ts`：认证控制器
  - `service/src/controllers/user.ts`：用户控制器
  - `service/src/controllers/conversation.ts`：会话控制器
  - `service/src/controllers/user_setting.ts`：用户设置控制器

- **路由**：
  - `service/src/routes/auth.ts`：认证路由
  - `service/src/routes/user.ts`：用户路由
  - `service/src/routes/conversation.ts`：会话路由
  - `service/src/routes/user_setting.ts`：用户设置路由

- **中间件**：
  - `service/src/middleware/auth.ts`：认证中间件
  - `service/src/middleware/validator.ts`：验证中间件

- **数据库**：
  - `service/src/database/index.ts`：数据库连接

## 技术栈

- **前端**：Vue 3、Pinia、Naive UI、Axios
- **后端**：Express、NeDB（轻量级数据库）
- **认证**：JWT（JSON Web Token）

## 注意事项

1. 在继续开发前，确保后端服务器正在运行
2. 确保数据目录（service/data）存在并可写
3. 检查.env文件中的配置是否正确
4. 注意TypeScript类型错误，但不要过分担心，因为它们不会影响功能