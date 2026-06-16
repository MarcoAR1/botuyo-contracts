/**
 * REST envelope contract.
 *
 * The backend wraps successful responses as `{ success: true, data: T }`.
 * Frontends consistently read `res.data.data`. Centralizing the shape lets every
 * consumer type its API calls the same way.
 */

export interface ApiError {
  /** Machine-readable error code (e.g. 'INVALID_API_KEY'). */
  code?: string
  message: string
  details?: unknown
}

/** Standard success/response envelope returned by the BotUyo backend. */
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
  error?: ApiError
}

/** Shape used by list endpoints that paginate. */
export interface PaginatedData<T> {
  items: T[]
  total: number
  page?: number
  pageSize?: number
  hasMore?: boolean
}

/** Convenience alias for a paginated API response. */
export type PaginatedResponse<T> = ApiResponse<PaginatedData<T>>
