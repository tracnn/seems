export interface ApiResponse<T> {
    data: T[];
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