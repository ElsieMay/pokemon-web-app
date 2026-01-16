describe("env variables", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("should use test defaults", async () => {
    process.env.JEST_WORKER_ID = "1";
    delete process.env.DATABASE_URL;

    const { env } = await import("../env");

    expect(env.DATABASE_URL).toBe(
      "postgresql://test:test@localhost:5432/test_db"
    );
    expect(env.NODE_ENV).toBe("test");
  });

  it("validates required env variables and returns result", async () => {
    delete process.env.JEST_WORKER_ID;
    delete process.env.DATABASE_URL;

    const consoleErrorSpy = jest
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const processExitSpy = jest.spyOn(process, "exit").mockImplementation(((
      code?: number
    ) => {
      throw new Error(`process.exit: ${code}`);
    }) as never);

    await expect(async () => {
      await import("../env");
    }).rejects.toThrow("process.exit: 1");

    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(processExitSpy).toHaveBeenCalledWith(1);

    consoleErrorSpy.mockRestore();
    processExitSpy.mockRestore();

    process.env.DATABASE_URL = "postgresql://user:pass@localhost:5432/db";

    const { env } = await import("../env");

    expect(env.DATABASE_URL).toBe("postgresql://user:pass@localhost:5432/db");
  });
});
