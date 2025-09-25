import { defineStore } from 'pinia'
import { satisfactionSurveyService } from '@/api/satisfaction-survey.service'
import type { 
  SatisfactionSurvey, 
  SatisfactionSurveyParams 
} from '@/models/satisfaction-survey.model'
import { SatisfactionSurveyResponse } from '@/models/satisfaction-survey.model'

interface SatisfactionSurveyState {
  surveys: SatisfactionSurvey[]
  loading: boolean
  error: string | null
  pagination: {
    total: number
    page: number
    limit: number
    pageCount: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export const useSatisfactionSurveyStore = defineStore('satisfactionSurvey', {
  state: (): SatisfactionSurveyState => ({
    surveys: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pageCount: 1,
      hasNext: false,
      hasPrev: false,
    },
  }),

  getters: {
    getSurveys: (state): SatisfactionSurvey[] => state.surveys,
    getLoading: (state): boolean => state.loading,
    getError: (state): string | null => state.error,
    getPagination: (state) => state.pagination,
  },

  actions: {
    async fetchAdminSurveys(params: SatisfactionSurveyParams = {}): Promise<void> {
      this.loading = true
      this.error = null
      try {
        const response: SatisfactionSurveyResponse = await satisfactionSurveyService.getAdminSatisfactionSurveys(params)
        this.surveys = response.data
        this.pagination = {
          total: response.pagination.total,
          page: response.pagination.page,
          limit: response.pagination.limit,
          pageCount: response.pagination.pageCount,
          hasNext: response.pagination.hasNext,
          hasPrev: response.pagination.hasPrev,
        }
      } catch (err: any) {
        this.error = err.message || 'Lỗi lấy danh sách khảo sát hài lòng'
        throw err
      } finally {
        this.loading = false
      }
    },

    async getSurveyById(id: string): Promise<SatisfactionSurvey> {
      this.loading = true
      this.error = null
      try {
        const response = await satisfactionSurveyService.getSatisfactionSurveyById(id)
        return response.data
      } catch (err: any) {
        this.error = err.message || 'Lỗi lấy thông tin khảo sát hài lòng'
        throw err
      } finally {
        this.loading = false
      }
    },

    async updateSurvey(id: string, data: Partial<SatisfactionSurvey>, currentParams?: Partial<SatisfactionSurveyParams>): Promise<SatisfactionSurvey> {
      this.loading = true
      this.error = null
      try {
        const response = await satisfactionSurveyService.updateSatisfactionSurvey(id, data)
        await this.refreshSurveyList(currentParams)
        return response.data
      } catch (err: any) {
        this.error = err.message || 'Lỗi cập nhật khảo sát hài lòng'
        throw err
      } finally {
        this.loading = false
      }
    },

    async deleteSurvey(id: string, currentParams?: Partial<SatisfactionSurveyParams>): Promise<any> {
      this.loading = true
      this.error = null
      try {
        const response = await satisfactionSurveyService.deleteSatisfactionSurvey(id)
        await this.refreshSurveyList(currentParams)
        return response
      } catch (err: any) {
        this.error = err.message || 'Lỗi xoá khảo sát hài lòng'
        throw err
      } finally {
        this.loading = false
      }
    },

    clearError(): void {
      this.error = null
    },

    setPagination(pagination: Partial<SatisfactionSurveyState['pagination']>): void {
      this.pagination = { ...this.pagination, ...pagination }
    },

    async refreshSurveyList(params?: Partial<SatisfactionSurveyParams>): Promise<void> {
      await this.fetchAdminSurveys({
        page: this.pagination.page,
        limit: this.pagination.limit,
        ...params,
      })
    },
  },
})
