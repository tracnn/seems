<template>
  <ThemeSwitcher />
  <div class="content">
    <div class="card">
      <!-- Toolbar actions -->
      <Toolbar>
        <template #start>
          <Button label="Thêm" icon="pi pi-plus" class="mr-2" @click="showQueueRoomDialog()" />
          <Button label="Xóa" icon="pi pi-trash" severity="danger" class="mr-2" />
        </template>
        <template #center>
          <FileUpload
            mode="basic"
            accept="image/*"
            :maxFileSize="1000000"
            customUpload
            chooseLabel="Import"
            class="mr-2"
            auto
            :chooseButtonProps="{ severity: 'secondary' }"
          />
          <Button label="Export" icon="pi pi-upload" severity="secondary" />
        </template>
        <template #end>
          <IconField>
            <InputIcon><i class="pi pi-search" /></InputIcon>
            <InputText
              v-model="searchText"
              placeholder="Tìm kiếm..."
              @keypress.enter="onSearchKeyPress" />
          </IconField>
        </template>
      </Toolbar>

      <!-- Data table -->
      <DataTable
        ref="dt"
        v-model:selection="selectedQueueRooms"
        :value="queueRooms"
        :lazy="true"
        :loading="loading"
        :paginator="true"
        :rows="rows"
        :first="first"
        :totalRecords="totalRecords"
        :rowsPerPageOptions="TABLE_CONFIG.rowsPerPageOptions"
        selectionMode="single"
        dataKey="id"
        :sortField="sortField"
        :sortOrder="sortOrder"
        @page="onPage"
        @sort="onSort"
        :currentPageReportTemplate="'Hiển thị {first} đến {last} của {totalRecords} bản ghi'"
        :paginatorTemplate="'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'"
      >
        <!-- Columns -->
        <Column selectionMode="multiple" style="width: 3rem" :exportable="false" />
        <Column field="queueRoomCode" header="Mã phòng xếp số" sortable />
        <Column field="queueRoomName" header="Tên phòng xếp số" sortable />
        <Column field="description" header="Mô tả" sortable />
        <Column field="queueRoomType" header="Loại phòng xếp số" sortable>
          <template #body="{ data }">
            <span>{{ getQueueRoomTypeLabel(data.queueRoomType) }}</span>
          </template>
        </Column>
        <Column field="isActive" header="Trạng thái" sortable>
          <template #body="{ data }">
            <Tag :value="data.isActive ? 'Kích hoạt' : 'Ngừng'"
                 :severity="getStatusLabel(data.isActive)" />
          </template>
        </Column>
        <Column style="min-width: 10rem" :exportable="false">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="showQueueRoomDialog(data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteQueueRoom(data.id)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <!-- Dialog form -->
  <Dialog v-model:visible="queueRoomDialog"
          :style="{ width: '400px', maxWidth: '98vw' }"
          header="Thông tin phòng"
          :modal="true">
    <form id="queueRoomForm" @submit.prevent="saveQueueRoom" class="p-fluid">
      <div class="grid gap-3">
        <!-- Mã phòng -->
        <div class="col-12">
          <label class="mb-2">Mã phòng:</label>
          <InputText v-model.trim="queueRoomForm.queueRoomCode"
                     :invalid="submitted && !queueRoomForm.queueRoomCode"
                     placeholder="Nhập mã phòng"
                     autofocus
                     class="w-full" />
          <small v-if="submitted && !queueRoomForm.queueRoomCode" class="text-danger">Mã phòng là bắt buộc.</small>
        </div>

        <!-- Tên phòng -->
        <div class="col-12">
          <label class="mb-2">Tên phòng:</label>
          <InputText v-model.trim="queueRoomForm.queueRoomName"
                     :invalid="submitted && !queueRoomForm.queueRoomName"
                     placeholder="Nhập tên phòng"
                     class="w-full" />
          <small v-if="submitted && !queueRoomForm.queueRoomName" class="text-danger">Tên phòng là bắt buộc.</small>
        </div>

        <!-- Mô tả -->
        <div class="col-12">
          <label class="mb-2">Mô tả:</label>
          <Textarea v-model.trim="queueRoomForm.description"
                    :invalid="submitted && !queueRoomForm.description"
                    placeholder="Nhập mô tả"
                    class="w-full" />
          <small v-if="submitted && !queueRoomForm.description" class="text-danger">Mô tả là bắt buộc.</small>
        </div>

        <!-- Loại phòng -->
        <div class="col-12">
          <label class="mb-2">Loại phòng:</label>
          <Select v-model="queueRoomForm.queueRoomType"
                  :options="queueRoomTypesOptions"
                  :invalid="submitted && !queueRoomForm.queueRoomType"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Chọn loại phòng"
                  class="w-full" />
          <small v-if="submitted && !queueRoomForm.queueRoomType" class="text-danger">Loại phòng là bắt buộc.</small>
        </div>

        <!-- Trạng thái -->
        <div class="col-12">
          <label class="mb-2">Trạng thái:</label>
          <Select v-model="queueRoomForm.isActive"
                  :options="statusOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Chọn trạng thái"
                  class="w-full">
            <template #value="{ value }">
              <Tag v-if="value !== undefined && value !== null"
                   :value="value ? 'Kích hoạt' : 'Ngừng'"
                   :severity="value ? 'success' : 'danger'" />
              <span v-else class="p-dropdown-label p-placeholder">Chọn trạng thái</span>
            </template>
            <template #option="{ option }">
              <Tag :value="option.label"
                   :severity="option.value ? 'success' : 'danger'" />
            </template>
          </Select>
        </div>
      </div>
    </form>
    <template #footer>
      <Button label="Huỷ" icon="pi pi-times" text @click="hideDialog" />
      <Button label="Lưu" icon="pi pi-check" type="submit" form="queueRoomForm" />
    </template>
  </Dialog>

  <!-- Delete confirmation dialogs -->
  <Dialog v-model:visible="deleteProductDialog"
          :style="{ width: '450px' }"
          header="Xác nhận"
          :modal="true">
    <div class="flex items-center gap-4">
      <i class="pi pi-exclamation-triangle !text-3xl" />
      <span v-if="product">Bạn có chắc muốn xóa <b>{{ product.name }}</b>?</span>
    </div>
    <template #footer>
      <Button label="Không" icon="pi pi-times" text @click="deleteProductDialog = false" />
      <Button label="Có" icon="pi pi-check" @click="deleteQueueRoom(product.id)" />
    </template>
  </Dialog>

  <Dialog v-model:visible="deleteProductsDialog"
          :style="{ width: '450px' }"
          header="Xác nhận"
          :modal="true">
    <div class="flex items-center gap-4">
      <i class="pi pi-exclamation-triangle !text-3xl" />
      <span>Bạn có chắc muốn xóa các bản ghi đã chọn?</span>
    </div>
    <template #footer>
      <Button label="Không" icon="pi pi-times" text @click="deleteProductsDialog = false" />
      <Button label="Có" icon="pi pi-check"" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import 'primeflex/primeflex.css'
import { ref, computed, onMounted, reactive } from 'vue'
import { useQueueRoomStore } from '@/stores/queue-room.store'
import { storeToRefs } from 'pinia'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast'
import { TABLE_CONFIG } from '../../../../utils/table-config.util'
import { QueueRoom } from '@/models/queue-room.model'
import { getQueueRoomTypeLabel } from '../utils/queue-room-type.util'

// Interfaces
interface QueueRoomForm {
  id: string | null;
  queueRoomCode: string;
  queueRoomName: string;
  description: string;
  queueRoomType: string;
  isActive: number;
}

interface StatusOption {
  label: string;
  value: boolean;
  severity: string;
}

// Toast
const toast = useToast()

// Store
const queueRoomStore = useQueueRoomStore()
const { queueRooms, loading, pagination, queueRoomTypes } = storeToRefs(queueRoomStore)

// Refs - UI states
const selectedQueueRooms = ref<QueueRoom[]>([])
const searchText = ref<string>('')
const sortField = ref<string>('')
const sortOrder = ref<number>(1)
const queueRoomDialog = ref<boolean>(false)
const submitted = ref<boolean>(false)
const deleteProductDialog = ref<boolean>(false)
const deleteProductsDialog = ref<boolean>(false)
const product = ref<any>(null) // chỉ để placeholder template

// Form state
const queueRoomForm = reactive<QueueRoomForm>({
  id: null,
  queueRoomCode: '',
  queueRoomName: '',
  description: '',
  queueRoomType: '',
  isActive: 1
})

// Options
const statusOptions: StatusOption[] = [
  { label: 'Kích hoạt', value: true, severity: 'success' },
  { label: 'Ngừng', value: false, severity: 'danger' }
]

const queueRoomTypesOptions = computed(() => {
  if (!queueRoomTypes.value) return []
  return Object.entries(queueRoomTypes.value).map(([key, value]) => ({
    label: getQueueRoomTypeLabel(key),
    value: value
  }))
})

// Computed - pagination helpers
const rows = computed(() => Number(pagination.value.limit || 10))
const totalRecords = computed(() => Number(pagination.value.total || 0))
const first = computed(() => Number(((pagination.value.page - 1) * pagination.value.limit) || 0))

// Lifecycle
onMounted(() => {
  fetchData(1, rows.value)
  queueRoomStore.fetchQueueRoomTypes()
})

// Methods

// Reset form when show dialog
function showQueueRoomDialog(queueRoom?: QueueRoom | null) {
  if (queueRoom) {
    Object.assign(queueRoomForm, {
      id: queueRoom.id,
      queueRoomCode: queueRoom.queueRoomCode,
      queueRoomName: queueRoom.queueRoomName,
      description: queueRoom.description,
      queueRoomType: queueRoom.queueRoomType,
      isActive: queueRoom.isActive
    })
  } else {
    Object.assign(queueRoomForm, {
      id: null,
      queueRoomCode: '',
      queueRoomName: '',
      description: '',
      queueRoomType: '',
      isActive: 1
    })
  }
  submitted.value = false
  queueRoomDialog.value = true
}

function hideDialog() {
  queueRoomDialog.value = false
}

async function saveQueueRoom() {
  submitted.value = true
  if (!queueRoomForm.queueRoomCode || !queueRoomForm.queueRoomName || !queueRoomForm.queueRoomType) return

  try {
    if (queueRoomForm.id) {
      await queueRoomStore.updateQueueRoom(queueRoomForm.id, { ...queueRoomForm })
    } else {
      await queueRoomStore.createQueueRoom({ ...queueRoomForm })
    }
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã lưu thành công', life: 3000 })
    hideDialog()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.response?.data?.message || 'Có lỗi xảy ra', life: 3000 })
  }
}

// Data fetch
function fetchData(page: number, limit: number, search: string = '', sortField: string = '', sortOrder: number = 1) {
  queueRoomStore.fetchQueueRooms({ page, limit, search, sortField, sortOrder })
}

// Pagination & Sorting handlers
function onPage(event: any) {
  fetchData(event.page + 1, event.rows, searchText.value, sortField.value, sortOrder.value)
}

function onSort(event: any) {
  sortField.value = event.sortField || ''
  sortOrder.value = event.sortOrder
  fetchData(1, rows.value, searchText.value, sortField.value, sortOrder.value)
}

// Status label helper
function getStatusLabel(isActive: boolean): string {
  return isActive ? 'success' : 'danger'
}

// Delete
async function deleteQueueRoom(id: string) {
  try {
    await queueRoomStore.deleteQueueRoom(id)
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa thành công', life: 3000 })
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.response?.data?.message || 'Có lỗi xảy ra', life: 3000 })
  }
}

// Search handler (Enter key only)
function onSearchKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    fetchData(1, rows.value, searchText.value, sortField.value, sortOrder.value)
  }
}

</script>