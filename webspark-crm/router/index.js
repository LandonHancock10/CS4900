import { createRouter, createWebHistory } from "vue-router";
import WorkPage from "@/components/WorkPage.vue";
import CommunicatePage from "@/components/CommunicatePage.vue";
import SettingsPage from "@/components/SettingsPage.vue";
import Login from "@/components/Login.vue";
import SignUp from "@/components/SignUp.vue";

const routes = [
  { path: "/work", component: WorkPage },
  { path: "/", component: Login },
  { path: "/signup", component: SignUp },
  { path: "/communicate", component: CommunicatePage },
  { path: "/settings", component: SettingsPage },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
