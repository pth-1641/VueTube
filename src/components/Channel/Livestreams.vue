<script setup>
import {
  NTag,
  NText,
  NEllipsis,
  NGi,
  NGrid,
  NSpin,
  NSpace,
  NIcon,
} from 'naive-ui';
import { WeatherStation } from '@vicons/carbon';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { onMounted, ref, onBeforeUnmount } from 'vue';
import { formatViews } from '../../utils/format-view-count';
import { convertTimer } from '../../utils/convert-timer';
import { getNextData } from '../../utils/get-next-data';

const { data, channelId } = defineProps(['data', 'channelId']);
const livestreams = ref();
const nextpageData = ref();
const isLoading = ref(false);
const router = useRouter();

const getNextLivestreams = async () => {
  const endOfPage =
    window.scrollY + window.innerHeight >= document.body.offsetHeight;
  if (!endOfPage || !nextpageData.value) return;
  if (isLoading.value) return;
  try {
    isLoading.value = true;
    const res = await getNextData({
      type: 'channel',
      nextpage: nextpageData.value,
      id: channelId,
    });
    nextpageData.value = res.nextpage;
    livestreams.value = [...livestreams.value, ...res.relatedStreams];
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  try {
    const res = await axios.get(`/channels/tabs?data=${data}`);
    livestreams.value = res.data.content;
    nextpageData.value = res.data.nextpage;
    window.addEventListener('scroll', getNextLivestreams);
  } catch (err) {
    console.error(err);
  }
});

onBeforeUnmount(() => window.removeEventListener('scroll', getNextLivestreams));
</script>

<template>
  <template v-if="livestreams === undefined">
    <n-space align="center" justify="center">
      <n-spin size="large" />
    </n-space>
  </template>
  <template v-else>
    <template v-if="livestreams?.length">
      <n-grid :cols="5" x-gap="16" y-gap="36" :style="{ padding: '30px 0' }">
        <n-gi
          v-for="live in livestreams"
          :key="live.url"
          :style="{
            display: 'flex',
            flexDirection: 'column',
            cursor: 'pointer',
          }"
          @click="router.push(live.url)"
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
              :src="live.thumbnail"
              :style="{ height: '100%', objectFit: 'cover' }"
            />
            <template v-if="live.duration < 0">
              <n-tag
                size="small"
                strong
                :bordered="false"
                :style="{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                  backgroundColor: '#f00',
                  color: '#fff',
                }"
              >
                <template #icon>
                  <n-icon :component="WeatherStation" />
                </template>
                LIVE
              </n-tag>
            </template>
            <template v-else>
              <n-tag
                size="small"
                strong
                :bordered="false"
                :style="{
                  position: 'absolute',
                  bottom: '4px',
                  right: '4px',
                }"
              >
                {{ convertTimer(live.duration) }}
              </n-tag>
            </template>
          </n-text>

          <n-ellipsis
            :tooltip="false"
            :line-clamp="2"
            :style="{ fontWeight: 600, marginTop: '6px' }"
          >
            {{ live.title }}
          </n-ellipsis>
          <n-text depth="3" :style="{ fontSize: '12px', marginTop: '2px' }">
            {{ formatViews(live.views) }} views •
            {{ live.uploadedDate }}
          </n-text>
        </n-gi>
      </n-grid>
      <template v-if="isLoading">
        <n-space align="center" justify="center" :style="{ marginTop: '40px' }">
          <n-spin :size="36" />
        </n-space>
      </template>
    </template>
    <template v-else>
      <n-text tag="p" :style="{ textAlign: 'center' }">
        This channel has no videos.
      </n-text>
    </template>
  </template>
</template>
