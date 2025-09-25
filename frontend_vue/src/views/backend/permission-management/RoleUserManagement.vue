<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { useRoleUserStore } from '@/stores/role-user.store';
import { useRoleStore } from '@/stores/role.store';
import { usePermissions } from '@/composables/usePermissions';
import { storeToRefs } from 'pinia';
import type { CreateRoleUserData, RoleUserParams } from '@/models/permission.model';

// Component imports
import RoleUserFilter from './RoleUserFilter.vue';
import RoleUserTable from './RoleUserTable.vue';
import RoleUserDialog from './RoleUserDialog.vue';
import RoleUserDeleteDialog from './RoleUserDeleteDialog.vue';

// PrimeVue imports
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

// Stores
const roleUserStore = useRoleUserStore();
const roleStore = useRoleStore();
const { hasPermission } = usePermissions();
const toast = useToast();

// Store refs
const { roleUsers, isLoading, pagination } = storeToRefs(roleUserStore);

// Reactive data
const searchText = ref('');
const roleUserDialog = ref(false);
const deleteDialog = ref(false);
const submitted = ref(false);
const selectedRoleUsers = ref<any[]>([]);

// Pagination and sorting
const sortField = ref('');
const sortOrder = ref(1);

// Filter data
const filterRoleId = ref<string>('');
const filterUserId = ref<number | null>(null);
const filterIsActive = ref<number | undefined>(undefined);

// Form data
const roleUserForm = reactive<CreateRoleUserData & { id?: string }>({
  id: undefined,
  roleId: '',
  userId: 0,
});

// ServerSelect configurations
const roleColumns = [
  { field: 'displayName', header: 'Tên hiển thị', width: '200px' },
  { field: 'name', header: 'Tên vai trò', width: '200px' },
  { field: 'description', header: 'Mô tả', width: '300px' }
];

// ServerSelect fetchers
const roleFetcher = async (params: any) => {
  await roleStore.fetchRoles(params);
  const pagination = roleStore.getPagination;
  return {
    data: roleStore.getRoles,
    pagination: pagination || { total: 0, page: 1, limit: 20, pageCount: 0, hasNext: false, hasPrev: false }
  };
};

// Methods
const fetchData = (page: number, limit: number, search: string) => {
  const params: RoleUserParams = {
    page,
    limit,
    search: search || undefined,
    roleId: filterRoleId.value || undefined,
    userId: filterUserId.value || undefined,
    isActive: filterIsActive.value
  };
  
  roleUserStore.fetchRoleUsers(params);
};

const onPage = (event: any) => {
  fetchData(event.page + 1, event.rows, searchText.value);
};

const onSort = (event: any) => {
  sortField.value = event.sortField || '';
  sortOrder.value = event.sortOrder || 1;
  fetchData(1, Number(pagination.value?.limit || 10), searchText.value);
};

const search = () => {
  fetchData(1, Number(pagination.value?.limit || 10), searchText.value);
};

const refresh = () => {
  searchText.value = '';
  filterRoleId.value = '';
  filterUserId.value = null;
  filterIsActive.value = undefined;
  fetchData(1, 10, '');
};

const showCreateDialog = () => {
  roleUserForm.id = undefined;
  roleUserForm.roleId = '';
  roleUserForm.userId = 0;
  roleUserDialog.value = true;
  submitted.value = false;
};

const showEditDialog = (roleUser: any) => {
  roleUserForm.id = roleUser.id;
  roleUserForm.roleId = roleUser.roleId;
  roleUserForm.userId = roleUser.userId;
  roleUserDialog.value = true;
  submitted.value = false;
};

const hideDialog = () => {
  roleUserDialog.value = false;
  submitted.value = false;
};

const saveRoleUser = async () => {
  submitted.value = true;
  
  if (!roleUserForm.roleId || !roleUserForm.userId || roleUserForm.userId === 0) {
    return;
  }

  try {
    if (roleUserForm.id) {
      await roleUserStore.updateRoleUser(roleUserForm.id, {
        roleId: roleUserForm.roleId,
        userId: roleUserForm.userId
      });
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật role-user thành công', life: 3000 });
    } else {
      await roleUserStore.createRoleUser({
        roleId: roleUserForm.roleId,
        userId: roleUserForm.userId
      });
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Tạo role-user thành công', life: 3000 });
    }
    
    hideDialog();
    fetchData(1, Number(pagination.value?.limit || 10), searchText.value);
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Có lỗi xảy ra', life: 3000 });
  }
};

const confirmDelete = (roleUser: any) => {
  roleUserForm.id = roleUser.id;
  deleteDialog.value = true;
};

const deleteRoleUser = async () => {
  try {
    if (roleUserForm.id) {
      await roleUserStore.deleteRoleUser(roleUserForm.id);
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Xóa role-user thành công', life: 3000 });
    }
    deleteDialog.value = false;
    fetchData(1, Number(pagination.value?.limit || 10), searchText.value);
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Có lỗi xảy ra', life: 3000 });
  }
};

// Lifecycle
onMounted(() => {
  fetchData(1, 10, '');
});
</script>

<template>
  <Toast />
  <div class="content">
    <div class="card">
      <!-- Filter Component -->
      <RoleUserFilter
        v-model:filter-role-id="filterRoleId"
        v-model:filter-user-id="filterUserId"
        v-model:filter-is-active="filterIsActive"
        :role-columns="roleColumns"
        :role-fetcher="roleFetcher"
        @search="search"
        @refresh="refresh"
      />

      <!-- Table Component -->
      <RoleUserTable
        v-model:selected-role-users="selectedRoleUsers"
        v-model:search-text="searchText"
        :role-users="roleUsers"
        :is-loading="isLoading"
        :pagination="pagination"
        :sort-field="sortField"
        :sort-order="sortOrder"
        :has-permission="hasPermission"
        @page="onPage"
        @sort="onSort"
        @search="search"
        @create="showCreateDialog"
        @edit="showEditDialog"
        @delete="confirmDelete"
      />
    </div>

    <!-- Create/Edit Dialog Component -->
    <RoleUserDialog
      v-model:visible="roleUserDialog"
      v-model:form-data="roleUserForm"
      :submitted="submitted"
      :role-columns="roleColumns"
      :role-fetcher="roleFetcher"
      @save="saveRoleUser"
      @cancel="hideDialog"
    />

    <!-- Delete Confirmation Dialog Component -->
    <RoleUserDeleteDialog
      v-model:visible="deleteDialog"
      :role-user-id="roleUserForm.id"
      @confirm="deleteRoleUser"
      @cancel="deleteDialog = false"
    />
  </div>
</template>

<style scoped>
.content {
  padding: 1rem;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin: 0 0.5rem;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .content {
    padding: 0.75rem;
  }
  
  .card {
    padding: 1.25rem;
    margin: 0 0.25rem;
  }
}

@media (max-width: 768px) {
  .content {
    padding: 0.5rem;
  }
  
  .card {
    padding: 1rem;
    margin: 0;
  }
}

@media (max-width: 640px) {
  .content {
    padding: 0.25rem;
  }
  
  .card {
    padding: 0.75rem;
    margin: 0;
  }
}
</style>
