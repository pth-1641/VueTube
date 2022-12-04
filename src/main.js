import { createApp } from 'vue';
import axios from 'axios';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

const requestUrls = import.meta.env.VITE_API_URL.split(', ');
const randomURL = Math.floor(Math.random() * requestUrls.length);
axios.defaults.baseURL = requestUrls[randomURL];
const app = createApp(App);

// Middleware
app.use(createPinia());
app.use(router);
app.mount('#app');
