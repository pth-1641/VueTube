<script setup>
import Navbar from './components/Navbar.vue';
import { darkTheme } from 'naive-ui';
import { ref } from 'vue';

const props = defineProps(['theme']);
const theme = ref(null);
</script>

<template>
  <n-config-provider :theme="theme">
    <Navbar :theme="theme" />
  </n-config-provider>
</template>

<style>
body {
  margin: 0;
}
</style>
