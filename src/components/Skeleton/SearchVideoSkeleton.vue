<script setup>
import { NSpace, NSkeleton } from 'naive-ui';
</script>

<template>
  <n-space :wrap="true" :style="{ gap: '16px' }">
    <n-skeleton width="360px" height="202px" :style="{ borderRadius: '8px' }" />
    <n-space vertical>
      <n-skeleton width="100%" height="18px" />
      <n-skeleton width="40%" height="18px" />
      <n-skeleton width="15%" :repeat="2" text />
      <div :style="{ display: 'flex', alignItems: 'center', gap: '10px' }">
        <n-skeleton circle height="30px" />
        <n-skeleton width="20%" />
      </div>
      <n-skeleton />
      <n-skeleton width="50%" />
    </n-space>
  </n-space>
</template>
