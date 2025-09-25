import { Params } from "./common.model";
import { QueueRoom } from "./queue-room.model";

export interface QueueClinicRoom {
    id: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    version: number;
    queueRoomId: string;
    clinicRoomId: number;
    clinicRoomCode: string;
    clinicRoomName: string;
    orderNumber: number;
    isActive: number;
    queueRoom: QueueRoom;
}

export interface QueueClinicRoomParams extends Params {}

export interface CreateQueueClinicRoomData {
    queueRoomId: string;
    clinicRoomId: number;
    clinicRoomCode: string;
    clinicRoomName: string;
}

export interface UpdateQueueClinicRoomData {
    clinicRoomCode?: string;
    clinicRoomName?: string;
    orderNumber?: number;
    isActive?: number;
}