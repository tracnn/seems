<template>
    <Toast />
    <ThemeSwitcher />
    <div class="content">
      <div class="card">
        <Toolbar class="mb-2">
          <template #start>
            <div class="grid w-full md:grid-cols-4 sm:grid-cols-2 gap-3">
              <div>
                <label for="dateRange">Ngày khám:</label>
                <DatePicker
                  selectionMode="range"
                  id="dateRange"
                  v-model="dateRange"
                  :invalid="submitted && !dateRange"
                  placeholder="Chọn ngày"
                  class="w-full"
                />
              </div>
              <div>
                <label for="filterClinicId">Phòng khám:</label>
                <Select
                  id="filterClinicId"
                  v-model="filterClinicId"
                  :filter="true"
                  filterPlaceholder="Tìm kiếm phòng khám"
                  :options="clinicSpecialtyOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Tất cả phòng khám"
                  class="w-full"
                  showClear
                />
              </div>
              <div>
                <label for="filterDoctorId">Bác sĩ:</label>
                <Select
                  id="filterDoctorId"
                  v-model="filterDoctorId"
                  :filter="true"
                  filterPlaceholder="Tìm kiếm bác sĩ"
                  :options="doctorTitleOptions"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Tất cả bác sĩ"
                  class="w-full"
                  showClear
                />
              </div>
              <div class="flex items-end">
                <Button label="Tìm kiếm" icon="pi pi-search" class="mr-2" @click="search" />
                <Button label="Làm mới" icon="pi pi-refresh" severity="secondary" class="mr-2" @click="refresh" />
                <Button label="Export" icon="pi pi-download" severity="secondary" />
              </div>
            </div>
          </template>
        </Toolbar>

        <Toolbar>
            <template #start>
                <Button label="Thêm" icon="pi pi-plus" class="mr-2" @click="showCreateDialog" />
                <Button label="Xóa" icon="pi pi-trash" severity="danger" class="mr-2" />
            </template>
            <template #center>
                <!-- Import Excel button moved to first toolbar -->
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
            v-model:selection="selectedAppointmentSlots"
            :lazy="true"
            :value="appointmentSlots"
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
            <Column field="slotDate" header="Ngày" sortable></Column>
            <Column field="slotTime" header="Giờ" sortable></Column>            
            <Column field="clinicName" header="Phòng khám" sortable></Column>
            <Column field="doctorName" header="Bác sĩ" sortable></Column>
            <Column field="serviceName" header="Dịch vụ" sortable></Column>
            <Column field="isBooked" header="Đã đặt" sortable>
                <template #body="slotProps">
                    <Tag :value="slotProps.data.isBooked ? 'Đã đặt' : 'Chưa đặt'" :severity="slotProps.data.isBooked ? 'success' : 'danger'" />
                </template>
            </Column>
            <Column field="isActive" header="Trạng thái" sortable>
                <template #body="slotProps">
                    <Tag :value="slotProps.data.isActive ? 'Kích hoạt' : 'Ngừng'" :severity="getStatusLabel(slotProps.data.isActive)" />
                </template>
            </Column>
            <Column :exportable="false" style="min-width: 10rem">
                <template #body="slotProps">
                    <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="showEditDialog(slotProps.data)" />
                    <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteAppointmentSlot(slotProps.data.id)" />
                </template>
            </Column>
        </DataTable>
      </div>
    </div>

    <Dialog
      v-if="!isEditMode"
      v-model:visible="appointmentSlotDialog"
      :style="{ width: '700px', maxWidth: '98vw' }"
      header="Thêm lịch khám"
      :modal="true"
    >
      <form id="appointmentSlotForm" @submit.prevent="saveAppointmentSlot" class="p-fluid">
        <div class="grid gap-3">
          <div class="col-12 md:col-12">
            <label for="slotDate">Ngày:</label>
            <DatePicker
              selectionMode="single"
              id="slotDate"
              v-model="appointmentSlotForm.slotDate as Date"
              :invalid="submitted && !appointmentSlotForm.slotDate"
              placeholder="Chọn ngày"
              autofocus
              required
              class="w-full"
            />
            <small v-if="submitted && !appointmentSlotForm.slotDate" class="text-danger">Ngày là bắt buộc.</small>
          </div>
          <div class="col-12 md:col-12">
            <label for="clinicId">Phòng khám:</label>
            <Select
              id="clinicId"
              v-model="appointmentSlotForm.clinicId"
              :loading="clinicSpecialtyLoading"
              :filter="true"
              filterPlaceholder="Tìm kiếm phòng khám"
              placeholder="Chọn phòng khám"
              required
              class="w-full"
              :options="clinicSpecialtyOptions"
              optionLabel="label"
              optionValue="value"
              @change="onClinicChange"
            />
            <small v-if="submitted && !appointmentSlotForm.clinicId" class="text-danger">Phòng khám là bắt buộc.</small>
          </div>
          <div class="col-12 md:col-12">
            <label for="doctorId">Bác sĩ:</label>
            <Select
              id="doctorId"
              v-model="appointmentSlotForm.doctorId"
              :filter="true"
              filterPlaceholder="Tìm kiếm bác sĩ"
              :options="doctorTitleOptionsBySpecialty"
              optionLabel="label"
              optionValue="value"
              placeholder="Chọn bác sĩ"
              class="w-full"
              @change="onDoctorChange"
            />
            <small v-if="submitted && !appointmentSlotForm.doctorId" class="text-danger">Bác sĩ là bắt buộc.</small>
          </div>
          <div class="col-12 md:col-12">
            <label for="serviceId">Dịch vụ:</label>
                <Select
                id="serviceId"
                v-model="appointmentSlotForm.serviceId"
                :filter="true"
                filterPlaceholder="Tìm kiếm dịch vụ"
                :options="serviceOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Chọn dịch vụ"
                class="w-full"
                @change="onServiceChange"
            />
            <small v-if="submitted && !appointmentSlotForm.serviceId" class="text-danger">Dịch vụ là bắt buộc.</small>
          </div>
          <div class="col-12 md:col-12">
            <label>Giờ (chọn nhiều):</label>
            <Accordion :multiple="true">
              <AccordionTab v-for="tab in periodTabs" :key="tab.value" :header="tab.label">
                <div v-if="slotTimeGroups[tab.value] && slotTimeGroups[tab.value].length" class="mb-2 flex justify-end">
                  <Button
                    :label="isAllSelectedPeriod(tab.value) ? 'Bỏ chọn tất cả' : 'Chọn tất cả'"
                    class="p-button-text text-xs"
                    @click="toggleSelectAllPeriod(tab.value)"
                    size="small"
                  />
                </div>
                <div v-if="slotTimeGroups[tab.value] && slotTimeGroups[tab.value].length"
                    class="grid grid-cols-4 gap-1 flex flex-wrap justify-center">
                  <Button
                    v-for="slot in slotTimeGroups[tab.value]"
                    :key="slot.value"
                    :label="slot.label"
                    class="w-1 flex items-center justify-center text-base"
                    :class="[
                      isSelected(String(slot.value)) ? 'p-button-success' : 'p-button-outlined',
                      isSlotDisabled(String(slot.value)) ? 'text-gray-400' : ''
                    ]"
                    :disabled="isSlotDisabled(String(slot.value))"
                    @click="toggleSlotTime(String(slot.value))"
                    size="small"
                  />
                </div>
                <div v-else class="text-center text-xs text-gray-400 italic">Không có giờ trong buổi này.</div>
              </AccordionTab>
            </Accordion>
            <small v-if="submitted && !appointmentSlotForm.slotTime.length" class="text-danger block mt-2">Giờ là bắt buộc.</small>
          </div>
        </div>
      </form>
      <template #footer>
        <Button label="Huỷ" icon="pi pi-times" text @click="hideDialog" />
        <Button label="Lưu" icon="pi pi-check" type="submit" form="appointmentSlotForm" />
      </template>
    </Dialog>

    <Dialog
      v-if="isEditMode"
      v-model:visible="appointmentSlotDialog"
      :style="{ width: '500px', maxWidth: '98vw' }"
      header="Sửa lịch khám"
      :modal="true"
    >
      <form id="appointmentSlotForm" @submit.prevent="saveAppointmentSlot" class="p-fluid">
        <div class="grid gap-3">
          <div class="col-12 md:col-12">
            <label for="slotDate">Ngày:</label>
            <DatePicker
              id="slotDate"
              v-model="appointmentSlotForm.slotDate as Date"
              :invalid="submitted && !appointmentSlotForm.slotDate"
              placeholder="Chọn ngày"
              autofocus
              required
              class="w-full"
              :disabled="true"
            />
            <small v-if="submitted && !appointmentSlotForm.slotDate" class="p-error">Ngày là bắt buộc.</small>
          </div>
          <div class="col-12 md:col-12">
            <label for="slotTime">Giờ:</label>
            <Select
              id="slotTime"
              v-model="appointmentSlotForm.slotTime"
              :invalid="submitted && !appointmentSlotForm.slotTime"
              placeholder="Chọn giờ"
              required
              class="w-full"
              :options="slotTimeOptions"
              optionLabel="label"
              optionValue="value"
              :disabled="true"
            />
            <small v-if="submitted && !appointmentSlotForm.slotTime" class="text-danger">Giờ là bắt buộc.</small>
          </div>
          <div class="col-12 md:col-12">
            <label for="clinicId">Phòng khám:</label>
            <Select
              id="clinicId"
              v-model="appointmentSlotForm.clinicId"
              :loading="clinicSpecialtyLoading"
              :filter="true"
              filterPlaceholder="Tìm kiếm phòng khám"
              placeholder="Chọn phòng khám"
              required
              class="w-full"
              :options="clinicSpecialtyOptions"
              optionLabel="label"
              optionValue="value"
              @change="onClinicChange"
              :disabled="true"
            />
            <small v-if="submitted && !appointmentSlotForm.clinicId" class="text-danger">Phòng khám là bắt buộc.</small>
          </div>
          <div class="col-12 md:col-12">
            <label for="doctorId">Bác sĩ:</label>
            <Select
              id="doctorId"
              v-model="appointmentSlotForm.doctorId"
              :filter="true"
              filterPlaceholder="Tìm kiếm bác sĩ"
              :loading="doctorTitleLoading"
              :options="doctorTitleOptionsBySpecialty"
              optionLabel="label"
              optionValue="value"
              placeholder="Chọn bác sĩ"
              class="w-full"
              :disabled="true"
            />
            <small v-if="submitted && !appointmentSlotForm.doctorId" class="text-danger">Bác sĩ là bắt buộc.</small>
          </div>
          <div class="col-12 md:col-12">
            <label for="serviceId">Dịch vụ:</label>
                <Select
                id="serviceId"
                v-model="appointmentSlotForm.serviceId"
                :filter="true"
                filterPlaceholder="Tìm kiếm dịch vụ"
                :options="serviceOptions"
                optionLabel="label"
                optionValue="value"
                placeholder="Chọn dịch vụ"
                class="w-full"
                :disabled="true"
            />
            <small v-if="submitted && !appointmentSlotForm.serviceId" class="text-danger">Dịch vụ là bắt buộc.</small>
          </div>
          <div class="col-12 md:col-12">
            <label for="isActive">Trạng thái:</label>
            <Select
              id="isActive"
              v-model="appointmentSlotForm.isActive"
              :options="statusOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Chọn trạng thái"
              class="w-full"
              :disabled="isBookedViewMode"
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
        <Button label="Lưu" :disabled="isBookedViewMode" icon="pi pi-check" type="submit" form="appointmentSlotForm" />
      </template>
    </Dialog>

    <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="appointmentSlot"
                >Bạn có chắc chắn muốn xóa <b>{{ appointmentSlot.slotDate }} {{ appointmentSlot.slotTime }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="Không" icon="pi pi-times" text @click="deleteDialog = false" />
            <Button label="Có" icon="pi pi-check" @click="deleteAppointmentSlot(appointmentSlot?.id || '')" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="appointmentSlots">Bạn có chắc chắn muốn xóa các bản ghi đã chọn?</span>
        </div>
        <template #footer>
            <Button label="Không" icon="pi pi-times" text @click="deleteDialog = false" />
            <Button label="Có" icon="pi pi-check" />
        </template>
    </Dialog>


</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive, onUnmounted } from 'vue'
import { useAppointmentSlotsStore } from '@/stores/appointment-slots.store'
import { useClinicSpecialtyStore } from '@/stores/clinic-specialty.store'
import { useDoctorTitleStore } from '@/stores/doctor-title.store'
import { useServiceStore } from '@/stores/service.store'
import Accordion from 'primevue/accordion'
import AccordionTab from 'primevue/accordiontab'
import { storeToRefs } from 'pinia'
import Select from 'primevue/select'
import DatePicker from 'primevue/datepicker'
import 'primeflex/primeflex.css'
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import dayjs from 'dayjs'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import { TABLE_CONFIG } from '../../../utils/table-config.util'

// Types and Interfaces
interface AppointmentSlotForm {
  id: string | null;
  slotDate: string | Date;
  slotTime: string[];
  clinicId: number;
  clinicCode: string;
  clinicName: string;
  doctorId: number;
  doctorCode: string;
  doctorName: string;
  serviceId: number;
  serviceCode: string;
  serviceName: string;
  slotType: string;
  isActive: boolean;
  isBooked: boolean;
}

interface AppointmentSlot {
  id: string;
  slotDate: string | Date;
  slotTime: string;
  clinicId: number;
  clinicCode: string;
  clinicName: string;
  doctorId: number;
  doctorCode: string;
  doctorName: string;
  serviceId: number;
  serviceCode: string;
  serviceName: string;
  slotType: string;
  isActive: boolean;
  isBooked: boolean;
}

interface SelectOption {
  label: string;
  value: string | number;
  specialtyId?: string;
  period?: string;
}

interface PeriodTab {
  label: string;
  value: string;
}

interface StatusOption {
  label: string;
  value: boolean;
  severity: string;
}

interface SlotTimeGroup {
  [key: string]: SelectOption[];
}

interface PageEvent {
  page: number;
  rows: number;
}

// Reactive data
const toast = useToast();

const today = new Date()
const dateRange = ref<[Date, Date] | null>([today, today])

const filterClinicId = ref<number>();
const filterDoctorId = ref<number>();

const periodTabs: PeriodTab[] = [
  { label: 'Sáng', value: 'morning' },
  { label: 'Chiều', value: 'afternoon' },
  { label: 'Tối', value: 'evening' },
]

const isBookedViewMode = computed(() => !!appointmentSlotForm.isBooked);

const appointmentSlotStore = useAppointmentSlotsStore()
const clinicSpecialtyStore = useClinicSpecialtyStore()
const doctorTitleStore = useDoctorTitleStore()
const { appointmentSlots, slotTimes, slotDisable, loading, pagination } = storeToRefs(appointmentSlotStore)
const { clinicSpecialtiesForSelect, loading: clinicSpecialtyLoading } = storeToRefs(clinicSpecialtyStore)
const { doctorTitlesForSelect, doctorTitlesForSelectBySpecialty, loading: doctorTitleLoading } = storeToRefs(doctorTitleStore)
const serviceStore = useServiceStore()
const { servicesByClinic } = storeToRefs(serviceStore)
const selectedAppointmentSlots = ref<AppointmentSlot[]>([])
const searchText = ref<string>('')

const sortField = ref<string>('')
const sortOrder = ref<number>(1)

const statusOptions: StatusOption[] = [
  { label: 'Kích hoạt', value: true, severity: 'success' },
  { label: 'Ngừng', value: false, severity: 'danger' }
];

const isEditMode = ref<boolean>(false)

const appointmentSlotDialog = ref<boolean>(false)
const submitted = ref<boolean>(false)
const appointmentSlotForm = reactive<AppointmentSlotForm>({
  id: null,
  slotDate: '',
  slotTime: [],
  clinicId: 0,
  clinicCode: '',
  clinicName: '',
  doctorId: 0,
  doctorCode: '',
  doctorName: '',
  serviceId: 0,
  serviceCode: '',
  serviceName: '',
  slotType: '',
  isActive: true,
  isBooked: false,
})

const deleteDialog = ref(false)
const appointmentSlot = ref<AppointmentSlot | null>(null)

// Computed properties
const clinicSpecialtyOptions = computed<SelectOption[]>(() => {
    return clinicSpecialtiesForSelect.value.map(item => ({
        label: item.clinicName,
        value: item.clinicId,
        specialtyId: item.specialtyId
    }))
})

const slotTimeOptions = computed<SelectOption[]>(() => {
    return slotTimes.value.map((item: any) => ({
        label: item.label,
        value: String(item.key),
        period: item.period
    }))
})

const slotTimeGroups = computed<SlotTimeGroup>(() => {
  const groups: SlotTimeGroup = {
    morning: [],
    afternoon: [],
    evening: [],
  }
  slotTimeOptions.value.forEach(slot => {
    // slot.period là 'morning', 'afternoon', 'evening'
    if (slot.period === 'morning') groups.morning.push(slot)
    else if (slot.period === 'afternoon') groups.afternoon.push(slot)
    else if (slot.period === 'evening') groups.evening.push(slot)
  })
  return groups
})

const doctorTitleOptions = computed<SelectOption[]>(() => {
    return doctorTitlesForSelect.value.map(item => ({
      label: `${item.doctorCode} - ${item.doctorName}`,
        value: item.doctorId
    }))
})

const doctorTitleOptionsBySpecialty = computed<SelectOption[]>(() => {
    return doctorTitlesForSelectBySpecialty.value.map(item => ({
        label: `${item.doctorCode} - ${item.doctorName} - ${item.specialtyName}`,
        value: item.doctorId
    }))
})

const serviceOptions = computed<SelectOption[]>(() => {
    const clinicServices = servicesByClinic.value.map((item: any) => ({
        label: item.serviceName,
        value: item.serviceId
    }))
    
    // Nếu có service được chọn tự động từ doctor title và không có trong danh sách clinic services
    if (appointmentSlotForm.serviceId && appointmentSlotForm.serviceCode && appointmentSlotForm.serviceName) {
        const existingService = clinicServices.find(s => s.value === appointmentSlotForm.serviceId)
        if (!existingService) {
            // Thêm service từ doctor title vào đầu danh sách
            clinicServices.unshift({
                label: appointmentSlotForm.serviceName,
                value: appointmentSlotForm.serviceId
            })
        }
    }
    
    return clinicServices
})

// computed để đảm bảo DataTable không bị truyền proxy
const rows = computed(() => Number(pagination.value.limit || 10))
const totalRecords = computed(() => Number(pagination.value.total || 0))
const first = computed(() => Number(((pagination.value.page - 1) * pagination.value.limit) || 0))

// Thêm biến để track việc đã load data chưa
const isDataLoaded = ref<boolean>(false)

// Timeout handlers
let searchTimeout: ReturnType<typeof setTimeout> | null = null
let dateRangeTimeout: ReturnType<typeof setTimeout> | null = null
let filterTimeout: ReturnType<typeof setTimeout> | null = null

// Methods
function toggleSelectAllPeriod(period: string): void {
  const allSlots = slotTimeGroups.value[period].map(s => String(s.value));
  // Lọc ra chỉ những slot KHÔNG bị disable
  const availableSlots = allSlots.filter(val => !isSlotDisabled(String(val)));
  const allSelected = availableSlots.every(val => appointmentSlotForm.slotTime.includes(String(val)));

  if (allSelected) {
    // Bỏ chọn tất cả các slot hợp lệ (không disable)
    appointmentSlotForm.slotTime = appointmentSlotForm.slotTime.filter(val => !availableSlots.includes(String(val)));
  } else {
    // Chọn tất cả slot hợp lệ (giữ lại các slot đã chọn ở buổi khác)
    const newSelected = [...new Set([...appointmentSlotForm.slotTime, ...availableSlots.map(String)])];
    appointmentSlotForm.slotTime = newSelected as string[];
  }
}

function isAllSelectedPeriod(period: string): boolean {
  const slots = slotTimeGroups.value[period].map(s => String(s.value));
  return slots.length > 0 && slots.every(val => appointmentSlotForm.slotTime.includes(String(val)));
}

function showCreateDialog(): void {
  isEditMode.value = false
  resetForm()
  submitted.value = false
  appointmentSlotDialog.value = true
}

function showEditDialog(appointmentSlot: AppointmentSlot): void {
  isEditMode.value = true
  appointmentSlotForm.id = appointmentSlot.id
  appointmentSlotForm.slotDate = appointmentSlot.slotDate as Date
  appointmentSlotForm.slotTime = Array.isArray(appointmentSlot.slotTime)
    ? appointmentSlot.slotTime.map(String)
    : [String(appointmentSlot.slotTime)]
  appointmentSlotForm.clinicId = appointmentSlot.clinicId
  appointmentSlotForm.clinicCode = appointmentSlot.clinicCode
  appointmentSlotForm.clinicName = appointmentSlot.clinicName
  appointmentSlotForm.doctorId = appointmentSlot.doctorId
  appointmentSlotForm.doctorCode = appointmentSlot.doctorCode
  appointmentSlotForm.doctorName = appointmentSlot.doctorName
  appointmentSlotForm.serviceId = appointmentSlot.serviceId
  appointmentSlotForm.serviceCode = (appointmentSlot as any)?.serviceCode || ''
  appointmentSlotForm.serviceName = (appointmentSlot as any)?.serviceName || ''
  appointmentSlotForm.slotType = appointmentSlot.slotType
  appointmentSlotForm.isActive = appointmentSlot.isActive
  appointmentSlotForm.isBooked = appointmentSlot.isBooked
  submitted.value = false

  if (appointmentSlot.clinicId) {
    reloadDoctorAndService(String(appointmentSlot.clinicId))
  }

  appointmentSlotDialog.value = true
}

function resetForm(): void {
  appointmentSlotForm.id = null
  appointmentSlotForm.slotDate = ''
  appointmentSlotForm.slotTime = []
  appointmentSlotForm.clinicId = 0
  appointmentSlotForm.clinicCode = ''
  appointmentSlotForm.clinicName = ''
  appointmentSlotForm.doctorId = 0
  appointmentSlotForm.doctorCode = ''
  appointmentSlotForm.doctorName = ''
  appointmentSlotForm.serviceId = 0
  appointmentSlotForm.serviceCode = ''
  appointmentSlotForm.serviceName = ''
  appointmentSlotForm.slotType = ''
  appointmentSlotForm.isActive = true
  appointmentSlotForm.isBooked = false
}

function hideDialog(): void {
  appointmentSlotDialog.value = false
}

function toggleSlotTime(value: string): void {
  const val = String(value);
  if (isSlotDisabled(val)) return;
  const idx = appointmentSlotForm.slotTime.indexOf(val)
  if (idx === -1) appointmentSlotForm.slotTime.push(val)
  else appointmentSlotForm.slotTime.splice(idx, 1)
}
function isSelected(value: string): boolean {
  return appointmentSlotForm.slotTime.includes(String(value))
}

function reloadDoctorAndService(clinicId: string): void {
  const selectedClinic = clinicSpecialtiesForSelect.value.find(c => String(c.clinicId) === String(clinicId))
  if (selectedClinic) {
    serviceStore.fetchExamServicesByClinic(String(clinicId))
    doctorTitleStore.fetchDoctorTitlesForSelectBySpecialty(selectedClinic.specialtyId)
  }
}

async function saveAppointmentSlot(): Promise<void> {
  submitted.value = true
  const selectedDate = dayjs(appointmentSlotForm.slotDate).format('YYYY-MM-DD');
  const now = dayjs().format('YYYY-MM-DD');
  if (selectedDate < now) {
    toast.add({ severity: 'error', summary: 'Error Message', detail: 'Ngày khám không được nhỏ hơn ngày hiện tại', life: 3000 });
    return;
  }

  if (!appointmentSlotForm.slotDate || !appointmentSlotForm.slotTime.length 
  || !appointmentSlotForm.clinicId || !appointmentSlotForm.doctorId || !appointmentSlotForm.serviceId ) return

  appointmentSlotForm.slotDate = dayjs(appointmentSlotForm.slotDate).format('YYYY-MM-DD');

  try {
    if (appointmentSlotForm.id) {
      //covert slotTime to string of array
      const slotTime = appointmentSlotForm.slotTime[0];
      const data = { ...appointmentSlotForm, slotTime };
      await appointmentSlotStore.updateAppointmentSlot(appointmentSlotForm.id, data);
    } else {
      const data = { ...appointmentSlotForm,
        slotDate: dayjs(appointmentSlotForm.slotDate).format('YYYY-MM-DD')
       };

      console.log(data);
      
      await appointmentSlotStore.createAppointmentSlot(data);
    }
    toast.add({ severity: 'success', summary: 'Success Message', detail: 'Đã thêm/sửa thành công', life: 5000 });
    hideDialog()
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Error Message', detail: error.response?.data?.message || 'Có lỗi xảy ra', life: 5000 });
  }
}

function fetchData(page: number, limit: number, search: string, sortField: string, sortOrder: number): void {
  const fromDate = dateRange.value?.[0] ? dayjs(dateRange.value[0]).format('YYYY-MM-DD') : undefined;
  const toDate = dateRange.value?.[1] ? dayjs(dateRange.value[1]).format('YYYY-MM-DD') : undefined;
  const clinicId = filterClinicId.value;
  const doctorId  = filterDoctorId.value;  
  appointmentSlotStore.fetchAppointmentSlots({ page, limit, search, sortField, sortOrder, fromDate, toDate, clinicId, doctorId })
}

function onPage(event: PageEvent): void {
    fetchData(event.page + 1, event.rows, searchText.value, sortField.value, sortOrder.value)
}

function onSort(event: { sortField?: string | ((item: any) => string); sortOrder: number | null | undefined }): void {
  sortField.value = typeof event.sortField === 'string' ? event.sortField : ''
  sortOrder.value = event.sortOrder ?? 1
  fetchData(
    1,
    rows.value,
    searchText.value,
    sortField.value,
    sortOrder.value
  )
}

function isSlotDisabled(value: string): boolean {
  return slotDisable.value && slotDisable.value.includes(value as never);
}

function getStatusLabel(isActive: boolean): string {
    return isActive ? 'success' : 'danger'
}

async function onDoctorChange(event: { value: string }): Promise<void> {
  const doctorId = String(event.value)
  const selectedDoctor = doctorTitlesForSelectBySpecialty.value.find(d => String(d.doctorId) === doctorId)
  if (selectedDoctor) {
    appointmentSlotForm.doctorCode = selectedDoctor.doctorCode || ''
    appointmentSlotForm.doctorName = selectedDoctor.doctorName || ''
    
    // Gọi API để lấy thông tin chi tiết của bác sĩ
    try {
      const doctorTitleData = await doctorTitleStore.fetchDoctorTitleByDoctorId(Number(doctorId))
      if (doctorTitleData && doctorTitleData.serviceId && doctorTitleData.serviceCode && doctorTitleData.serviceName) {
        // Nếu có thông tin service, tự động fill vào form
        appointmentSlotForm.serviceId = doctorTitleData.serviceId
        appointmentSlotForm.serviceCode = doctorTitleData.serviceCode
        appointmentSlotForm.serviceName = doctorTitleData.serviceName
      }
    } catch (error) {
      console.error('Error fetching doctor title details:', error)
    }
  }
}

function onServiceChange(event: { value: string }): void {
  const serviceId = event.value;
  const selectedService = servicesByClinic.value.find((s: any) =>  s.serviceId === serviceId)
  if (selectedService) {
    appointmentSlotForm.serviceCode = selectedService?.serviceCode || ''
    appointmentSlotForm.serviceName = selectedService?.serviceName || ''
  }
}

function onClinicChange(event: { value: string }): void {
  const clinicId = String(event.value)
  const selectedClinic = clinicSpecialtiesForSelect.value.find(c => String(c.clinicId) === clinicId)
  if (selectedClinic) {
    appointmentSlotForm.clinicId = Number(clinicId)
    appointmentSlotForm.clinicCode = selectedClinic.clinicCode || ''
    appointmentSlotForm.clinicName = selectedClinic.clinicName || ''
    
    // Reset service khi thay đổi clinic
    appointmentSlotForm.serviceId = 0
    appointmentSlotForm.serviceCode = ''
    appointmentSlotForm.serviceName = ''
    
    serviceStore.fetchExamServicesByClinic(clinicId)
    doctorTitleStore.fetchDoctorTitlesForSelectBySpecialty(selectedClinic.specialtyId)
  }
}

// Watchers
watch(searchText, (newVal) => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        fetchData(1, rows.value, newVal, sortField.value, sortOrder.value)
    }, 400)
})

watch(dateRange, (newVal, oldVal) => {
    // Chỉ trigger khi có sự thay đổi thực sự
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        if (dateRangeTimeout) clearTimeout(dateRangeTimeout)
        dateRangeTimeout = setTimeout(() => {
            if (newVal && newVal[0] && newVal[1]) {
                fetchData(1, rows.value, searchText.value, sortField.value, sortOrder.value)
            }
        }, 300)
    }
})

watch([() => appointmentSlotForm.slotDate, () => appointmentSlotForm.clinicId], ([slotDate, clinicId]) => {
    if (slotDate || clinicId) {
        const slotDateFormatted = dayjs(slotDate).format('YYYY-MM-DD')
        appointmentSlotStore.fetchSlotDisable({ slotDate: slotDateFormatted, clinicId });
    } else {
        appointmentSlotStore.slotDisable = []
    }
});

watch([filterClinicId, filterDoctorId], (newVal, oldVal) => {
    // Chỉ trigger khi có sự thay đổi thực sự
    if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
        if (filterTimeout) clearTimeout(filterTimeout)
        filterTimeout = setTimeout(() => {
            fetchData(1, rows.value, searchText.value, sortField.value, sortOrder.value);
        }, 300)
    }
});

// Lifecycle hooks
onMounted(async () => {
    try {
        // Load data song song để tăng tốc độ
        const promises = [
            clinicSpecialtyStore.fetchClinicSpecialtiesForSelect(),
            appointmentSlotStore.getSlotTime(),
            doctorTitleStore.fetchDoctorTitlesForSelect()
        ];
        
        await Promise.all(promises);
        
        // Chỉ fetch data chính sau khi đã load xong các data cần thiết
        if (!isDataLoaded.value) {
            fetchData(1, rows.value, searchText.value, sortField.value, sortOrder.value);
            isDataLoaded.value = true;
        }
    } catch (error: any) {
        console.error('Error loading initial data:', error);
    }
})

onUnmounted(() => {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
        searchTimeout = null;
    }
    if (dateRangeTimeout) {
        clearTimeout(dateRangeTimeout);
        dateRangeTimeout = null;
    }
    if (filterTimeout) {
        clearTimeout(filterTimeout);
        filterTimeout = null;
    }
})

function deleteAppointmentSlot(id: string) {
  // TODO: implement delete logic
  // appointmentSlotStore.deleteAppointmentSlot(id)
  toast.add({ severity: 'info', summary: 'Xoá', detail: `Xoá slot ${id} (stub)`, life: 2000 });
}


function search(): void {
  console.log('Search button clicked')
  // Reset to first page when searching
  fetchData(1, rows.value, searchText.value, sortField.value, sortOrder.value)
}

function refresh(): void {
  console.log('Refresh button clicked')
  // Refresh current data - use pagination page
  fetchData(pagination.value.page, rows.value, searchText.value, sortField.value, sortOrder.value)
}

</script>