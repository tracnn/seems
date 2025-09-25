<template>
  <Toolbar class="mb-2">
    <template #start>
      <div class="grid w-full md:grid-cols-4 sm:grid-cols-2 gap-3">
        <div>
          <label for="dateRange">Ngày khám:</label>
          <DatePicker
            selectionMode="range"
            id="dateRange"
            v-model="model.dateRange"
            placeholder="Chọn ngày"
            class="w-full"
          />
        </div>
        <div>
          <label for="filterClinicId">Phòng khám:</label>
          <Select
            id="filterClinicId"
            v-model="model.filterClinicId"
            :filter="true"
            filterPlaceholder="Tìm kiếm phòng khám"
            :options="clinicOptions"
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
            v-model="model.filterDoctorId"
            :filter="true"
            filterPlaceholder="Tìm kiếm bác sĩ"
            :options="doctorOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Tất cả bác sĩ"
            class="w-full"
            showClear
          />
        </div>
        <div>
          <label for="filterStatus">Trạng thái:</label>
          <Select
            id="filterStatus"
            v-model="model.filterStatus"
            :options="APPOINTMENT_STATUS_OPTIONS"
            optionLabel="label"
            optionValue="value"
            placeholder="Tất cả trạng thái"
            class="w-full"
            showClear
          />
        </div>
        <div class="flex items-end"></div>
      </div>
    </template>
  </Toolbar>
</template>
  
<script setup lang="ts">
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import Toolbar from 'primevue/toolbar'
import { APPOINTMENT_STATUS_OPTIONS } from './utils/appointment-enum'

defineProps({
  model: { type: Object, required: true },
  clinicOptions: { type: Array, default: () => [] },
  doctorOptions: { type: Array, default: () => [] },
})
</script>