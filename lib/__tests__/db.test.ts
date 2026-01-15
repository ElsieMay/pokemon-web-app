import { query, getPool } from "../db";
import { Pool } from "@neondatabase/serverless";

jest.mock("@neondatabase/serverless");
jest.mock("../env", () => ({
  env: {
    DATABASE_URL: "postgresql://test:test@localhost:5432/test",
    DB_IDLE_TIMEOUT: 60000,
    NODE_ENV: "test",
  },
}));

describe("Database Module", () => {
  let mockPool: { connect: jest.Mock };
  let mockConnect: jest.Mock;
  let mockQuery: jest.Mock;
  let mockRelease: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    mockQuery = jest.fn();
    mockRelease = jest.fn();
    mockConnect = jest.fn().mockResolvedValue({
      query: mockQuery,
      release: mockRelease,
    });

    mockPool = {
      connect: mockConnect,
    };

    (Pool as unknown as jest.Mock).mockImplementation(() => mockPool);
  });

  it("should create a new pool if none exists", () => {
    const pool1 = getPool();
    const pool2 = getPool();
    expect(pool1).toBe(pool2);
  });

  it("should execute a successful query", async () => {
    mockQuery.mockResolvedValue({ rows: [{ id: 1, name: "Test" }] });

    const result = await query("SELECT * FROM test_table");

    expect(result).toEqual([{ id: 1, name: "Test" }]);
    expect(mockConnect).toHaveBeenCalledTimes(1);
    expect(mockQuery).toHaveBeenCalledWith("SELECT * FROM test_table", []);
    expect(mockRelease).toHaveBeenCalledTimes(1);
  });
});
