<script setup lang="ts">
import { computed } from 'vue';
import Toolbar from 'primevue/toolbar';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import IconField from 'primevue/iconfield';
import InputIcon from 'primevue/inputicon';
import Tag from 'primevue/tag';
import { TABLE_CONFIG } from '@/utils/table-config.util';
import type { PermissionRole } from '@/models/permission.model';

interface Props {
  permissionRoles: PermissionRole[];
  isLoading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  selectedPermissionRoles: PermissionRole[];
  searchText: string;
  sortField: string;
  sortOrder: number;
  hasPermission: (permission: string) => boolean;
}

interface Emits {
  (e: 'update:selectedPermissionRoles', value: PermissionRole[]): void;
  (e: 'update:searchText', value: string): void;
  (e: 'page', event: any): void;
  (e: 'sort', event: any): void;
  (e: 'search'): void;
  (e: 'create'): void;
  (e: 'edit', permissionRole: PermissionRole): void;
  (e: 'delete', permissionRole: PermissionRole): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Computed properties
const rows = computed(() => Number(props.pagination?.limit || 10));
const totalRecords = computed(() => Number(props.pagination?.total || 0));
const first = computed(() => Number(((props.pagination?.page || 1) - 1) * (props.pagination?.limit || 10)));

const selectedPermissionRoles = computed({
  get: () => props.selectedPermissionRoles,
  set: (value: PermissionRole[]) => emit('update:selectedPermissionRoles', value)
});

const searchText = computed({
  get: () => props.searchText,
  set: (value: string) => emit('update:searchText', value)
});

// Methods
const handlePage = (event: any) => {
  emit('page', event);
};

const handleSort = (event: any) => {
  emit('sort', event);
};

const handleSearch = () => {
  emit('search');
};

const handleCreate = () => {
  emit('create');
};

const handleEdit = (permissionRole: PermissionRole) => {
  emit('edit', permissionRole);
};

const handleDelete = (permissionRole: PermissionRole) => {
  emit('delete', permissionRole);
};

const getStatusSeverity = (isActive: number) => {
  return isActive === 1 ? 'success' : 'danger';
};

const getStatusLabel = (isActive: number) => {
  return isActive === 1 ? 'Kích hoạt' : 'Ngừng';
};
</script>

<template>
  <div>
    <!-- Action Toolbar -->
    <Toolbar>
      <template #start>
        <Button 
          v-if="hasPermission('permission_role:create')"
          label="Thêm" 
          icon="pi pi-plus" 
          class="mr-2" 
          @click="handleCreate" 
        />
        <Button 
          label="Xóa" 
          icon="pi pi-trash" 
          severity="danger" 
          class="mr-2" 
          :disabled="!selectedPermissionRoles.length"
        />
      </template>
      <template #end>
        <IconField>
          <InputIcon>
            <i class="pi pi-search" />
          </InputIcon>
          <InputText v-model="searchText" placeholder="Tìm kiếm..." @keyup.enter="handleSearch" />
        </IconField>
      </template>
    </Toolbar>

    <!-- DataTable -->
    <DataTable
      ref="dt"
      v-model:selection="selectedPermissionRoles"
      :lazy="true"
      :value="permissionRoles"
      selectionMode="multiple"
      dataKey="id"
      :paginator="true"
      :rows="rows"
      :totalRecords="totalRecords"
      :loading="isLoading"
      :first="first"
      :rowsPerPageOptions="TABLE_CONFIG.rowsPerPageOptions"
      :currentPageReportTemplate="'Hiển thị {first} đến {last} của {totalRecords} bản ghi'"
      :paginatorTemplate="'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'"
      @page="handlePage"
      :sortField="sortField"
      :sortOrder="sortOrder"
      @sort="handleSort"
      class="p-datatable-sm"
    >
      <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
      
      <Column field="id" header="ID" :sortable="true" style="width: 200px">
        <template #body="{ data }">
          <span class="font-mono text-sm">{{ data.id }}</span>
        </template>
      </Column>
      
      <Column field="permission.displayName" header="Quyền" :sortable="true">
        <template #body="{ data }">
          <div class="flex flex-column">
            <span class="font-semibold">{{ data.permission?.displayName || 'N/A' }}</span>
            <span class="text-sm text-500">{{ data.permission?.name || '' }}</span>
          </div>
        </template>
      </Column>
      
      <Column field="role.displayName" header="Vai trò" :sortable="true">
        <template #body="{ data }">
          <div class="flex flex-column">
            <span class="font-semibold">{{ data.role?.displayName || 'N/A' }}</span>
            <span class="text-sm text-500">{{ data.role?.name || '' }}</span>
          </div>
        </template>
      </Column>
      
      <Column field="isActive" header="Trạng thái" :sortable="true" style="width: 120px">
        <template #body="{ data }">
          <Tag 
            :value="getStatusLabel(data.isActive)" 
            :severity="getStatusSeverity(data.isActive)" 
          />
        </template>
      </Column>
      
      <Column field="createdAt" header="Ngày tạo" :sortable="true" style="width: 150px">
        <template #body="{ data }">
          <span class="text-sm">{{ new Date(data.createdAt).toLocaleDateString('vi-VN') }}</span>
        </template>
      </Column>
      
      <Column header="Thao tác" :exportable="false" style="width: 120px">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button 
              v-if="hasPermission('permission_role:update')"
              icon="pi pi-pencil" 
              size="small" 
              outlined
              rounded
              severity="info"  
              @click="handleEdit(data)"
            />
            <Button 
              v-if="hasPermission('permission_role:delete')"
              icon="pi pi-trash" 
              size="small" 
              outlined
              rounded
              severity="danger" 
              @click="handleDelete(data)"
            />
          </div>
        </template>
      </Column>
    </DataTable>
  </div>
</template>

<style scoped>
.flex {
  display: flex;
}

.flex-column {
  flex-direction: column;
}

.gap-2 {
  gap: 0.5rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.font-mono {
  font-family: monospace;
}

.text-sm {
  font-size: 0.875rem;
}

.text-500 {
  color: #6b7280;
}

.font-semibold {
  font-weight: 600;
}

.p-datatable-sm {
  font-size: 0.875rem;
}
</style>
