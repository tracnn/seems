<template>
  <div v-if="showWarning" class="token-expiry-warning">
    <div class="alert alert-warning alert-dismissible fade show" role="alert">
      <i class="pi pi-exclamation-triangle me-2"></i>
      <strong>Phiên làm việc sắp hết hạn!</strong>
      <span class="ms-2">
        Token sẽ hết hạn trong {{ timeRemaining.minutes }}:{{ timeRemaining.seconds.toString().padStart(2, '0') }}.
        <button @click="refreshToken" class="btn btn-sm btn-outline-warning ms-2">
          <i class="pi pi-refresh me-1"></i>
          Làm mới
        </button>
      </span>
      <button @click="dismissWarning" type="button" class="btn-close" aria-label="Close"></button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import authUtils from '@/utils/auth.utils';

export default {
  name: 'TokenExpiryWarning',
  setup() {
    const authStore = useAuthStore();
    const showWarning = ref(false);
    const timeRemaining = ref({ minutes: 0, seconds: 0 });
    let intervalId = null;

    const checkTokenExpiry = () => {
      if (authStore.isAuthenticated && authUtils.isTokenExpiringSoon()) {
        showWarning.value = true;
        updateTimeRemaining();
      } else {
        showWarning.value = false;
      }
    };

    const updateTimeRemaining = () => {
      const remaining = authUtils.getTokenTimeRemaining();
      if (remaining) {
        timeRemaining.value = remaining;
      }
    };

    const refreshToken = async () => {
      try {
        await authStore.refreshToken();
        showWarning.value = false;
        // Hiển thị thông báo thành công
        if (window.$toast) {
          window.$toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Token đã được làm mới',
            life: 3000
          });
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
        // Hiển thị thông báo lỗi
        if (window.$toast) {
          window.$toast.add({
            severity: 'error',
            summary: 'Lỗi',
            detail: 'Không thể làm mới token. Vui lòng đăng nhập lại.',
            life: 5000
          });
        }
      }
    };

    const dismissWarning = () => {
      showWarning.value = false;
    };

    onMounted(() => {
      // Kiểm tra ngay khi component mount
      checkTokenExpiry();
      
      // Kiểm tra mỗi giây
      intervalId = setInterval(() => {
        checkTokenExpiry();
        if (showWarning.value) {
          updateTimeRemaining();
        }
      }, 1000);
    });

    onUnmounted(() => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    });

    return {
      showWarning,
      timeRemaining,
      refreshToken,
      dismissWarning
    };
  }
};
</script>

<style scoped>
.token-expiry-warning {
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
  max-width: 400px;
}

.alert {
  margin-bottom: 0;
  border: none;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.btn-close {
  padding: 0.5rem;
}

.btn-outline-warning {
  border-color: #ffc107;
  color: #856404;
}

.btn-outline-warning:hover {
  background-color: #ffc107;
  border-color: #ffc107;
  color: #000;
}
</style> 