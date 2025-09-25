import apiClient from './config';
import { ApiResponse } from '@/types/api-response';
import { QueueClinicRoom, QueueClinicRoomParams, CreateQueueClinicRoomData, UpdateQueueClinicRoomData } from '@/models/queue-clinic-room.model';


export const queueClinicRoomService = {
  async getQueueClinicRooms(params: QueueClinicRoomParams = {}): Promise<ApiResponse<QueueClinicRoom>> {
    try {
      const response = await apiClient.get<ApiResponse<QueueClinicRoom>>('/queue-clinic-room', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getQueueClinicRoomById(id: string): Promise<{ data: QueueClinicRoom }> {
    try {
      const response = await apiClient.get<{ data: QueueClinicRoom }>(`/queue-clinic-room/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createQueueClinicRoom(data: CreateQueueClinicRoomData): Promise<{ data: QueueClinicRoom }> {
    try {
      const response = await apiClient.post<{ data: QueueClinicRoom }>('/queue-clinic-room', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateQueueClinicRoom(id: string, data: UpdateQueueClinicRoomData): Promise<{ data: QueueClinicRoom }> {
    try {
      const response = await apiClient.patch<{ data: QueueClinicRoom }>(`/queue-clinic-room/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteQueueClinicRoom(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/queue-clinic-room/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getQueueClinicRoomsForSelect(): Promise<{ data: QueueClinicRoom[] }> {
    try {
      const response = await apiClient.get<{ data: QueueClinicRoom[] }>('/queue-clinic-room/select');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
}; 