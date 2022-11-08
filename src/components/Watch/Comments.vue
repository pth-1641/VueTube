<script setup>
import { NSpace, NAvatar, NText, NIcon, NH4, NTag, NEllipsis } from 'naive-ui';
import { useRoute } from 'vue-router';
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { formatLikes } from '../../utils/format-view-count';
import { renderHTML } from '../../utils/render-html';
import { ThumbsUpFilled, Pin, FavoriteFilled } from '@vicons/carbon';
import CommentReplies from './CommentReplies.vue';

const route = useRoute();
const videoComments = ref({});
const { uploaderUrl, uploader } = defineProps(['uploaderUrl', 'uploader']);

const getComments = (videoId) =>
  axios
    .get(`/comments/${videoId}`)
    .then(({ data }) => (videoComments.value = data));

onMounted(() => {
  getComments(route.query.v);
});

watch(route, () => {
  getComments(route.query.v);
});
</script>

<template>
  <n-h4 prefix="bar" :style="{ fontSize: '18px' }"> Comments </n-h4>
  <n-space
    v-for="comment in videoComments.comments"
    :key="comment.commentId"
    align="start"
    :wrap="false"
    :style="{ marginBottom: '20px' }"
  >
    <n-avatar :src="comment.thumbnail" circle :size="40" />
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
            :style="{ fontWeight: 600, fontSize: '14px' }"
          >
            {{ comment.author }}
          </n-tag>
        </template>
        <template v-else>
          <n-text strong>
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
      <template v-if="comment.replyCount > 0">
        <CommentReplies
          :replyCount="comment.replyCount"
          :repliesPage="comment.repliesPage"
          :uploaderUrl="uploaderUrl"
        />
      </template>
    </n-text>
  </n-space>
</template>
