export interface AcsUser {
  userId: number;
  username: string;
  fullName: string;
  email: string | null;
  phoneNumber: string | null;
}

export interface AcsUserParams {
  page?: number;
  limit?: number;
  search?: string;
  sortField?: string;
  sortOrder?: number;
}

export interface AcsUserResponse {
  data: AcsUser[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pageCount: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  status: number;
  message: string;
  now: string;
}
