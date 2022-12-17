<script setup>
import {
  NCollapse,
  NCollapseItem,
  NCard,
  NSpace,
  NIcon,
  NScrollbar,
  NText,
  NEllipsis,
  NTag,
  NImage,
} from 'naive-ui';
import { CaretRight } from '@vicons/carbon';
import { convertTimer } from '../../utils/convert-timer';
import { onMounted, ref } from 'vue';

const { chapters, channelName, videoCurrentTime, duration } = defineProps([
  'chapters',
  'channelName',
  'videoCurrentTime',
  'duration',
]);
const emit = defineEmits(['selected-chapter']);
const videoHeight = ref();

onMounted(() => {
  videoHeight.value = document.querySelector('video').clientHeight;
});
</script>

<template>
  <n-card
    title="Chapters"
    :bordered="false"
    :style="{
      borderRadius: '8px',
      marginBottom: '28px',
    }"
    embedded
  >
    <n-collapse arrow-placement="right" default-expanded-names="chapters">
      <n-collapse-item :title="channelName" name="chapters">
        <template #arrow> <n-icon :component="CaretRight" /> </template>
        <n-scrollbar :style="{ maxHeight: `${videoHeight - 125}px` }">
          <n-space vertical>
            <template v-for="(chapter, index) in chapters">
              <n-space
                align="center"
                :size="8"
                :wrap="false"
                :style="{
                  cursor: 'pointer',
                  borderRadius: '4px',
                  padding:
                    index ===
                    chapters.findLastIndex((c) => c.start <= videoCurrentTime)
                      ? '4px 6px'
                      : '0 6px',
                  backgroundColor:
                    index ===
                    chapters.findLastIndex((c) => c.start <= videoCurrentTime)
                      ? 'rgba(99, 226, 183, 0.25)'
                      : 'transparent',
                }"
                @click="emit('selected-chapter', { start: chapter.start })"
              >
                <n-text
                  tag="div"
                  :style="{
                    aspectRatio: '16/9',
                    width: '120px',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    backgroundColor: '#333',
                  }"
                >
                  <n-image
                    :src="chapter.image"
                    :style="{
                      height: '100%',
                    }"
                  />
                </n-text>
                <n-text
                  strong
                  :style="{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                  }"
                >
                  <n-ellipsis :line-clamp="2" :tooltip="false">
                    {{ chapter.title }}
                  </n-ellipsis>
                  <n-tag
                    size="small"
                    type="success"
                    :style="{
                      bottom: '3px',
                      right: '3px',
                      width: 'max-content',
                      cursor: 'pointer',
                    }"
                    @click="emit('selected-chapter', { start: chapter.start })"
                  >
                    {{ convertTimer(chapter.start) }}
                  </n-tag>
                </n-text>
              </n-space>
            </template>
          </n-space>
        </n-scrollbar>
      </n-collapse-item>
    </n-collapse>
  </n-card>
</template>
