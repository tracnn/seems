import { Params } from "./common.model";

export interface QueueRoom {
    id: string;
    createdAt: string;
    updatedAt: string;
    version: number;
    queueRoomCode: string;
    queueRoomName: string;
    description: string;
    queueRoomType: string;
    isActive: number;
}

export interface QueueRoomParams extends Params {}

export interface CreateQueueRoomData {
    queueRoomCode: string;
    queueRoomName: string;
    description: string;
    queueRoomType: string;
}

export interface UpdateQueueRoomData {
    queueRoomCode?: string;
    queueRoomName?: string;
    description?: string;
    queueRoomType?: string;
}

export interface QueueRoomType {
    label: string;
    value: string;
}