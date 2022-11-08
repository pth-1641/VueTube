<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import {
  NGrid,
  NCard,
  NImage,
  NGi,
  NLayoutContent,
  NLayout,
  NSpace,
  NAvatar,
  NH6,
  NEllipsis,
  NTag,
  NIcon,
  NText,
} from 'naive-ui';
import { CheckmarkFilled } from '@vicons/carbon';
import { convertTimer } from '../utils/convert-timer';
import { formatViews } from '../utils/format-view-count';
import { useRouter } from 'vue-router';

const videos = ref(null);
const router = useRouter();

onMounted(() => {
  axios.get('/trending?region=VN').then(({ data }) => {
    videos.value = data.filter((video) => !video.isShort);
  });
});
</script>

<template>
  <n-layout :style="{ padding: '25px' }">
    <n-layout-content :style="{ maxWidth: '1520px', margin: 'auto' }">
      <n-grid :cols="5" :x-gap="25" :y-gap="25">
        <n-gi v-for="video in videos" :key="video.url">
          <n-card
            :bordered="false"
            size="small"
            embedded
            :style="{
              height: '100%',
              cursor: 'pointer',
              borderRadius: '6px',
              overflow: 'hidden',
            }"
            @click="router.push(video.url)"
          >
            <template #cover>
              <div style="position: relative">
                <n-image
                  :src="video.thumbnail"
                  lazy
                  :style="{ width: '100%' }"
                  preview-disabled
                />

                <n-tag
                  size="small"
                  :bordered="false"
                  :style="{
                    position: 'absolute',
                    bottom: '10px',
                    right: '5px',
                    fontWeight: 600,
                  }"
                  >{{ convertTimer(video.duration) }}</n-tag
                >
              </div>
            </template>
            <n-space :wrap="false" align="center">
              <n-avatar :src="video.uploaderAvatar" round object-fit="cover" />
              <n-h6 :style="{ marginBottom: 0 }">
                <n-ellipsis :line-clamp="2" :tooltip="false">
                  {{ video.title }}
                </n-ellipsis>
              </n-h6>
            </n-space>
            <n-space align="center" :size="6">
              <n-h6
                prefix="bar"
                :style="{
                  fontSize: '14px',
                  marginBottom: '5px',
                }"
                type="success"
              >
                <n-ellipsis :tooltip="false" :style="{ maxWidth: '150px' }">
                  {{ video.uploaderName }}
                </n-ellipsis>
              </n-h6>
              <template v-if="video.uploaderVerified">
                <n-icon :component="CheckmarkFilled" />
              </template>
            </n-space>
            <n-text
              >{{ formatViews(video.views) }} views •
              {{ video.uploadedDate }}</n-text
            >
          </n-card>
        </n-gi>
      </n-grid>
    </n-layout-content>
  </n-layout>
</template>
