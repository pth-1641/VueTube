<script setup>
import {
  NSpace,
  NText,
  NIcon,
  NSlider,
  NTooltip,
  NSwitch,
  NProgress,
  NCard,
  NTabs,
  NTabPane,
  NList,
  NListItem,
  NTag,
  NScrollbar,
  NSpin,
  NButton,
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
  Carbon4K,
  EdgeEnhancement02,
  Checkmark,
  RepeatOne,
  Minimize,
} from '@vicons/carbon';
import { convertTimer } from '../../utils/convert-timer';
import {
  ref,
  onBeforeUnmount,
  onMounted,
  h,
  watch,
  reactive,
  markRaw,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { xmlToSubtitle } from '../../utils/xml-to-subtitle';
import axios from 'axios';

const {
  audioStreams,
  videoStreams,
  duration,
  nextVideo,
  thumbnail,
  onlyAudio,
  subtitles,
  startTimeChapter,
} = defineProps([
  'audioStreams',
  'videoStreams',
  'duration',
  'nextVideo',
  'thumbnail',
  'onlyAudio',
  'subtitles',
  'startTimeChapter',
]);

const emit = defineEmits(['time-update']);

const leftOptions = reactive({
  Play: {
    icon: markRaw(PlayFilledAlt),
    isShow: false,
    key: 'k',
  },
  Pause: {
    icon: markRaw(PauseFilled),
    isShow: true,
    key: 'k',
  },
  Next: {
    icon: markRaw(SkipForwardFilled),
    isShow: true,
    key: 'n',
  },
  Mute: {
    icon: markRaw(VolumeUpFilled),
    isShow: !(localStorage.muted === 'true'),
    key: 'm',
  },
  Unmute: {
    icon: markRaw(VolumeMuteFilled),
    isShow: localStorage.muted === 'true',
    key: 'm',
  },
});

const rightOptions = reactive({
  Settings: {
    icon: markRaw(Settings),
    isShow: true,
  },
  Miniplayer: {
    icon: markRaw(BringToFront),
    isShow: document.pictureInPictureEnabled,
    key: 'i',
  },
  'Full screen': {
    icon: markRaw(Maximize),
    isShow: true,
    key: 'f',
  },
  'Exit full screen': {
    icon: markRaw(Minimize),
    isShow: false,
    key: 'f',
  },
});

let videoProgressInterval = null;
let mouseMoveTimeout = null;

const route = useRoute();
const router = useRouter();
const videoRef = ref();
const audioRef = ref();
const playedTime = ref(0);
const volume = ref(localStorage.volume ? +localStorage.volume : 100);
const autoNextVideo = ref(localStorage.autoplay ?? true);
const timeoutPercent = ref(0);
const selectedQuality = ref(localStorage['resolution'] || '720p');
const selectedSubtitle = ref('off');
const subtitleCollection = ref();
const subtitleContent = ref('');
const playerStatus = ref('play');
const isRepeat = ref(false);
const isSeeking = ref(false);

const videoUrl = (streams, quality) => {
  const sortedStreams = streams
    .filter((s) => s.format === 'WEBM' && s.videoOnly)
    .sort((a, b) => parseInt(b.quality) - parseInt(a.quality));
  const video =
    sortedStreams.find((s) => s.quality.includes(quality)) || sortedStreams[0];
  selectedQuality.value = video.quality;
  return video.url;
};

const audioUrl = (audios) => {
  const bestAudioQuality = audios.sort((a, b) => b.bitrate - a.bitrate)[0];
  return bestAudioQuality.url;
};

const qualities = (streams) => {
  const qualities = streams
    .filter((s) => s.format === 'WEBM')
    .sort((a, b) => parseInt(b.height) - parseInt(a.height));
  const removeDuplicate = [
    ...new Map(qualities.map((q) => [parseInt(q['quality']), q])).values(),
  ];
  return removeDuplicate;
};

const closeSettings = () => {
  document
    .querySelector('#setting-controls')
    .classList.remove('settings-active');
  document
    .querySelector('#player-controls')
    .classList.remove('settings-active');
};

// Controls
const handleControlsClick = async (type) => {
  switch (type) {
    case 'play':
      // if (playerStatus.value === 'loading') return;
      togglePlay('play');
      break;
    case 'pause':
      togglePlay('pause');
      break;
    case 'previous':
      router.push(await previousVideo());
      break;
    case 'next':
      router.push(await nextVideo());
      break;
    case 'mute':
      toggleMute('mute');
      break;
    case 'unmute':
      toggleMute('unmute');
      break;
    case 'settings':
      openSettingOptions();
      break;
    case 'miniplayer':
      togglePip();
      break;
    case 'full screen':
      document.querySelector('body').requestFullscreen();
      toggleFullScreen('maximize');
      break;
    case 'exit full screen':
      document.exitFullscreen();
      toggleFullScreen('minimize');
      break;
    default:
      return;
  }
};

const togglePlay = (status) => {
  playerStatus.value = status;
  audioRef.value?.[status]();
  videoRef.value?.[status]();
  leftOptions['Play'].isShow = status !== 'play';
  leftOptions['Pause'].isShow = status === 'play';
};

const toggleMute = (status) => {
  localStorage.muted = status === 'mute';
  localStorage.volume = status === 'mute' ? 0 : audioRef.value.volume;
  audioRef.value.muted = status === 'mute';
  leftOptions['Mute'].isShow = status !== 'mute';
  leftOptions['Unmute'].isShow = status === 'mute';
  audioRef.value.volume = audioRef.value.volume || 1;
  volume.value = status === 'mute' ? 0 : parseInt(audioRef.value.volume * 100);
};

const toggleFullScreen = (status) => {
  rightOptions['Full screen'].isShow = status !== 'maximize';
  rightOptions['Exit full screen'].isShow = status === 'maximize';
  rightOptions['Miniplayer'].isShow = status !== 'maximize';
  if (status === 'maximize') {
    if (document.pictureInPictureElement) {
      document.exitPictureInPicture();
    }
    document.querySelector('#player-wrapper').classList.add('full-screen');
    return;
  }
  document.querySelector('#player-wrapper').classList.remove('full-screen');
};

const togglePip = () => {
  if (
    document.querySelector('#player-wrapper').classList.contains('full-screen')
  ) {
    return;
  }
  document.pictureInPictureElement
    ? document.exitPictureInPicture()
    : videoRef.value.requestPictureInPicture();
};

const openSettingOptions = () => {
  document
    .querySelector('#setting-controls')
    .classList.toggle('settings-active');
  document
    .querySelector('#player-controls')
    .classList.toggle('settings-active');
};

const previousVideo = async () => {
  if (!route.query.list) return;
  const currentIndex = route.query.index;
  const playlistId = route.query.list;
  const { data } = await axios.get(`/playlists/${playlistId} `);
  const nextVideoUrl = data.relatedStreams[currentIndex].url;
  return `${nextVideoUrl}&list=${playlistId}&index=${+currentIndex - 1}`;
};

// Select quality
const handleSelectQuality = (quality) => {
  selectedQuality.value = quality;
  videoUrl(videoStreams, quality);
  closeSettings();
};

// Volume
const handleChangeVolume = (selectedVolume) => {
  localStorage.volume = selectedVolume;
  audioRef.value.volume = selectedVolume / 100;
  if (selectedVolume <= 0) {
    localStorage.muted = true;
    leftOptions['Mute'].isShow = false;
    leftOptions['Unmute'].isShow = true;
    return;
  }
  audioRef.value.muted = false;
  localStorage.muted = false;
  leftOptions['Mute'].isShow = true;
  leftOptions['Unmute'].isShow = false;
};

// Select video playback rate
const handleSelectPlaybackRate = (playbackRate) => {
  videoRef.value.playbackRate = playbackRate;
  audioRef.value.playbackRate = playbackRate;
  closeSettings();
};

// Select subtitle
const handleSelectSubtitle = async (sub) => {
  closeSettings();
  selectedSubtitle.value = sub;
  if (sub === 'off') {
    subtitleCollection.value = null;
    return;
  }
  const res = await fetch(sub.url);
  subtitleCollection.value = xmlToSubtitle(await res.text());
};

// Timeline
const handleTimeUpdate = () => {
  emit('time-update', { currentTime: Math.round(audioRef.value?.currentTime) });
  playedTime.value = Math.round(audioRef.value?.currentTime);
  if (videoRef.value) {
    if (
      Math.abs(videoRef.value.currentTime - audioRef.value.currentTime) > 0.1
    ) {
      videoRef.value.currentTime = audioRef.value.currentTime;
    }
  }
  if (selectedSubtitle.value !== 'off') {
    const currentSub = subtitleCollection.value?.findIndex(
      (s) =>
        s.startTime <= playedTime.value + 0.5 && s.endTime > playedTime.value
    );
    if (currentSub > -1) {
      subtitleContent.value = subtitleCollection.value[currentSub].text;
    } else {
      subtitleContent.value = '';
    }
  }
};

const handleChangeVideoDuration = (time) => {
  timeoutPercent.value = 0;
  clearInterval(videoProgressInterval);
  audioRef.value.currentTime = time;
};

// Video ended
const handleVideoEnded = () => {
  if (isRepeat.value) {
    togglePlay('play');
    return;
  }
  togglePlay('pause');
  if (!autoNextVideo.value) return;
  document.querySelector('#player-status').classList.add('show-controls');
  document.querySelector('#player-controls').classList.add('show-controls');
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture();
  }
  playerStatus.value = 'next-video';
  videoProgressInterval = setInterval(async () => {
    timeoutPercent.value += 20;
    if (timeoutPercent.value > 100) {
      router.push(await nextVideo());
      playerStatus.value = 'play';
    }
  }, 1000);
};

// Click video
const handleClickVideo = () => {
  if (playerStatus.value === 'loading') return;
  const isVideoPlaying = !audioRef.value.paused;
  isVideoPlaying ? togglePlay('pause') : togglePlay('play');
};

const handleLoadingMetaData = () => {
  audioRef.value?.pause();
  videoRef.value?.pause();
  playerStatus.value = 'loading';
};

const handlePlayBuffer = () => {
  if (playerStatus.value === 'pause') return;
  togglePlay('play');
};

const handleEventPip = (event) => {
  if (!document.pictureInPictureElement) return;
  togglePlay(event);
};

const mouseEvent = () => {
  document.addEventListener('mousemove', () => {
    document.body.style.cursor = 'default';
    document.querySelector('#player-status')?.classList.remove('hide-controls');
    clearTimeout(mouseMoveTimeout);
    mouseMoveTimeout = setTimeout(() => {
      document.body.style.cursor = 'none';
      document.querySelector('#player-status')?.classList.add('hide-controls');
    }, 3000);
  });
};

const keyBinding = () => {
  document.addEventListener('fullscreenchange', () => {
    const isFullScreen = document.fullscreenElement !== null;
    !isFullScreen ? toggleFullScreen('minimize') : toggleFullScreen('maximize');
  });
  window.addEventListener('keyup', async (e) => {
    if (e.target.nodeName.toLowerCase() === 'input') return;
    const key = e.key;
    const numberKeys = !Number.isNaN(parseInt(key));
    if (numberKeys) {
      handleChangeVideoDuration((duration / 10) * key);
      return;
    }
    if (key === 'k' || key === ' ') {
      handleClickVideo();
    }
    if (key === 'm') {
      const isMuted = audioRef.value?.muted;
      isMuted ? toggleMute('unmute') : toggleMute('mute');
    }
    if (key === 'p') {
      router.push(await previousVideo());
    }
    if (key === 'n') {
      router.push(await nextVideo());
    }
    if (key === 'l') {
      isRepeat.value = !isRepeat.value;
    }
    if (key === 'i') {
      togglePip();
    }
    if (key === 'f') {
      const isFullScreen = document.fullscreenElement !== null;
      isFullScreen
        ? document.exitFullscreen()
        : document.querySelector('body').requestFullscreen();
    }
    if (key === 'ArrowRight') {
      const bonusTime = parseInt(localStorage.seek ?? 5);
      handleChangeVideoDuration(playedTime.value + bonusTime);
    }
    if (key === 'ArrowLeft') {
      const bonusTime = parseInt(localStorage.seek ?? 5);
      handleChangeVideoDuration(playedTime.value - bonusTime);
    }
  });
};

const handleAutoPlayNextVideo = (v) => {
  autoNextVideo.value = v;
  localStorage.autoplay = v;
};

onMounted(() => {
  audioRef.value.volume = volume.value / 100;
  // Autoplay when exit PIP
  document.addEventListener('leavepictureinpicture', () => {
    const isPause = videoRef.value?.paused;
    if (!isPause && !videoRef.value?.ended) {
      setTimeout(() => {
        togglePlay('play');
      }, 50);
    }
  });
  mouseEvent();
  keyBinding();
});

onBeforeUnmount(() => {
  clearInterval(videoProgressInterval);
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture();
  }
  clearTimeout(mouseMoveTimeout);
});

watch(route, () => {
  clearInterval(videoProgressInterval);
  selectedSubtitle.value = 'off';
  timeoutPercent.value = 0;
  videoProgressInterval = null;
  subtitleCollection.value = null;
  document.querySelector('#player-status').classList.remove('show-controls');
  document.querySelector('#player-controls').classList.remove('show-controls');
});
</script>

<template>
  <n-text
    id="player-wrapper"
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
    <template v-if="subtitleContent && selectedSubtitle !== 'off'">
      <n-tag
        :bordered="false"
        :style="{
          position: 'absolute',
          bottom: '65px',
          right: '50%',
          transform: 'translateX(50%)',
          width: 'max-content',
          pointerEvents: 'none',
          textTransform: 'lowercase',
        }"
      >
        <span v-html="subtitleContent" />
      </n-tag>
    </template>
    <template v-if="onlyAudio">
      <img :src="thumbnail" :style="{ height: '100%' }" />
    </template>
    <template v-else>
      <video
        ref="videoRef"
        :src="videoUrl(videoStreams, selectedQuality)"
        type="video/*"
        :style="{ height: '100%' }"
        @ended="handleVideoEnded"
        @pause="handleEventPip('pause')"
        @play="handleEventPip('play')"
        @waiting="handleLoadingMetaData"
        @canplay="handlePlayBuffer"
      />
    </template>
    <audio
      ref="audioRef"
      :src="audioUrl(audioStreams)"
      type="audio/*"
      :muted="isSeeking"
      @waiting="handleLoadingMetaData"
      @timeupdate="handleTimeUpdate"
      @seeking="isSeeking = true"
      @seeked="isSeeking = false"
      @canplay="handlePlayBuffer"
    />
    <n-text
      tag="div"
      :style="{
        display: 'flex',
        flexDirection: 'column',
        position: 'absolute',
        inset: 0,
      }"
    >
      <n-text
        tag="div"
        :style="{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }"
        id="player-status"
        @click="handleClickVideo"
      >
        <template v-if="playerStatus === 'loading'">
          <n-spin :size="70" :stroke-width="15" />
        </template>
        <template v-else-if="playerStatus === 'pause'">
          <n-icon :component="PlayFilledAlt" :size="100" color="#fff" />
        </template>
        <template v-else-if="playerStatus === 'next-video'">
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
          position: 'relative',
          padding: '0 10px 12px',
          backgroundImage:
            'linear-gradient(to top, rgba(0,0,0,0.5),rgba(0,0,0,0))',
        }"
        id="player-controls"
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
            <template v-if="route.query.list">
              <n-tooltip :show-arrow="false">
                <template #trigger>
                  <n-button
                    @click="handleControlsClick('previous')"
                    text
                    :disabled="route.query.index === '1' || !route.query.index"
                  >
                    <n-icon
                      :component="SkipBackFilled"
                      :size="20"
                      :style="{ cursor: 'pointer' }"
                      color="#fff"
                    />
                  </n-button>
                </template>
                Previous (p)
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
                  {{ `${option} (${leftOptions[option]?.key})` }}
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
            <n-tooltip :show-arrow="false">
              <template #trigger>
                <n-switch
                  size="small"
                  v-model:value="autoNextVideo"
                  @update:value="handleAutoPlayNextVideo"
                >
                  <template #checked-icon>
                    <n-icon :component="PlayFilledAlt" color="#000" />
                  </template>
                  <template #unchecked-icon>
                    <n-icon :component="PauseFilled" color="#000" />
                  </template>
                </n-switch>
              </template>
              Autoplay is {{ autoNextVideo ? 'on' : 'off' }}
            </n-tooltip>
            <n-tooltip :show-arrow="false">
              <template #trigger>
                <n-button
                  text
                  :focusable="false"
                  :text-color="isRepeat ? '#63e2b7' : '#fff'"
                  @click="isRepeat = !isRepeat"
                >
                  <n-icon :component="RepeatOne" :size="20" />
                </n-button>
              </template>
              Loop (l)
            </n-tooltip>
            <!-- Right -->
            <template v-for="option in Object.keys(rightOptions)">
              <template v-if="rightOptions[option].isShow">
                <n-tooltip
                  :show-arrow="false"
                  :style="{ opacity: option === 'Settings' && 0 }"
                >
                  <template #trigger>
                    <n-button
                      text
                      :disabled="onlyAudio"
                      @click="handleControlsClick(option.toLocaleLowerCase())"
                    >
                      <n-icon
                        :component="rightOptions[option].icon"
                        :size="20"
                        color="#fff"
                      />
                    </n-button>
                  </template>
                  {{
                    option === 'Settings'
                      ? option
                      : `${option} (${rightOptions[option].key})`
                  }}
                </n-tooltip>
              </template>
            </template>
            <!-- Setting options -->
            <template v-if="!onlyAudio">
              <n-card
                id="setting-controls"
                size="small"
                :bordered="false"
                :style="{
                  position: 'absolute',
                  bottom: '60px',
                  right: '10px',
                  width: 'max-content',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(0,0,0,0.85)',
                  opacity: 0,
                  pointerEvents: 'none',
                  transition: 'opacity 0.2s ease',
                }"
              >
                <n-tabs
                  type="line"
                  animated
                  size="small"
                  :tab-style="{
                    padding: '5px 12px',
                    color: '#fff',
                  }"
                >
                  <n-tab-pane
                    name="quality"
                    :tab="
                      () =>
                        h(NIcon, { size: 20 }, { default: () => h(Carbon4K) })
                    "
                  >
                    <n-list
                      :show-divider="false"
                      hoverable
                      clickable
                      :style="{
                        backgroundColor: 'transparent',
                        fontSize: '12px',
                      }"
                    >
                      <n-scrollbar :style="{ maxHeight: '250px' }">
                        <template v-for="quality in qualities(videoStreams)">
                          <n-list-item :style="{ padding: 0 }">
                            <n-text
                              tag="div"
                              :style="{
                                padding: '8px',
                                display: 'flex',
                                color: '#fff',
                                alignItems: 'center',
                                gap: '6px',
                              }"
                              @click="handleSelectQuality(quality.quality)"
                            >
                              <n-icon
                                :component="Checkmark"
                                size="16"
                                :style="{
                                  opacity:
                                    parseInt(quality.quality) ===
                                    parseInt(selectedQuality)
                                      ? 1
                                      : 0,
                                }"
                              />
                              {{ quality.quality }}
                            </n-text>
                          </n-list-item>
                        </template>
                      </n-scrollbar>
                    </n-list>
                  </n-tab-pane>
                  <n-tab-pane
                    name="playback-rate"
                    :tab="
                      () =>
                        h(
                          NIcon,
                          { size: 20 },
                          { default: () => h(EdgeEnhancement02) }
                        )
                    "
                  >
                    <n-list
                      :show-divider="false"
                      hoverable
                      clickable
                      :style="{
                        backgroundColor: 'transparent',
                        fontSize: '12px',
                      }"
                    >
                      <n-scrollbar :style="{ maxHeight: '250px' }">
                        <template
                          v-for="playbackRate in [1, 2, 3, 4, 5, 6, 7, 8]"
                        >
                          <n-list-item :style="{ padding: 0 }">
                            <n-text
                              tag="div"
                              :style="{
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                color: '#fff',
                                gap: '6px',
                              }"
                              @click="
                                handleSelectPlaybackRate(playbackRate * 0.25)
                              "
                            >
                              <n-icon
                                :component="Checkmark"
                                size="16"
                                :style="{
                                  opacity:
                                    playbackRate * 0.25 ===
                                    videoRef.playbackRate
                                      ? 1
                                      : 0,
                                }"
                              />
                              {{
                                0.25 * playbackRate === 1
                                  ? 'Normal'
                                  : 0.25 * playbackRate
                              }}
                            </n-text>
                          </n-list-item>
                        </template>
                      </n-scrollbar>
                    </n-list>
                  </n-tab-pane>
                  <n-tab-pane
                    name="captions"
                    :tab="
                      () =>
                        h(
                          NIcon,
                          { size: 20 },
                          { default: () => h(ClosedCaption) }
                        )
                    "
                  >
                    <n-list
                      :show-divider="false"
                      hoverable
                      clickable
                      :style="{
                        backgroundColor: 'transparent',
                        fontSize: '12px',
                      }"
                    >
                      <n-scrollbar :style="{ maxHeight: '250px' }">
                        <template v-for="sub in subtitles">
                          <n-list-item :style="{ padding: 0 }">
                            <n-text
                              tag="div"
                              :style="{
                                padding: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                color: '#fff',
                                gap: '6px',
                              }"
                              @click="handleSelectSubtitle(sub)"
                            >
                              <n-icon
                                :component="Checkmark"
                                size="16"
                                :style="{
                                  opacity:
                                    selectedSubtitle.code === sub.code &&
                                    selectedSubtitle.autoGenerated ===
                                      sub.autoGenerated
                                      ? 1
                                      : 0,
                                }"
                              />
                              {{ sub.name }}
                              <template v-if="sub.autoGenerated">
                                (auto-generated)
                              </template>
                            </n-text>
                          </n-list-item>
                        </template>
                        <n-list-item :style="{ padding: 0 }">
                          <n-text
                            tag="div"
                            :style="{
                              padding: '8px',
                              display: 'flex',
                              alignItems: 'center',
                              color: '#fff',
                              gap: '6px',
                            }"
                            @click="handleSelectSubtitle('off')"
                          >
                            <n-icon
                              :component="Checkmark"
                              size="16"
                              :style="{
                                opacity: selectedSubtitle === 'off' ? 1 : 0,
                              }"
                              @click=""
                            />
                            Off
                          </n-text>
                        </n-list-item>
                      </n-scrollbar>
                    </n-list>
                  </n-tab-pane>
                </n-tabs>
              </n-card>
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

.n-list-item:hover {
  background-color: rgba(255, 255, 255, 0.09) !important;
}

#player-controls {
  opacity: 0;
  transition: opacity 0.2s ease;
}

#player-status:hover + #player-controls,
#player-controls:hover {
  opacity: 1;
  pointer-events: all;
}

.settings-active {
  opacity: 1 !important;
  pointer-events: all !important;
}

.full-screen {
  position: fixed !important;
  inset: 0;
  z-index: 999;
}

.hide-controls:hover {
  opacity: 0;
  pointer-events: none;
}

.show-controls {
  opacity: 1;
}
</style>
