<script setup>
import { NGrid, NGi, NEllipsis, NSpin, NSpace, NModal } from 'naive-ui';
import axios from 'axios';
import { onMounted, ref } from 'vue';

const { data } = defineProps(['data']);
const shorts = ref();
const showShortPlayer = ref(false);
const selectedShort = ref();

onMounted(() => {
  axios.get(`/channels/tabs?data=${data}`).then((res) => {
    shorts.value = res.data;
  });
});

const handleShowShort = (url) => {
  selectedShort.value = url.split('=')[1];
  showShortPlayer.value = !showShortPlayer.value;
};
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
        v-for="short in shorts?.content"
        :key="short.url"
        :style="{
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
        }"
        @click="handleShowShort(short.url)"
      >
        <n-space
          :style="{
            aspectRatio: '9/16',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#333',
          }"
          align="center"
        >
          <img :src="short.thumbnail" :style="{ width: '100%' }" />
        </n-space>
        <n-ellipsis
          :tooltip="false"
          :line-clamp="2"
          :style="{ fontWeight: 600, margin: '6px 0' }"
        >
          {{ short.title }}
        </n-ellipsis>
      </n-gi>
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
