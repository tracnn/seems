<template>
  <div class="permission-demo">
    <div class="container-fluid">
      <div class="row">
        <div class="col-12">
          <div class="block block-rounded">
            <div class="block-header">
              <h3 class="block-title">Permission Management Demo</h3>
            </div>
            <div class="block-content">
              <!-- Test Permission-Role API -->
              <div class="mb-4">
                <h4>Test Permission-Role API</h4>
                <button 
                  @click="testPermissionRoleAPI" 
                  class="btn btn-primary me-2"
                  :disabled="isLoading"
                >
                  {{ isLoading ? 'Loading...' : 'Test Permission-Role API' }}
                </button>
                <button 
                  @click="clearResults" 
                  class="btn btn-secondary"
                >
                  Clear Results
                </button>
              </div>

              <!-- Results -->
              <div v-if="results.length > 0" class="mt-4">
                <h5>API Results:</h5>
                <div class="table-responsive">
                  <table class="table table-bordered table-striped">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Permission</th>
                        <th>Role</th>
                        <th>Type</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in results" :key="item.id">
                        <td>{{ item.id }}</td>
                        <td>{{ item.permission?.displayName || 'N/A' }}</td>
                        <td>{{ item.role?.displayName || 'N/A' }}</td>
                        <td>{{ item.permission?.type || 'N/A' }}</td>
                        <td>{{ new Date(item.createdAt).toLocaleDateString('vi-VN') }}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <!-- Error Display -->
              <div v-if="error" class="alert alert-danger mt-3">
                <strong>Error:</strong> {{ error }}
              </div>

              <!-- Pagination Info -->
              <div v-if="pagination" class="mt-3">
                <p><strong>Pagination:</strong></p>
                <ul>
                  <li>Total: {{ pagination.total }}</li>
                  <li>Page: {{ pagination.page }} / {{ pagination.pageCount }}</li>
                  <li>Limit: {{ pagination.limit }}</li>
                  <li>Has Next: {{ pagination.hasNext }}</li>
                  <li>Has Prev: {{ pagination.hasPrev }}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { usePermissionRoleStore } from '@/stores/permission-role.store';
import type { PermissionRole } from '@/models/permission.model';

const permissionRoleStore = usePermissionRoleStore();

// Reactive data
const results = ref<PermissionRole[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const pagination = ref<any>(null);

// Methods
const testPermissionRoleAPI = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    
    await permissionRoleStore.fetchPermissionRoles({
      page: 1,
      limit: 10
    });
    
    results.value = permissionRoleStore.getPermissionRoles;
    pagination.value = permissionRoleStore.getPagination;
    
  } catch (err: any) {
    error.value = err.message || 'Có lỗi xảy ra khi gọi API';
    console.error('API Error:', err);
  } finally {
    isLoading.value = false;
  }
};

const clearResults = () => {
  results.value = [];
  error.value = null;
  pagination.value = null;
  permissionRoleStore.clearState();
};
</script>

<style scoped>
.permission-demo {
  padding: 1rem;
}

.block {
  margin-bottom: 1.5rem;
}

.table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.alert {
  margin-top: 1rem;
}
</style>