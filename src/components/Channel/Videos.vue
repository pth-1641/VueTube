<script setup>
import { NText, NEllipsis, NGrid, NGi, NTag, NSpin, NSpace } from 'naive-ui';
import { useRouter, useRoute } from 'vue-router';
import { ref, watch } from 'vue';
import { formatViews } from '../../utils/format-view-count';
import { convertTimer } from '../../utils/convert-timer';
import { convertDate } from '../../utils/convert-date';
import { onMounted, onBeforeUnmount } from 'vue';
import { getNextData } from '../../utils/get-next-data';
import axios from 'axios';

const { channelId } = defineProps(['channelId']);
const route = useRoute();
const router = useRouter();
const currentTime = new Date().getTime();
const videos = ref();
const nextpageData = ref();
const isLoading = ref(false);

const getNextVideos = async () => {
  const endOfPage =
    window.scrollY + window.innerHeight >= document.body.offsetHeight;
  if (!endOfPage || !nextpageData.value) return;
  if (isLoading.value) return;
  try {
    isLoading.value = true;
    const res = await getNextData({
      type: 'channel',
      nextpage: nextpageData.value,
      id: channelId,
    });
    nextpageData.value = res.nextpage;
    videos.value = [...videos.value, ...res.relatedStreams];
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const getVideos = async (id) => {
  try {
    const { data } = await axios.get(`/channel/${id}`);
    videos.value = data.relatedStreams;
    nextpageData.value = data.nextpage;
  } catch (err) {
    console.error(err);
  }
};

onMounted(() => {
  getVideos(channelId);
  window.addEventListener('scroll', getNextVideos);
});
onBeforeUnmount(() => window.removeEventListener('scroll', getNextVideos));
watch(
  route,
  ({ params }) => {
    getVideos(params.id);
  },
  { deep: true }
);
</script>

<template>
  <template v-if="videos?.length">
    <n-grid :cols="5" x-gap="16" y-gap="36" :style="{ padding: '30px 0' }">
      <n-gi
        v-for="video in videos"
        :key="video.url"
        :style="{
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
        }"
        @click="router.push(video.url)"
      >
        <n-text
          tag="div"
          :style="{
            aspectRatio: '16/9',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#333',
            position: 'relative',
          }"
        >
          <img
            :src="video.thumbnail"
            :style="{ height: '100%', objectFit: 'cover' }"
          />
          <n-tag
            size="tiny"
            strong
            :bordered="false"
            :style="{
              position: 'absolute',
              bottom: '4px',
              right: '4px',
            }"
          >
            <template v-if="currentTime > video.uploaded">
              {{ convertTimer(video.duration) }}
            </template>
            <template v-else> UPCOMING </template>
          </n-tag>
        </n-text>
        <n-ellipsis
          :tooltip="false"
          :line-clamp="2"
          :style="{ fontWeight: 600, marginTop: '6px' }"
        >
          {{ video.title }}
        </n-ellipsis>
        <n-text depth="3" :style="{ fontSize: '12px', marginTop: '2px' }">
          <template v-if="currentTime > video.uploaded">
            {{ formatViews(video.views) }} views •
            {{ video.uploadedDate }}
          </template>
          <template v-else>
            {{ formatViews(video.views) }} waiting •
            {{ convertDate(video.uploaded) }}
          </template>
        </n-text>
      </n-gi>
    </n-grid>
    <template v-if="isLoading">
      <n-space align="center" justify="center" :style="{ marginTop: '40px' }">
        <n-spin :size="36" />
      </n-space>
    </template>
  </template>
  <template v-else>
    <n-text tag="p" :style="{ textAlign: 'center' }">
      This channel has no playlists.
    </n-text>
  </template>
</template>
