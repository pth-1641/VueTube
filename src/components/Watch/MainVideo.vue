<script setup>
import {
  NH3,
  NSpace,
  NAvatar,
  NText,
  NButton,
  NCard,
  NButtonGroup,
  NIcon,
  NCollapse,
  NCollapseItem,
  NTag,
} from 'naive-ui';
import { useRoute, useRouter } from 'vue-router';
import { formatCommaViews, formatViews } from '../../utils/format-view-count';
import { renderHTML } from '../../utils/render-html';
import {
  ThumbsUp,
  ThumbsDown,
  CheckmarkFilled,
  PageLast,
} from '@vicons/carbon';

const route = useRoute();
const router = useRouter();
const videoId = route.query.v;
const { video } = defineProps(['video']);
</script>

<template>
  <iframe
    :src="`http://www.youtube.com/embed/${videoId}`"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;
          picture-in-picture"
    allowfullscreen
    :style="{ width: '100%', aspectRatio: '16/9', borderRadius: '8px' }"
  />
  <n-h3 :style="{ margin: 0, fontSize: '19px' }">{{ video.title }}</n-h3>
  <n-space
    align="center"
    justify="space-between"
    :style="{ marginTop: '10px' }"
  >
    <n-space align="center">
      <n-avatar
        :src="video.uploaderAvatar"
        :size="40"
        circle
        :style="{ cursor: 'pointer' }"
        @click="router.push(video.uploaderUrl)"
      />
      <n-space vertical :size="0">
        <n-text
          strong
          :style="{
            fontSize: '17px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer',
          }"
          @click="router.push(video.uploaderUrl)"
          >{{ video.uploader }}
          <template v-if="video.uploaderVerified">
            <n-icon :component="CheckmarkFilled" size="15" />
          </template>
        </n-text>
        <n-text
          >{{ formatViews(video.uploaderSubscriberCount) }} subscribers</n-text
        >
      </n-space>
    </n-space>
    <n-space align="center">
      <template v-if="video.livestream">
        <n-tag
          :bordered="false"
          size="small"
          round
          strong
          :style="{ backgroundColor: '#f00', color: '#fff' }"
        >
          LIVESTREAM
        </n-tag>
      </template>
      <n-button-group size="medium">
        <n-button :focusable="false">
          <template #icon>
            <n-icon :component="ThumbsUp" />
          </template>
          <template v-if="video.likes > 0">
            {{ formatViews(video.likes) }}
          </template>
          Like
        </n-button>
        <n-button :focusable="false">
          <template #icon>
            <n-icon :component="ThumbsDown" />
          </template>
          Dislike
        </n-button>
      </n-button-group>
      <n-button type="primary" :style="{ fontWeight: 600 }">
        Subscribe
      </n-button>
    </n-space>
  </n-space>
  <n-text code :style="{ marginTop: '8px' }"
    >{{ formatCommaViews(video.views) }} views |
    {{ video.uploadDate?.split('-').reverse().join('-') }}</n-text
  >
  <n-card :style="{ marginTop: '16px' }" :bordered="false" embedded>
    <n-collapse arrow-placement="right">
      <template #arrow>
        <n-icon :component="PageLast" />
      </template>
      <n-collapse-item title="Show More">
        <span v-html="renderHTML(video.description)" />
      </n-collapse-item>
    </n-collapse>
  </n-card>
</template>
