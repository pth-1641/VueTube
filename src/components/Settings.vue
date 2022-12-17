<script setup>
import {
  NLayoutContent,
  NLayout,
  NH1,
  NSpace,
  NH4,
  NSelect,
  NText,
  NIcon,
} from 'naive-ui';
import { ServerDns, Carbon4K, LocationFilled, ViewNext } from '@vicons/carbon';
import { onMounted, ref } from 'vue';
import axios from 'axios';

const servers = ref([]);
const defaultServer = ref('Server');
const countries = ref([]);
const defaultCountry = ref(localStorage['countryCode'] || 'VN');
const defaultResolution = ref(localStorage['resolution'] || '720p');
const defaultSeekTime = ref(localStorage['seek'] || '5 seconds');

const resolutions = [
  {
    label: '2160p',
    value: '2160p',
  },
  {
    label: '1440p',
    value: '1440p',
  },
  {
    label: '1080p',
    value: '1080p',
  },
  {
    label: '720p',
    value: '720p',
  },
  {
    label: '480p',
    value: '480p',
  },
  {
    label: '360p',
    value: '360p',
  },
  {
    label: '240p',
    value: '240p',
  },
  {
    label: '144p',
    value: '144p',
  },
];

const seekTimes = [
  {
    label: '5 seconds',
    value: '5',
  },
  {
    label: '10 seconds',
    value: '10',
  },
  {
    label: '15 seconds',
    value: '15',
  },
  {
    label: '20 seconds',
    value: '20',
  },
  {
    label: '30 seconds',
    value: '30',
  },
  {
    label: '60 seconds',
    value: '60',
  },
];

onMounted(async () => {
  document.title = 'Settings | VueTube';
  const serverList = await axios.get(import.meta.env.VITE_LIST_SERVER);
  servers.value = serverList.data;
  const countryList = await axios.get('https://restcountries.com/v2/all');
  countries.value = countryList.data.filter((c) => c.name !== 'China');
  defaultServer.value =
    document.cookie.split('=')[1] || import.meta.env.VITE_API_URL;
});

const handleChangeServer = (endPoint) => {
  document.cookie = `server=${endPoint}`;
  location.reload();
};

const handleChangeResolution = (resolution) => {
  localStorage.resolution = resolution;
};

const handleChangeSeekTime = (seekTime) => {
  localStorage.seek = seekTime;
};

const handleChangeCountry = (countryCode) => {
  localStorage.countryCode = countryCode;
};
</script>

<template>
  <n-layout :style="{ padding: '24px 0', minHeight: '100vh' }">
    <n-layout-content :style="{ maxWidth: '768px', margin: 'auto' }">
      <n-h1 :style="{ fontSize: '36px', textAlign: 'center' }">Settings</n-h1>
      <n-space vertical :size="24">
        <n-space align="center" justify="space-between">
          <n-space align="flex-start">
            <n-icon :component="ServerDns" size="24" />
            <n-h4 :style="{ margin: 0 }">Servers</n-h4>
          </n-space>
          <n-text>
            <n-select
              v-model:value="defaultServer"
              label-field="locations"
              value-field="api_url"
              placement="bottom"
              :options="servers"
              :style="{
                width: 'max-content',
                minWidth: '220px',
              }"
              @update:value="handleChangeServer"
            />
            <n-text type="error" strong :style="{ fontSize: '12px' }"
              >This may affect your network</n-text
            >
          </n-text>
        </n-space>
        <n-space align="center" justify="space-between">
          <n-space align="flex-start">
            <n-icon :component="Carbon4K" size="24" />
            <n-h4 :style="{ margin: 0 }">Default Resolution</n-h4>
          </n-space>
          <n-select
            v-model:value="defaultResolution"
            placement="bottom"
            :options="resolutions"
            :style="{
              width: 'max-content',
              minWidth: '220px',
            }"
            @update:value="handleChangeResolution"
          />
        </n-space>
        <n-space align="center" justify="space-between">
          <n-space align="flex-start">
            <n-icon :component="ViewNext" size="24" />
            <n-h4 :style="{ margin: 0 }">Seek</n-h4>
          </n-space>
          <n-select
            v-model:value="defaultSeekTime"
            placement="bottom"
            :options="seekTimes"
            :style="{
              width: 'max-content',
              minWidth: '220px',
            }"
            @update:value="handleChangeSeekTime"
          />
        </n-space>
        <n-space align="center" justify="space-between">
          <n-space align="flex-start">
            <n-icon :component="LocationFilled" size="24" />
            <n-h4 :style="{ margin: 0 }">Location</n-h4>
          </n-space>
          <n-select
            v-model:value="defaultCountry"
            label-field="name"
            value-field="alpha2Code"
            placement="bottom"
            :options="countries"
            :style="{
              width: 'max-content',
              minWidth: '220px',
            }"
            @update:value="handleChangeCountry"
          />
        </n-space>
      </n-space>
    </n-layout-content>
  </n-layout>
</template>
