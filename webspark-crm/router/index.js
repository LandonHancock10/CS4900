import { createRouter, createWebHistory } from "vue-router";
import WorkPage from "@/components/WorkPage.vue";
import CommunicatePage from "@/components/CommunicatePage.vue";
import SettingsPage from "@/components/SettingsPage.vue";
import Login from "@/components/Login.vue";
import SignUp from "@/components/SignUp.vue";

const routes = [
  { path: "/work", component: WorkPage, name: "Work" },
  { path: "/", component: Login, name: "Login" },
  { path: "/signup", component: SignUp, name: "SignUp" },
  { path: "/communicate", component: CommunicatePage, name: "Communicate" },
  { path: "/settings", component: SettingsPage, name: "Settings" },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

// Navigation Guard
router.beforeEach((to, from, next) => {
  const loggedInUser = localStorage.getItem('user'); // Check localStorage for user data

  // Redirect to login page if not logged in and trying to access a protected route
  if (to.name !== "Login" && to.name !== "SignUp" && !loggedInUser) {
    next({ name: "Login" }); // Redirect to login
  } else {
    next(); // Proceed if logged in or accessing unprotected route
  }
});

export default router;
