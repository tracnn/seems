<template>
  <Toast />
  <div class="content">
    <!-- Main Content -->
    <div class="main-content">

        <!-- Connection Status Card -->
        <div class="status-card">
          <div class="card" :class="{
            'status-connected': isConnected,
            'status-error': !isConnected && error,
            'status-connecting': !isConnected && !error
          }">
            <div class="card-content">
              <div class="status-info">
                <div class="status-icon" :class="{
                  'icon-connected': isConnected,
                  'icon-error': !isConnected && error,
                  'icon-connecting': !isConnected && !error
                }">
                  <i :class="{
                    'pi pi-check-circle': isConnected,
                    'pi pi-times-circle': !isConnected && error,
                    'pi pi-clock': !isConnected && !error
                  }"></i>
                </div>
                <div class="status-details">
                  <h3 class="status-title">
                    {{ isConnected ? 'Kết nối Real-time' : (error ? 'Lỗi kết nối' : 'Đang kết nối...') }}
                  </h3>
                  <p class="status-message" :class="{
                    'text-success': isConnected,
                    'text-error': !isConnected && error,
                    'text-warning': !isConnected && !error
                  }">
                    {{ isConnected ? `Sẵn sàng nhận cập nhật (${sseEventCount} sự kiện)` : (error || 'Đang thiết lập kết nối...') }}
                  </p>
                </div>
              </div>
              <div class="status-actions">
                <Button 
                  v-if="!isConnected"
                  icon="pi pi-refresh" 
                  size="small" 
                  @click="retrySSEConnection"
                  v-tooltip.top="'Thử kết nối lại'"
                  class="p-button-outlined p-button-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- SSE Events Log -->
        <div v-if="isConnected && sseEvents.length > 0" class="sse-events-section">
          <div class="card sse-events-card">
            <div class="card-content">
              <div class="card-header compact-header">
                <div class="header-left">
                  <i class="pi pi-broadcast sse-events-icon-small"></i>
                  <span class="card-title-small">SSE Events Log</span>
                </div>
                <div class="header-actions">
                  <Button 
                    icon="pi pi-arrow-up" 
                    size="small" 
                    @click="scrollToTop"
                    v-tooltip.top="'Cuộn lên đầu'"
                    class="p-button-text p-button-sm compact-button"
                  />
                  <Button 
                    icon="pi pi-trash" 
                    size="small" 
                    @click="clearSSEEvents"
                    v-tooltip.top="'Xóa log'"
                    class="p-button-text p-button-sm compact-button"
                  />
                </div>
              </div>
              
              <!-- Global Progress Bar -->
              <div v-if="globalProgress.total > 0" class="global-progress-section">
                <div class="global-progress-info">
                  <span class="global-progress-text">
                    Import Progress: {{ globalProgress.inserted }} / {{ globalProgress.total }} slots
                  </span>
                  <span class="global-progress-percentage">
                    {{ Math.round((globalProgress.inserted / globalProgress.total) * 100) }}%
                  </span>
                </div>
                <div class="global-progress-bar">
                  <div 
                    class="global-progress-fill" 
                    :style="{ width: `${(globalProgress.inserted / globalProgress.total) * 100}%` }"
                  ></div>
                </div>
              </div>
              
              <!-- Debug Progress Info -->
              <div v-if="showDebugInfo" class="debug-progress">
                <strong>Debug Progress:</strong> 
                inserted={{ globalProgress.inserted }}, 
                total={{ globalProgress.total }}, 
                show={{ globalProgress.total > 0 }}
              </div>
              
              <!-- Events Tabs -->
              <div class="events-tabs">
                <div class="tab-buttons">
                  <button 
                    class="tab-button" 
                    :class="{ active: activeTab === 'all' }"
                    @click="activeTab = 'all'"
                  >
                    All ({{ sseEvents.length }})
                  </button>
                  <button 
                    class="tab-button" 
                    :class="{ active: activeTab === 'success' }"
                    @click="activeTab = 'success'"
                  >
                    Success ({{ successEvents.length }})
                  </button>
                  <button 
                    class="tab-button" 
                    :class="{ active: activeTab === 'error' }"
                    @click="activeTab = 'error'"
                  >
                    Error ({{ errorEvents.length }})
                  </button>
                </div>
              </div>
              
              <!-- Events List -->
              <div ref="sseEventsList" class="sse-events-list">
                <div 
                  v-for="(event, index) in filteredEvents" 
                  :key="sseEvents.length - index"
                  class="sse-event-item"
                  :class="{
                    'event-import': event.type === 'IMPORT_APPOINTMENT_SLOT',
                    'event-other': event.type !== 'IMPORT_APPOINTMENT_SLOT',
                    'event-success': event.data?.success === true,
                    'event-error': event.data?.success === false
                  }"
                >
                  <div class="event-header">
                    <div class="event-info">
                      <span class="event-type">{{ event.type }}</span>
                      <span class="event-status" :class="{
                        'status-success': event.data?.success === true,
                        'status-error': event.data?.success === false
                      }">
                        {{ event.data?.success === true ? 'SUCCESS' : event.data?.success === false ? 'ERROR' : 'UNKNOWN' }}
                      </span>
                    </div>
                    <span class="event-time">{{ formatEventTime(event.timestamp) }}</span>
                  </div>
                  
                  <div class="event-details">
                    <div v-if="event.data?.phase" class="event-phase">
                      <strong>Phase:</strong> {{ event.data.phase }}
                    </div>
                    <div v-if="event.data?.message" class="event-message">
                      <strong>Message:</strong> {{ event.data.message }}
                    </div>
                    
                    <!-- Error Details -->
                    <div v-if="event.data?.success === false && event.data?.errors" class="error-details">
                      <div class="error-section">
                        <strong>Chi tiết lỗi:</strong>
                        <div class="error-list">
                          <div v-for="(error, errorIndex) in event.data.errors" :key="errorIndex" class="error-item">
                            <div class="error-message">{{ error.message || error }}</div>
                            <div v-if="error.row" class="error-row">Dòng: {{ error.row }}</div>
                            <div v-if="error.column" class="error-column">Cột: {{ error.column }}</div>
                            <div v-if="error.value" class="error-value">Giá trị: {{ error.value }}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div class="event-raw-data">
                    <details>
                      <summary>Raw Data</summary>
                      <pre>{{ JSON.stringify(event.data, null, 2) }}</pre>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


        <!-- Main Content Grid -->
        <div class="content-grid">
            <!-- Instructions Card -->
            <div class="card instructions-card">
              <div class="card-content">
                <div class="card-header">
                  <div class="card-icon info-icon">
                    <i class="pi pi-info-circle"></i>
                  </div>
                  <h3 class="card-title">Hướng dẫn import</h3>
                </div>
                <div class="instructions-list">
                  <div class="instruction-item">
                    <i class="pi pi-check-circle text-success"></i>
                    <span>File Excel (.xlsx, .xls) - Kích thước tối đa 10MB</span>
                  </div>
                  <div class="instruction-item">
                    <i class="pi pi-check-circle text-success"></i>
                    <span>Định dạng ngày: YYYY-MM-DD</span>
                  </div>
                  <div class="instruction-item">
                    <i class="pi pi-check-circle text-success"></i>
                    <span>Buổi: "x" = có lịch, trống = không có</span>
                  </div>
                  <div class="instruction-item">
                    <i class="pi pi-check-circle text-success"></i>
                    <span>Cột: slot_date, clinic_code, doctor_code, service_code</span>
                  </div>
                  <div class="instruction-item">
                    <i class="pi pi-check-circle text-success"></i>
                    <span>Cột buổi: morning, afternoon, evening</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Upload Area Card -->
            <div class="card upload-card">
              <div class="card-content">
                <div class="card-header">
                  <div class="card-icon upload-icon">
                    <i class="pi pi-upload"></i>
                  </div>
                  <h3 class="card-title">Upload File Excel</h3>
                </div>
                
                <FileUpload
                  ref="fileUpload"
                  mode="basic"
                  accept=".xlsx,.xls"
                  :maxFileSize="10485760"
                  :auto="false"
                  :multiple="false"
                  chooseLabel="Chọn file Excel"
                  :disabled="uploading"
                  @select="onFileSelect"
                  @upload="onFileUpload"
                  @error="onUploadError"
                  @clear="onFileClear"
                  class="file-upload"
                />

                <!-- File Info -->
                <div v-if="selectedFile" class="file-info">
                  <div class="file-details">
                    <div class="file-icon">
                      <i class="pi pi-file-excel"></i>
                    </div>
                    <div class="file-meta">
                      <div class="file-name">{{ selectedFile.name }}</div>
                      <div class="file-size">{{ formatFileSize(selectedFile.size) }}</div>
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

                <!-- Import Button -->
                <div class="import-button-container">
                  <Button
                    label="Import Lịch Khám"
                    icon="pi pi-upload"
                    class="p-button-primary import-button"
                    size="large"
                    @click="handleImport"
                    :disabled="!selectedFile || uploading"
                    :loading="uploading"
                  />
                </div>
              </div>
            </div>

            <!-- Template Download Card -->
            <div class="card template-card">
              <div class="card-content">
                <div class="card-header">
                  <div class="card-icon template-icon">
                    <i class="pi pi-download"></i>
                  </div>
                  <h3 class="card-title">Template Mẫu</h3>
                </div>
                <p class="template-description">
                  Tải file template mẫu để đảm bảo cấu trúc dữ liệu đúng
                </p>
                <Button
                  label="Tải template"
                  icon="pi pi-download"
                  class="p-button-outlined template-button"
                  @click="downloadTemplate"
                  :disabled="uploading"
                />
              </div>
            </div>
          </div>
        </div>

        <!-- Debug Section -->
        <div v-if="showDebugInfo" class="debug-section">
          <div class="card debug-card">
            <div class="card-content">
              <div class="card-header">
                <div class="card-icon debug-icon">
                  <i class="pi pi-bug"></i>
                </div>
                <h3 class="card-title">Debug Information</h3>
              </div>
              <div class="debug-info">
                <div class="debug-item">
                  <strong>SSE:</strong> connected={{ isConnected }}, events={{ sseEventCount }}, error="{{ error }}"
                </div>
                <div class="debug-item">
                  <strong>Import:</strong> uploading={{ uploading }}
                </div>
                <div class="debug-item">
                  <strong>File:</strong> {{ selectedFile ? selectedFile.name : 'No file selected' }}
                </div>
              </div>
              <div class="debug-actions">
                <Button 
                  label="Test SSE" 
                  size="small" 
                  @click="testSSEConnection"
                  class="p-button-outlined"
                />
                <Button 
                  label="Test Import" 
                  size="small" 
                  @click="testImportSSE"
                  class="p-button-outlined"
                />
                <Button 
                  label="Test Progress" 
                  size="small" 
                  @click="testProgressBar"
                  class="p-button-outlined"
                />
                <Button 
                  label="Toggle Debug" 
                  size="small" 
                  @click="showDebugInfo = !showDebugInfo"
                  class="p-button-outlined"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAppointmentSlotsStore } from '@/stores/appointment-slots.store'
import { useToast } from 'primevue/usetoast'
import FileUpload from 'primevue/fileupload'
import { useSSE } from '@/composables/useSSE'
import { type ImportProgressData } from '@/types/import-progress'
import dayjs from 'dayjs'

// Stores
const appointmentSlotsStore = useAppointmentSlotsStore()
const toast = useToast()

// SSE
const { connect, disconnect, addEventListener, removeEventListener, isConnected, error } = useSSE()

// Reactive data
const fileUpload = ref<InstanceType<typeof FileUpload> | null>(null)
const selectedFile = ref<File | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)
const showDebugInfo = ref(false)
const sseEventsList = ref<HTMLElement | null>(null)

// Additional tracking variables
const sseEventCount = ref<number>(0)
const sseConnectionAttempted = ref<boolean>(false)
const sseEvents = ref<Array<{
  type: string
  data: any
  timestamp: string
}>>([])
const activeTab = ref<'all' | 'success' | 'error'>('all')
const globalProgress = ref({
  inserted: 0,
  total: 0
})

// Computed properties
const successEvents = computed(() => {
  return sseEvents.value.filter(event => event.data?.success === true)
})

const errorEvents = computed(() => {
  return sseEvents.value.filter(event => event.data?.success === false)
})

const filteredEvents = computed(() => {
  const reversedEvents = sseEvents.value.slice().reverse()
  
  switch (activeTab.value) {
    case 'success':
      return reversedEvents.filter(event => event.data?.success === true)
    case 'error':
      return reversedEvents.filter(event => event.data?.success === false)
    default:
      return reversedEvents
  }
})

// Methods
const resetAll = () => {
  sseConnectionAttempted.value = false
}

const formatEventTime = (timestamp: string) => {
  try {
    return dayjs(timestamp).format('YYYY-MM-DD HH:mm:ss')
  } catch (error) {
    return timestamp
  }
}

const clearSSEEvents = () => {
  sseEvents.value = []
  sseEventCount.value = 0
  globalProgress.value = { inserted: 0, total: 0 }
  activeTab.value = 'all'
}

const scrollToTop = () => {
  if (sseEventsList.value) {
    sseEventsList.value.scrollTop = 0
  }
}


const handleSSEEvent = (event: MessageEvent) => {
  try {
    sseEventCount.value++
    
    // Check if event.data is already an object or needs parsing
    let data
    if (typeof event.data === 'string') {
      data = JSON.parse(event.data)
    } else {
      data = event.data
    }
    
    console.log('🔍 SSE Event received:', data)
    
    // Store event for display - fix parsing logic
    const eventType = data.data?.event || data.event || 'UNKNOWN'
    const eventData = data.data?.data || data.data || data
    
    sseEvents.value.push({
      type: eventType,
      data: eventData,
      timestamp: new Date().toISOString()
    })
    
    // Keep all events - no limit
    
    // Check for progress data in multiple possible locations
    let progressFound = false
    
    // Check eventData directly (your case)
    if (eventData.inserted !== undefined && eventData.total !== undefined) {
      globalProgress.value = {
        inserted: eventData.inserted,
        total: eventData.total
      }
      console.log('📊 Updated global progress from eventData:', globalProgress.value)
      progressFound = true
    }
    
    // Check data directly (fallback)
    if (!progressFound && data.inserted !== undefined && data.total !== undefined) {
      globalProgress.value = {
        inserted: data.inserted,
        total: data.total
      }
      console.log('📊 Updated global progress from data:', globalProgress.value)
      progressFound = true
    }
    
    if (data.event === 'IMPORT_APPOINTMENT_SLOT') {
      const progressData: ImportProgressData = data.data
      
      console.log('📊 Processing IMPORT_APPOINTMENT_SLOT event:', progressData)
      
      // Update global progress - check for any progress data
      if (progressData.inserted !== undefined && progressData.total !== undefined) {
        globalProgress.value = {
          inserted: progressData.inserted,
          total: progressData.total
        }
        console.log('📊 Updated global progress from progressData:', globalProgress.value)
      } else {
        console.log('📊 No progress data found in progressData:', {
          inserted: progressData.inserted,
          total: progressData.total,
          phase: progressData.phase
        })
      }
      
      // Handle completion
      if (progressData.phase === 'INSERTED_SLOTS') {
        uploading.value = false
        
        toast.add({
          severity: 'success',
          summary: 'Thành công',
          detail: progressData.message,
          life: 5000
        })
      }
      
      // Handle errors
      if (!progressData.success) {
        toast.add({
          severity: 'error',
          summary: 'Lỗi',
          detail: progressData.message,
          life: 5000
        })
      }
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
  
  // Add event listener first, then connect
  addEventListener('message', handleSSEEvent)
  
  connect(sseUrl, token)
  
  // Check connection status after a delay
  setTimeout(() => {
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
  sseConnectionAttempted.value = false // Reset flag to allow retry
  stopSSEConnection() // Disconnect first
  setTimeout(() => {
    startSSEConnection() // Start new connection
  }, 500)
}

const testSSEConnection = () => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    console.error('No auth token available')
    return
  }
  
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.168.7.221:3808/admin';
  const sseUrl = `${apiBaseUrl}/sse/me`
  
  // Test with a simple fetch first
  fetch(sseUrl, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Accept': 'text/event-stream',
      'Cache-Control': 'no-cache'
    }
  }).then(response => {
    console.log('Test SSE response status:', response.status)
  }).catch(error => {
    console.error('Test SSE error:', error)
  })
}

const testImportSSE = async () => {
  const token = localStorage.getItem('accessToken')
  if (!token) {
    console.error('No auth token available')
    return
  }
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://192.168.7.221:3808/admin';
  try {
    // Check if SSE is already connected
    if (!isConnected.value) {
      startSSEConnection()
      // Wait a bit for connection to establish
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    // Call test endpoint
    const response = await fetch(`${apiBaseUrl}/sse/test-import`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (response.ok) {
      await response.json()
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

const testProgressBar = () => {
  // Simulate progress data like your example
  globalProgress.value = {
    inserted: 52500,
    total: 52574
  }
  
  // Add a test event
  sseEvents.value.push({
    type: 'IMPORT_APPOINTMENT_SLOT',
    data: {
      success: true,
      phase: 'INSERTING_SLOTS',
      inserted: 52500,
      total: 52574,
      message: 'Test progress: Đã insert 52500 slot. Bỏ qua 0 slot vì đã tồn tại.'
    },
    timestamp: new Date().toISOString()
  })
  
  toast.add({
    severity: 'info',
    summary: 'Test Progress',
    detail: 'Đã set test progress: 52500/52574 slots',
    life: 3000
  })
}

const onFileSelect = (event: any) => {
  const file = event.files[0]
  if (file) {
    
    // Validate file type
    const allowedTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel' // .xls
    ]
    
    if (!allowedTypes.includes(file.type)) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Chỉ chấp nhận file Excel (.xlsx, .xls)',
        life: 3000
      })
      return
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      toast.add({
        severity: 'error',
        summary: 'Lỗi',
        detail: 'Kích thước file không được vượt quá 10MB',
        life: 3000
      })
      return
    }

    selectedFile.value = file
  }
}

const onFileUpload = async () => {
  if (!selectedFile.value) {
    return
  }
  
  uploading.value = true
  uploadProgress.value = 0

  try {
    // Check SSE connection status (should already be connected from page load)
    if (!isConnected.value) {
      console.warn('SSE not connected, but continuing with API call...')
    }
    
    // Create FormData
    const formData = new FormData()
    formData.append('file', selectedFile.value)

    // Call API (this will trigger SSE events)
    const result = await appointmentSlotsStore.importAppointmentSlot(formData)
    
    // Handle success if SSE didn't handle it
    toast.add({
      severity: 'success',
      summary: 'Thành công',
      detail: result.message || 'Import lịch khám thành công',
      life: 5000
    })

  } catch (error: any) {
    console.error('Upload error:', error)
    
    uploadProgress.value = 0
    
    const errorMsg = error.response?.data?.message || error.message || 'Có lỗi xảy ra khi import'
    
    toast.add({
      severity: 'error',
      summary: 'Lỗi',
      detail: errorMsg,
      life: 5000
    })
  } finally {
    uploading.value = false
  }
}

const onUploadError = (error: any) => {
  console.error('Upload error:', error)
  toast.add({
    severity: 'error',
    summary: 'Lỗi',
    detail: 'Có lỗi xảy ra khi upload file',
    life: 3000
  })
  uploading.value = false
  uploadProgress.value = 0
}

const onFileClear = () => {
  selectedFile.value = null
}

const clearFile = () => {
  if (fileUpload.value && 'clear' in fileUpload.value) {
    (fileUpload.value as any).clear()
  }
  selectedFile.value = null
}

const handleImport = () => {
  if (selectedFile.value) {
    // Check SSE connection before starting import
    if (!isConnected.value) {
      console.warn('SSE not connected, attempting to reconnect...')
      sseConnectionAttempted.value = false
      startSSEConnection()
      // Wait a bit for connection to establish
      setTimeout(() => {
        onFileUpload()
      }, 1000)
    } else {
      onFileUpload()
    }
  } else {
    toast.add({
      severity: 'warn',
      summary: 'Cảnh báo',
      detail: 'Vui lòng chọn file Excel trước khi import',
      life: 3000
    })
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
  
  // Clean up the URL object
  URL.revokeObjectURL(url)

  toast.add({
    severity: 'info',
    summary: 'Thông báo',
    detail: 'Template đã được tải xuống',
    life: 3000
  })
}

// Lifecycle
onMounted(() => {
  startSSEConnection()
})

onUnmounted(() => {
  stopSSEConnection()
  resetAll()
})
</script>

<style scoped>
/* Page Layout */

/* Removed header styles since we removed the header */

/* Main content uses standard layout */

/* Content Grid */
.content-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (min-width: 1024px) {
  .content-grid {
    grid-template-columns: 1fr 1fr 1fr;
  }
}

.debug-section {
  margin-top: 1.5rem;
}

/* Card Components */
.card {
  background: white;
  border-radius: 0.75rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  transform: translateY(-1px);
}

.card-content {
  padding: 1.5rem;
}

.card-header {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.card-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  font-size: 1.25rem;
}

.card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

/* Status Card */
.status-card {
  margin-bottom: 1.5rem;
}

/* SSE Events Section */
.sse-events-section {
  margin-bottom: 1.5rem;
}

.sse-events-card {
  border-color: #8b5cf6;
}

.sse-events-icon {
  background-color: #ede9fe;
  color: #7c3aed;
}

.card-actions {
  margin-left: auto;
}

/* Compact Header Styles */
.compact-header {
  padding: 0.25rem 0 !important;
  margin-bottom: 0.5rem !important;
  min-height: auto !important;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 0.375rem;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.sse-events-icon-small {
  font-size: 0.875rem;
  color: #7c3aed;
}

.card-title-small {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
}

.compact-button {
  padding: 0.125rem !important;
  min-width: auto !important;
  height: 1.5rem !important;
  width: 1.5rem !important;
}

.sse-events-list {
  max-height: 30rem;
  overflow-y: auto;
  background-color: #f9fafb;
  border-radius: 0.5rem;
  padding: 0.75rem;
  border: 1px solid #e5e7eb;
}

.sse-events-list::-webkit-scrollbar {
  width: 6px;
}

.sse-events-list::-webkit-scrollbar-track {
  background: #f1f5f9;
  border-radius: 3px;
}

.sse-events-list::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.sse-events-list::-webkit-scrollbar-thumb:hover {
  background: #94a3b8;
}

.sse-event-item {
  margin-bottom: 0.5rem;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #e5e7eb;
  background-color: white;
}

.sse-event-item:last-child {
  margin-bottom: 0;
}

.event-import {
  border-left: 4px solid #10b981;
  background-color: #f0fdf4;
}

.event-other {
  border-left: 4px solid #6b7280;
}

.event-success {
  border-left-color: #10b981 !important;
  background-color: #f0fdf4 !important;
}

.event-error {
  border-left-color: #ef4444 !important;
  background-color: #fef2f2 !important;
}

.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.event-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-type {
  font-weight: 600;
  font-size: 0.875rem;
  color: #374151;
}

.event-status {
  padding: 0.125rem 0.375rem;
  border-radius: 0.25rem;
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: uppercase;
}

.status-success {
  background-color: #dcfce7;
  color: #166534;
}

.status-error {
  background-color: #fee2e2;
  color: #991b1b;
}

.event-time {
  font-size: 0.75rem;
  color: #6b7280;
  font-family: monospace;
}

.event-details {
  margin-bottom: 0.5rem;
}

.event-phase,
.event-message {
  margin-bottom: 0.25rem;
  font-size: 0.8rem;
  color: #374151;
}

.event-phase strong,
.event-message strong {
  color: #1f2937;
  margin-right: 0.5rem;
}

.event-raw-data {
  border-top: 1px solid #e5e7eb;
  padding-top: 0.5rem;
}

.event-raw-data details {
  font-size: 0.75rem;
}

.event-raw-data summary {
  cursor: pointer;
  color: #6b7280;
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.event-raw-data summary:hover {
  color: #374151;
}

.event-data {
  background-color: #f3f4f6;
  border-radius: 0.25rem;
  padding: 0.5rem;
  font-size: 0.75rem;
  font-family: monospace;
  color: #374151;
  overflow-x: auto;
}

.event-data pre {
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
}


@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* Global Progress Bar Styles */
.global-progress-section {
  margin: 1rem 0;
  padding: 1rem;
  background-color: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 0.5rem;
}

.global-progress-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.global-progress-text {
  font-size: 1rem;
  font-weight: 600;
  color: #0c4a6e;
}

.global-progress-percentage {
  font-size: 1rem;
  font-weight: 700;
  color: #0369a1;
}

.global-progress-bar {
  width: 100%;
  height: 0.75rem;
  background-color: #e0f2fe;
  border-radius: 0.375rem;
  overflow: hidden;
  border: 1px solid #0ea5e9;
}

.global-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #0ea5e9 0%, #0284c7 100%);
  border-radius: 0.375rem;
  transition: width 0.5s ease;
  position: relative;
}

.global-progress-fill::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%);
  animation: shimmer 2s infinite;
}

/* Events Tabs Styles */
.events-tabs {
  margin: 1rem 0;
}

.tab-buttons {
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid #e5e7eb;
}

.tab-button {
  padding: 0.5rem 1rem;
  border: none;
  background: none;
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.2s ease;
}

.tab-button:hover {
  color: #374151;
  background-color: #f9fafb;
}

.tab-button.active {
  color: #2563eb;
  border-bottom-color: #2563eb;
  background-color: #eff6ff;
}

/* Error Details Styles */
.error-details {
  margin-top: 0.75rem;
  padding: 0.75rem;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 0.5rem;
}

.error-section strong {
  color: #dc2626;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
  display: block;
}

.error-list {
  margin-top: 0.5rem;
}

.error-item {
  padding: 0.5rem;
  margin-bottom: 0.5rem;
  background-color: white;
  border: 1px solid #fecaca;
  border-radius: 0.375rem;
  font-size: 0.8rem;
}

.error-item:last-child {
  margin-bottom: 0;
}

.error-message {
  font-weight: 600;
  color: #dc2626;
  margin-bottom: 0.25rem;
}

.error-row,
.error-column,
.error-value {
  color: #6b7280;
  margin-bottom: 0.125rem;
}

.error-row:last-child,
.error-column:last-child,
.error-value:last-child {
  margin-bottom: 0;
}

/* Debug Progress Styles */
.debug-progress {
  margin: 0.5rem 0;
  padding: 0.5rem;
  background-color: #fef3c7;
  border: 1px solid #f59e0b;
  border-radius: 0.375rem;
  font-size: 0.75rem;
  color: #92400e;
}

.status-connected {
  border-color: #10b981;
}

.status-error {
  border-color: #ef4444;
}

.status-connecting {
  border-color: #f59e0b;
}

.status-info {
  display: flex;
  align-items: center;
}

.status-icon {
  width: 3rem;
  height: 3rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  font-size: 1.25rem;
}

.icon-connected {
  background-color: #dcfce7;
  color: #16a34a;
}

.icon-error {
  background-color: #fee2e2;
  color: #dc2626;
}

.icon-connecting {
  background-color: #fef3c7;
  color: #d97706;
}

.status-details {
  flex: 1;
}

.status-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 0.25rem 0;
}

.status-message {
  font-size: 0.875rem;
  margin: 0;
}

.text-success {
  color: #16a34a;
}

.text-error {
  color: #dc2626;
}

.text-warning {
  color: #d97706;
}

.status-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Instructions Card */
.instructions-card {
  border-color: #3b82f6;
}

.info-icon {
  background-color: #dbeafe;
  color: #2563eb;
}

.instructions-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.instruction-item {
  display: flex;
  align-items: flex-start;
  font-size: 0.875rem;
  color: #374151;
}

.instruction-item i {
  margin-right: 0.5rem;
  margin-top: 0.125rem;
  color: #10b981;
}

/* Upload Card */
.upload-card {
  border-color: #10b981;
}

.upload-icon {
  background-color: #dcfce7;
  color: #16a34a;
}

.file-upload {
  width: 100%;
}

.file-info {
  margin-top: 1rem;
  padding: 1rem;
  background-color: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 0.5rem;
}

.file-details {
  display: flex;
  align-items: center;
}

.file-icon {
  width: 2.5rem;
  height: 2.5rem;
  background-color: #dcfce7;
  border-radius: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  color: #16a34a;
}

.file-meta {
  flex: 1;
}

.file-name {
  font-weight: 500;
  color: #1f2937;
}

.file-size {
  font-size: 0.875rem;
  color: #6b7280;
}

.import-button-container {
  margin-top: 1.5rem;
}

.import-button {
  width: 100%;
}

/* Template Card */
.template-card {
  border-color: #f59e0b;
}

.template-icon {
  background-color: #fef3c7;
  color: #d97706;
}

.template-description {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0 0 1rem 0;
}

.template-button {
  width: 100%;
}


/* Debug Card */
.debug-card {
  border-color: #f59e0b;
}

.debug-icon {
  background-color: #fef3c7;
  color: #d97706;
}

.debug-info {
  margin-bottom: 1rem;
}

.debug-item {
  font-size: 0.75rem;
  padding: 0.5rem;
  background-color: #f9fafb;
  border-radius: 0.25rem;
  margin-bottom: 0.5rem;
}

.debug-item:last-child {
  margin-bottom: 0;
}

.debug-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}


/* File Upload Styling */
.p-fileupload-buttonbar {
  display: none;
}

.p-fileupload-content {
  border: 2px dashed #d1d5db;
  border-radius: 0.75rem;
  padding: 3rem 2rem;
  text-align: center;
  background-color: #f9fafb;
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.p-fileupload-content:hover {
  border-color: #3b82f6;
  background-color: #eff6ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.p-fileupload-content.p-fileupload-highlight {
  border-color: #3b82f6;
  background-color: #eff6ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

/* Responsive Design */
@media (max-width: 768px) {
  .content-grid {
    grid-template-columns: 1fr;
  }
  
  .status-grid {
    grid-template-columns: 1fr;
  }
}
</style>
