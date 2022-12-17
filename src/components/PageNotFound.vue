<script setup>
import { NResult, NButton, NLayout, NLayoutContent, NSpace } from 'naive-ui';
import { useRouter } from 'vue-router';

const router = useRouter();
</script>

<template>
  <n-layout :style="{ padding: '25px', minHeight: '100vh' }">
    <n-layout-content
      :style="{ maxWidth: '1520px', margin: 'auto' }"
      :native-scrollbar="false"
    >
      <n-space align="center" justify="center" :style="{ marginTop: '100px' }">
        <n-result
          status="404"
          title="404 Not Found"
          description="The page you're looking for may not exist"
          size="huge"
        >
          <template #footer>
            <n-button @click="router.push('/')">Go Home</n-button>
          </template>
        </n-result>
      </n-space>
    </n-layout-content>
  </n-layout>
</template>
