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
  NImage,
} from 'naive-ui';
import { Playlist } from '@vicons/carbon';
import axios from 'axios';
import { onMounted, ref, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const { data, channelId } = defineProps(['data', 'channelId']);
const playlists = ref();
const nextpageData = ref();
const isLoading = ref(false);
const router = useRouter();

const getNextPlaylists = async () => {
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
    playlists.value = [...playlists.value, ...res.relatedStreams];
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const handleRedirectPlaylist = async (url) => {
  try {
    const playlistId = url.split('=')[1];
    const { data } = await axios.get(`/playlists/${playlistId}`);
    router.push(`${data.relatedStreams[0].url}&list=${playlistId}`);
  } catch (err) {
    console.error(err);
  }
};

onMounted(async () => {
  try {
    const res = await axios.get(`/channels/tabs?data=${data}`);
    playlists.value = res.data.content;
    nextpageData.value = res.data.nextpage;
    window.addEventListener('scroll', getNextPlaylists);
  } catch (err) {
    console.error(err);
  }
});

onBeforeUnmount(() => window.removeEventListener('scroll', getNextPlaylists));
</script>

<template>
  <template v-if="playlists === undefined">
    <n-space align="center" justify="center">
      <n-spin size="large" />
    </n-space>
  </template>
  <template v-else>
    <template v-if="playlists.length">
      <n-grid :cols="5" x-gap="16" y-gap="36" :style="{ padding: '30px 0' }">
        <n-gi
          v-for="playlist in playlists"
          :key="playlist.url"
          :style="{
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
          }"
          @click="handleRedirectPlaylist(playlist.url)"
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
            <n-image :src="playlist.thumbnail" :style="{ height: '100%' }" />
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
              <n-text :style="{ fontSize: '16px', color: '#fff' }">
                {{ playlist.videos }}
              </n-text>
              <n-icon :component="Playlist" size="26" color="#fff" />
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
        <template v-if="isLoading">
          <n-space
            align="center"
            justify="center"
            :style="{ marginTop: '40px' }"
          >
            <n-spin :size="36" />
          </n-space>
        </template>
      </n-grid>
    </template>
    <template v-else>
      <n-text tag="p" :style="{ textAlign: 'center' }">
        This channel has no playlists.
      </n-text>
    </template>
  </template>
</template>
