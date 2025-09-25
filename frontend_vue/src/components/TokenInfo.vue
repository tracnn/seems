<template>
  <div v-if="showTokenInfo" class="token-info">
    <div class="token-info-header">
      <h6>Token Information</h6>
      <Button 
        icon="pi pi-refresh" 
        size="small" 
        @click="refreshInfo"
        :loading="isRefreshing"
      />
    </div>
    
    <div class="token-info-content">
      <div class="info-row">
        <span class="label">Status:</span>
        <Tag 
          :value="tokenInfo.valid ? 'Valid' : 'Invalid'" 
          :severity="tokenInfo.valid ? 'success' : 'danger'"
        />
      </div>
      
      <div class="info-row">
        <span class="label">Time Remaining:</span>
        <span class="value">{{ formatTimeRemaining(tokenInfo.timeRemaining) }}</span>
      </div>
      
      <div class="info-row">
        <span class="label">Expires At:</span>
        <span class="value">{{ formatDate(tokenInfo.expiresAt) }}</span>
      </div>
      
      <div class="info-row">
        <span class="label">Refresh Attempts:</span>
        <span class="value">{{ authStore.refreshAttempts }}/3</span>
      </div>
      
      <div class="info-row">
        <span class="label">Is Refreshing:</span>
        <Tag 
          :value="authStore.isRefreshing ? 'Yes' : 'No'" 
          :severity="authStore.isRefreshing ? 'warning' : 'info'"
        />
      </div>
    </div>
    
    <div class="token-info-actions">
      <Button 
        label="Refresh Token" 
        size="small" 
        @click="manualRefresh"
        :loading="isRefreshing"
        :disabled="!authStore.isAuthenticated"
      />
      <Button 
        label="Preemptive Refresh" 
        size="small" 
        @click="preemptiveRefresh"
        :loading="isRefreshing"
        :disabled="!authStore.isAuthenticated"
      />
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '@/stores/auth.store';
import tokenManager from '@/utils/tokenManager';

export default {
  name: 'TokenInfo',
  props: {
    show: {
      type: Boolean,
      default: false
    }
  },
  setup(props) {
    const authStore = useAuthStore();
    const isRefreshing = ref(false);
    const updateInterval = ref(null);
    
    const showTokenInfo = computed(() => {
      return props.show || import.meta.env.DEV;
    });
    
    const tokenInfo = ref({
      exists: false,
      valid: false,
      timeRemaining: 0,
      expiresAt: null
    });
    
    const refreshInfo = () => {
      tokenInfo.value = tokenManager.getTokenInfo();
    };
    
    const formatTimeRemaining = (seconds) => {
      return tokenManager.formatTimeRemaining(seconds);
    };
    
    const formatDate = (date) => {
      if (!date) return 'N/A';
      return new Date(date).toLocaleString('vi-VN');
    };
    
    const manualRefresh = async () => {
      try {
        isRefreshing.value = true;
        await authStore.refreshToken();
        refreshInfo();
      } catch (error) {
        console.error('Manual refresh failed:', error);
      } finally {
        isRefreshing.value = false;
      }
    };
    
    const preemptiveRefresh = async () => {
      try {
        isRefreshing.value = true;
        await authStore.preemptiveRefresh();
        refreshInfo();
      } catch (error) {
        console.error('Preemptive refresh failed:', error);
      } finally {
        isRefreshing.value = false;
      }
    };
    
    onMounted(() => {
      refreshInfo();
      // Cập nhật thông tin mỗi 10 giây
      updateInterval.value = setInterval(refreshInfo, 10000);
    });
    
    onUnmounted(() => {
      if (updateInterval.value) {
        clearInterval(updateInterval.value);
      }
    });
    
    return {
      authStore,
      tokenInfo,
      isRefreshing,
      showTokenInfo,
      refreshInfo,
      formatTimeRemaining,
      formatDate,
      manualRefresh,
      preemptiveRefresh
    };
  }
};
</script>

<style scoped>
.token-info {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  font-size: 14px;
}

.token-info-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.token-info-header h6 {
  margin: 0;
  color: #495057;
}

.token-info-content {
  margin-bottom: 16px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  padding: 4px 0;
}

.info-row .label {
  font-weight: 500;
  color: #6c757d;
}

.info-row .value {
  color: #495057;
}

.token-info-actions {
  display: flex;
  gap: 8px;
}

.token-info-actions .p-button {
  flex: 1;
}
</style> 