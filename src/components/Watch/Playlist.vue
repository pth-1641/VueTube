<script setup>
import {
  NCollapse,
  NCollapseItem,
  NCard,
  NSpace,
  NIcon,
  NScrollbar,
  NText,
  NEllipsis,
  NTag,
  NSpin,
  NButton,
  NImage
} from 'naive-ui';
import { CaretRight } from '@vicons/carbon';
import { ref, onMounted, watch } from 'vue';
import axios from 'axios';
import { useRouter, useRoute } from 'vue-router';
import { convertTimer } from '../../utils/convert-timer';
import { getNextData } from '../../utils/get-next-data';

const { playlistId } = defineProps(['playlistId']);

const route = useRoute();
const router = useRouter();
const playlistDetail = ref();
const videoHeight = ref();
const currentVideoIndex = ref();
const nextPageData = ref();
const isLoading = ref(false);

const handleSelectVideo = ({ index, url }) => {
  router.push(`${url}&list=${playlistId}&index=${index + 1}`);
};

const getPlaylistVideos = async () => {
  try {
    const { data } = await axios.get(`/playlists/${playlistId} `);
    playlistDetail.value = data;
    nextPageData.value = data.nextpage;
    if (data.videos < 0) return;
  } catch (err) {
    console.error(err);
  }
};

const loadMoreVideos = async () => {
  if (!nextPageData.value && isLoading.value) return;
  try {
    isLoading.value = true;
    const res = await getNextData({
      id: playlistId,
      type: 'playlists',
      nextpage: nextPageData.value,
    });
    playlistDetail.value.relatedStreams = [
      ...playlistDetail.value.relatedStreams,
      ...res.relatedStreams,
    ];
    nextPageData.value = res.nextpage;
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  await getPlaylistVideos();
  videoHeight.value = document.querySelector('video').clientHeight;
  currentVideoIndex.value = parseInt(route.query.index || 1);
  while (
    playlistDetail.value.relatedStreams.length - currentVideoIndex.value <
    5
  ) {
    await loadMoreVideos();
  }
});

watch(route, ({ query }) => {
  currentVideoIndex.value = parseInt(query.index || 1);
  if (playlistDetail.videos > 0) return;
  if (
    playlistDetail.value.relatedStreams.length - currentVideoIndex.value <
    5
  ) {
    loadMoreVideos();
  }
});
</script>

<template>
  <n-card
    :title="playlistDetail?.name"
    :bordered="false"
    :style="{
      borderRadius: '8px',
      marginBottom: '28px',
    }"
    embedded
    id="playlist-card"
  >
    <n-collapse
      arrow-placement="right"
      default-expanded-names="playlist-videos"
    >
      <n-collapse-item
        :title="playlistDetail?.uploader.replace('YouTube', 'VueTube')"
        name="playlist-videos"
      >
        <template #header-extra>
          <template v-if="playlistDetail?.videos > 0">
            {{ `${currentVideoIndex ?? 0}/${playlistDetail?.videos}` }}
          </template>
          <template v-else>
            {{
              `${currentVideoIndex ?? 0}/${
                playlistDetail?.relatedStreams.length ?? 0
              }`
            }}
          </template>
        </template>
        <template #arrow> <n-icon :component="CaretRight" /> </template>
        <n-scrollbar :style="{ maxHeight: `${videoHeight - 155}px` }">
          <n-space vertical>
            <template v-for="(video, index) in playlistDetail?.relatedStreams">
              <n-space
                align="center"
                :size="8"
                :wrap="false"
                :style="{
                  cursor: 'pointer',
                  borderRadius: '4px',
                  padding:
                    currentVideoIndex === index + 1 ? '8px 6px' : '0 6px',
                  backgroundColor:
                    currentVideoIndex === index + 1
                      ? 'rgba(99, 226, 183, 0.25)'
                      : 'transparent',
                }"
                @click="handleSelectVideo({ index, url: video.url })"
              >
                <n-text
                  :style="{
                    display: 'block',
                    width: 'max-content',
                    fontSize: '12px',
                  }"
                >
                  {{ index + 1 }}
                </n-text>
                <n-text
                  tag="div"
                  :style="{
                    position: 'relative',
                    aspectRatio: '16/9',
                    width: '100px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#333',
                  }"
                >
                  <n-image
                    :src="video.thumbnail"
                    :style="{
                      height: '100%',
                    }"
                  />
                  <n-tag
                    size="tiny"
                    :bordered="false"
                    :style="{
                      position: 'absolute',
                      bottom: '3px',
                      right: '3px',
                    }"
                  >
                    {{ convertTimer(video.duration) }}
                  </n-tag>
                </n-text>
                <n-text strong>
                  <n-ellipsis :line-clamp="2" :tooltip="false">
                    {{ video.title }}
                  </n-ellipsis>
                </n-text>
              </n-space>
            </template>
          </n-space>
          <n-space
            align="center"
            justify="center"
            :style="{ marginTop: '12px' }"
          >
            <template v-if="nextPageData">
              <template v-if="isLoading">
                <n-spin />
              </template>
              <template v-else>
                <n-button
                  round
                  strong
                  secondary
                  type="success"
                  @click="loadMoreVideos()"
                >
                  Load more
                </n-button>
              </template>
            </template>
          </n-space>
        </n-scrollbar>
      </n-collapse-item>
    </n-collapse>
  </n-card>
</template>
