<script setup>
import {
  NLayoutContent,
  NSpace,
  NLayout,
  NText,
  useLoadingBar,
  NSpin,
  NImage,
  NH3,
  NAvatar,
  NIcon,
  NTag,
  NEllipsis,
  NInput,
  NButton,
  NModal,
  NForm,
  NH1,
} from 'naive-ui';
import {
  CheckmarkFilled,
  WeatherStation,
  Search,
  TrashCan,
} from '@vicons/carbon';
import { onMounted, ref, onBeforeUnmount } from 'vue';
import { convertTimer } from '../utils/convert-timer';
import { useRouter } from 'vue-router';
import { resetString } from '../utils/render-html';
import { localDB } from '../utils/localDB';

const { clearAll } = localDB();
const router = useRouter();
const watchedVideos = ref([]);
const isLoading = ref(false);
const loadingBar = useLoadingBar();
const hasMore = ref(true);
const showModal = ref(false);
const historyQueryString = ref('');

const handleDeleteAllHistory = () => {
  clearAll();
  watchedVideos.value = [];
  showModal.value = false;
};

const getHistory = () => {
  const db = window.db;
  const tx = db.transaction('watch-history', 'readonly');
  const store = tx.objectStore('watch-history');
  const result = store.index('timestamp').getAll();
  result.onsuccess = (e) => {
    const query = historyQueryString.value.toLowerCase();
    const sortedVideos = e.target.result.reverse();
    const queriedVideos = sortedVideos.filter((v) => {
      const uploader = v.uploader.toLowerCase().includes(query);
      if (uploader) return true;
      const title = v.title.toLowerCase().includes(query);
      if (title) return true;
      return false;
    });
    if (query) {
      watchedVideos.value = queriedVideos;
    }
    const index = watchedVideos.value.length;
    const nextItems = queriedVideos.slice(index, index + 20);
    watchedVideos.value = [...watchedVideos.value, ...nextItems];
    loadingBar.finish();
  };
};

const nextHistoryItems = () => {
  const endOfPage =
    window.scrollY + window.innerHeight >= document.body.offsetHeight;
  if (!endOfPage || !hasMore.value) return;
  if (isLoading.value) return;
  try {
    isLoading.value = true;
    getHistory();
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  try {
    loadingBar.start();
    document.title = 'History | VueTube';
    getHistory();
  } catch (err) {
    loadingBar.error();
    console.error(err);
  }
  window.addEventListener('scroll', nextHistoryItems);
});

onBeforeUnmount(() => window.removeEventListener('scroll', nextHistoryItems));
</script>

<template>
  <n-layout :style="{ padding: '24px 0', minHeight: '100vh' }">
    <n-layout-content :style="{ maxWidth: '1120px', margin: 'auto' }">
      <n-modal
        v-model:show="showModal"
        :auto-focus="false"
        :mask-closable="false"
        transform-origin="center"
        preset="dialog"
        title="Clear watch history?"
        positive-text="Clear watch history"
        negative-text="Cancel"
        @positive-click="handleDeleteAllHistory"
        @negative-click="showModal = false"
      >
        <n-text tag="div" :style="{ margin: '25px 0' }">
          Your VueTube watch history will be cleared from this device.
          <n-text type="error" strong>This can't be restored</n-text>
        </n-text>
      </n-modal>
      <n-h1 :style="{ fontSize: '42px', textAlign: 'center' }">History</n-h1>
      <n-space
        align="center"
        justify="space-between"
        :style="{ marginBottom: '24px' }"
      >
        <n-button
          strong
          secondary
          type="primary"
          round
          @click="showModal = true"
        >
          <template #icon>
            <n-icon :component="TrashCan" />
          </template>
          Clear all watch history
        </n-button>
        <n-form
          :style="{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
          }"
          @submit.prevent="getHistory"
        >
          <n-input
            v-model:value="historyQueryString"
            clearable
            type="text"
            placeholder="Search watch history"
            @clear="getHistory"
          >
            <template #prefix>
              <n-icon :component="Search" />
            </template>
          </n-input>
        </n-form>
      </n-space>
      <n-space :size="15" :style="{ overflow: 'hidden' }" vertical>
        <template v-for="video in watchedVideos" :key="video.url">
          <n-space :wrap="false" :size="16" :style="{ cursor: 'pointer' }">
            <n-text
              tag="div"
              :style="{
                position: 'relative',
                height: '200px',
                backgroundColor: '#333',
                borderRadius: '8px',
                overflow: 'hidden',
              }"
              @click="router.push(video.url)"
            >
              <n-image :src="video.thumbnailUrl" preview-disabled width="360" />
              <template v-if="video.duration <= 0">
                <n-tag
                  :bordered="false"
                  size="small"
                  strong
                  :style="{
                    position: 'absolute',
                    bottom: '6px',
                    right: '6px',
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
                  :bordered="false"
                  size="small"
                  strong
                  :style="{
                    position: 'absolute',
                    bottom: '6px',
                    right: '6px',
                  }"
                >
                  {{ convertTimer(video.duration) }}
                </n-tag>
              </template>
            </n-text>
            <n-space vertical>
              <n-h3
                :style="{ marginBottom: 0 }"
                @click="router.push(video.url)"
              >
                {{ video.title }}
              </n-h3>
              <n-space align="center" @click="router.push(video.uploaderUrl)">
                <n-avatar
                  :src="video.uploaderAvatar"
                  round
                  size="small"
                  :style="{ display: 'flex' }"
                />
                <n-space align="center" size="small">
                  <n-text strong>
                    {{ video.uploader }}
                  </n-text>
                  <template v-if="video.uploaderVerified">
                    <n-icon
                      :component="CheckmarkFilled"
                      :style="{ display: 'flex', alignItems: 'center' }"
                    />
                  </template>
                </n-space>
              </n-space>
              <n-text italic @click="router.push(video.url)">
                <n-ellipsis :line-clamp="2" :tooltip="false">
                  {{ resetString(video.description) }}
                </n-ellipsis>
              </n-text>
            </n-space>
          </n-space>
        </template>
        <template v-if="isLoading">
          <n-space
            align="center"
            justify="center"
            :style="{ marginTop: '40px' }"
          >
            <n-spin :size="36" />
          </n-space>
        </template>
      </n-space>
    </n-layout-content>
  </n-layout>
</template>
