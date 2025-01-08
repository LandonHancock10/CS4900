import { createRouter, createWebHistory } from "vue-router";
import WorkPage from "@/components/WorkPage.vue";
import CommunicatePage from "@/components/CommunicatePage.vue";
import SettingsPage from "@/components/SettingsPage.vue";

const routes = [
  { path: "/work", component: WorkPage },
  { path: "/communicate", component: CommunicatePage },
  { path: "/settings", component: SettingsPage },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
