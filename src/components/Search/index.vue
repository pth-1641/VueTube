<script setup>
import {
  NLayoutContent,
  NSpace,
  NLayout,
  NSelect,
  NText,
  useLoadingBar,
  NSpin,
} from 'naive-ui';
import { useRoute } from 'vue-router';
import { onMounted, ref, watch, onBeforeUnmount } from 'vue';
import axios from 'axios';
import Video from './Video.vue';
import Channel from './Channel.vue';
import Playlist from './Playlist.vue';
import { getNextData } from '../../utils/get-next-data';

const route = useRoute();
const searchResults = ref([]);
const filter = ref('all');
const loadingBar = useLoadingBar();
const nextpageData = ref();
const isLoading = ref(false);

const getData = async (q) => {
  try {
    loadingBar.start();
    const { data } = await axios.get(`/search?q=${q}&filter=${filter.value}`);
    searchResults.value = data.items;
    nextpageData.value = data.nextpage;
    document.title = `${q} | VueTube`;
    loadingBar.finish();
  } catch (err) {
    console.error(err);
    loadingBar.error();
  }
};

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

const nextSearchResult = async () => {
  const endOfPage =
    window.scrollY + window.innerHeight >= document.body.offsetHeight;
  if (!endOfPage || !nextpageData.value) return;
  if (isLoading.value) return;
  try {
    isLoading.value = true;
    const res = await getNextData({
      type: 'search',
      nextpage: nextpageData.value,
      options: {
        filter: filter.value,
        q: route.query.q,
      },
    });
    nextpageData.value = res.nextpage;
    searchResults.value = [...searchResults.value, ...res.items];
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getData(route.query.q);
  window.addEventListener('scroll', nextSearchResult);
  window.scrollTo(0, 0);
});

onBeforeUnmount(() => window.removeEventListener('scroll', nextSearchResult));

watch(route, ({ query }) => {
  searchResults.value = [];
  window.scrollTo(0, 0);
  getData(query.q);
});
</script>

<template>
  <n-layout :style="{ padding: '24px 0', minHeight: '100vh' }">
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
        <template v-if="isLoading">
          <n-space
            align="center"
            justify="center"
            :style="{ marginTop: '40px' }"
          >
            <n-spin :size="36" />
          </n-space>
        </template>
      </n-space>
    </n-layout-content>
  </n-layout>
</template>
