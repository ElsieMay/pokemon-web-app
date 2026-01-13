/**
 * Custom error class for Pokemon fetch operations.
 * @example
 * ```ts
 * throw new PokemonFetchError("Failed to fetch data", 404);
 * ```
 */
export class PokemonFetchError extends Error {
  /**
   * @param message - Error message
   * @param status - HTTP status code
   */
  constructor(message: string, public status: number) {
    super(message);
    this.name = "PokemonFetchError";
  }
}

/**
 * Custom error class for Translation fetch operations.
 * @example
 * ```ts
 * throw new TranslationFetchError("Failed to fetch translation", 503);
 * ```
 */
export class TranslationFetchError extends Error {
  /**
   * @param message - Error message
   * @param status - HTTP status code
   */
  constructor(message: string, public status: number) {
    super(message);
    this.name = "TranslationFetchError";
  }
}

/**
 * Custom error class for storing favourite Pokemon operations.
 * @example
 * ```ts
 * throw new FavouriteStoreError("Failed to store favourite", 500);
 * ```
 */
export class FavouriteStoreError extends Error {
  /**
   * @param message - Error message
   * @param status - HTTP status code
   */
  constructor(message: string, public status: number) {
    super(message);
    this.name = "FavouriteStoreError";
  }
}
