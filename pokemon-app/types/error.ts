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
