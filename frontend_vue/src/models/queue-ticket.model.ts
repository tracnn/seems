import { Params } from "./common.model";
import { QueueRoom } from "./queue-room.model";
import { User } from "./user.model";

export enum QueueTicketType {
    RECEPTION = 'RECEPTION',
    CLINIC = 'CLINIC',
    LABORATORY = 'LABORATORY',
    RADIOLOGY = 'RADIOLOGY',
    PHARMACY = 'PHARMACY',
}

export enum QueueTicketStatus {
    REGISTERED = 'REGISTERED',
    CANCELLED = 'CANCELLED',
    CALLED = 'CALLED',
    CHECKED_IN = 'CHECKED_IN',
    FINISHED = 'FINISHED',
}

export interface QueueTicket {
    id: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    version: number;
    userId: string;
    queueRoomId: string;
    roomId: number;
    roomCode: string;
    roomName: string;
    patientId: number;
    patientCode: string;
    patientFullName: string;
    treatmentId: number;
    treatmentCode: string;
    serviceReqCodes: string;
    queueTicketType: QueueTicketType;
    queueTicketStatus: QueueTicketStatus;
    queueNumber: number;
    registeredDate: string;
    isActive: number;
    user: User;
    queueRoom: QueueRoom;
}

export interface QueueTicketParams extends Params {}

export interface CreateQueueTicketData {
    queueRoomId: string;
    clinicRoomId: number;
    clinicRoomCode: string;
    clinicRoomName: string;
}

export interface UpdateQueueTicketData {
    clinicRoomCode?: string;
    clinicRoomName?: string;
    orderNumber?: number;
    isActive?: number;
}