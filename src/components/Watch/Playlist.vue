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
  NButton,
} from 'naive-ui';
import { Repeat, CaretRight, Movement } from '@vicons/carbon';
import { ref, onMounted } from 'vue';
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';
import { convertTimer } from '../../utils/convert-timer';
import { getNextData } from '../../utils/get-next-data';

const { playlistId } = defineProps(['playlistId']);
const route = useRoute();
const router = useRouter();
const playlistDetail = ref();
const currentVideoIndex = ref();
const isRepeat = ref(false);
const isRandom = ref(false);

onMounted(async () => {
  const { data } = await axios.get(`/playlists/${playlistId} `);
  playlistDetail.value = data;
  if (data.nextpage) {
    // let nextPageData = data.nextpage;
    // while (nextPageData) {
    const res = await getNextData({
      id: playlistId,
      type: 'playlists',
      nextpage: data.nextpage,
    });
    playlistDetail.value.relatedStreams = [
      ...playlistDetail.value.relatedStreams,
      ...res.relatedStreams,
    ];
    // nextPageData = res.nextpage;
    // }
  }
  currentVideoIndex.value = parseInt(route.query.index ?? 1);
});
</script>

<template>
  <n-card
    :title="playlistDetail?.name"
    :bordered="false"
    :style="{ borderRadius: '8px', marginBottom: '28px' }"
    embedded
  >
    <n-space :style="{ marginBottom: '6px' }">
      <n-button
        text
        :focusable="false"
        :type="isRepeat ? 'primary' : ''"
        @click="isRepeat = !isRepeat"
      >
        <n-icon :component="Repeat" size="20" />
      </n-button>
      <n-button
        text
        :focusable="false"
        :type="isRandom ? 'primary' : ''"
        @click="isRandom = !isRandom"
      >
        <n-icon :component="Movement" size="20" />
      </n-button>
    </n-space>
    <n-collapse arrow-placement="right">
      <n-collapse-item :title="playlistDetail?.uploader">
        <template #header-extra>
          {{ `${currentVideoIndex}/${playlistDetail?.relatedStreams.length}` }}
        </template>
        <template #arrow> <n-icon :component="CaretRight" /> </template>
        <n-scrollbar :style="{ maxHeight: '320px' }">
          <n-space vertical>
            <template v-for="(video, index) in playlistDetail?.relatedStreams">
              <n-space
                align="center"
                :size="8"
                :wrap="false"
                :style="{
                  cursor: 'pointer',
                  padding:
                    currentVideoIndex === index + 1 ? '8px 6px' : '0 6px',
                  backgroundColor:
                    currentVideoIndex === index + 1 ? '#333' : '',
                }"
                @click="
                  router.push(
                    `${video.url}&list=${playlistId}&index=${index + 1}`
                  )
                "
              >
                <n-text
                  :style="{
                    display: 'block',
                    width: 'max-content',
                    fontSize: '12px',
                    color: currentVideoIndex === index + 1 && '#fff',
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
                  <img
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
                <n-text
                  strong
                  :style="{
                    color: currentVideoIndex === index + 1 && '#fff',
                  }"
                >
                  <n-ellipsis :line-clamp="2" :tooltip="false">
                    {{ video.title }}
                  </n-ellipsis>
                </n-text>
              </n-space>
            </template>
          </n-space>
        </n-scrollbar>
      </n-collapse-item>
    </n-collapse>
  </n-card>
</template>
