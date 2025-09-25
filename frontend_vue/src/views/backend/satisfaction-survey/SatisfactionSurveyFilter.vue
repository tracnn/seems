<template>
  <Toolbar class="mb-2">
    <template #start>
      <div class="grid w-full md:grid-cols-5 sm:grid-cols-2 gap-3">
        <div>
          <label for="dateRange">Khoảng thời gian:</label>
          <DatePicker
            selectionMode="range"
            id="dateRange"
            v-model="model.dateRange"
            placeholder="Chọn khoảng thời gian"
            class="w-full"
            :maxDate="today"
          />
        </div>
        <div>
          <label for="surveyStatus">Trạng thái:</label>
          <Select
            id="surveyStatus"
            v-model="model.surveyStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Tất cả trạng thái"
            class="w-full"
            showClear
          />
        </div>
        <div>
          <label for="surveyType">Loại khảo sát:</label>
          <Select
            id="surveyType"
            v-model="model.surveyType"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Tất cả loại khảo sát"
            class="w-full"
            showClear
          />
        </div>
        <div>
          <label for="surveyScore">Điểm đánh giá:</label>
          <Select
            id="surveyScore"
            v-model="model.surveyScore"
            :options="scoreOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Tất cả điểm"
            class="w-full"
            showClear
          />
        </div>
        <div class="flex items-end gap-2">
          <Button
            label="Lọc"
            icon="pi pi-filter"
            @click="applyFilter"
            :disabled="!isFilterValid"
          />
          <Button
            label="Đặt lại"
            icon="pi pi-refresh"
            severity="secondary"
            @click="resetFilter"
          />
        </div>
      </div>
    </template>
  </Toolbar>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import DatePicker from 'primevue/datepicker'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Toolbar from 'primevue/toolbar'
import dayjs from 'dayjs'
import type { SatisfactionSurveyParams } from '@/models/satisfaction-survey.model'
import { SatisfactionSurveyStatus, SatisfactionSurveyType } from '@/models/satisfaction-survey.model'

interface Props {
  model: SatisfactionSurveyParams
  statusOptions: Array<{ label: string; value: SatisfactionSurveyStatus | undefined }>
  typeOptions: Array<{ label: string; value: SatisfactionSurveyType | undefined }>
  scoreOptions: Array<{ label: string; value: number | undefined }>
}

interface Emits {
  (e: 'filter', filters: SatisfactionSurveyParams): void
  (e: 'reset', resetData?: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Initialize with today's date as default
const today = dayjs().toDate()

// Computed properties
const isFilterValid = computed(() => {
  return props.model.dateRange || 
         props.model.surveyStatus || 
         props.model.surveyType ||
         props.model.surveyScore !== undefined
})

// Methods
const applyFilter = () => {
  const filters: SatisfactionSurveyParams = {
    fromDate: props.model.dateRange && props.model.dateRange.length === 2 
      ? dayjs(props.model.dateRange[0]).format('YYYY-MM-DD') 
      : undefined,
    toDate: props.model.dateRange && props.model.dateRange.length === 2 
      ? dayjs(props.model.dateRange[1]).format('YYYY-MM-DD') 
      : undefined,
    surveyStatus: props.model.surveyStatus,
    surveyType: props.model.surveyType,
    surveyScore: props.model.surveyScore,
  }
  emit('filter', filters)
}

const resetFilter = () => {
  // Reset to today's date range
  const todayRange = [dayjs().toDate(), dayjs().toDate()]
  const resetData = {
    dateRange: todayRange,
    surveyStatus: undefined,
    surveyType: undefined,
    surveyScore: undefined,
  }
  emit('reset', resetData)
}
</script>

<style scoped>
/* Styles are handled by PrimeVue components */
</style>
