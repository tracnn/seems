<script setup lang="ts">
import { computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import ServerSelect from '@/components/ServerSelect.vue';
import type { CreatePermissionRoleData } from '@/models/permission.model';

interface Props {
  visible: boolean;
  formData: CreatePermissionRoleData & { id?: string };
  submitted: boolean;
  permissionColumns: Array<{ field: string; header: string; width: string }>;
  roleColumns: Array<{ field: string; header: string; width: string }>;
  permissionFetcher: (params: any) => Promise<any>;
  roleFetcher: (params: any) => Promise<any>;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'update:formData', value: CreatePermissionRoleData & { id?: string }): void;
  (e: 'save'): void;
  (e: 'cancel'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Computed properties
const visible = computed({
  get: () => props.visible,
  set: (value: boolean) => emit('update:visible', value)
});

const formData = computed({
  get: () => props.formData,
  set: (value: CreatePermissionRoleData & { id?: string }) => emit('update:formData', value)
});

const dialogTitle = computed(() => {
  return props.formData.id ? 'Sửa Permission-Role' : 'Thêm Permission-Role';
});

// Methods
const handleSave = () => {
  emit('save');
};

const handleCancel = () => {
  emit('cancel');
};
</script>

<template>
  <Dialog 
    v-model:visible="visible" 
    :header="dialogTitle" 
    :modal="true" 
    class="p-fluid"
    style="width: 600px"
  >
    <div class="field">
      <label for="permissionId">Quyền <span class="text-red-500">*</span></label>
      <ServerSelect
        id="permissionId"
        v-model="formData.permissionId"
        :columns="permissionColumns"
        :fetcher="permissionFetcher"
        option-label="displayName"
        option-value="id"
        placeholder="Chọn quyền..."
        overlay-width="600px"
        :page-size="20"
        show-search
      />
      <small v-if="submitted && !formData.permissionId" class="text-red-500">Quyền là bắt buộc.</small>
    </div>
    
    <div class="field">
      <label for="roleId">Vai trò <span class="text-red-500">*</span></label>
      <ServerSelect
        id="roleId"
        v-model="formData.roleId"
        :columns="roleColumns"
        :fetcher="roleFetcher"
        option-label="displayName"
        option-value="id"
        placeholder="Chọn vai trò..."
        overlay-width="600px"
        :page-size="20"
        show-search
      />
      <small v-if="submitted && !formData.roleId" class="text-red-500">Vai trò là bắt buộc.</small>
    </div>
    
    <template #footer>
      <Button label="Hủy" icon="pi pi-times" text @click="handleCancel" />
      <Button label="Lưu" icon="pi pi-check" @click="handleSave" />
    </template>
  </Dialog>
</template>

<style scoped>
.text-red-500 {
  color: #ef4444;
}

.p-fluid .field {
  margin-bottom: 1rem;
}

.p-fluid .field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}
</style>
