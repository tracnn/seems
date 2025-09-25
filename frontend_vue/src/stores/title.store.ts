import { defineStore } from 'pinia';
import { titleService } from '@/api/title.service';
import { ApiResponse } from '@/types/api-response';
import { Title } from '@/models/title.model';

interface TitleParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: number;
  isActive?: boolean;
}

interface TitleState {
  titles: Title[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  };
}

export const useTitleStore = defineStore('title', {
  state: (): TitleState => ({
    titles: [],
    loading: false,
    pagination: { total: 0, page: 1, limit: 10, pageCount: 1 },
  }),
  actions: {
    async fetchTitles(params: TitleParams) {
      this.loading = true;
      try {
        const res: ApiResponse<Title> = await titleService.getTitles(params);
        this.titles = res.data;
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

    async fetchTitleById(id: string) {
      this.loading = true;
      try {
        const res = await titleService.getTitleById(id);
        return res.data;
      } finally {
        this.loading = false;
      }
    },

    async createTitle(data: { titleCode: string; titleName: string; order: number; isActive?: boolean }) {
      this.loading = true;
      try {
        const res = await titleService.createTitle(data);
        await this.fetchTitles({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },

    async updateTitle(id: string, data: { titleCode?: string; titleName?: string; order?: number; isActive?: boolean }) {
      this.loading = true;
      try {
        const res = await titleService.updateTitle(id, data);
        await this.fetchTitles({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },

    async deleteTitle(id: string) {
      this.loading = true;
      try {
        const res = await titleService.deleteTitle(id);
        await this.fetchTitles({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },

    // (Tuỳ chọn) NEW: lấy nhiều bản ghi theo list id (phục vụ multiple)
    async resolveTitlesByIds(ids: string[]): Promise<Title[]> {
      const results = await Promise.all(ids.map(id => this.fetchTitleById(id)));
      return results.filter((x): x is Title => !!x);
    },

    async fetchTitlesSelect() {
      this.loading = true;
      try {
        const res = await titleService.getTitlesForSelect();
        this.titles = res.data;
        return res;
      } finally {
        this.loading = false;
      }
    },
  },
}); 