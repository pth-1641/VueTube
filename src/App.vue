<script setup>
import Navbar from './components/Navbar.vue';
import {
  NConfigProvider,
  darkTheme,
  lightTheme,
  NBackTop,
  NScrollbar,
  NMessageProvider,
  NIcon,
} from 'naive-ui';
import { ref } from 'vue';
import { BackToTop } from '@vicons/carbon';

const theme = ref(lightTheme);
const handleToggleTheme = () => {
  const currentTheme = theme.value.name;
  theme.value = currentTheme === 'light' ? darkTheme : lightTheme;
};
</script>

<template>
  <n-config-provider :theme="theme">
    <n-message-provider>
      <Navbar @toggle-theme="handleToggleTheme" />
      <div :style="{ paddingTop: '54px' }" />
      <router-view :key="$route.fullPath" />
      <n-back-top
        :visibility-height="500"
        :style="{ filter: 'invert(100%)', boxShadow: 'none' }"
      >
        <n-icon :component="BackToTop" :size="24" />
      </n-back-top>
    </n-message-provider>
  </n-config-provider>
</template>

<style>
body {
  font-family: 'Roboto', sans-serif;
}
</style>
