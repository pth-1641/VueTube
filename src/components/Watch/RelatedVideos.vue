<script setup>
import { NSpace, NText, NIcon, NTag, NEllipsis, NImage } from 'naive-ui';
import { useRouter } from 'vue-router';
import { formatViews } from '../../utils/format-view-count';
import {
  CheckmarkFilled,
  WeatherStation,
  ViewFilled,
  ContinueFilled,
} from '@vicons/carbon';
import { convertTimer } from '../../utils/convert-timer';

const router = useRouter();
const { relatedVideos } = defineProps(['relatedVideos']);
</script>

<template>
  <n-space vertical :size="2">
    <n-space
      v-for="video in relatedVideos"
      :key="video.url"
      :wrap="false"
      @click="router.push(video.url)"
      :style="{ cursor: 'pointer' }"
    >
      <n-text tag="div" :style="{ position: 'relative' }">
        <n-image
          :src="video.thumbnail"
          height="96"
          :style="{ borderRadius: '8px' }"
          preview-disabled
        />
        <template v-if="video.duration < 0">
          <n-tag
            :bordered="false"
            size="small"
            strong
            :style="{
              position: 'absolute',
              bottom: '10px',
              right: '5px',
              backgroundColor: '#f00',
              color: '#fff',
            }"
          >
            <template #icon>
              <n-icon :component="WeatherStation" color="#fff" />
            </template>
            LIVE
          </n-tag>
        </template>
        <template v-else-if="video.type === 'playlist'">
          <n-text
            strong
            :style="{
              height: '96px',
              position: 'absolute',
              inset: 0,
              backgroundColor: 'rgba(0,0,0,0.8)',
              color: '#fff',
              borderRadius: '7px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }"
          >
            <n-icon :component="ContinueFilled" />
            PLAY ALL
          </n-text>
        </template>
        <template v-else>
          <n-tag
            size="small"
            :bordered="false"
            strong
            :style="{
              position: 'absolute',
              bottom: '10px',
              right: '5px',
            }"
          >
            {{ convertTimer(video.duration) }}
          </n-tag>
        </template>
      </n-text>
      <n-space vertical :size="0">
        <n-ellipsis
          :line-clamp="2"
          :tooltip="false"
          :style="{ fontWeight: 600 }"
        >
          {{ video.title || video.name }}
        </n-ellipsis>
        <n-text
          depth="3"
          :style="{ display: 'flex', alignItems: 'center', gap: '6px' }"
          strong
        >
          {{ video.uploaderName }}
          <template v-if="video.uploaderVerified">
            <n-icon :component="CheckmarkFilled" />
          </template>
        </n-text>
        <template v-if="video.duration < 0">
          <n-text
            depth="3"
            :style="{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }"
          >
            <n-icon :component="ViewFilled" size="20" />
            {{ formatViews(video.views) }} watching
          </n-text>
        </template>
        <template v-else-if="video.type === 'playlist'" />
        <template v-else>
          <n-text
            depth="3"
            :style="{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }"
          >
            {{ formatViews(video.views) }} views •
            {{ video.uploadedDate }}
          </n-text>
        </template>
      </n-space>
    </n-space>
  </n-space>
</template>
