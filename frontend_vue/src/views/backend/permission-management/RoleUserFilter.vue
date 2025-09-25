<script setup lang="ts">
import { computed } from 'vue';
import Toolbar from 'primevue/toolbar';
import Button from 'primevue/button';
import Select from 'primevue/select';
import ServerSelect from '@/components/ServerSelect.vue';
import { acsUserService } from '@/services/acs-user.service';
import type { AcsUserParams } from '@/models/acs-user.model';

interface Props {
  filterRoleId: string;
  filterUserId: number | null;
  filterIsActive?: number | undefined;
  roleColumns: Array<{ field: string; header: string; width: string }>;
  roleFetcher: (params: any) => Promise<any>;
}

interface Emits {
  (e: 'update:filterRoleId', value: string): void;
  (e: 'update:filterUserId', value: number | null): void;
  (e: 'update:filterIsActive', value: number | undefined): void;
  (e: 'search'): void;
  (e: 'refresh'): void;
}

const props = defineProps<Props>();
const emit = defineEmits<Emits>();

// Status options
const statusOptions = [
  { label: 'Tất cả', value: undefined },
  { label: 'Hoạt động', value: 1 },
  { label: 'Không hoạt động', value: 0 }
];

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

// Computed properties for v-model
const filterRoleId = computed({
  get: () => props.filterRoleId,
  set: (value: string) => emit('update:filterRoleId', value || '')
});

const filterUserId = computed({
  get: () => props.filterUserId,
  set: (value: number | null) => emit('update:filterUserId', value)
});

const filterIsActive = computed({
  get: () => props.filterIsActive,
  set: (value: number | undefined) => emit('update:filterIsActive', value)
});

// Methods
const handleSearch = () => {
  emit('search');
};

const handleRefresh = () => {
  emit('refresh');
};
</script>

<template>
  <div class="filter-container">
    <!-- Filter Row -->
    <div class="filter-row">
      <div class="filter-item">
        <label for="filterRoleId">Vai trò:</label>
        <ServerSelect
          id="filterRoleId"
          v-model="filterRoleId"
          :columns="roleColumns"
          :fetcher="roleFetcher"
          option-label="displayName"
          option-value="id"
          placeholder="Tất cả vai trò"
          overlay-width="600px"
          :page-size="20"
          show-search
          show-clear
        />
      </div>
      <div class="filter-item">
        <label for="filterUserId">Người dùng:</label>
        <ServerSelect
          id="filterUserId"
          v-model="filterUserId"
          :columns="acsUserColumns"
          :fetcher="acsUserFetcher"
          option-label="fullName"
          option-value="userId"
          placeholder="Tất cả người dùng"
          overlay-width="800px"
          :page-size="20"
          show-search
          show-clear
        />
      </div>
      <div class="filter-item">
        <label for="filterIsActive">Trạng thái:</label>
        <Select
          id="filterIsActive"
          v-model="filterIsActive"
          :options="statusOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="Tất cả trạng thái"
          class="w-full"
          showClear
        />
      </div>
    </div>
    
    <!-- Action Row -->
    <div class="action-row">
      <Button label="Tìm kiếm" icon="pi pi-search" @click="handleSearch" />
      <Button label="Làm mới" icon="pi pi-refresh" severity="secondary" @click="handleRefresh" />
    </div>
  </div>
</template>

<style scoped>
.filter-container {
  margin-bottom: 1rem;
  padding: 0 1rem;
}

.filter-row {
  display: flex;
  gap: 1rem;
  align-items: end;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.filter-item {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
}

.filter-item label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  font-size: 0.875rem;
  color: #374151;
}

.action-row {
  display: flex;
  gap: 0.5rem;
  justify-content: flex-start;
  padding: 0 1rem;
}

.w-full {
  width: 100%;
}

/* Responsive adjustments */
@media (max-width: 1024px) {
  .filter-container {
    padding: 0 0.75rem;
  }
  
  .filter-row {
    gap: 0.75rem;
  }
  
  .filter-item {
    min-width: 180px;
  }
  
  .action-row {
    padding: 0 0.75rem;
  }
}

@media (max-width: 768px) {
  .filter-container {
    padding: 0 0.5rem;
  }
  
  .filter-row {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filter-item {
    min-width: unset;
    width: 100%;
  }
  
  .action-row {
    justify-content: center;
    padding: 0 0.5rem;
  }
}

@media (max-width: 640px) {
  .filter-container {
    padding: 0 0.25rem;
  }
  
  .filter-row {
    gap: 0.5rem;
  }
  
  .action-row {
    flex-direction: column;
    gap: 0.5rem;
    padding: 0 0.25rem;
  }
  
  .action-row .p-button {
    width: 100%;
  }
}
</style>
