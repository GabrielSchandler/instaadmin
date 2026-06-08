export interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

export type ActionResult<T = void> =
  | { success: true; data: T }
  | { success: false; error: string };

export interface KPIData {
  generated: number;
  published: number;
  scheduled: number;
  pending: number;
  approvalRate: number;
  imagesGenerated: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}
