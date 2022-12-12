<script setup>
import {
  NSpace,
  NEllipsis,
  NText,
  NIcon,
  NAvatar,
  NButton,
  NSpin,
  NH6,
  NGrid,
  NGi,
  useMessage,
} from 'naive-ui';
import { CheckmarkFilled } from '@vicons/carbon';
import axios from 'axios';
import { onMounted, ref, onBeforeUnmount } from 'vue';
import { formatViews } from '../../utils/format-view-count';
import { useRouter } from 'vue-router';
import { getNextData } from '../../utils/get-next-data';
import { useAuth } from '../../stores/AuthProvider';

const { data, channelId } = defineProps(['data', 'channelId']);
const router = useRouter();
const channels = ref();
const nextpageData = ref();
const isLoading = ref(false);
const authProvider = useAuth();
const message = useMessage();

const getNextChannels = async () => {
  const endOfPage =
    window.scrollY + window.innerHeight >= document.body.offsetHeight;
  if (!endOfPage || !nextpageData.value) return;
  if (isLoading.value) return;
  try {
    isLoading.value = true;
    const res = await getNextData({
      type: 'channel',
      nextpage: nextpageData.value,
      id: channelId,
    });
    nextpageData.value = res.nextpage;
    channels.value = [...channels.value, ...res.relatedStreams];
  } catch (err) {
    console.error(err);
  } finally {
    isLoading.value = false;
  }
};

const checkSubscribe = (channelId) => {
  return (
    authProvider.subscribedChannels.findIndex(
      (c) => c.channel_id === channelId
    ) > -1
  );
};

const handleSubscribe = async (channelId) => {
  const uid = authProvider.userId;
  const { error } = await authProvider.subscribeChannel({
    uid,
    channelId: channelId,
  });
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

onMounted(async () => {
  try {
    const res = await axios.get(`/channels/tabs?data=${data}`);
    channels.value = res.data.content;
    nextpageData.value = res.data.nextpage;
    checkSubscribe();
  } catch (err) {
    console.error(err);
  }
});

onBeforeUnmount(() => window.removeEventListener('scroll', getNextChannels));
</script>

<template>
  <template v-if="channels === undefined">
    <n-space align="center" justify="center">
      <n-spin size="large" />
    </n-space>
  </template>
  <template v-else>
    <template v-if="channels.length">
      <n-grid :style="{ padding: '30px 0' }" x-gap="10" y-gap="50" :cols="6">
        <n-gi
          v-for="channel in channels"
          :key="channel.url"
          :style="{ cursor: 'pointer' }"
        >
          <n-space :size="0" vertical justify="center" align="center">
            <n-avatar
              :src="channel.thumbnail"
              :size="56"
              round
              @click="router.push(channel.url)"
            />
            <n-space align="center" :size="6" @click="router.push(channel.url)">
              <n-h6
                :style="{
                  fontSize: '14px',
                  marginBottom: '5px',
                }"
              >
                <n-ellipsis :tooltip="false" :style="{ maxWidth: '150px' }">
                  <abbr
                    :title="channel.name"
                    :style="{ textDecoration: 'none' }"
                  >
                    {{ channel.name }}
                  </abbr>
                </n-ellipsis>
              </n-h6>
              <template v-if="channel.verified">
                <n-icon :component="CheckmarkFilled" />
              </template>
            </n-space>
            <n-text
              depth="3"
              :style="{
                opacity: channel.subscribers > 0 ? 1 : 0,
                fontSize: '12px',
              }"
              @click="router.push(channel.url)"
            >
              {{ formatViews(channel.subscribers) }} subscribers
            </n-text>
            <template v-if="checkSubscribe(channel.url.split('/')[2])">
              <n-button
                size="small"
                round
                ghost
                type="primary"
                :style="{ marginTop: '6px' }"
                @click="handleUnsubscribe(channel.url.split('/')[2])"
              >
                Subscribed
              </n-button>
            </template>
            <template v-else>
              <n-button
                size="small"
                round
                type="primary"
                :style="{ marginTop: '6px' }"
                @click="handleSubscribe(channel.url.split('/')[2])"
              >
                Subscribe
              </n-button>
            </template>
          </n-space>
        </n-gi>
        <template v-if="isLoading">
          <n-space
            align="center"
            justify="center"
            :style="{ marginTop: '40px' }"
          >
            <n-spin :size="36" />
          </n-space>
        </template>
      </n-grid>
    </template>
    <template v-else>
      <n-text tag="p" :style="{ textAlign: 'center' }">
        This channel doesn't feature any other channels.
      </n-text>
    </template>
  </template>
</template>
