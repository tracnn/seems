<script setup lang="ts">
import { computed } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import ServerSelect from '@/components/ServerSelect.vue';
import { acsUserService } from '@/services/acs-user.service';
import type { CreateRoleUserData } from '@/models/permission.model';
import type { AcsUserParams } from '@/models/acs-user.model';

interface Props {
  visible: boolean;
  formData: CreateRoleUserData & { id?: string };
  submitted: boolean;
  roleColumns: Array<{ field: string; header: string; width: string }>;
  roleFetcher: (params: any) => Promise<any>;
}

interface Emits {
  (e: 'update:visible', value: boolean): void;
  (e: 'update:formData', value: CreateRoleUserData & { id?: string }): void;
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
  set: (value: CreateRoleUserData & { id?: string }) => emit('update:formData', value)
});

const dialogTitle = computed(() => {
  return props.formData.id ? 'Sửa Role-User' : 'Thêm Role-User';
});

// Methods
const handleSave = () => {
  emit('save');
};

const handleCancel = () => {
  emit('cancel');
};

// ACS User columns for ServerSelect
const acsUserColumns = [
  { field: 'userId', header: 'ID', width: '80px' },
  { field: 'username', header: 'Tên đăng nhập', width: '150px' },
  { field: 'fullName', header: 'Họ tên', width: '200px' },
  { field: 'email', header: 'Email', width: '200px' },
  { field: 'phoneNumber', header: 'Số điện thoại', width: '150px' }
];

// ACS User fetcher function
const acsUserFetcher = async (params: any) => {
  const acsParams: AcsUserParams = {
    page: params.page || 1,
    limit: params.limit || 20,
    ...(params.search && { search: params.search }),
    ...(params.sortField && { sortField: params.sortField }),
    ...(params.sortOrder && { sortOrder: params.sortOrder }),
  };
  
  const response = await acsUserService.getUsers(acsParams);
  return {
    data: response.data,
    pagination: response.pagination
  };
};

// ACS User resolver function for edit mode
const acsUserResolver = async (userId: number) => {
  if (!userId || userId === 0) return null;
  
  try {
    // Sử dụng API mới đơn giản hơn
    const user = await acsUserService.getUserSimple(userId);
    return user;
  } catch (error) {
    console.error('Error resolving user:', error);
    return null;
  }
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
    
    <div class="field">
      <label for="userId">Người dùng <span class="text-red-500">*</span></label>
      <ServerSelect
        id="userId"
        v-model="formData.userId"
        :columns="acsUserColumns"
        :fetcher="acsUserFetcher"
        :resolve-by-value="acsUserResolver"
        option-label="fullName"
        option-value="userId"
        placeholder="Chọn người dùng..."
        overlay-width="800px"
        :page-size="20"
        show-search
      />
      <small v-if="submitted && (!formData.userId || formData.userId === 0)" class="text-red-500">Người dùng là bắt buộc.</small>
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