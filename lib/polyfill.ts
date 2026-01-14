/**
 * Polyfills Node.js TextDecoder/TextEncoder for Cloudflare/Edge runtime
 * Required for @neondatabase/serverless driver
 */
export async function applyPolyfills(): Promise<void> {
  if (typeof globalThis.TextDecoder === "undefined") {
    const { TextDecoder, TextEncoder } = await import("util");

    const global = globalThis as {
      TextDecoder?: typeof TextDecoder;
      TextEncoder?: typeof TextEncoder;
    };
    global.TextDecoder = TextDecoder;
    global.TextEncoder = TextEncoder;
  }
}
