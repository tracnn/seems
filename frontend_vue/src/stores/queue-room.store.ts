import { defineStore } from 'pinia';
import { queueRoomService } from '@/api/queue-room.service';
import { ApiResponse } from '@/types/api-response';
import { QueueRoom, QueueRoomParams, CreateQueueRoomData, UpdateQueueRoomData, QueueRoomType } from '@/models/queue-room.model';

interface QueueRoomState {
  queueRooms: QueueRoom[];
  loading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
  };
  queueRoomTypes: QueueRoomType[];
}

export const useQueueRoomStore = defineStore('queue-room', {
  state: (): QueueRoomState => ({
    queueRooms: [],
    loading: false,
    pagination: { total: 0, page: 1, limit: 10, pageCount: 1 },
    queueRoomTypes: [],
  }),
  actions: {
    async fetchQueueRooms(params: QueueRoomParams) {
      this.loading = true;
      try {
        const res: ApiResponse<QueueRoom> = await queueRoomService.getQueueRooms(params);
        this.queueRooms = res.data;

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
    
    async createQueueRoom(data: CreateQueueRoomData): Promise<{ data: QueueRoom }> {
      this.loading = true;
      try {
        const res = await queueRoomService.createQueueRoom(data);
        await this.fetchQueueRooms({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async updateQueueRoom(id: string, data: UpdateQueueRoomData): Promise<{ data: QueueRoom }> {
      this.loading = true;
      try {
        const res = await queueRoomService.updateQueueRoom(id, data);
        await this.fetchQueueRooms({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteQueueRoom(id: string): Promise<{ message: string }> {
      this.loading = true;
      try {
        const res = await queueRoomService.deleteQueueRoom(id);
        await this.fetchQueueRooms({ page: this.pagination.page, limit: this.pagination.limit });
        return res;
      } finally {
        this.loading = false;
      }
    },
    
    async fetchQueueRoomsSelect(): Promise<{ data: QueueRoom[] }> {
      this.loading = true;
      try {
        const res = await queueRoomService.getQueueRoomsForSelect();
        this.queueRooms = res.data;
        return res;
      } finally {
        this.loading = false;
      }
    },

    async fetchQueueRoomTypes(): Promise<{ data: QueueRoomType[] }> {
      this.loading = true;
      try {
        const res = await queueRoomService.getQueueRoomTypes();
        this.queueRoomTypes = res.data;
        return res;
      } finally {
        this.loading = false;
      }
    },
  },
}); 