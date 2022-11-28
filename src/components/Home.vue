<script setup>
import { onMounted, ref } from 'vue';
import axios from 'axios';
import {
  NGrid,
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
  useLoadingBar,
  NTooltip,
} from 'naive-ui';
import { CheckmarkFilled } from '@vicons/carbon';
import { convertTimer } from '../utils/convert-timer';
import { formatViews } from '../utils/format-view-count';
import { useRouter } from 'vue-router';

const videos = ref(null);
const loadingBar = useLoadingBar();
const router = useRouter();

onMounted(async () => {
  try {
    loadingBar.start();
    const { data } = await axios.get('/trending?region=VN');
    videos.value = data.filter((v) => !v.isShort);
    document.title = 'VueTube';
    loadingBar.finish();
  } catch (err) {
    console.error(err);
    loadingBar.error();
  }
});
</script>

<template>
  <n-layout :style="{ padding: '25px', minHeight: '100vh' }">
    <n-layout-content :style="{ maxWidth: '1520px', margin: 'auto' }">
      <n-grid :cols="5" :x-gap="18" :y-gap="25">
        <n-gi v-for="video in videos" :key="video.url">
          <n-text tag="div" :style="{ cursor: 'pointer' }">
            <n-text
              tag="div"
              :style="{
                position: 'relative',
                aspectRatio: '16/9',
                borderRadius: '8px',
                overflow: 'hidden',
                backgroundColor: '#333',
                marginBottom: '12px',
              }"
            >
              <img
                :src="video.thumbnail"
                :style="{ height: '100%' }"
                @click="router.push(video.url)"
              />
              <n-tag
                strong
                size="small"
                :bordered="false"
                :style="{
                  position: 'absolute',
                  bottom: '5px',
                  right: '5px',
                }"
              >
                {{ convertTimer(video.duration) }}
              </n-tag>
            </n-text>
            <n-space :wrap="false">
              <abbr
                :title="video.uploaderName"
                :style="{ textDecoration: 'none' }"
              >
                <n-avatar
                  :src="video.uploaderAvatar"
                  round
                  object-fit="cover"
                  @click="router.push(video.uploaderUrl)"
                />
              </abbr>
              <n-space vertical :size="0">
                <n-text
                  :style="{ fontWeight: 600 }"
                  @click="router.push(video.url)"
                >
                  <n-ellipsis :line-clamp="2" :tooltip="false">
                    <abbr
                      :title="video.title"
                      :style="{ textDecoration: 'none' }"
                    >
                      {{ video.title }}
                    </abbr>
                  </n-ellipsis>
                </n-text>
                <n-text
                  :style="{ display: 'flex', alignItems: 'center', gap: '6px' }"
                  @click="router.push(video.uploaderUrl)"
                >
                  <n-h6 :style="{ fontSize: '14px', margin: 0 }">
                    <n-ellipsis :style="{ maxWidth: '150px' }" :tooltip="false">
                      <abbr
                        :title="video.uploaderName"
                        :style="{ textDecoration: 'none' }"
                      >
                        {{ video.uploaderName }}
                      </abbr>
                    </n-ellipsis>
                  </n-h6>
                  <template v-if="video.uploaderVerified">
                    <n-tooltip :show-arrow="false">
                      <template #trigger>
                        <n-icon :component="CheckmarkFilled" />
                      </template>
                      Verified
                    </n-tooltip>
                  </template>
                </n-text>
                <n-text :style="{ fontSize: '12px' }" depth="3">
                  {{ formatViews(video.views) }} views •
                  {{ video.uploadedDate }}
                </n-text>
              </n-space>
            </n-space>
          </n-text>
        </n-gi>
      </n-grid>
    </n-layout-content>
  </n-layout>
</template>
