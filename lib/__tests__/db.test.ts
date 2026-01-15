import { getPool, query } from "@/lib/db";
import { Pool } from "@neondatabase/serverless";

jest.mock("@neondatabase/serverless", () => {
  const mPool = {
    connect: jest.fn(),
  };
  return {
    Pool: jest.fn(() => mPool),
  };
});

beforeAll(() => {
  process.env.DATABASE_URL = "postgres://test@localhost/db";
  process.env.DB_POOL_MAX = "1";
  process.env.DB_IDLE_TIMEOUT = "30000";
});

describe("Neon DB Module", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.resetAllMocks();
  });

  describe("getPool()", () => {
    it("creates pool with correct serverless config", () => {
      const pool = getPool();
      expect(pool).toBeDefined();
      expect(Pool).toHaveBeenCalledWith({
        connectionString: "postgresql://test:test@localhost:5432/test_db",
        max: 5,
        idleTimeoutMillis: 60000,
        connectionTimeoutMillis: 10000,
      });
    });

    it("returns same pool instance (singleton)", () => {
      const pool1 = getPool();
      const pool2 = getPool();
      expect(pool1).toBe(pool2);
    });
  });

  describe("query()", () => {
    it("executes query successfully", async () => {
      const mockClient = {
        query: jest.fn().mockResolvedValue({ rows: [{ id: 1, name: "Test" }] }),
        release: jest.fn(),
      };

      const mockConnect = jest.fn().mockResolvedValue(mockClient);

      // Mock the Pool to return a pool with our mock connect function
      (Pool as jest.MockedClass<typeof Pool>).mockImplementation(
        () =>
          ({
            connect: mockConnect,
          } as unknown as Pool)
      );

      const result = await query<{ id: number; name: string }>(
        "SELECT id, name FROM users WHERE id = $1",
        [1]
      );

      expect(result).toEqual([{ id: 1, name: "Test" }]);
      expect(mockClient.query).toHaveBeenCalledWith(
        "SELECT id, name FROM users WHERE id = $1",
        [1]
      );
      expect(mockClient.release).toHaveBeenCalled();
    });
  });

  it("should throw an error after max retries on query failure", async () => {
    const mockClient = {
      query: jest.fn().mockRejectedValue(new Error("Connection error")),
      release: jest.fn(),
    };

    const mockConnect = jest.fn().mockResolvedValue(mockClient);

    (Pool as jest.MockedClass<typeof Pool>).mockImplementation(
      () =>
        ({
          connect: mockConnect,
        } as unknown as Pool)
    );

    await expect(
      query("SELECT id, name FROM users WHERE id = $1", [1])
    ).rejects.toThrow("Database operation failed");

    expect(mockConnect).toHaveBeenCalledTimes(1);
  });
});
