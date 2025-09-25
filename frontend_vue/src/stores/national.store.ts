import { defineStore } from 'pinia';
import { nationalService } from '@/api/national.service';
import { ApiResponse } from '@/types/api-response';
import { National } from '@/models/national.model';

interface NationalParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface CreateNationalData {
  nationalCode: string;
  nationalName: string;
  mpsNationalCode: string;
  isActive?: boolean;
}

interface UpdateNationalData {
  nationalCode?: string;
  nationalName?: string;
  mpsNationalCode?: string;
  isActive?: boolean;
}

interface NationalState {
  nationals: National[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  };
}

export const useNationalStore = defineStore('national', {
  state: (): NationalState => ({
    nationals: [],
    loading: false,
    pagination: { total: 0, page: 1, limit: 10, pageCount: 1 },
  }),
  actions: {
    async fetchNationals(params: NationalParams = {}): Promise<ApiResponse<National>> {
      this.loading = true;
      try {
        const res: ApiResponse<National> = await nationalService.getNationals(params);
        this.nationals = res.data;
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
    
    async createNational(data: CreateNationalData): Promise<{ data: National }> {
      this.loading = true;
      try {
        const res = await nationalService.createNational(data);
        await this.fetchNationals({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async updateNational(id: string, data: UpdateNationalData): Promise<{ data: National }> {
      this.loading = true;
      try {
        const res = await nationalService.updateNational(id, data);
        // Có thể reload hoặc không, tuỳ nghiệp vụ
        await this.fetchNationals({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteNational(id: string): Promise<{ message: string }> {
      this.loading = true;
      try {
        const res = await nationalService.deleteNational(id);
        await this.fetchNationals({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },

    // NEW: lấy 1 bản ghi theo id (dùng cho resolveByValue của ServerSelect)
    async fetchNationalById(id: number): Promise<National | null> {
        try {
          const res = await nationalService.getNationalById(String(id));
          return res.data ?? null;
        } catch {
          return null;
        }
      },
  
    // (Tuỳ chọn) NEW: lấy nhiều bản ghi theo list id (phục vụ multiple)
    async resolveNationalsByIds(ids: number[]): Promise<National[]> {
      const results = await Promise.all(ids.map(id => this.fetchNationalById(id)));
      return results.filter((x): x is National => !!x);
    },
    
    async fetchNationalsSelect(): Promise<{ data: National[] }> {
      this.loading = true;
      try {
        const res = await nationalService.getNationalsForSelect();
        this.nationals = res.data;
        return res;
      } finally {
        this.loading = false;
      }
    },
  },
}); 