export interface User {
    id: string;
    createdAt: string;
    updatedAt: string;
    createdBy: string;
    updatedBy: string;
    version: number;
    username: string;
    email: string;
    isLocked: number;
    lastLoginAt: string;
    lastLoginIp: string;
    lastLoginUserAgent: string;
    patientCode: string;
    fullName: string;
    birthDate: string;
    genderCode: number;
    address: string;
    provinceId: number;
    districtId: number;
    communeId: number;
    heinCardNumber: string;
    insuranceNumber: string;
    identityNumber: string;
    phoneNumber: string;
    careerId: number;
    isActive: number;
    ethnicId: number;
    nationalId: number;
    permissions?: string[];
}

export interface UserParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isActive?: boolean;
    sortField?: string;
    sortOrder?: number;
  }
  
  export interface CreateUserData {
    email: string | null;
    fullName: string;
    birthDate: string;
    identityNumber: string;
    phoneNumber: string;
  }
  
  export interface UpdateUserData {
    phoneNumber?: string;
    birthDate?: string;
    identityNumber?: string;
  }