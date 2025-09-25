<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  visible: boolean;
  roleUserId?: string;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

const handleCancel = () => {
  emit('cancel');
};

const handleConfirm = () => {
  emit('confirm');
};
</script>

<template>
  <div v-if="visible" class="modal show d-block" tabindex="-1" style="background-color: rgba(0, 0, 0, 0.5);">
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-danger text-white">
          <h5 class="modal-title">
            <i class="fa fa-exclamation-triangle me-2"></i>
            Xác nhận xóa Role-User
          </h5>
          <button 
            @click="handleCancel" 
            class="btn-close btn-close-white" 
            type="button"
          ></button>
        </div>
        
        <div class="modal-body">
          <div class="alert alert-warning">
            <i class="fa fa-warning me-2"></i>
            <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác!
          </div>
          
          <p class="mb-3">Bạn có chắc chắn muốn xóa role-user này?</p>
          
          <div class="card">
            <div class="card-body">
              <h6 class="card-title">
                <i class="fa fa-info-circle me-2"></i>
                Thông tin Role-User
              </h6>
              <p class="mb-0">
                <strong>ID:</strong> {{ roleUserId || 'N/A' }}
              </p>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button 
            @click="handleCancel" 
            class="btn btn-secondary" 
            type="button"
          >
            <i class="fa fa-times me-2"></i>
            Hủy
          </button>
          <button 
            @click="handleConfirm" 
            class="btn btn-danger"
          >
            <i class="fa fa-trash me-2"></i>
            Xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal {
  z-index: 1055;
}

.modal-header.bg-danger {
  background-color: #dc3545 !important;
}

.alert {
  border-left: 4px solid #ffc107;
}

.alert-warning {
  background-color: #fff3cd;
  border-color: #ffeaa7;
  color: #856404;
}

.card {
  border: 1px solid #dee2e6;
  border-radius: 0.375rem;
}

.card-title {
  color: #495057;
  font-size: 1rem;
  margin-bottom: 1rem;
}

.btn {
  min-width: 100px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.text-primary {
  color: #0d6efd !important;
}

.text-muted {
  color: #6c757d !important;
}

.badge {
  font-size: 0.75em;
}

@media (max-width: 768px) {
  .modal-dialog {
    margin: 0.5rem;
    max-width: calc(100% - 1rem);
  }
  
  .modal-body {
    padding: 1rem;
  }
  
  .modal-footer {
    padding: 0.75rem 1rem;
  }
  
  .card-body {
    padding: 1rem;
  }
}
</style>
