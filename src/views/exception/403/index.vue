<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NResult, NButton } from 'naive-ui'

const router = useRouter()

function goBack() {
  router.go(-1)
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <div class="exception-container">
    <NResult
      status="403"
      title="403 禁止访问"
      description="抱歉，您没有权限访问此页面"
    >
      <template #footer>
        <div class="flex gap-4">
          <NButton @click="goBack">返回上一页</NButton>
          <NButton type="primary" @click="goHome">返回首页</NButton>
        </div>
      </template>
    </NResult>
  </div>
</template>

<style scoped>
.exception-container {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
}
</style>