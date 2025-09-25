<template>
  <Toast />
  <div class="content">
    <div class="card">
      <AppointmentFilter
        :model="filterModel"
        :clinicOptions="clinicOptions"
        :doctorOptions="doctorOptions"
        :statusOptions="statusOptions"
      />
      <Toolbar>
        <template #start>
          <div class="flex flex-row gap-2"><span>Quản lý bệnh nhân đặt lịch khám</span></div>
        </template>
        <template #end>
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="searchText" placeholder="Tìm kiếm..."/>
          </IconField>
        </template>
      </Toolbar>
      <AppointmentTable
        :appointments="appointments"
        :loading="loading"
        :rows="rows"
        :totalRecords="totalRecords"
        :first="first"
        :sortField="sortField"
        :sortOrder="sortOrder"
        @edit="showEditDialog"
        @delete="deleteAppointment"
        @create-his="onCreateHISAppointment"
        @page="onPage"
        @sort="onSort"
      />
      <AppointmentDialog
        v-model:visible="appointmentDialog"
        :form="appointmentForm"
        :isLoading="isCreatingHIS"
        :clinicOptions="clinicOptions"
        :doctorOptions="doctorOptions"
        :serviceOptions="serviceOptions"
        @hide="hideDialog"
        @save="saveAppointment"
        @clinic-change="onClinicChange"
        @create-his-appointment="onCreateHISAppointment"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, onUnmounted, computed } from 'vue'
import Toolbar from 'primevue/toolbar'
import Toast from 'primevue/toast'
import { useToast } from 'primevue/usetoast'
import AppointmentFilter from './AppointmentFilter.vue'
import AppointmentTable from './AppointmentTable.vue'
import AppointmentDialog from './AppointmentDialog.vue'
import { useAppointmentStore } from '@/stores/appointment.store'
import { useClinicSpecialtyStore } from '@/stores/clinic-specialty.store'
import { useDoctorTitleStore } from '@/stores/doctor-title.store'
import { storeToRefs } from 'pinia'
import dayjs from 'dayjs'
import { APPOINTMENT_STATUS_OPTIONS } from './utils/appointment-enum'
import { AppointmentParams } from '@/models/appointment.model'
import { useConfirm } from 'primevue/useconfirm'

const toast = useToast()
const confirm = useConfirm();
const today = new Date()

// Dữ liệu lọc
const filterModel = reactive({
  dateRange: [today, today],
  filterClinicId: '',
  filterDoctorId: '',
  filterStatus: '',
})
const searchText = ref('')

// Dialog
const appointmentDialog = ref(false)
const appointmentForm = reactive({
  appointmentId: null,
  appointmentDate: '',
  appointmentTime: '',
  clinicId: '',
  doctorId: '',
  serviceId: '',
})

// Danh mục options
const clinicOptions = ref<any[]>([])
const doctorOptions = ref<any[]>([])
const serviceOptions = ref<any[]>([])

// Thêm biến để track việc đã load data chưa
const isDataLoaded = ref(false)

const clinicSpecialtyStore = useClinicSpecialtyStore()
const doctorTitleStore = useDoctorTitleStore()

const { clinicSpecialtiesForSelect } = storeToRefs(clinicSpecialtyStore)
const { doctorTitlesForSelect } = storeToRefs(doctorTitleStore)

const appointmentStore = useAppointmentStore()
const { appointments, loading, pagination } = storeToRefs(appointmentStore)

// Dữ liệu table
const rows = computed(() => Number(pagination.value.limit || 10))
const totalRecords = computed(() => Number(pagination.value.total || 0))
const first = computed(() => Number(((pagination.value.page - 1) * pagination.value.limit) || 0))
const sortField = ref('')
const sortOrder = ref(1)
const statusOptions = APPOINTMENT_STATUS_OPTIONS

// Thêm timeout cho debounce
let searchTimeout: any = null
let filterTimeout: any = null

watch(clinicSpecialtiesForSelect, (list) => {
  clinicOptions.value = (list || []).map((item: any) => ({
    label: item.clinicName,
    value: item.clinicId,
  }))
}, { immediate: true })

watch(doctorTitlesForSelect, (list) => {
  doctorOptions.value = (list || []).map((item: any) => ({
    label: item.doctorName,
    value: item.doctorId,
  }))
}, { immediate: true })

// Lấy dữ liệu khi vừa mount component
onMounted(async () => {
  try {
    // Load data song song để tăng tốc độ
    const promises = [
      clinicSpecialtyStore.fetchClinicSpecialtiesForSelect(),
      doctorTitleStore.fetchDoctorTitlesForSelect()
    ];
    
    await Promise.all(promises);
    
    // Chỉ fetch data chính sau khi đã load xong các data cần thiết
    if (!isDataLoaded.value) {
      fetchData();
      isDataLoaded.value = true;
    }
  } catch (error: any) {
    console.error('Error loading initial data:', error);
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'Không thể tải dữ liệu ban đầu', life: 3000 });
  }
})

onUnmounted(() => {
  // Cleanup khi component unmount
  if (searchTimeout) {
    clearTimeout(searchTimeout);
    searchTimeout = null;
  }
  if (filterTimeout) {
    clearTimeout(filterTimeout);
    filterTimeout = null;
  }
})

// Hàm fetch data (dễ reuse)
function fetchData(params = {}) {
  let fromDate = ''
  let toDate = ''
  if (filterModel.dateRange && filterModel.dateRange.length === 2) {
    fromDate = dayjs(filterModel.dateRange[0]).format('YYYY-MM-DD')
    toDate = dayjs(filterModel.dateRange[1]).format('YYYY-MM-DD')
  }

  const query = {
    page: pagination.value.page,
    limit: pagination.value.limit,
    clinicId: filterModel.filterClinicId || null,
    doctorId: filterModel.filterDoctorId || null,
    fromDate,
    toDate,
    search: searchText.value,
    appointmentStatus: filterModel.filterStatus || null,
    sortField: sortField.value,
    sortOrder: sortOrder.value,
    ...params, // Override với params được truyền vào
  }
  
  appointmentStore.fetchAppointments(query as unknown as AppointmentParams)
}

// Theo dõi search thay đổi với debounce
watch(searchText, () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchData({ page: 1 }) // Reset về trang 1 khi search
  }, 400)
})

// Theo dõi filter thay đổi với debounce
watch([() => filterModel.dateRange, 
       () => filterModel.filterClinicId, 
       () => filterModel.filterDoctorId,
       () => filterModel.filterStatus
      ], (newVal, oldVal) => {
  // Lấy dateRange trong mảng giá trị mới
  const dateRange = newVal[0]
  // Kiểm tra chỉ gọi fetchData khi filter là dateRange và đã chọn đủ cả from và to
  const isFullDateRange = Array.isArray(dateRange) && dateRange.length === 2 && dateRange[0] && dateRange[1]
  // Nếu dateRange chưa đủ hoặc undefined thì không fetch
  if (!isFullDateRange && JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
    // Trường hợp các filter khác thay đổi mà chưa đủ dateRange thì cũng bỏ qua
    return
  }
  
  // Chỉ trigger khi có sự thay đổi thực sự
  if (JSON.stringify(newVal) !== JSON.stringify(oldVal)) {
    if (filterTimeout) clearTimeout(filterTimeout)
    filterTimeout = setTimeout(() => {
      fetchData({ page: 1 }) // Reset về trang 1 khi filter
    }, 300)
  }
})

function showEditDialog(row: any) {
  // Gán dữ liệu vào appointmentForm
  console.log(row)
  Object.assign(appointmentForm, row)
  appointmentDialog.value = true
}

function hideDialog() {
  appointmentDialog.value = false
  // Reset form
  Object.assign(appointmentForm, {
    appointmentId: null,
    appointmentDate: '',
    appointmentTime: '',
    clinicId: '',
    doctorId: '',
    serviceId: '',
  })
}

async function saveAppointment(formData: any) {
  try {
    if (formData.appointmentId) {
      await appointmentStore.updateAppointment(formData.appointmentId, formData)
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Cập nhật lịch khám thành công', life: 5000 });
    } else {
      await appointmentStore.createAppointment(formData)
      toast.add({ severity: 'success', summary: 'Thành công', detail: 'Thêm lịch khám thành công', life: 5000 });
    }
    appointmentDialog.value = false
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.response.data.message || 'Có lỗi xảy ra', life: 5000 });
  }
}

function onPage(event: any) {
  // Xử lý phân trang
  const page = Math.floor(event.first / event.rows) + 1
  
  fetchData({
    page,
    limit: event.rows,
  })
}

function onSort(event: any) {
  sortField.value = event.sortField
  sortOrder.value = event.sortOrder
  fetchData({ page: 1 }) // Reset về trang 1 khi sort
}

function onClinicChange(event: any) {
  // Khi đổi phòng khám, load lại doctor/service
  console.log('Clinic changed:', event)
}


async function deleteAppointment(id: any): Promise<void> {
  confirm.require({
    message: 'Bạn có chắc chắn xóa không?',
    header: 'Danger Zone',
    icon: 'pi pi-info-circle',
    rejectLabel: 'Cancel',
    rejectProps: {
      label: 'Cancel',
      severity: 'secondary',
      outlined: true
    },
    acceptProps: {
      label: 'Delete',
      severity: 'danger'
    },
    accept: async () => {
      try {
        await appointmentStore.deleteAppointment(id);
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: 'Đã xóa thành công',
          life: 5000,
        });
      } catch (error: any) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: error?.response?.data?.message || 'Có lỗi xảy ra khi xóa',
          life: 5000,
        });
      }
    },
    reject: () => {
      toast.add({
        severity: 'info',
        summary: 'Đã huỷ',
        detail: 'Bạn đã huỷ thao tác xóa',
        life: 3000,
      });
    }
  });
}

const isCreatingHIS = ref(false)

async function onCreateHISAppointment(id: string) {
  console.log('Creating HIS appointment for ID:', id)
  
  if (!id) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'ID lịch khám không hợp lệ', life: 5000 });
    return
  }

  isCreatingHIS.value = true

  try {
    await appointmentStore.createHISAppointment({ appointmentId: id })
    toast.add({ severity: 'success', summary: 'Thành công', detail: 'Tạo hồ sơ HIS thành công', life: 5000 });
    appointmentDialog.value = false;
    fetchData();
  } catch (error: any) {
    toast.add({ severity: 'error', summary: 'Lỗi', detail: error.response.data.message || 'Có lỗi xảy ra khi tạo hồ sơ HIS', life: 5000 });
  } finally {
    isCreatingHIS.value = false
  }
}
</script>