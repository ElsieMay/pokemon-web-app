/**
 * Base interface for all API responses.
 * Contains common fields shared by success and error responses.
 */
interface ApiBaseResponse {
  success: boolean;
  message?: string;
}

/**
 * Type for successful API responses.
 */
export interface ApiSuccessResponse<T> extends ApiBaseResponse {
  success: true;
  data: T;
}

/**
 * Type for failed API responses.
 */
export interface ApiErrorResponse extends ApiBaseResponse {
  success: false;
  error: string;
  status: number;
}

/**
 * Union type for API responses.
 * Use `success` field to narrow the type.
 *
 * @template T - The type of data returned on success
 * @example
 * ```ts
 * const response: ApiResponse<Pokemon[]> = await loadPokemons();
 * ```
 */
export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;
