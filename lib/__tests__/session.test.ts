import { getSessionId } from "../session";

// Mock implementations
const mockGet = jest.fn();
const mockSet = jest.fn();
const mockDelete = jest.fn();

// Mock cookies module
jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      get: mockGet,
      set: mockSet,
      delete: mockDelete,
    })
  ),
}));

// Mock randomUUID
jest.mock("crypto", () => ({
  randomUUID: jest.fn(() => "mocked-uuid"),
}));

describe("Session Module", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockReturnValue(undefined);
  });

  const SESSION_ID = "pokemon_user_id";
  const MAX_AGE = 60 * 60 * 24 * 365; // 1 year max

  test("should create a new session", async () => {
    const sessionId = await getSessionId();

    expect(sessionId).toBe("user_mocked-uuid");
    expect(mockGet).toHaveBeenCalledWith(SESSION_ID);
    expect(mockSet).toHaveBeenCalledWith(SESSION_ID, "user_mocked-uuid", {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: MAX_AGE,
      path: "/",
    });
  });

  test("should retrieve an existing session", () => {
    mockGet.mockReturnValue({ value: "existing-session-id" });

    return getSessionId().then((sessionId) => {
      expect(sessionId).toBe("existing-session-id");
      expect(mockGet).toHaveBeenCalledWith(SESSION_ID);
      expect(mockSet).not.toHaveBeenCalled();
    });
  });

  test("should invalidate a session", () => {
    return getSessionId().then(async (sessionId) => {
      expect(sessionId).toBe("user_mocked-uuid");

      await mockDelete(SESSION_ID);

      expect(mockDelete).toHaveBeenCalledWith(SESSION_ID);
    });
  });
});
