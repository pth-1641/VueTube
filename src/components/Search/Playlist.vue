<script setup>
import { NImage, NSpace, NH3, NText, NButton, NIcon } from 'naive-ui';
import { CheckmarkFilled } from '@vicons/carbon';
import { PlayFilledAlt } from '@vicons/carbon';
import { useRouter } from 'vue-router';
import axios from 'axios';

const { playlist } = defineProps(['playlist']);
const router = useRouter();

const handleRedirectPlaylist = async () => {
  try {
    const playlistId = playlist.url.split('=')[1];
    const { data } = await axios.get(`/playlists/${playlistId}`);
    router.push(`${data.relatedStreams[0].url}&list=${playlistId}`);
  } catch (err) {
    console.error(err);
  }
};
</script>

<template>
  <n-space
    :wrap="false"
    :size="16"
    :style="{ cursor: 'pointer' }"
    @click="handleRedirectPlaylist"
  >
    <n-text
      tag="div"
      :style="{
        position: 'relative',
        height: '200px',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor:'#333'
      }"
    >
      <n-image :src="playlist.thumbnail" preview-disabled width="360" />
      <n-space
        :style="{
          position: 'absolute',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.75)',
          color: '#fff',
        }"
        align="center"
        justify="center"
      >
        <n-icon :component="PlayFilledAlt" size="64" />
      </n-space>
    </n-text>
    <n-space vertical>
      <n-h3 :style="{ marginBottom: 0 }">
        {{ playlist.name }}
      </n-h3>
      <n-space align="center" size="small">
        <n-text strong>
          {{ playlist.uploaderName }}
        </n-text>
        <template v-if="playlist.uploaderVerified">
          <n-icon
            :component="CheckmarkFilled"
            :style="{ display: 'flex', alignItems: 'center' }"
          />
        </template>
      </n-space>
      <n-text code>{{ playlist.videos }} videos</n-text>
      <n-button ghost size="small" type="success">VIEW FULL PLAYLIST</n-button>
    </n-space>
  </n-space>
</template>
