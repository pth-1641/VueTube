<script setup>
import { NImage, NSpace, NH3, NText, NAvatar, NIcon, NTag } from 'naive-ui';
import { CheckmarkFilled, WeatherStation, ViewFilled } from '@vicons/carbon';
import { useRouter } from 'vue-router';
import { formatViews } from '../../utils/format-view-count';
import { convertTimer } from '../../utils/convert-timer';

const { video } = defineProps(['video']);
const router = useRouter();
</script>

<template>
  <n-space
    :wrap="false"
    :size="16"
    :style="{ cursor: 'pointer' }"
    @click="router.push(video.url)"
  >
    <n-text tag="div" :style="{ position: 'relative', height: '200px' }">
      <n-image
        :src="video.thumbnail"
        preview-disabled
        :style="{ borderRadius: '8px' }"
        width="360"
      />
      <template v-if="video.duration < 0">
        <n-tag
          :bordered="false"
          size="small"
          strong
          :style="{
            position: 'absolute',
            bottom: '6px',
            right: '6px',
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
      <template v-else>
        <n-tag
          :bordered="false"
          size="small"
          strong
          :style="{
            position: 'absolute',
            bottom: '6px',
            right: '6px',
          }"
        >
          {{ convertTimer(video.duration) }}
        </n-tag>
      </template>
    </n-text>
    <n-space vertical>
      <n-h3 :style="{ marginBottom: 0 }">
        {{ video.title }}
      </n-h3>
      <template v-if="video.duration < 0">
        <n-text
          strong
          :style="{ display: 'flex', alignItems: 'center', gap: '8px' }"
        >
          <n-icon :component="ViewFilled" size="20" />
          {{ formatViews(video.views) }} views
        </n-text>
      </template>
      <template v-else>
        <n-text>
          {{ formatViews(video.views) }} views • {{ video.uploadedDate }}
        </n-text>
      </template>
      <n-space align="center">
        <n-avatar
          :src="video.uploaderAvatar"
          round
          size="small"
          :style="{ display: 'flex' }"
        />
        <n-space align="center" size="small">
          <n-text strong>
            {{ video.uploaderName }}
          </n-text>
          <template v-if="video.uploaderVerified">
            <n-icon
              :component="CheckmarkFilled"
              :style="{ display: 'flex', alignItems: 'center' }"
            />
          </template>
        </n-space>
      </n-space>
      <n-text italic>{{ video.shortDescription }}</n-text>
    </n-space>
  </n-space>
</template>
