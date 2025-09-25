import { defineStore } from 'pinia';
import { ApiResponse } from '@/types/api-response';
import { CreateQueueTicketData, QueueTicket, QueueTicketParams, UpdateQueueTicketData } from '@/models/queue-ticket.model';
import { queueTicketService } from '@/api/queue-ticket.service';

interface QueueTicketState {
  queueTickets: QueueTicket[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  };
}

export const useQueueTicketStore = defineStore('queue-ticket', {
  state: (): QueueTicketState => ({
    queueTickets: [],
    loading: false,
    pagination: { total: 0, page: 1, limit: 10, pageCount: 1 },
  }),
  actions: {
    async fetchQueueTickets(params: QueueTicketParams) {
      this.loading = true;
      try {
        const res: ApiResponse<QueueTicket> = await queueTicketService.getQueueTickets(params);
        this.queueTickets = res.data;

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
    
    async createQueueTicket(data: CreateQueueTicketData): Promise<{ data: QueueTicket }> {
      this.loading = true;
      try {
        const res = await queueTicketService.createQueueTicket(data);
        await this.fetchQueueTickets({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async updateQueueTicket(id: string, data: UpdateQueueTicketData): Promise<{ data: QueueTicket }> {
      this.loading = true;
      try {
        const res = await queueTicketService.updateQueueTicket(id, data);
        await this.fetchQueueTickets({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteQueueTicket(id: string): Promise<{ message: string }> {
      this.loading = true;
      try {
        const res = await queueTicketService.deleteQueueTicket(id);
        await this.fetchQueueTickets({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchQueueTicketsSelect(): Promise<{ data: QueueTicket[] }> {
      this.loading = true;
      try {
        const res = await queueTicketService.getQueueTicketsForSelect();
        this.queueTickets = res.data;
        return res;
      } finally {
        this.loading = false;
      }
    },
  },
}); 