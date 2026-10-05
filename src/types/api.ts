export interface ApiResponse<T> {
  success: true;
  message: string;
  data: T;
}

export interface ApiErrorBody {
  success: false;
  statusCode: number;
  message: string;
  errors?: { field: string; message: string }[];
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
