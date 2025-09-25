import { defineStore } from 'pinia';
import { specialtyService } from '@/api/specialty.service';
import { ApiResponse } from '@/types/api-response';
import { Specialty } from '@/models/specialty.model';

interface SpecialtyParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface CreateSpecialtyData {
  specialtyCode: string;
  specialtyName: string;
  specialtyDescription: string;
  order: number;
  isActive?: boolean;
}

interface UpdateSpecialtyData {
  specialtyCode?: string;
  specialtyName?: string;
  specialtyDescription?: string;
  order?: number;
  isActive?: boolean;
}

interface SpecialtyState {
  specialties: Specialty[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  };
}

export const useSpecialtyStore = defineStore('specialty', {
  state: (): SpecialtyState => ({
    specialties: [],
    loading: false,
    pagination: { total: 0, page: 1, limit: 10, pageCount: 1 },
  }),
  actions: {
    async fetchSpecialties(params: SpecialtyParams) {
      this.loading = true;
      try {
        const res: ApiResponse<Specialty> = await specialtyService.getSpecialties(params);
        this.specialties = res.data;

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
    
    async createSpecialty(data: CreateSpecialtyData): Promise<{ data: Specialty }> {
      this.loading = true;
      try {
        const res = await specialtyService.createSpecialty(data);
        await this.fetchSpecialties({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async updateSpecialty(id: string, data: UpdateSpecialtyData): Promise<{ data: Specialty }> {
      this.loading = true;
      try {
        const res = await specialtyService.updateSpecialty(id, data);
        await this.fetchSpecialties({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteSpecialty(id: string): Promise<{ message: string }> {
      this.loading = true;
      try {
        const res = await specialtyService.deleteSpecialty(id);
        await this.fetchSpecialties({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },

    // NEW: lấy 1 bản ghi theo id (dùng cho resolveByValue của ServerSelect)
    async fetchSpecialtyById(id: string): Promise<Specialty | null> {
      try {
        const res = await specialtyService.getSpecialtyById(id);
        return res.data ?? null;
      } catch {
        return null;
      }
    },

    // (Tuỳ chọn) NEW: lấy nhiều bản ghi theo list id (phục vụ multiple)
    async resolveSpecialtiesByIds(ids: string[]): Promise<Specialty[]> {
      const results = await Promise.all(ids.map(id => this.fetchSpecialtyById(id)));
      return results.filter((x): x is Specialty => !!x);
    },
    
    async fetchSpecialtiesSelect(): Promise<{ data: Specialty[] }> {
      this.loading = true;
      try {
        const res = await specialtyService.getSpecialtiesForSelect();
        this.specialties = res.data;
        return res;
      } finally {
        this.loading = false;
      }
    },
  },
}); 