<script setup>
import {
  NLayout,
  NLayoutContent,
  NGrid,
  NGridItem,
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
  NH4,
  NTag,
  NEllipsis,
  NImage,
} from 'naive-ui';
import { useRoute, useRouter } from 'vue-router';
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import {
  formatCommaViews,
  formatViews,
  formatLikes,
} from '../utils/format-view-count';
import { renderHTML } from '../utils/render-html';
import {
  ThumbsUp,
  ThumbsDown,
  CheckmarkFilled,
  PageLast,
  ThumbsUpFilled,
  Pin,
  FavoriteFilled,
  WeatherStation,
  ViewFilled,
} from '@vicons/carbon';
import { convertTimer } from '../utils/convert-timer';

const route = useRoute();
const router = useRouter();
const videoId = route.query.v;
const videoDetail = ref({});
const commentsDetail = ref({});

const getVideoDetail = (videoId) =>
  axios
    .get(`/streams/${videoId}`)
    .then(({ data }) => (videoDetail.value = data));

const getComments = (videoId) =>
  axios
    .get(`/comments/${videoId}`)
    .then(({ data }) => (commentsDetail.value = data));

onMounted(() => {
  getVideoDetail(route.query.v);
  getComments(route.query.v);
});

watch(route, () => {
  getVideoDetail(route.query.v);
  getComments(route.query.v);
});
</script>

<template>
  <n-layout :style="{ padding: '25px 30px' }">
    <n-layout-content>
      <n-grid item-responsive :cols="12" :x-gap="20">
        <n-grid-item :span="8">
          <iframe
            :src="`http://www.youtube.com/embed/${videoId}`"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;
          picture-in-picture"
            allowfullscreen
            :style="{ width: '100%', aspectRatio: '16/9', borderRadius: '8px' }"
          />
          <n-h3 :style="{ margin: 0, fontSize: '19px' }">{{
            videoDetail.title
          }}</n-h3>
          <n-space
            align="center"
            justify="space-between"
            :style="{ marginTop: '10px' }"
          >
            <n-space align="center">
              <n-avatar
                :src="videoDetail.uploaderAvatar"
                :size="40"
                circle
                :style="{ cursor: 'pointer' }"
                @click="router.push(videoDetail.uploaderUrl)"
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
                  @click="router.push(videoDetail.uploaderUrl)"
                  >{{ videoDetail.uploader }}
                  <template v-if="videoDetail.uploaderVerified">
                    <n-icon :component="CheckmarkFilled" size="15" />
                  </template>
                </n-text>
                <n-text
                  >{{
                    formatViews(videoDetail.uploaderSubscriberCount)
                  }}
                  subscribers</n-text
                >
              </n-space>
            </n-space>
            <n-space align="center">
              <template v-if="videoDetail.livestream">
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
                  {{ formatViews(videoDetail.likes) }} Like
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
            >{{ formatCommaViews(videoDetail.views) }} views |
            {{ videoDetail.uploadDate?.split('-').reverse().join('-') }}</n-text
          >
          <n-card :style="{ marginTop: '16px' }" :bordered="false" embedded>
            <n-collapse arrow-placement="right">
              <template #arrow>
                <n-icon :component="PageLast" />
              </template>
              <n-collapse-item title="Show More">
                <span v-html="renderHTML(videoDetail.description)" />
              </n-collapse-item>
            </n-collapse>
          </n-card>
          <n-h4 prefix="bar" :style="{ fontSize: '18px' }"> Comments </n-h4>
          <n-space
            v-for="comment in commentsDetail.comments"
            :key="comment.commentId"
            align="start"
            :wrap="false"
            :style="{ marginBottom: '24px' }"
          >
            <n-avatar :src="comment.thumbnail" circle :size="40" />
            <n-text
              tag="div"
              :style="{ display: 'flex', flexDirection: 'column' }"
            >
              <template v-if="comment.pinned">
                <n-space :size="8" align="center">
                  <n-icon :component="Pin" />
                  <n-text type="success" strong>
                    Pinned by {{ videoDetail.uploader }}
                  </n-text>
                </n-space>
              </template>
              <n-space :size="4">
                <template
                  v-if="comment.commentorUrl === videoDetail.uploaderUrl"
                >
                  <n-tag
                    :bordered="false"
                    round
                    size="small"
                    :style="{ fontWeight: 600, fontSize: '14px' }"
                  >
                    {{ comment.author }}
                  </n-tag>
                </template>
                <template v-else>
                  <n-text strong>{{ comment.author }} </n-text>
                </template>
                •
                <n-text depth="3" :style="{ fontSize: '13px' }">{{
                  comment.commentedTime
                }}</n-text>
              </n-space>
              <n-ellipsis
                expand-trigger="click"
                line-clamp="3"
                :tooltip="false"
              >
                <span v-html="renderHTML(comment.commentText)" />
              </n-ellipsis>
              <n-space align="center" :size="14" :style="{ marginTop: '6px' }">
                <n-space align="start" :size="6">
                  <n-icon :component="ThumbsUpFilled" :size="17" />
                  <template v-if="comment.likeCount !== 0">
                    <n-text :style="{ fontSize: '12px' }">{{
                      formatLikes(comment.likeCount)
                    }}</n-text>
                  </template>
                </n-space>
                <n-icon
                  :component="ThumbsUpFilled"
                  :size="17"
                  :style="{ transform: 'rotate(180deg)' }"
                />
                <template v-if="comment.hearted">
                  <n-icon
                    :component="FavoriteFilled"
                    :size="16"
                    color="#f00"
                    :depth="1"
                  />
                </template>
              </n-space>
            </n-text>
          </n-space>
        </n-grid-item>
        <n-grid-item :span="4">
          <n-space vertical :size="2">
            <n-space
              v-for="video in videoDetail.relatedStreams"
              :key="video.url"
              :wrap="false"
              @click="router.push(video.url)"
              :style="{ cursor: 'pointer' }"
            >
              <n-text tag="div" :style="{ position: 'relative' }">
                <n-image
                  :src="video.thumbnail"
                  height="96"
                  :style="{ borderRadius: '8px' }"
                  preview-disabled
                />
                <template v-if="video.duration < 0">
                  <n-tag
                    :bordered="false"
                    size="small"
                    strong
                    :style="{
                      position: 'absolute',
                      bottom: '10px',
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
                <template v-else>
                  <n-tag
                    size="small"
                    :bordered="false"
                    strong
                    :style="{
                      position: 'absolute',
                      bottom: '10px',
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
                  {{ video.title }}
                </n-ellipsis>
                <n-text
                  depth="3"
                  :style="{ display: 'flex', alignItems: 'center', gap: '6px' }"
                  strong
                >
                  {{ video.uploaderName }}
                  <template v-if="video.uploaderVerified">
                    <n-icon :component="CheckmarkFilled" />
                  </template>
                </n-text>
                <template v-if="video.duration < 0">
                  <n-text
                    depth="3"
                    :style="{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }"
                  >
                    <n-icon :component="ViewFilled" size="20" />
                    {{ formatViews(video.views) }} views
                  </n-text>
                </template>
                <template v-else>
                  <n-text
                    depth="3"
                    :style="{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }"
                  >
                    {{ formatViews(video.views) }} views •
                    {{ video.uploadedDate }}
                  </n-text>
                </template>
              </n-space>
            </n-space>
          </n-space>
        </n-grid-item>
      </n-grid>
    </n-layout-content>
  </n-layout>
</template>
