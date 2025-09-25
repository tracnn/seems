import { defineStore } from 'pinia';
import { clinicSpecialtyService } from '@/api/clinic-specialty.service';
import { ApiResponse } from '@/types/api-response';

// Interfaces
interface ClinicSpecialty {
  id: string;
  clinicId: number;
  clinicCode: string;
  clinicName: string;
  specialtyId: string;
  specialtyCode: string;
  specialtyName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClinicSpecialtyParams {
  page?: number;
  limit?: number;
  search?: string;
  clinicId?: number;
  specialtyId?: string;
  isActive?: boolean;
  sortField?: string;
  sortOrder?: number;
}

interface CreateClinicSpecialtyData {
  clinicId: number;
  clinicCode: string;
  clinicName: string;
  specialtyId: string;
  isActive?: boolean;
}

interface UpdateClinicSpecialtyData {
  isActive?: boolean;
}

interface ClinicSpecialtyState {
  clinicSpecialties: ClinicSpecialty[];
  clinicSpecialtiesForSelect: ClinicSpecialty[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  };
}

export const useClinicSpecialtyStore = defineStore('clinicSpecialty', {
  state: (): ClinicSpecialtyState => ({
    clinicSpecialties: [],
    clinicSpecialtiesForSelect: [],
    loading: false,
    error: null,
    pagination: { total: 0, page: 1, limit: 10, pageCount: 1 },
  }),
  actions: {
    async fetchClinicSpecialties(params: ClinicSpecialtyParams = {}) {
      this.loading = true;
      this.error = null;
      try {
        const res: ApiResponse<ClinicSpecialty> = await clinicSpecialtyService.getClinicSpecialties(params);
        this.clinicSpecialties = res.data;
        this.pagination = {
          total: res.pagination.total,
          page: res.pagination.page,
          limit: res.pagination.limit,
          pageCount: res.pagination.pageCount,
        };
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi lấy danh sách chuyên khoa phòng khám';
      } finally {
        this.loading = false;
      }
    },
    
    async createClinicSpecialty(data: CreateClinicSpecialtyData): Promise<{ data: ClinicSpecialty }> {
      this.loading = true;
      this.error = null;
      try {
        const res = await clinicSpecialtyService.createClinicSpecialty(data);
        await this.fetchClinicSpecialties({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi tạo chuyên khoa phòng khám';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async updateClinicSpecialty(id: string, data: UpdateClinicSpecialtyData): Promise<{ data: ClinicSpecialty }> {
      this.loading = true;
      this.error = null;
      try {
        const res = await clinicSpecialtyService.updateClinicSpecialty(id, data);
        await this.fetchClinicSpecialties({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi cập nhật chuyên khoa phòng khám';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteClinicSpecialty(id: string): Promise<{ message: string }> {
      this.loading = true;
      this.error = null;
      try {
        const res = await clinicSpecialtyService.deleteClinicSpecialty(id);
        await this.fetchClinicSpecialties({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi xóa chuyên khoa phòng khám';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchClinicSpecialtiesForSelect(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const res = await clinicSpecialtyService.getClinicSpecialtiesForSelect();
        this.clinicSpecialtiesForSelect = res.data;
      } catch (err: any) {
        this.error = err.message || 'Lỗi lấy danh sách chuyên khoa phòng khám cho dropdown';
      } finally {
        this.loading = false;
      }
    },
  },
}); 