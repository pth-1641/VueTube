<script setup>
import {
  NLayout,
  NLayoutContent,
  NGrid,
  NGridItem,
  useLoadingBar,
} from 'naive-ui';
import { useRoute } from 'vue-router';
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import MainVideo from './MainVideo.vue';
import Comments from './Comments.vue';
import RelatedVideos from './RelatedVideos.vue';
import Playlist from './Playlist.vue';
import Chapters from './Chapters.vue';

const route = useRoute();
const { v } = route.query;
const playlistId = ref(route.query.list);
const videoDetail = ref({});
const playlistCurrentIndex = ref();
const videoCurrentTime = ref();
const loadingBar = useLoadingBar();
const startTimeChapter = ref(0);

const getVideoDetail = async (id) => {
  try {
    loadingBar.start();
    const { data } = await axios.get(`/streams/${id}`);
    videoDetail.value = data;
    document.title = data.title;
    loadingBar.finish();
  } catch (err) {
    console.error(err);
    loadingBar.error();
  }
};

onMounted(() => {
  getVideoDetail(v);
  playlistCurrentIndex.value = parseInt(route.query.index ?? 1);
});

watch(route, async ({ query }) => {
  try {
    loadingBar.start();
    const { list, v } = query;
    if (!list) playlistId.value = null;
    playlistCurrentIndex.value = parseInt(route.query.index ?? 1);
    const { data } = await axios.get(`/streams/${v}`);
    videoDetail.value = data;
    document.title = data.title;
    playlistId.value = list;
    loadingBar.finish();
  } catch (err) {
    console.error(err);
    loadingBar.error();
  }
});

const getCurrentTime = ({ currentTime }) => {
  videoCurrentTime.value = currentTime;
};

const handleSelectChapter = ({ start }) => {
  startTimeChapter.value = start;
};
</script>

<template>
  <n-layout :style="{ padding: '25px 30px', minHeight: '100vh' }">
    <n-layout-content :style="{ maxWidth: '1440px', margin: '0 auto' }">
      <n-grid item-responsive :cols="12" :x-gap="20">
        <n-grid-item :span="8">
          <template v-if="videoDetail.title">
            <MainVideo
              :video="videoDetail"
              :startTimeChapter="startTimeChapter"
              @time-update="getCurrentTime"
            />
          </template>
          <Comments
            :uploaderUrl="videoDetail.uploaderUrl"
            :uploader="videoDetail.uploader"
          />
        </n-grid-item>
        <n-grid-item :span="4">
          <template v-if="playlistId">
            <Playlist
              :playlistId="playlistId"
              :currentVideoIndex="playlistCurrentIndex"
            />
          </template>
          <template v-else-if="!playlistId && videoDetail.chapters?.length">
            <Chapters
              :chapters="videoDetail.chapters"
              :channelName="videoDetail.uploader"
              :videoCurrentTime="videoCurrentTime"
              @selected-chapter="handleSelectChapter"
            />
          </template>
          <RelatedVideos :relatedVideos="videoDetail.relatedStreams" />
        </n-grid-item>
      </n-grid>
    </n-layout-content>
  </n-layout>
</template>
