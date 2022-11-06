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
  NLayoutHeader,
  NGradientText,
  NList,
  NListItem,
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
import axios from 'axios';
import { useRouter } from 'vue-router';

const emit = defineEmits(['toggle-theme']);
const router = useRouter();

const suggestOptions = ref([]);
const handleQuerySuggest = (query) => {
  const queryType = query.type;
  const queryString = query.type ? query.target.value.trim() : query.trim();
  if (queryType === 'blur' || !queryString) {
    suggestOptions.value = [];
    return;
  }
  if (queryString) {
    axios
      .get(`/opensearch/suggestions?query=${queryString}`)
      .then(({ data }) => (suggestOptions.value = data[1]));
  }
};

const handleRedirectSearch = (suggest) => {
  suggestOptions.value = [];
  router.push(`/search?q=${suggest}`);
};

const drawerActive = ref(false);
const renderIcon = (icon) => () => h(NIcon, null, () => h(icon));
const renderRoute = (route) =>
  h(RouterLink, {
    to: route,
  });

const drawerOptions = [
  {
    label: 'Home',
    icon: renderIcon(Home),
    key: 'home',
    route: renderRoute('/'),
  },
];
</script>

<template>
  <n-layout-header bordered :style="{ position: 'fixed', zIndex: 99 }">
    <n-space
      :style="{ padding: '10px 32px' }"
      align="center"
      justify="space-between"
    >
      <n-space>
        <n-button type="primary" ghost circle @click="drawerActive = true">
          <template #icon>
            <n-icon :component="ChevronRight" />
          </template>
        </n-button>
        <n-drawer v-model:show="drawerActive" placement="left">
          <n-drawer-content>
            <template #header>
              <n-gradient-text
                size="25"
                type="success"
                :style="{ fontWeight: 700 }"
              >
                VueTube
              </n-gradient-text>
            </template>
            <n-menu :options="drawerOptions" />
          </n-drawer-content>
        </n-drawer>
      </n-space>

      <n-form :style="{ position: 'relative' }">
        <n-input-group>
          <n-input
            placeholder="Search"
            clearable
            status="success"
            @input="handleQuerySuggest"
            @focus="handleQuerySuggest"
            @blur="handleQuerySuggest"
            :style="{ minWidth: '400px' }"
          />
          <n-button attr-type="submit" type="primary">
            <template #icon>
              <n-icon :component="Search" />
            </template>
          </n-button>
        </n-input-group>
        <n-list
          hoverable
          bordered
          clickable
          :show-divider="false"
          :style="{
            position: 'absolute',
            top: '40px',
            right: '50%',
            transform: 'translateX(50%)',
            width: '400px',
            padding: '12px 0',
          }"
          v-if="suggestOptions.length"
        >
          <n-list-item
            :style="{ padding: '5px 10px' }"
            v-for="suggest in suggestOptions"
            :key="suggest"
            @click="handleRedirectSearch(suggest)"
          >
            <n-space :wrap="false" align="center">
              <div :style="{ display: 'flex', alignItems: 'center' }">
                <n-icon :component="Search" size="17" />
              </div>
              {{ suggest }}
            </n-space>
          </n-list-item>
        </n-list>
      </n-form>

      <n-space align="center" justify="center">
        <n-switch @update:value="emit('toggle-theme')" size="small">
          <template #checked-icon>
            <n-icon :component="Moon" />
          </template>
          <template #unchecked-icon>
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
  </n-layout-header>
</template>
