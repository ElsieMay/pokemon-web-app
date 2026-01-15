/**
 * Custom error class for Pokemon fetch operations.
 * @example
 * ```ts
 * throw new PokemonFetchError("Failed to fetch data", 404);
 * ```
 */
export class PokemonFetchError extends Error {
  constructor(message: string, public status: number, options?: ErrorOptions) {
    super(message, options);
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
  constructor(message: string, public status: number, options?: ErrorOptions) {
    super(message, options);
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
  constructor(message: string, public status: number, options?: ErrorOptions) {
    super(message, options);
    this.name = "FavouriteStoreError";
  }
}
