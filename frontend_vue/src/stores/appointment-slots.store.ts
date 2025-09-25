import { defineStore } from 'pinia';
import { appointmentSlotsService } from '@/api/appointment-slots.service';
import type { ApiResponse } from '@/types/api-response';
import type { AppointmentSlot, AppointmentSlotParams, 
  CreateAppointmentSlotData, UpdateAppointmentSlotData, SlotTime, 
  SlotDisableParams, SlotDisableResponse } from '@/models/appointment-slot.model';

interface AppointmentSlotsState {
  appointmentSlots: AppointmentSlot[];
  slotTimes: SlotTime[];
  slotDisable: string[];
  loading: boolean;
  error: string | null;
  pagination: { total: number; page: number; limit: number; pageCount: number; hasNext: boolean; hasPrev: boolean };
  lastFilter: Record<string, any>;
}

export const useAppointmentSlotsStore = defineStore('appointmentSlots', {
  state: (): AppointmentSlotsState => ({
    appointmentSlots: [],
    slotTimes: [],
    slotDisable: [],
    loading: false,
    error: null,
    pagination: { total: 0, page: 1, limit: 10, pageCount: 1, hasNext: false, hasPrev: false },
    lastFilter: {},
  }),
  
  actions: {
    async fetchAppointmentSlots(params: AppointmentSlotParams = {}): Promise<ApiResponse<AppointmentSlot>> {

      this.loading = true;
      this.error = null;
      this.lastFilter = { ...params };
      
      try {
        const res = await appointmentSlotsService.getAppointmentSlots(params);
        this.appointmentSlots = res.data;
        this.pagination = res.pagination;
        return res;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch appointment slots';
        console.error('Error fetching appointment slots:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async createAppointmentSlot(data: CreateAppointmentSlotData): Promise<{ data: AppointmentSlot }> {
      this.error = null;
      try {
        const res = await appointmentSlotsService.createAppointmentSlot(data);
        if (res) {
          await this.fetchAppointmentSlots({ ...this.lastFilter });
        }
        return res;
      } catch (error: any) {
        this.error = error.message || 'Failed to create appointment slot';
        console.error('Error creating appointment slot:', error);
        throw error;
      }
    },
    
    async updateAppointmentSlot(id: string, data: UpdateAppointmentSlotData): Promise<{ data: AppointmentSlot }> {
      this.error = null;
      try {
        const res = await appointmentSlotsService.updateAppointmentSlot(id, data);
        if (res) {
          await this.fetchAppointmentSlots({ ...this.lastFilter });
        }
        return res;
      } catch (error: any) {
        this.error = error.message || 'Failed to update appointment slot';
        console.error('Error updating appointment slot:', error);
        throw error;
      }
    },
    
    async deleteAppointmentSlot(id: string): Promise<{ message: string }> {
      this.error = null;
      try {
        const res = await appointmentSlotsService.deleteAppointmentSlot(id);
        if (res) {
          await this.fetchAppointmentSlots({ ...this.lastFilter });
        }
        return res;
      } catch (error: any) {
        this.error = error.message || 'Failed to delete appointment slot';
        console.error('Error deleting appointment slot:', error);
        throw error;
      }
    },
    
    async getSlotTime(): Promise<{ data: SlotTime[] }> {
      this.error = null;
      try {
        const res = await appointmentSlotsService.getSlotTime();
        this.slotTimes = res.data;
        return res;
      } catch (error: any) {
        this.error = error.message || 'Failed to get slot times';
        console.error('Error getting slot times:', error);
        throw error;
      }
    },
    
    async fetchSlotDisable(data: SlotDisableParams): Promise<SlotDisableResponse> {
      this.error = null;
      try {
        const res = await appointmentSlotsService.getSlotDisable(data);
        this.slotDisable = res.disabledSlots;
        return res;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch slot disable data';
        console.error('Error fetching slot disable data:', error);
        throw error;
      }
    },

    async importAppointmentSlot(data: any): Promise<{ message: string }> {
      this.error = null;
      try {
        const res = await appointmentSlotsService.importAppointmentSlot(data);
        return res;
      } catch (error: any) {
        this.error = error.message || 'Failed to import appointment slot';
        console.error('Error importing appointment slot:', error);
        throw error;
      }
    }
  },
}); 