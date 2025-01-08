import { createRouter, createWebHistory } from 'vue-router';
import Login from '@/components/HelloWorld.vue'; // Your login component
import SignUp from '@/components/SignUp.vue'; // New SignUp component

const routes = [
  { path: '/', component: Login },
  { path: '/signup', component: SignUp },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
