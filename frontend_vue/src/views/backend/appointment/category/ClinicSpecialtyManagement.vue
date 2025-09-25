<template>
    <Toast />
    <ThemeSwitcher />
    <div class="content">
        <div class="card">
            <Toolbar>
                <template #start>
                    <Button label="Thêm" icon="pi pi-plus" class="mr-2" @click="showClinicSpecialtyDialog()" />
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
                        <InputText v-model="searchText" placeholder="Tìm kiếm..." />
                    </IconField>
                </template>
            </Toolbar>
            <DataTable
                ref="dt"
                v-model:selection="selectedClinicSpecialties"
                :lazy="true"
                :value="clinicSpecialties"
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
                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="clinicCode" header="Mã phòng khám" sortable></Column>
                <Column field="clinicName" header="Tên phòng khám" sortable></Column>
                <Column field="specialtyCode" header="Mã chuyên khoa" sortable></Column>
                <Column field="specialtyName" header="Tên chuyên khoa" sortable></Column>
                <Column field="isActive" header="Trạng thái" sortable>
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.isActive ? 'Kích hoạt' : 'Ngừng'" :severity="getStatusLabel(slotProps.data.isActive)" />
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 10rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="showClinicSpecialtyDialog(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="confirmDeleteClinicSpecialty(slotProps.data)" />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>

    <!-- Dialog Thêm/Sửa -->
    <Dialog v-model:visible="clinicSpecialtyDialog" :style="{ width: '400px', maxWidth: '98vw' }" header="Thêm/Xem sửa thông tin" :modal="true">
        <form id="clinicSpecialtyForm" @submit.prevent="saveClinicSpecialty" class="p-fluid">
            <div class="grid gap-3">
                <div class="col-12 md:col-12">
                    <label for="clinicId" class="mb-2">Phòng khám:</label>
                    <Select
                        id="clinicId"
                        v-model="clinicSpecialtyForm.clinicId"
                        :options="clinicOptions"
                        :loading="clinicLoading"
                        :filter="true"
                        filterPlaceholder="Tìm kiếm phòng khám"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Chọn phòng khám"
                        class="w-full"
                        @filter="onClinicDropdownFilter"
                        @scroll="onClinicDropdownScroll"
                        @change="onClinicChange"
                    />
                    <small v-if="submitted && !clinicSpecialtyForm.clinicId" class="text-danger">Phòng khám là bắt buộc.</small>
                </div>
                <div class="col-12 md:col-12">
                    <label for="specialtyId" class="mb-2">Chuyên khoa:</label>
                    <Select
                        id="specialtyId"
                        v-model="clinicSpecialtyForm.specialtyId"
                        :options="specialtyOptions"
                        :loading="specialtyLoading"
                        :filter="true"
                        filterPlaceholder="Tìm kiếm chuyên khoa"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Chọn chuyên khoa"
                        class="w-full"
                    />
                    <small v-if="submitted && !clinicSpecialtyForm.specialtyId" class="text-danger">Chuyên khoa là bắt buộc.</small>
                </div>
                <div class="col-12 md:col-12">
                    <label for="isActive" class="mb-2">Trạng thái:</label>
                    <Select
                        id="isActive"
                        v-model="clinicSpecialtyForm.isActive"
                        :options="statusOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Chọn trạng thái"
                        class="w-full"
                    >
                        <template #value="slotProps">
                            <Tag
                                v-if="slotProps.value !== undefined && slotProps.value !== null"
                                :value="slotProps.value ? 'Kích hoạt' : 'Ngừng'"
                                :severity="slotProps.value ? 'success' : 'danger'"
                                class="mr-2"
                            />
                            <span v-else class="p-dropdown-label p-placeholder">Chọn trạng thái</span>
                            </template>

                            <!-- Hiển thị Tag cho từng option trong list -->
                            <template #option="slotProps">
                            <Tag
                                :value="slotProps.option.label"
                                :severity="slotProps.option.value ? 'success' : 'danger'"
                                class="mr-2"
                            />
                        </template>
                    </Select>
                </div>
            </div>
        </form>
        <template #footer>
            <Button label="Huỷ" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Lưu" icon="pi pi-check" type="submit" form="clinicSpecialtyForm" />
        </template>
    </Dialog>

    <!-- Dialog xác nhận xóa 1 bản ghi -->
    <Dialog v-model:visible="deleteClinicSpecialtyDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="clinicSpecialty">
                Bạn có chắc chắn muốn xóa <b>{{ clinicSpecialty.clinicName }}</b> không?
            </span>
        </div>
        <template #footer>
            <Button label="Không" icon="pi pi-times" text @click="deleteClinicSpecialtyDialog = false" />
            <Button label="Đồng ý" icon="pi pi-check" @click="deleteClinicSpecialty" />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useClinicSpecialtyStore } from '@/stores/clinic-specialty.store'
import { useClinicStore } from '@/stores/clinic.store'
import { useSpecialtyStore } from '@/stores/specialty.store'
import Select from 'primevue/select'
import { storeToRefs } from 'pinia'
import 'primeflex/primeflex.css'
import { useToast } from 'primevue/usetoast'
import { TABLE_CONFIG } from '../../../../utils/table-config.util'

// Interfaces
interface ClinicSpecialty {
  id: string;
  clinicId: number;
  clinicCode: string;
  clinicName: string;
  specialtyId: string;
  specialtyCode: string;
  specialtyName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClinicSpecialtyForm {
  id: string | null;
  clinicId: number | null;
  clinicCode: string | null;
  clinicName: string | null;
  specialtyId: string | null;
  isActive: boolean;
}

interface StatusOption {
  label: string;
  value: boolean;
  severity: string;
}

interface DropdownOption {
  label: string;
  value: string | number;
}

// Toast
const toast = useToast()

// Stores
const clinicSpecialtyStore = useClinicSpecialtyStore()
const clinicStore = useClinicStore()
const specialtyStore = useSpecialtyStore()

// Store refs
const { clinicSpecialties, loading, pagination } = storeToRefs(clinicSpecialtyStore)
const { clinics, loading: clinicLoading } = storeToRefs(clinicStore)
const { specialties, loading: specialtyLoading } = storeToRefs(specialtyStore)

// Refs
const selectedClinicSpecialties = ref<ClinicSpecialty[]>([])
const searchText = ref<string>('')
const sortField = ref<string>('')
const sortOrder = ref<number>(1)
const clinicSpecialtyDialog = ref<boolean>(false)
const submitted = ref<boolean>(false)
const deleteClinicSpecialtyDialog = ref<boolean>(false)
const clinicSpecialty = ref<ClinicSpecialty | null>(null)

// Status options
const statusOptions: StatusOption[] = [
  { label: 'Kích hoạt', value: true, severity: 'success' },
  { label: 'Ngừng', value: false, severity: 'danger' }
]

// Form
const clinicSpecialtyForm = reactive<ClinicSpecialtyForm>({
  id: null,
  clinicId: null,
  clinicCode: null,
  clinicName: null,
  specialtyId: null,
  isActive: true
})

// Computed properties
const clinicOptions = computed<DropdownOption[]>(() =>
  clinics.value?.map((c: any) => ({
    label: c.clinicName || c.clinicCode,
    value: c.clinicId
  })) || []
)

const specialtyOptions = computed<DropdownOption[]>(() => {
  if (!specialties.value || !Array.isArray(specialties.value)) {
    return [];
  }
  return specialties.value.map((s: any) => ({
    label: s.specialtyName || s.specialtyCode,
    value: s.id
  }));
})

// Methods
function onClinicChange(): void {
  const selectedId = clinicSpecialtyForm.clinicId;
  // Tìm object tương ứng từ clinics
  const selected = clinics.value?.find((c: any) => c.clinicId === selectedId);
  if (selected) {
    clinicSpecialtyForm.clinicCode = (selected as any).clinicCode;
    clinicSpecialtyForm.clinicName = (selected as any).clinicName;
  } else {
    clinicSpecialtyForm.clinicCode = null;
    clinicSpecialtyForm.clinicName = null;
  }
}

function showClinicSpecialtyDialog(clinicSpecialtyData?: ClinicSpecialty | null): void {
  if (clinicSpecialtyData) {
    // Chế độ sửa
    clinicSpecialtyForm.id = clinicSpecialtyData.id
    clinicSpecialtyForm.clinicId = clinicSpecialtyData.clinicId
    clinicSpecialtyForm.clinicCode = clinicSpecialtyData.clinicCode
    clinicSpecialtyForm.clinicName = clinicSpecialtyData.clinicName
    clinicSpecialtyForm.specialtyId = clinicSpecialtyData.specialtyId
    clinicSpecialtyForm.isActive = clinicSpecialtyData.isActive
  } else {
    // Chế độ thêm mới
    clinicSpecialtyForm.id = null
    clinicSpecialtyForm.clinicId = null
    clinicSpecialtyForm.clinicCode = null
    clinicSpecialtyForm.clinicName = null
    clinicSpecialtyForm.specialtyId = null
    clinicSpecialtyForm.isActive = true
  }
  submitted.value = false
  clinicSpecialtyDialog.value = true
}

function hideDialog(): void {
  clinicSpecialtyDialog.value = false
}

async function saveClinicSpecialty(): Promise<void> {
  submitted.value = true
  if (!clinicSpecialtyForm.clinicId || !clinicSpecialtyForm.specialtyId) return

  try {
    if (clinicSpecialtyForm.id) {
      await clinicSpecialtyStore.updateClinicSpecialty(clinicSpecialtyForm.id, { isActive: clinicSpecialtyForm.isActive })
    } else {
      await clinicSpecialtyStore.createClinicSpecialty({
        clinicId: clinicSpecialtyForm.clinicId!,
        clinicCode: clinicSpecialtyForm.clinicCode!,
        clinicName: clinicSpecialtyForm.clinicName!,
        specialtyId: clinicSpecialtyForm.specialtyId!,
        isActive: clinicSpecialtyForm.isActive
      })
    }
    toast.add({ severity: 'success', summary: 'Success Message', detail: 'Đã thêm/sửa thành công', life: 5000 })
    hideDialog()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error?.response?.data?.message || error.message, life: 5000 })
  }
}

function confirmDeleteClinicSpecialty(clinicSpecialtyData: ClinicSpecialty): void {
  clinicSpecialty.value = clinicSpecialtyData
  deleteClinicSpecialtyDialog.value = true
}

async function deleteClinicSpecialty(): Promise<void> {
  if (!clinicSpecialty.value) return
  
  try {
    await clinicSpecialtyStore.deleteClinicSpecialty(clinicSpecialty.value.id)
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa thành công', life: 5000 })
    deleteClinicSpecialtyDialog.value = false
    clinicSpecialty.value = null
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error?.response?.data?.message || error.message, life: 5000 })
  }
}

// Computed properties for DataTable
const rows = computed(() => Number(pagination.value.limit || 10))
const totalRecords = computed(() => Number(pagination.value.total || 0))
const first = computed(() => Number(((pagination.value.page - 1) * pagination.value.limit) || 0))

// Lifecycle
onMounted(() => {
  fetchData(1, rows.value, searchText.value)
  clinicStore.fetchClinicsSelect()
  specialtyStore.fetchSpecialtiesSelect()
})

// Watchers
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchText, (newVal: string) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchData(1, rows.value, newVal)
  }, 400)
})

// Data fetching
function fetchData(page: number, limit: number, search: string): void {
  clinicSpecialtyStore.fetchClinicSpecialties({ page, limit, search, 
    sortField: sortField.value, 
    sortOrder: sortOrder.value });
}

// Event handlers
function onPage(event: any): void {
  fetchData(event.page + 1, event.rows, searchText.value)
}

function onSort(event: any): void {
  sortField.value = event.sortField || ''
  sortOrder.value = event.sortOrder
  fetchData(1, rows.value, searchText.value)
}

function getStatusLabel(isActive: boolean): string {
  return isActive ? 'success' : 'danger'
}

// Placeholder methods for template compatibility
function onClinicDropdownFilter(_event: any): void {
  // Placeholder for clinic dropdown filter
}

function onClinicDropdownScroll(_event: any): void {
  // Placeholder for clinic dropdown scroll
}
</script>
