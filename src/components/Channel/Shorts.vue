<script setup>
import { NGrid, NGi, NEllipsis, NSpin, NSpace, NModal, NText } from 'naive-ui';
import axios from 'axios';
import { onMounted, ref, onBeforeUnmount } from 'vue';
import { getNextData } from '../../utils/get-next-data';

const { data, channelId } = defineProps(['data', 'channelId']);
const shorts = ref();
const showShortPlayer = ref(false);
const selectedShort = ref();
const nextpageData = ref();
const isLoading = ref(false);

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

const handleShowShort = (url) => {
  selectedShort.value = url.split('=')[1];
  showShortPlayer.value = !showShortPlayer.value;
};

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
        @click="handleShowShort(short.url)"
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
  <n-modal v-model:show="showShortPlayer" transform-origin="center" id="modal">
    <iframe
      :src="`https://www.youtube-nocookie.com/embed/${selectedShort}?autoplay=1&fs=0`"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      :style="{
        height: '90vh',
        aspectRatio: '9/16',
        borderRadius: '8px',
        backgroundColor: '#333',
      }"
    />
  </n-modal>
</template>
