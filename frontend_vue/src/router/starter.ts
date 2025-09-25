import { createRouter, createWebHashHistory, type Router, type RouteRecordRaw } from "vue-router";

// @ts-ignore - NProgress doesn't have proper TypeScript definitions
import NProgress from "nprogress";

// Main layouts
import LayoutBackend from "@/layouts/variations/BackendStarter.vue";
import LayoutSimple from "@/layouts/variations/Simple.vue";

// Frontend: Landing
const Landing = () => import("@/views/starter/LandingView.vue");

// Backend: Dashboard
const Dashboard = () => import("@/views/starter/DashboardView.vue");

// Set all routes
const routes: RouteRecordRaw[] = [
  {
    path: "/",
    component: LayoutSimple,
    children: [
      {
        path: "",
        name: "landing",
        component: Landing,
      },
    ],
  },
  {
    path: "/backend",
    redirect: "/backend/dashboard",
    component: LayoutBackend,
    children: [
      {
        path: "dashboard",
        name: "backend-dashboard",
        component: Dashboard,
      },
    ],
  },
];

// Create Router
const router: Router = createRouter({
  history: createWebHashHistory(),
  linkActiveClass: "active",
  linkExactActiveClass: "active",
  scrollBehavior() {
    return { left: 0, top: 0 };
  },
  routes,
});

// NProgress
/*eslint-disable no-unused-vars*/
NProgress.configure({ showSpinner: false });

router.beforeResolve((next: any) => {
  NProgress.start();
  next();
});

router.afterEach(() => {
  NProgress.done();
});
/*eslint-enable no-unused-vars*/

export default router; 