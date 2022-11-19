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
} from 'naive-ui';
import { CheckmarkFilled } from '@vicons/carbon';
import axios from 'axios';
import { onMounted, ref } from 'vue';
import { formatViews } from '../../utils/format-view-count';
import { useRouter } from 'vue-router';

const { data } = defineProps(['data']);
const router = useRouter();
const channels = ref();
onMounted(() => {
  axios.get(`/channels/tabs?data=${data}`).then((res) => {
    channels.value = res.data;
  });
});
</script>

<template>
  <template v-if="channels === undefined">
    <n-space align="center" justify="center">
      <n-spin size="large" />
    </n-space>
  </template>
  <template v-else>
    <template v-if="channels?.content.length">
      <n-space :size="60" :style="{ padding: '30px 0' }">
        <n-space
          v-for="channel in channels?.content"
          :key="channel.url"
          vertical
          align="center"
          :size="0"
          @click="router.push(channel.url)"
          :style="{ cursor: 'pointer' }"
        >
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
          <n-text depth="3">
            {{ formatViews(channel.subscribers) }} subscribers
          </n-text>
          <n-button
            size="small"
            round
            type="primary"
            :style="{ marginTop: '10px' }"
            >Subscribe</n-button
          >
        </n-space>
      </n-space>
    </template>
    <template v-else>
      <n-text tag="p" :style="{ textAlign: 'center' }">
        This channel doesn't feature any other channels.
      </n-text>
    </template>
  </template>
</template>
