<script setup>
import { NGrid, NGi, NEllipsis, NSpin, NSpace } from 'naive-ui';
import axios from 'axios';
import { onMounted, ref } from 'vue';

const { data } = defineProps(['data']);
const shorts = ref();
onMounted(() => {
  axios.get(`/channels/tabs?data=${data}`).then((res) => {
    shorts.value = res.data;
  });
});
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
        @click="router.push(short.url)"
      >
        <n-space
          align="center"
          justify="center"
          :style="{
            aspectRatio: '9/15',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#333',
          }"
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
</template>
