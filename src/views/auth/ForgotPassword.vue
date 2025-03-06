<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NCard, NForm, NFormItem, NInput, NButton, useMessage } from 'naive-ui'
import { forgotPassword } from '@/api/auth'

const router = useRouter()
const ms = useMessage()

const email = ref('')
const loading = ref(false)
const isSubmitted = ref(false)

async function handleSubmit() {
  if (!email.value) {
    ms.error('请输入邮箱')
    return
  }
  
  try {
    loading.value = true
    await forgotPassword(email.value)
    isSubmitted.value = true
    ms.success('重置密码链接已发送到您的邮箱')
  } catch (error) {
    ms.error(error.message || '发送重置密码链接失败')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <NCard title="忘记密码" class="w-full">
    <div v-if="!isSubmitted">
      <p class="mb-4">请输入您的邮箱，我们将发送重置密码链接到您的邮箱。</p>
      <NForm>
        <NFormItem label="邮箱" required>
          <NInput 
            v-model:value="email" 
            placeholder="请输入邮箱"
            @keypress.enter="handleSubmit"
          />
        </NFormItem>
        <div class="flex justify-between items-center">
          <router-link to="/auth/login" class="text-blue-500">
            返回登录
          </router-link>
        </div>
        <div class="mt-4">
          <NButton
            type="primary"
            block
            :loading="loading"
            @click="handleSubmit"
          >
            发送重置链接
          </NButton>
        </div>
      </NForm>
    </div>
    <div v-else>
      <p class="mb-4">重置密码链接已发送到您的邮箱，请查收并按照邮件中的指示进行操作。</p>
      <div class="mt-4">
        <NButton
          type="primary"
          block
          @click="() => router.push('/auth/login')"
        >
          返回登录
        </NButton>
      </div>
    </div>
  </NCard>
</template>