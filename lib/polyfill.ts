// Polyfill for TextEncoder and TextDecoder in Node.js environments
if (typeof global.TextDecoder === "undefined") {
  import("util").then(({ TextDecoder, TextEncoder }) => {
    (
      globalThis as {
        TextDecoder?: typeof TextDecoder;
        TextEncoder?: typeof TextEncoder;
      }
    ).TextDecoder = TextDecoder;
    (
      globalThis as {
        TextDecoder?: typeof TextDecoder;
        TextEncoder?: typeof TextEncoder;
      }
    ).TextEncoder = TextEncoder;
  });
}
