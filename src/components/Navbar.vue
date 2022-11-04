<script setup>
import {
  NButton,
  NSpace,
  NIcon,
  NForm,
  NInput,
  NInputGroup,
  NSwitch,
  NDrawer,
  NDrawerContent,
  NMenu,
} from 'naive-ui';
import {
  ChevronRight,
  Search,
  UserAvatar,
  Sun,
  Moon,
  Home,
} from '@vicons/carbon';
import { ref, h } from 'vue';
import { RouterLink } from 'vue-router';

const active = ref(false);

const openDrawer = () => (active.value = true);
const renderIcon = (icon) => () => h(NIcon, null, () => h(icon));
const renderRoute = (route) =>
  h(RouterLink, {
    to: route,
  });

const menuOptions = [
  {
    label: 'Home',
    icon: renderIcon(Home),
    key: 'home',
    route: renderRoute('/'),
  },
];
</script>

<template>
  <n-space
    :style="{ padding: '6px 30px' }"
    align="center"
    justify="space-between"
  >
    <n-space>
      <n-button type="primary" ghost circle @click="openDrawer">
        <template #icon>
          <n-icon :component="ChevronRight" />
        </template>
      </n-button>
      <n-drawer v-model:show="active" placement="left" render-icon>
        <n-drawer-content title="VueTube">
          <n-menu :options="menuOptions" />
        </n-drawer-content>
      </n-drawer>
    </n-space>

    <n-form>
      <n-input-group>
        <n-input placeholder="Search" clearable status="success" />
        <n-button attr-type="submit" type="primary">
          <template #icon>
            <n-icon :component="Search" />
          </template>
        </n-button>
      </n-input-group>
    </n-form>

    <n-space align="center" justify="center">
      <n-switch>
        <template #checked>
          <n-icon :component="Moon" />
        </template>
        <template #unchecked>
          <n-icon :component="Sun" />
        </template>
      </n-switch>
      <n-button type="primary" ghost>
        <template #icon>
          <n-icon :component="UserAvatar" size="20" />
        </template>
        Login
      </n-button>
    </n-space>
  </n-space>
</template>
