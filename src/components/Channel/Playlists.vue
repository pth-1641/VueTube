<script setup>
import {
  NGrid,
  NGi,
  NEllipsis,
  NText,
  NIcon,
  NButton,
  NSpin,
  NSpace,
} from 'naive-ui';
import { Playlist } from '@vicons/carbon';
import axios from 'axios';
import { onMounted, ref } from 'vue';

const { data } = defineProps(['data']);
const playlists = ref();
onMounted(() => {
  axios
    .get(`/channels/tabs?data=${data}`)
    .then((res) => (playlists.value = res.data));
});
</script>

<template>
  <template v-if="playlists === undefined">
    <n-space align="center" justify="center">
      <n-spin size="large" />
    </n-space>
  </template>
  <template v-else>
    <template v-if="playlists?.content.length">
      <n-grid :cols="5" x-gap="16" y-gap="36" :style="{ padding: '30px 0' }">
        <n-gi
          v-for="playlist in playlists?.content"
          :key="playlist.url"
          :style="{
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
          }"
          @click="router.push(playlist.url)"
        >
          <n-text
            tag="div"
            :style="{
              aspectRatio: '16/9',
              borderRadius: '8px',
              overflow: 'hidden',
              position: 'relative',
              backgroundColor: '#333',
            }"
          >
            <img :src="playlist.thumbnail" :style="{ width: '100%' }" />
            <n-text
              tag="div"
              :style="{
                position: 'absolute',
                right: 0,
                width: '40%',
                top: 0,
                bottom: 0,
                backgroundColor: 'rgba(0,0,0,0.8)',
                zIndex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }"
            >
              <n-text :style="{ fontSize: '16px' }">{{
                playlist.videos
              }}</n-text>
              <n-icon :component="Playlist" size="26" />
            </n-text>
          </n-text>
          <n-ellipsis
            :tooltip="false"
            :line-clamp="2"
            :style="{ fontWeight: 600, margin: '6px 0' }"
          >
            {{ playlist.name }}
          </n-ellipsis>
          <n-button
            size="tiny"
            text
            :style="{ width: 'max-content', fontWeight: 600 }"
            >View full playlist</n-button
          >
        </n-gi>
      </n-grid>
    </template>
    <template v-else>
      <n-text tag="p" :style="{ textAlign: 'center' }">
        This channel has no playlists.
      </n-text>
    </template>
  </template>
</template>
