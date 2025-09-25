import { defineStore } from 'pinia';
import { ApiResponse } from '@/types/api-response';
import { QueueClinicRoom, QueueClinicRoomParams, CreateQueueClinicRoomData, UpdateQueueClinicRoomData } from '@/models/queue-clinic-room.model';
import { queueClinicRoomService } from '@/api/queue-clinic-room.service';

interface QueueClinicRoomState {
  queueClinicRooms: QueueClinicRoom[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  };
}

export const useQueueClinicRoomStore = defineStore('queue-clinic-room', {
  state: (): QueueClinicRoomState => ({
    queueClinicRooms: [],
    loading: false,
    pagination: { total: 0, page: 1, limit: 10, pageCount: 1 },
  }),
  actions: {
    async fetchQueueClinicRooms(params: QueueClinicRoomParams) {
      this.loading = true;
      try {
        const res: ApiResponse<QueueClinicRoom> = await queueClinicRoomService.getQueueClinicRooms(params);
        this.queueClinicRooms = res.data;

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
    
    async createQueueClinicRoom(data: CreateQueueClinicRoomData): Promise<{ data: QueueClinicRoom }> {
      this.loading = true;
      try {
        const res = await queueClinicRoomService.createQueueClinicRoom(data);
        await this.fetchQueueClinicRooms({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async updateQueueClinicRoom(id: string, data: UpdateQueueClinicRoomData): Promise<{ data: QueueClinicRoom }> {
      this.loading = true;
      try {
        const res = await queueClinicRoomService.updateQueueClinicRoom(id, data);
        await this.fetchQueueClinicRooms({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteQueueClinicRoom(id: string): Promise<{ message: string }> {
      this.loading = true;
      try {
        const res = await queueClinicRoomService.deleteQueueClinicRoom(id);
        await this.fetchQueueClinicRooms({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchQueueClinicRoomsSelect(): Promise<{ data: QueueClinicRoom[] }> {
      this.loading = true;
      try {
        const res = await queueClinicRoomService.getQueueClinicRoomsForSelect();
        this.queueClinicRooms = res.data;
        return res;
      } finally {
        this.loading = false;
      }
    },
  },
}); 