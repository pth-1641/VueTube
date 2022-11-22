<script setup>
import {
  NSpace,
  NText,
  NIcon,
  NSlider,
  NTooltip,
  NSwitch,
  NProgress,
} from 'naive-ui';
import {
  PlayFilledAlt,
  SkipBackFilled,
  SkipForwardFilled,
  ClosedCaption,
  Settings,
  BringToFront,
  Maximize,
  VolumeUpFilled,
  PauseFilled,
  VolumeMuteFilled,
} from '@vicons/carbon';
import { convertTimer } from '../../utils/convert-timer';
import { ref, markRaw, onBeforeUnmount, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const {
  audioStreams,
  videoStreams,
  duration,
  nextVideo,
  thumbnail,
  onlyAudio,
} = defineProps([
  'audioStreams',
  'videoStreams',
  'duration',
  'nextVideo',
  'thumbnail',
  'onlyAudio',
]);

const leftOptions = markRaw({
  Play: {
    icon: PlayFilledAlt,
    isShow: true,
  },
  Pause: {
    icon: PauseFilled,
    isShow: false,
  },
  Next: {
    icon: SkipForwardFilled,
    isShow: true,
  },
  Mute: {
    icon: VolumeUpFilled,
    isShow: localStorage.volume ? true : false,
  },
  Unmute: {
    icon: VolumeMuteFilled,
    isShow: localStorage.volume ? false : true,
  },
});

const rightOptions = markRaw({
  'Subtitles/Closed Captions': {
    icon: ClosedCaption,
    isShow: true,
  },
  Settings: {
    icon: Settings,
    isShow: true,
  },
  Miniplayer: {
    icon: BringToFront,
    isShow: document.pictureInPictureEnabled && !onlyAudio,
  },
  'Full screen': {
    icon: Maximize,
    isShow: true,
  },
});

const route = useRoute();
const router = useRouter();
const videoRef = ref();
const audioRef = ref();
const playedTime = ref(0);
const volume = ref(+localStorage.volume ?? 100);
const autoNextVideo = ref(true);
const displayTimeoutProgress = ref(false);
const timeoutPercent = ref(0);
const videoProgressInterval = ref();

const videos = videoStreams
  .filter((v) => v.videoOnly)
  .sort((a, b) => parseInt(b.quality) - parseInt(a.quality));

const qualities = [
  ...new Map(videos.map((v) => [parseInt(v['quality']), v])).values(),
];

const audioFile = audioStreams.sort(
  (a, b) => parseInt(b.quality) - parseInt(a.quality)
)[0];

const handleControlsClick = (type) => {
  switch (type) {
    case 'play':
      play();
      break;
    case 'pause':
      pause();
      break;
    case 'next':
      router.push(nextVideo.url);
      break;
    case 'mute':
      mute();
      break;
    case 'unmute':
      unmute();
      break;
    case 'miniplayer':
      videoRef.value.requestPictureInPicture();
      break;
    case 'full screen':
      videoRef.value.requestFullscreen();
      break;
    default:
      return;
  }
};

const play = () => {
  audioRef.value.play();
  if (!onlyAudio) videoRef.value.play();
  leftOptions['Play'].isShow = false;
  leftOptions['Pause'].isShow = true;
};

const pause = () => {
  audioRef.value.pause();
  if (!onlyAudio) videoRef.value.pause();
  leftOptions['Play'].isShow = true;
  leftOptions['Pause'].isShow = false;
};

const mute = () => {
  audioRef.value.muted = true;
  leftOptions['Mute'].isShow = false;
  leftOptions['Unmute'].isShow = true;
  volume.value = 0;
};

const unmute = () => {
  audioRef.value.muted = false;
  leftOptions['Mute'].isShow = true;
  leftOptions['Unmute'].isShow = false;
  volume.value = parseInt(audioRef.volume * 100);
};

const handleTimeUpdate = () => {
  playedTime.value = Math.round(audioRef.value.currentTime);
  if (!onlyAudio) {
    videoRef.value.currentTime = audioRef.value.currentTime;
  }
};

// Timeline
const handleChangeVideoDuration = (time) => {
  displayTimeoutProgress.value = false;
  timeoutPercent.value = 0;
  clearInterval(videoProgressInterval.value);
  const isPause = audioRef.value.paused;
  audioRef.value.currentTime = time;
  if (!isPause) play();
};

// Volume
const handleChangeVolume = (selectedVolume) => {
  localStorage.volume = selectedVolume;
  audioRef.value.volume = selectedVolume / 100;
  if (selectedVolume <= 0) {
    leftOptions['Mute'].isShow = false;
    leftOptions['Unmute'].isShow = true;
    return;
  }
  audioRef.value.muted = false;
  leftOptions['Mute'].isShow = true;
  leftOptions['Unmute'].isShow = false;
};

// Next video
const handleAutoNextVideo = () => {
  document.exitPictureInPicture();
  if (autoNextVideo.value) {
    displayTimeoutProgress.value = true;
    videoProgressInterval.value = setInterval(() => {
      timeoutPercent.value += 20;
      if (timeoutPercent.value > 100) router.push(nextVideo.url);
    }, 1000);
  }
};

// Click video
const handleClickVideo = () => {
  const isVideoPlaying = !audioRef.value.paused;
  isVideoPlaying ? pause() : play();
};

onMounted(() => {
  audioRef.value.volume = volume.value / 100;
});

onBeforeUnmount(() => clearInterval(videoProgressInterval.value));
</script>

<template>
  <n-text
    tag="div"
    :style="{
      background: '#000',
      borderRadius: '8px',
      overflow: 'hidden',
      aspectRatio: '16/9',
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }"
  >
    <template v-if="onlyAudio">
      <img :src="thumbnail" :style="{ height: '100%' }" />
    </template>
    <template v-else>
      <video
        ref="videoRef"
        :src="qualities[2].url"
        :style="{ height: '100%' }"
        type="video/*"
        preload
        @ended="handleAutoNextVideo"
        @pause="pause()"
        @play="play()"
      />
    </template>
    <audio
      ref="audioRef"
      :src="audioFile.url"
      type="audio/*"
      @timeupdate="handleTimeUpdate"
      preload
    />
    <n-text
      tag="div"
      :style="{
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        inset: 0,
      }"
      id="player-controls"
    >
      <n-text
        tag="div"
        :style="{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }"
        @click="handleClickVideo"
      >
        <template v-if="displayTimeoutProgress">
          <n-progress
            type="circle"
            status="success"
            :percentage="timeoutPercent"
          >
            <n-icon :component="SkipForwardFilled" color="#fff" :size="50" />
          </n-progress>
        </template>
      </n-text>
      <!-- Controls -->
      <n-text
        tag="div"
        :style="{
          padding: '0 10px 12px',
          backgroundImage:
            'linear-gradient(to top, rgba(0,0,0,0.5),rgba(0,0,0,0))',
        }"
      >
        <n-slider
          v-model:value="playedTime"
          :max="duration"
          :format-tooltip="(time) => `${convertTimer(time)}`"
          :on-update-value="handleChangeVideoDuration"
        />
        <n-space
          align="center"
          justify="space-between"
          :style="{ margin: '6px 18px 0' }"
        >
          <n-text
            :style="{ display: 'flex', alignItems: 'center', gap: '20px' }"
          >
            <!-- Left -->
            <template v-if="route.query.list && route.query.index">
              <n-tooltip :show-arrow="false">
                <template #trigger>
                  <n-icon
                    :component="SkipBackFilled"
                    :size="20"
                    :style="{ cursor: 'pointer' }"
                    color="#fff"
                    @click="handleControlsClick('previous')"
                  />
                </template>
                Previous
              </n-tooltip>
            </template>

            <template v-for="option in Object.keys(leftOptions)">
              <template v-if="leftOptions[option].isShow">
                <n-tooltip :show-arrow="false">
                  <template #trigger>
                    <n-icon
                      :component="leftOptions[option].icon"
                      :size="20"
                      :style="{ cursor: 'pointer' }"
                      color="#fff"
                      @click="handleControlsClick(option.toLocaleLowerCase())"
                    />
                  </template>
                  {{ option }}
                </n-tooltip>
              </template>
            </template>
            <n-slider
              v-model:value="volume"
              :on-update-value="handleChangeVolume"
              :style="{ width: '60px' }"
              :tooltip="false"
            />
            <n-text
              :style="{
                color: '#fff',
                fontSize: '12px',
                minWidth: 'max-content',
              }"
            >
              {{ convertTimer(playedTime) + ' / ' + convertTimer(duration) }}
            </n-text>
          </n-text>
          <n-text
            :style="{ display: 'flex', alignItems: 'center', gap: '20px' }"
          >
            <n-switch
              size="small"
              v-model:value="autoNextVideo"
              @update:value="(v) => (autoNextVideo = v)"
            >
              <template #checked-icon>
                <n-icon :component="PlayFilledAlt" color="#000" />
              </template>
              <template #unchecked-icon>
                <n-icon :component="PauseFilled" color="#000" />
              </template>
            </n-switch>
            <!-- Right -->
            <template v-for="option in Object.keys(rightOptions)">
              <template v-if="rightOptions[option].isShow">
                <n-tooltip :show-arrow="false">
                  <template #trigger>
                    <n-icon
                      :component="rightOptions[option].icon"
                      :size="20"
                      :style="{ cursor: 'pointer' }"
                      color="#fff"
                      @click="handleControlsClick(option.toLocaleLowerCase())"
                    />
                  </template>
                  {{ option }}
                </n-tooltip>
              </template>
            </template>
          </n-text>
        </n-space>
      </n-text>
    </n-text>
  </n-text>
</template>

<style scoped>
video::-webkit-media-controls {
  display: none !important;
}

video::-webkit-media-controls-enclosure {
  display: none !important;
}

#player-controls {
  opacity: 0;
  transition: opacity 0.2s ease;
}

#player-controls:hover {
  opacity: 1;
}
</style>
