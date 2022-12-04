<script setup>
import {
  NSpace,
  NH3,
  NText,
  NAvatar,
  NIcon,
  NButton,
  useMessage,
} from 'naive-ui';
import { CheckmarkFilled } from '@vicons/carbon';
import { formatViews, formatCommaViews } from '../../utils/format-view-count';
import { ref, watch, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuth } from '../../stores/AuthProvider';

const { channel } = defineProps(['channel']);
const authProvider = useAuth();
const router = useRouter();
const message = useMessage();
const isSubscribe = ref(false);
const channelId = channel.url.split('/')[2];

const handleSubscribe = async () => {
  const uid = authProvider.userId;
  const { error } = await authProvider.subscribeChannel({ uid, channelId });
  if (error) message.error(error.message);
};

const handleUnsubscribe = async () => {
  const listChannel = authProvider.subscribedChannels;
  const index = listChannel.findIndex((c) => c.channel_id === channelId);
  const { error } = await authProvider.unsubscribeChannel(
    listChannel[index].id
  );
  if (error) message.error(error.message);
};

const checkSubscribe = () => {
  isSubscribe.value =
    authProvider.subscribedChannels.findIndex(
      (c) => c.channel_id === channelId
    ) > -1;
};

onMounted(() => {
  checkSubscribe();
});

watch(authProvider, () => {
  checkSubscribe();
});
</script>

<template>
  <n-text
    tag="div"
    :style="{
      display: 'flex',
      alignItems: 'center',
      gap: '30px',
      padding: '30px 0',
      cursor: 'pointer',
    }"
  >
    <n-space
      :style="{ width: '360px' }"
      align="center"
      justify="center"
      @click="router.push(channel.url)"
    >
      <n-avatar :src="channel.thumbnail" :size="96" round />
    </n-space>
    <n-space
      vertical
      :size="4"
      :style="{ flex: 1 }"
      @click="router.push(channel.url)"
    >
      <n-space align="center" size="small">
        <n-h3 :style="{ marginBottom: 0 }">
          {{ channel.name }}
        </n-h3>
        <template v-if="channel.verified">
          <n-icon
            :component="CheckmarkFilled"
            size="15"
            :style="{ display: 'flex', alignItems: 'center' }"
          />
        </template>
      </n-space>
      <template v-if="channel.subscribers > -1">
        <n-text
          >{{ formatViews(channel.subscribers) }} subscribers •
          {{ formatCommaViews(channel.videos) }} videos
        </n-text>
      </template>

      <n-text italic>{{ channel.description }}</n-text>
    </n-space>
    <template v-if="isSubscribe">
      <n-button :style="{ fontWeight: 600 }" @click="handleUnsubscribe">
        SUBSCRIBED
      </n-button>
    </template>
    <template v-else>
      <n-button
        type="success"
        :style="{ fontWeight: 600 }"
        @click="handleSubscribe"
      >
        SUBSCRIBE
      </n-button>
    </template>
  </n-text>
</template>
