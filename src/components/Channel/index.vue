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
} from 'naive-ui';
import { CheckmarkFilled } from '@vicons/carbon';
import { useRoute } from 'vue-router';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { formatViews } from '../../utils/format-view-count';
import { renderHTML } from '../../utils/render-html';
import Videos from './Videos.vue';
import Playlists from './Playlists.vue';
import RelatedChannels from './RelatedChannels.vue';
import Shorts from './Shorts.vue';
import Livestreams from './Livestreams.vue';

const route = useRoute();
const channelId = route.params.id;
const channelDetail = ref({});

onMounted(async () => {
  try {
    const { data } = await axios.get(`/channel/${channelId}`);
    channelDetail.value = data;
    console.log(data);
    document.title = `VueTube | ${data.name}`;
  } catch (err) {
    console.error(err);
  }
});
</script>

<template>
  <n-layout>
    <n-image :src="channelDetail.bannerUrl" width="9999" preview-disabled />
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
        default-value="videos"
        :tab-style="{
          fontWeight: 600,
          padding: '10px 24px',
        }"
      >
        <n-tab-pane name="videos" tab="VIDEOS" :style="{ minHeight: '100vh' }">
          <Videos
            :videos="channelDetail.relatedStreams"
            :nextpage="channelDetail.nextpage"
          />
        </n-tab-pane>
        <template v-for="tab in channelDetail.tabs">
          <n-tab-pane
            :name="tab.name.toLowerCase()"
            :tab="tab.name.toUpperCase()"
            :style="{ minHeight: '100vh' }"
          >
            <template v-if="tab.name.toLowerCase() === 'playlists'">
              <Playlists :data="tab.data" />
            </template>
            <template v-else-if="tab.name.toLowerCase() === 'channels'">
              <RelatedChannels :data="tab.data" />
            </template>
            <template v-else-if="tab.name.toLowerCase() === 'shorts'">
              <Shorts :data="tab.data" />
            </template>
            <template v-else-if="tab.name.toLowerCase() === 'livestreams'">
              <Livestreams :data="tab.data" />
            </template>
          </n-tab-pane>
        </template>
        <n-tab-pane
          name="about"
          tab="ABOUT"
          :style="{ minHeight: '100vh', padding: '30px 0' }"
        >
          <span v-html="renderHTML(channelDetail.description)" />
        </n-tab-pane>
      </n-tabs>
    </n-layout-content>
  </n-layout>
</template>
