import { createRouter, createWebHistory } from 'vue-router';
import HelloWorld from '@/components/HelloWorld.vue';
import SignUp from '@/components/SignUp.vue';
import Communicate from '@/components/Communicate.vue'; // Import the Communicate page

const routes = [
  { path: '/', name: 'Home', component: HelloWorld },
  { path: '/signup', name: 'SignUp', component: SignUp },
  { path: '/communicate', name: 'Communicate', component: Communicate }, // Add Communicate route
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;