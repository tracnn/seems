<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { usePermissions } from '@/composables/usePermissions';

const route = useRoute();
const { user, permissions } = usePermissions();

// Lấy thông tin về route bị từ chối
const deniedRoute = computed(() => {
  return route.query.from as string || 'Unknown';
});

// Lấy thông tin về permission bị thiếu
const missingPermission = computed(() => {
  return route.query.permission as string || 'Unknown';
});

// Lấy lý do bị từ chối
const reason = computed(() => {
  return route.query.reason as string || 'unknown';
});

// Thời gian hiện tại
const currentTime = computed(() => {
  return new Date().toLocaleString('vi-VN');
});

// Lấy thông báo lỗi dựa trên lý do
const errorMessage = computed(() => {
  switch (reason.value) {
    case 'missing_permission':
      return 'Bạn không có quyền truy cập vào chức năng này.';
    case 'insufficient_permissions':
      return 'Quyền của bạn không đủ để truy cập trang này.';
    default:
      return 'Bạn không có quyền truy cập vào trang này.';
  }
});
</script>

<template>
  <!-- Page Content -->
  <div class="hero">
    <div class="hero-inner text-center">
      <div class="bg-body-extra-light">
        <div class="content content-full overflow-hidden">
          <div class="py-4">
            <!-- Error Header -->
            <div class="mb-4">
              <i class="fa fa-shield-alt fa-4x text-danger mb-3"></i>
              <h1 class="display-1 fw-bolder text-danger">403</h1>
              <h2 class="h4 fw-normal text-muted mb-4">
                Truy cập bị từ chối
              </h2>
              <p class="fs-5 text-muted mb-5">
                {{ errorMessage }}
              </p>
            </div>
            <!-- END Error Header -->

            <!-- Permission Details -->
            <div class="row justify-content-center mb-4">
              <div class="col-lg-8">
                <div class="card border-0 shadow-sm">
                  <div class="card-body">
                    <h5 class="card-title text-start mb-3">
                      <i class="fa fa-info-circle text-info me-2"></i>
                      Thông tin chi tiết
                    </h5>
                    <div class="row text-start">
                      <div class="col-md-6 mb-3">
                        <strong>Người dùng:</strong>
                        <div class="text-muted">{{ user?.fullName || user?.username || 'Unknown' }}</div>
                      </div>
                      <div class="col-md-6 mb-3">
                        <strong>Thời gian:</strong>
                        <div class="text-muted">{{ currentTime }}</div>
                      </div>
                      <div class="col-md-6 mb-3">
                        <strong>Route bị từ chối:</strong>
                        <div class="text-muted">{{ deniedRoute }}</div>
                      </div>
                      <div class="col-md-6 mb-3">
                        <strong>Permission thiếu:</strong>
                        <div class="text-muted">
                          <span class="badge bg-danger">{{ missingPermission }}</span>
                        </div>
                      </div>
                      <div class="col-12 mb-3">
                        <strong>Lý do:</strong>
                        <div class="text-muted">
                          <span class="badge bg-warning text-dark">{{ reason }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- END Permission Details -->

            <!-- User Permissions -->
            <div class="row justify-content-center mb-4" v-if="permissions.length > 0">
              <div class="col-lg-8">
                <div class="card border-0 shadow-sm">
                  <div class="card-body">
                    <h5 class="card-title text-start mb-3">
                      <i class="fa fa-key text-warning me-2"></i>
                      Quyền hiện tại của bạn
                    </h5>
                    <div class="permissions-list">
                      <span 
                        v-for="permission in permissions" 
                        :key="permission"
                        class="badge bg-primary me-2 mb-2"
                      >
                        {{ permission }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <!-- END User Permissions -->

            <!-- Action Buttons -->
            <div class="row justify-content-center mb-4">
              <div class="col-lg-6">
                <div class="d-grid gap-2 d-md-flex justify-content-md-center">
                  <RouterLink 
                    :to="{ name: 'backend-dashboard' }" 
                    class="btn btn-primary btn-lg"
                  >
                    <i class="fa fa-home me-2"></i>
                    Về Trang Chủ
                  </RouterLink>
                  <button 
                    @click="$router.go(-1)" 
                    class="btn btn-outline-secondary btn-lg"
                  >
                    <i class="fa fa-arrow-left me-2"></i>
                    Quay Lại
                  </button>
                </div>
              </div>
            </div>
            <!-- END Action Buttons -->
          </div>
        </div>
      </div>
      
      <div class="content content-full text-muted fs-sm fw-medium">
        <!-- Error Footer -->
        <p class="mb-1">
          <i class="fa fa-question-circle me-1"></i>
          Cần hỗ trợ? Liên hệ quản trị viên để được cấp quyền truy cập.
        </p>
        <p class="mb-0">
          <small>
            Mã lỗi: 403 | Thời gian: {{ currentTime }}
          </small>
        </p>
        <!-- END Error Footer -->
      </div>
    </div>
  </div>
  <!-- END Page Content -->
</template>

<style scoped>
.permissions-list {
  max-height: 200px;
  overflow-y: auto;
}

.hero {
  min-height: 100vh;
  display: flex;
  align-items: center;
}

.card {
  border-radius: 10px;
}

.badge {
  font-size: 0.75em;
}

.btn-lg {
  padding: 0.75rem 1.5rem;
  font-size: 1.1rem;
}

.text-danger {
  color: #dc3545 !important;
}

.text-info {
  color: #17a2b8 !important;
}

.text-warning {
  color: #ffc107 !important;
}
</style>
