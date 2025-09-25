import { createRouter, createWebHashHistory, type Router, type RouteRecordRaw } from "vue-router";
import { useAuthStore } from "@/stores/auth.store";
import PermissionUtils from "@/utils/permission.utils";

// @ts-ignore - NProgress doesn't have proper TypeScript definitions
import NProgress from "nprogress";

import LayoutBackend from "@/layouts/variations/Backend.vue";
import LayoutSimple from "@/layouts/variations/Simple.vue";
import AuthSignIn from "@/views/auth/SignInView.vue";

const BackendDashboard = () => import("@/views/backend/DashboardView.vue");
const BackendSpecialtyManagement = () => import("@/views/backend/appointment/category/SpecialtyManagement.vue");
const BackendTitleManagement = () => import("@/views/backend/appointment/category/TitleManagement.vue");
const BackendUserManagement = () => import("@/views/backend/appointment/category/UserManagement.vue");
const BackendDoctorTitleManagement = () => import("@/views/backend/appointment/category/DoctorTitleManagement.vue");
const BackendClinicSpecialtyManagement = () => import("@/views/backend/appointment/category/ClinicSpecialtyManagement.vue");
const BackendAppointmentSlotsManagement = () => import("@/views/backend/appointment/AppointmentSlotsManagement.vue");
const BackendImportAppointmentSlots = () => import("@/views/backend/appointment/ImportAppointmentSlots.vue");
const BackendAppointmentManagement = () => import("@/views/backend/appointment/AppointmentManagement.vue");
const BackendQueueRoomManagement = () => import("@/views/backend/queue-management/category/QueueRoomManagement.vue");
const BackendQueueClinicRoomManagement = () => import("@/views/backend/queue-management/category/QueueClinicRoomManagement.vue");
const BackendQueueTicketManagement = () => import("@/views/backend/queue-management/QueueTicketManagement.vue");
const BackendSatisfactionSurveyManagement = () => import("@/views/backend/satisfaction-survey/SatisfactionSurveyManagement.vue");
const BackendPermissionRoleManagement = () => import("@/views/backend/permission-management/PermissionRoleManagement.vue");
const BackendRoleUserManagement = () => import("@/views/backend/permission-management/RoleUserManagement.vue");
const Backend403View = () => import("@/views/errors/403View.vue");

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/backend/dashboard"
  },
  {
    path: "/backend",
    redirect: "/backend/dashboard",
    component: LayoutBackend,
    meta: { requiresAuth: true },
    children: [
      {
        path: "dashboard",
        name: "backend-dashboard",
        component: BackendDashboard,
        meta: {
          layout: LayoutBackend,
          requiresAuth: true,
        }
      },
      {
        path: "specialties",
        name: "backend-specialties",
        component: BackendSpecialtyManagement,
        meta: { 
          layout: LayoutBackend,
          requiresAuth: true,
          requiresPermission: "access_menu_appointment",
        },
      },
      {
        path: "title",
        name: "backend-title",
        component: BackendTitleManagement,
        meta: { 
          layout: LayoutBackend,
          requiresAuth: true,
          requiresPermission: "access_menu_appointment",
        },
      },
      {
        path: "users",
        name: "backend-users",
        component: BackendUserManagement,
        meta: { 
          layout: LayoutBackend,
          requiresAuth: true,
          requiresPermission: "access_menu_user",
        },
      },
      {
        path: "doctor-title",
        name: "backend-doctor-title",
        component: BackendDoctorTitleManagement,
        meta: { 
          layout: LayoutBackend,
          requiresAuth: true,
          requiresPermission: "access_menu_appointment",
        },
      },
      {
        path: "clinic-specialty",
        name: "backend-clinic-specialty",
        component: BackendClinicSpecialtyManagement,
        meta: { 
          layout: LayoutBackend,
          requiresAuth: true,
          requiresPermission: "access_menu_appointment",
        },
      },
      {
        path: "appointment-slots",
        name: "backend-appointment-slots",
        component: BackendAppointmentSlotsManagement,
        meta: { 
          layout: LayoutBackend,
          requiresAuth: true,
          requiresPermission: "access_menu_appointment",
        },
      },
      {
        path: "import-appointment-slots",
        name: "backend-import-appointment-slots",
        component: BackendImportAppointmentSlots,
        meta: { 
          layout: LayoutBackend,
          requiresAuth: true,
          requiresPermission: "access_menu_appointment",
        },
      },
      {
        path: "appointment-management",
        name: "backend-appointment-management",
        component: BackendAppointmentManagement,
        meta: { 
          layout: LayoutBackend,
          requiresAuth: true,
          requiresPermission: "access_menu_appointment",
        },
      },
      {
        path: "satisfaction-survey",
        name: "backend-satisfaction-survey",
        component: BackendSatisfactionSurveyManagement,
        meta: { 
          layout: LayoutBackend,
          requiresAuth: true,
          requiresPermission: "access_menu_survey",
        },
      },
      {
        path: "permission-role",
        name: "backend-permission-role",
        component: BackendPermissionRoleManagement,
        meta: { 
          layout: LayoutBackend,
          requiresAuth: true,
          requiresPermission: "access_menu_super_admin",
        },
      },
      {
        path: "role-user",
        name: "backend-role-user",
        component: BackendRoleUserManagement,
        meta: { 
          layout: LayoutBackend,
          requiresAuth: true,
          requiresPermission: "access_menu_super_admin",
        },
      },
    ],
  },
  {
    path: "/backend",
    redirect: "/backend/queue-room",
    component: LayoutBackend,
    meta: { requiresAuth: true },
    children: [
      {
        path: "queue-room",
        name: "backend-queue-room",
        component: BackendQueueRoomManagement,
        meta: { 
          layout: LayoutBackend,
          requiresAuth: true,
          requiresPermission: "access_menu_queue",
        },
      },
      {
        path: "queue-clinic-room",
        name: "backend-queue-clinic-room",
        component: BackendQueueClinicRoomManagement,
        meta: { 
          layout: LayoutBackend,
          requiresAuth: true,
          requiresPermission: "access_menu_queue",
        },
      },
      {
        path: "queue-ticket",
        name: "backend-queue-ticket",
        component: BackendQueueTicketManagement,
        meta: { 
          layout: LayoutBackend,
          requiresAuth: true,
          requiresPermission: "access_menu_queue",
        },
      },
    ],
  },
  {
    path: "/auth",
    component: LayoutSimple,
    children: [
      {
        path: "signin",
        name: "auth-signin",
        component: AuthSignIn,
      },
    ],
  },
  {
    path: "/backend/403",
    name: "backend-403",
    component: Backend403View,
    meta: {
      layout: LayoutBackend,
      requiresAuth: true,
    },
  },
];

const router: Router = createRouter({
  history: createWebHashHistory(),
  linkActiveClass: "active",
  linkExactActiveClass: "",
  scrollBehavior() {
    return { left: 0, top: 0 };
  },
  routes,
});

NProgress.configure({ showSpinner: false });

router.beforeEach(async (to, _from, next) => {
  NProgress.start();
  const authStore = useAuthStore();

  if (to.meta.requiresAuth) {
    if (!authStore.isTokenValid()) {
      authStore.logout();
      next({ name: 'auth-signin' });
      return;
    }

    if (!authStore.isAuthenticated) {
      try {
        const valid = await authStore.checkAuth();
        if (!valid) {
          next({ name: 'auth-signin' });
          return;
        }
      } catch (error) {
        console.error('Authentication check failed:', error);
        authStore.logout();
        next({ name: 'auth-signin' });
        return;
      }
    }

    // Kiểm tra permission nếu route yêu cầu
    if (to.meta.requiresPermission) {
      const hasPermission = PermissionUtils.hasPermission(to.meta.requiresPermission as string);
      if (!hasPermission) {
        console.warn(`Access denied to route ${String(to.name)}: missing permission ${to.meta.requiresPermission}`);
        next({ 
          name: 'backend-403',
          query: {
            from: String(to.name),
            permission: to.meta.requiresPermission as string,
            reason: 'missing_permission'
          }
        });
        return;
      }
    }

    // Kiểm tra route access dựa trên menu permissions
    if (to.name && !PermissionUtils.canAccessRoute(to.name as string)) {
      console.warn(`Access denied to route ${String(to.name)}: insufficient permissions`);
      next({ 
        name: 'backend-403',
        query: {
          from: String(to.name),
          permission: 'route_access_denied',
          reason: 'insufficient_permissions'
        }
      });
      return;
    }
  } else {
    if (authStore.isAuthenticated && to.name === 'auth-signin') {
      next({ name: 'backend-dashboard' });
      return;
    }
  }
  next();
});

router.afterEach(() => {
  NProgress.done();
});

export default router; 