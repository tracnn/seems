<template>
  <Dialog
    :visible="visible"
    :style="{ width: '600px' }"
    header="Thông tin lịch đặt khám"
    :modal="true"
    :closable="true"
    @update:visible="onHide"
  >
    <div class="p-fluid">
      <div class="grid">
        <!-- Thông tin bệnh nhân -->
        <div class="col-12 text-xl font-bold text-primary">Thông tin bệnh nhân</div>

        <div class="col-6 ">
          <label>Họ tên:</label>
          <div>{{ form?.fullName }}</div>
        </div>

        <div class="col-6 ">
          <label>Ngày sinh:</label>
          <div>{{ form?.patientDateOfBirth }}</div>
        </div>

        <div class="col-6 ">
          <label>Số điện thoại:</label>
          <div>{{ form?.phoneNumber }}</div>
        </div>

        <div class="col-6 ">
          <label>Địa chỉ:</label>
          <div>{{ form?.patientAddress }}</div>
        </div>

        <!-- Thông tin lịch hẹn -->
        <div class="col-12 text-xl font-bold text-primary">Thông tin lịch hẹn</div>

        <div class="col-6 ">
          <label>Ngày khám:</label>
          <div>{{ form?.slotDate }}</div>
        </div>

        <div class="col-6 ">
          <label>Giờ khám:</label>
          <div>{{ form?.slotTime }}</div>
        </div>

        <div class="col-6 ">
          <label>Phòng khám:</label>
          <div>{{ form?.clinicCode }}</div>
        </div>

        <div class="col-6 ">
          <label>Bác sĩ:</label>
          <div>{{ form?.doctorName }}</div>
        </div>

        <div class="col-6 ">
          <label>Dịch vụ:</label>
          <div>{{ form?.serviceName }}</div>
        </div>

        <div class="col-6 ">
          <label>Trạng thái:</label>
          <Tag :value="statusLabel" :severity="statusSeverity" />
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Huỷ" icon="pi pi-times" text @click="onHide" />
      <Button
        :label="isLoading ? 'Đang xử lý...' : 'Tạo hồ sơ HIS'"
        icon="pi pi-check"
        :loading="isLoading"
        :disabled="isLoading"
        @click="confirmCreateHIS"
      />
    </template>
  </Dialog>
</template>
  
<script setup lang="ts">
import { computed } from 'vue'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import Tag from 'primevue/tag'
import { useConfirm } from 'primevue/useconfirm'
import { useToast } from 'primevue/usetoast'
import { APPOINTMENT_STATUS_OPTIONS, APPOINTMENT_STATUS_SEVERITY } from './utils/appointment-enum'

const props = defineProps({
  visible: Boolean,
  form: Object,
  clinicOptions: { type: Array, default: () => [] },
  doctorOptions: { type: Array, default: () => [] },
  serviceOptions: { type: Array, default: () => [] },
  isLoading: Boolean, // Bổ sung prop nhận từ parent
})

const emits = defineEmits(['hide', 'save', 'clinic-change', 'create-his-appointment'])
const confirm = useConfirm()
const toast = useToast()

function onHide() {
  emits('hide')
}

const statusLabel = computed(() => {
  const found = APPOINTMENT_STATUS_OPTIONS.find(item => item.value === props.form?.appointmentStatus)
  return found ? found.label : 'Không xác định'
})

const statusSeverity = computed(() => {
  return APPOINTMENT_STATUS_SEVERITY[props.form?.appointmentStatus] || 'secondary'
})

function confirmCreateHIS() {
  if (props.form?.appointmentStatus !== 'PENDING') {
    toast.add({ severity: 'warn', summary: 'Không hợp lệ', detail: 'Chỉ có thể tạo hồ sơ HIS khi lịch hẹn đang ở trạng thái '
    + APPOINTMENT_STATUS_OPTIONS.find(item => item?.value === 'PENDING')?.label, life: 3000 })
    return
  }
  
  confirm.require({
    message: 'Bạn có chắc muốn tạo hồ sơ HIS cho lịch khám này?',
    header: 'Xác nhận',
    icon: 'pi pi-exclamation-triangle',
    acceptLabel: 'Đồng ý',
    rejectLabel: 'Huỷ',
    accept: () => {
      onCreateHISAppointment()
    },
    reject: () => {
      // Không làm gì nếu người dùng từ chối
    }
  })
}

function onCreateHISAppointment() {
  console.log('Form data:', props.form)
  console.log('Appointment ID:', props.form?.appointmentId)
  
  if (!props.form?.appointmentId) {
    console.error('Appointment ID is missing or null')
    toast.add({ severity: 'error', summary: 'Lỗi', detail: 'ID lịch khám không hợp lệ', life: 3000 })
    return
  }
  
  emits('create-his-appointment', props.form.appointmentId)
}
</script>