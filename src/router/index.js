import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('../components/Home.vue') },
    {
      path: '/search',
      component: () => import('../components/Search/index.vue'),
    },
    {
      path: '/watch',
      component: () => import('../components/Watch/index.vue'),
    },
    {
      path: '/channel/:id',
      component: () => import('../components/Channel/index.vue'),
    },
  ],
});

export default router;
