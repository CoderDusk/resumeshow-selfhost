import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import ElementPlus from 'element-plus';
import 'element-plus/dist/index.css';
import './assets/styles/main.scss';

const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.use(ElementPlus, { size: 'default' });

app.mount('#app');
