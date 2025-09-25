import apiClient from './config';
import { ApiResponse } from '@/types/api-response';
import { CreateQueueTicketData, QueueTicket, QueueTicketParams, UpdateQueueTicketData } from '@/models/queue-ticket.model';


export const queueTicketService = {
  async getQueueTickets(params: QueueTicketParams = {}): Promise<ApiResponse<QueueTicket>> {
    try {
      const response = await apiClient.get<ApiResponse<QueueTicket>>('/queue-ticket', { params });
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getQueueTicketById(id: string): Promise<{ data: QueueTicket }> {
    try {
      const response = await apiClient.get<{ data: QueueTicket }>(`/queue-ticket/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async createQueueTicket(data: CreateQueueTicketData): Promise<{ data: QueueTicket }> {
    try {
      const response = await apiClient.post<{ data: QueueTicket }>('/queue-ticket', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async updateQueueTicket(id: string, data: UpdateQueueTicketData): Promise<{ data: QueueTicket }> {
    try {
      const response = await apiClient.patch<{ data: QueueTicket }>(`/queue-ticket/${id}`, data);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteQueueTicket(id: string): Promise<{ message: string }> {
    try {
      const response = await apiClient.delete<{ message: string }>(`/queue-ticket/${id}`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  async getQueueTicketsForSelect(): Promise<{ data: QueueTicket[] }> {
    try {
      const response = await apiClient.get<{ data: QueueTicket[] }>('/queue-ticket/select');
      return response.data;
    } catch (error) {
      throw error;
    }
  },
}; 