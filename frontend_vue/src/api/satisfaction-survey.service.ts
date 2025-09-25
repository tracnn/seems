import apiClient from './config';
import type { 
  SatisfactionSurvey, 
  SatisfactionSurveyParams, 
  SatisfactionSurveyResponse 
} from '@/models/satisfaction-survey.model';

export const satisfactionSurveyService = {
  // Lấy danh sách satisfaction surveys cho admin
  async getAdminSatisfactionSurveys(params: SatisfactionSurveyParams = {}): Promise<SatisfactionSurveyResponse> {
    const response = await apiClient.get<SatisfactionSurveyResponse>('/satisfaction-survey', { params });
    return response.data;
  },

  // Lấy thông tin chi tiết satisfaction survey
  async getSatisfactionSurveyById(id: string): Promise<{ data: SatisfactionSurvey }> {
    const response = await apiClient.get<{ data: SatisfactionSurvey }>(`/satisfaction-survey/${id}`);
    return response.data;
  },

  // Cập nhật satisfaction survey
  async updateSatisfactionSurvey(id: string, data: Partial<SatisfactionSurvey>): Promise<{ data: SatisfactionSurvey }> {
    const response = await apiClient.patch<{ data: SatisfactionSurvey }>(`/satisfaction-survey/${id}`, data);
    return response.data;
  },

  // Xóa satisfaction survey
  async deleteSatisfactionSurvey(id: string): Promise<{ message: string }> {
    const response = await apiClient.delete<{ message: string }>(`/satisfaction-survey/${id}`);
    return response.data;
  },
};
