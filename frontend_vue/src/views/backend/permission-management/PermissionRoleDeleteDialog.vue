<script setup lang="ts">
import { computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

interface Props {
  visible: boolean;
  permissionRoleId?: string;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'confirm'): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Computed properties
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
});

// Methods
const handleConfirm = () => {
  emit('confirm');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <Dialog 
    v-model:visible="visible" 
    :style="{ width: '450px' }" 
    header="Xác nhận" 
    :modal="true"
  >
    <div class="flex align-items-center justify-content-center">
      <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
      <span>Bạn có chắc chắn muốn xóa permission-role này?</span>
    </div>
    <template #footer>
      <Button label="Không" icon="pi pi-times" text @click="handleCancel" />
      <Button label="Có" icon="pi pi-check" text @click="handleConfirm" />
    </template>
  </Dialog>
</template>

<style scoped>
.flex {
  display: flex;
}

.align-items-center {
  align-items: center;
}

.justify-content-center {
  justify-content: center;
}

.mr-3 {
  margin-right: 0.75rem;
}
</style>
