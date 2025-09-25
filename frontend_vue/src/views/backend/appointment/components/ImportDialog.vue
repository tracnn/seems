<template>
  <Dialog
    :visible="visible"
    @update:visible="$emit('update:visible', $event)"
    :style="{ 
      width: (uploading || importProgress.isImporting) ? '700px' : '500px', 
      maxWidth: '98vw' 
    }"
    header="Import lịch khám từ Excel"
    :modal="true"
    :closable="true"
  >
    <div class="p-fluid">
      <!-- Hướng dẫn -->
      <div class="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
        <h6 class="mb-2 text-blue-800">
          <i class="pi pi-info-circle mr-2"></i>
          Hướng dẫn import
        </h6>
        <ul class="text-sm text-blue-700 mb-0">
          <li>File Excel phải có định dạng .xlsx hoặc .xls</li>
          <li>Kích thước file tối đa 10MB</li>
          <li><strong>Cấu trúc cột:</strong> slot_date, clinic_code, doctor_code, service_code, morning, afternoon, evening</li>
          <li><strong>Buổi sáng/chiều/tối:</strong> "x" = có lịch, trống = không có lịch</li>
          <li><strong>Ngày:</strong> Định dạng YYYY-MM-DD (VD: 2024-01-15)</li>
        </ul>
      </div>

      <!-- Upload Area -->
      <div class="mb-4">
        <label class="font-bold mb-2 block">Chọn file Excel:</label>
        <FileUpload
          ref="fileUpload"
          mode="basic"
          accept=".xlsx,.xls"
          :maxFileSize="10485760"
          :auto="false"
          :multiple="false"
          chooseLabel="Chọn file"
          :disabled="uploading"
          @select="onFileSelect"
          @upload="onFileUpload"
          @error="onUploadError"
          @clear="onFileClear"
          class="w-full"
        />
      </div>

      <!-- File Info -->
      <div v-if="selectedFile" class="mb-4 p-3 bg-gray-50 border border-gray-200 rounded">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <i class="pi pi-file-excel text-green-600 mr-2"></i>
            <div>
              <div class="font-medium">{{ selectedFile.name }}</div>
              <div class="text-sm text-gray-600">
                {{ formatFileSize(selectedFile.size) }}
              </div>
            </div>
          </div>
          <Button
            v-if="!uploading"
            icon="pi pi-times"
            class="p-button-text p-button-danger"
            @click="clearFile"
            v-tooltip.top="'Xóa file'"
          />
        </div>
      </div>

      <!-- SSE Connection Status (always visible when dialog is open) -->
      <div class="mb-4 p-3 border rounded" :class="{
        'bg-green-50 border-green-200': isConnected,
        'bg-red-50 border-red-200': !isConnected && error,
        'bg-yellow-50 border-yellow-200': !isConnected && !error
      }">
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <i :class="{
              'pi pi-check-circle text-green-600': isConnected,
              'pi pi-times-circle text-red-600': !isConnected && error,
              'pi pi-clock text-yellow-600': !isConnected && !error
            }" class="mr-2"></i>
            <div>
              <div class="font-medium" :class="{
                'text-green-800': isConnected,
                'text-red-800': !isConnected && error,
                'text-yellow-800': !isConnected && !error
              }">
                {{ isConnected ? 'SSE Connected' : (error ? 'SSE Connection Failed' : 'Connecting to SSE...') }}
              </div>
              <div class="text-xs" :class="{
                'text-green-600': isConnected,
                'text-red-600': !isConnected && error,
                'text-yellow-600': !isConnected && !error
              }">
                {{ isConnected ? `Ready to receive real-time updates (${sseEventCount} events)` : (error || 'Establishing connection...') }}
              </div>
            </div>
          </div>
          <div class="flex gap-1">
            <Button 
              v-if="!isConnected"
              icon="pi pi-refresh" 
              size="small" 
              @click="retrySSEConnection"
              v-tooltip.top="'Retry SSE Connection'"
              class="p-button-text"
            />
            <Button 
              icon="pi pi-cog" 
              size="small" 
              @click="testSSEConnection"
              v-tooltip.top="'Test SSE Connection'"
              class="p-button-text"
            />
          </div>
        </div>
      </div>

      <!-- Debug Info (temporary) -->
      <div v-if="uploading || importProgress.isImporting || importProgress.progress > 0 || importProgress.isCompleted" class="mb-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs">
        <strong>Debug:</strong> 
        uploading={{ uploading }}, 
        isImporting={{ importProgress.isImporting }}, 
        progress={{ importProgress.progress }}%, 
        phase={{ importProgress.currentPhase }}, 
        message="{{ importProgress.message }}",
        inserted={{ importProgress.inserted }},
        total={{ importProgress.total }},
        isCompleted={{ importProgress.isCompleted }},
        errors={{ importProgress.errors.length }}
        <br>
        <strong>SSE Status:</strong>
        connected={{ isConnected }}, 
        events={{ sseEventCount }}, 
        error="{{ error }}"
        <br>
        <div class="flex gap-2 mt-1">
          <Button 
            label="Test SSE Connection" 
            size="small" 
            @click="testSSEConnection"
          />
          <Button 
            label="Test Import SSE" 
            size="small" 
            @click="testImportSSE"
            severity="secondary"
          />
        </div>
      </div>

      <!-- Simple Progress Section (always show when uploading) -->
      <div v-if="uploading" class="mb-4">
        <div class="flex items-center justify-between mb-2">
          <span class="text-sm font-medium text-gray-700">Đang upload file...</span>
          <span class="text-sm font-bold text-blue-600">{{ uploadProgress }}%</span>
        </div>
        <ProgressBar 
          :value="uploadProgress" 
          class="w-full h-3"
          :showValue="false"
        />
      </div>

      <!-- Fallback Progress (show when import starts but no SSE data yet) -->
      <div v-if="uploading && !importProgress.isImporting && importProgress.progress === 0" class="mb-4">
        <div class="p-3 bg-yellow-50 border border-yellow-200 rounded">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-yellow-800">Đang khởi tạo import...</span>
            <span class="text-sm font-bold text-yellow-600">0%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-yellow-500 h-2 rounded-full animate-pulse" style="width: 5%"></div>
          </div>
          <div class="text-xs text-yellow-600 mt-1">
            Đang kết nối với server để nhận tiến trình...
          </div>
        </div>
      </div>

      <!-- SSE Progress Section -->
      <div v-if="importProgress.isImporting || importProgress.progress > 0 || importProgress.isCompleted" class="mb-4">
        
        <!-- 1. Progress Bar Section (Top) -->
        <div class="p-3 bg-blue-50 border border-blue-200 rounded mb-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-blue-800">Tiến trình import:</span>
            <span class="text-sm font-bold text-blue-600">{{ importProgress.progress }}%</span>
          </div>
          <div class="w-full bg-gray-200 rounded-full h-3">
            <div 
              class="bg-blue-600 h-3 rounded-full transition-all duration-300"
              :style="{ width: importProgress.progress + '%' }"
            ></div>
          </div>
          <div class="text-xs text-blue-600 mt-1">
            {{ importProgress.inserted || 0 }}/{{ importProgress.total || 0 }} records
          </div>
        </div>

        <!-- 2. Current Status Section (Middle) -->
        <div class="p-4 bg-green-50 border border-green-200 rounded mb-3">
          <h6 class="text-sm font-semibold text-green-800 mb-3 flex items-center">
            <i class="pi pi-info-circle mr-2"></i>
            Trạng thái hiện tại
          </h6>
          
          <div class="grid grid-cols-2 gap-3 text-xs mb-3">
            <div>
              <span class="font-medium text-gray-600">Phase:</span>
              <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                {{ importProgress.currentPhase || 'Chưa có' }}
              </span>
            </div>
            <div>
              <span class="font-medium text-gray-600">Success:</span>
              <span class="ml-2 px-2 py-1 rounded text-xs font-medium" 
                    :class="importProgress.isError ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'">
                {{ importProgress.isError ? 'False' : 'True' }}
              </span>
            </div>
            <div>
              <span class="font-medium text-gray-600">Inserted:</span>
              <span class="ml-2 font-bold text-green-700">{{ importProgress.inserted || 0 }}</span>
            </div>
            <div>
              <span class="font-medium text-gray-600">Total:</span>
              <span class="ml-2 font-bold text-blue-700">{{ importProgress.total || 0 }}</span>
            </div>
          </div>
          
          <div class="mb-2">
            <span class="font-medium text-gray-600 text-xs">Thông báo:</span>
            <div class="mt-1 p-2 bg-white border rounded text-xs text-gray-700">
              {{ importProgress.message || 'Chưa có thông báo từ server' }}
            </div>
          </div>
          
          <div v-if="importProgress.lastUpdateTime" class="text-xs text-gray-500">
            <i class="pi pi-clock mr-1"></i>
            Cập nhật lần cuối: {{ formatTime(importProgress.lastUpdateTime) }}
          </div>
        </div>

        <!-- 3. Error List Section (Bottom) -->
        <div v-if="importProgress.errors.length > 0" class="p-4 bg-red-50 border border-red-200 rounded">
          <div class="flex items-center justify-between mb-3">
            <h6 class="text-sm font-semibold text-red-800 flex items-center">
              <i class="pi pi-exclamation-triangle mr-2"></i>
              Danh sách lỗi ({{ importProgress.errors.length }})
            </h6>
            <span class="text-xs text-gray-500">Hiển thị 10 lỗi gần nhất</span>
          </div>
          
          <div class="max-h-40 overflow-y-auto bg-white border border-red-200 rounded p-3">
            <div 
              v-for="(error, index) in importProgress.errors.slice(-10)" 
              :key="index"
              class="text-xs text-red-700 mb-2 p-2 bg-red-50 rounded border-l-3 border-red-400"
            >
              <div class="flex items-start">
                <span class="font-medium text-red-800 mr-2">Dòng {{ error.row }}:</span>
                <span>{{ error.message }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Error Message -->
      <div v-if="errorMessage" class="mb-4 p-3 bg-red-50 border border-red-200 rounded">
        <div class="flex items-center">
          <i class="pi pi-exclamation-triangle text-red-600 mr-2"></i>
          <div class="text-red-700 text-sm">{{ errorMessage }}</div>
        </div>
      </div>

      <!-- Success Message -->
      <div v-if="successMessage" class="mb-4 p-3 bg-green-50 border border-green-200 rounded">
        <div class="flex items-center">
          <i class="pi pi-check-circle text-green-600 mr-2"></i>
          <div class="text-green-700 text-sm">{{ successMessage }}</div>
        </div>
      </div>

      <!-- Template Download -->
      <div class="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
        <h6 class="mb-2 text-yellow-800">
          <i class="pi pi-download mr-2"></i>
          Tải template mẫu
        </h6>
        <p class="text-sm text-yellow-700 mb-2">
          Tải file template mẫu để đảm bảo cấu trúc dữ liệu đúng
        </p>
        <Button
          label="Tải template"
          icon="pi pi-download"
          class="p-button-outlined p-button-sm"
          @click="downloadTemplate"
          :disabled="uploading"
        />
      </div>
    </div>

    <template #footer>
      <Button
        label="Hủy"
        icon="pi pi-times"
        class="p-button-text"
        @click="closeDialog"
      />
      <Button
        label="Import"
        icon="pi pi-upload"
        class="p-button-primary"
        @click="handleImport"
        :disabled="!selectedFile || uploading || importProgress.isImporting"
        :loading="uploading || importProgress.isImporting"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, reactive, onUnmounted } from 'vue'
import { useAppointmentSlotsStore } from '@/stores/appointment-slots.store'
import { useToast } from 'primevue/usetoast'
import FileUpload from 'primevue/fileupload'
import ProgressBar from 'primevue/progressbar'
import { useSSE } from '@/composables/useSSE'
import { ImportProgressState, ImportPhase, type ImportProgressData } from '@/types/import-progress'

// Props
interface Props {
  visible: boolean
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'import-success': []
}>()

// Stores
const appointmentSlotsStore = useAppointmentSlotsStore()
const toast = useToast()

// SSE
const { connect, disconnect, addEventListener, removeEventListener, isConnected, error, eventListeners } = useSSE()

// Reactive data
const fileUpload = ref<InstanceType<typeof FileUpload> | null>(null)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const errorMessage = ref('')
const successMessage = ref('')

// Import progress state
const importProgress = reactive<ImportProgressState>({
  isImporting: false,
  currentPhase: null,
  progress: 0,
  message: '',
  inserted: 0,
  total: 0,
  errors: [],
  isCompleted: false,
  isError: false,
  lastUpdateTime: null
})

// Additional tracking variables
const importStartTime = ref<number>(0)
const sseEventCount = ref<number>(0)
const sseConnectionAttempted = ref<boolean>(false)

// Methods
const resetImportProgress = () => {
  importProgress.isImporting = false
  importProgress.currentPhase = null
  importProgress.progress = 0
  importProgress.message = ''
  importProgress.inserted = 0
  importProgress.total = 0
  importProgress.errors = []
  importProgress.isCompleted = false
  importProgress.isError = false
  importProgress.lastUpdateTime = null
  importStartTime.value = 0
  sseEventCount.value = 0
  // Don't reset sseConnectionAttempted - keep SSE connection
}

const resetAll = () => {
  resetImportProgress()
  sseConnectionAttempted.value = false
}


const formatTime = (timeString: string | null) => {
  if (!timeString) return 'Chưa có'
  try {
    const date = new Date(timeString)
    return date.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  } catch (error) {
    return timeString
  }
}

const handleSSEEvent = (event: MessageEvent) => {
  try {
    sseEventCount.value++
    console.log(`=== SSE EVENT #${sseEventCount.value} RECEIVED IN IMPORT DIALOG ===`)
    console.log('Raw SSE Event:', event)
    console.log('SSE Event data:', event.data)
    console.log('SSE Event data type:', typeof event.data)
    console.log('SSE Event data stringified:', JSON.stringify(event.data))
    
    // Check if event.data is already an object or needs parsing
    let data
    if (typeof event.data === 'string') {
      console.log('Event data is string, parsing JSON...')
      data = JSON.parse(event.data)
    } else {
      console.log('Event data is already an object, using directly...')
      data = event.data
    }
    
    console.log('Final parsed data:', data)
    console.log('Data type:', typeof data)
    console.log('Data keys:', Object.keys(data))
    
    // Check if this is an import appointment slot event
    console.log('Checking event type:', data.event)
    console.log('Data structure check:', {
      hasEvent: 'event' in data,
      hasData: 'data' in data,
      hasAt: 'at' in data
    })
    
    if (data.event === 'IMPORT_APPOINTMENT_SLOT') {
      console.log('✅ MATCHED IMPORT_APPOINTMENT_SLOT EVENT')
      const progressData: ImportProgressData = data.data
      console.log('Import progress data:', progressData)
      console.log('Progress data details:', {
        success: progressData.success,
        phase: progressData.phase,
        message: progressData.message,
        inserted: progressData.inserted,
        total: progressData.total
      })
      
      // Update all fields
      importProgress.message = progressData.message
      importProgress.currentPhase = progressData.phase as ImportPhase
      importProgress.lastUpdateTime = data.at || new Date().toISOString()
      
      // Set isImporting to true when we receive any SSE event
      if (!importProgress.isImporting) {
        importProgress.isImporting = true
      }
      
      // Update progress data from server
      if (progressData.inserted !== undefined) {
        importProgress.inserted = progressData.inserted
      }
      if (progressData.total !== undefined) {
        importProgress.total = progressData.total
      }
      
      console.log('Updated importProgress:', {
        message: importProgress.message,
        phase: importProgress.currentPhase,
        inserted: importProgress.inserted,
        total: importProgress.total,
        lastUpdateTime: importProgress.lastUpdateTime,
        isImporting: importProgress.isImporting,
        progress: importProgress.progress
      })
      
      // Handle different phases
      console.log('=== HANDLING PHASE ===')
      console.log('Current phase:', progressData.phase)
      console.log('Phase type:', typeof progressData.phase)
      
      switch (progressData.phase) {
        case 'PARSING_EXCEL':
          console.log('📄 Handling PARSING_EXCEL phase')
          importProgress.progress = 10
          break
        case 'INSERTING_SLOTS':
          console.log('💾 Handling INSERTING_SLOTS phase')
          console.log('Inserted:', progressData.inserted, 'Total:', progressData.total)
          if (progressData.inserted !== undefined && progressData.total !== undefined && progressData.total > 0) {
            // Calculate progress based on actual inserted/total ratio
            const insertionProgress = (progressData.inserted / progressData.total) * 80 // 80% for insertion phase
            importProgress.progress = Math.min(90, 10 + insertionProgress)
            console.log('Calculated progress:', importProgress.progress)
          }
          break
        case 'INSERTED_SLOTS':
          console.log('✅ Handling INSERTED_SLOTS phase - COMPLETED!')
          importProgress.progress = 100
          importProgress.isCompleted = true
          importProgress.isImporting = false
          uploading.value = false
          
          // Keep the final message and data from server
          importProgress.message = progressData.message
          if (progressData.inserted !== undefined) {
            importProgress.inserted = progressData.inserted
          }
          if (progressData.total !== undefined) {
            importProgress.total = progressData.total
          }
          
          console.log('Final import progress state:', {
            progress: importProgress.progress,
            isCompleted: importProgress.isCompleted,
            isImporting: importProgress.isImporting,
            message: importProgress.message,
            inserted: importProgress.inserted,
            total: importProgress.total
          })
          
          toast.add({
            severity: 'success',
            summary: 'Thành công',
            detail: progressData.message,
            life: 5000
          })
          
          emit('import-success')
          
          // Dialog will remain open for user to see results
          break
        default:
          console.log('❓ Unknown phase:', progressData.phase)
          break
      }
      
      // Handle errors
      if (!progressData.success && progressData.row) {
        console.log('❌ Handling error for row:', progressData.row)
        importProgress.errors.push({
          row: progressData.row,
          message: progressData.message
        })
      }
    } else {
      console.log('❌ Event type does not match IMPORT_APPOINTMENT_SLOT')
      console.log('Expected: IMPORT_APPOINTMENT_SLOT')
      console.log('Received:', data.event)
      console.log('Full data structure:', data)
    }
  } catch (error: any) {
    console.error('❌ Error parsing SSE event:', error)
    console.error('Error details:', {
      message: error?.message,
      stack: error?.stack,
      eventData: event.data
    })
  }
}

const startSSEConnection = () => {
  // Prevent multiple connection attempts
  if (sseConnectionAttempted.value) {
    console.log('SSE connection already attempted, skipping...')
    return
  }
  
  const token = localStorage.getItem('accessToken')
  if (!token) {
    console.error('No auth token available for SSE connection')
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: 'Không có token xác thực để kết nối SSE',
      life: 3000
    })
    return
  }
  
  sseConnectionAttempted.value = true
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.168.7.221:3808/admin';
  const sseUrl = `${apiBaseUrl}/sse/me`
  console.log('=== STARTING SSE CONNECTION ===')
  console.log('SSE URL:', sseUrl)
  console.log('Using token:', token.substring(0, 20) + '...')
  console.log('VITE_API_BASE_URL:', import.meta.env.VITE_API_BASE_URL)
  
  // Add event listener first, then connect
  addEventListener('message', handleSSEEvent)
  console.log('SSE event listener added')
  
  connect(sseUrl, token)
  console.log('=== SSE CONNECTION STARTED ===')
  
  // Check connection status after a delay
  setTimeout(() => {
    console.log('🔍 Checking SSE connection status after 2 seconds...')
    console.log('isConnected:', isConnected.value)
    console.log('error:', error.value)
    
    if (isConnected.value) {
      toast.add({
        severity: 'success',
        summary: 'SSE Connected',
        detail: 'Kết nối real-time thành công. Sẵn sàng nhận cập nhật import.',
        life: 3000
      })
    } else if (error.value) {
      toast.add({
        severity: 'error',
        summary: 'SSE Connection Failed',
        detail: `Lỗi kết nối: ${error.value}`,
        life: 5000
      })
    }
  }, 2000)
}

const stopSSEConnection = () => {
  removeEventListener('message', handleSSEEvent)
  disconnect()
}

const retrySSEConnection = () => {
  console.log('🔄 Retrying SSE connection...')
  sseConnectionAttempted.value = false // Reset flag to allow retry
  stopSSEConnection() // Disconnect first
  setTimeout(() => {
    startSSEConnection() // Start new connection
  }, 500)
}

const testSSEConnection = () => {
  console.log('=== TESTING SSE CONNECTION ===')
  const token = localStorage.getItem('accessToken')
  if (!token) {
    console.error('No auth token available')
    return
  }
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.168.7.221:3808/admin';
  
  const sseUrl = `${apiBaseUrl}/sse/me`
  console.log('Testing SSE connection to:', sseUrl)
  
  // Test with a simple fetch first
  fetch(sseUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  }).then(response => {
    console.log('Test SSE response:', response)
    console.log('Test SSE response status:', response.status)
    console.log('Test SSE response headers:', response.headers)
  }).catch(error => {
    console.error('Test SSE error:', error)
  })
}

const testImportSSE = async () => {
  console.log('=== TESTING IMPORT SSE EVENTS ===')
  const token = localStorage.getItem('accessToken')
  if (!token) {
    console.error('No auth token available')
    return
  }
  
  try {
    // Check if SSE is already connected
    if (!isConnected.value) {
      console.log('SSE not connected, starting connection...')
      startSSEConnection()
      // Wait a bit for connection to establish
      await new Promise(resolve => setTimeout(resolve, 1000))
    } else {
      console.log('SSE already connected, proceeding with test...')
    }
    
    // Call test endpoint
    const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/sse/test-import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('Test import SSE response:', result)
      toast.add({
        severity: 'info',
        summary: 'Test SSE',
        detail: 'Đã gửi test import SSE events. Kiểm tra console và UI.',
        life: 3000
      })
    } else {
      console.error('Test import SSE failed:', response.status, response.statusText)
    }
  } catch (error) {
    console.error('Test import SSE error:', error)
  }
}

const onFileSelect = (event: any) => {
  console.log('File selected:', event)
  const file = event.files[0]
  if (file) {
    console.log('Selected file:', file.name, file.type, file.size)
    
    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ]
    
    if (!allowedTypes.includes(file.type)) {
      errorMessage.value = 'Chỉ chấp nhận file Excel (.xlsx, .xls)'
      return
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      errorMessage.value = 'Kích thước file không được vượt quá 10MB'
      return
    }

    selectedFile.value = file
    errorMessage.value = ''
    successMessage.value = ''
    console.log('File validated successfully')
  }
}

const onFileUpload = async () => {
  console.log('=== ON FILE UPLOAD CALLED ===')
  if (!selectedFile.value) {
    console.log('No file selected, returning')
    return
  }

  console.log('Starting upload process...')
  console.log('Selected file:', {
    name: selectedFile.value.name,
    size: selectedFile.value.size,
    type: selectedFile.value.type
  })
  
  uploading.value = true
  uploadProgress.value = 0
  errorMessage.value = ''
  successMessage.value = ''
  
  // Start import progress tracking
  importProgress.isImporting = true
  importProgress.message = 'Đang khởi tạo import...'
  importProgress.progress = 5
  importStartTime.value = Date.now()
  
  console.log('Initial importProgress state:', {
    isImporting: importProgress.isImporting,
    message: importProgress.message,
    progress: importProgress.progress
  })

  try {
    // Check SSE connection status (should already be connected from dialog open)
    console.log('🔍 SSE Connection Status Check:')
    console.log('- isConnected:', isConnected.value)
    console.log('- error:', error.value)
    console.log('- eventListeners count:', eventListeners.value.size)
    
    if (!isConnected.value) {
      console.warn('⚠️ SSE not connected, but continuing with API call...')
      console.log('Note: SSE connection should have been established when dialog opened')
    } else {
      console.log('✅ SSE already connected, ready for real-time updates')
    }
    
    // Create FormData
    const formData = new FormData()
    formData.append('file', selectedFile.value)
    console.log('📦 FormData created, calling API...')

    // Call API (this will trigger SSE events)
    console.log('🚀 Calling appointmentSlotsStore.importAppointmentSlot...')
    const result = await appointmentSlotsStore.importAppointmentSlot(formData)
    console.log('✅ API call successful:', result)
    
    // If SSE didn't handle the completion, handle it here
    console.log('🔍 Checking if SSE handled completion...')
    console.log('importProgress.isCompleted:', importProgress.isCompleted)
    console.log('importProgress.isImporting:', importProgress.isImporting)
    console.log('Total SSE events received:', sseEventCount.value)
    console.log('SSE connection status:', isConnected.value)
    
    if (!importProgress.isCompleted) {
      console.log('⚠️ SSE did not handle completion, handling manually...')
      importProgress.progress = 100
      importProgress.isCompleted = true
      importProgress.isImporting = false
      uploading.value = false
      
      // Keep final message from API result
      importProgress.message = result.message || 'Import thành công!'
      successMessage.value = result.message || 'Import thành công!'
      
      console.log('📝 Final fallback state:', {
        progress: importProgress.progress,
        isCompleted: importProgress.isCompleted,
        isImporting: importProgress.isImporting,
        message: importProgress.message
      })
      
      toast.add({
        severity: 'success',
        summary: 'Thành công',
        detail: 'Import lịch khám thành công',
        life: 5000
      })

      // Emit success event
      emit('import-success')
      
      // Dialog will remain open for user to see results
    } else {
      console.log('✅ SSE already handled completion')
    }

  } catch (error: any) {
    console.error('❌ Upload error:', error)
    console.error('Error details:', {
      message: error.message,
      response: error.response,
      status: error.response?.status,
      data: error.response?.data
    })
    
    uploadProgress.value = 0
    importProgress.isImporting = false
    importProgress.isError = true
    
    const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi import'
    errorMessage.value = errorMsg
    importProgress.message = errorMsg
    
    console.log('📝 Error state set:', {
      errorMessage: errorMessage.value,
      importProgressMessage: importProgress.message,
      isError: importProgress.isError
    })
    
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: errorMsg,
      life: 5000
    })
  } finally {
    uploading.value = false
    stopSSEConnection()
    console.log('🏁 Upload process finished')
    console.log('Final state:', {
      uploading: uploading.value,
      isImporting: importProgress.isImporting,
      isCompleted: importProgress.isCompleted,
      isError: importProgress.isError,
      progress: importProgress.progress
    })
  }
}

const onUploadError = (error: any) => {
  console.error('Upload error:', error)
  errorMessage.value = 'Có lỗi xảy ra khi upload file'
  uploading.value = false
  uploadProgress.value = 0
}

const onFileClear = () => {
  selectedFile.value = null
  errorMessage.value = ''
  successMessage.value = ''
}

const clearFile = () => {
  if (fileUpload.value && 'clear' in fileUpload.value) {
    (fileUpload.value as any).clear()
  }
  selectedFile.value = null
  errorMessage.value = ''
  successMessage.value = ''
}

const handleImport = () => {
  console.log('Import button clicked')
  console.log('Selected file:', selectedFile.value)
  if (selectedFile.value) {
    console.log('Starting upload...')
    // Reset import progress for new import
    resetImportProgress()
    onFileUpload()
  } else {
    console.log('No file selected')
    errorMessage.value = 'Vui lòng chọn file Excel trước khi import'
  }
}

const closeDialog = () => {
  // If currently importing, show confirmation dialog
  if (uploading.value || importProgress.isImporting) {
    if (confirm('Import đang được thực hiện. Bạn có chắc chắn muốn đóng dialog? Quá trình import sẽ tiếp tục chạy ở background.')) {
      // Allow closing but keep import running in background
      clearFile()
      stopSSEConnection()
      
      // Show notification that import continues in background
      toast.add({
        severity: 'info',
        summary: 'Thông báo',
        detail: 'Import đang tiếp tục chạy ở background. Bạn có thể mở lại dialog để theo dõi tiến trình.',
        life: 5000
      })
      
      emit('update:visible', false)
    }
  } else {
    // Normal close when not importing - keep final results visible
    clearFile()
    // Don't reset import progress to keep final results visible
    stopSSEConnection()
    emit('update:visible', false)
  }
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const downloadTemplate = () => {
  // Create Excel template structure based on actual format
  const templateData = [
    ['slot_date', 'clinic_code', 'doctor_code', 'service_code', 'morning', 'afternoon', 'evening'],
    ['2024-01-15', 'PKTL', 'ttmp', 'KTL', 'x', 'x', 'x'],
    ['2024-01-15', 'PKTL', 'pnd', 'KTL', 'x', '', 'x'],
    ['2024-01-15', 'PKTL1', 'pvc4', 'KTL', '', 'x', 'x'],
    ['2024-01-15', 'PKTL2', 'tts1', 'KTL', 'x', 'x', ''],
    ['2024-01-16', 'PKTL', 'nttm2', 'KTL', 'x', 'x', 'x']
  ]

  // Convert to CSV format
  const csvContent = templateData.map(row => 
    row.map(cell => `"${cell}"`).join(',')
  ).join('\n')

  // Create and download file
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)
  link.setAttribute('href', url)
  link.setAttribute('download', 'template_lich_kham.csv')
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  toast.add({
    severity: 'info',
    summary: 'Thông báo',
    detail: 'Template đã được tải xuống',
    life: 3000
  })
}

// Watch for dialog visibility changes
watch(() => props.visible, (newVal) => {
  if (newVal) {
    // Dialog opened - start SSE connection immediately
    console.log('📱 Dialog opened - starting SSE connection...')
    startSSEConnection()
  } else {
    // Dialog closed
    if (uploading.value || importProgress.isImporting) {
      console.log('Dialog closed while importing - import continues in background')
      // Don't reset progress state, let import continue
      // Only clear file selection and stop SSE connection
      clearFile()
      stopSSEConnection()
    } else {
      // Normal reset when not importing
      clearFile()
      uploading.value = false
      uploadProgress.value = 0
      errorMessage.value = ''
      successMessage.value = ''
      // Don't reset import progress to keep final results visible
      stopSSEConnection()
      resetAll() // Reset everything including SSE connection flag
    }
  }
})

// Cleanup on unmount
onUnmounted(() => {
  stopSSEConnection()
})
</script>

<style scoped>
.p-fileupload-buttonbar {
  display: none;
}

.p-fileupload-content {
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 2rem;
  text-align: center;
  background-color: #f9fafb;
  transition: all 0.3s ease;
}

.p-fileupload-content:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
}

.p-fileupload-content.p-fileupload-highlight {
  border-color: #3b82f6;
  background-color: #eff6ff;
}
</style>
