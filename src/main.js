import { createApp } from 'vue';
import axios from 'axios';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

axios.defaults.baseURL =
  document.cookie.split('=')[1] || import.meta.env.VITE_API_URL;
const app = createApp(App);

// Middleware
app.use(createPinia());
app.use(router);
app.mount('#app');
