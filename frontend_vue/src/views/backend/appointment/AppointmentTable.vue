<template>
  <DataTable
    :value="appointments"
    :lazy="true"
    dataKey="id"
    selectionMode="single"
    :paginator="true"
    :rows="rows"
    :totalRecords="totalRecords"
    :loading="loading"
    :first="first"
    :rowsPerPageOptions="TABLE_CONFIG.rowsPerPageOptions"
    :currentPageReportTemplate="'Hiển thị {first} đến {last} của {totalRecords} bản ghi'"
    :paginatorTemplate="'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'"
    @page="$emit('page', $event)"
    :sortField="sortField"
    :sortOrder="sortOrder"
    @sort="$emit('sort', $event)"
  >
    <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
    <Column field="slotDate" header="Ngày" sortable></Column>
    <Column field="slotTime" header="Giờ" sortable></Column>
    <Column field="appointmentCode" header="Mã đặt lịch" sortable></Column>
    <Column field="treatmentCode" header="Mã điều trị" sortable></Column>
    <Column field="fullName" header="Bệnh nhân" sortable></Column>
    <Column field="phoneNumber" header="Số điện thoại" sortable>
      <template #body="slotProps">
        {{ slotProps.data?.patient?.phoneNumber }} {{ slotProps.data?.patientFamily?.phoneNumber }}
      </template>
    </Column>
    <Column field="identityNumber" header="CCCD" sortable>
      <template #body="slotProps">
        {{ slotProps.data?.patient?.identityNumber }} {{ slotProps.data?.patientFamily?.identityNumber }}
      </template>
    </Column>
    <Column field="appointmentSymptom" header="Mô tả triệu chứng" sortable></Column>
    <Column field="clinicName" header="Phòng khám" sortable></Column>
    <Column field="doctorName" header="Bác sĩ" sortable></Column>
    <Column field="serviceName" header="Dịch vụ" sortable></Column>
    <Column field="createdAt" header="Ngày tạo" sortable>
      <template #body="slotProps">
        {{ dayjs(slotProps.data.createdAt).format('DD/MM/YYYY HH:mm') }}
      </template>
    </Column>
    <Column field="appointmentStatus" header="Trạng thái" sortable>
      <template #body="slotProps">
        <Tag :value="getStatusLabel(slotProps.data.appointmentStatus)" :severity="getStatusSeverity(slotProps.data.appointmentStatus)" />
      </template>
    </Column>
    <Column field="isActive" header="Tình trạng" sortable>
      <template #body="slotProps">
        <Tag :value="slotProps.data.isActive ? 'Kích hoạt' : 'Đã hủy'" :severity="slotProps.data.isActive ? 'success' : 'danger'" />
      </template>
    </Column>
    <Column :exportable="false" style="min-width: 10rem">
      <template #body="slotProps">
        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="$emit('edit', slotProps.data)" />
        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="$emit('delete', slotProps.data.appointmentId)" />
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { APPOINTMENT_STATUS_OPTIONS, APPOINTMENT_STATUS_SEVERITY } from './utils/appointment-enum'
import { TABLE_CONFIG } from '../../../utils/table-config.util'
import dayjs from 'dayjs'

function getStatusLabel(status: string) {
const found = APPOINTMENT_STATUS_OPTIONS.find(item => item.value === status)
return found ? found.label : status
}

function getStatusSeverity(status: string) {
return APPOINTMENT_STATUS_SEVERITY[status] || 'secondary'
}

defineProps({
  appointments: { type: Array, default: () => [] },
  loading: Boolean,
  rows: Number,
  totalRecords: Number,
  first: Number,
  sortField: String,
  sortOrder: Number,
})
</script>