<script lang="ts" setup>
import { computed, ref } from 'vue'
import { NButton, NInput, NPopconfirm, NSelect, NForm, NFormItem, NModal, useMessage } from 'naive-ui'
import type { Language, Theme } from '@/store/modules/app/helper'
import { SvgIcon } from '@/components/common'
import { useAppStore, useUserStore, useAuthStore } from '@/store'
import type { UserInfo } from '@/store/modules/user/helper'
import { getCurrentDate } from '@/utils/functions'
import { useBasicLayout } from '@/hooks/useBasicLayout'
import { t } from '@/locales'
import { changePassword } from '@/api/user'
import { useRouter } from 'vue-router'

const appStore = useAppStore()
const userStore = useUserStore()
const authStore = useAuthStore()
const router = useRouter()

const { isMobile } = useBasicLayout()

const ms = useMessage()

const theme = computed(() => appStore.theme)

const userInfo = computed(() => userStore.userInfo)

const avatar = ref(userInfo.value.avatar ?? '')

const name = ref(userInfo.value.name ?? '')

const description = ref(userInfo.value.description ?? '')

const backgroundImage = ref(userInfo.value.backgroundImage ?? '')

// 修改密码相关
const showPasswordModal = ref(false)
const currentPassword = ref('')
const newPassword = ref('')
const confirmPassword = ref('')
const passwordLoading = ref(false)

const language = computed({
  get() {
    return appStore.language
  },
  set(value: Language) {
    appStore.setLanguage(value)
  },
})

const themeOptions: { label: string; key: Theme; icon: string }[] = [
  {
    label: 'Auto',
    key: 'auto',
    icon: 'ri:contrast-line',
  },
  {
    label: 'Light',
    key: 'light',
    icon: 'ri:sun-foggy-line',
  },
  {
    label: 'Dark',
    key: 'dark',
    icon: 'ri:moon-foggy-line',
  },
]

const languageOptions: { label: string; key: Language; value: Language }[] = [
  { label: '简体中文', key: 'zh-CN', value: 'zh-CN' },
  { label: '繁體中文', key: 'zh-TW', value: 'zh-TW' },
  { label: 'English', key: 'en-US', value: 'en-US' },
  { label: '한국어', key: 'ko-KR', value: 'ko-KR' },
  { label: 'Русский язык', key: 'ru-RU', value: 'ru-RU' },
  { label: 'Tiếng Việt', key: 'vi-VN', value: 'vi-VN' },
  { label: 'Français', key: 'fr-FR', value: 'fr-FR' },
  { label: 'Türkçe', key: 'tr-TR', value: 'tr-TR' },
]

function updateUserInfo(options: Partial<UserInfo>) {
  userStore.updateUserInfo(options)
  ms.success(t('common.success'))
}

function handleReset() {
  userStore.resetUserInfo()
  ms.success(t('common.success'))
  window.location.reload()
}

function exportData(): void {
  const date = getCurrentDate()
  const data: string = localStorage.getItem('chatStorage') || '{}'
  const jsonString: string = JSON.stringify(JSON.parse(data), null, 2)
  const blob: Blob = new Blob([jsonString], { type: 'application/json' })
  const url: string = URL.createObjectURL(blob)
  const link: HTMLAnchorElement = document.createElement('a')
  link.href = url
  link.download = `chat-store_${date}.json`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function importData(event: Event): void {
  const target = event.target as HTMLInputElement
  if (!target || !target.files)
    return

  const file: File = target.files[0]
  if (!file)
    return

  const reader: FileReader = new FileReader()
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result as string)
      localStorage.setItem('chatStorage', JSON.stringify(data))
      ms.success(t('common.success'))
      location.reload()
    }
    catch (error) {
      ms.error(t('common.invalidFileFormat'))
    }
  }
  reader.readAsText(file)
}

function clearData(): void {
  localStorage.removeItem('chatStorage')
  location.reload()
}

function handleImportButtonClick(): void {
  const fileInput = document.getElementById('fileInput2') as HTMLElement
  if (fileInput)   fileInput.click()
}

// 修改密码
async function handleChangePassword() {
  if (!currentPassword.value) {
    ms.error('请输入当前密码')
    return
  }
  
  if (!newPassword.value) {
    ms.error('请输入新密码')
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
    showPasswordModal.value = false
    
    // 清空输入框
    currentPassword.value = ''
    newPassword.value = ''
    confirmPassword.value = ''
  } catch (error) {
    ms.error(error.message || '密码修改失败')
  } finally {
    passwordLoading.value = false
  }
}

// 注销登录
async function handleLogout() {
  try {
    await authStore.logout()
    ms.success('注销成功')
    router.push('/auth/login')
  } catch (error) {
    ms.error(error.message || '注销失败')
  }
}
</script>

<template>
  <div class="p-4 space-y-5 min-h-[200px]">
    <div class="space-y-6">
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.avatarLink') }}</span>
        <div class="flex-1">
          <NInput v-model:value="avatar" placeholder="" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateUserInfo({ avatar })">
          {{ $t('common.save') }}
        </NButton>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.name') }}</span>
        <div class="w-[200px]">
          <NInput v-model:value="name" placeholder="" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateUserInfo({ name })">
          {{ $t('common.save') }}
        </NButton>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.backgroundImage') }}</span>
        <div class="w-[200px]">
          <NInput v-model:value="backgroundImage" placeholder="" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateUserInfo({ backgroundImage })">
          {{ $t('common.save') }}
        </NButton>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.description') }}</span>
        <div class="flex-1">
          <NInput v-model:value="description" placeholder="" />
        </div>
        <NButton size="tiny" text type="primary" @click="updateUserInfo({ description })">
          {{ $t('common.save') }}
        </NButton>
      </div>
      
      <!-- 修改密码 -->
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">密码管理</span>
        <NButton size="small" @click="showPasswordModal = true">
          <template #icon>
            <SvgIcon icon="ri:lock-password-line" />
          </template>
          修改密码
        </NButton>
      </div>
      
      <!-- 注销登录 -->
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">账号管理</span>
        <NPopconfirm placement="bottom" @positive-click="handleLogout">
          <template #trigger>
            <NButton size="small" type="error">
              <template #icon>
                <SvgIcon icon="ri:logout-box-line" />
              </template>
              注销登录
            </NButton>
          </template>
          确定要注销登录吗？
        </NPopconfirm>
      </div>
      
      <div
        class="flex items-center space-x-4"
        :class="isMobile && 'items-start'"
      >
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.chatHistory') }}</span>

        <div class="flex flex-wrap items-center gap-4">
          <NButton size="small" @click="exportData">
            <template #icon>
              <SvgIcon icon="ri:download-2-fill" />
            </template>
            {{ $t('common.export') }}
          </NButton>

          <input id="fileInput2" type="file" style="display:none" @change="importData">
          <NButton size="small" @click="handleImportButtonClick">
            <template #icon>
              <SvgIcon icon="ri:upload-2-fill" />
            </template>
            {{ $t('common.import') }}
          </NButton>

          <NPopconfirm placement="bottom" @positive-click="clearData">
            <template #trigger>
              <NButton size="small">
                <template #icon>
                  <SvgIcon icon="ri:close-circle-line" />
                </template>
                {{ $t('common.clear') }}
              </NButton>
            </template>
            {{ $t('chat.clearHistoryConfirm') }}
          </NPopconfirm>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.theme') }}</span>
        <div class="flex flex-wrap items-center gap-4">
          <template v-for="item of themeOptions" :key="item.key">
            <NButton
              size="small"
              :type="item.key === theme ? 'primary' : undefined"
              @click="appStore.setTheme(item.key)"
            >
              <template #icon>
                <SvgIcon :icon="item.icon" />
              </template>
            </NButton>
          </template>
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.language') }}</span>
        <div class="flex flex-wrap items-center gap-4">
          <NSelect
            style="width: 140px"
            :value="language"
            :options="languageOptions"
            @update-value="value => appStore.setLanguage(value)"
          />
        </div>
      </div>
      <div class="flex items-center space-x-4">
        <span class="flex-shrink-0 w-[100px]">{{ $t('setting.resetUserInfo') }}</span>
        <NButton size="small" @click="handleReset">
          {{ $t('common.reset') }}
        </NButton>
      </div>
    </div>
  </div>
  
  <!-- 修改密码弹窗 -->
  <NModal v-model:show="showPasswordModal" preset="card" title="修改密码" style="width: 90%; max-width: 400px;">
    <NForm>
      <NFormItem label="当前密码" required>
        <NInput v-model:value="currentPassword" type="password" placeholder="请输入当前密码" />
      </NFormItem>
      <NFormItem label="新密码" required>
        <NInput v-model:value="newPassword" type="password" placeholder="请输入新密码" />
      </NFormItem>
      <NFormItem label="确认新密码" required>
        <NInput v-model:value="confirmPassword" type="password" placeholder="请再次输入新密码" />
      </NFormItem>
      <div class="flex justify-end mt-4 space-x-4">
        <NButton @click="showPasswordModal = false">取消</NButton>
        <NButton type="primary" :loading="passwordLoading" @click="handleChangePassword">确认修改</NButton>
      </div>
    </NForm>
  </NModal>
</template>
