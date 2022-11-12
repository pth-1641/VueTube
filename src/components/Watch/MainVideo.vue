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
  NModal,
  NRadio,
  NSelect,
  NForm,
  NFormItem,
  NInput,
  NGrid,
  NGi,
} from 'naive-ui';
import { useRoute, useRouter } from 'vue-router';
import { formatCommaViews, formatViews } from '../../utils/format-view-count';
import { renderHTML } from '../../utils/render-html';
import { ref } from 'vue';
import {
  ThumbsUp,
  ThumbsDown,
  CheckmarkFilled,
  PageLast,
  Download,
} from '@vicons/carbon';

const route = useRoute();
const router = useRouter();
const videoId = route.query.v;
const { video, audioStreams, videoStreams } = defineProps([
  'video',
  'audioStreams',
  'videoStreams',
]);

const mp3Options = audioStreams
  ?.filter((audio) => !audio.format.includes('WEBM'))
  .sort((a, b) => parseInt(b.quality) - parseInt(a.quality));

const mp4Options = videoStreams
  ?.filter((audio) => !audio.format.includes('WEBM'))
  .sort((a, b) => parseInt(b.quality) - parseInt(a.quality));

const resetDefault = () => {
  downloadInfo.value = {};
  downloadLink.value = null;
};

const downloadLink = ref();
const downloadInfo = ref({});
const handleUpdateSelectedDetail = (value) => {
  const selectedType = optionValue.value === 'mp3' ? mp3Options : mp4Options;
  const index = selectedType.findIndex((option) => option.url === value);
  downloadInfo.value = selectedType[index];
  downloadLink.value = value;
};

const showModal = ref(false);
const optionValue = ref('mp3');
const handleSelectDownloadOption = (e) => {
  optionValue.value = e.target.value;
  resetDefault();
};

const handleDownload = () => {
  window.open(downloadLink.value);
  showModal.value = false;
  resetDefault();
};
</script>

<template>
  <!-- <iframe
    :src="`http://www.youtube.com/embed/${videoId}`"
    frameborder="0"
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;
          picture-in-picture"
    allowfullscreen
    :style="{ width: '100%', aspectRatio: '16/9', borderRadius: '8px' }"
  /> -->
  <video
    src="http://www.example.com/movie.ogg"
    controls
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
        <template v-if="video.uploaderSubscriberCount > 0">
          <n-text :style="{ fontSize: '13px' }">
            {{ formatViews(video.uploaderSubscriberCount) }}
            subscribers
          </n-text>
        </template>
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
  <n-space
    align="center"
    justify="space-between"
    :style="{ marginTop: '12px' }"
  >
    <n-text code :style="{ marginTop: '8px' }"
      >{{ formatCommaViews(video.views) }} views |
      {{ video.uploadDate?.split('-').reverse().join('-') }}</n-text
    >
    <n-button round @click="showModal = true">
      <template #icon>
        <n-icon :component="Download" />
      </template>
      Download
    </n-button>
  </n-space>
  <n-modal
    v-model:show="showModal"
    title="Download"
    :bordered="false"
    size="large"
    transform-origin="center"
    preset="card"
    :on-after-leave="resetDefault"
    :style="{ maxWidth: '600px', width: '100%' }"
  >
    <n-space>
      <n-radio
        :checked="optionValue === 'mp3'"
        value="mp3"
        @change="handleSelectDownloadOption"
      >
        Mp3
      </n-radio>
      <n-radio
        :checked="optionValue === 'mp4'"
        value="mp4"
        @change="handleSelectDownloadOption"
      >
        Mp4
      </n-radio>
    </n-space>
    <n-form :style="{ marginTop: '8px' }">
      <n-form-item label="Quality">
        <template v-if="optionValue === 'mp3'">
          <n-select
            label-field="quality"
            value-field="url"
            children-field="quality"
            :options="mp3Options"
            @update:value="handleUpdateSelectedDetail"
          />
        </template>
        <template v-else>
          <n-select
            label-field="quality"
            value-field="url"
            children-field="quality"
            :options="mp4Options"
            @update:value="handleUpdateSelectedDetail"
          />
        </template>
      </n-form-item>
      <n-grid :cols="2" x-gap="20">
        <n-gi>
          <n-form-item label="Format">
            <n-input :value="downloadInfo.format ?? 'No data'" readonly />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item label="Codec">
            <n-input :value="downloadInfo.codec ?? 'No data'" readonly />
          </n-form-item>
        </n-gi>
        <template v-if="optionValue === 'mp4'">
          <n-gi>
            <n-form-item label="Sound">
              <n-input
                :value="downloadInfo.videoOnly ? 'No' : 'Yes'"
                readonly
              />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="FPS">
              <n-input :value="downloadInfo.fps ?? 'No data'" readonly />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Width">
              <n-input :value="downloadInfo.width ?? 0" readonly />
            </n-form-item>
          </n-gi>
          <n-gi>
            <n-form-item label="Height">
              <n-input :value="downloadInfo.height ?? 0" readonly />
            </n-form-item>
          </n-gi>
        </template>
      </n-grid>
      <n-button
        type="primary"
        :disabled="!downloadLink"
        :style="{ margin: 'auto', display: 'block' }"
        @click="handleDownload"
      >
        Download
      </n-button>
    </n-form>
  </n-modal>
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
