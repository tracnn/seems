<template>
  <div class="test-403-page">
    <div class="card">
      <div class="card-header">
        <h3 class="card-title">Test 403 Page</h3>
      </div>
      <div class="card-body">
        <p class="text-muted mb-4">
          Click các button bên dưới để test trang 403 với các tình huống khác nhau:
        </p>
        
        <div class="row">
          <div class="col-md-6 mb-3">
            <button 
              @click="testMissingPermission"
              class="btn btn-danger w-100"
            >
              <i class="fa fa-ban me-2"></i>
              Test Missing Permission
            </button>
            <small class="text-muted d-block mt-1">
              Simulate missing permission error
            </small>
          </div>
          
          <div class="col-md-6 mb-3">
            <button 
              @click="testInsufficientPermissions"
              class="btn btn-warning w-100"
            >
              <i class="fa fa-exclamation-triangle me-2"></i>
              Test Insufficient Permissions
            </button>
            <small class="text-muted d-block mt-1">
              Simulate insufficient permissions error
            </small>
          </div>
          
          <div class="col-md-6 mb-3">
            <button 
              @click="testRouteAccess"
              class="btn btn-info w-100"
            >
              <i class="fa fa-route me-2"></i>
              Test Route Access Denied
            </button>
            <small class="text-muted d-block mt-1">
              Simulate route access denied
            </small>
          </div>
          
          <div class="col-md-6 mb-3">
            <button 
              @click="testCustomError"
              class="btn btn-secondary w-100"
            >
              <i class="fa fa-cog me-2"></i>
              Test Custom Error
            </button>
            <small class="text-muted d-block mt-1">
              Simulate custom error scenario
            </small>
          </div>
        </div>
        
        <hr class="my-4">
        
        <div class="alert alert-info">
          <h5 class="alert-heading">
            <i class="fa fa-info-circle me-2"></i>
            Hướng dẫn sử dụng
          </h5>
          <ul class="mb-0">
            <li><strong>Missing Permission:</strong> Test khi user thiếu permission cụ thể</li>
            <li><strong>Insufficient Permissions:</strong> Test khi user không đủ quyền truy cập route</li>
            <li><strong>Route Access Denied:</strong> Test khi route bị từ chối truy cập</li>
            <li><strong>Custom Error:</strong> Test với thông tin tùy chỉnh</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

// Test missing permission
function testMissingPermission() {
  router.push({
    name: 'backend-403',
    query: {
      from: 'backend-users',
      permission: 'access_menu_user',
      reason: 'missing_permission'
    }
  });
}

// Test insufficient permissions
function testInsufficientPermissions() {
  router.push({
    name: 'backend-403',
    query: {
      from: 'backend-appointment-slots',
      permission: 'access_menu_appointment',
      reason: 'insufficient_permissions'
    }
  });
}

// Test route access denied
function testRouteAccess() {
  router.push({
    name: 'backend-403',
    query: {
      from: 'backend-queue-room',
      permission: 'access_menu_queue',
      reason: 'route_access_denied'
    }
  });
}

// Test custom error
function testCustomError() {
  router.push({
    name: 'backend-403',
    query: {
      from: 'custom-route',
      permission: 'custom:permission',
      reason: 'custom_error'
    }
  });
}
</script>

<style scoped>
.test-403-page {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.btn {
  margin-bottom: 10px;
}

.alert {
  border-radius: 10px;
}

.card {
  border-radius: 10px;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  border-radius: 10px 10px 0 0 !important;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

.btn-warning {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #000;
}

.btn-info {
  background-color: #17a2b8;
  border-color: #17a2b8;
}

.btn-secondary {
  background-color: #6c757d;
  border-color: #6c757d;
}
</style>
