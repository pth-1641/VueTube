<script setup>
import {
  NSpace,
  NEllipsis,
  NText,
  NIcon,
  NAvatar,
  NButton,
  NSpin,
  NH6,
  NGrid,
  NGi,
} from 'naive-ui';
import { CheckmarkFilled } from '@vicons/carbon';
import axios from 'axios';
import { onMounted, ref, onBeforeUnmount } from 'vue';
import { formatViews } from '../../utils/format-view-count';
import { useRouter } from 'vue-router';
import { getNextData } from '../../utils/get-next-data';

const { data, channelId } = defineProps(['data', 'channelId']);
const router = useRouter();
const channels = ref();
const nextpageData = ref();
const isLoading = ref(false);

const getNextChannels = async () => {
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
    channels.value = [...channels.value, ...res.relatedStreams];
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(async () => {
  try {
    const res = await axios.get(`/channels/tabs?data=${data}`);
    channels.value = res.data.content;
    nextpageData.value = res.data.nextpage;
  } catch (err) {
    console.error(err);
  }
});

onBeforeUnmount(() => window.removeEventListener('scroll', getNextChannels));
</script>

<template>
  <template v-if="channels === undefined">
    <n-space align="center" justify="center">
      <n-spin size="large" />
    </n-space>
  </template>
  <template v-else>
    <template v-if="channels.length">
      <n-grid :style="{ padding: '30px 0' }" x-gap="10" y-gap="50" :cols="6">
        <n-gi
          v-for="channel in channels"
          :key="channel.url"
          @click="router.push(channel.url)"
          :style="{ cursor: 'pointer' }"
        >
          <n-space :size="0" vertical justify="center" align="center">
            <n-avatar :src="channel.thumbnail" :size="56" round />
            <n-space align="center" :size="6">
              <n-h6
                :style="{
                  fontSize: '14px',
                  marginBottom: '5px',
                }"
              >
                <n-ellipsis :tooltip="false">
                  {{ channel.name }}
                </n-ellipsis>
              </n-h6>
              <template v-if="channel.verified">
                <n-icon :component="CheckmarkFilled" />
              </template>
            </n-space>
            <n-text
              depth="3"
              :style="{ opacity: channel.subscribers > 0 ? 1 : 0 }"
            >
              {{ formatViews(channel.subscribers) }} subscribers
            </n-text>
            <n-button
              size="small"
              round
              type="primary"
              :style="{ marginTop: '6px' }"
              >Subscribe</n-button
            >
          </n-space>
        </n-gi>
        <template v-if="isLoading">
          <n-space
            align="center"
            justify="center"
            :style="{ marginTop: '40px' }"
          >
            <n-spin :size="36" />
          </n-space>
        </template>
      </n-grid>
    </template>
    <template v-else>
      <n-text tag="p" :style="{ textAlign: 'center' }">
        This channel doesn't feature any other channels.
      </n-text>
    </template>
  </template>
</template>
