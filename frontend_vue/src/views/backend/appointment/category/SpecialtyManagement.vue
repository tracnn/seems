<template>
    <ThemeSwitcher />
    <div class="content">
        <div class="card">
            <Toolbar>
                <template #start>
                    <Button label="Thêm" icon="pi pi-plus" class="mr-2" @click="() => showSpecialtyDialog()" />
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
                v-model:selection="selectedSpecialties"
                :lazy="true"
                :value="specialties"
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
                <Column field="specialtyCode" header="Mã chuyên khoa" sortable></Column>
                <Column field="specialtyName" header="Tên chuyên khoa" sortable></Column>
                <Column field="specialtyDescription" header="Mô tả" sortable></Column>
                <Column field="order" header="Thứ tự" sortable></Column>
                <Column field="isActive" header="Trạng thái" sortable>
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.isActive ? 'Kích hoạt' : 'Ngừng'" :severity="getStatusLabel(slotProps.data.isActive)" />
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 10rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="handleShowSpecialtyDialog(slotProps)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteSpecialty(slotProps.data.id)" />
                    </template>
                </Column>
            </DataTable>
        </div> 
    </div>


    <Dialog
        v-model:visible="specialtyDialog"
        :style="{ width: '400px', maxWidth: '98vw' }"
        header="Thông tin chuyên khoa"
        :modal="true"
    >
        <form id="specialtyForm" @submit.prevent="saveSpecialty" class="p-fluid">
            <div class="grid gap-3">
                <div class="col-12 md:col-12">
                    <label for="specialtyCode" class="mb-2">Mã chuyên khoa:</label>
                    <InputText
                        id="specialtyCode"
                        v-model.trim="specialtyForm.specialtyCode"
                        :invalid="submitted && !specialtyForm.specialtyCode"
                        placeholder="Nhập mã chuyên khoa"
                        autofocus
                        class="w-full"
                    />
                    <small v-if="submitted && !specialtyForm.specialtyCode" class="p-error">Mã chuyên khoa là bắt buộc.</small>
                </div>
                <div class="col-12 md:col-12">
                    <label for="specialtyName" class="mb-2">Tên chuyên khoa:</label>
                    <InputText
                        id="specialtyName"
                        v-model.trim="specialtyForm.specialtyName"
                        :invalid="submitted && !specialtyForm.specialtyName"
                        placeholder="Nhập tên chuyên khoa"
                        class="w-full"
                    />
                    <small v-if="submitted && !specialtyForm.specialtyName" class="p-error">Tên chuyên khoa là bắt buộc.</small>
                </div>
                <div class="col-12 md:col-12">
                    <label for="minAge" class="mb-2">Tuổi tối thiểu:</label>
                    <InputNumber
                        id="minAge"
                        v-model="specialtyForm.minAge"
                        placeholder="Nhập tuổi tối thiểu"
                        class="w-full"
                    />
                </div>
                <div class="col-12 md:col-12">
                    <label for="maxAge" class="mb-2">Tuổi tối đa:</label>
                    <InputNumber
                        id="maxAge"
                        v-model="specialtyForm.maxAge"
                        placeholder="Nhập tuổi tối đa"
                        class="w-full"
                    />
                </div>
                <div class="col-12 md:col-12">
                    <label for="specialtyDescription" class="mb-2">Mô tả:</label>
                    <Textarea
                        id="specialtyDescription"
                        v-model.trim="specialtyForm.specialtyDescription"
                        placeholder="Nhập mô tả"
                        required
                        class="w-full"
                    />
                    <small v-if="submitted && !specialtyForm.specialtyDescription" class="p-error">Mô tả là bắt buộc.</small>
                </div>
                <div class="col-12 md:col-12">
                    <label for="order" class="mb-2">Thứ tự:</label>
                    <InputNumber
                        id="order"
                        v-model="specialtyForm.order"
                        :min="1"
                        required
                        inputClass="w-full"
                        class="w-full"
                    />
                </div>
                <div class="col-12 md:col-12">
                    <label for="isActive" class="mb-2">Trạng thái:</label>
                    <Select
                        id="isActive"
                        v-model="specialtyForm.isActive"
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
            <Button label="Lưu" icon="pi pi-check" type="submit" form="specialtyForm" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteProductDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="product"
                >Are you sure you want to delete <b>{{ product.name }}</b
                >?</span
            >
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
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useSpecialtyStore } from '@/stores/specialty.store'
import { storeToRefs } from 'pinia'
import Select from 'primevue/select'
import { useToast } from 'primevue/usetoast';
import 'primeflex/primeflex.css'
import { TABLE_CONFIG } from '../../../../utils/table-config.util'

// Interfaces
interface Specialty {
  id: string;
  specialtyCode: string;
  specialtyName: string;
  specialtyDescription: string;
  order: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string | null;
  minAge: number | null;
  maxAge: number | null;
}

interface SpecialtyForm {
  id: string | null;
  specialtyCode: string;
  specialtyName: string;
  specialtyDescription: string;
  order: number;
  isActive: boolean;
  minAge: number | null;
  maxAge: number | null;
}

interface StatusOption {
  label: string;
  value: boolean;
  severity: string;
}

// Toast
const toast = useToast();

// Store
const specialtyStore = useSpecialtyStore()
const { specialties, loading, pagination } = storeToRefs(specialtyStore)

// Refs
const selectedSpecialties = ref<Specialty[]>([])
const searchText = ref<string>('')
const sortField = ref<string>('')
const sortOrder = ref<number>(1)
const specialtyDialog = ref<boolean>(false)
const submitted = ref<boolean>(false)

// Status options
const statusOptions: StatusOption[] = [
  { label: 'Kích hoạt', value: true, severity: 'success' },
  { label: 'Ngừng', value: false, severity: 'danger' }
];

// Form
const specialtyForm = reactive<SpecialtyForm>({
  id: null,
  specialtyCode: '',
  specialtyName: '',
  specialtyDescription: '',
  order: 1,
  isActive: true,
  minAge: null,
  maxAge: null
})

// Methods
function showSpecialtyDialog(specialty?: Specialty | null): void {
  if (specialty) {
    // Chế độ sửa
    specialtyForm.id = specialty.id
    specialtyForm.specialtyCode = specialty.specialtyCode
    specialtyForm.specialtyName = specialty.specialtyName
    specialtyForm.specialtyDescription = specialty.specialtyDescription
    specialtyForm.order = specialty.order
    specialtyForm.isActive = specialty.isActive
    specialtyForm.minAge = specialty.minAge
    specialtyForm.maxAge = specialty.maxAge
  } else {
    // Chế độ thêm mới
    specialtyForm.id = null
    specialtyForm.specialtyCode = ''
    specialtyForm.specialtyName = ''
    specialtyForm.specialtyDescription = ''
    specialtyForm.order = 1
    specialtyForm.isActive = true
    specialtyForm.minAge = null
    specialtyForm.maxAge = null
  }
  submitted.value = false
  specialtyDialog.value = true
}

// Event handler for button click
function handleShowSpecialtyDialog(event: any): void {
  const specialty = event?.data || null
  showSpecialtyDialog(specialty)
}

function hideDialog(): void {
  specialtyDialog.value = false
}

async function saveSpecialty(): Promise<void> {
  submitted.value = true
  if (!specialtyForm.specialtyCode || !specialtyForm.specialtyName) return

  try {
    if (specialtyForm.id) {
      await specialtyStore.updateSpecialty(specialtyForm.id, { ...specialtyForm })
    } else {
      await specialtyStore.createSpecialty({ ...specialtyForm })
    }
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm/sửa thành công', life: 5000 });
    hideDialog()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.response?.data?.message || 'Có lỗi xảy ra', life: 5000 });
  }
}

// Computed properties
const rows = computed(() => Number(pagination.value.limit || 10))
const totalRecords = computed(() => Number(pagination.value.total || 0))
const first = computed(() => Number(((pagination.value.page - 1) * pagination.value.limit) || 0))

// Lifecycle
onMounted(() => {
  fetchData(1, rows.value, searchText.value, sortField.value, sortOrder.value)
})

// Watchers
let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchText, (newVal: string) => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchData(1, rows.value, newVal, sortField.value, sortOrder.value)
  }, 400)
})

// Data fetching
function fetchData(page: number, limit: number, search: string, sortField: string, sortOrder: number): void {
  specialtyStore.fetchSpecialties({ page, limit, search, sortField, sortOrder })
}

// Event handlers
function onPage(event: any): void {
  fetchData(event.page + 1, event.rows, searchText.value, sortField.value, sortOrder.value)
}

function onSort(event: any): void {
  sortField.value = event.sortField || ''
  sortOrder.value = event.sortOrder
  fetchData(
    1,
    rows.value,
    searchText.value,
    sortField.value,
    sortOrder.value
  )
}

function getStatusLabel(isActive: boolean): string {
  return isActive ? 'success' : 'danger'
}

// Delete methods
async function deleteSpecialty(id: string): Promise<void> {
  try {
    await specialtyStore.deleteSpecialty(id)
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa thành công', life: 5000 });
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.response?.data?.message || 'Có lỗi xảy ra', life: 5000 });
  }
}

// Dialog refs (for compatibility with template)
const deleteProductDialog = ref<boolean>(false)
const deleteProductsDialog = ref<boolean>(false)
const product = ref<any>(null)

// Placeholder methods for template compatibility
function deleteProduct(): void {
  // Placeholder for template compatibility
}

function deleteSelectedProducts(): void {
  // Placeholder for template compatibility
}
</script>
