<template>
  <Dialog
    :visible="visible"
    :header="form.id ? 'Chỉnh sửa khảo sát hài lòng' : 'Thêm khảo sát hài lòng'"
    :modal="true"
    :closable="true"
    :style="{ width: '50vw' }"
    @hide="onHide"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="grid">
      <div class="col-12">
        <div class="field">
          <label for="userFullName">Tên bệnh nhân</label>
          <InputText
            id="userFullName"
            :value="localForm.user?.fullName || ''"
            readonly
            class="w-full"
          />
        </div>
      </div>
      
      <div class="col-12 md:col-6">
        <div class="field">
          <label for="patientCode">Mã bệnh nhân</label>
          <InputText
            id="patientCode"
            :value="localForm.patientCode || ''"
            readonly
            class="w-full"
          />
        </div>
      </div>
      
      <div class="col-12 md:col-6">
        <div class="field">
          <label for="treatmentCode">Mã điều trị</label>
          <InputText
            id="treatmentCode"
            :value="localForm.treatmentCode || ''"
            readonly
            class="w-full"
          />
        </div>
      </div>
      
      <div class="col-12 md:col-6">
        <div class="field">
          <label for="serviceReqCode">Mã dịch vụ</label>
          <InputText
            id="serviceReqCode"
            :value="localForm.serviceReqCode || ''"
            readonly
            class="w-full"
          />
        </div>
      </div>
      
      <div class="col-12 md:col-6">
        <div class="field">
          <label for="surveyType">Loại khảo sát</label>
          <Select
            id="surveyType"
            v-model="localForm.surveyType"
            :options="typeOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn loại khảo sát"
            readonly
            class="w-full"
          />
        </div>
      </div>

      <div class="col-12">
        <div class="field">
          <label for="surveyComment">Bình luận</label>
          <Textarea
            id="surveyComment"
            v-model="localForm.surveyComment"
            rows="2"
            placeholder="Nhập bình luận..."
            readonly
            class="w-full"
          />
        </div>
      </div>
      
      <div class="col-12 md:col-6">
        <div class="field">
          <label for="surveyStatus">Trạng thái</label>
          <Select
            id="surveyStatus"
            v-model="localForm.surveyStatus"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Chọn trạng thái"
            class="w-full"
          />
        </div>
      </div>
      
      <div class="col-12 md:col-6">
        <div class="field">
          <label for="surveyScore">Điểm đánh giá</label>
          <Rating
            id="surveyScore"
            v-model="localForm.surveyScore"
            :cancel="false"
            class="w-full"
          />
        </div>
      </div>
    </div>

    <div class="col-12">
      <div class="field">
        <label for="surveyResponse">Trả lời</label>
        <Textarea
          id="surveyResponse"
          v-model="localForm.surveyResponse"
          rows="4"
          placeholder="Nhập câu trả lời..."
          class="w-full"
        />
      </div>
    </div>

    <template #footer>
      <div class="flex justify-content-end gap-2">
        <Button
          label="Hủy"
          icon="pi pi-times"
          severity="secondary"
          @click="onHide"
          :disabled="isLoading"
        />
        <Button
          label="Lưu"
          icon="pi pi-check"
          @click="onSave"
          :loading="isLoading"
        />
      </div>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import Select from 'primevue/select'
import Rating from 'primevue/rating'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import type { SatisfactionSurvey } from '@/models/satisfaction-survey.model'
import { SatisfactionSurveyStatus, SatisfactionSurveyType } from '@/models/satisfaction-survey.model'

interface Props {
  visible: boolean
  form: Partial<SatisfactionSurvey>
  isLoading: boolean
}

interface Emits {
  (e: 'update:visible', value: boolean): void
  (e: 'hide'): void
  (e: 'save', data: Partial<SatisfactionSurvey>): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const localForm = ref<Partial<SatisfactionSurvey>>({
  id: '',
  userId: '',
  patientCode: '',
  treatmentCode: '',
  serviceReqCode: '',
  surveyStatus: SatisfactionSurveyStatus.PENDING,
  surveyType: SatisfactionSurveyType.TREATMENT,
  surveyScore: 5,
  surveyComment: '',
  surveyResponse: '',
  user: {
    id: '',
    fullName: '',
    phoneNumber: '',
    email: '',
    createdAt: '',
    updatedAt: '',
    createdBy: '',
    updatedBy: '',
    version: 1,
    username: '',
    isLocked: 0,
    lastLoginAt: '',
    lastLoginIp: '',
    lastLoginUserAgent: '',
    patientCode: '',
    birthDate: '',
    genderCode: 0,
    address: '',
    provinceId: 0,
    districtId: 0,
    communeId: 0,
    heinCardNumber: '',
    insuranceNumber: '',
    identityNumber: '',
    careerId: 0,
    isActive: 1,
    ethnicId: 0,
    nationalId: 0,
  },
})

// Options for dropdowns
const statusOptions = [
  { label: 'Chờ xử lý', value: SatisfactionSurveyStatus.PENDING },
  { label: 'Đang xử lý', value: SatisfactionSurveyStatus.IN_PROGRESS },
  { label: 'Hoàn thành', value: SatisfactionSurveyStatus.COMPLETED },
  { label: 'Đã hủy', value: SatisfactionSurveyStatus.CANCELLED },
]

const typeOptions = [
  { label: 'Hồ sơ điều trị', value: SatisfactionSurveyType.TREATMENT },
  { label: 'Dịch vụ kỹ thuật', value: SatisfactionSurveyType.SERVICE },
]

// Watch for form changes
watch(() => props.form, (newForm) => {
  if (newForm) {
    localForm.value = { ...newForm }
  }
}, { deep: true, immediate: true })

// Methods
const onHide = () => {
  emit('update:visible', false)
  emit('hide')
}

const onSave = () => {
  emit('save', { ...localForm.value })
}
</script>

<style scoped>
.field {
  margin-bottom: 1rem;
}

.field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #495057;
}
</style>
