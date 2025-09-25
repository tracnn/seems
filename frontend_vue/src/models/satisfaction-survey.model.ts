import type { User } from './user.model';

export interface SatisfactionSurvey {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string | null;
  version: number;
  userId: string;
  patientCode: string;
  treatmentCode: string;
  serviceReqCode: string | null;
  surveyStatus: SatisfactionSurveyStatus;
  surveyType: SatisfactionSurveyType;
  surveyScore: number;
  surveyComment: string | null;
  surveyResponse: string | null;
  user: User;
}

export enum SatisfactionSurveyStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum SatisfactionSurveyType {
  TREATMENT = 'TREATMENT',
  SERVICE = 'SERVICE'
}

export interface SatisfactionSurveyParams {
  page?: number;
  limit?: number;
  fromDate?: string;
  toDate?: string;
  dateRange?: Date[];
  surveyStatus?: SatisfactionSurveyStatus;
  surveyType?: SatisfactionSurveyType;
  surveyScore?: number;
  search?: string;
  sortField?: string;
  sortOrder?: number;
}

export interface SatisfactionSurveyResponse {
  data: SatisfactionSurvey[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  status: number;
  message: string;
  now: string;
}
