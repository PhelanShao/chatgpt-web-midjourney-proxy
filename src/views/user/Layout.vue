<script setup lang="ts">
import { NLayout, NLayoutHeader, NLayoutContent, NMenu, NButton } from 'naive-ui'
import { h, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/store'

const authStore = useAuthStore()
const router = useRouter()

const menuOptions = [
  {
    label: () => h(RouterLink, { to: '/user/profile' }, { default: () => '个人资料' }),
    key: 'profile',
  }
]

async function handleLogout() {
  try {
    await authStore.logout()
    router.push('/auth/login')
  } catch (error) {
    console.error('登出失败:', error)
  }
}
</script>

<template>
  <NLayout class="user-layout">
    <NLayoutHeader class="header">
      <div class="header-content">
        <div class="logo">
          <img src="/favicon-full.svg" alt="Logo" class="w-8 h-8" />
          <h1 class="text-xl font-bold ml-2">用户中心</h1>
        </div>
        <div class="actions">
          <NButton @click="router.push('/')" class="mr-2">返回主页</NButton>
          <NButton @click="handleLogout" type="error">登出</NButton>
        </div>
      </div>
    </NLayoutHeader>
    <NLayout has-sider>
      <NLayoutContent class="content">
        <div class="menu">
          <NMenu :options="menuOptions" default-value="profile" />
        </div>
        <div class="main-content">
          <router-view />
        </div>
      </NLayoutContent>
    </NLayout>
  </NLayout>
</template>

<style scoped>
.user-layout {
  height: 100vh;
}

.header {
  height: 64px;
  padding: 0 24px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.logo {
  display: flex;
  align-items: center;
}

.content {
  display: flex;
  padding: 24px;
}

.menu {
  width: 200px;
  margin-right: 24px;
}

.main-content {
  flex: 1;
  background-color: var(--n-color-card);
  border-radius: 4px;
  padding: 24px;
}
</style>