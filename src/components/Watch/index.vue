<script setup>
import { NLayout, NLayoutContent, NGrid, NGridItem } from 'naive-ui';
import { useRoute } from 'vue-router';
import { onMounted, ref } from 'vue';
import axios from 'axios';
import MainVideo from './MainVideo.vue';
import Comments from './Comments.vue';
import RelatedVideos from './RelatedVideos.vue';
import Playlist from './Playlist.vue';

const { v, list } = useRoute().query;
const videoDetail = ref({});

const getVideoDetail = async (id) => {
  try {
    const { data } = await axios.get(`/streams/${id}`);
    videoDetail.value = data;
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => getVideoDetail(v));
</script>

<template>
  <n-layout :style="{ padding: '25px 30px', minHeight: '100vh' }">
    <n-layout-content :style="{ maxWidth: '1440px', margin: '0 auto' }">
      <n-grid item-responsive :cols="12" :x-gap="20">
        <n-grid-item :span="8">
          <template v-if="videoDetail.title">
            <MainVideo
              :video="videoDetail"
              :audioStreams="videoDetail.audioStreams"
              :videoStreams="videoDetail.videoStreams"
            />
          </template>
          <Comments
            :uploaderUrl="videoDetail.uploaderUrl"
            :uploader="videoDetail.uploader"
          />
        </n-grid-item>
        <n-grid-item :span="4">
          <template v-if="list">
            <Playlist :playlistId="list" />
          </template>
          <RelatedVideos :relatedVideos="videoDetail.relatedStreams" />
        </n-grid-item>
      </n-grid>
    </n-layout-content>
  </n-layout>
</template>
