<script setup>
import { NText, NEllipsis, NGrid, NGi, NTag } from 'naive-ui';
import { useRouter } from 'vue-router';
import { formatViews } from '../../utils/format-view-count';
import { convertTimer } from '../../utils/convert-timer';
import { convertDate } from '../../utils/convert-date';

const router = useRouter();
const { videos } = defineProps(['videos']);
const currentTime = new Date().getTime();
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
  </template>

  <template v-else>
    <n-text tag="p" :style="{ textAlign: 'center' }">
      This channel has no playlists.
    </n-text>
  </template>
</template>
