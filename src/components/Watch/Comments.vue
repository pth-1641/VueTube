<script setup>
import {
  NSpace,
  NAvatar,
  NText,
  NIcon,
  NH4,
  NTag,
  NEllipsis,
  NSpin,
} from 'naive-ui';
import { useRoute, useRouter } from 'vue-router';
import { onBeforeUnmount, onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { formatViews } from '../../utils/format-view-count';
import { renderHTML } from '../../utils/render-html';
import { ThumbsUp, Pin, FavoriteFilled } from '@vicons/carbon';
import CommentReplies from './CommentReplies.vue';
import { getNextData } from '../../utils/get-next-data';

const { uploaderUrl, uploader, uploaderAvatar } = defineProps([
  'uploaderUrl',
  'uploader',
  'uploaderAvatar',
]);
const route = useRoute();
const router = useRouter();
const endComments = ref();
const comments = ref({});
const nextpageData = ref();
const isLoading = ref(false);
const videoId = route.query.v;

const getComments = async (id) => {
  try {
    const { data } = await axios.get(`/comments/${id}`);
    comments.value = data.comments;
    nextpageData.value = data.nextpage;
  } catch (err) {
    console.error(err);
  }
};

const loadMoreComments = async () => {
  try {
    const rect = endComments.value.getBoundingClientRect();
    const isEnd = rect.bottom <= document.documentElement.clientHeight;
    if (!isEnd || !nextpageData.value) return;
    if (isLoading.value) return;
    isLoading.value = true;
    const res = await getNextData({
      type: 'comments',
      nextpage: nextpageData.value,
      id: videoId,
    });
    nextpageData.value = res.nextpage;
    comments.value = [...comments.value, ...res.comments];
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  getComments(videoId);
  window.addEventListener('scroll', loadMoreComments);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', loadMoreComments);
});

watch(route, ({ query }) => {
  getComments(query.v);
});
</script>

<template>
  <template v-if="comments.disabled">
    <n-space justify="center" :style="{ marginTop: '30px' }">
      Comments are turned off.
    </n-space>
  </template>
  <template v-else>
    <n-h4 prefix="bar" :style="{ fontSize: '18px' }"> Comments </n-h4>
    <n-space
      v-for="comment in comments"
      :key="comment.commentId"
      align="start"
      :wrap="false"
      :style="{ marginBottom: '20px' }"
    >
      <n-avatar
        :src="comment.thumbnail"
        circle
        :size="40"
        :style="{ cursor: 'pointer' }"
        @click="router.push(comment.commentorUrl)"
      />
      <n-text tag="div" :style="{ display: 'flex', flexDirection: 'column' }">
        <template v-if="comment.pinned">
          <n-space :size="8" align="center" :style="{ marginBottom: '2px' }">
            <n-icon :component="Pin" />
            <n-text type="success" strong> Pinned by {{ uploader }} </n-text>
          </n-space>
        </template>
        <n-space :size="4">
          <template v-if="comment.commentorUrl === uploaderUrl">
            <n-tag
              :bordered="false"
              round
              size="small"
              :style="{ fontWeight: 500, fontSize: '14px', cursor: 'pointer' }"
              @click="router.push(comment.commentorUrl)"
            >
              {{ comment.author }}
            </n-tag>
          </template>
          <template v-else>
            <n-text
              strong
              :style="{ cursor: 'pointer' }"
              @click="router.push(comment.commentorUrl)"
            >
              {{ comment.author }}
            </n-text>
          </template>
          •
          <n-text depth="3" :style="{ fontSize: '13px' }">{{
            comment.commentedTime
          }}</n-text>
        </n-space>
        <n-ellipsis expand-trigger="click" line-clamp="3" :tooltip="false">
          <span v-html="renderHTML(comment.commentText)" />
        </n-ellipsis>
        <n-space align="center" :size="14" :style="{ marginTop: '6px' }">
          <n-space align="start" :size="6">
            <n-icon :component="ThumbsUp" :size="17" />
            <template v-if="comment.likeCount !== 0">
              <n-text :style="{ fontSize: '12px' }">
                {{ formatViews(comment.likeCount) }}
              </n-text>
            </template>
          </n-space>
          <n-icon
            :component="ThumbsUp"
            :size="17"
            :style="{ transform: 'rotate(180deg)' }"
          />
          <template v-if="comment.hearted">
            <n-text tag="div" :style="{ position: 'relative' }">
              <n-avatar :src="uploaderAvatar" :size="16" circle />
              <n-icon
                :component="FavoriteFilled"
                :size="14"
                color="#f00"
                :depth="1"
                :style="{
                  position: 'absolute',
                  bottom: 0,
                  right: '-6px',
                }"
              />
            </n-text>
          </template>
        </n-space>
        <template v-if="comment.replyCount > 0">
          <CommentReplies
            :replyCount="comment.replyCount"
            :repliesPage="comment.repliesPage"
            :uploaderUrl="uploaderUrl"
            :uploaderAvatar="uploaderAvatar"
          />
        </template>
      </n-text>
    </n-space>
    <template v-if="isLoading">
      <n-space align="center" justify="center" :style="{ marginTop: '12px' }">
        <n-spin />
      </n-space>
    </template>

    <div ref="endComments" />
  </template>
</template>
