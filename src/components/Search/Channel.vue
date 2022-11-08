<script setup>
import { NSpace, NH3, NText, NAvatar, NIcon, NButton } from 'naive-ui';
import { CheckmarkFilled } from '@vicons/carbon';
import { formatViews, formatCommaViews } from '../../utils/format-view-count';
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const { channel } = defineProps(['channel']);
const isSubscribe = ref(false);
const router = useRouter();
</script>

<template>
  <n-text
    tag="div"
    :style="{
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '30px 0',
      cursor: 'pointer',
    }"
    @click="router.push(channel.url)"
  >
    <n-space :style="{ width: '360px' }" align="center" justify="center">
      <n-avatar :src="channel.thumbnail" :size="96" round />
    </n-space>
    <n-space vertical :size="4" :style="{ flex: 1 }">
      <n-space align="center" size="small">
        <n-h3 :style="{ marginBottom: 0 }">
          {{ channel.name }}
        </n-h3>
        <template v-if="channel.verified">
          <n-icon
            :component="CheckmarkFilled"
            size="15"
            :style="{ display: 'flex', alignItems: 'center' }"
          />
        </template>
      </n-space>
      <template v-if="channel.subscribers > -1">
        <n-text
          >{{ formatViews(channel.subscribers) }} subscribers •
          {{ formatCommaViews(channel.videos) }} videos
        </n-text>
      </template>

      <n-text italic>{{ channel.description }}</n-text>
    </n-space>

    <template v-if="isSubscribe">
      <n-button :style="{ fontWeight: 600 }" @click="isSubscribe = false"
        >SUBSCRIBED</n-button
      >
    </template>
    <template v-else>
      <n-button
        type="success"
        :style="{ fontWeight: 600 }"
        @click="isSubscribe = true"
        >SUBSCRIBE</n-button
      >
    </template>
  </n-text>
</template>
