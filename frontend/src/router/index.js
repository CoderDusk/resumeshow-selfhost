import { createRouter, createWebHistory } from 'vue-router';

const routes = [
  {
    path: '/',
    name: 'Resume',
    component: () => import('../views/Resume.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
