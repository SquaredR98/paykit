/**
 * Paginated list response — consistent across all providers.
 */
export interface PaginatedList<T> {
  data: T[];
  hasMore: boolean;
  totalCount?: number;
}

/**
 * Parameters for listing resources.
 */
export interface ListParams {
  limit?: number;
  startingAfter?: string;
  endingBefore?: string;
}

/**
 * Options that can be passed to any mutating operation.
 */
export interface RequestOptions {
  idempotencyKey?: string;
  timeout?: number;
}
