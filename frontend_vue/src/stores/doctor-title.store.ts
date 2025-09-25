import { defineStore } from 'pinia';
import { doctorTitleService } from '@/api/doctor-title.service';
import { ApiResponse } from '@/types/api-response';

// Interfaces
interface DoctorTitle {
  id: string;
  doctorId: number;
  doctorCode: string;
  doctorName: string;
  titleId: number;
  titleCode: string;
  titleName: string;
  specialtyId: number;
  specialtyCode: string;
  specialtyName: string;
  serviceId: number | null;
  serviceCode: string | null;
  serviceName: string | null;
  isActive: number;
  createdAt: string;
  updatedAt: string;
  avartarUrl: string | null;
}

interface DoctorTitleParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface CreateDoctorTitleData {
  doctorId: number;
  doctorCode: string;
  doctorName: string;
  titleId: string;
  specialtyId: string;
  serviceId?: number | null;
  serviceCode?: string | null;
  serviceName?: string | null;
  avartarUrl?: string | null;
  isActive?: boolean;
}

interface UpdateDoctorTitleData {
  doctorId: number;
  doctorCode: string;
  doctorName: string;
  titleId: string;
  specialtyId: string;
  serviceId?: number | null;
  serviceCode?: string | null;
  serviceName?: string | null;
  avartarUrl?: string | null;
  isActive?: boolean;
}

interface DoctorTitleState {
  doctorTitles: DoctorTitle[];
  doctorTitlesForSelect: DoctorTitle[];
  doctorTitlesForSelectBySpecialty: DoctorTitle[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  };
}

export const useDoctorTitleStore = defineStore('doctorTitle', {
  state: (): DoctorTitleState => ({
    doctorTitles: [],
    doctorTitlesForSelect: [],
    doctorTitlesForSelectBySpecialty: [],
    loading: false,
    error: null,
    pagination: { total: 0, page: 1, limit: 10, pageCount: 1 },
  }),
  actions: {
    async fetchDoctorTitles(params: DoctorTitleParams = {}) {
      this.loading = true;
      this.error = null;

      try {
        const res: ApiResponse<DoctorTitle> = await doctorTitleService.getDoctorTitles(params);
        this.doctorTitles = res.data;
        this.pagination = {
          total: res.pagination.total,
          page: res.pagination.page,
          limit: res.pagination.limit,
          pageCount: res.pagination.pageCount,
        };
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi lấy danh sách học hàm';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async createDoctorTitle(data: CreateDoctorTitleData): Promise<{ data: DoctorTitle }> {
      this.loading = true;
      this.error = null;
      try {
        const res = await doctorTitleService.createDoctorTitle(data);
        await this.fetchDoctorTitles({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi tạo học hàm';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async updateDoctorTitle(id: string, data: UpdateDoctorTitleData): Promise<{ data: DoctorTitle }> {
      this.loading = true;
      this.error = null;
      try {
        const res = await doctorTitleService.updateDoctorTitle(id, data);
        await this.fetchDoctorTitles({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi cập nhật học hàm';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteDoctorTitle(id: string): Promise<{ message: string }> {
      this.loading = true;
      this.error = null;
      try {
        const res = await doctorTitleService.deleteDoctorTitle(id);
        await this.fetchDoctorTitles({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi xóa học hàm';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchDoctorTitlesForSelect(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const res = await doctorTitleService.getDoctorTitlesForSelect();
        this.doctorTitlesForSelect = res.data;
      } catch (err: any) {
        this.error = err.message || 'Lỗi lấy danh sách học hàm cho dropdown';
      } finally {
        this.loading = false;
      }
    },
    
    async fetchDoctorTitlesForSelectBySpecialty(specialtyId: string): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const res = await doctorTitleService.getDoctorTitlesForSelectBySpecialty(specialtyId);
        this.doctorTitlesForSelectBySpecialty = res.data;
      } catch (err: any) {
        this.error = err.message || 'Lỗi lấy danh sách học hàm theo chuyên khoa';
      } finally {
        this.loading = false;
      }
    },

    async fetchDoctorTitleByDoctorId(doctorId: number): Promise<DoctorTitle | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await doctorTitleService.getDoctorTitleByDoctorId(doctorId);
        return res.data;
      } catch (err: any) {
        this.error = err.message || 'Lỗi lấy thông tin học hàm theo bác sĩ';
        return null;
      } finally {
        this.loading = false;
      }
    }
  },
}); 