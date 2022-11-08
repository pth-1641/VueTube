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
  NEllipsis,
  NGrid,
  NGi,
} from 'naive-ui';
import { CheckmarkFilled } from '@vicons/carbon';
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { formatViews } from '../utils/format-view-count';
import { renderHTML } from '../utils/render-html';

const route = useRoute();
const router = useRouter();
const channelId = route.params.id;
const channelDetail = ref({});

onMounted(() => {
  axios
    .get(`/channel/${channelId}`)
    .then(({ data }) => (channelDetail.value = data));
});

const handleChangeTab = (value) => {
  const tabIndex = channelDetail.value.tabs.findIndex(
    (tab) => tab.name.toLowerCase() === value
  );
  if (tabIndex > -1) {
    axios
      .get(`/channels/tabs?data=${channelDetail.value.tabs[tabIndex].data}`)
      .then(({ data }) => console.log(data));
  }
};
</script>

<template>
  <n-layout :style="{ minHeight: '100vh' }">
    <n-image :src="channelDetail.bannerUrl" width="9999" />
    <n-layout-content :style="{ maxWidth: '1180px', margin: 'auto' }">
      <n-space
        align="center"
        justify="space-between"
        :style="{ marginTop: '20px' }"
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
            <n-text>
              {{ formatViews(channelDetail.subscriberCount) }}
              subscribers
            </n-text>
          </n-text>
        </n-space>
        <n-button type="primary" :style="{ fontWeight: 600 }"
          >SUBSCRIBE</n-button
        >
      </n-space>
      <n-tabs
        type="line"
        animated
        justify-content="center"
        :tab-style="{
          fontWeight: 600,
          padding: '10px 24px',
        }"
        :on-update:value="handleChangeTab"
      >
        <n-tab-pane name="videos" tab="VIDEOS">
          <n-grid :cols="5" x-gap="16" y-gap="36">
            <n-gi
              v-for="video in channelDetail.relatedStreams"
              :key="video.url"
              :style="{
                display: 'flex',
                flexDirection: 'column',
                cursor: 'pointer',
              }"
              @click="router.push(video.url)"
            >
              <n-image
                :src="video.thumbnail"
                preview-disabled
                object-fit="cover"
                width="999"
                :style="{ borderRadius: '8px' }"
              />
              <n-ellipsis
                :tooltip="false"
                :line-clamp="2"
                :style="{ fontWeight: 600, marginTop: '6px' }"
              >
                {{ video.title }}
              </n-ellipsis>
              <n-text depth="3" strong>
                {{ formatViews(video.views) }} views •
                {{ video.uploadedDate }}
              </n-text>
            </n-gi>
          </n-grid>
        </n-tab-pane>
        <template v-for="tab in channelDetail.tabs">
          <n-tab-pane
            :name="tab.name.toLowerCase()"
            :tab="tab.name.toUpperCase()"
          ></n-tab-pane>
        </template>
        <n-tab-pane name="about" tab="ABOUT">
          <span v-html="renderHTML(channelDetail.description)" />
        </n-tab-pane>
      </n-tabs>
    </n-layout-content>
  </n-layout>
</template>
