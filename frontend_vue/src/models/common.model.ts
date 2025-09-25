export interface BaseModel {
    createdAt: string;
    updatedAt: string;
    version: number;
    isActive: number;
    createdBy: string;
    updatedBy: string;
}

export interface Params {
    page?: number;
    limit?: number;
    search?: string;
    sortField?: string;
    sortOrder?: number;
}