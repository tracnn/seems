import apiClient from './config';
import { ApiResponse } from '@/types/api-response';
import { QueueRoom, QueueRoomParams, CreateQueueRoomData, UpdateQueueRoomData, QueueRoomType } from '@/models/queue-room.model';


export const queueRoomService = {
  async getQueueRooms(params: QueueRoomParams = {}): Promise<ApiResponse<QueueRoom>> {
    try {
      const response = await apiClient.get<ApiResponse<QueueRoom>>('/queue-room', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getQueueRoomById(id: string): Promise<{ data: QueueRoom }> {
    try {
      const response = await apiClient.get<{ data: QueueRoom }>(`/queue-room/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createQueueRoom(data: CreateQueueRoomData): Promise<{ data: QueueRoom }> {
    try {
      const response = await apiClient.post<{ data: QueueRoom }>('/queue-room', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateQueueRoom(id: string, data: UpdateQueueRoomData): Promise<{ data: QueueRoom }> {
    try {
      const response = await apiClient.patch<{ data: QueueRoom }>(`/queue-room/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteQueueRoom(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/queue-room/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getQueueRoomsForSelect(): Promise<{ data: QueueRoom[] }> {
    try {
      const response = await apiClient.get<{ data: QueueRoom[] }>('/queue-room/select');
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getQueueRoomTypes(): Promise<{ data: QueueRoomType[] }> {
    try {
      const response = await apiClient.get<{ data: QueueRoomType[] }>('/queue-room/queue-room-types');
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}; 