<script setup>
import { NImage, NSpace, NH3, NText, NButton, NIcon } from 'naive-ui';
import { CheckmarkFilled } from '@vicons/carbon';
import { PlayOutlineFilled } from '@vicons/carbon';

const { playlist } = defineProps(['playlist']);
</script>

<template>
  <n-space :wrap="false" :size="16">
    <div
      :style="{
        position: 'relative',
        height: '200px',
        borderRadius: '8px',
        overflow: 'hidden',
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
        <n-icon :component="PlayOutlineFilled" size="64" />
      </n-space>
    </div>
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
