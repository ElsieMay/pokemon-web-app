describe("Polyfill Module", () => {
  it("should add TextDecoder and TextEncoder to globalThis when undefined", async () => {
    await jest.isolateModulesAsync(async () => {
      // Remove them within isolated module context
      delete (global as Record<string, unknown>).TextEncoder;
      delete (global as Record<string, unknown>).TextDecoder;

      Object.defineProperty(global, "TextEncoder", {
        value: undefined,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(global, "TextDecoder", {
        value: undefined,
        writable: true,
        configurable: true,
      });

      expect(global.TextEncoder).toBeUndefined();
      expect(global.TextDecoder).toBeUndefined();

      // Import and apply the polyfill
      const { applyPolyfills } = await import("../polyfill");
      await applyPolyfills();

      expect(global.TextEncoder).toBeDefined();
      expect(global.TextDecoder).toBeDefined();
    });
  });

  it("should not override existing TextDecoder and TextEncoder", async () => {
    await jest.isolateModulesAsync(async () => {
      const mockEncoder = {} as typeof TextEncoder;
      const mockDecoder = {} as typeof TextDecoder;

      delete (global as Record<string, unknown>).TextEncoder;
      delete (global as Record<string, unknown>).TextDecoder;

      Object.defineProperty(global, "TextEncoder", {
        value: mockEncoder,
        writable: true,
        configurable: true,
      });
      Object.defineProperty(global, "TextDecoder", {
        value: mockDecoder,
        writable: true,
        configurable: true,
      });

      // Import and apply the polyfill
      const { applyPolyfills } = await import("../polyfill");
      await applyPolyfills();

      expect(global.TextEncoder).toBe(mockEncoder);
      expect(global.TextDecoder).toBe(mockDecoder);
    });
  });
});
