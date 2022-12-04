<script setup>
import {
  NSpace,
  NText,
  NIcon,
  NTag,
  NEllipsis,
  NButton,
  NSpin,
} from 'naive-ui';
import { useRouter, useRoute } from 'vue-router';
import { ref } from 'vue';
import { formatViews } from '../../utils/format-view-count';
import {
  CheckmarkFilled,
  WeatherStation,
  ViewFilled,
  ConnectionSignal,
} from '@vicons/carbon';
import { convertTimer } from '../../utils/convert-timer';
import axios from 'axios';

let { relatedVideos } = defineProps(['relatedVideos']);
const { list } = useRoute().query;
const router = useRouter();
const isLoading = ref(false);
const fetchedVideos = ref([]);

const handleRedirectPlaylist = (url) => {
  router.push(url.replace('playnext', 'index'));
};

const handleLoadMoreRelatedVideos = async (currentRelatedVideos) => {
  // try {
  //   isLoading.value = true;
  //   let selectedVideo = null;
  //   do {
  //     selectedVideo =
  //       currentRelatedVideos[
  //         Math.floor(Math.random() * currentRelatedVideos.length)
  //       ];
  //   } while (fetchedVideos.value.includes(selectedVideo.url));
  //   fetchedVideos.value.push(selectedVideo.url);
  //   const { data } = await axios.get(
  //     `/streams/${selectedVideo.url.split('=')[1]}`
  //   );
  //   const removeShorts = data.relatedStreams.filter((s) => !s.isShort);
  //   const removeDuplicateVideos = [
  //     ...new Map(
  //       [...currentRelatedVideos, ...removeShorts].map((v) => [v['url'], v])
  //     ).values(),
  //   ];
  //   relatedVideos = removeDuplicateVideos;
  // } catch (err) {
  //   console.error(err);
  // } finally {
  //   isLoading.value = false;
  // }
  console.log(relatedVideos);
};
</script>

<template>
  <n-space vertical :size="8">
    <n-space
      v-for="video in relatedVideos"
      :key="video.url"
      :wrap="false"
      @click="handleRedirectPlaylist(video.url)"
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
            :style="{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12px',
            }"
          >
            <abbr
              :title="video.uploaderName"
              :style="{ textDecoration: 'none' }"
            >
              {{ video.uploaderName }}
            </abbr>
            <template v-if="video.uploaderVerified">
              <n-icon
                :component="CheckmarkFilled"
                :style="{ marginBottom: '4px' }"
              />
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
    <n-space align="center" justify="center" :style="{ marginTop: '12px' }">
      <template v-if="isLoading">
        <n-spin />
      </template>
      <template v-else>
        <n-button
          round
          strong
          secondary
          type="success"
          @click="handleLoadMoreRelatedVideos(relatedVideos)"
        >
          Load more
        </n-button>
      </template>
    </n-space>
  </n-space>
</template>
