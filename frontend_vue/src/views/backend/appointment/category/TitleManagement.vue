<template>
    <Toast />
    <ThemeSwitcher />
    <div class="content">
        <div class="card">
            <Toolbar>
                <template #start>
                    <Button label="Thêm" icon="pi pi-plus" class="mr-2" @click="() => showTitleDialog()" />
                    <Button label="Xóa" icon="pi pi-trash" severity="danger" class="mr-2" @click="() => deleteSelectedTitles()" />
                </template>
                <template #center>
                    <FileUpload mode="basic" accept="image/*" :maxFileSize="1000000" label="Import" customUpload chooseLabel="Import" class="mr-2" auto :chooseButtonProps="{ severity: 'secondary' }" />
                    <Button label="Export" icon="pi pi-upload" severity="secondary" />
                </template>
                <template #end>
                    <IconField>
                        <InputIcon>
                            <i class="pi pi-search" />
                        </InputIcon>
                        <InputText v-model="searchText" placeholder="Tìm kiếm..." />
                    </IconField>
                </template>
            </Toolbar>
            
            <DataTable
                ref="dt"
                v-model:selection="selectedTitles"
                :lazy="true"
                :value="titles"
                selectionMode="single"
                dataKey="id"
                :paginator="true"
                :rows="rows"
                :totalRecords="totalRecords"
                :loading="loading"
                :first="first"
                :rowsPerPageOptions="TABLE_CONFIG.rowsPerPageOptions"
                :currentPageReportTemplate="'Hiển thị {first} đến {last} của {totalRecords} bản ghi'"
                :paginatorTemplate="'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown'"
                @page="onPage"
                :sortField="sortField"
                :sortOrder="sortOrder"
                @sort="onSort"
            >
                <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                <Column field="titleCode" header="Mã chức danh" sortable></Column>
                <Column field="titleName" header="Tên chức danh" sortable></Column>
                <Column field="order" header="Thứ tự" sortable></Column>
                <Column field="isActive" header="Trạng thái" sortable>
                    <template #body="slotProps">
                        <Tag :value="slotProps.data.isActive ? 'Kích hoạt' : 'Ngừng'" :severity="getStatusLabel(slotProps.data.isActive)" />
                    </template>
                </Column>
                <Column :exportable="false" style="min-width: 10rem">
                    <template #body="slotProps">
                        <Button icon="pi pi-pencil" outlined rounded class="mr-2" @click="showTitleDialog(slotProps.data)" />
                        <Button icon="pi pi-trash" outlined rounded severity="danger" @click="deleteTitle(slotProps.data.id)" />
                    </template>
                </Column>
            </DataTable>
        </div>
    </div>

    <Dialog
        v-model:visible="titleDialog"
        :style="{ width: '400px', maxWidth: '98vw' }"
        header="Thông tin chức danh"
        :modal="true"
    >
        <form id="titleForm" @submit.prevent="saveTitle" class="p-fluid">
            <div class="grid gap-3">
                <div class="col-12 md:col-12">
                    <label for="titleCode" class="mb-2">Mã chức danh:</label>
                    <InputText
                        id="titleCode"
                        v-model.trim="titleForm.titleCode"
                        :invalid="submitted && !titleForm.titleCode"
                        placeholder="Nhập mã chức danh"
                        autofocus
                        required
                        class="w-full"
                    />
                    <small v-if="submitted && !titleForm.titleCode" class="p-error">Mã chức danh là bắt buộc.</small>
                </div>
                <div class="col-12 md:col-12">
                    <label for="titleName" class="mb-2">Tên chức danh:</label>
                    <InputText
                        id="titleName"
                        v-model.trim="titleForm.titleName"
                        :invalid="submitted && !titleForm.titleName"
                        placeholder="Nhập tên chức danh"
                        required
                        class="w-full"
                    />
                    <small v-if="submitted && !titleForm.titleName" class="p-error">Tên chức danh là bắt buộc.</small>
                </div>
                <div class="col-12 md:col-12">
                    <label for="order" class="mb-2">Thứ tự:</label>
                    <InputNumber
                        id="order"
                        v-model="titleForm.order"
                        :min="1"
                        required
                        inputClass="w-full"
                        class="w-full"
                    />
                </div>
                <div class="col-12 md:col-12">
                    <label for="isActive" class="mb-2">Trạng thái:</label>
                    <Select
                        id="isActive"
                        v-model="titleForm.isActive"
                        :options="statusOptions"
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Chọn trạng thái"
                        class="w-full"
                    >
                        <template #value="slotProps">
                            <Tag
                                v-if="slotProps.value !== undefined && slotProps.value !== null"
                                :value="slotProps.value ? 'Kích hoạt' : 'Ngừng'"
                                :severity="slotProps.value ? 'success' : 'danger'"
                                class="mr-2"
                            />
                            </template>

                            <!-- Hiển thị Tag cho từng option trong list -->
                            <template #option="slotProps">
                            <Tag
                                :value="slotProps.option.label"
                                :severity="slotProps.option.value ? 'success' : 'danger'"
                                class="mr-2"
                            />
                        </template>
                    </Select>
                </div>
            </div>
        </form>
        <template #footer>
            <Button label="Huỷ" icon="pi pi-times" text @click="hideDialog" />
            <Button label="Lưu" icon="pi pi-check" type="submit" form="titleForm" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteTitleDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span v-if="titleToDelete"
                >Bạn có chắc chắn muốn xóa <b>{{ titleToDelete.titleName }}</b
                >?</span
            >
        </div>
        <template #footer>
            <Button label="Không" icon="pi pi-times" text @click="deleteTitleDialog = false" />
            <Button label="Có" icon="pi pi-check" @click="confirmDeleteTitle" />
        </template>
    </Dialog>

    <Dialog v-model:visible="deleteTitlesDialog" :style="{ width: '450px' }" header="Xác nhận" :modal="true">
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle !text-3xl" />
            <span>Bạn có chắc chắn muốn xóa các danh xưng đã chọn?</span>
        </div>
        <template #footer>
            <Button label="Không" icon="pi pi-times" text @click="deleteTitlesDialog = false" />
            <Button label="Có" icon="pi pi-check" text @click="deleteSelectedTitles" />
        </template>
    </Dialog>

</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, reactive } from 'vue'
import { useTitleStore } from '@/stores/title.store'
import { storeToRefs } from 'pinia'
import Select from 'primevue/select'
import 'primeflex/primeflex.css'
import Toast from 'primevue/toast';
import { useToast } from 'primevue/usetoast';
import { TABLE_CONFIG } from '../../../../utils/table-config.util'

// Types
interface Title {
  id: string;
  titleCode: string;
  titleName: string;
  order: number;
  isActive: boolean;
}

interface TitleForm {
  id: string | null;
  titleCode: string;
  titleName: string;
  order: number;
  isActive: boolean;
}

interface StatusOption {
  label: string;
  value: boolean;
  severity: string;
}

interface PageEvent {
  page: number;
  rows: number;
}

// Sử dụng any cho SortEvent vì PrimeVue DataTableSortEvent phức tạp
type SortEvent = any;

const toast = useToast();

const titleStore = useTitleStore()
const { titles, loading, pagination } = storeToRefs(titleStore)
const selectedTitles = ref<Title[]>([])
const searchText = ref<string>('')

const sortField = ref<string>('')
const sortOrder = ref<number>(1)

const statusOptions: StatusOption[] = [
  { label: 'Kích hoạt', value: true, severity: 'success' },
  { label: 'Ngừng', value: false, severity: 'danger' }
];

const titleDialog = ref<boolean>(false)
const submitted = ref<boolean>(false)
const titleForm = reactive<TitleForm>({
  id: null,
  titleCode: '',
  titleName: '',
  order: 1,
  isActive: true
})

// Dialog states
const deleteTitleDialog = ref<boolean>(false)
const deleteTitlesDialog = ref<boolean>(false)
const titleToDelete = ref<Title | null>(null)

function showTitleDialog(title: Title | null = null) {
  if (title) {
    // Chế độ sửa
    titleForm.id = title.id
    titleForm.titleCode = title.titleCode
    titleForm.titleName = title.titleName
    titleForm.order = title.order
    titleForm.isActive = title.isActive
  } else {
    // Chế độ thêm mới
    titleForm.id = null
    titleForm.titleCode = ''
    titleForm.titleName = ''
    titleForm.order = 1
    titleForm.isActive = true
  }
  submitted.value = false
  titleDialog.value = true
}

function hideDialog() {
  titleDialog.value = false
}

async function saveTitle() {
    submitted.value = true
    if (!titleForm.titleCode || !titleForm.titleName) return

    try {
        if (titleForm.id) {
            await titleStore.updateTitle(titleForm.id, { 
                titleCode: titleForm.titleCode,
                titleName: titleForm.titleName,
                order: titleForm.order,
                isActive: titleForm.isActive
            })
        } else {
            await titleStore.createTitle({ 
                titleCode: titleForm.titleCode,
                titleName: titleForm.titleName,
                order: titleForm.order,
                isActive: titleForm.isActive
            })
        }
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã thêm/sửa thành công', life: 5000 });
        hideDialog()
    } catch (error: any) {
        toast.add({ 
            severity: 'error', 
            summary: 'Lỗi', 
            detail: error.response?.data?.message || 'Có lỗi xảy ra', 
            life: 5000 
        });
    }
}

async function deleteTitle(id: string) {
    titleToDelete.value = (titles.value as Title[]).find(t => t.id === id) || null
    deleteTitleDialog.value = true
}

async function confirmDeleteTitle() {
    if (!titleToDelete.value) return
    
    try {
        await titleStore.deleteTitle(titleToDelete.value.id)
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa thành công', life: 5000 });
        deleteTitleDialog.value = false
        titleToDelete.value = null
    } catch (error: any) {
        toast.add({ 
            severity: 'error', 
            summary: 'Lỗi', 
            detail: error.response?.data?.message || 'Có lỗi xảy ra', 
            life: 5000 
        });
    }
}

async function deleteSelectedTitles() {
    if (!selectedTitles.value || selectedTitles.value.length === 0) return
    
    try {
        for (const title of selectedTitles.value) {
            await titleStore.deleteTitle(title.id)
        }
        toast.add({ severity: 'success', summary: 'Thành công', detail: 'Đã xóa thành công', life: 5000 });
        deleteTitlesDialog.value = false
        selectedTitles.value = []
    } catch (error: any) {
        toast.add({ 
            severity: 'error', 
            summary: 'Lỗi', 
            detail: error.response?.data?.message || 'Có lỗi xảy ra', 
            life: 5000 
        });
    }
}

// computed để đảm bảo DataTable không bị truyền proxy
const rows = computed(() => Number(pagination.value.limit || 10))
const totalRecords = computed(() => Number(pagination.value.total || 0))
const first = computed(() => Number(((pagination.value.page - 1) * pagination.value.limit) || 0))

onMounted(() => {
    fetchData(1, rows.value, searchText.value, sortField.value, sortOrder.value)
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null
watch(searchText, (newVal) => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(() => {
        fetchData(1, rows.value, newVal, sortField.value, sortOrder.value)
    }, 400)
})

function fetchData(page: number, limit: number, search: string, sortField: string, sortOrder: number) {
    titleStore.fetchTitles({ page, limit, search, sortField, sortOrder })
}

function onPage(event: PageEvent) {
    fetchData(event.page + 1, event.rows, searchText.value, sortField.value, sortOrder.value)
}

function onSort(event: SortEvent) {
    sortField.value = event.sortField
    sortOrder.value = event.sortOrder
    fetchData(
        1,
        rows.value,
        searchText.value,
        sortField.value,
        sortOrder.value
    )
}

function getStatusLabel(isActive: boolean): string {
    return isActive ? 'success' : 'danger'
}
</script>
