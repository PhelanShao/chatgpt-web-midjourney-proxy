<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { NCard, NTabs, NTabPane, NForm, NFormItem, NInput, NButton, useMessage } from 'naive-ui'
import { useAuthStore } from '@/store'
import { updateUserProfile, changePassword, getUserSettings, updateUserSettings } from '@/api/user'

const authStore = useAuthStore()
const ms = useMessage()

// 用户资料
const username = ref('')
const email = ref('')
const profileLoading = ref(false)

// 密码修改
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordLoading = ref(false)

// 用户设置
const theme = ref('dark')
const language = ref('zh-CN')
const model = ref('gpt-3.5-turbo')
const settingsLoading = ref(false)

onMounted(async () => {
  // 加载用户信息
  if (authStore.userInfo) {
    username.value = authStore.userInfo.username
    email.value = authStore.userInfo.email
  }
  
  // 加载用户设置
  try {
    const { data } = await getUserSettings()
    if (data) {
      theme.value = data.theme || 'dark'
      language.value = data.language || 'zh-CN'
      model.value = data.model_name || 'gpt-3.5-turbo'
    }
  } catch (error) {
    ms.error('加载用户设置失败')
  }
})

// 更新用户资料
async function handleUpdateProfile() {
  if (!username.value) {
    ms.error('用户名不能为空')
    return
  }
  
  try {
    profileLoading.value = true
    await updateUserProfile({ username: username.value })
    
    // 更新本地存储的用户信息
    if (authStore.userInfo) {
      authStore.userInfo.username = username.value
      authStore.fetchCurrentUser()
    }
    
    ms.success('更新资料成功')
  } catch (error) {
    ms.error(error.message || '更新资料失败')
  } finally {
    profileLoading.value = false
  }
}

// 修改密码
async function handleChangePassword() {
  if (!currentPassword.value || !newPassword.value || !confirmPassword.value) {
    ms.error('请填写所有密码字段')
    return
  }
  
  if (newPassword.value !== confirmPassword.value) {
    ms.error('两次输入的新密码不一致')
    return
  }
  
  try {
    passwordLoading.value = true
    await changePassword(currentPassword.value, newPassword.value)
    ms.success('密码修改成功')
    
    // 清空密码字段
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    ms.error(error.message || '密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}

// 更新用户设置
async function handleUpdateSettings() {
  try {
    settingsLoading.value = true
    await updateUserSettings({
      theme: theme.value,
      language: language.value,
      model_name: model.value
    })
    ms.success('更新设置成功')
  } catch (error) {
    ms.error(error.message || '更新设置失败')
  } finally {
    settingsLoading.value = false
  }
}
</script>

<template>
  <div class="profile-container">
    <h1 class="text-2xl font-bold mb-4">个人中心</h1>
    
    <NTabs type="line" animated>
      <NTabPane name="profile" tab="个人资料">
        <NCard title="基本信息" class="mb-4">
          <NForm>
            <NFormItem label="用户名">
              <NInput v-model:value="username" placeholder="请输入用户名" />
            </NFormItem>
            <NFormItem label="邮箱">
              <NInput v-model:value="email" disabled />
              <template #feedback>邮箱不可修改</template>
            </NFormItem>
            <NFormItem>
              <NButton type="primary" :loading="profileLoading" @click="handleUpdateProfile">
                保存修改
              </NButton>
            </NFormItem>
          </NForm>
        </NCard>
      </NTabPane>
      
      <NTabPane name="password" tab="修改密码">
        <NCard title="密码修改" class="mb-4">
          <NForm>
            <NFormItem label="当前密码" required>
              <NInput 
                v-model:value="currentPassword" 
                type="password" 
                placeholder="请输入当前密码" 
              />
            </NFormItem>
            <NFormItem label="新密码" required>
              <NInput 
                v-model:value="newPassword" 
                type="password" 
                placeholder="请输入新密码" 
              />
            </NFormItem>
            <NFormItem label="确认新密码" required>
              <NInput 
                v-model:value="confirmPassword" 
                type="password" 
                placeholder="请再次输入新密码" 
              />
            </NFormItem>
            <NFormItem>
              <NButton type="primary" :loading="passwordLoading" @click="handleChangePassword">
                修改密码
              </NButton>
            </NFormItem>
          </NForm>
        </NCard>
      </NTabPane>
      
      <NTabPane name="settings" tab="偏好设置">
        <NCard title="系统设置" class="mb-4">
          <NForm>
            <NFormItem label="主题">
              <NInput v-model:value="theme" placeholder="light 或 dark" />
            </NFormItem>
            <NFormItem label="语言">
              <NInput v-model:value="language" placeholder="zh-CN, en-US 等" />
            </NFormItem>
            <NFormItem label="默认模型">
              <NInput v-model:value="model" placeholder="gpt-3.5-turbo, gpt-4 等" />
            </NFormItem>
            <NFormItem>
              <NButton type="primary" :loading="settingsLoading" @click="handleUpdateSettings">
                保存设置
              </NButton>
            </NFormItem>
          </NForm>
        </NCard>
      </NTabPane>
    </NTabs>
  </div>
</template>

<style scoped>
.profile-container {
  width: 100%;
}
</style>