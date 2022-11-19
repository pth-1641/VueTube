import { createApp } from 'vue';
import axios from 'axios';
import App from './App.vue';
import router from './router';

const requestUrls = import.meta.env.VITE_API_URLS.split(', ');
const randomURL = Math.floor(Math.random() * requestUrls.length);
axios.defaults.baseURL = requestUrls[randomURL];
const app = createApp(App);
app.use(router);
app.mount('#app');
