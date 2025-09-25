import { defineStore } from 'pinia';
import { doctorService } from '@/api/doctor.service';
import { ApiResponse } from '@/types/api-response';
import { Doctor } from '@/models/doctor.model';

interface DoctorParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface CreateDoctorData {
    doctorId: number;
    doctorCode: string;
    doctorName: string;
}

interface UpdateDoctorData {
    doctorId: number;
    doctorCode: string;
    doctorName: string;
}

interface DoctorState {
  doctors: Doctor[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  };
}

export const useDoctorStore = defineStore('doctor', {
  state: (): DoctorState => ({
    doctors: [],
    loading: false,
    error: null,
    pagination: { total: 0, page: 1, limit: 10, pageCount: 1 },
  }),
  actions: {
    async fetchDoctors(params: DoctorParams = {}): Promise<ApiResponse<Doctor>> {
      this.loading = true;
      this.error = null;
      try {
        const res: ApiResponse<Doctor> = await doctorService.getDoctors(params);
        this.doctors = res.data;
        this.pagination = {
          total: res.pagination.total,
          page: res.pagination.page,
          limit: res.pagination.limit,
          pageCount: res.pagination.pageCount,
        };
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async createDoctor(data: CreateDoctorData): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        await doctorService.createDoctor(data);
        // Sau khi tạo mới, reload lại danh sách
        await this.fetchDoctors({ page: this.pagination.page, limit: this.pagination.limit });
      } catch (err: any) {
        this.error = err.message || 'Lỗi tạo bác sĩ';
      } finally {
        this.loading = false;
      }
    },
    
    async updateDoctor(id: string, data: UpdateDoctorData): Promise<{ data: Doctor } | undefined> {
      this.loading = true;
      this.error = null;
      try {
        const res = await doctorService.updateDoctor(id, data);
        await this.fetchDoctors({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi cập nhật bác sĩ';
        return undefined;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteDoctor(id: string): Promise<{ message: string } | undefined> {
      this.loading = true;
      this.error = null;
      try {
        const res = await doctorService.deleteDoctor(id);
        await this.fetchDoctors({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi xóa bác sĩ';
        return undefined;
      } finally {
        this.loading = false;
      }
    },

    // NEW: lấy 1 bản ghi theo id (dùng cho resolveByValue của ServerSelect)
    async fetchDoctorById(id: number): Promise<Doctor | null> {
      try {
        const res = await doctorService.getDoctorById(String(id));
        return res.data ?? null;
      } catch {
        return null;
      }
    },

    // (Tuỳ chọn) NEW: lấy nhiều bản ghi theo list id (phục vụ multiple)
    async resolveDoctorsByIds(ids: number[]): Promise<Doctor[]> {
      const results = await Promise.all(ids.map(id => this.fetchDoctorById(id)));
      return results.filter((x): x is Doctor => !!x);
    },

    async fetchDoctorsSelect(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const res = await doctorService.getDoctorsForSelect();
        this.doctors = res.data;
      } catch (err: any) {
        this.error = err.message || 'Lỗi lấy danh sách bác sĩ';
      } finally {
        this.loading = false;
      }
    }
  },
});