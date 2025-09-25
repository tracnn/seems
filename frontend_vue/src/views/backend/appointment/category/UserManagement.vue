
<template>
  <Toast />
  <ThemeSwitcher />
  <div class="content">
      <div class="card">
          <Toolbar>
              <template #start>
                  <Button label="Thêm" icon="pi pi-plus" @click="showUserDialog({})" class="mr-2" />
                  <Button label="Xóa" icon="pi pi-trash" severity="danger" class="mr-2" />
              </template>
              <template #center>
                  <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" customUpload chooseLabel="Import" auto :chooseButtonProps="{ severity: 'secondary' }" class="mr-2" />
                  <Button label="Export" icon="pi pi-upload" severity="secondary" class="mr-2" />
              </template>
              <template #end>
                  <IconField>
                      <InputIcon>
                          <i class="pi pi-search" />
                      </InputIcon>
                      <InputText
                          v-model="searchText"
                          placeholder="Tìm kiếm..."
                          @keydown.enter="onSearch"
                      />
                  </IconField>
              </template>
          </Toolbar>
          <DataTable
              ref="dt"
              v-model:selection="selectedUsers"
              :lazy="true"
              :value="users"
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
              :resizableColumns="true"
          >
              <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
              <Column field="username" header="Tên đăng nhập" sortable></Column>
              <Column field="fullName" header="Họ tên" sortable></Column>            
              <Column field="birthDate" header="Ngày sinh" sortable></Column>
              <Column field="phoneNumber" header="Số điện thoại" sortable></Column>
              <Column field="genderCode" header="Giới tính" sortable>
                  <template #body="slotProps">
                      <span v-if="slotProps.data.genderCode === 1">Nữ</span>
                      <span v-else-if="slotProps.data.genderCode === 2">Nam</span>
                      <span class="text-warning" v-else>Không xác định</span>
                  </template>
              </Column>
              <Column field="identityNumber" header="Số CCCD" sortable></Column>
              <Column field="heinCardNumber" header="Số thẻ BHYT" sortable></Column>
              <Column field="address" header="Địa chỉ" sortable></Column>
              <Column field="createdAt" header="Ngày tạo" sortable>
                  <template #body="slotProps">
                      {{ dayjs(slotProps.data.createdAt).format('DD/MM/YYYY HH:mm') }}
                  </template>
              </Column>
              <Column field="isActive" header="Trạng thái" sortable>
                  <template #body="slotProps">
                      <Tag :value="slotProps.data.isActive ? 'Kích hoạt' : 'Ngừng'" :severity="getStatusLabel(slotProps.data.isActive)" />
                  </template>
              </Column>
              <Column :exportable="false" style="min-width: 10rem">
                  <template #body="slotProps">
                      <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="showUserDialog(slotProps.data)" />
                      <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteUser(slotProps.data.id)" />
                  </template>
              </Column>
          </DataTable>
      </div>
  </div>

  <Dialog
    v-model:visible="userDialog"
    :style="{ width: '430px', maxWidth: '98vw' }"
    header="Thông tin người dùng"
    :modal="true"
>
    <form id="userForm" @submit.prevent="saveUser" class="p-fluid space-y-4">
        <!-- Thông tin chỉ hiển thị -->
        <div class="p-3 bg-gray-50 rounded mb-3 border">
            <div class="mb-2">
                <label class="font-semibold text-gray-600">Họ tên:</label>
                <span class="ml-2">{{ userForm.fullName }}</span>
            </div>
            <div>
                <label class="font-semibold text-gray-600">Tên đăng nhập:</label>
                <span class="ml-2">{{ userForm.username }}</span>
            </div>
        </div>

        <!-- Thông tin có thể chỉnh sửa -->
        <div>
            <label for="phoneNumber" class="mb-1 font-semibold">Số điện thoại</label>
            <InputText
                id="phoneNumber"
                v-model="userForm.phoneNumber"
                :invalid="submitted && !userForm.phoneNumber"
                placeholder="Nhập số điện thoại"
                class="w-full"
            />
            <small v-if="submitted && !userForm.phoneNumber" class="text-danger">Số điện thoại là bắt buộc.</small>
        </div>

        <div>
            <label for="birthDate" class="mb-1 font-semibold">Ngày sinh</label>
            <InputText
                id="birthDate"
                v-model="userForm.birthDate"
                :invalid="submitted && !userForm.birthDate"
                placeholder="Nhập ngày sinh"
                class="w-full"
            />
            <small v-if="submitted && !userForm.birthDate" class="text-danger">Ngày sinh là bắt buộc.</small>
        </div>

        <div>
            <label for="identityNumber" class="mb-1 font-semibold">Số CCCD</label>
            <InputText
                id="identityNumber"
                v-model="userForm.identityNumber"
                :invalid="submitted && !userForm.identityNumber"
                placeholder="Nhập số CCCD"
                class="w-full"
            />
            <small v-if="submitted && !userForm.identityNumber" class="text-danger">Số CCCD là bắt buộc.</small>
        </div>

        <div>
            <label for="genderCode" class="mb-1 font-semibold">Giới tính</label>
            <Select
                id="genderCode"
                v-model="userForm.genderCode"
                :options="genderOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Chọn giới tính"
                class="w-full"
            />
        </div>

        <div>
            <label for="isActive" class="mb-1 font-semibold">Trạng thái</label>
            <Select
                id="isActive"
                v-model="userForm.isActive"
                :options="statusOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Chọn trạng thái"
                class="w-full"
            >
                <template #value="slotProps">
                    <Tag
                        v-if="slotProps.value !== undefined && slotProps.value !== null"
                        :value="slotProps.value ? 'Kích hoạt' : 'Ngừng' "
                        :severity="slotProps.value ? 'success' : 'danger'"
                        class="mr-2"
                    />
                    <span v-else class="p-dropdown-label p-placeholder">Chọn trạng thái</span>
                </template>
                <template #option="slotProps">
                    <Tag
                        :value="slotProps.option.label"
                        :severity="slotProps.option.value ? 'success' : 'danger'"
                        class="mr-2"
                    />
                </template>
            </Select>
        </div>
        <div>
          <label class="mb-1 font-semibold">Quốc gia (National)</label>
          <ServerSelect
            v-model="userForm.nationalId"
            :fetcher="fetchNationals"
            :resolveByValue="resolveNationalById"
            :columns="nationalColumns"
            optionLabel="nationalName"
            optionValue="id"
            dataKeyField="id"
            placeholder="Chọn quốc gia"
            :pageSize="10"
            :overlayWidth="640"
          />
          <small v-if="submitted && !userForm.nationalId" class="text-danger">Quốc gia là bắt buộc.</small>
        </div>
    </form>

    <template #footer>
        <div class="flex justify-end gap-2">
            <Button label="Huỷ" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Lưu" icon="pi pi-check" type="submit" form="userForm" :loading="loading" />
        </div>
    </template>
</Dialog>

</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
dayjs.extend(customParseFormat)

import Select from 'primevue/select'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'

// CSS (nếu dự án bạn đã import primeflex ở main.ts thì có thể bỏ dòng này)
import 'primeflex/primeflex.css'

import { TABLE_CONFIG } from '../../../../utils/table-config.util'
import type { User } from '@/models/user.model'
import ServerSelect from '@/components/ServerSelect.vue'
import { useUserStore } from '@/stores/user.store'
import { useNationalStore } from '@/stores/national.store'
import Tag from 'primevue/tag'

const nationalStore = useNationalStore()
const userStore = useUserStore()
const { users, loading, pagination } = storeToRefs(userStore)

// ===== Types =====
interface ExtendedUser extends User {
  username: string
  phoneNumber: string
  fullName: string
  birthDate: string
  genderCode: number
  identityNumber: string
  heinCardNumber: string
  address: string
}

interface UserForm {
  id: string | null
  username: string
  email: string | null
  phoneNumber: string
  fullName: string
  birthDate: string
  genderCode: number
  identityNumber: string
  heinCardNumber: string
  address: string
  isActive: boolean
  nationalId: number | null
}

interface StatusOption {
  label: string
  value: boolean
  severity: string
}

const genderOptions = [
  { label: 'Nữ', value: 1},
  { label: 'Nam', value: 2},
  { label: 'Không xác định', value: 3}
]

// ===== Columns cho ServerSelect =====
const nationalColumns = [
  { field: 'nationalCode', header: 'Mã', width: '140px' },
  { field: 'nationalName', header: 'Quốc gia' }
]

// Nới lỏng tham số để tránh TS lỗi khi thiếu field
type FetcherParams = {
  page: number
  limit: number
  search?: string
  sortField?: string
  sortOrder?: number
}

const fetchNationals = async ({
  page,
  limit,
  search = '',
  sortField = '',
  sortOrder = 1
}: FetcherParams) => {
  const res = await nationalStore.fetchNationals({
    page,
    limit,
    search,
    sortField,
    sortOrder,
    isActive: true
  })
  return res // { data, pagination }
}

// Resolver khi form vào chế độ sửa có sẵn nationalId
const nationalCache = new Map<number, any>()
const resolveNationalById = async (value: number | number[] | null) => {
  if (!value) return null
  if (Array.isArray(value)) {
    const miss = value.filter(id => !nationalCache.has(id))
    if (miss.length) {
      const rows = await nationalStore.resolveNationalsByIds(miss)
      rows.forEach((r: any) => nationalCache.set(r.id, r))
    }
    return value.map(id => nationalCache.get(id)).filter(Boolean)
  } else {
    if (!nationalCache.has(value)) {
      const row = await nationalStore.fetchNationalById(value)
      if (row) nationalCache.set(value, row)
    }
    return nationalCache.get(value) ?? null
  }
}

// ===== PrimeVue helpers =====
const toast = useToast()
const confirm = useConfirm() // NHỚ thêm <ConfirmDialog /> trong template

// ===== Refs/State =====
const selectedUsers = ref<ExtendedUser[]>([]) // Nếu bạn dùng selectionMode="single", nên đổi thành ref<ExtendedUser|null>(null)
const searchText = ref<string>('')
const sortField = ref<string>('')
const sortOrder = ref<number>(1)
const userDialog = ref<boolean>(false)
const submitted = ref<boolean>(false)

const statusOptions: StatusOption[] = [
  { label: 'Kích hoạt', value: true, severity: 'success' },
  { label: 'Ngừng', value: false, severity: 'danger' }
]

const userForm = reactive<UserForm>({
  id: null,
  username: '',
  email: null,
  phoneNumber: '',
  fullName: '',
  birthDate: '',
  genderCode: 0,
  identityNumber: '',
  heinCardNumber: '',
  address: '',
  isActive: true,
  nationalId: null
})

// ===== Computed =====
const rows = computed<number>(() => Number(pagination.value?.limit || 10))
const totalRecords = computed<number>(() => Number(pagination.value?.total || 0))
const first = computed<number>(() => {
  const page = Number(pagination.value?.page || 1)
  const limit = Number(pagination.value?.limit || 10)
  return (page - 1) * limit
})

// ===== Methods =====
function showUserDialog(userData: Partial<UserForm> | null = null): void {
  if (userData) {
    // Edit mode
    userForm.id = userData.id ?? null
    userForm.username = userData.username ?? ''
    userForm.email = userData.email ?? null
    userForm.phoneNumber = userData.phoneNumber ?? ''
    userForm.fullName = userData.fullName ?? ''
    userForm.birthDate = userData.birthDate ?? ''
    userForm.genderCode = typeof userData.genderCode === 'number' ? userData.genderCode : 0
    userForm.identityNumber = userData.identityNumber ?? ''
    userForm.heinCardNumber = userData.heinCardNumber ?? ''
    userForm.address = userData.address ?? ''
    userForm.isActive = typeof userData.isActive === 'boolean' ? userData.isActive : true
    userForm.nationalId = userData.nationalId ?? null
  } else {
    // Create mode
    userForm.id = null
    userForm.username = ''
    userForm.email = null
    userForm.phoneNumber = ''
    userForm.fullName = ''
    userForm.birthDate = ''
    userForm.genderCode = 0
    userForm.identityNumber = ''
    userForm.heinCardNumber = ''
    userForm.address = ''
    userForm.isActive = true
    userForm.nationalId = null
  }
  submitted.value = false
  userDialog.value = true
}

function hideDialog(): void {
  userDialog.value = false
}

async function saveUser(): Promise<void> {
  submitted.value = true

  // Validate required fields
  if (!userForm.username || !userForm.phoneNumber || !userForm.fullName || !userForm.birthDate 
  || !userForm.identityNumber || !userForm.nationalId) {
    return
  }

  let errorMessage = ''
  if (!userForm.phoneNumber || !isValidPhoneNumber(userForm.phoneNumber)) {
    errorMessage = 'Số điện thoại phải gồm 10 chữ số.'
  } else if (!userForm.birthDate || !isValidBirthDate(userForm.birthDate)) {
    errorMessage = 'Ngày sinh không đúng định dạng DD/MM/YYYY hoặc không hợp lệ.'
  } else if (!userForm.identityNumber || !isValidIdentityNumber(userForm.identityNumber)) {
    errorMessage = 'Số CCCD/Định danh cá nhân phải gồm 12 chữ số.'
  }

  if (errorMessage) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi nhập liệu',
      detail: errorMessage,
      life: 5000
    })
    return
  }

  // Confirm trước khi lưu
  confirmSaveUser(async () => {
    try {
      if (userForm.id) {
        await userStore.updateUser(userForm.id, { ...userForm })
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã cập nhật thành công', life: 5000 })
      } else {
        const createData = {
          email: userForm.email || null,
          fullName: userForm.fullName,
          birthDate: userForm.birthDate,
          identityNumber: userForm.identityNumber,
          phoneNumber: userForm.phoneNumber,
          nationalId: userForm.nationalId
        }
        await userStore.createUser(createData)
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm thành công', life: 5000 })
      }
      hideDialog()
    } catch (error: any) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: error?.response?.data?.message || 'Có lỗi xảy ra',
        life: 5000
      })
    }
  })
}

async function deleteUser(userId: any): Promise<void> {
  confirm.require({
    message: 'Bạn có chắc chắn xóa không?',
    header: 'Danger Zone',
    icon: 'pi pi-info-circle',
    rejectLabel: 'Cancel',
    rejectProps: { label: 'Cancel', severity: 'secondary', outlined: true },
    acceptProps: { label: 'Delete', severity: 'danger' },
    accept: async () => {
      try {
        await userStore.deleteUser(userId)
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa thành công', life: 5000 })
      } catch (error: any) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: error?.response?.data?.message || 'Có lỗi xảy ra khi xóa',
          life: 5000
        })
      }
    },
    reject: () => {
      toast.add({ severity: 'info', summary: 'Đã huỷ', detail: 'Bạn đã huỷ thao tác xóa', life: 3000 })
    }
  })
}

async function fetchData(page: number, limit: number, search: string, sortF: string, sortO: number): Promise<void> {
  try {
    await userStore.fetchUsers({ page, limit, search, sortField: sortF, sortOrder: sortO })
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error?.response?.data?.message || 'Có lỗi xảy ra khi lấy dữ liệu',
      life: 5000
    })
  }
}

function onPage(event: any): void {
  fetchData(event.page + 1, event.rows, searchText.value, sortField.value, sortOrder.value)
}

function onSort(event: any): void {
  sortField.value = event.sortField || ''
  sortOrder.value = event.sortOrder || 1
  fetchData(1, rows.value, searchText.value, sortField.value, sortOrder.value)
}

function getStatusLabel(isActive: boolean): string {
  return isActive ? 'success' : 'danger'
}

// ===== Validators =====
function isValidBirthDate(dateStr: string): boolean {
  // Đúng định dạng DD/MM/YYYY và hợp lệ theo lịch
  const parsed = dayjs(dateStr, 'DD/MM/YYYY', true)
  return parsed.isValid()
}

function isValidPhoneNumber(phone: string): boolean {
  return /^\d{10}$/.test(phone)
}

function isValidIdentityNumber(cccd: string): boolean {
  return /^\d{12}$/.test(cccd)
}

// Confirm helper (cần <ConfirmDialog /> trong template)
function confirmSaveUser(onAccept: () => Promise<void>) {
  confirm.require({
    message: 'Bạn có chắc chắn muốn lưu thông tin này?',
    header: 'Xác nhận lưu',
    icon: 'pi pi-info-circle',
    rejectLabel: 'Huỷ',
    rejectProps: { label: 'Huỷ', severity: 'secondary', outlined: true },
    acceptProps: { label: 'Lưu', severity: 'success' },
    accept: onAccept,
    reject: () => {
      toast.add({ severity: 'info', summary: 'Đã huỷ', detail: 'Bạn đã huỷ thao tác lưu', life: 3000 })
    }
  })
}

// ===== Lifecycle =====
onMounted(() => {
  fetchData(1, rows.value, searchText.value, sortField.value, sortOrder.value)
})

function onSearch() {
  fetchData(1, rows.value, searchText.value, sortField.value, sortOrder.value)
}
</script>