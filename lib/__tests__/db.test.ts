import { getNeonPool, query } from "../db";
import { Pool } from "@neondatabase/serverless";

jest.mock("@neondatabase/serverless");

const mockQuery = jest.fn();
const mockPool = {
  query: mockQuery,
} as unknown as Pool;

const MockedPool = Pool as jest.MockedClass<typeof Pool>;

describe("Database Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    MockedPool.mockImplementation(() => mockPool);
  });

  const originalEnv = process.env.DATABASE_URL;
  const testUrl = "postgresql://user:password@localhost:5432/dbname";

  // DB URL not set test
  it("should throw an error if DATABASE_URL is not set", () => {
    delete process.env.DATABASE_URL;

    expect(() => {
      getNeonPool();
    }).toThrow("DATABASE_URL environment variable is not set");

    process.env.DATABASE_URL = originalEnv;
  });

  //   Pool creation test
  it("should create a Pool with the correct connection string", () => {
    process.env.DATABASE_URL = testUrl;

    getNeonPool();

    expect(Pool).toHaveBeenCalledWith({
      connectionString: testUrl,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 60000,
      max: 5,
    });

    process.env.DATABASE_URL = originalEnv;
  });

  //   getNeonPool should return the same pool instance
  it("should return the same pool instance on multiple calls", () => {
    const pool1 = getNeonPool();
    const pool2 = getNeonPool();

    expect(pool1).toBe(pool2);

    process.env.DATABASE_URL = originalEnv;
  });

  // SQL query execution test
  it("should execute a SQL query and return results", async () => {
    const sampleRows = [
      { id: 1, name: "Test" },
      { id: 2, name: "Demo" },
    ];
    mockQuery.mockResolvedValue({ rows: sampleRows });

    const sql = "SELECT id, name FROM test_table WHERE id = $1";
    const params = [1];

    const result = await query<{ id: number; name: string }>(sql, params);

    expect(mockQuery).toHaveBeenCalledWith(sql, params);
    expect(result).toEqual(sampleRows);

    process.env.DATABASE_URL = originalEnv;
  });
});
