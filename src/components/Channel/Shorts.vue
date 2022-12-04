<script setup>
import {
  NGrid,
  NGi,
  NEllipsis,
  NSpin,
  NSpace,
  NModal,
  NText,
  NCarousel,
  NIcon,
} from 'naive-ui';
import {
  PauseFilled,
  VolumeUpFilled,
  PlayFilledAlt,
  VolumeMuteFilled,
} from '@vicons/carbon';
import axios from 'axios';
import { onMounted, ref, onBeforeUnmount } from 'vue';
import { getNextData } from '../../utils/get-next-data';

const { data, channelId } = defineProps(['data', 'channelId']);
const shorts = ref();
const shortVideo = ref();
const showShortModal = ref(false);
const selectedShort = ref();
const nextpageData = ref();
const isLoading = ref(false);
const isLoadingShort = ref(true);
const isPlaying = ref(true);
const isMuted = ref(false);

const getNextShortVideos = async () => {
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
    shorts.value = [...shorts.value, ...res.relatedStreams];
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const handleSelectedShort = async (url) => {
  showShortModal.value = !showShortModal.value;
  const shortId = url.split('=')[1];
  const { data } = await axios.get(`/streams/${shortId}`);
  const audioVideo = data.videoStreams.filter((v) => !v.videoOnly);
  selectedShort.value = audioVideo.sort(
    (a, b) => parseInt(b.quality) - parseInt(a.quality)
  )[0]?.url;
};

const handleResetOnClose = () => {
  isLoadingShort.value = true;
  selectedShort.value = null;
  isPlaying.value = true;
};

const togglePlay = () => {
  if (shortVideo.value?.currentTime === 0) return;
  shortVideo.value.paused ? shortVideo.value.play() : shortVideo.value.pause();
  isPlaying.value = !isPlaying.value;
};

onMounted(async () => {
  try {
    const res = await axios.get(`/channels/tabs?data=${data}`);
    shorts.value = res.data.content;
    nextpageData.value = res.data.nextpage;
    window.addEventListener('scroll', getNextShortVideos);
  } catch (err) {
    console.error(err);
  }
});

onBeforeUnmount(() => window.removeEventListener('scroll', getNextShortVideos));
</script>

<template>
  <template v-if="shorts === undefined">
    <n-space align="center" justify="center">
      <n-spin size="large" />
    </n-space>
  </template>
  <template v-else>
    <n-grid :cols="6" x-gap="16" y-gap="36" :style="{ margin: '30px 0' }">
      <n-gi
        v-for="short in shorts"
        :key="short.url"
        :style="{
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
        }"
        @click="handleSelectedShort(short.url)"
      >
        <n-text
          tag="div"
          :style="{
            aspectRatio: '9/16',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#333',
            display: 'flex',
            alignItems: 'center',
          }"
        >
          <img :src="short.thumbnail" :style="{ width: '100%' }" />
        </n-text>
        <n-ellipsis
          :tooltip="false"
          :line-clamp="2"
          :style="{ fontWeight: 600, margin: '6px 0' }"
        >
          {{ short.title }}
        </n-ellipsis>
      </n-gi>
      <template v-if="isLoading">
        <n-space align="center" justify="center" :style="{ marginTop: '40px' }">
          <n-spin :size="36" />
        </n-space>
      </template>
    </n-grid>
  </template>
  <n-modal
    v-model:show="showShortModal"
    transform-origin="center"
    :on-after-leave="handleResetOnClose"
  >
    <n-text
      tag="div"
      :style="{
        height: '90vh',
        aspectRatio: '9/16',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#333',
        position: 'relative',
      }"
    >
      <n-space
        :style="{
          position: 'absolute',
          top: '10px',
          left: 0,
          right: 0,
          width: '90%',
          margin: '0 auto',
          zIndex: 1,
        }"
        justify="space-between"
      >
        <n-icon
          :component="isPlaying ? PauseFilled : PlayFilledAlt"
          :size="22"
          color="#fff"
          :style="{ cursor: 'pointer' }"
          @click="togglePlay"
        />
        <n-icon
          :component="isMuted ? VolumeMuteFilled : VolumeUpFilled"
          :size="22"
          color="#fff"
          :style="{ cursor: 'pointer' }"
          @click="isMuted = !isMuted"
        />
      </n-space>
      <n-text
        tag="div"
        :style="{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }"
        @click="togglePlay"
      >
        <template v-if="isLoadingShort">
          <n-spin :size="50" />
        </template>
        <video
          :style="{ width: isLoadingShort ? 0 : '100%' }"
          type="video/*"
          ref="shortVideo"
          loop
          autoplay
          preload="metadata"
          :muted="isMuted"
          :src="selectedShort"
          @canplay="isLoadingShort = false"
          @waiting="isLoadingShort = true"
        />
      </n-text>
    </n-text>
  </n-modal>
</template>
