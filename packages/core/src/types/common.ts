/**
 * Paginated list response — consistent across all providers.
 *
 * @typeParam T - The type of items in the list.
 *
 * @example
 * const charges = await paykit.charges.list({ limit: 10 });
 * for (const charge of charges.data) {
 *   console.log(charge.id);
 * }
 * if (charges.hasMore) {
 *   const next = await paykit.charges.list({ startingAfter: charges.data.at(-1)?.id });
 * }
 */
export interface PaginatedList<T> {
  /** The list of items for this page. */
  data: T[];
  /** Whether there are more items available after this page. */
  hasMore: boolean;
  /** Total number of items (not all providers return this). */
  totalCount?: number;
}

/**
 * Parameters for listing resources with cursor-based pagination.
 *
 * @example
 * await paykit.charges.list({ limit: 25, startingAfter: 'ch_xxx' });
 */
export interface ListParams {
  /** Maximum number of items to return. */
  limit?: number;
  /** Cursor: return items created after this ID. */
  startingAfter?: string;
  /** Cursor: return items created before this ID. */
  endingBefore?: string;
}

/**
 * Options that can be passed to any mutating operation.
 */
export interface RequestOptions {
  /** Idempotency key to prevent duplicate operations. Passed as a header to the provider. */
  idempotencyKey?: string;
  /** Request timeout in milliseconds. Overrides the SDK-level timeout. */
  timeout?: number;
}

/**
 * Metadata attached to every unified response from the PayKit client.
 * Provides observability into request timing, provider routing, and retry behavior.
 */
export interface ResponseMeta {
  /** Time taken for the operation in milliseconds. */
  durationMs: number;
  /** Which provider handled this request. */
  provider: string;
  /** Unique identifier for this request (useful for correlating logs). */
  requestId?: string;
  /** Which retry attempt produced this result (1 = first try, 2 = first retry, etc.). */
  attempt?: number;
}
