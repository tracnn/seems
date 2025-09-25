import { defineStore } from 'pinia';
import { serviceService } from '@/api/service.service';
import { ApiResponse } from '@/types/api-response';

// Interfaces
interface Service {
  serviceId: string;
  serviceCode: string;
  serviceName: string;
  price: number;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  deletedAt?: string | null;
}

interface ServiceParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface CreateServiceData {
  name: string;
  code: string;
  price: number;
  description?: string;
  isActive?: boolean;
}

interface UpdateServiceData {
  name?: string;
  code?: string;
  price?: number;
  description?: string;
  isActive?: boolean;
}

interface ServiceState {
  services: Service[];
  servicesByClinic: Service[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  };
}

export const useServiceStore = defineStore('service', {
  state: (): ServiceState => ({
    services: [],
    servicesByClinic: [],
    loading: false,
    pagination: { total: 0, page: 1, limit: 10, pageCount: 1 },
  }),
  actions: {
    async fetchServices(params: ServiceParams = {}): Promise<ApiResponse<Service>> {
      this.loading = true;
      try {
        const res: ApiResponse<Service> = await serviceService.getServices(params);
        this.services = res.data;
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
    
    async createService(data: CreateServiceData): Promise<{ data: Service }> {
      this.loading = true;
      try {
        const res = await serviceService.createService(data);
        await this.fetchServices({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async updateService(id: string, data: UpdateServiceData): Promise<{ data: Service }> {
      this.loading = true;
      try {
        const res = await serviceService.updateService(id, data);
        // Có thể reload hoặc không, tuỳ nghiệp vụ
        await this.fetchServices({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteService(id: string): Promise<{ message: string }> {
      this.loading = true;
      try {
        const res = await serviceService.deleteService(id);
        await this.fetchServices({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchServicesSelect(): Promise<{ data: Service[] }> {
      this.loading = true;
      try {
        const res = await serviceService.getServicesForSelect();
        this.services = res.data;
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchExamServicesByClinic(clinicId: string): Promise<{ data: Service[] }> {
      this.loading = true;
      try {
        const res = await serviceService.getExamServicesByClinic(clinicId);
        this.servicesByClinic = res.data;
        return res;
      } finally {
        this.loading = false;
      }
    }
  },
}); 