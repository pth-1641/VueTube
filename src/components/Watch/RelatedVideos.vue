<script setup>
import { NSpace, NText, NIcon, NTag, NEllipsis, NImage } from 'naive-ui';
import { useRouter, useRoute } from 'vue-router';
import { formatViews } from '../../utils/format-view-count';
import {
  CheckmarkFilled,
  WeatherStation,
  ViewFilled,
  ConnectionSignal,
} from '@vicons/carbon';
import { convertTimer } from '../../utils/convert-timer';

const { list } = useRoute().query;
const router = useRouter();
const { relatedVideos } = defineProps(['relatedVideos']);
</script>

<template>
  <n-space vertical :size="8">
    <n-space
      v-for="video in relatedVideos"
      :key="video.url"
      :wrap="false"
      @click="router.push(video.url)"
      :style="{ cursor: 'pointer' }"
    >
      <template v-if="!video.url.includes(list)">
        <n-text
          tag="div"
          :style="{
            position: 'relative',
            aspectRatio: '16/9',
            height: '96px',
            borderRadius: '8px',
            overflow: 'hidden',
            backgroundColor: '#333',
          }"
        >
          <img :src="video.thumbnail" :style="{ height: '100%' }" />
          <template v-if="video.duration < 0">
            <n-tag
              :bordered="false"
              size="small"
              strong
              :style="{
                position: 'absolute',
                bottom: '5px',
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
              tag="div"
              strong
              :style="{
                height: '30%',
                position: 'absolute',
                right: 0,
                left: 0,
                bottom: 0,
                borderRadius: '0 0 8px 8px',
                backgroundColor: 'rgba(0,0,0,0.8)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }"
            >
              <n-icon :component="ConnectionSignal" />
            </n-text>
          </template>
          <template v-else>
            <n-tag
              size="small"
              :bordered="false"
              strong
              :style="{
                position: 'absolute',
                bottom: '5px',
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
          <n-text
            depth="3"
            :style="{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
            }"
          >
            <template v-if="video.duration < 0">
              <n-icon :component="ViewFilled" size="20" />
              {{ formatViews(video.views) }} watching
            </template>
            <template v-else-if="video.type === 'playlist'" />
            <template v-else>
              {{ formatViews(video.views) }} views •
              {{ video.uploadedDate }}
            </template>
          </n-text>
        </n-space>
      </template>
    </n-space>
  </n-space>
</template>
