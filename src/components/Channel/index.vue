<script setup>
import {
  NLayout,
  NLayoutContent,
  NImage,
  NSpace,
  NAvatar,
  NText,
  NH2,
  NIcon,
  NButton,
  NTabs,
  NTabPane,
  useLoadingBar,
} from 'naive-ui';
import { CheckmarkFilled } from '@vicons/carbon';
import { useRoute } from 'vue-router';
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { formatViews } from '../../utils/format-view-count';
import { renderHTML } from '../../utils/render-html';
import Videos from './Videos.vue';
import Playlists from './Playlists.vue';
import RelatedChannels from './RelatedChannels.vue';
import Shorts from './Shorts.vue';
import Livestreams from './Livestreams.vue';

const route = useRoute();
const channelId = ref(route.params.id);
const channelDetail = ref({});
const loadingBar = useLoadingBar();
const aboutContent = ref();
const selectedTab = ref('');

const getChannelData = async (id) => {
  try {
    loadingBar.start();
    const { data } = await axios.get(`/channel/${id}`);
    channelDetail.value = data;
    aboutContent.value = data.description;
    document.title = `VueTube | ${data.name}`;
    selectedTab.value = 'videos';
    loadingBar.finish();
  } catch (err) {
    console.error(err);
    loadingBar.error();
  }
};

onMounted(() => getChannelData(channelId.value));
watch(route, ({ params }) => {
  getChannelData(params.id);
  channelId.value = params.id;
});
</script>

<template>
  <n-layout :style="{ minHeight: '100vh' }">
    <n-image :src="channelDetail.bannerUrl" width="99999" preview-disabled />
    <n-layout-content :style="{ maxWidth: '1180px', margin: 'auto' }">
      <n-space
        align="center"
        justify="space-between"
        :style="{ margin: '20px 0 10px' }"
      >
        <n-space align="center" justify="space-between" :size="20">
          <n-avatar :src="channelDetail.avatarUrl" :size="72" circle />
          <n-text tag="div">
            <n-space :size="8">
              <n-h2
                :style="{
                  marginBottom: 0,
                  fontSize: '24px',
                }"
              >
                {{ channelDetail.name }}
                <template v-if="channelDetail.verified">
                  <n-icon :component="CheckmarkFilled" :size="14" depth="2" />
                </template>
              </n-h2>
            </n-space>
            <template v-if="channelDetail.subscriberCount > 0">
              <n-text>
                {{ formatViews(channelDetail.subscriberCount) }}
                subscribers
              </n-text>
            </template>
          </n-text>
        </n-space>
        <n-button type="primary" :style="{ fontWeight: 600 }"
          >SUBSCRIBE</n-button
        >
      </n-space>
      <n-tabs
        type="line"
        animated
        :tab-style="{
          fontWeight: 600,
          padding: '10px 24px',
        }"
        :value="selectedTab"
        :on-update:value="(t) => (selectedTab = t)"
      >
        <n-tab-pane name="videos" tab="VIDEOS" :style="{ minHeight: '100vh' }">
          <Videos :channelId="channelId" />
        </n-tab-pane>
        <template v-for="tab in channelDetail.tabs">
          <n-tab-pane
            :name="tab.name.toLowerCase()"
            :tab="tab.name.toUpperCase()"
            :style="{ minHeight: '100vh' }"
          >
            <template v-if="tab.name.toLowerCase() === 'playlists'">
              <Playlists :data="tab.data" :channelId="channelId" />
            </template>
            <template v-else-if="tab.name.toLowerCase() === 'channels'">
              <RelatedChannels :data="tab.data" :channelId="channelId" />
            </template>
            <template v-else-if="tab.name.toLowerCase() === 'shorts'">
              <Shorts :data="tab.data" :channelId="channelId" />
            </template>
            <template v-else-if="tab.name.toLowerCase() === 'livestreams'">
              <Livestreams :data="tab.data" :channelId="channelId" />
            </template>
          </n-tab-pane>
        </template>
        <n-tab-pane
          name="about"
          tab="ABOUT"
          :style="{ minHeight: '100vh', padding: '30px 0' }"
        >
          <span v-html="renderHTML(aboutContent)" />
        </n-tab-pane>
      </n-tabs>
    </n-layout-content>
  </n-layout>
</template>
