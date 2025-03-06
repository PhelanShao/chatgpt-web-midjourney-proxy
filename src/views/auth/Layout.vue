<script setup lang="ts">
// 认证布局组件
</script>

<template>
  <div class="auth-layout">
    <div class="auth-container">
      <div class="auth-logo">
        <img src="/favicon-full.svg" alt="Logo" class="w-12 h-12" />
        <h1 class="text-2xl font-bold ml-2">ChatGPT Web</h1>
      </div>
      <router-view />
    </div>
  </div>
</template>

<style scoped>
.auth-layout {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: var(--n-color-page);
}

.auth-container {
  width: 100%;
  max-width: 480px;
  padding: 2rem;
}

.auth-logo {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
}
</style>