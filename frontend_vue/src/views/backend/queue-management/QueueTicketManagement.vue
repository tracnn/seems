<template>
    <ThemeSwitcher />
    <div class="content">
      <div class="card">
        <Toolbar>
          <template #start>
            <Button label="Thêm" icon="pi pi-plus" class="mr-2" @click="() => showQueueTicketDialog()" />
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
          v-model:selection="selectedQueueTickets"
          :lazy="true"
          :value="queueTickets"
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
              <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="showQueueTicketDialog(data)" />
              <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteQueueTicket()" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  
    <Dialog v-model:visible="queueTicketDialog" :style="{ width: '600px', maxWidth: '98vw' }" header="Thông tin phòng" :modal="true">
      <form id="queueTicketForm" @submit.prevent="saveQueueTicket" class="p-fluid">
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
              v-model="selectedRoom"
              :suggestions="roomSuggestions"
              :loading="loadingRoom"
              optionLabel="roomName"
              :minLength="1"
              @complete="onSearchQueueRoom"
              @show="onShowQueueRoomDropdown"
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
            <small v-if="submitted && !selectedRoom" class="text-danger">Vui lòng chọn phòng xử lý khám/cls...</small>
          </div>
  
          <!-- Description -->
          <div class="col-12">
            <label class="mb-2">Mô tả:</label>
            <Textarea v-model.trim="queueTicketForm.serviceReqCodes" placeholder="Nhập mô tả" class="w-full" />
            <small v-if="submitted && !queueTicketForm.serviceReqCodes && queueTicketForm.serviceReqCodes.length === 0" class="text-danger">Mô tả là bắt buộc.</small>
          </div>
  
          <!-- Status -->
          <div class="col-12">
            <label class="mb-2">Trạng thái:</label>
            <Select
              v-model="queueTicketForm.isActive"
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
        <Button label="Lưu" icon="pi pi-check" type="submit" form="queueTicketForm" />
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
        <Button label="Yes" icon="pi pi-check" @click="deleteQueueTicket" />
      </template>
    </Dialog>
  
    <Dialog v-model:visible="deleteProductsDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
      <div class="flex items-center gap-4">
        <i class="pi pi-exclamation-triangle !text-3xl" />
        <span v-if="product">Are you sure you want to delete the selected products?</span>
      </div>
      <template #footer>
        <Button label="No" icon="pi pi-times" text @click="deleteProductsDialog = false" />
        <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedQueueTickets" />
      </template>
    </Dialog>
  </template>
  
  <script setup lang="ts">
  import 'primeflex/primeflex.css'
  import { ref, computed, onMounted, watch, reactive } from 'vue'
  import { storeToRefs } from 'pinia'
  import { useToast } from 'primevue/usetoast'
  
  import { useQueueTicketStore } from '@/stores/queue-ticket.store'
  import { useQueueRoomStore } from '@/stores/queue-room.store'

  import { getQueueRoomTypeLabel } from './utils/queue-room-type.util'
  
  import { QueueTicket, QueueTicketType, QueueTicketStatus } from '@/models/queue-ticket.model'
  import Select from 'primevue/select'
  import AutoComplete from 'primevue/autocomplete'
  import { TABLE_CONFIG } from '@/utils/table-config.util'
  
  /** ================================
   * Interface declarations
   ==================================== */
  interface QueueTicketForm {
    id: string | null
    userId: string
    queueRoomId: string
    roomId: number
    roomCode: string
    roomName: string
    patientId: number
    patientCode: string
    patientFullName: string
    treatmentId: number
    treatmentCode: string
    serviceReqCodes: string
    queueTicketType: QueueTicketType
    queueTicketStatus: QueueTicketStatus
    queueNumber: number
    registeredDate: string
    isActive: number
    clinicRoomId: number
    clinicRoomCode: string
    clinicRoomName: string
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
  const queueTicketStore = useQueueTicketStore()
  const { queueTickets, loading, pagination } = storeToRefs(queueTicketStore)
  
  const queueRoomStore = useQueueRoomStore()
  
  // UI related refs
  const queueTicketDialog = ref(false)
  const submitted = ref(false)
  const selectedQueueTickets = ref<QueueTicket[]>([])
  const searchText = ref('')
  const sortField = ref('')
  const sortOrder = ref(1)
  
  // Status dropdown options
  const statusOptions: StatusOption[] = [
    { label: 'Kích hoạt', value: true, severity: 'success' },
    { label: 'Ngừng', value: false, severity: 'danger' }
  ]
  
  // Form model
  const queueTicketForm = reactive<QueueTicketForm>({
    id: null,
    userId: '',
    queueRoomId: '',
    roomId: 0,
    roomCode: '',
    roomName: '',
    patientId: 0,
    patientCode: '',
    patientFullName: '',
    treatmentId: 0,
    treatmentCode: '',
    serviceReqCodes: '',
    queueTicketType: QueueTicketType.RECEPTION,
    queueTicketStatus: QueueTicketStatus.REGISTERED,
    queueNumber: 0,
    registeredDate: '',
    isActive: 1,
    clinicRoomId: 0,
    clinicRoomCode: '',
    clinicRoomName: ''
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
    queueTicketForm.queueRoomId = val ? val.id : ''
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
  const selectedRoom = ref<any>(null)
  const roomSuggestions = ref<any[]>([])
  const loadingRoom = ref(false)
  
  
  watch(selectedRoom, (val) => {
    if (val) {
      queueTicketForm.roomId = val.id
      queueTicketForm.roomCode = val.roomCode
      queueTicketForm.roomName = val.roomName
    } else {
      queueTicketForm.roomId = 0
      queueTicketForm.roomCode = ''
      queueTicketForm.roomName = ''
    }
  })
  

  
  /** ================================
   * CRUD dialog helpers
   ==================================== */
  function showQueueTicketDialog(data?: QueueTicket | null) {
    if (data) {
      // Edit mode: populate form + selected fields
      selectedQueueRoom.value = { id: data.queueRoomId, queueRoomName: data.queueRoom?.queueRoomName, queueRoomCode: data.queueRoom?.queueRoomCode }
      selectedRoom.value = { id: data.roomId, roomCode: data.roomCode, roomName: data.roomName }
      Object.assign(queueTicketForm, { ...data })
    } else {
      // Create mode: reset form
      selectedQueueRoom.value = null
      selectedRoom.value = null
      Object.assign(queueTicketForm, {
        id: null, queueRoomId: '', roomId: 0, roomCode: '', roomName: '', isActive: 1
      })
    }
    submitted.value = false
    queueTicketDialog.value = true
  }
  
  function hideDialog() {
    queueTicketDialog.value = false
  }
  
  async function saveQueueTicket() {
    submitted.value = true
    if (!queueTicketForm.queueRoomId || !queueTicketForm.roomId) return
    try {
      if (queueTicketForm.id) {
        await queueTicketStore.updateQueueTicket(queueTicketForm.id, { ...queueTicketForm })
      } else {
        await queueTicketStore.createQueueTicket({ ...queueTicketForm })
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
    queueTicketStore.fetchQueueTickets({ page, limit, search, sortField, sortOrder })
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
  
  /** ================================
   * Placeholder dialog compatibility
   ==================================== */
  const deleteProductDialog = ref(false)
  const deleteProductsDialog = ref(false)
  const product = ref<any>(null)
  
  function deleteQueueTicket() {}
  function deleteSelectedQueueTickets() {}
  </script>
  