<template>
  <ThemeSwitcher />
  <div class="content">
    <div class="card">
      <Toolbar>
        <template #start>
          <Button label="Thêm" icon="pi pi-plus" class="mr-2" @click="() => showQueueClinicRoomDialog()" />
          <Button label="Xóa" icon="pi pi-trash" severity="danger" class="mr-2" />
        </template>
        <template #center>
          <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" customUpload chooseLabel="Import" class="mr-2" auto :chooseButtonProps="{ severity: 'secondary' }" />
          <Button label="Export" icon="pi pi-upload" severity="secondary" />
        </template>
        <template #end>
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="searchText" placeholder="Tìm kiếm..." @keypress="onSearchKeyPress" />
          </IconField>
        </template>
      </Toolbar>

      <DataTable
        ref="dt"
        v-model:selection="selectedQueueClinicRooms"
        :lazy="true"
        :value="queueClinicRooms"
        selectionMode="single"
        dataKey="id"
        :paginator="true"
        :rows="rows"
        :totalRecords="totalRecords"
        :loading="loading"
        :first="first"
        :rowsPerPageOptions="TABLE_CONFIG.rowsPerPageOptions"
        :currentPageReportTemplate="'Hiển thị {first} đến {last} của {totalRecords} bản ghi'"
        :paginatorTemplate="'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'"
        @page="onPage"
        :sortField="sortField"
        :sortOrder="sortOrder"
        @sort="onSort"
      >
        <Column selectionMode="multiple" style="width: 3rem" :exportable="false" />
        <Column field="queueRoom.queueRoomCode" header="Mã phòng xếp số" sortable />
        <Column field="queueRoom.queueRoomName" header="Tên phòng xếp số" sortable />
        <Column field="queueRoom.description" header="Mô tả" sortable />
        <Column field="queueRoom.queueRoomType" header="Loại phòng xếp số" sortable>
          <template #body="{ data }">
            <span>{{ getQueueRoomTypeLabel(data.queueRoom.queueRoomType) }}</span>
          </template>
        </Column>
        <Column field="clinicRoomCode" header="Mã phòng thực hiện" sortable />
        <Column field="clinicRoomName" header="Tên phòng thực hiện" sortable />
        <Column field="isActive" header="Trạng thái" sortable>
          <template #body="{ data }">
            <Tag :value="data.isActive ? 'Kích hoạt' : 'Ngừng'" :severity="getStatusLabel(data.isActive)" />
          </template>
        </Column>
        <Column :exportable="false" style="min-width: 10rem">
          <template #body="{ data }">
            <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="showQueueClinicRoomDialog(data)" />
            <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteQueueClinicRoom(data.id)" />
          </template>
        </Column>
      </DataTable>
    </div>
  </div>

  <Dialog v-model:visible="queueClinicRoomDialog" :style="{ width: '600px', maxWidth: '98vw' }" header="Thông tin phòng" :modal="true">
    <form id="queueClinicRoomForm" @submit.prevent="saveQueueClinicRoom" class="p-fluid">
      <div class="grid gap-3">

        <!-- AutoComplete QueueRoom -->
        <div class="col-12">
          <label class="mb-2">Chọn phòng cấp số:</label>
          <AutoComplete
            v-model="selectedQueueRoom"
            :suggestions="queueRoomSuggestions"
            :loading="loadingQueueRoom"
            optionLabel="queueRoomName"
            :minLength="1"
            @complete="onSearchQueueRoom"
            @show="onShowQueueRoomDropdown"
            placeholder="Tìm phòng cấp số"
            fluid
            dropdown
          >
            <template #option="{ option }">
              <div style="white-space: normal;">
                <strong>{{ option.queueRoomCode }}</strong> - {{ option.queueRoomName }}
                <span v-if="option.description"><br /><i>{{ option.description }}</i></span>
              </div>
            </template>
          </AutoComplete>
          <small v-if="submitted && !selectedQueueRoom" class="text-danger">Vui lòng chọn phòng cấp số.</small>
        </div>

        <!-- AutoComplete ClinicRoom -->
        <div class="col-12">
          <label class="mb-2">Chọn phòng xử lý khám/cls...:</label>
          <AutoComplete
            v-model="selectedClinicRoom"
            :suggestions="clinicRoomSuggestions"
            :loading="loadingClinicRoom"
            optionLabel="clinicName"
            :minLength="1"
            @complete="onSearchClinicRoom"
            @show="onShowClinicRoomDropdown"
            placeholder="Tìm kiếm phòng khám"
            fluid
            dropdown
          >
            <template #option="{ option }">
              <div style="white-space: normal;">
                <strong><i>{{ option.roomTypeName }}</i></strong>
                <br /> - {{ option.clinicCode }} - {{ option.clinicName }}
                <span v-if="option.address"><br /><i>- Địa chỉ: {{ option.address }}</i></span>
              </div>
            </template>
          </AutoComplete>
          <small v-if="submitted && !selectedClinicRoom" class="text-danger">Vui lòng chọn phòng xử lý khám/cls...</small>
        </div>

        <!-- Description -->
        <div class="col-12">
          <label class="mb-2">Mô tả:</label>
          <Textarea v-model.trim="queueClinicRoomForm.description" placeholder="Nhập mô tả" class="w-full" />
          <small v-if="submitted && !queueClinicRoomForm.description && queueClinicRoomForm.description.length === 0" class="text-danger">Mô tả là bắt buộc.</small>
        </div>

        <!-- Status -->
        <div class="col-12">
          <label class="mb-2">Trạng thái:</label>
          <Select
            v-model="queueClinicRoomForm.isActive"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn trạng thái"
            class="w-full"
          >
            <template #value="{ value }">
              <Tag v-if="value !== undefined && value !== null" :value="value ? 'Kích hoạt' : 'Ngừng'" :severity="value ? 'success' : 'danger'" class="mr-2" />
              <span v-else class="p-dropdown-label p-placeholder">Chọn trạng thái</span>
            </template>
            <template #option="{ option }">
              <Tag :value="option.label" :severity="option.value ? 'success' : 'danger'" class="mr-2" />
            </template>
          </Select>
        </div>

      </div>
    </form>
    <template #footer>
      <Button label="Huỷ" icon="pi pi-times" text @click="hideDialog" />
      <Button label="Lưu" icon="pi pi-check" type="submit" form="queueClinicRoomForm" />
    </template>
  </Dialog>

  <!-- Delete dialogs (template không thay đổi, giữ nguyên) -->
  <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
    <div class="flex items-center gap-4">
      <i class="pi pi-exclamation-triangle !text-3xl" />
      <span v-if="product">Are you sure you want to delete <b>{{ product.name }}</b>?</span>
    </div>
    <template #footer>
      <Button label="No" icon="pi pi-times" text @click="deleteProductDialog = false" />
      <Button label="Yes" icon="pi pi-check" @click="deleteProduct" />
    </template>
  </Dialog>

  <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
    <div class="flex items-center gap-4">
      <i class="pi pi-exclamation-triangle !text-3xl" />
      <span v-if="product">Are you sure you want to delete the selected products?</span>
    </div>
    <template #footer>
      <Button label="No" icon="pi pi-times" text @click="deleteProductsDialog = false" />
      <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedProducts" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import 'primeflex/primeflex.css'
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import { useToast } from 'primevue/usetoast'

import { useQueueClinicRoomStore } from '@/stores/queue-clinic-room.store'
import { useClinicStore } from '@/stores/clinic.store'
import { useQueueRoomStore } from '@/stores/queue-room.store'

import { QueueClinicRoom } from '@/models/queue-clinic-room.model'
import Select from 'primevue/select'
import AutoComplete from 'primevue/autocomplete'
import { TABLE_CONFIG } from '../../../../utils/table-config.util'
import { getQueueRoomTypeLabel } from '../utils/queue-room-type.util'

/** ================================
 * Interface declarations
 ==================================== */
interface QueueClinicRoomForm {
  id: string | null
  queueRoomId: string
  clinicRoomId: number
  clinicRoomCode: string
  clinicRoomName: string
  description: string
  isActive: number
}

interface StatusOption {
  label: string
  value: boolean
  severity: string
}

/** ================================
 * Constants / Refs / Stores
 ==================================== */
const toast = useToast()

// Store instances
const queueClinicRoomStore = useQueueClinicRoomStore()
const { queueClinicRooms, loading, pagination } = storeToRefs(queueClinicRoomStore)

const clinicStore = useClinicStore()
const queueRoomStore = useQueueRoomStore()

// UI related refs
const queueClinicRoomDialog = ref(false)
const submitted = ref(false)
const selectedQueueClinicRooms = ref<QueueClinicRoom[]>([])
const searchText = ref('')
const sortField = ref('')
const sortOrder = ref(1)

// Status dropdown options
const statusOptions: StatusOption[] = [
  { label: 'Kích hoạt', value: true, severity: 'success' },
  { label: 'Ngừng', value: false, severity: 'danger' }
]

// Form model
const queueClinicRoomForm = reactive<QueueClinicRoomForm>({
  id: null,
  queueRoomId: '',
  clinicRoomId: 0,
  clinicRoomCode: '',
  clinicRoomName: '',
  description: '',
  isActive: 1
})

/** ================================
 * AutoComplete: QueueRoom helpers
 ==================================== */
const selectedQueueRoom = ref<any>(null)
const queueRoomSuggestions = ref<any[]>([])
const loadingQueueRoom = ref(false)

// Common paging state for queueRoom
const queueRoomPage = ref(1)
const queueRoomHasNextPage = ref(true)

watch(selectedQueueRoom, (val) => {
  queueClinicRoomForm.queueRoomId = val ? val.id : ''
})

// Load first page or reset search
async function onShowQueueRoomDropdown() {
  queueRoomPage.value = 1
  queueRoomHasNextPage.value = true
  await fetchQueueRoomSuggestions('', 1)
}

// Trigger search API on typing
async function onSearchQueueRoom(event: any) {
  queueRoomPage.value = 1
  queueRoomHasNextPage.value = true
  await fetchQueueRoomSuggestions(event.query, 1)
}

// API fetch
async function fetchQueueRoomSuggestions(query = '', page = 1) {
  loadingQueueRoom.value = true
  try {
    const res = await queueRoomStore.fetchQueueRooms({ search: query, page, limit: 10 })
    const data = res.data || []
    queueRoomSuggestions.value = page === 1 ? data : [...queueRoomSuggestions.value, ...data]
    queueRoomHasNextPage.value = data.length === 10
  } finally {
    loadingQueueRoom.value = false
  }
}

/** ================================
 * AutoComplete: ClinicRoom helpers
 ==================================== */
const selectedClinicRoom = ref<any>(null)
const clinicRoomSuggestions = ref<any[]>([])
const loadingClinicRoom = ref(false)

const clinicRoomPage = ref(1)
const clinicRoomHasNextPage = ref(true)

watch(selectedClinicRoom, (val) => {
  if (val) {
    queueClinicRoomForm.clinicRoomId = val.id
    queueClinicRoomForm.clinicRoomCode = val.clinicCode
    queueClinicRoomForm.clinicRoomName = val.clinicName
  } else {
    queueClinicRoomForm.clinicRoomId = 0
    queueClinicRoomForm.clinicRoomCode = ''
    queueClinicRoomForm.clinicRoomName = ''
  }
})

async function onShowClinicRoomDropdown() {
  clinicRoomPage.value = 1
  clinicRoomHasNextPage.value = true
  await fetchClinicRoomSuggestions('', 1)
}

async function onSearchClinicRoom(event: any) {
  clinicRoomPage.value = 1
  clinicRoomHasNextPage.value = true
  await fetchClinicRoomSuggestions(event.query, 1)
}

async function fetchClinicRoomSuggestions(query = '', page = 1) {
  loadingClinicRoom.value = true
  try {
    const res = await clinicStore.fetchRoomForQueue({ search: query, page, limit: 10 })
    const data = res.data || []
    clinicRoomSuggestions.value = page === 1 ? data : [...clinicRoomSuggestions.value, ...data]
    clinicRoomHasNextPage.value = data.length === 10
  } finally {
    loadingClinicRoom.value = false
  }
}

/** ================================
 * CRUD dialog helpers
 ==================================== */
function showQueueClinicRoomDialog(data?: QueueClinicRoom | null) {
  if (data) {
    // Edit mode: populate form + selected fields
    selectedQueueRoom.value = { id: data.queueRoomId, queueRoomName: data.queueRoom?.queueRoomName, queueRoomCode: data.queueRoom?.queueRoomCode }
    selectedClinicRoom.value = { id: data.clinicRoomId, clinicCode: data.clinicRoomCode, clinicName: data.clinicRoomName }
    Object.assign(queueClinicRoomForm, { ...data })
  } else {
    // Create mode: reset form
    selectedQueueRoom.value = null
    selectedClinicRoom.value = null
    Object.assign(queueClinicRoomForm, {
      id: null, queueRoomId: '', clinicRoomId: 0, clinicRoomCode: '', clinicRoomName: '', description: '', isActive: 1
    })
  }
  submitted.value = false
  queueClinicRoomDialog.value = true
}

function hideDialog() {
  queueClinicRoomDialog.value = false
}

async function saveQueueClinicRoom() {
  submitted.value = true
  if (!queueClinicRoomForm.queueRoomId || !queueClinicRoomForm.clinicRoomId || !queueClinicRoomForm.description) return
  try {
    if (queueClinicRoomForm.id) {
      await queueClinicRoomStore.updateQueueClinicRoom(queueClinicRoomForm.id, { ...queueClinicRoomForm })
    } else {
      await queueClinicRoomStore.createQueueClinicRoom({ ...queueClinicRoomForm })
    }
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã lưu thành công', life: 5000 })
    hideDialog()
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: err.response?.data?.message || 'Có lỗi xảy ra', life: 5000 })
  }
}

/** ================================
 * DataTable handlers
 ==================================== */
const rows = computed(() => Number(pagination.value.limit || 10))
const totalRecords = computed(() => Number(pagination.value.total || 0))
const first = computed(() => Number(((pagination.value.page - 1) * pagination.value.limit) || 0))

onMounted(() => fetchData(1, rows.value, searchText.value, sortField.value, sortOrder.value))

function onSearchKeyPress(event: KeyboardEvent) {
  if (event.key === 'Enter') {
    fetchData(1, rows.value, searchText.value, sortField.value, sortOrder.value)
  }
}

function fetchData(page: number, limit: number, search: string, sortField: string, sortOrder: number) {
  queueClinicRoomStore.fetchQueueClinicRooms({ page, limit, search, sortField, sortOrder })
}

function onPage(event: any) {
  fetchData(event.page + 1, event.rows, searchText.value, sortField.value, sortOrder.value)
}

function onSort(event: any) {
  sortField.value = event.sortField || ''
  sortOrder.value = event.sortOrder
  fetchData(1, rows.value, searchText.value, sortField.value, sortOrder.value)
}

function getStatusLabel(isActive: boolean) {
  return isActive ? 'success' : 'danger'
}

async function deleteQueueClinicRoom(id: string) {
  try {
    await queueClinicRoomStore.deleteQueueClinicRoom(id)
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa thành công', life: 5000 })
  } catch (err: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: err.response?.data?.message || 'Có lỗi xảy ra', life: 5000 })
  }
}

/** ================================
 * Placeholder dialog compatibility
 ==================================== */
const deleteProductDialog = ref(false)
const deleteProductsDialog = ref(false)
const product = ref<any>(null)

function deleteProduct() {}
function deleteSelectedProducts() {}
</script>
