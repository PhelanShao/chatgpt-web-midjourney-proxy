<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NForm, NFormItem, NInput, NButton, useMessage } from 'naive-ui'
import { useAuthStore } from '@/store'

const authStore = useAuthStore()
const router = useRouter()
const ms = useMessage()

const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)

async function handleRegister() {
  if (!username.value || !email.value || !password.value) {
    ms.error('请填写所有必填字段')
    return
  }
  
  if (password.value !== confirmPassword.value) {
    ms.error('两次输入的密码不一致')
    return
  }
  
  try {
    loading.value = true
    console.log('Register attempt with:', { username: username.value, email: email.value })
    
    await authStore.register(username.value, email.value, password.value)
    console.log('Register success')
    
    ms.success('注册成功')
    router.push('/chat')
  } catch (error) {
    console.error('Register error:', error)
    ms.error(error.message || '注册失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <NCard title="注册" class="w-full max-w-md">
    <NForm>
      <NFormItem label="用户名" required>
        <NInput v-model:value="username" placeholder="请输入用户名" />
      </NFormItem>
      <NFormItem label="邮箱" required>
        <NInput v-model:value="email" placeholder="请输入邮箱" />
      </NFormItem>
      <NFormItem label="密码" required>
        <NInput
          v-model:value="password"
          type="password"
          placeholder="请输入密码"
        />
      </NFormItem>
      <NFormItem label="确认密码" required>
        <NInput
          v-model:value="confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          @keypress.enter="handleRegister"
        />
      </NFormItem>
      <div class="flex justify-between items-center">
        <span>已有账号？</span>
        <router-link to="/auth/login" class="text-blue-500">
          登录
        </router-link>
      </div>
      <div class="mt-4">
        <NButton
          type="primary"
          block
          :loading="loading"
          @click="handleRegister"
        >
          注册
        </NButton>
      </div>
    </NForm>
  </NCard>
</template>