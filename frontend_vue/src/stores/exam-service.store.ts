import { defineStore } from 'pinia';
import { examServiceService } from '@/api/exam-service.service';
import { ApiResponse } from '@/types/api-response';

// Interfaces
interface ExamService {
  serviceId: number;
  serviceCode: string;
  serviceName: string;
}

interface ExamServiceParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: number;
}

interface ExamServiceState {
  examServices: ExamService[];
  examServicesForSelect: ExamService[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const useExamServiceStore = defineStore('examService', {
  state: (): ExamServiceState => ({
    examServices: [],
    examServicesForSelect: [],
    loading: false,
    error: null,
    pagination: { 
      total: 0, 
      page: 1, 
      limit: 10, 
      pageCount: 1,
      hasNext: false,
      hasPrev: false
    },
  }),

  actions: {
    async fetchExamServices(params: ExamServiceParams = {}): Promise<ApiResponse<ExamService>> {
      this.loading = true;
      this.error = null;
      try {
        const res: ApiResponse<ExamService> = await examServiceService.getExamServices(params);
        this.examServices = res.data;
        this.pagination = {
          total: res.pagination.total,
          page: res.pagination.page,
          limit: res.pagination.limit,
          pageCount: res.pagination.pageCount,
          hasNext: res.pagination.hasNext,
          hasPrev: res.pagination.hasPrev,
        };
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi lấy danh sách dịch vụ khám';
        throw err;
      } finally {
        this.loading = false;
      }
    },

    async fetchExamServicesForSelect(): Promise<void> {
      this.loading = true;
      this.error = null;
      try {
        const res = await examServiceService.getExamServicesForSelect();
        this.examServicesForSelect = res.data;
      } catch (err: any) {
        this.error = err.message || 'Lỗi lấy danh sách dịch vụ khám cho dropdown';
      } finally {
        this.loading = false;
      }
    },

    async fetchExamServiceById(serviceId: number): Promise<ExamService | null> {
      this.loading = true;
      this.error = null;
      try {
        const res = await examServiceService.getExamServiceById(serviceId);
        return res;
      } catch (err: any) {
        this.error = err.message || 'Lỗi lấy thông tin dịch vụ khám';
        return null;
      } finally {
        this.loading = false;
      }
    },

    async resolveExamServicesByIds(serviceIds: number[]): Promise<ExamService[]> {
      try {
        return await examServiceService.getExamServicesByIds(serviceIds);
      } catch (err: any) {
        this.error = err.message || 'Lỗi lấy thông tin dịch vụ khám theo IDs';
        return [];
      }
    }
  },
});
