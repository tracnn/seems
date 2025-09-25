
<template>
    <Toast />
    <ThemeSwitcher />
    <div class="content">
        <div class="card">
            <Toolbar>
                <template #start>
                    <Button label="Thêm" icon="pi pi-plus" class="mr-2" @click="() => showDoctorTitleDialog()" />
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
                v-model:selection="selectedDoctorTitles"
                :lazy="true"
                :value="doctorTitles"
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
                <Column field="titleCode" header="Mã chức danh" sortable></Column>
                <Column field="titleName" header="Tên chức danh" sortable></Column>
                <Column field="doctorCode" header="Mã bác sĩ" sortable></Column>
                <Column field="doctorName" header="Tên bác sĩ" sortable></Column>
                <Column field="specialtyCode" header="Mã chuyên khoa" sortable></Column>
                <Column field="specialtyName" header="Tên chuyên khoa" sortable></Column>
                <Column field="serviceCode" header="Mã dịch vụ" sortable></Column>
                <Column field="serviceName" header="Tên dịch vụ" sortable></Column>
                <Column field="isActive" header="Trạng thái" sortable>
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.isActive ? 'Kích hoạt' : 'Ngừng'" :severity="getStatusLabel(slotProps.data.isActive)" />
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 10rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="() => showDoctorTitleDialog(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteDoctorTitle(slotProps.data.id)" />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>

    <Dialog
        v-model:visible="doctorTitleDialog"
        :style="{ width: '400px', maxWidth: '98vw' }"
        header="Thêm/Xem sửa thông tin"
        :modal="true"
    >
        <form id="doctorTitleForm" @submit.prevent="saveDoctorTitle" class="p-fluid">
            <div class="grid gap-3">
              <div class="col-12 md:col-12">
                  <label class="mb-1 font-semibold">Chức danh (Title)</label>
                  <ServerSelect
                    v-model="doctorTitleForm.titleId"
                    :fetcher="fetchTitles"
                    :resolveByValue="resolveTitleById"
                    :columns="titleColumns"
                    optionLabel="titleName"
                    optionValue="id"
                    dataKeyField="id"
                    :ensureSelectedVisible="true"
                    placeholder="Chọn chức danh"
                    :pageSize="10"
                    :overlayWidth="640"
                    @update:modelValue="onTitleSelected"
                  />
                  <small v-if="submitted && !doctorTitleForm.titleId" class="text-danger">Chức danh là bắt buộc.</small>
                </div>
                <div class="col-12 md:col-12">
                  <label class="mb-1 font-semibold">Bác sĩ (Doctor)</label>
                  <ServerSelect
                    v-model="doctorTitleForm.doctorId"
                    :fetcher="fetchDoctors"
                    :resolveByValue="resolveDoctorById"
                    :columns="doctorColumns"
                    optionLabel="doctorName"
                    optionValue="doctorId"
                    dataKeyField="doctorId"
                    :ensureSelectedVisible="true"
                    placeholder="Chọn bác sĩ"
                    :pageSize="10"
                    :overlayWidth="640"
                    @update:modelValue="onDoctorSelected"
                  />
                  <small v-if="submitted && !doctorTitleForm.doctorId" class="text-danger">Bác sĩ là bắt buộc.</small>
                </div>
                <div class="col-12 md:col-12">
                  <label class="mb-1 font-semibold">Chuyên khoa (Specialty)</label>
                  <ServerSelect
                    v-model="doctorTitleForm.specialtyId"
                    :fetcher="fetchSpecialties"
                    :resolveByValue="resolveSpecialtyById"
                    :columns="specialtyColumns"
                    optionLabel="specialtyName"
                    optionValue="id"
                    dataKeyField="id"
                    :ensureSelectedVisible="true"
                    placeholder="Chọn chuyên khoa"
                    :pageSize="10"
                    :overlayWidth="640"
                    @update:modelValue="onSpecialtySelected"
                  />
                  <small v-if="submitted && !doctorTitleForm.specialtyId" class="text-danger">Chuyên khoa là bắt buộc.</small>
                </div>
                <div class="col-12 md:col-12">
                  <label class="mb-1 font-semibold">Dịch vụ (Service)</label>
                  <ServerSelect
                    v-model="doctorTitleForm.serviceId"
                    :fetcher="fetchServices"
                    :resolveByValue="resolveServiceById"
                    :columns="serviceColumns"
                    optionLabel="serviceName"
                    optionValue="serviceId"
                    dataKeyField="serviceId"
                    :ensureSelectedVisible="true"
                    placeholder="Chọn dịch vụ"
                    :pageSize="10"
                    :overlayWidth="640"
                    @update:modelValue="onServiceSelected"
                  />
                </div>

                <div class="col-12 md:col-12">
                    <label for="isActive" class="mb-2">Trạng thái:</label>
                    <Select
                        id="isActive"
                        v-model="doctorTitleForm.isActive"
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
            <Button label="Lưu" icon="pi pi-check" type="submit" form="doctorTitleForm" />
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
import { useDoctorTitleStore } from '@/stores/doctor-title.store'
import { useTitleStore } from '@/stores/title.store'
import { useDoctorStore } from '@/stores/doctor.store'
import { useSpecialtyStore } from '@/stores/specialty.store'
import { useExamServiceStore } from '@/stores/exam-service.store'
import { storeToRefs } from 'pinia'
import Select from 'primevue/select'
import 'primeflex/primeflex.css'
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { TABLE_CONFIG } from '../../../../utils/table-config.util'
import ServerSelect from '@/components/ServerSelect.vue'

// Interfaces
interface DoctorTitle {
  id: string;
  doctorId: number;
  doctorCode: string;
  doctorName: string;
  titleId: number;
  titleCode: string;
  titleName: string;
  specialtyId: number;
  specialtyCode: string;
  specialtyName: string;
  serviceId: number | null;
  serviceCode: string | null;
  serviceName: string | null;
  isActive: boolean;
  avartarUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DoctorTitleForm {
  id: string | null;
  doctorId: number | null;
  doctorCode: string | null;
  doctorName: string | null;
  titleId: number | null;
  titleCode: string | null;
  titleName: string | null;
  specialtyId: number | null;
  specialtyCode: string | null;
  specialtyName: string | null;
  serviceId: number | null;
  serviceCode: string | null;
  serviceName: string | null;
  isActive: boolean;
}

interface StatusOption {
  label: string;
  value: boolean;
  severity: string;
}

// interface DropdownOption {
//   label: string;
//   value: string | number;
// }

// ===== Columns cho ServerSelect =====
const doctorColumns = [
  { field: 'doctorCode', header: 'Mã', width: '140px' },
  { field: 'doctorName', header: 'Tên bác sĩ' },
  { field: 'title', header: 'Chức danh' }
]

const specialtyColumns = [
  { field: 'specialtyCode', header: 'Mã', width: '140px' },
  { field: 'specialtyName', header: 'Tên chuyên khoa' }
]

const titleColumns = [
  { field: 'titleCode', header: 'Mã', width: '140px' },
  { field: 'titleName', header: 'Tên chức danh' }
]

const serviceColumns = [
  { field: 'serviceCode', header: 'Mã', width: '140px' },
  { field: 'serviceName', header: 'Tên dịch vụ' }
]

// Nới lỏng tham số để tránh TS lỗi khi thiếu field
type FetcherParams = {
  page: number
  limit: number
  search?: string
  sortField?: string
  sortOrder?: number
}

const fetchDoctors = async ({
  page,
  limit,
  search = '',
  sortField = '',
  sortOrder = 1
}: FetcherParams) => {
  const res = await doctorStore.fetchDoctors({
    page,
    limit,
    search,
    sortField,
    sortOrder
  })
  return res // { data, pagination }
}

const fetchSpecialties = async ({
  page,
  limit,
  search = '',
  sortField = '',
  sortOrder = 1
}: FetcherParams) => {
  const res = await specialtyStore.fetchSpecialties({
    page,
    limit,
    search,
    sortField,
    sortOrder
  })
  return res // { data, pagination }
}

const fetchTitles = async ({
  page,
  limit,
  search = '',
  sortField = '',
  sortOrder = 1
}: FetcherParams) => {
  const res = await titleStore.fetchTitles({
    page,
    limit,
    search,
    sortField,
    sortOrder
  })
  return res // { data, pagination }
}

const fetchServices = async ({
  page,
  limit,
  search = '',
  sortField = '',
  sortOrder = 1
}: FetcherParams) => {
  const res = await examServiceStore.fetchExamServices({
    page,
    limit,
    search,
    sortField,
    sortOrder
  })
  return res // { data, pagination }
}

// Resolver khi form vào chế độ sửa có sẵn doctorId
const doctorCache = new Map<number, any>()
const resolveDoctorById = async (value: number | number[] | null) => {
  if (!value) return null
  if (Array.isArray(value)) {
    const miss = value.filter(id => !doctorCache.has(id))
    if (miss.length) {
      const rows = await doctorStore.resolveDoctorsByIds(miss)
      rows.forEach((r: any) => doctorCache.set(r.doctorId, r))
    }
    return value.map(id => doctorCache.get(id)).filter(Boolean)
  } else {
    if (!doctorCache.has(value)) {
      const row = await doctorStore.fetchDoctorById(value)
      if (row) doctorCache.set(value, row)
    }
    return doctorCache.get(value) ?? null
  }
}

const specialtyCache = new Map<string, any>()
const resolveSpecialtyById = async (value: string | string[] | null) => {
  if (!value) return null
  if (Array.isArray(value)) {
    const miss = value.filter(id => !specialtyCache.has(id))
    if (miss.length) {
      const rows = await specialtyStore.resolveSpecialtiesByIds(miss)
      rows.forEach((r: any) => specialtyCache.set(r.id, r))
    }
    return value.map(id => specialtyCache.get(id)).filter(Boolean)
  } else {
    if (!specialtyCache.has(value)) {
      const row = await specialtyStore.fetchSpecialtyById(value)
      if (row) specialtyCache.set(value, row)
    }
    return specialtyCache.get(value) ?? null
  }
}

const titleCache = new Map<string, any>()
const resolveTitleById = async (value: string | string[] | null) => {
  if (!value) return null
  if (Array.isArray(value)) {
    const miss = value.filter(id => !titleCache.has(id))
    if (miss.length) {
      const rows = await titleStore.resolveTitlesByIds(miss)
      rows.forEach((r: any) => titleCache.set(r.id, r))
    }
    return value.map(id => titleCache.get(id)).filter(Boolean)
  } else {
    if (!titleCache.has(value)) {
      const row = await titleStore.fetchTitleById(value)
      if (row) titleCache.set(value, row)
    }
    return titleCache.get(value) ?? null
  }
}

const serviceCache = new Map<number, any>()
const resolveServiceById = async (value: number | number[] | null) => {
  if (!value) return null
  if (Array.isArray(value)) {
    const miss = value.filter(id => !serviceCache.has(id))
    if (miss.length) {
      const rows = await examServiceStore.resolveExamServicesByIds(miss)
      rows.forEach((r: any) => serviceCache.set(r.serviceId, r))
    }
    return value.map(id => serviceCache.get(id)).filter(Boolean)
  } else {
    if (!serviceCache.has(value)) {
      const row = await examServiceStore.fetchExamServiceById(value)
      if (row) serviceCache.set(value, row)
    }
    return serviceCache.get(value) ?? null
  }
}

// Toast
const toast = useToast();

// Stores
const doctorTitleStore = useDoctorTitleStore()
const titleStore = useTitleStore()
const doctorStore = useDoctorStore()
const specialtyStore = useSpecialtyStore()
const examServiceStore = useExamServiceStore()

// Store refs
const { doctorTitles, loading, pagination } = storeToRefs(doctorTitleStore)
// const { doctors, loading: doctorLoading } = storeToRefs(doctorStore)

// Refs
const selectedDoctorTitles = ref<DoctorTitle[]>([])
const searchText = ref<string>('')
const sortField = ref<string>('')
const sortOrder = ref<number>(1)
const doctorTitleDialog = ref<boolean>(false)
const submitted = ref<boolean>(false)

// Status options
const statusOptions: StatusOption[] = [
  { label: 'Kích hoạt', value: true, severity: 'success' },
  { label: 'Ngừng', value: false, severity: 'danger' }
];

// Form
const doctorTitleForm = reactive<DoctorTitleForm>({
  id: null,
  doctorId: null,
  doctorCode: null,
  doctorName: null,
  titleId: null,
  titleCode: null,
  titleName: null,
  specialtyId: null,
  specialtyCode: null,
  specialtyName: null,
  serviceId: null,
  serviceCode: null,
  serviceName: null,
  isActive: true
})

// Computed properties
// const titleOptions = computed<DropdownOption[]>(() =>
//   titles.value?.map(t => ({
//     label: t.titleName,
//     value: t.id
//   })) || []
// )

// const doctorOptions = computed<DropdownOption[]>(() =>
//   doctors.value?.map(d => ({
//     label: `${d.doctorCode} - ${d.doctorName}`,
//     value: d.doctorId
//   })) || []
// )

// const specialtyOptions = computed<DropdownOption[]>(() => {
//   if (!specialties.value || !Array.isArray(specialties.value)) {
//     return [];
//   }
//   return specialties.value.map((s: any) => ({
//     label: s.specialtyName,
//     value: s.id
//   }));
// })

// Methods
// function onDoctorChange(): void {
//   const selectedId = doctorTitleForm.doctorId;
//   // Tìm object tương ứng từ doctors
//   const selected = doctors.value?.find(d => d.doctorId === selectedId);

//   if (selected) {
//     doctorTitleForm.doctorCode = selected.doctorCode;
//     doctorTitleForm.doctorName = selected.doctorName;
//   } else {
//     doctorTitleForm.doctorCode = null;
//     doctorTitleForm.doctorName = null;
//   }
// }

async function onDoctorSelected(selectedId: number | null) {
  if (!selectedId) {
    doctorTitleForm.doctorCode = null
    doctorTitleForm.doctorName = null
    return
  }

  // Nếu có cache thì dùng luôn
  let doctor = doctorCache.get(selectedId)
  if (!doctor) {
    doctor = await doctorStore.fetchDoctorById(selectedId)
    if (doctor) {
      doctorCache.set(selectedId, doctor)
    }
  }

  if (doctor) {
    doctorTitleForm.doctorCode = doctor.doctorCode
    doctorTitleForm.doctorName = doctor.doctorName
  }
}

async function onServiceSelected(selectedId: number | null) {
  console.log('onServiceSelected called with:', selectedId);
  
  if (!selectedId) {
    doctorTitleForm.serviceCode = null
    doctorTitleForm.serviceName = null
    return
  }

  // Nếu có cache thì dùng luôn
  let service = serviceCache.get(selectedId)
  if (!service) {
    service = await examServiceStore.fetchExamServiceById(selectedId)
    if (service) {
      serviceCache.set(selectedId, service)
    }
  }

  if (service) {
    doctorTitleForm.serviceCode = service.serviceCode
    doctorTitleForm.serviceName = service.serviceName
    console.log('Service selected:', service);
    console.log('Form updated - serviceCode:', doctorTitleForm.serviceCode, 'serviceName:', doctorTitleForm.serviceName);
  }
}

async function onTitleSelected(selectedId: string | null) {
  if (!selectedId) {
    doctorTitleForm.titleCode = null
    doctorTitleForm.titleName = null
    return
  }

  // Nếu có cache thì dùng luôn
  let title = titleCache.get(selectedId)
  if (!title) {
    title = await titleStore.fetchTitleById(selectedId)
    if (title) {
      titleCache.set(selectedId, title)
    }
  }

  if (title) {
    doctorTitleForm.titleCode = title.titleCode
    doctorTitleForm.titleName = title.titleName
  }
}

async function onSpecialtySelected(selectedId: string | null) {
  if (!selectedId) {
    doctorTitleForm.specialtyCode = null
    doctorTitleForm.specialtyName = null
    return
  }

  // Nếu có cache thì dùng luôn
  let specialty = specialtyCache.get(selectedId)
  if (!specialty) {
    specialty = await specialtyStore.fetchSpecialtyById(selectedId)
    if (specialty) {
      specialtyCache.set(selectedId, specialty)
    }
  }

  if (specialty) {
    doctorTitleForm.specialtyCode = specialty.specialtyCode
    doctorTitleForm.specialtyName = specialty.specialtyName
  }
}

async function deleteDoctorTitle(id: string): Promise<void> {
  try {
    await doctorTitleStore.deleteDoctorTitle(id);
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa thành công', life: 5000 });
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.response?.data?.message || 'Có lỗi xảy ra', life: 5000 });
  }
}

function showDoctorTitleDialog(doctorTitle?: DoctorTitle | null): void {
  if (doctorTitle) {
    // Chế độ sửa - populate cache với dữ liệu hiện có
    doctorTitleForm.id = doctorTitle.id
    doctorTitleForm.doctorId = doctorTitle.doctorId
    doctorTitleForm.doctorCode = doctorTitle.doctorCode
    doctorTitleForm.doctorName = doctorTitle.doctorName
    doctorTitleForm.titleId = doctorTitle.titleId
    doctorTitleForm.titleCode = doctorTitle.titleCode
    doctorTitleForm.titleName = doctorTitle.titleName
    doctorTitleForm.specialtyId = doctorTitle.specialtyId
    doctorTitleForm.specialtyCode = doctorTitle.specialtyCode
    doctorTitleForm.specialtyName = doctorTitle.specialtyName
    doctorTitleForm.serviceId = doctorTitle.serviceId
    doctorTitleForm.serviceCode = doctorTitle.serviceCode
    doctorTitleForm.serviceName = doctorTitle.serviceName
    doctorTitleForm.isActive = doctorTitle.isActive

    // Populate cache với dữ liệu hiện có để đảm bảo có thể lấy được khi save
    if (doctorTitle.titleId && doctorTitle.titleCode && doctorTitle.titleName) {
      titleCache.set(String(doctorTitle.titleId), {
        id: doctorTitle.titleId,
        titleCode: doctorTitle.titleCode,
        titleName: doctorTitle.titleName
      });
    }
    
    if (doctorTitle.specialtyId && doctorTitle.specialtyCode && doctorTitle.specialtyName) {
      specialtyCache.set(String(doctorTitle.specialtyId), {
        id: doctorTitle.specialtyId,
        specialtyCode: doctorTitle.specialtyCode,
        specialtyName: doctorTitle.specialtyName
      });
    }
    
    if (doctorTitle.serviceId && doctorTitle.serviceCode && doctorTitle.serviceName) {
      serviceCache.set(doctorTitle.serviceId, {
        serviceId: doctorTitle.serviceId,
        serviceCode: doctorTitle.serviceCode,
        serviceName: doctorTitle.serviceName
      });
    }
  } else {
    // Chế độ thêm mới
    doctorTitleForm.id = null
    doctorTitleForm.doctorId = null
    doctorTitleForm.doctorCode = null
    doctorTitleForm.doctorName = null
    doctorTitleForm.titleId = null
    doctorTitleForm.titleCode = null
    doctorTitleForm.titleName = null
    doctorTitleForm.specialtyId = null
    doctorTitleForm.specialtyCode = null
    doctorTitleForm.specialtyName = null
    doctorTitleForm.serviceId = null
    doctorTitleForm.serviceCode = null
    doctorTitleForm.serviceName = null
    doctorTitleForm.isActive = true
  }
  submitted.value = false
  doctorTitleDialog.value = true
}

function hideDialog(): void {
  doctorTitleDialog.value = false
}

async function saveDoctorTitle(): Promise<void> {
  submitted.value = true
  if (!doctorTitleForm.titleId || !doctorTitleForm.doctorId || !doctorTitleForm.specialtyId || 
  !doctorTitleForm.doctorCode || !doctorTitleForm.doctorName) return

  try {
    // Lấy thông tin service từ cache hoặc form data
    const selectedService = doctorTitleForm.serviceId ? serviceCache.get(doctorTitleForm.serviceId) : null;

    const formData = {
      doctorId: doctorTitleForm.doctorId!,
      doctorCode: String(doctorTitleForm.doctorCode!),
      doctorName: doctorTitleForm.doctorName!,
      titleId: String(doctorTitleForm.titleId!),
      specialtyId: String(doctorTitleForm.specialtyId!),
      serviceId: doctorTitleForm.serviceId || null,
      serviceCode: doctorTitleForm.serviceId ? (selectedService?.serviceCode || doctorTitleForm.serviceCode || null) : null,
      serviceName: doctorTitleForm.serviceId ? (selectedService?.serviceName || doctorTitleForm.serviceName || null) : null,
      avartarUrl: null,
      isActive: doctorTitleForm.isActive
    }

    // Debug log để kiểm tra
    console.log('Form data before save:', formData);
    console.log('Selected service from cache:', selectedService);
    console.log('Form serviceCode:', doctorTitleForm.serviceCode);
    console.log('Form serviceName:', doctorTitleForm.serviceName);

    // Validate required fields
    if (!formData.titleId) {
      toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Chức danh không được để trống', life: 5000 });
      return;
    }

    if (doctorTitleForm.id) {
      // Call API update
      await doctorTitleStore.updateDoctorTitle(doctorTitleForm.id, formData)
    } else {
      // Call API create
      await doctorTitleStore.createDoctorTitle(formData);
    }
    toast.add({ severity: 'success', summary: 'Success Message', detail: 'Đã thêm/sửa thành công', life: 5000 });
    hideDialog()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.response?.data?.message || 'Có lỗi xảy ra', life: 5000 });
  }
}

// Computed properties for DataTable
const rows = computed(() => Number(pagination.value.limit || 10))
const totalRecords = computed(() => Number(pagination.value.total || 0))
const first = computed(() => Number(((pagination.value.page - 1) * pagination.value.limit) || 0))

// Lifecycle
onMounted(() => {
  fetchData(1, rows.value, searchText.value)
  
  Promise.all([
    doctorStore.fetchDoctorsSelect(),
    specialtyStore.fetchSpecialtiesSelect(),
    titleStore.fetchTitlesSelect(),
    examServiceStore.fetchExamServicesForSelect()
  ])
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
  doctorTitleStore.fetchDoctorTitles({ page, limit, search, 
    sortField: sortField.value,
    sortOrder: sortOrder.value })
}

// Event handlers
function onPage(event: any): void {
  fetchData(event.page + 1, event.rows, searchText.value)
}

function onSort(event: any): void {
  sortField.value = event.sortField || ''
  sortOrder.value = event.sortOrder
  fetchData(
    1,
    rows.value,
    searchText.value
  )
}

function getStatusLabel(isActive: boolean): string {
  return isActive ? 'success' : 'danger'
}

// Placeholder methods for template compatibility
const deleteProductDialog = ref<boolean>(false)
const deleteProductsDialog = ref<boolean>(false)
const product = ref<any>(null)

function deleteProduct(): void {
  // Placeholder for template compatibility
}

function deleteSelectedProducts(): void {
  // Placeholder for template compatibility
}

// Placeholder methods for dropdown filters - removed as not used
</script>
