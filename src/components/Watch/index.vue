<script setup>
import { NLayout, NLayoutContent, NGrid, NGridItem, NBackTop } from 'naive-ui';
import { useRoute } from 'vue-router';
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import MainVideo from './MainVideo.vue';
import Comments from './Comments.vue';
import RelatedVideos from './RelatedVideos.vue';

const route = useRoute();
const videoDetail = ref({});

const getVideoDetail = (videoId) =>
  axios
    .get(`/streams/${videoId}`)
    .then(({ data }) => (videoDetail.value = data));

onMounted(() => {
  getVideoDetail(route.query.v);
});

watch(route, () => {
  getVideoDetail(route.query.v);
});
</script>

<template>
  <n-layout :style="{ padding: '25px 30px' }">
    <n-layout-content>
      <n-grid item-responsive :cols="12" :x-gap="20">
        <n-grid-item :span="8">
          <MainVideo :video="videoDetail" />
          <Comments
            :uploaderUrl="videoDetail.uploaderUrl"
            :uploader="videoDetail.uploader"
          />
        </n-grid-item>
        <n-grid-item :span="4">
          <RelatedVideos :relatedVideos="videoDetail.relatedStreams" />
        </n-grid-item>
      </n-grid>
    </n-layout-content>
  </n-layout>
  <n-back-top :right="100" :visibility-height="500" />
</template>
