<template>
  <Toast />
  <div class="content">
    <div class="card">
      <SatisfactionSurveyFilter
        :model="filterModel"
        :statusOptions="statusOptions"
        :typeOptions="typeOptions"
        :scoreOptions="scoreOptions"
        @filter="onFilter"
        @reset="onResetFilter"
      />
      <Toolbar>
        <template #start>
          <div class="flex flex-row gap-2">
            <span>Quản lý khảo sát hài lòng</span>
          </div>
        </template>
        <template #end>
          <IconField>
            <InputIcon>
              <i class="pi pi-search" />
            </InputIcon>
            <InputText v-model="searchText" placeholder="Tìm kiếm..." @input="onSearch" />
          </IconField>
        </template>
      </Toolbar>
      <SatisfactionSurveyTable
        :surveys="surveys"
        :loading="loading"
        :rows="rows"
        :totalRecords="totalRecords"
        :first="first"
        :sortField="sortField"
        :sortOrder="sortOrder"
        @edit="showEditDialog"
        @delete="deleteSurvey"
        @page="onPage"
        @sort="onSort"
      />
      <SatisfactionSurveyDialog
        :visible="surveyDialog"
        :form="surveyForm"
        :isLoading="isLoading"
        @update:visible="surveyDialog = $event"
        @hide="hideDialog"
        @save="saveSurvey"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { debounce } from 'lodash-es'
import { useSatisfactionSurveyStore } from '@/stores/satisfaction-survey.store'
import { SatisfactionSurveyStatus, SatisfactionSurveyType } from '@/models/satisfaction-survey.model'
import type { SatisfactionSurvey, SatisfactionSurveyParams } from '@/models/satisfaction-survey.model'
import dayjs from 'dayjs'
// Import components directly
import SatisfactionSurveyFilter from './SatisfactionSurveyFilter.vue'
import SatisfactionSurveyTable from './SatisfactionSurveyTable.vue'
import SatisfactionSurveyDialog from './SatisfactionSurveyDialog.vue'
import Toast from 'primevue/toast'
import Toolbar from 'primevue/toolbar'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'
import InputText from 'primevue/inputtext'
import { useToast } from 'primevue/usetoast'

const toast = useToast()
const satisfactionSurveyStore = useSatisfactionSurveyStore()

// State
const searchText = ref('')
const surveyDialog = ref(false)
const isLoading = ref(false)
const surveyForm = ref<Partial<SatisfactionSurvey>>({})

// Pagination
const rows = ref(10)
const first = ref(0)
const sortField = ref('')
const sortOrder = ref(0)

// Initialize with today's date as default
const today = dayjs().toDate()
const defaultDateRange = [today, today]

// Filter model
const filterModel = ref<SatisfactionSurveyParams>({
  page: 1,
  limit: 10,
  dateRange: defaultDateRange,
  surveyStatus: undefined,
  surveyType: undefined,
  surveyScore: undefined,
  search: '',
  sortField: '',
  sortOrder: 0,
})

// Options for dropdowns
const statusOptions = [
  { label: 'Tất cả', value: undefined },
  { label: 'Chờ xử lý', value: SatisfactionSurveyStatus.PENDING },
  { label: 'Đang xử lý', value: SatisfactionSurveyStatus.IN_PROGRESS },
  { label: 'Hoàn thành', value: SatisfactionSurveyStatus.COMPLETED },
  { label: 'Đã hủy', value: SatisfactionSurveyStatus.CANCELLED },
]

const typeOptions = [
  { label: 'Tất cả', value: undefined },
  { label: 'Hồ sơ diều trị', value: SatisfactionSurveyType.TREATMENT },
  { label: 'Dịch vụ kỹ thuật', value: SatisfactionSurveyType.SERVICE },
]

const scoreOptions = [
  { label: 'Tất cả', value: undefined },
  { label: '1 sao', value: 1 },
  { label: '2 sao', value: 2 },
  { label: '3 sao', value: 3 },
  { label: '4 sao', value: 4 },
  { label: '5 sao', value: 5 },
]

// Computed
const surveys = computed(() => satisfactionSurveyStore.getSurveys)
const loading = computed(() => satisfactionSurveyStore.getLoading)
const totalRecords = computed(() => satisfactionSurveyStore.getPagination.total)

// Methods
const loadSurveys = async () => {
  try {
    const params: SatisfactionSurveyParams = {
      ...filterModel.value,
      fromDate: filterModel.value.dateRange && filterModel.value.dateRange.length === 2 
        ? dayjs(filterModel.value.dateRange[0]).format('YYYY-MM-DD') 
        : undefined,
      toDate: filterModel.value.dateRange && filterModel.value.dateRange.length === 2 
        ? dayjs(filterModel.value.dateRange[1]).format('YYYY-MM-DD') 
        : undefined,
    }
    // Remove dateRange from params as it's not needed for API
    delete params.dateRange
    await satisfactionSurveyStore.fetchAdminSurveys(params)
  } catch (error) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không thể tải danh sách khảo sát hài lòng',
      life: 3000,
    })
  }
}

const onFilter = (filters: SatisfactionSurveyParams) => {
  filterModel.value = { ...filterModel.value, ...filters, page: 1 }
  first.value = 0
  loadSurveys()
}

const onResetFilter = (resetData?: any) => {
  filterModel.value = {
    page: 1,
    limit: 10,
    dateRange: resetData?.dateRange || defaultDateRange,
    surveyStatus: resetData?.surveyStatus || undefined,
    surveyType: resetData?.surveyType || undefined,
    surveyScore: resetData?.surveyScore || undefined,
    search: '',
    sortField: '',
    sortOrder: 0,
  }
  first.value = 0
  loadSurveys()
}

const onSearch = debounce(() => {
  filterModel.value.search = searchText.value
  filterModel.value.page = 1
  first.value = 0
  loadSurveys()
}, 300)

const onPage = (event: any) => {
  first.value = event.first
  rows.value = event.rows
  filterModel.value.page = Math.floor(event.first / event.rows) + 1
  filterModel.value.limit = event.rows
  loadSurveys()
}

const onSort = (event: any) => {
  sortField.value = event.sortField
  sortOrder.value = event.sortOrder
  filterModel.value.sortField = event.sortField
  filterModel.value.sortOrder = event.sortOrder
  loadSurveys()
}

const showEditDialog = (survey: SatisfactionSurvey) => {
  surveyForm.value = { ...survey }
  surveyDialog.value = true
}

const hideDialog = () => {
  surveyDialog.value = false
  surveyForm.value = {}
}

const saveSurvey = async (formData: Partial<SatisfactionSurvey>) => {
  isLoading.value = true
  try {
    if (formData.id) {
      // Prepare current filter params for refresh
      const currentParams: SatisfactionSurveyParams = {
        ...filterModel.value,
        fromDate: filterModel.value.dateRange && filterModel.value.dateRange.length === 2 
          ? dayjs(filterModel.value.dateRange[0]).format('YYYY-MM-DD') 
          : undefined,
        toDate: filterModel.value.dateRange && filterModel.value.dateRange.length === 2 
          ? dayjs(filterModel.value.dateRange[1]).format('YYYY-MM-DD') 
          : undefined,
      }
      delete currentParams.dateRange
      
      await satisfactionSurveyStore.updateSurvey(formData.id, formData, currentParams)
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Cập nhật khảo sát hài lòng thành công',
        life: 3000,
      })
      hideDialog()
    }
  } catch (error: any) {
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: error.response.data.message || 'Không thể cập nhật khảo sát hài lòng',
      life: 3000,
    })
  } finally {
    isLoading.value = false
  }
}

const deleteSurvey = async (survey: SatisfactionSurvey) => {
  if (confirm(`Bạn có chắc chắn muốn xóa khảo sát hài lòng của ${survey.user.fullName}?`)) {
    try {
      // Prepare current filter params for refresh
      const currentParams: SatisfactionSurveyParams = {
        ...filterModel.value,
        fromDate: filterModel.value.dateRange && filterModel.value.dateRange.length === 2 
          ? dayjs(filterModel.value.dateRange[0]).format('YYYY-MM-DD') 
          : undefined,
        toDate: filterModel.value.dateRange && filterModel.value.dateRange.length === 2 
          ? dayjs(filterModel.value.dateRange[1]).format('YYYY-MM-DD') 
          : undefined,
      }
      delete currentParams.dateRange
      
      await satisfactionSurveyStore.deleteSurvey(survey.id, currentParams)
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Xóa khảo sát hài lòng thành công',
        life: 3000,
      })
    } catch (error) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Không thể xóa khảo sát hài lòng',
        life: 3000,
      })
    }
  }
}

// Lifecycle
onMounted(() => {
  loadSurveys()
})
</script>

<style scoped>
.content {
  padding: 1rem;
}

.card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1rem;
}
</style>
