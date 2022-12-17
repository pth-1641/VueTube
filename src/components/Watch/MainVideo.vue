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
  NSwitch,
  useMessage,
} from 'naive-ui';
import { useRouter, useRoute } from 'vue-router';
import { formatCommaViews, formatViews } from '../../utils/format-view-count';
import { renderHTML } from '../../utils/render-html';
import axios from 'axios';
import { ref, h } from 'vue';
import {
  ThumbsUp,
  ThumbsDown,
  CheckmarkFilled,
  PageLast,
  Download,
  Music,
  VideoFilled,
  VideoOffFilled,
} from '@vicons/carbon';
import CustomVideoPlayer from './CustomVideoPlayer.vue';
import { useAuth } from '../../stores/AuthProvider';

const message = useMessage();
const route = useRoute();
const router = useRouter();
const { video, startTimeChapter } = defineProps(['video', 'startTimeChapter']);
const emit = defineEmits(['time-update']);
const onlyAudio = ref(false);
const authProvider = useAuth();
const showModal = ref(false);
const optionValue = ref('mp3');
const downloadLink = ref();
const downloadInfo = ref({});

const mp3Options = video.audioStreams.sort(
  (a, b) => parseInt(b.quality) - parseInt(a.quality)
);

const mp4Options = video.videoStreams
  ?.filter((video) => !video.videoOnly)
  .sort((a, b) => parseInt(b.quality) - parseInt(a.quality));

const resetDefault = () => {
  downloadInfo.value = {};
  downloadLink.value = null;
  optionValue.value = 'mp3';
};

const handleUpdateSelectedDetail = (value) => {
  const selectedType = optionValue.value === 'mp3' ? mp3Options : mp4Options;
  const index = selectedType.findIndex((option) => option.url === value);
  downloadInfo.value = selectedType[index];
  downloadLink.value = value;
};

const handleSelectDownloadOption = (e) => {
  optionValue.value = e.target.value;
  downloadInfo.value = {};
  downloadLink.value = null;
};

const handleDownload = async () => {
  window.open(downloadLink.value);
  showModal.value = false;
  resetDefault();
};

const handleSubscribe = async (channelId) => {
  const uid = authProvider.userId;
  const { error } = await authProvider.subscribeChannel({ uid, channelId });
  if (error) message.error(error.message);
};

const handleUnsubscribe = async (channelId) => {
  const listChannel = authProvider.subscribedChannels;
  const index = listChannel.findIndex((c) => c.channel_id === channelId);
  const { error } = await authProvider.unsubscribeChannel(
    listChannel[index].id
  );
  if (error) message.error(error.message);
};

const getUpdateTime = ({ currentTime }) => {
  emit('time-update', { currentTime });
};

const checkSubscribe = (channelId) => {
  return (
    authProvider.subscribedChannels.findIndex(
      (c) => c.channel_id === channelId
    ) > -1
  );
};

const getNextVideo = async () => {
  if (route.query.list) {
    const currentIndex = route.query.index ?? 1;
    const playlistId = route.query.list;
    const { data } = await axios.get(`/playlists/${playlistId} `);
    const nextVideoUrl = data.relatedStreams[currentIndex].url;
    return `${nextVideoUrl}&list=${playlistId}&index=${+currentIndex + 1}`;
  }
  const videos = video.relatedStreams.filter((v) => v.type === 'stream');
  return videos[Math.floor(Math.random() * videos.length)].url;
};
</script>

<template>
  <template v-if="video.livestream">
    <iframe
      :style="{ width: '100%', aspectRatio: '16/9', borderRadius: '8px' }"
      :src="`https://www.youtube-nocookie.com/embed/${route.query.v}?autoplay=1&amp;modestbranding=1`"
      frameborder="0"
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
      allowfullscreen
    />
  </template>
  <template v-else>
    <CustomVideoPlayer
      :audioStreams="video.audioStreams"
      :videoStreams="video.videoStreams"
      :nextVideo="getNextVideo"
      :duration="video.duration"
      :thumbnail="video.thumbnailUrl"
      :onlyAudio="onlyAudio"
      :subtitles="video.subtitles"
      :startTimeChapter="startTimeChapter"
      @time-update="getUpdateTime"
    />
  </template>
  <n-h3 :style="{ margin: 0, fontSize: '19px', marginTop: '6px' }">
    {{ video.title }}
  </n-h3>
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
      <template v-if="checkSubscribe(video.uploaderUrl.split('/')[2])">
        <n-button
          :style="{ fontWeight: 600 }"
          @click="handleUnsubscribe(video.uploaderUrl.split('/')[2])"
        >
          Subscribed
        </n-button>
      </template>
      <template v-else>
        <n-button
          type="success"
          :style="{ fontWeight: 600 }"
          @click="handleSubscribe(video.uploaderUrl.split('/')[2])"
        >
          Subscribe
        </n-button>
      </template>
    </n-space>
  </n-space>
  <n-space
    align="center"
    justify="space-between"
    :style="{ marginTop: '12px' }"
  >
    <n-text code :style="{ marginTop: '8px' }">
      {{ formatCommaViews(video.views) }}
      {{ video.livestream ? 'watching' : 'views' }} |
      {{ video.uploadDate?.split('-').reverse().join('-') }}
    </n-text>
    <template v-if="!video.livestream">
      <n-space align="center">
        <n-switch
          @update:value="onlyAudio = !onlyAudio"
          @click="
            message.success(`Audio is ${onlyAudio ? 'on' : 'off'}`, {
              icon: () => h(NIcon, null, { default: () => h(Music) }),
            })
          "
        >
          <template #checked-icon>
            <n-icon :component="VideoOffFilled" />
          </template>
          <template #unchecked-icon>
            <n-icon :component="VideoFilled" />
          </template>
        </n-switch>
        <n-button round @click="showModal = true">
          <template #icon>
            <n-icon :component="Download" />
          </template>
          Download
        </n-button>
      </n-space>
    </template>
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
