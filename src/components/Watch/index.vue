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
import { localDB } from '../../utils/localDB';

const route = useRoute();
const { v } = route.query;
const playlistId = ref(route.query.list);
const videoDetail = ref({});
const videoCurrentTime = ref();
const loadingBar = useLoadingBar();
const startTimeChapter = ref(0);
const { insert } = localDB();

const getVideoDetail = async (id) => {
  try {
    loadingBar.start();
    const { data } = await axios.get(`/streams/${id}`);
    videoDetail.value = data;
    document.title = `${data.title} | VueTube`;
    loadingBar.finish();
    return videoDetail.value;
  } catch (err) {
    console.error(err);
    loadingBar.error();
  }
};

const getCurrentTime = ({ currentTime }) => {
  videoCurrentTime.value = currentTime;
};

const handleSelectChapter = ({ start }) => {
  startTimeChapter.value = start;
};

const saveHistory = (data) => {
  const videoId = route.query.v;
  const {
    title,
    uploader,
    uploaderAvatar,
    uploaderUrl,
    duration,
    description,
    uploaderVerified,
    thumbnailUrl,
  } = data;
  insert({
    timestamp: new Date().getTime(),
    title,
    uploader,
    uploaderUrl,
    duration,
    description,
    uploaderVerified,
    thumbnailUrl,
    uploaderAvatar,
    url: `/watch?v=${videoId}`,
    id: videoId,
  });
};

onMounted(async () => {
  window.scrollTo(0, 0);
  const data = await getVideoDetail(v);
  await saveHistory(data);
});

watch(route, async ({ query }) => {
  playlistId.value = route.query.list;
  const data = await getVideoDetail(query.v);
  await saveHistory(data);
});
</script>

<template>
  <n-layout :style="{ padding: '25px 30px', minHeight: '100vh' }">
    <n-layout-content
      :style="{ maxWidth: '1440px', margin: '0 auto' }"
      :native-scrollbar="false"
    >
      <template v-if="Object.keys(videoDetail).length">
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
              :uploaderAvatar="videoDetail.uploaderAvatar"
            />
          </n-grid-item>
          <n-grid-item :span="4">
            <template v-if="playlistId">
              <Playlist :playlistId="playlistId" />
            </template>
            <template v-else-if="!playlistId && videoDetail.chapters?.length">
              <Chapters
                :chapters="videoDetail.chapters"
                :channelName="videoDetail.uploader"
                :videoCurrentTime="videoCurrentTime"
                @selected-chapter="handleSelectChapter"
                :duration="videoDetail.duration"
              />
            </template>
            <RelatedVideos :relatedVideos="videoDetail.relatedStreams" />
          </n-grid-item>
        </n-grid>
      </template>
    </n-layout-content>
  </n-layout>
</template>
