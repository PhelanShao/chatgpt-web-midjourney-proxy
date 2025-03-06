<script setup lang="ts">
import { NConfigProvider } from 'naive-ui'
import { NaiveProvider } from '@/components/common'
import { useTheme } from '@/hooks/useTheme'
import { useLanguage } from '@/hooks/useLanguage'
import aiOther from "@/views/mj/aiOther.vue"
import { onMounted, watch } from 'vue'
import { useAuthStore, useUserSettingStore, useChatStore } from '@/store'
import { gptServerStore } from '@/store/homeStore'

const { theme, themeOverrides } = useTheme()
const { language } = useLanguage()
const authStore = useAuthStore()
const userSettingStore = useUserSettingStore()
const chatStore = useChatStore()

// 监听用户登录状态变化
watch(() => authStore.isLoggedIn, (isLoggedIn) => {
  if (isLoggedIn) {
    // 用户登录后，加载用户设置、API设置和会话
    loadUserData();
  }
});

// 加载用户数据（设置、API设置和会话）
const loadUserData = async () => {
  try {
    // 加载用户设置
    await userSettingStore.fetchUserSettings();
    
    // 加载用户API设置
    await userSettingStore.fetchApiSettings();
    
    // 重新加载API设置
    gptServerStore.reloadUserSettings();
    
    // 加载用户的会话
    await chatStore.loadUserConversations();
    
    console.log('用户数据加载成功');
  } catch (error) {
    console.error('加载用户数据失败:', error);
  }
};

// 在应用启动时加载用户数据
onMounted(async () => {
  // 如果用户已登录，加载用户数据
  if (authStore.isLoggedIn) {
    await loadUserData();
  }
});
</script>

<template>
  <NConfigProvider
    class="h-full"
    :theme="theme"
    :theme-overrides="themeOverrides"
    :locale="language"
  >
    <NaiveProvider>
      <RouterView />
    </NaiveProvider>
  </NConfigProvider>
  <!-- 处理一下chat 与draw 共有的事情 -->
  <aiOther/>
</template>
