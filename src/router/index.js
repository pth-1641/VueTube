import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Search from '../components/Search/index.vue';
import Watch from '../components/Watch/index.vue';
import Channel from '../components/Channel.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/search', component: Search },
    { path: '/watch', component: Watch },
    { path: '/channel/:id', component: Channel },
  ],
});

export default router;
