import { NestResponse } from "./helpers/types";

export interface PaginatedQueryParams {
  page?: number;
  limit?: number;
}

export interface Pagination {
  total: number;
  currentPage: number;
  perPage: number;
  lastPage: number;
  prev: number | null;
  next: number | null;
}

export interface NestResponseWithPagination<T> extends NestResponse<T> {
  meta: Pagination;
}
