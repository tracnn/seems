import apiClient from './config';
import type { BaseModel } from '@/models/common.model';
import { ApiResponse } from '@/types/api-response';

interface Patient extends BaseModel {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email?: string;
  address: string;
  identityNumber?: string;
  insuranceNumber?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface PatientParams {
  page?: number;
  limit?: number;
  search?: string;
  gender?: string;
  ageRange?: string;
}

interface CreatePatientData {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  phone: string;
  email?: string;
  address: string;
  identityNumber?: string;
  insuranceNumber?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface UpdatePatientData {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  phone?: string;
  email?: string;
  address?: string;
  identityNumber?: string;
  insuranceNumber?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

interface PatientHistory {
  appointmentId: string;
  appointmentDate: string;
  doctorName: string;
  specialtyName: string;
  diagnosis?: string;
  treatment?: string;
  notes?: string;
}

interface PatientInsurance {
  insuranceNumber: string;
  insuranceType: string;
  validFrom: string;
  validTo: string;
  status: string;
}

export const patientService = {
  // Lấy danh sách bệnh nhân
  async getPatients(params: PatientParams = {}): Promise<ApiResponse<Patient>> {
    const response = await apiClient.get<ApiResponse<Patient>>('/patients', { params });
    return response.data;
  },

  // Lấy thông tin chi tiết bệnh nhân
  async getPatientById(id: string): Promise<{ data: Patient }> {
    const response = await apiClient.get<{ data: Patient }>(`/patients/${id}`);
    return response.data;
  },

  // Tạo hồ sơ bệnh nhân mới
  async createPatient(patientData: CreatePatientData): Promise<{ data: Patient }> {
    const response = await apiClient.post<{ data: Patient }>('/patients', patientData);
    return response.data;
  },

  // Cập nhật thông tin bệnh nhân
  async updatePatient(id: string, patientData: UpdatePatientData): Promise<{ data: Patient }> {
    const response = await apiClient.put<{ data: Patient }>(`/patients/${id}`, patientData);
    return response.data;
  },

  // Lấy lịch sử khám bệnh
  async getPatientHistory(id: string): Promise<{ data: PatientHistory[] }> {
    const response = await apiClient.get<{ data: PatientHistory[] }>(`/patients/${id}/history`);
    return response.data;
  },

  // Lấy thông tin bảo hiểm y tế
  async getPatientInsurance(id: string): Promise<{ data: PatientInsurance }> {
    const response = await apiClient.get<{ data: PatientInsurance }>(`/patients/${id}/insurance`);
    return response.data;
  }
}; 