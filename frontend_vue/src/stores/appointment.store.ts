import { defineStore } from 'pinia';
import { appointmentService } from '@/api/appointment.service';
import type { ApiResponse } from '@/types/api-response';
import type { Appointment, AppointmentParams, CreateAppointmentData, UpdateAppointmentData, 
    CreateHISAppointmentData } from '@/models/appointment.model';

interface AppointmentState {
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  lastFilter: Record<string, any>;
}

export const useAppointmentStore = defineStore('appointment', {
  state: (): AppointmentState => ({
    appointments: [],
    loading: false,
    error: null,
    pagination: {
      total: 0,
      page: 1,
      limit: 10,
      pageCount: 1,
      hasNext: false,
      hasPrev: false
    },
    lastFilter: {},
  }),
  
  actions: {
    async fetchAppointments(params: AppointmentParams = {}): Promise<ApiResponse<Appointment>> {

      this.loading = true;
      this.error = null;
      this.lastFilter = { ...params };
      
      try {
        const res = await appointmentService.getAppointments(params);
        this.appointments = res.data;
        this.pagination = res.pagination;
        return res;
      } catch (error: any) {
        this.error = error.message || 'Failed to fetch appointments';
        console.error('Error fetching appointments:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async createAppointment(data: CreateAppointmentData): Promise<{ data: Appointment }> {
      this.loading = true;
      this.error = null;
      try {
        const res = await appointmentService.createAppointment(data);
        if (res) {
          await this.fetchAppointments({ ...this.lastFilter });
        }
        return res;
      } catch (error: any) {
        this.error = error.message || 'Failed to create appointment';
        console.error('Error creating appointment:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async updateAppointment(id: string, data: UpdateAppointmentData): Promise<{ data: Appointment }> {
      this.loading = true;
      this.error = null;
      try {
        const res = await appointmentService.updateAppointment(id, data);
        if (res) {
          await this.fetchAppointments({ ...this.lastFilter });
        }
        return res;
      } catch (error: any) {
        this.error = error.message || 'Failed to update appointment';
        console.error('Error updating appointment:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },
    
    async deleteAppointment(id: string): Promise<{ message: string }> {
      this.loading = true;
      this.error = null;
      try {
        const res = await appointmentService.deleteAppointment(id);
        if (res) {
          await this.fetchAppointments({ ...this.lastFilter });
        }
        return res;
      } catch (error: any) {
        this.error = error.message || 'Failed to delete appointment';
        console.error('Error deleting appointment:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    },

    // Tạo hồ sơ HIS
    // body {
    //   appointmentId: 1230000567e89b-12-a456-426614174000    // }
    async createHISAppointment(data: CreateHISAppointmentData): Promise<{ data: Appointment }> {
      this.loading = true;
      this.error = null;
      try {
        const res = await appointmentService.createHISAppointment(data);
        if (res) {
          await this.fetchAppointments({ ...this.lastFilter });
        }
        return res;
      } catch (error: any) {
        this.error = error.message || 'Failed to create HIS appointment';
        console.error('Error creating HIS appointment:', error);
        throw error;
      } finally {
        this.loading = false;
      }
    }
  },
}); 