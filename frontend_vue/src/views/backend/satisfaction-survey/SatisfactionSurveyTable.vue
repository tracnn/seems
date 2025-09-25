<template>
  <DataTable
    :value="surveys"
    :loading="loading"
    :paginator="true"
    :rows="rows"
    :totalRecords="totalRecords"
    :first="first"
    :sortField="sortField"
    :sortOrder="sortOrder"
    :lazy="true"
    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
    :rowsPerPageOptions="[5, 10, 20, 50]"
    currentPageReportTemplate="Hiển thị {first} đến {last} trong tổng số {totalRecords} bản ghi"
    responsiveLayout="scroll"
    @page="onPage"
    @sort="onSort"
    class="p-datatable-sm"
  >
    <Column field="user.fullName" header="Tên bệnh nhân" :sortable="true">
      <template #body="{ data }">
        <div class="flex flex-column">
          <span class="font-semibold">{{ data.user.fullName }}</span>
          <span class="text-sm text-500">{{ data.user.phoneNumber }}</span>
        </div>
      </template>
    </Column>
    
    <Column field="patientCode" header="Mã bệnh nhân" :sortable="true">
      <template #body="{ data }">
        <Tag :value="data.patientCode" severity="info" />
      </template>
    </Column>
    
    <Column field="treatmentCode" header="Mã điều trị" :sortable="true">
      <template #body="{ data }">
        <span class="font-mono text-sm">{{ data.treatmentCode }}</span>
      </template>
    </Column>
    
    <Column field="serviceReqCode" header="Mã dịch vụ" :sortable="true">
      <template #body="{ data }">
        <span v-if="data.serviceReqCode" class="font-mono text-sm">{{ data.serviceReqCode }}</span>
        <span v-else class="text-500">-</span>
      </template>
    </Column>
    
    <Column field="surveyType" header="Loại khảo sát" :sortable="true">
      <template #body="{ data }">
        <Tag 
          :value="getSurveyTypeLabel(data.surveyType)" 
          :severity="getSurveyTypeSeverity(data.surveyType)"
        />
      </template>
    </Column>
    
    <Column field="surveyStatus" header="Trạng thái" :sortable="true">
      <template #body="{ data }">
        <Tag 
          :value="getSurveyStatusLabel(data.surveyStatus)" 
          :severity="getSurveyStatusSeverity(data.surveyStatus)"
        />
      </template>
    </Column>
    
    <Column field="surveyScore" header="Điểm đánh giá" :sortable="true">
      <template #body="{ data }">
        <div class="flex align-items-center gap-2">
          <Rating :modelValue="data.surveyScore" :readonly="true" :cancel="false" />
          <span class="font-semibold">{{ data.surveyScore }}/5</span>
        </div>
      </template>
    </Column>
    
    <Column field="surveyComment" header="Bình luận">
      <template #body="{ data }">
        <div v-if="data.surveyComment" class="max-w-20rem">
          <span class="text-sm">{{ data.surveyComment }}</span>
        </div>
        <span v-else class="text-500">-</span>
      </template>
    </Column>

    <Column field="surveyResponse" header="Trả lời">
      <template #body="{ data }">
        <div v-if="data.surveyResponse" class="max-w-20rem">
          <span class="text-sm">{{ data.surveyResponse }}</span>
        </div>
        <span v-else class="text-500">-</span>
      </template>
    </Column>

    <Column field="createdAt" header="Ngày tạo" :sortable="true">
      <template #body="{ data }">
        <span class="text-sm">{{ formatDate(data.createdAt) }}</span>
      </template>
    </Column>
    
    <Column header="Thao tác" :exportable="false" style="min-width: 8rem">
      <template #body="{ data }">
        <div class="flex gap-2">
          <Button
            icon="pi pi-pencil"
            outlined
            rounded
            severity="info"
            size="small"
            @click="editSurvey(data)"
            v-tooltip.top="'Chỉnh sửa'"
          />
          <Button
            icon="pi pi-trash"
            outlined
            rounded
            severity="danger"
            size="small"
            @click="deleteSurvey(data)"
            v-tooltip.top="'Xóa'"
          />
        </div>
      </template>
    </Column>
  </DataTable>
</template>

<script setup lang="ts">
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Rating from 'primevue/rating'
import type { SatisfactionSurvey } from '@/models/satisfaction-survey.model'
import { SatisfactionSurveyStatus, SatisfactionSurveyType } from '@/models/satisfaction-survey.model'

interface Props {
  surveys: SatisfactionSurvey[]
  loading: boolean
  rows: number
  totalRecords: number
  first: number
  sortField: string
  sortOrder: number
}

interface Emits {
  (e: 'edit', survey: SatisfactionSurvey): void
  (e: 'delete', survey: SatisfactionSurvey): void
  (e: 'page', event: any): void
  (e: 'sort', event: any): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

// Methods
const editSurvey = (survey: SatisfactionSurvey) => {
  emit('edit', survey)
}

const deleteSurvey = (survey: SatisfactionSurvey) => {
  emit('delete', survey)
}

const onPage = (event: any) => {
  emit('page', event)
}

const onSort = (event: any) => {
  emit('sort', event)
}

const getSurveyTypeLabel = (type: SatisfactionSurveyType): string => {
  switch (type) {
    case SatisfactionSurveyType.TREATMENT:
      return 'Hồ sơ điều trị'
    case SatisfactionSurveyType.SERVICE:
      return 'Dịch vụ kỹ thuật'
    default:
      return type
  }
}

const getSurveyTypeSeverity = (type: SatisfactionSurveyType): string => {
  switch (type) {
    case SatisfactionSurveyType.TREATMENT:
      return 'success'
    case SatisfactionSurveyType.SERVICE:
      return 'info'
    default:
      return 'secondary'
  }
}

const getSurveyStatusLabel = (status: SatisfactionSurveyStatus): string => {
  switch (status) {
    case SatisfactionSurveyStatus.PENDING:
      return 'Chờ xử lý'
    case SatisfactionSurveyStatus.IN_PROGRESS:
      return 'Đang xử lý'
    case SatisfactionSurveyStatus.COMPLETED:
      return 'Hoàn thành'
    case SatisfactionSurveyStatus.CANCELLED:
      return 'Đã hủy'
    default:
      return status
  }
}

const getSurveyStatusSeverity = (status: SatisfactionSurveyStatus): string => {
  switch (status) {
    case SatisfactionSurveyStatus.PENDING:
      return 'warning'
    case SatisfactionSurveyStatus.IN_PROGRESS:
      return 'info'
    case SatisfactionSurveyStatus.COMPLETED:
      return 'success'
    case SatisfactionSurveyStatus.CANCELLED:
      return 'danger'
    default:
      return 'secondary'
  }
}

const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}
</script>

<style scoped>
.max-w-20rem {
  max-width: 20rem;
  word-wrap: break-word;
}
</style>
