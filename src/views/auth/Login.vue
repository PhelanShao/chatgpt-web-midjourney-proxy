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
    console.log('Login attempt with:', { email: email.value, password: password.value })
    
    const response = await authStore.login(email.value, password.value)
    console.log('Login response:', response)
    
    ms.success('登录成功')
    
    // 重定向到之前的页面或首页
    const redirectPath = route.query.redirect as string || '/chat'
    router.push(redirectPath)
  } catch (error) {
    console.error('Login error:', error)
    ms.error(error.message || '登录失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
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
</template>