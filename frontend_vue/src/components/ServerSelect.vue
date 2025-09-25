<script setup lang="ts">
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue'
import Popover from 'primevue/popover'
import DataTable, { DataTableSortEvent, DataTablePageEvent } from 'primevue/datatable'
import Column from 'primevue/column'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import IconField from 'primevue/iconfield'
import InputIcon from 'primevue/inputicon'

type Row = Record<string, any>

interface FetchParams {
  page: number
  limit: number
  search?: string
  sortField?: string
  sortOrder?: 1 | -1
  filters?: Record<string, any>
}

interface BackendPagination {
  total: number
  page: number
  limit: number
  pageCount: number
  hasNext: boolean
  hasPrev: boolean
}

interface FetchResult {
  data: Row[]
  pagination: BackendPagination
}

interface ColumnDef {
  field: string
  header: string
  width?: string
}

const props = defineProps<{
  modelValue: any | any[]
  multiple?: boolean
  placeholder?: string
  disabled?: boolean
  pageSize?: number
  overlayWidth?: string | number
  optionLabel?: string | ((row: Row) => string)
  optionValue?: string | ((row: Row) => any)
  dataKeyField?: string
  ensureSelectedVisible?: boolean
  columns: ColumnDef[]
  fetcher: (params: FetchParams) => Promise<FetchResult>
  resolveByValue?: (value: any | any[]) => Promise<Row | Row[] | null>
  showSearch?: boolean
  showClear?: boolean
  dropdownIcon?: string
}>()

// Field khóa duy nhất cho DataTable và logic getValue()
const resolvedDataKeyField = computed(() => {
  if (typeof props.optionValue === 'string') return props.optionValue
  return props.dataKeyField || 'id'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any | any[]): void
  (e: 'change', value: any | any[]): void
  (e: 'selected', rows: Row | Row[]): void
}>()

// Refs
const op = ref<InstanceType<typeof Popover> | null>(null)
const table = ref<InstanceType<typeof DataTable> | null>(null)

const loading = ref(false)
const items = ref<Row[]>([])
const totalRecords = ref(0)

const page = ref(1)
const limit = ref(props.pageSize ?? 20)
const search = ref('')
const sortField = ref<string | undefined>(undefined)
const sortOrder = ref<1 | -1 | undefined>(undefined)

// Selection state (single = object/null, multiple = array)
const selectedRows = ref<any>(props.multiple ? [] : null)
const selectedList = computed<Row[]>(() =>
  Array.isArray(selectedRows.value)
    ? selectedRows.value
    : (selectedRows.value ? [selectedRows.value] : [])
)

// Value <-> Label helpers
const getValue = (row: Row) => {
  if (!row) return row
  if (typeof props.optionValue === 'function') return (props.optionValue as any)(row)
  if (typeof props.optionValue === 'string') return row[props.optionValue]
  return row[resolvedDataKeyField.value]
}
const getLabel = (row: Row) => {
  if (!row) return ''
  if (typeof props.optionLabel === 'function') return (props.optionLabel as any)(row)
  if (typeof props.optionLabel === 'string') return row[props.optionLabel]
  return row.name ?? row.label ?? row.title ?? `${getValue(row)}`
}
const displayText = computed(() => {
  const rows = selectedList.value
  return rows.length ? rows.map(getLabel).join(', ') : ''
})

const showClearButton = computed(() => {
  return props.showClear && !props.disabled && (
    (props.multiple && selectedList.value.length > 0) ||
    (!props.multiple && selectedList.value.length > 0)
  )
})

// Responsive detection
const isMobile = ref(false)
const updateIsMobile = () => { isMobile.value = window.innerWidth < 640 }
onMounted(() => {
  updateIsMobile()
  window.addEventListener('resize', updateIsMobile)
})
onBeforeUnmount(() => window.removeEventListener('resize', updateIsMobile))

// Overlay & table sizing for responsive
const overlayStyle = computed(() => ({
  width: isMobile.value
    ? '96vw'
    : (typeof props.overlayWidth === 'number'
        ? props.overlayWidth + 'px'
        : (props.overlayWidth || '720px')),
  maxWidth: '98vw',
  maxHeight: isMobile.value ? '85vh' : '80vh'
}))
const dtScrollHeight = computed(() => (isMobile.value ? '55vh' : '380px'))
const tableMinWidth = computed(() => (isMobile.value ? '0' : '560px'))

// API loader
let currentAbort: AbortController | null = null
async function load() {
  loading.value = true
  try {
    if (currentAbort) currentAbort.abort()
    currentAbort = new AbortController()

    const res = await props.fetcher({
      page: page.value,
      limit: limit.value,
      search: search.value?.trim() || undefined,
      sortField: sortField.value,
      sortOrder: sortOrder.value
    })

    items.value = Array.isArray(res?.data) ? res.data : []
    const p = res?.pagination ?? { total: 0, page: 1, limit: 20 }
    totalRecords.value = p?.total ?? 0
    if (typeof p?.page === 'number') page.value = p.page
    if (typeof p?.limit === 'number') limit.value = p.limit

    pinSelectedToTop()
  } catch (err) {
    items.value = []
    totalRecords.value = 0
  } finally {
    loading.value = false
  }
}

// Debounce search
let searchTimer: any
function onSearchInput(val: string) {
  search.value = val
  clearTimeout(searchTimer)
  searchTimer = setTimeout(() => {
    page.value = 1
    load()
  }, 600)
}

function onSort(e: DataTableSortEvent) {
  // @ts-ignore
  sortField.value = (e.sortField as string) || undefined
  // @ts-ignore
  sortOrder.value = (e.sortOrder as 1 | -1) || undefined
  page.value = 1
  load()
}

function onPage(e: DataTablePageEvent) {
  const newPage = Math.floor(e.first / e.rows) + 1
  const newLimit = e.rows
  if (newPage !== page.value || newLimit !== limit.value) {
    page.value = newPage
    limit.value = newLimit
    load()
  }
}

// 🔹 Phương án A: ghim hàng đã chọn lên đầu trang hiện tại
function pinSelectedToTop() {
  if (!props.ensureSelectedVisible) return
  const sel = selectedList.value
  if (!sel.length) return

  const seen = new Set<any>()
  const pinned = sel.filter(r => {
    const k = getValue(r)
    if (k == null || seen.has(k)) return false
    seen.add(k)
    return true
  })

  // loại bỏ những hàng đã pin khỏi danh sách hiện tại, rồi ghép vào đầu
  const rest = items.value.filter(r => !seen.has(getValue(r)))
  items.value = [...pinned, ...rest]
}

function openPanel(evt: MouseEvent) {
  if (props.disabled) return
  op.value?.toggle(evt)
}
function closePanel() { op.value?.hide() }

function applySelection() {
  if (props.multiple) {
    const values = selectedList.value.map(getValue)
    emit('update:modelValue', values)
    emit('change', values)
    emit('selected', [...selectedList.value])
  } else {
    const row = selectedList.value[0] || null
    const value = row ? getValue(row) : null
    emit('update:modelValue', value)
    emit('change', value)
    if (row) emit('selected', row)
  }
  closePanel()
}

function clearSelection() {
  if (props.multiple) {
    selectedRows.value = []
    emit('update:modelValue', [])
    emit('change', [])
    emit('selected', [])
  } else {
    selectedRows.value = null
    emit('update:modelValue', null)
    emit('change', null)
  }
}

function onRowDblClick(e: { data: Row }) {
  if (props.multiple) return
  selectedRows.value = e.data
  applySelection()
}

// Sync selection when modelValue changes externally
async function syncFromValue() {
  const v = props.modelValue
  if (v == null || (Array.isArray(v) && v.length === 0)) {
    selectedRows.value = props.multiple ? [] : null
    return
  }
  const mapByValue = (rows: Row[], value: any) => rows.find((r) => getValue(r) === value)

  if (props.multiple && Array.isArray(v)) {
    const found: Row[] = []
    v.forEach((val) => {
      const r = mapByValue(items.value, val)
      if (r) found.push(r)
    })
    if (found.length === v.length) {
      selectedRows.value = found
      return
    }
  } else {
    const r = mapByValue(items.value, v)
    if (r) {
      selectedRows.value = r
      return
    }
  }

  if (props.resolveByValue) {
    const res = await props.resolveByValue(v)
    if (Array.isArray(res)) selectedRows.value = props.multiple ? res : (res[0] ?? null)
    else if (res) selectedRows.value = props.multiple ? [res] : res
  }
}

watch(() => props.modelValue, syncFromValue)

onMounted(async () => {
  await load()
  await syncFromValue()
  pinSelectedToTop()
})
</script>

<template>
  <div class="server-select w-full">
    <div
      class="ss-input d-flex align-items-center justify-content-between gap-2 form-control cursor-pointer"
      :class="{ 'opacity-60 pointer-events-none': disabled }"
      @click="openPanel($event)"
      tabindex="0"
    >
      <span class="text-truncate small" :class="{ 'text-body-secondary': !displayText }">
        {{ displayText || placeholder || 'Chọn...' }}
      </span>
      <div class="d-flex align-items-center gap-1">
        <i 
          v-if="showClearButton"
          class="pi pi-times clear-icon"
          @click.stop="clearSelection"
          title="Xóa lựa chọn"
        />
        <i :class="dropdownIcon || 'pi pi-chevron-down'" />
      </div>
    </div>

    <Popover
      ref="op"
      appendTo="body"
      :showCloseIcon="isMobile"
      :dismissable="true"
      class="server-select-panel shadow-lg rounded-3 border-0"
      :style="overlayStyle"
    >
      <!-- Header / Search -->
      <div class="ss-header d-flex align-items-center gap-2 px-3 py-2 border-bottom bg-body sticky-top">
        <IconField class="flex-grow-1">
          <InputIcon><i class="pi pi-search" /></InputIcon>
          <InputText
            class="w-100"
            placeholder="Tìm kiếm..."
            @input="onSearchInput(($event.target as HTMLInputElement).value)"
          />
        </IconField>
      </div>

      <!-- Table -->
      <div class="ss-table-wrap">
        <DataTable
          ref="table"
          :value="items"
          lazy
          paginator
          paginatorPosition="bottom"
          :rows="limit"
          :first="(page - 1) * limit"
          :totalRecords="totalRecords"
          :loading="loading"
          :sortField="sortField"
          :sortOrder="sortOrder"
          :selectionMode="multiple ? 'multiple' : 'single'"
          :dataKey="resolvedDataKeyField"
          v-model:selection="selectedRows"
          @sort="onSort"
          @page="onPage"
          @row-dblclick="onRowDblClick"
          scrollable
          :scrollHeight="dtScrollHeight"
          responsiveLayout="scroll"
          :showGridlines="false"
          :tableStyle="{ minWidth: tableMinWidth }"
          class="ss-table"
        >
          <Column v-if="multiple" selectionMode="multiple" headerStyle="width: 3rem"></Column>
          <Column
            v-for="col in columns"
            :key="col.field"
            :field="col.field"
            :header="col.header"
            :style="{ width: col.width }"
            sortable
          >
            <template #body="{ data }">
              <span class="text-truncate d-block">{{ data[col.field] }}</span>
            </template>
          </Column>

          <template #empty>
            <div class="text-center text-body-secondary py-4 small">Không có dữ liệu</div>
          </template>
        </DataTable>
      </div>

      <!-- Footer -->
      <div class="ss-footer d-flex justify-content-end gap-2 px-3 py-2 border-top bg-body sticky-bottom">
        <Button label="Đóng" icon="pi pi-times" severity="secondary" size="small" @click="closePanel" />
        <Button label="Chọn" icon="pi pi-check" size="small" :disabled="!selectedList.length" @click="applySelection" />
      </div>
    </Popover>
  </div>
</template>

<style scoped>
.server-select .ss-input { min-height: 38px; }

/* Cho panel co giãn, nội dung linh hoạt */
.server-select-panel { overflow: hidden; }
.ss-table-wrap { max-height: 100%; }

/* Giữ 1 dòng, có thể cuộn ngang khi hẹp */
.server-select .ss-table :deep(.p-datatable-tbody > tr > td) { white-space: nowrap; }

/* Clear button styling */
.clear-icon {
  font-size: 0.875rem;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.clear-icon:hover {
  color: #ef4444;
  background-color: #fef2f2;
}

.clear-icon:active {
  transform: scale(0.95);
}

/* Mobile tweaks */
@media (max-width: 640px) {
  .ss-header { padding: .5rem .75rem; }
  .ss-footer { padding: .5rem .75rem; }
}
</style>