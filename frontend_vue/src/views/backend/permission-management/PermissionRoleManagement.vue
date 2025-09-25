<script setup lang="ts">
import { ref, onMounted, reactive } from 'vue';
import { usePermissionRoleStore } from '@/stores/permission-role.store';
import { usePermissionStore } from '@/stores/permission.store';
import { useRoleStore } from '@/stores/role.store';
import { usePermissions } from '@/composables/usePermissions';
import { storeToRefs } from 'pinia';
import type { CreatePermissionRoleData, PermissionRoleParams } from '@/models/permission.model';

// Component imports
import PermissionRoleFilter from './PermissionRoleFilter.vue';
import PermissionRoleTable from './PermissionRoleTable.vue';
import PermissionRoleDialog from './PermissionRoleDialog.vue';
import PermissionRoleDeleteDialog from './PermissionRoleDeleteDialog.vue';

// PrimeVue imports
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';

// Stores
const permissionRoleStore = usePermissionRoleStore();
const permissionStore = usePermissionStore();
const roleStore = useRoleStore();
const { hasPermission } = usePermissions();
const toast = useToast();

// Store refs
const { permissionRoles, isLoading, pagination } = storeToRefs(permissionRoleStore);

// Reactive data
const searchText = ref('');
const permissionRoleDialog = ref(false);
const deleteDialog = ref(false);
const submitted = ref(false);
const selectedPermissionRoles = ref<any[]>([]);

// Pagination and sorting
const sortField = ref('');
const sortOrder = ref(1);

// Filter data
const filterRoleId = ref<string>('');
const filterPermissionId = ref<string>('');
const filterIsActive = ref<number | undefined>(undefined);

// Form data
const permissionRoleForm = reactive<CreatePermissionRoleData & { id?: string }>({
  id: undefined,
  permissionId: '',
  roleId: '',
});

// ServerSelect configurations
const permissionColumns = [
  { field: 'displayName', header: 'Tên hiển thị', width: '200px' },
  { field: 'name', header: 'Tên quyền', width: '200px' },
  { field: 'type', header: 'Loại', width: '100px' },
  { field: 'description', header: 'Mô tả', width: '300px' }
];

const roleColumns = [
  { field: 'displayName', header: 'Tên hiển thị', width: '200px' },
  { field: 'name', header: 'Tên vai trò', width: '200px' },
  { field: 'description', header: 'Mô tả', width: '300px' }
];

// ServerSelect fetchers
const permissionFetcher = async (params: any) => {
  await permissionStore.fetchPermissions(params);
  const pagination = permissionStore.getPagination;
  return {
    data: permissionStore.getPermissions,
    pagination: pagination || { total: 0, page: 1, limit: 20, pageCount: 0, hasNext: false, hasPrev: false }
  };
};

const roleFetcher = async (params: any) => {
  await roleStore.fetchRoles(params);
  const pagination = roleStore.getPagination;
  return {
    data: roleStore.getRoles,
    pagination: pagination || { total: 0, page: 1, limit: 20, pageCount: 0, hasNext: false, hasPrev: false }
  };
};

// Methods
const fetchData = (page: number, limit: number, search: string, sortField: string, sortOrder: number) => {
  const params: PermissionRoleParams = {
    page,
    limit,
    search: search || undefined,
    sortField: sortField || undefined,
    sortOrder: sortOrder || undefined,
    roleId: filterRoleId.value || undefined,
    permissionId: filterPermissionId.value || undefined,
    isActive: filterIsActive.value
  };
  
  permissionRoleStore.fetchPermissionRoles(params);
};

const onPage = (event: any) => {
  fetchData(event.page + 1, event.rows, searchText.value, sortField.value, sortOrder.value);
};

const onSort = (event: any) => {
  sortField.value = event.sortField || '';
  sortOrder.value = event.sortOrder || 1;
  fetchData(1, Number(pagination.value?.limit || 10), searchText.value, sortField.value, sortOrder.value);
};

const search = () => {
  fetchData(1, Number(pagination.value?.limit || 10), searchText.value, sortField.value, sortOrder.value);
};

const refresh = () => {
  searchText.value = '';
  filterRoleId.value = '';
  filterPermissionId.value = '';
  filterIsActive.value = undefined;
  fetchData(1, 10, '', '', 1);
};

const showCreateDialog = () => {
  permissionRoleForm.id = undefined;
  permissionRoleForm.permissionId = '';
  permissionRoleForm.roleId = '';
  permissionRoleDialog.value = true;
  submitted.value = false;
};

const showEditDialog = (permissionRole: any) => {
  permissionRoleForm.id = permissionRole.id;
  permissionRoleForm.permissionId = permissionRole.permissionId;
  permissionRoleForm.roleId = permissionRole.roleId;
  permissionRoleDialog.value = true;
  submitted.value = false;
};

const hideDialog = () => {
  permissionRoleDialog.value = false;
  submitted.value = false;
};

const savePermissionRole = async () => {
  submitted.value = true;
  
  if (!permissionRoleForm.permissionId || !permissionRoleForm.roleId) {
    return;
  }

  try {
    if (permissionRoleForm.id) {
      await permissionRoleStore.updatePermissionRole(permissionRoleForm.id, {
        permissionId: permissionRoleForm.permissionId,
        roleId: permissionRoleForm.roleId
      });
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật permission-role thành công', life: 3000 });
    } else {
      await permissionRoleStore.createPermissionRole({
        permissionId: permissionRoleForm.permissionId,
        roleId: permissionRoleForm.roleId
      });
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Tạo permission-role thành công', life: 3000 });
    }
    
    hideDialog();
    fetchData(1, Number(pagination.value?.limit || 10), searchText.value, sortField.value, sortOrder.value);
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Có lỗi xảy ra', life: 3000 });
  }
};

const confirmDelete = (permissionRole: any) => {
  permissionRoleForm.id = permissionRole.id;
  deleteDialog.value = true;
};

const deletePermissionRole = async () => {
  try {
    if (permissionRoleForm.id) {
      await permissionRoleStore.deletePermissionRole(permissionRoleForm.id);
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Xóa permission-role thành công', life: 3000 });
    }
    deleteDialog.value = false;
    fetchData(1, Number(pagination.value?.limit || 10), searchText.value, sortField.value, sortOrder.value);
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.message || 'Có lỗi xảy ra', life: 3000 });
  }
};

// Lifecycle
onMounted(() => {
  fetchData(1, 10, '', '', 1);
});
</script>

<template>
  <Toast />
  <div class="content">
    <div class="card">
      <!-- Filter Component -->
      <PermissionRoleFilter
        v-model:filter-role-id="filterRoleId"
        v-model:filter-permission-id="filterPermissionId"
        v-model:filter-is-active="filterIsActive"
        :permission-columns="permissionColumns"
        :role-columns="roleColumns"
        :permission-fetcher="permissionFetcher"
        :role-fetcher="roleFetcher"
        @search="search"
        @refresh="refresh"
      />

      <!-- Table Component -->
      <PermissionRoleTable
        v-model:selected-permission-roles="selectedPermissionRoles"
        v-model:search-text="searchText"
        :permission-roles="permissionRoles"
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
    <PermissionRoleDialog
      v-model:visible="permissionRoleDialog"
      v-model:form-data="permissionRoleForm"
      :submitted="submitted"
      :permission-columns="permissionColumns"
      :role-columns="roleColumns"
      :permission-fetcher="permissionFetcher"
      :role-fetcher="roleFetcher"
      @save="savePermissionRole"
      @cancel="hideDialog"
    />

    <!-- Delete Confirmation Dialog Component -->
    <PermissionRoleDeleteDialog
      v-model:visible="deleteDialog"
      :permission-role-id="permissionRoleForm.id"
      @confirm="deletePermissionRole"
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