import { createRouter, createWebHistory } from 'vue-router';
import Home from '../components/Home.vue';
import Search from '../components/Search.vue';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: Home },
    { path: '/search', component: Search },
  ],
});

export default router;
