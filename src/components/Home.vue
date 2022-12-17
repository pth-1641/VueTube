<script setup>
import { onMounted, ref, onBeforeUnmount } from 'vue';
import axios from 'axios';
import {
  NGrid,
  NGridItem,
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
  NSpin,
  NImage,
} from 'naive-ui';
import { CheckmarkFilled } from '@vicons/carbon';
import { convertTimer } from '../utils/convert-timer';
import { formatViews } from '../utils/format-view-count';
import { useRouter } from 'vue-router';

const videos = ref(null);
const loadingBar = useLoadingBar();
const router = useRouter();
const isLoading = ref(false);
const fetchedVideos = ref([]);

const nextTrendingData = async () => {
  const endOfPage =
    window.scrollY + window.innerHeight >= document.body.offsetHeight - 200;
  if (!endOfPage || isLoading.value) return;
  try {
    isLoading.value = true;
    let selectedVideo = null;
    do {
      selectedVideo =
        videos.value[Math.floor(Math.random() * videos.value.length)];
    } while (fetchedVideos.value.includes(selectedVideo.url));
    fetchedVideos.value.push(selectedVideo.url);
    const { data } = await axios.get(
      `/streams/${selectedVideo.url.split('=')[1]}`
    );
    const removeShorts = data.relatedStreams.filter(
      (s) => s.type === 'stream' && !s.isShort
    );
    const removeDuplicateVideos = [
      ...new Map(
        [...videos.value, ...removeShorts].map((v) => [v['url'], v])
      ).values(),
    ];
    console.log(removeDuplicateVideos);
    videos.value = removeDuplicateVideos;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  try {
    loadingBar.start();
    const { data } = await axios.get(
      `/trending?region=${localStorage['countryCode'] || 'VN'}`
    );
    videos.value = data.filter((v) => !v.isShort);
    document.title = 'VueTube';
    window.addEventListener('scroll', nextTrendingData);
    window.scrollTo(0, 0);
    loadingBar.finish();
  } catch (err) {
    console.error(err);
    loadingBar.error();
  }
});

onBeforeUnmount(() => window.removeEventListener('scroll', nextTrendingData));
</script>

<template>
  <n-layout :style="{ padding: '25px', minHeight: '100vh' }">
    <n-layout-content
      :style="{ maxWidth: '1520px', margin: 'auto' }"
      :native-scrollbar="false"
    >
      <n-grid :cols="5" :x-gap="18" :y-gap="25">
        <n-grid-item v-for="video in videos" :key="video.url">
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
              <n-image
                :src="video.thumbnail"
                :style="{ height: '100%' }"
                @click="router.push(video.url)"
                lazy
                :preview-disabled="true"
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
                  lazy
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
                  :style="{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }"
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
        </n-grid-item>
      </n-grid>
      <template v-if="isLoading">
        <n-space align="center" justify="center" :style="{ marginTop: '40px' }">
          <n-spin :size="36" />
        </n-space>
      </template>
    </n-layout-content>
  </n-layout>
</template>
