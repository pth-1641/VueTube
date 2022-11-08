<script setup>
import {
  NCollapse,
  NCollapseItem,
  NSpace,
  NAvatar,
  NText,
  NIcon,
  NTag,
  NEllipsis,
  NButton,
  NSpin,
} from 'naive-ui';
import { ThumbsUpFilled, FavoriteFilled } from '@vicons/carbon';
import { ref } from 'vue';
import axios from 'axios';
import { renderHTML } from '../../utils/render-html';
import { formatLikes } from '../../utils/format-view-count';

const { replyCount, repliesPage, uploaderUrl } = defineProps([
  'replyCount',
  'repliesPage',
  'uploaderUrl',
]);
const replies = ref([]);
const nextReplies = ref();
const isLoading = ref(false);

const handleGetReplies = () => {
  isLoading.value = true;
  axios
    .get(`/nextpage/comments/red9YvYlPWg?nextpage=${repliesPage}`)
    .then(({ data }) => {
      replies.value = data.comments;
      nextReplies.value = data.nextpage;
    })
    .finally(() => (isLoading.value = false));
};

const handleLoadMoreReplies = () => {
  isLoading.value = true;
  axios
    .get(`/nextpage/comments/red9YvYlPWg?nextpage=${nextReplies.value}`)
    .then(({ data }) => {
      replies.value = [...replies.value, ...data.comments];
      nextReplies.value = data.nextpage;
    })
    .finally(() => (isLoading.value = false));
};
</script>

<template>
  <n-collapse
    arrow-placement="right"
    :style="{ marginTop: '6px' }"
    @item-header-click="handleGetReplies"
  >
    <n-collapse-item
      :title="replyCount === 1 ? '1 Reply' : `${replyCount} Replies`"
    >
      <n-space
        v-for="reply in replies"
        :key="reply.commentId"
        align="start"
        :wrap="false"
        :style="{ marginBottom: '20px' }"
      >
        <n-avatar :src="reply.thumbnail" circle :size="40" />
        <n-text tag="div" :style="{ display: 'flex', flexDirection: 'column' }">
          <n-space :size="4">
            <template v-if="reply.commentorUrl === uploaderUrl">
              <n-tag
                :bordered="false"
                round
                size="small"
                :style="{ fontWeight: 600, fontSize: '14px' }"
              >
                {{ reply.author }}
              </n-tag>
            </template>
            <template v-else>
              <n-text strong>
                {{ reply.author }}
              </n-text>
            </template>
            •
            <n-text depth="3" :style="{ fontSize: '13px' }">{{
              reply.commentedTime
            }}</n-text>
          </n-space>
          <n-ellipsis expand-trigger="click" line-clamp="3" :tooltip="false">
            <span v-html="renderHTML(reply.commentText)" />
          </n-ellipsis>
          <n-space align="center" :size="14" :style="{ marginTop: '6px' }">
            <n-space align="start" :size="6">
              <n-icon :component="ThumbsUpFilled" :size="17" />
              <template v-if="reply.likeCount !== 0">
                <n-text :style="{ fontSize: '12px' }">{{
                  formatLikes(reply.likeCount)
                }}</n-text>
              </template>
            </n-space>
            <n-icon
              :component="ThumbsUpFilled"
              :size="17"
              :style="{ transform: 'rotate(180deg)' }"
            />
            <template v-if="reply.hearted">
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
      <template v-if="isLoading">
        <n-spin size="small" />
      </template>
      <template v-else>
        <template v-if="nextReplies">
          <n-button
            secondary
            size="small"
            round
            type="primary"
            @click="handleLoadMoreReplies"
            >Load more</n-button
          >
        </template>
      </template>
    </n-collapse-item>
  </n-collapse>
</template>
