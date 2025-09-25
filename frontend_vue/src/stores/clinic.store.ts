import { defineStore } from 'pinia';
import { clinicService } from '@/api/clinic.service';
import { ApiResponse } from '@/types/api-response';

interface Clinic {
  id: string;
  name: string;
  address: string;
  phone?: string;
  email?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ClinicParams {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

interface CreateClinicData {
  name: string;
  address: string;
  phone: string;
  email?: string;
  isActive?: boolean;
}

interface UpdateClinicData {
  name?: string;
  address?: string;
  phone?: string;
  email?: string;
  isActive?: boolean;
}

interface ClinicState {
  clinics: Clinic[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  };
}

interface RoomForQueue {
  id: number;
  clinicCode: string;
  clinicName: string;
  roomTypeId: number;
  roomTypeCode: string;
  roomTypeName: string;
  areaId: number;
  areaCode: string;
  areaName: string;
  departmentId: number;
  departmentCode: string;
  departmentName: string;
  branchId: number;
  branchCode: string;
  branchName: string;
  address: string;
}

interface RoomForQueueParams {
  page?: number;
  limit?: number;
  search?: string;
}

interface RoomForQueueState {
  roomForQueue: RoomForQueue[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  };
}

export const useClinicStore = defineStore('clinic', {
  state: (): ClinicState & RoomForQueueState => ({
    clinics: [],
    roomForQueue: [],
    loading: false,
    error: null,
    pagination: { total: 0, page: 1, limit: 10, pageCount: 1 },
  }),
  actions: {
    async fetchClinics(params: ClinicParams = {}): Promise<ApiResponse<Clinic>> {
      this.loading = true;
      this.error = null;
      try {
        const res: ApiResponse<Clinic> = await clinicService.getClinics(params);
        this.clinics = res.data;
        // Note: ApiResponse doesn't have pagination info, so we'll use default values
        // You may need to adjust this based on your actual API response structure
        this.pagination = {
          total: res.pagination.total || 0,
          page: res.pagination.page || 1,
          limit: res.pagination.limit || 10,
          pageCount: res.pagination.pageCount || 1,
        };
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi lấy danh sách phòng khám';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async createClinic(data: CreateClinicData): Promise<{ data: Clinic }> {
      this.loading = true;
      this.error = null;
      try {
        const res = await clinicService.createClinic(data);
        await this.fetchClinics({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi tạo phòng khám';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async updateClinic(id: string, data: UpdateClinicData): Promise<{ data: Clinic }> {
      this.loading = true;
      this.error = null;
      try {
        const res = await clinicService.updateClinic(id, data);
        await this.fetchClinics({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi cập nhật phòng khám';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteClinic(id: string): Promise<{ message: string }> {
      this.loading = true;
      this.error = null;
      try {
        const res = await clinicService.deleteClinic(id);
        await this.fetchClinics({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi xóa phòng khám';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchClinicsSelect(): Promise<{ data: Clinic[] }> {
      this.loading = true;
      this.error = null;
      try {
        const res = await clinicService.getClinicsForSelect();
        this.clinics = res.data;
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi lấy danh sách phòng khám cho dropdown';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchRoomForQueue(params: RoomForQueueParams = {}): Promise<ApiResponse<RoomForQueue>> {
      this.loading = true;
      this.error = null;
      try {
        const res = await clinicService.getRoomForQueue(params);
        this.roomForQueue = res.data;
        this.pagination = {
          total: res?.pagination?.total || 0,
          page: res?.pagination?.page || 1,
          limit: res?.pagination?.limit || 10,
          pageCount: res?.pagination?.pageCount || 1,
        };
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi lấy danh sách phòng khám';
        throw err;
      } finally {
        this.loading = false;
      }
    }
  },
}); 