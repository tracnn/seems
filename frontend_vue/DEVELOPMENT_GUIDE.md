# Hướng dẫn phát triển Frontend - BM Patient Hub

## Tổng quan

Frontend được xây dựng với Vue 3, Pinia, PrimeVue và tuân thủ Clean Architecture. Tài liệu này hướng dẫn cách thêm một chức năng mới vào hệ thống.

## Công nghệ sử dụng

- **Vue 3**: Framework chính
- **Pinia**: State management
- **PrimeVue**: UI Component Library
- **Vue Router**: Routing
- **Axios**: HTTP client
- **Vite**: Build tool
- **Bootstrap 5**: CSS Framework

## Cấu trúc dự án

```
frontend/src/
├── api/                    # API services
├── assets/                 # Static assets
├── components/             # Shared components
├── data/                   # Static data
├── directives/             # Custom directives
├── layouts/                # Layout components
├── router/                 # Routing configuration
├── stores/                 # Pinia stores
├── utils/                  # Utility functions
├── views/                  # Page components
├── App.vue                 # Root component
└── main.js                 # Application entry point
```

## Quy trình thêm chức năng mới

### Bước 1: Phân tích yêu cầu

1. **Xác định chức năng**: Mô tả rõ ràng chức năng cần thêm
2. **Xác định API endpoints**: Cần những API nào từ backend
3. **Xác định UI/UX**: Giao diện người dùng như thế nào
4. **Xác định quyền truy cập**: Ai có thể sử dụng chức năng này

### Bước 2: Tạo API Service

Tạo file service trong thư mục `src/api/`:

```javascript
// src/api/example.service.js
import apiClient from './config';

export const exampleService = {
  // Lấy danh sách
  async getList(params = {}) {
    const response = await apiClient.get('/api/examples', { params });
    return response.data;
  },

  // Lấy chi tiết
  async getById(id) {
    const response = await apiClient.get(`/api/examples/${id}`);
    return response.data;
  },

  // Tạo mới
  async create(data) {
    const response = await apiClient.post('/api/examples', data);
    return response.data;
  },

  // Cập nhật
  async update(id, data) {
    const response = await apiClient.put(`/api/examples/${id}`, data);
    return response.data;
  },

  // Xóa
  async delete(id) {
    const response = await apiClient.delete(`/api/examples/${id}`);
    return response.data;
  }
};
```

### Bước 3: Tạo Pinia Store

Tạo file store trong thư mục `src/stores/`:

```javascript
// src/stores/example.store.js
import { defineStore } from 'pinia';
import { exampleService } from '@/api/example.service';

export const useExampleStore = defineStore('example', {
  state: () => ({
    items: [],
    currentItem: null,
    loading: false,
    error: null,
    pagination: {
      page: 1,
      limit: 10,
      total: 0
    }
  }),

  getters: {
    getItems: (state) => state.items,
    getCurrentItem: (state) => state.currentItem,
    isLoading: (state) => state.loading,
    getError: (state) => state.error,
    getPagination: (state) => state.pagination
  },

  actions: {
    // Lấy danh sách
    async fetchItems(params = {}) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await exampleService.getList({
          page: this.pagination.page,
          limit: this.pagination.limit,
          ...params
        });
        
        this.items = response.data;
        this.pagination = {
          page: response.meta.page,
          limit: response.meta.limit,
          total: response.meta.total
        };
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Lấy chi tiết
    async fetchItemById(id) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await exampleService.getById(id);
        this.currentItem = response.data;
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Tạo mới
    async createItem(data) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await exampleService.create(data);
        this.items.unshift(response.data);
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Cập nhật
    async updateItem(id, data) {
      this.loading = true;
      this.error = null;
      
      try {
        const response = await exampleService.update(id, data);
        const index = this.items.findIndex(item => item.id === id);
        if (index !== -1) {
          this.items[index] = response.data;
        }
        if (this.currentItem?.id === id) {
          this.currentItem = response.data;
        }
        return response.data;
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Xóa
    async deleteItem(id) {
      this.loading = true;
      this.error = null;
      
      try {
        await exampleService.delete(id);
        this.items = this.items.filter(item => item.id !== id);
        if (this.currentItem?.id === id) {
          this.currentItem = null;
        }
      } catch (error) {
        this.error = error.message;
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Reset state
    resetState() {
      this.items = [];
      this.currentItem = null;
      this.loading = false;
      this.error = null;
      this.pagination = {
        page: 1,
        limit: 10,
        total: 0
      };
    }
  }
});
```

### Bước 4: Tạo Components

#### 4.1. Component danh sách

```vue
<!-- src/views/backend/example/ExampleListView.vue -->
<template>
  <div class="content">
    <BasePageHeading title="Quản lý Example" subtitle="Danh sách các example">
      <template #extra>
        <Button 
          label="Thêm mới" 
          icon="pi pi-plus" 
          @click="openCreateDialog"
          class="p-button-success"
        />
      </template>
    </BasePageHeading>

    <BaseBlock title="Danh sách Example" icon="pi pi-list">
      <!-- Toolbar -->
      <Toolbar class="mb-4">
        <template #start>
          <div class="d-flex align-items-center">
            <InputText 
              v-model="searchTerm" 
              placeholder="Tìm kiếm..." 
              class="me-3"
              style="width: 300px"
            />
            <Button 
              label="Tìm kiếm" 
              icon="pi pi-search" 
              @click="handleSearch"
            />
          </div>
        </template>
        <template #end>
          <Button 
            label="Làm mới" 
            icon="pi pi-refresh" 
            @click="refreshData"
            :loading="loading"
          />
        </template>
      </Toolbar>

      <!-- DataTable -->
      <DataTable 
        :value="items" 
        :loading="loading"
        paginator 
        :rows="pagination.limit"
        :totalRecords="pagination.total"
        :rowsPerPageOptions="[10, 20, 50]"
        @page="onPageChange"
        stripedRows
        showGridlines
        responsiveLayout="scroll"
      >
        <Column field="id" header="ID" sortable style="width: 100px"></Column>
        <Column field="name" header="Tên" sortable></Column>
        <Column field="description" header="Mô tả"></Column>
        <Column field="status" header="Trạng thái" sortable>
          <template #body="slotProps">
            <Tag 
              :value="slotProps.data.status" 
              :severity="getStatusSeverity(slotProps.data.status)"
            />
          </template>
        </Column>
        <Column field="createdAt" header="Ngày tạo" sortable>
          <template #body="slotProps">
            {{ formatDate(slotProps.data.createdAt) }}
          </template>
        </Column>
        <Column header="Thao tác" style="width: 200px">
          <template #body="slotProps">
            <Button 
              icon="pi pi-eye" 
              class="p-button-text p-button-info me-2"
              @click="viewItem(slotProps.data)"
              v-tooltip.top="'Xem chi tiết'"
            />
            <Button 
              icon="pi pi-pencil" 
              class="p-button-text p-button-warning me-2"
              @click="editItem(slotProps.data)"
              v-tooltip.top="'Chỉnh sửa'"
            />
            <Button 
              icon="pi pi-trash" 
              class="p-button-text p-button-danger"
              @click="deleteItem(slotProps.data)"
              v-tooltip.top="'Xóa'"
            />
          </template>
        </Column>
      </DataTable>
    </BaseBlock>

    <!-- Create/Edit Dialog -->
    <Dialog 
      v-model:visible="dialogVisible" 
      :header="dialogTitle"
      modal 
      :style="{ width: '600px' }"
      :closable="false"
    >
      <ExampleForm 
        v-if="dialogVisible"
        :item="currentItem"
        @submit="handleSubmit"
        @cancel="closeDialog"
      />
    </Dialog>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useExampleStore } from '@/stores/example.store';
import { useToast } from 'primevue/usetoast';
import ExampleForm from './components/ExampleForm.vue';
import { formatDate } from '@/utils/date.utils';

export default {
  name: 'ExampleListView',
  components: {
    ExampleForm
  },
  setup() {
    const router = useRouter();
    const exampleStore = useExampleStore();
    const toast = useToast();

    // Reactive data
    const searchTerm = ref('');
    const dialogVisible = ref(false);
    const currentItem = ref(null);

    // Computed
    const items = computed(() => exampleStore.getItems);
    const loading = computed(() => exampleStore.isLoading);
    const pagination = computed(() => exampleStore.getPagination);
    const dialogTitle = computed(() => 
      currentItem.value ? 'Chỉnh sửa Example' : 'Thêm mới Example'
    );

    // Methods
    const fetchData = async () => {
      try {
        await exampleStore.fetchItems({ search: searchTerm.value });
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể tải dữ liệu',
          life: 3000
        });
      }
    };

    const handleSearch = () => {
      exampleStore.pagination.page = 1;
      fetchData();
    };

    const refreshData = () => {
      fetchData();
    };

    const onPageChange = (event) => {
      exampleStore.pagination.page = event.page + 1;
      exampleStore.pagination.limit = event.rows;
      fetchData();
    };

    const openCreateDialog = () => {
      currentItem.value = null;
      dialogVisible.value = true;
    };

    const editItem = (item) => {
      currentItem.value = item;
      dialogVisible.value = true;
    };

    const viewItem = (item) => {
      router.push(`/backend/example/${item.id}`);
    };

    const deleteItem = async (item) => {
      try {
        await exampleStore.deleteItem(item.id);
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã xóa thành công',
          life: 3000
        });
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: 'Không thể xóa',
          life: 3000
        });
      }
    };

    const handleSubmit = async (data) => {
      try {
        if (currentItem.value) {
          await exampleStore.updateItem(currentItem.value.id, data);
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã cập nhật thành công',
            life: 3000
          });
        } else {
          await exampleStore.createItem(data);
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: 'Đã tạo thành công',
            life: 3000
          });
        }
        closeDialog();
      } catch (error) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: error.message || 'Có lỗi xảy ra',
          life: 3000
        });
      }
    };

    const closeDialog = () => {
      dialogVisible.value = false;
      currentItem.value = null;
    };

    const getStatusSeverity = (status) => {
      const severities = {
        active: 'success',
        inactive: 'danger',
        pending: 'warning'
      };
      return severities[status] || 'info';
    };

    // Lifecycle
    onMounted(() => {
      fetchData();
    });

    return {
      // Data
      searchTerm,
      dialogVisible,
      currentItem,
      
      // Computed
      items,
      loading,
      pagination,
      dialogTitle,
      
      // Methods
      fetchData,
      handleSearch,
      refreshData,
      onPageChange,
      openCreateDialog,
      editItem,
      viewItem,
      deleteItem,
      handleSubmit,
      closeDialog,
      getStatusSeverity,
      formatDate
    };
  }
};
</script>
```

#### 4.2. Component form

```vue
<!-- src/views/backend/example/components/ExampleForm.vue -->
<template>
  <form @submit.prevent="handleSubmit">
    <div class="grid">
      <div class="col-12">
        <div class="field">
          <label for="name" class="font-bold">Tên *</label>
          <InputText 
            id="name"
            v-model="form.name"
            :class="{ 'p-invalid': v$.name.$error }"
            placeholder="Nhập tên..."
            class="w-full"
          />
          <small v-if="v$.name.$error" class="p-error">
            {{ v$.name.$errors[0].$message }}
          </small>
        </div>
      </div>

      <div class="col-12">
        <div class="field">
          <label for="description" class="font-bold">Mô tả</label>
          <Textarea 
            id="description"
            v-model="form.description"
            rows="3"
            placeholder="Nhập mô tả..."
            class="w-full"
          />
        </div>
      </div>

      <div class="col-6">
        <div class="field">
          <label for="status" class="font-bold">Trạng thái *</label>
          <Dropdown
            id="status"
            v-model="form.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn trạng thái..."
            class="w-full"
            :class="{ 'p-invalid': v$.status.$error }"
          />
          <small v-if="v$.status.$error" class="p-error">
            {{ v$.status.$errors[0].$message }}
          </small>
        </div>
      </div>

      <div class="col-6">
        <div class="field">
          <label for="priority" class="font-bold">Độ ưu tiên</label>
          <InputNumber
            id="priority"
            v-model="form.priority"
            :min="1"
            :max="10"
            placeholder="1-10"
            class="w-full"
          />
        </div>
      </div>
    </div>

    <div class="flex justify-content-end gap-2 mt-4">
      <Button 
        type="button" 
        label="Hủy" 
        class="p-button-secondary"
        @click="$emit('cancel')"
      />
      <Button 
        type="submit" 
        label="Lưu" 
        icon="pi pi-check"
        :loading="loading"
      />
    </div>
  </form>
</template>

<script>
import { ref, reactive, onMounted, watch } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, minLength, maxLength } from '@vuelidate/validators';

export default {
  name: 'ExampleForm',
  props: {
    item: {
      type: Object,
      default: null
    }
  },
  emits: ['submit', 'cancel'],
  setup(props, { emit }) {
    const loading = ref(false);

    // Form data
    const form = reactive({
      name: '',
      description: '',
      status: '',
      priority: 1
    });

    // Validation rules
    const rules = {
      name: { 
        required, 
        minLength: minLength(2),
        maxLength: maxLength(100)
      },
      status: { required }
    };

    const v$ = useVuelidate(rules, form);

    // Status options
    const statusOptions = [
      { label: 'Hoạt động', value: 'active' },
      { label: 'Không hoạt động', value: 'inactive' },
      { label: 'Chờ xử lý', value: 'pending' }
    ];

    // Methods
    const handleSubmit = async () => {
      const isValid = await v$.value.$validate();
      if (!isValid) return;

      loading.value = true;
      try {
        emit('submit', { ...form });
      } finally {
        loading.value = false;
      }
    };

    const resetForm = () => {
      form.name = '';
      form.description = '';
      form.status = '';
      form.priority = 1;
      v$.value.$reset();
    };

    const loadItem = (item) => {
      if (item) {
        form.name = item.name || '';
        form.description = item.description || '';
        form.status = item.status || '';
        form.priority = item.priority || 1;
      } else {
        resetForm();
      }
    };

    // Watch for prop changes
    watch(() => props.item, (newItem) => {
      loadItem(newItem);
    }, { immediate: true });

    // Lifecycle
    onMounted(() => {
      loadItem(props.item);
    });

    return {
      form,
      v$,
      loading,
      statusOptions,
      handleSubmit
    };
  }
};
</script>
```

#### 4.3. Component filter (Quan trọng)

Component filter được sử dụng để lọc và tìm kiếm dữ liệu một cách nâng cao. Đây là component quan trọng cho việc quản lý danh sách lớn.

```vue
<!-- src/views/backend/example/components/ExampleFilter.vue -->
<template>
  <div class="filter-container">
    <!-- Filter Toggle Button -->
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h5 class="mb-0">
        <i class="pi pi-filter me-2"></i>
        Bộ lọc tìm kiếm
      </h5>
      <div class="d-flex gap-2">
        <Button 
          v-if="hasActiveFilters"
          label="Xóa bộ lọc" 
          icon="pi pi-times" 
          class="p-button-outlined p-button-danger p-button-sm"
          @click="clearAllFilters"
        />
        <Button 
          :label="isExpanded ? 'Thu gọn' : 'Mở rộng'" 
          :icon="isExpanded ? 'pi pi-chevron-up' : 'pi pi-chevron-down'"
          class="p-button-outlined p-button-sm"
          @click="toggleExpanded"
        />
      </div>
    </div>

    <!-- Filter Form -->
    <div v-show="isExpanded" class="filter-form">
      <div class="grid">
        <!-- Tìm kiếm theo tên -->
        <div class="col-12 col-md-6 col-lg-3">
          <div class="field">
            <label for="searchName" class="font-bold">Tìm theo tên</label>
            <InputText 
              id="searchName"
              v-model="filters.name"
              placeholder="Nhập tên để tìm..."
              class="w-full"
              @keyup.enter="applyFilters"
            />
          </div>
        </div>

        <!-- Lọc theo trạng thái -->
        <div class="col-12 col-md-6 col-lg-3">
          <div class="field">
            <label for="filterStatus" class="font-bold">Trạng thái</label>
            <Dropdown
              id="filterStatus"
              v-model="filters.status"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Tất cả trạng thái"
              class="w-full"
              :showClear="true"
            />
          </div>
        </div>

        <!-- Lọc theo độ ưu tiên -->
        <div class="col-12 col-md-6 col-lg-3">
          <div class="field">
            <label for="filterPriority" class="font-bold">Độ ưu tiên</label>
            <Dropdown
              id="filterPriority"
              v-model="filters.priority"
              :options="priorityOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Tất cả độ ưu tiên"
              class="w-full"
              :showClear="true"
            />
          </div>
        </div>

        <!-- Lọc theo ngày tạo -->
        <div class="col-12 col-md-6 col-lg-3">
          <div class="field">
            <label for="filterDateRange" class="font-bold">Ngày tạo</label>
            <div class="d-flex gap-2">
              <DatePicker
                v-model="filters.dateFrom"
                placeholder="Từ ngày"
                class="w-full"
                :showIcon="true"
                dateFormat="dd/mm/yy"
              />
              <DatePicker
                v-model="filters.dateTo"
                placeholder="Đến ngày"
                class="w-full"
                :showIcon="true"
                dateFormat="dd/mm/yy"
              />
            </div>
          </div>
        </div>

        <!-- Lọc theo sắp xếp -->
        <div class="col-12 col-md-6 col-lg-3">
          <div class="field">
            <label for="sortBy" class="font-bold">Sắp xếp theo</label>
            <Dropdown
              id="sortBy"
              v-model="filters.sortBy"
              :options="sortOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Chọn sắp xếp"
              class="w-full"
            />
          </div>
        </div>

        <!-- Lọc theo thứ tự -->
        <div class="col-12 col-md-6 col-lg-3">
          <div class="field">
            <label for="sortOrder" class="font-bold">Thứ tự</label>
            <Dropdown
              id="sortOrder"
              v-model="filters.sortOrder"
              :options="orderOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Thứ tự"
              class="w-full"
            />
          </div>
        </div>

        <!-- Lọc theo số lượng hiển thị -->
        <div class="col-12 col-md-6 col-lg-3">
          <div class="field">
            <label for="limit" class="font-bold">Số lượng hiển thị</label>
            <Dropdown
              id="limit"
              v-model="filters.limit"
              :options="limitOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Số lượng"
              class="w-full"
            />
          </div>
        </div>

        <!-- Lọc theo người tạo -->
        <div class="col-12 col-md-6 col-lg-3">
          <div class="field">
            <label for="filterCreatedBy" class="font-bold">Người tạo</label>
            <Dropdown
              id="filterCreatedBy"
              v-model="filters.createdBy"
              :options="userOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Tất cả người tạo"
              class="w-full"
              :showClear="true"
              :filter="true"
              filterPlaceholder="Tìm người tạo..."
            />
          </div>
        </div>
      </div>

      <!-- Filter Actions -->
      <div class="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
        <Button 
          label="Làm mới" 
          icon="pi pi-refresh" 
          class="p-button-outlined"
          @click="resetFilters"
        />
        <Button 
          label="Áp dụng bộ lọc" 
          icon="pi pi-check" 
          class="p-button-primary"
          :loading="loading"
          @click="applyFilters"
        />
      </div>

      <!-- Active Filters Display -->
      <div v-if="hasActiveFilters" class="mt-3">
        <h6 class="mb-2">
          <i class="pi pi-tag me-2"></i>
          Bộ lọc đang áp dụng:
        </h6>
        <div class="d-flex flex-wrap gap-2">
          <Tag 
            v-for="(filter, key) in activeFiltersDisplay" 
            :key="key"
            :value="filter.label"
            severity="info"
            @click="removeFilter(key)"
            style="cursor: pointer"
          >
            <template #icon>
              <i class="pi pi-times me-1"></i>
            </template>
          </Tag>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useUserStore } from '@/stores/user.store';

export default {
  name: 'ExampleFilter',
  props: {
    initialFilters: {
      type: Object,
      default: () => ({})
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  emits: ['filter-change', 'filter-reset'],
  setup(props, { emit }) {
    const userStore = useUserStore();
    const isExpanded = ref(false);

    // Filter data
    const filters = reactive({
      name: '',
      status: null,
      priority: null,
      dateFrom: null,
      dateTo: null,
      sortBy: 'createdAt',
      sortOrder: 'desc',
      limit: 10,
      createdBy: null,
      ...props.initialFilters
    });

    // Options for dropdowns
    const statusOptions = [
      { label: 'Hoạt động', value: 'active' },
      { label: 'Không hoạt động', value: 'inactive' },
      { label: 'Chờ xử lý', value: 'pending' }
    ];

    const priorityOptions = [
      { label: 'Cao (8-10)', value: 'high' },
      { label: 'Trung bình (4-7)', value: 'medium' },
      { label: 'Thấp (1-3)', value: 'low' }
    ];

    const sortOptions = [
      { label: 'Ngày tạo', value: 'createdAt' },
      { label: 'Tên', value: 'name' },
      { label: 'Trạng thái', value: 'status' },
      { label: 'Độ ưu tiên', value: 'priority' },
      { label: 'Người tạo', value: 'createdBy' }
    ];

    const orderOptions = [
      { label: 'Giảm dần', value: 'desc' },
      { label: 'Tăng dần', value: 'asc' }
    ];

    const limitOptions = [
      { label: '10 mục', value: 10 },
      { label: '20 mục', value: 20 },
      { label: '50 mục', value: 50 },
      { label: '100 mục', value: 100 }
    ];

    const userOptions = computed(() => {
      return userStore.getUsers.map(user => ({
        label: user.name,
        value: user.id
      }));
    });

    // Computed properties
    const hasActiveFilters = computed(() => {
      return Object.keys(filters).some(key => {
        const value = filters[key];
        if (value === null || value === '') return false;
        if (Array.isArray(value) && value.length === 0) return false;
        return true;
      });
    });

    const activeFiltersDisplay = computed(() => {
      const active = {};
      
      if (filters.name) {
        active.name = { label: `Tên: ${filters.name}` };
      }
      
      if (filters.status) {
        const status = statusOptions.find(s => s.value === filters.status);
        active.status = { label: `Trạng thái: ${status?.label}` };
      }
      
      if (filters.priority) {
        const priority = priorityOptions.find(p => p.value === filters.priority);
        active.priority = { label: `Độ ưu tiên: ${priority?.label}` };
      }
      
      if (filters.dateFrom || filters.dateTo) {
        const dateRange = [];
        if (filters.dateFrom) dateRange.push(`Từ: ${formatDate(filters.dateFrom)}`);
        if (filters.dateTo) dateRange.push(`Đến: ${formatDate(filters.dateTo)}`);
        active.dateRange = { label: `Ngày tạo: ${dateRange.join(' - ')}` };
      }
      
      if (filters.createdBy) {
        const user = userOptions.value.find(u => u.value === filters.createdBy);
        active.createdBy = { label: `Người tạo: ${user?.label}` };
      }
      
      return active;
    });

    // Methods
    const applyFilters = () => {
      // Validate date range
      if (filters.dateFrom && filters.dateTo && filters.dateFrom > filters.dateTo) {
        // Show error message
        return;
      }

      // Convert filters to API format
      const apiFilters = {
        ...filters,
        // Convert priority range to actual numbers
        priorityRange: filters.priority === 'high' ? [8, 10] :
                      filters.priority === 'medium' ? [4, 7] :
                      filters.priority === 'low' ? [1, 3] : null
      };

      // Remove null/empty values
      Object.keys(apiFilters).forEach(key => {
        if (apiFilters[key] === null || apiFilters[key] === '') {
          delete apiFilters[key];
        }
      });

      emit('filter-change', apiFilters);
    };

    const resetFilters = () => {
      Object.keys(filters).forEach(key => {
        filters[key] = key === 'sortBy' ? 'createdAt' : 
                      key === 'sortOrder' ? 'desc' : 
                      key === 'limit' ? 10 : null;
      });
      emit('filter-reset');
    };

    const clearAllFilters = () => {
      resetFilters();
      applyFilters();
    };

    const removeFilter = (filterKey) => {
      switch (filterKey) {
        case 'name':
          filters.name = '';
          break;
        case 'status':
          filters.status = null;
          break;
        case 'priority':
          filters.priority = null;
          break;
        case 'dateRange':
          filters.dateFrom = null;
          filters.dateTo = null;
          break;
        case 'createdBy':
          filters.createdBy = null;
          break;
      }
      applyFilters();
    };

    const toggleExpanded = () => {
      isExpanded.value = !isExpanded.value;
    };

    const formatDate = (date) => {
      if (!date) return '';
      return new Date(date).toLocaleDateString('vi-VN');
    };

    // Watch for prop changes
    watch(() => props.initialFilters, (newFilters) => {
      Object.assign(filters, newFilters);
    }, { deep: true });

    // Lifecycle
    onMounted(() => {
      // Load users for filter dropdown
      if (userOptions.value.length === 0) {
        userStore.fetchUsers();
      }
    });

    return {
      // Data
      isExpanded,
      filters,
      
      // Options
      statusOptions,
      priorityOptions,
      sortOptions,
      orderOptions,
      limitOptions,
      userOptions,
      
      // Computed
      hasActiveFilters,
      activeFiltersDisplay,
      
      // Methods
      applyFilters,
      resetFilters,
      clearAllFilters,
      removeFilter,
      toggleExpanded,
      formatDate
    };
  }
};
</script>

<style scoped>
.filter-container {
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1rem;
}

.filter-form {
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.field label {
  font-size: 0.875rem;
  color: #495057;
  margin-bottom: 0.5rem;
}

.p-tag {
  transition: all 0.2s ease;
}

.p-tag:hover {
  transform: scale(1.05);
}
</style>
```

**Cách sử dụng ExampleFilter trong ExampleListView:**

```vue
<!-- Trong ExampleListView.vue, thêm vào sau BasePageHeading -->
<ExampleFilter 
  :initial-filters="initialFilters"
  :loading="loading"
  @filter-change="handleFilterChange"
  @filter-reset="handleFilterReset"
/>

<!-- Trong script setup -->
const initialFilters = ref({
  sortBy: 'createdAt',
  sortOrder: 'desc',
  limit: 10
});

const handleFilterChange = (filters) => {
  // Reset về trang đầu khi filter thay đổi
  exampleStore.pagination.page = 1;
  fetchData(filters);
};

const handleFilterReset = () => {
  // Reset về trang đầu khi filter reset
  exampleStore.pagination.page = 1;
  fetchData();
};

// Cập nhật fetchData để nhận filters
const fetchData = async (filters = {}) => {
  try {
    await exampleStore.fetchItems({ 
      search: searchTerm.value,
      ...filters
    });
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải dữ liệu',
      life: 3000
    });
  }
};
```

**Tính năng chính của ExampleFilter:**

1. **Lọc đa tiêu chí**: Tên, trạng thái, độ ưu tiên, ngày tạo, người tạo
2. **Sắp xếp linh hoạt**: Theo nhiều trường với thứ tự tăng/giảm
3. **Phân trang**: Chọn số lượng hiển thị
4. **Hiển thị bộ lọc đang áp dụng**: Tags có thể click để xóa
5. **Responsive design**: Tự động điều chỉnh layout
6. **Validation**: Kiểm tra logic ngày tháng
7. **Animation**: Hiệu ứng mượt mà khi mở/đóng
8. **Debounced search**: Tối ưu performance
9. **Clear filters**: Xóa tất cả bộ lọc một lần
10. **Export filters**: Có thể mở rộng để export/import bộ lọc

#### 4.4. Utility functions (example.utils.js)

Utility functions chứa các helper functions được sử dụng chung trong module. Đây là nơi tập trung các logic xử lý dữ liệu, validation, và các function tiện ích.

```javascript
// src/views/backend/example/utils/example.utils.js

/**
 * Utility functions cho module Example
 */

// Constants
export const EXAMPLE_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
};

export const EXAMPLE_PRIORITY = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

export const PRIORITY_RANGES = {
  [EXAMPLE_PRIORITY.HIGH]: [8, 10],
  [EXAMPLE_PRIORITY.MEDIUM]: [4, 7],
  [EXAMPLE_PRIORITY.LOW]: [1, 3]
};

// Validation functions
export const validateExampleData = (data) => {
  const errors = {};

  // Validate name
  if (!data.name || data.name.trim().length < 2) {
    errors.name = 'Tên phải có ít nhất 2 ký tự';
  } else if (data.name.trim().length > 100) {
    errors.name = 'Tên không được vượt quá 100 ký tự';
  }

  // Validate description
  if (data.description && data.description.length > 500) {
    errors.description = 'Mô tả không được vượt quá 500 ký tự';
  }

  // Validate status
  if (!data.status || !Object.values(EXAMPLE_STATUS).includes(data.status)) {
    errors.status = 'Trạng thái không hợp lệ';
  }

  // Validate priority
  if (data.priority && (data.priority < 1 || data.priority > 10)) {
    errors.priority = 'Độ ưu tiên phải từ 1 đến 10';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

// Data transformation functions
export const transformExampleForAPI = (data) => {
  return {
    name: data.name?.trim(),
    description: data.description?.trim() || null,
    status: data.status,
    priority: data.priority || 1,
    metadata: {
      tags: data.tags || [],
      category: data.category || null
    }
  };
};

export const transformExampleFromAPI = (data) => {
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    status: data.status,
    priority: data.priority,
    createdAt: new Date(data.createdAt),
    updatedAt: new Date(data.updatedAt),
    createdBy: data.createdBy,
    updatedBy: data.updatedBy,
    tags: data.metadata?.tags || [],
    category: data.metadata?.category || null
  };
};

// Filter and search functions
export const filterExamples = (examples, filters) => {
  let filtered = [...examples];

  // Filter by name
  if (filters.name) {
    const searchTerm = filters.name.toLowerCase();
    filtered = filtered.filter(example => 
      example.name.toLowerCase().includes(searchTerm)
    );
  }

  // Filter by status
  if (filters.status) {
    filtered = filtered.filter(example => 
      example.status === filters.status
    );
  }

  // Filter by priority range
  if (filters.priority) {
    const [min, max] = PRIORITY_RANGES[filters.priority] || [1, 10];
    filtered = filtered.filter(example => 
      example.priority >= min && example.priority <= max
    );
  }

  // Filter by date range
  if (filters.dateFrom || filters.dateTo) {
    filtered = filtered.filter(example => {
      const createdAt = new Date(example.createdAt);
      const fromDate = filters.dateFrom ? new Date(filters.dateFrom) : null;
      const toDate = filters.dateTo ? new Date(filters.dateTo) : null;

      if (fromDate && toDate) {
        return createdAt >= fromDate && createdAt <= toDate;
      } else if (fromDate) {
        return createdAt >= fromDate;
      } else if (toDate) {
        return createdAt <= toDate;
      }
      return true;
    });
  }

  // Filter by created by
  if (filters.createdBy) {
    filtered = filtered.filter(example => 
      example.createdBy === filters.createdBy
    );
  }

  return filtered;
};

export const sortExamples = (examples, sortBy = 'createdAt', sortOrder = 'desc') => {
  const sorted = [...examples];

  sorted.sort((a, b) => {
    let aValue = a[sortBy];
    let bValue = b[sortBy];

    // Handle date sorting
    if (sortBy === 'createdAt' || sortBy === 'updatedAt') {
      aValue = new Date(aValue).getTime();
      bValue = new Date(bValue).getTime();
    }

    // Handle string sorting
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortOrder === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  return sorted;
};

// Formatting functions
export const formatExampleStatus = (status) => {
  const statusMap = {
    [EXAMPLE_STATUS.ACTIVE]: { label: 'Hoạt động', severity: 'success' },
    [EXAMPLE_STATUS.INACTIVE]: { label: 'Không hoạt động', severity: 'danger' },
    [EXAMPLE_STATUS.PENDING]: { label: 'Chờ xử lý', severity: 'warning' }
  };
  return statusMap[status] || { label: 'Không xác định', severity: 'info' };
};

export const formatExamplePriority = (priority) => {
  if (priority >= 8) return { label: 'Cao', severity: 'danger' };
  if (priority >= 4) return { label: 'Trung bình', severity: 'warning' };
  return { label: 'Thấp', severity: 'success' };
};

export const formatExampleDate = (date, format = 'dd/MM/yyyy HH:mm') => {
  if (!date) return '';
  
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hours = d.getHours().toString().padStart(2, '0');
  const minutes = d.getMinutes().toString().padStart(2, '0');

  return format
    .replace('dd', day)
    .replace('MM', month)
    .replace('yyyy', year)
    .replace('HH', hours)
    .replace('mm', minutes);
};

// Export functions
export const exportExamplesToCSV = (examples) => {
  const headers = ['ID', 'Tên', 'Mô tả', 'Trạng thái', 'Độ ưu tiên', 'Ngày tạo', 'Người tạo'];
  const rows = examples.map(example => [
    example.id,
    example.name,
    example.description || '',
    formatExampleStatus(example.status).label,
    example.priority,
    formatExampleDate(example.createdAt),
    example.createdBy
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

export const exportExamplesToExcel = (examples) => {
  // Implementation for Excel export
  // Có thể sử dụng thư viện như xlsx
  return examples.map(example => ({
    ID: example.id,
    'Tên': example.name,
    'Mô tả': example.description || '',
    'Trạng thái': formatExampleStatus(example.status).label,
    'Độ ưu tiên': example.priority,
    'Ngày tạo': formatExampleDate(example.createdAt),
    'Người tạo': example.createdBy
  }));
};

// Statistics functions
export const calculateExampleStats = (examples) => {
  const total = examples.length;
  const active = examples.filter(e => e.status === EXAMPLE_STATUS.ACTIVE).length;
  const inactive = examples.filter(e => e.status === EXAMPLE_STATUS.INACTIVE).length;
  const pending = examples.filter(e => e.status === EXAMPLE_STATUS.PENDING).length;

  const avgPriority = examples.length > 0 
    ? examples.reduce((sum, e) => sum + e.priority, 0) / examples.length 
    : 0;

  const highPriority = examples.filter(e => e.priority >= 8).length;
  const mediumPriority = examples.filter(e => e.priority >= 4 && e.priority < 8).length;
  const lowPriority = examples.filter(e => e.priority < 4).length;

  return {
    total,
    byStatus: { active, inactive, pending },
    avgPriority: Math.round(avgPriority * 100) / 100,
    byPriority: { high: highPriority, medium: mediumPriority, low: lowPriority }
  };
};

// Cache functions
const exampleCache = new Map();

export const cacheExample = (id, data) => {
  exampleCache.set(id, {
    data,
    timestamp: Date.now()
  });
};

export const getCachedExample = (id, maxAge = 5 * 60 * 1000) => { // 5 minutes
  const cached = exampleCache.get(id);
  if (!cached) return null;

  const age = Date.now() - cached.timestamp;
  if (age > maxAge) {
    exampleCache.delete(id);
    return null;
  }

  return cached.data;
};

export const clearExampleCache = () => {
  exampleCache.clear();
};

// Debounce function for search
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Throttle function for performance
export const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};
```

**Cách sử dụng trong components:**

```javascript
// Trong ExampleListView.vue
import { 
  validateExampleData, 
  transformExampleForAPI, 
  formatExampleStatus,
  filterExamples,
  sortExamples,
  debounce 
} from './utils/example.utils';

// Validation
const handleSubmit = async (data) => {
  const validation = validateExampleData(data);
  if (!validation.isValid) {
    // Hiển thị lỗi validation
    return;
  }

  const apiData = transformExampleForAPI(data);
  await exampleStore.createItem(apiData);
};

// Formatting
const getStatusDisplay = (status) => {
  const statusInfo = formatExampleStatus(status);
  return {
    label: statusInfo.label,
    severity: statusInfo.severity
  };
};

// Debounced search
const debouncedSearch = debounce((term) => {
  handleSearch(term);
}, 300);

// Local filtering (nếu cần)
const localFilter = (items, filters) => {
  let filtered = filterExamples(items, filters);
  return sortExamples(filtered, filters.sortBy, filters.sortOrder);
};
```

**Tính năng chính của example.utils.js:**

1. **Constants**: Định nghĩa các hằng số cho status, priority
2. **Validation**: Kiểm tra tính hợp lệ của dữ liệu
3. **Transformation**: Chuyển đổi dữ liệu giữa frontend và API
4. **Filtering & Sorting**: Lọc và sắp xếp dữ liệu
5. **Formatting**: Định dạng hiển thị (status, date, priority)
6. **Export**: Xuất dữ liệu ra CSV/Excel
7. **Statistics**: Tính toán thống kê
8. **Caching**: Cache dữ liệu để tối ưu performance
9. **Performance**: Debounce, throttle functions
10. **Reusability**: Có thể tái sử dụng trong nhiều components

## Component Registration Strategy

### Khi nào khai báo Global vs Local?

#### 1. **Global Components** (Trong main.js)

**Nên khai báo global khi:**
- Component được sử dụng ở **nhiều nơi** trong toàn bộ ứng dụng
- Component là **UI components cơ bản** (Button, Input, Dialog, etc.)
- Component thuộc **PrimeVue library** hoặc **shared components**
- Component có **tên ngắn gọn** và **dễ nhớ**

**Ví dụ components đã khai báo global:**
```javascript
// PrimeVue components
app.component('Button', Button);
app.component('DataTable', DataTable);
app.component('InputText', InputText);
app.component('Dialog', Dialog);

// Template components
app.component("BaseBlock", BaseBlock);
app.component("BasePageHeading", BasePageHeading);
```

#### 2. **Local Components** (Trong từng component)

**Nên khai báo local khi:**
- Component chỉ được sử dụng trong **một module cụ thể**
- Component có **tên dài** hoặc **specific**
- Component là **business logic components**
- Component cần **props/events phức tạp**

**Ví dụ khai báo local:**
```vue
<script>
import ExampleForm from './components/ExampleForm.vue';
import ExampleFilter from './components/ExampleFilter.vue';
import ExampleCard from './components/ExampleCard.vue';

export default {
  name: 'ExampleListView',
  components: {
    ExampleForm,
    ExampleFilter,
    ExampleCard
  }
  // ...
};
</script>
```

### 3. **Auto-import Strategy** (Khuyến nghị)

Để tối ưu hóa việc import, bạn có thể sử dụng **auto-import**:

#### Cấu hình Vite Auto-import:

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { PrimeVueResolver } from 'unplugin-vue-components/resolvers';

export default defineConfig({
  plugins: [
    vue(),
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia'],
      dts: true
    }),
    Components({
      resolvers: [
        PrimeVueResolver({
          prefix: 'Prime'
        })
      ],
      dts: true
    })
  ]
});
```

#### Với auto-import, bạn có thể:

```vue
<template>
  <!-- Không cần import, tự động resolve -->
  <PrimeButton label="Click me" />
  <PrimeDataTable :value="items" />
  <PrimeDialog v-model:visible="visible" />
</template>

<script setup>
// Không cần import các composables
const items = ref([]);
const visible = ref(false);
</script>
```

### 4. **Best Practices**

#### **Global Registration:**
```javascript
// main.js - Chỉ những components thực sự cần thiết
app.component('Button', Button);
app.component('InputText', InputText);
app.component('Dialog', Dialog);
app.component('DataTable', DataTable);
app.component('Column', Column);
app.component('Toolbar', Toolbar);
app.component('Tag', Tag);
app.component('Toast', Toast);
```

#### **Local Registration:**
```vue
<!-- ExampleListView.vue -->
<script>
import ExampleForm from './components/ExampleForm.vue';
import ExampleFilter from './components/ExampleFilter.vue';

export default {
  components: {
    ExampleForm,
    ExampleFilter
  }
};
</script>
```

#### **Module-level Registration:**
```javascript
// example/index.js
import ExampleForm from './components/ExampleForm.vue';
import ExampleFilter from './components/ExampleFilter.vue';
import ExampleCard from './components/ExampleCard.vue';

export {
  ExampleForm,
  ExampleFilter,
  ExampleCard
};

// Sử dụng trong component
import { ExampleForm, ExampleFilter } from '@/views/backend/example';
```

### 5. **Performance Considerations**

#### **Bundle Size Impact:**
- **Global components**: Tăng bundle size ban đầu
- **Local components**: Chỉ load khi cần (lazy loading)

#### **Tree Shaking:**
```javascript
// ❌ Bad - Không thể tree shake
import * as PrimeVue from 'primevue';

// ✅ Good - Có thể tree shake
import Button from 'primevue/button';
import DataTable from 'primevue/datatable';
```

### 6. **Recommendation cho dự án hiện tại**

Dựa trên cấu trúc hiện tại, **giữ nguyên** các global components đã khai báo vì:

1. **PrimeVue components**: Được sử dụng rộng rãi
2. **Base components**: Template components cơ bản
3. **Performance**: Đã được tối ưu

**Chỉ thêm global khi:**
- Component được sử dụng ở **>5 modules khác nhau**
- Component là **UI primitive** (Button, Input, etc.)
- Component có **tên ngắn** và **dễ nhớ**

**Ví dụ thêm global component:**
```javascript
// main.js
import LoadingSpinner from '@/components/LoadingSpinner.vue';
import ConfirmDialog from '@/components/ConfirmDialog.vue';

app.component('LoadingSpinner', LoadingSpinner);
app.component('ConfirmDialog', ConfirmDialog);
```

### 7. **Migration Strategy**

Nếu muốn chuyển từ global sang local:

```javascript
// ❌ Trước (global)
app.component('ExampleForm', ExampleForm);

// ✅ Sau (local)
// Trong từng component cần sử dụng
import ExampleForm from '@/views/backend/example/components/ExampleForm.vue';
```

**Lưu ý:** Chỉ migrate những components ít được sử dụng để tránh ảnh hưởng performance.
  
  ### Bước 5: Thêm Route

Cập nhật file `src/router/index.js`:

```javascript
// Import component
const BackendExampleList = () => import("@/views/backend/example/ExampleListView.vue");
const BackendExampleDetail = () => import("@/views/backend/example/ExampleDetailView.vue");

// Thêm vào routes array
{
  path: "/backend/example",
  name: "backend-example-list",
  component: LayoutBackend,
  meta: {
    requiresAuth: true,
    title: "Quản lý Example"
  },
  children: [
    {
      path: "",
      name: "backend-example-list-index",
      component: BackendExampleList
    },
    {
      path: ":id",
      name: "backend-example-detail",
      component: BackendExampleDetail,
      props: true
    }
  ]
}
```

### Bước 6: Thêm vào Navigation

Cập nhật menu navigation trong layout:

```javascript
// Trong LayoutBackend.vue hoặc file navigation
{
  name: "Example",
  to: "/backend/example",
  icon: "pi pi-list",
  children: [
    {
      name: "Danh sách",
      to: "/backend/example"
    }
  ]
}
```

## Quy tắc coding

### 1. Naming Convention

- **Components**: PascalCase (ExampleListView.vue)
- **Files**: kebab-case (example-list-view.vue)
- **Variables**: camelCase (exampleData)
- **Constants**: UPPER_SNAKE_CASE (API_BASE_URL)
- **Functions**: camelCase (getExampleData)

### 2. File Structure

```
src/views/backend/example/
├── ExampleListView.vue          # Trang danh sách
├── ExampleDetailView.vue        # Trang chi tiết
├── components/                  # Components con
│   ├── ExampleForm.vue
│   ├── ExampleCard.vue
│   └── ExampleFilter.vue
└── utils/                       # Utilities cho module
    └── example.utils.js
```

### 3. Component Structure

```vue
<template>
  <!-- Template content -->
</template>

<script>
// Imports
import { ref, computed, onMounted } from 'vue';
import { useExampleStore } from '@/stores/example.store';

export default {
  name: 'ComponentName',
  components: {
    // Component imports
  },
  props: {
    // Props definition
  },
  emits: ['event-name'],
  setup(props, { emit }) {
    // Component logic
    return {
      // Return reactive data and methods
    };
  }
};
</script>

<style scoped>
/* Component styles */
</style>
```

### 4. Error Handling

```javascript
// Trong store actions
async fetchData() {
  this.loading = true;
  this.error = null;
  
  try {
    const response = await apiService.getData();
    this.data = response.data;
  } catch (error) {
    this.error = error.message;
    // Log error for debugging
    console.error('Error fetching data:', error);
    throw error;
  } finally {
    this.loading = false;
  }
}
```

### 5. Loading States

```vue
<template>
  <div>
    <div v-if="loading" class="text-center p-4">
      <i class="pi pi-spin pi-spinner" style="font-size: 2rem"></i>
      <p>Đang tải...</p>
    </div>
    
    <div v-else-if="error" class="alert alert-danger">
      {{ error }}
    </div>
    
    <div v-else>
      <!-- Content -->
    </div>
  </div>
</template>
```

## Testing

### 1. Unit Tests

```javascript
// tests/unit/ExampleStore.spec.js
import { setActivePinia, createPinia } from 'pinia';
import { useExampleStore } from '@/stores/example.store';
import { exampleService } from '@/api/example.service';

// Mock API service
jest.mock('@/api/example.service');

describe('ExampleStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should fetch items successfully', async () => {
    const store = useExampleStore();
    const mockData = [{ id: 1, name: 'Test' }];
    
    exampleService.getList.mockResolvedValue({
      data: mockData,
      meta: { page: 1, limit: 10, total: 1 }
    });

    await store.fetchItems();
    
    expect(store.items).toEqual(mockData);
    expect(store.loading).toBe(false);
    expect(store.error).toBeNull();
  });
});
```

### 2. Component Tests

```javascript
// tests/unit/ExampleListView.spec.js
import { mount } from '@vue/test-utils';
import { createPinia, setActivePinia } from 'pinia';
import ExampleListView from '@/views/backend/example/ExampleListView.vue';

describe('ExampleListView', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should render correctly', () => {
    const wrapper = mount(ExampleListView);
    expect(wrapper.find('.content').exists()).toBe(true);
  });
});
```

## Performance Optimization

### 1. Lazy Loading

```javascript
// Lazy load components
const ExampleComponent = () => import('@/components/ExampleComponent.vue');
```

### 2. Virtual Scrolling

```vue
<DataTable 
  :value="items" 
  :scrollable="true"
  scrollHeight="400px"
  virtualScrollerOptions="{ itemSize: 46 }"
>
  <!-- Columns -->
</DataTable>
```

### 3. Debounced Search

```javascript
import { debounce } from 'lodash-es';

const debouncedSearch = debounce((term) => {
  handleSearch(term);
}, 300);
```

## Security

### 1. Input Validation

```javascript
// Sử dụng Vuelidate
import { required, email, minLength } from '@vuelidate/validators';

const rules = {
  email: { required, email },
  password: { required, minLength: minLength(8) }
};
```

### 2. XSS Prevention

```vue
<!-- Sử dụng v-text thay vì v-html khi có thể -->
<div v-text="userInput"></div>

<!-- Nếu cần v-html, sanitize data -->
<div v-html="sanitizeHtml(userInput)"></div>
```

### 3. CSRF Protection

```javascript
// Axios config
axios.defaults.headers.common['X-CSRF-TOKEN'] = getCsrfToken();
```

## Deployment

### 1. Build

```bash
npm run build
```

### 2. Environment Variables

```env
# .env.production
VITE_API_BASE_URL=https://api.production.com
VITE_APP_TITLE=BM Patient Hub
```

### 3. Docker

```dockerfile
FROM node:18-alpine as build
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## Troubleshooting

### 1. Common Issues

- **CORS errors**: Kiểm tra API endpoint và cấu hình CORS
- **Authentication errors**: Kiểm tra token và refresh logic
- **Build errors**: Kiểm tra import paths và dependencies

### 2. Debug Tools

- **Vue DevTools**: Debug Vue components và state
- **Pinia DevTools**: Debug Pinia stores
- **Network tab**: Debug API calls

### 3. Logging

```javascript
// Debug utils
import debugUtils from '@/utils/debug.utils';

debugUtils.log('Component mounted', { data: this.data });
```

## Tài liệu tham khảo

- [Vue 3 Documentation](https://vuejs.org/)
- [Pinia Documentation](https://pinia.vuejs.org/)
- [PrimeVue Documentation](https://primevue.org/)
- [Vue Router Documentation](https://router.vuejs.org/)
- [Vuelidate Documentation](https://vuelidate.js.org/) 