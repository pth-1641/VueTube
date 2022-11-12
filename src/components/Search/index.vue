<script setup>
import { NLayoutContent, NSpace, NLayout, NSelect, NText } from 'naive-ui';
import { useRoute } from 'vue-router';
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import Video from './Video.vue';
import Channel from './Channel.vue';
import Playlist from './Playlist.vue';

const route = useRoute();
const searchResults = ref([]);
const filter = ref('all');

const getData = (q) =>
  axios
    .get(`/search?q=${q}&filter=${filter.value}`)
    .then(({ data }) => (searchResults.value = data.items));

onMounted(() => getData(route.query.q));

watch(route, () => getData(route.query.q));

const filterOptions = [
  {
    label: 'All',
    value: 'all',
  },
  {
    label: 'Videos',
    value: 'videos',
  },
  {
    label: 'Channels',
    value: 'channels',
  },
  {
    label: 'Playlists',
    value: 'playlists ',
  },
];

const handleUpdateFilter = () => getData(route.query.q);
</script>

<template>
  <n-layout :style="{ padding: '24px 0' }">
    <n-layout-content :style="{ maxWidth: '1120px', margin: 'auto' }">
      <n-text tag="div" :style="{ marginBottom: '30px' }">
        <n-select
          v-model:value="filter"
          :options="filterOptions"
          @update:value="handleUpdateFilter"
          :style="{ width: '150px', marginLeft: 'auto' }"
        />
      </n-text>
      <n-space :size="15" :style="{ overflow: 'hidden' }" vertical>
        <template v-for="item in searchResults" :key="item.url">
          <template v-if="item.type === 'stream'">
            <Video :video="item" />
          </template>
          <template v-else-if="item.type === 'channel'">
            <Channel :channel="item" />
          </template>
          <template v-else-if="item.type === 'playlist'">
            <Playlist :playlist="item" />
          </template>
        </template>
      </n-space>
    </n-layout-content>
  </n-layout>
</template>
