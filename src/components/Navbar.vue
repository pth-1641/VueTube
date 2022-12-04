<script setup>
import {
  NButton,
  NSpace,
  NIcon,
  NForm,
  NInput,
  NInputGroup,
  NSwitch,
  NDrawer,
  NDrawerContent,
  NLayoutHeader,
  NList,
  NListItem,
  NAvatar,
  NText,
  NCard,
  NH6,
  NH2,
  NH5,
  NTag,
  NMenu,
} from 'naive-ui';
import {
  Menu,
  Search,
  UserAvatar,
  Sun,
  Moon,
  Home,
  Logout,
  ThumbsUp,
  Time,
} from '@vicons/carbon';
import { ref, h, onMounted, watch } from 'vue';
import { RouterLink } from 'vue-router';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { supabase } from '../supabase';
import VueLogo from '../assets/vue.svg';
import { useAuth } from '../stores/AuthProvider';

const isDark = localStorage.theme === 'dark';
const emit = defineEmits(['toggle-theme']);
const router = useRouter();
const queryString = ref('');
const inputRef = ref();
const isShowAccount = ref(false);
const suggestOptions = ref([]);
const drawerActive = ref(false);
const isShowSuggests = ref(false);
const authProvider = useAuth();
const user = ref();
const subscribedChannels = ref([]);

const handleQuerySuggests = (query) => {
  isShowSuggests.value = true;
  const queryString = query.type ? query.target.value.trim() : query.trim();
  if (!queryString) {
    isShowSuggests.value = false;
    return;
  }
  axios.get(`/opensearch/suggestions?query=${queryString}`).then(({ data }) => {
    suggestOptions.value = data[1];
  });
};

const handleSignInWithGoogle = async () => {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
  });
};

const handleSignOut = async () => {
  await supabase.auth.signOut();
  authProvider.logOut();
};

const handleRedirectSearch = (suggest) => {
  isShowSuggests.value = false;
  queryString.value = suggest.trim();
  inputRef.value.blur();
  router.push(`/search?q=${suggest.trim().split(' ').join('+')}`);
};

// Drawer
const renderIcon = (icon) => {
  return () => h(NIcon, null, { default: () => h(icon) });
};

const drawerOptions = [
  {
    label: 'Home',
    icon: renderIcon(Home),
    route: '/',
    key: 'home',
  },
  {
    label: 'Liked videos',
    icon: renderIcon(ThumbsUp),
    route: '/liked',
    key: 'liked-videos',
  },
  {
    label: 'History',
    icon: renderIcon(Time),
    route: '/history',
    key: 'history',
  },
];

const getChannelInfo = async (listChannelId) => {
  subscribedChannels.value = await Promise.all(
    listChannelId.map(async (c) => {
      const { data } = await axios.get(`/channel/${c.channel_id}`);
      return data;
    })
  );
};

onMounted(async () => {
  user.value = await authProvider.getUser();
  await authProvider.getSubscribedChannels();
  getChannelInfo(authProvider.subscribedChannels);
});

watch(authProvider, ({ subscribedChannels }) => {
  getChannelInfo(subscribedChannels);
});
</script>

<template>
  <n-layout-header bordered :style="{ position: 'fixed', zIndex: 99 }">
    <n-text
      :style="{
        padding: '10px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '24px',
      }"
    >
      <n-space>
        <n-button
          type="primary"
          quaternary
          circle
          @click="drawerActive = true"
          :focusable="false"
        >
          <template #icon>
            <n-icon :component="Menu" size="24" />
          </template>
        </n-button>
        <n-space
          align="center"
          :size="0"
          @click="router.push('/')"
          :style="{ cursor: 'pointer' }"
          class="header-logo"
        >
          <n-avatar
            :src="VueLogo"
            :style="{ backgroundColor: 'transparent' }"
            size="small"
          />
          <n-h2 :style="{ margin: 0 }">
            <n-text type="success"> ueTube </n-text>
          </n-h2>
        </n-space>
      </n-space>
      <n-form
        :style="{
          flex: 1,
          display: 'flex',
          justifyContent: 'center',
        }"
        @submit.prevent="handleRedirectSearch(queryString)"
      >
        <n-input-group :style="{ maxWidth: '360px', position: 'relative' }">
          <n-input
            ref="inputRef"
            placeholder="Search"
            clearable
            status="success"
            v-model:value="queryString"
            @input="handleQuerySuggests"
            @focus="handleQuerySuggests"
            @blur="isShowSuggests = false"
          />
          <n-button attr-type="submit" type="primary">
            <template #icon>
              <n-icon :component="Search" />
            </template>
          </n-button>
          <n-list
            hoverable
            bordered
            clickable
            :show-divider="false"
            :style="{
              position: 'absolute',
              top: '40px',
              right: 0,
              left: 0,
              padding: '12px 0',
            }"
            v-show="isShowSuggests && suggestOptions.length"
          >
            <n-list-item
              :style="{ padding: '5px 10px' }"
              v-for="suggest in suggestOptions"
              :key="suggest"
              @mousedown="handleRedirectSearch(suggest)"
            >
              <n-space :wrap="false" align="center">
                <n-text
                  tag="div"
                  :style="{ display: 'flex', alignItems: 'center' }"
                >
                  <n-icon :component="Search" size="17" />
                </n-text>
                {{ suggest }}
              </n-space>
            </n-list-item>
          </n-list>
        </n-input-group>
      </n-form>
      <n-space align="center" justify="center" :size="20">
        <n-switch
          @update:value="emit('toggle-theme')"
          size="small"
          :default-value="isDark"
        >
          <template #checked-icon>
            <n-icon :component="Moon" />
          </template>
          <template #unchecked-icon>
            <n-icon :component="Sun" />
          </template>
        </n-switch>
        <template v-if="user">
          <n-text
            tag="div"
            :style="{
              display: 'flex',
              alignItems: 'center',
              position: 'relative',
            }"
          >
            <n-avatar
              :src="user.user_metadata.avatar_url"
              round
              :style="{ cursor: 'pointer' }"
              @click="isShowAccount = !isShowAccount"
            />
            <template v-if="isShowAccount">
              <n-card
                size="small"
                :style="{
                  position: 'absolute',
                  top: '40px',
                  right: 0,
                  borderRadius: '8px',
                  width: 'max-content',
                }"
              >
                <n-space>
                  <n-avatar
                    :src="user.user_metadata.avatar_url"
                    round
                    size="large"
                  />
                  <div>
                    <n-h6 :style="{ margin: 0 }">
                      {{ user.user_metadata.full_name }}
                    </n-h6>
                    <n-tag :bordered="false" type="success" round size="small">
                      {{ user.email }}
                    </n-tag>
                  </div>
                </n-space>
                <template #action>
                  <n-button
                    :style="{ marginLeft: 'auto', display: 'flex' }"
                    @click="handleSignOut"
                  >
                    <template #icon>
                      <n-icon :component="Logout" size="20" />
                    </template>
                    Sign out
                  </n-button>
                </template>
              </n-card>
            </template>
          </n-text>
        </template>
        <template v-else>
          <n-button type="primary" ghost @click="handleSignInWithGoogle">
            <template #icon>
              <n-icon :component="UserAvatar" size="20" />
            </template>
            Login
          </n-button>
        </template>
      </n-space>
    </n-text>
  </n-layout-header>
  <!-- Sidebar -->
  <n-drawer
    v-model:show="drawerActive"
    placement="left"
    display-directive="show"
  >
    <n-drawer-content
      :header-style="{ padding: '14px' }"
      :body-content-style="{ padding: '2px' }"
      :footer-style="{ padding: '8px' }"
      :native-scrollbar="false"
    >
      <template #header>
        <n-space align="center" :size="0">
          <n-avatar
            :src="VueLogo"
            :style="{ backgroundColor: 'transparent' }"
            size="small"
          />
          <n-h2 :style="{ margin: 0 }">
            <n-text type="success"> ueTube </n-text>
          </n-h2>
        </n-space>
      </template>
      <n-menu :options="drawerOptions" :indent="16" />
      <n-h5 prefix="bar" :style="{ margin: '8px' }" type="success">
        Subscriptions
      </n-h5>
      <n-list
        :show-divider="false"
        clickable
        hoverable
        :style="{ margin: '12px 8px' }"
      >
        <n-list-item
          v-for="channel in subscribedChannels"
          :style="{ padding: '5px' }"
          @click="router.push(`/channel/${channel.id}`)"
        >
          <n-text
            tag="div"
            :style="{ display: 'flex', alignItems: 'center', gap: '10px' }"
          >
            <n-avatar :src="channel.avatarUrl" round size="small" />
            <n-text strong>{{ channel.name }}</n-text>
          </n-text>
        </n-list-item>
      </n-list>
      <template #footer>
        <n-space align="center">
          <n-text type="info" italic> pth-1641 ❤</n-text>
        </n-space>
      </template>
    </n-drawer-content>
  </n-drawer>
</template>
