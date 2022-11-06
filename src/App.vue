<script setup>
import Navbar from './components/Navbar.vue';
import { NConfigProvider, darkTheme, lightTheme } from 'naive-ui';
import { ref } from 'vue';

const theme = ref(lightTheme);
const handleToggleTheme = () => {
  const currentTheme = theme.value.name;
  theme.value = currentTheme === 'light' ? darkTheme : lightTheme;
};
</script>

<template>
  <n-config-provider :theme="theme">
    <Navbar @toggle-theme="handleToggleTheme" />
    <div :style="{ paddingTop: '54px' }" />
    <router-view />
  </n-config-provider>
</template>
