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
} from '@vicons/carbon';
import { convertTimer } from '../../utils/convert-timer';
import { ref, markRaw, onBeforeUnmount, onMounted, h } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { xmlToSubtitle } from '../../utils/xml-to-subtitle';

const {
  audioStreams,
  videoStreams,
  duration,
  nextVideo,
  thumbnail,
  onlyAudio,
  subtitles,
  startTimeChapter,
  isLive,
  hls,
} = defineProps([
  'audioStreams',
  'videoStreams',
  'duration',
  'nextVideo',
  'thumbnail',
  'onlyAudio',
  'subtitles',
  'startTimeChapter',
  'isLive',
  'hls',
]);

const emit = defineEmits(['time-update']);

const leftOptions = markRaw({
  Play: {
    icon: PlayFilledAlt,
    isShow: false,
  },
  Pause: {
    icon: PauseFilled,
    isShow: true,
  },
  Next: {
    icon: SkipForwardFilled,
    isShow: true,
  },
  Mute: {
    icon: VolumeUpFilled,
    isShow: localStorage.volume ?? true,
  },
  Unmute: {
    icon: VolumeMuteFilled,
    isShow: localStorage.volume > 0 ? false : true,
  },
});

const rightOptions = markRaw({
  Settings: {
    icon: Settings,
    isShow: true,
  },
  Miniplayer: {
    icon: BringToFront,
    isShow: document.pictureInPictureEnabled,
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
const volume = ref(localStorage.volume ? +localStorage.volume : 100);
const autoNextVideo = ref(true);
const timeoutPercent = ref(0);
const videoProgressInterval = ref();
const selectedQuality = ref('720p');
const selectedSubtitle = ref('off');
const subtitleCollection = ref();
const subtitleContent = ref('');
const playerStatus = ref('play');
const isRepeat = ref(false);
const isPlaying = ref(true);

const videoUrl = (streams, quality) => {
  const sortedStreams = streams
    .filter((s) => s.videoOnly)
    .sort((a, b) => parseInt(b.quality) - parseInt(a.quality));
  const video =
    sortedStreams.find((s) => s.videoOnly && s.quality === quality) ??
    sortedStreams[0];
  return video?.url ?? hls;
};

const audioUrl = (audios) => {
  const bestAudioQuality = audios.sort(
    (a, b) => parseInt(b.quality) - parseInt(a.quality)
  )[0];
  return bestAudioQuality?.url;
};

const qualities = (streams) => {
  return [...new Map(streams.map((v) => [parseInt(v['quality']), v])).values()];
};

// Controls
const handleControlsClick = (type) => {
  switch (type) {
    case 'play':
      togglePlay('play');
      break;
    case 'pause':
      togglePlay('pause');
      break;
    case 'next':
      router.push(nextVideo.url);
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
      videoRef.value.requestPictureInPicture();
      break;
    case 'full screen':
      videoRef.value.requestFullscreen();
      break;
    default:
      return;
  }
};

const togglePlay = (status) => {
  playerStatus.value = status;
  audioRef.value?.[status]();
  videoRef.value?.[status]();
  leftOptions['Play'].isShow = status === 'play' ? false : true;
  leftOptions['Pause'].isShow = status === 'play' ? true : false;
  volume.value = volume.value - 1;
  volume.value = volume.value + 1;
};

const toggleMute = (status) => {
  audioRef.value.muted = status === 'mute' ? true : false;
  leftOptions['Mute'].isShow = status === 'mute' ? false : true;
  leftOptions['Unmute'].isShow = status === 'mute' ? true : false;
  volume.value = status === 'mute' ? 0 : parseInt(audioRef.value.volume * 100);
};

const openSettingOptions = () => {
  document
    .querySelector('#setting-controls')
    .classList.toggle('settings-active');
  document
    .querySelector('#player-controls')
    .classList.toggle('settings-active');
};

// Timeline
const handleTimeUpdate = () => {
  emit('time-update', { currentTime: Math.round(audioRef.value?.currentTime) });
  playedTime.value = Math.round(audioRef.value?.currentTime);
  if (videoRef.value?.currentTime) {
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
  clearInterval(videoProgressInterval.value);
  audioRef.value.currentTime = time;
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

// Video ended
const handleVideoEnded = () => {
  togglePlay('pause');
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture();
  }
  if (isRepeat.value) {
    togglePlay('play');
    return;
  }
  document.querySelector('#player-status').style.opacity = 1;
  document.querySelector('#player-controls').style.opacity = 1;
  if (autoNextVideo.value) {
    playerStatus.value = 'next-video';
    videoProgressInterval.value = setInterval(() => {
      timeoutPercent.value += 1;
    }, 50);
    // if (timeoutPercent.value > 100) {
    //   router.push(nextVideo.url);
    //   playerStatus.value = 'play';
    //   togglePlay('play');
    // }
  }
};

// Click video
const handleClickVideo = () => {
  const isVideoPlaying = !audioRef.value.paused;
  isVideoPlaying ? togglePlay('pause') : togglePlay('play');
};

// Select quality
const handleSelectQuality = (quality) => {
  selectedQuality.value = quality;
  videoUrl(videoStreams, quality);
  document
    .querySelector('#setting-controls')
    .classList.remove('settings-active');
  document
    .querySelector('#player-controls')
    .classList.remove('settings-active');
};

// Select video playback rate
const handleSelectPlaybackRate = (playbackRate) => {
  videoRef.value.playbackRate = playbackRate;
  audioRef.value.playbackRate = playbackRate;
  document
    .querySelector('#setting-controls')
    .classList.remove('settings-active');
  document
    .querySelector('#player-controls')
    .classList.remove('settings-active');
};

// Select subtitle
const handleSelectSubtitle = async (sub) => {
  document
    .querySelector('#setting-controls')
    .classList.remove('settings-active');
  document
    .querySelector('#player-controls')
    .classList.remove('settings-active');
  selectedSubtitle.value = sub;
  if (sub === 'off') return;
  const res = await fetch(sub.url);
  subtitleCollection.value = xmlToSubtitle(await res.text());
};

const handleAutoPlay = () => {
  isPlaying.value ? togglePlay('play') : togglePlay('pause');
  playerStatus.value = isPlaying.value ? 'play' : 'pause';
};

const handleLoadingMetaData = () => {
  isPlaying.value = !audioRef.value.paused;
  togglePlay('pause');
  playerStatus.value = 'loading';
};

const handleEventPip = (event) => {
  if (!document.pictureInPictureElement) return;
  togglePlay(event);
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
});

onBeforeUnmount(() => {
  clearInterval(videoProgressInterval.value);
  if (document.pictureInPictureElement) {
    document.exitPictureInPicture();
  }
});
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
        :style="{ height: '100%' }"
        preload="metadata"
        muted
        :src="videoUrl(videoStreams, selectedQuality)"
        type="video/*"
        autoplay
        @canplay="handleAutoPlay"
        @waiting="handleLoadingMetaData"
        @ended="handleVideoEnded"
        @pause="handleEventPip('pause')"
        @play="handleEventPip('play')"
      />
    </template>
    <audio
      ref="audioRef"
      :src="audioUrl(audioStreams)"
      type="audio/*"
      preload="metadata"
      autoplay
      @timeupdate="handleTimeUpdate"
      @waiting="handleLoadingMetaData"
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
            <n-button
              text
              :focusable="false"
              :text-color="isRepeat ? '#63e2b7' : '#fff'"
              @click="isRepeat = !isRepeat"
            >
              <n-icon :component="RepeatOne" :size="20" />
            </n-button>
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
                  {{ option }}
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
                                    quality.quality === selectedQuality ? 1 : 0,
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
                                  playbackRate * 0.25 === videoRef.playbackRate
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
</style>
