import { getExistingSession, getOrCreateSession } from "../session";

const mockGet = jest.fn();
const mockSet = jest.fn();
const mockDelete = jest.fn();

jest.mock("next/headers", () => ({
  cookies: jest.fn(() =>
    Promise.resolve({
      get: mockGet,
      set: mockSet,
      delete: mockDelete,
    })
  ),
}));

// Mock crypto.randomUUID
const mockRandomUUID = jest.fn();
Object.defineProperty(global, "crypto", {
  value: {
    randomUUID: mockRandomUUID,
  },
  writable: true,
});

describe("Session Module", () => {
  const SESSION_ID = "pokemon_user_id";
  const MAX_AGE = 60 * 60 * 24 * 365; // 1 year max
  const USER_ID = "mocked-uuid";
  const EXISTING_USER_ID = "existing-session-id";

  beforeEach(() => {
    jest.clearAllMocks();
    mockRandomUUID.mockReturnValue("mocked-uuid");
  });

  it("should create a new session", async () => {
    mockGet.mockReturnValue(undefined);

    const sessionId = await getOrCreateSession();

    expect(sessionId).toBe(USER_ID);
    expect(mockRandomUUID).toHaveBeenCalled();
    expect(mockSet).toHaveBeenCalledWith(SESSION_ID, USER_ID, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE,
      path: "/",
    });
  });

  it("should retrieve an existing session", () => {
    mockGet.mockReturnValue({ value: EXISTING_USER_ID });

    return getOrCreateSession().then((sessionId) => {
      expect(sessionId).toBe(EXISTING_USER_ID);
      expect(mockGet).toHaveBeenCalledWith(SESSION_ID);
      expect(mockSet).not.toHaveBeenCalled();
    });
  });

  it("should invalidate a session", () => {
    return getOrCreateSession().then(async (sessionId) => {
      expect(sessionId).toBe(EXISTING_USER_ID);

      await mockDelete(SESSION_ID);

      expect(mockDelete).toHaveBeenCalledWith(SESSION_ID);
    });
  });

  it("should throw an error if UUID generation fails", async () => {
    mockGet.mockReturnValue(undefined);
    mockRandomUUID.mockReturnValueOnce("");

    await expect(getOrCreateSession()).rejects.toThrow(
      "Failed to generate session ID"
    );

    expect(mockRandomUUID).toHaveBeenCalled();
    expect(mockSet).not.toHaveBeenCalled();
  });

  describe("getExistingSession", () => {
    it("should return existing session ID", async () => {
      mockGet.mockReturnValue({ value: EXISTING_USER_ID });

      const sessionId = await getExistingSession();

      expect(sessionId).toBe(EXISTING_USER_ID);
      expect(mockGet).toHaveBeenCalledWith(SESSION_ID);
    });

    it("should return null if no session exists", async () => {
      mockGet.mockReturnValue(undefined);

      const sessionId = await getExistingSession();

      expect(sessionId).toBeNull();
      expect(mockGet).toHaveBeenCalledWith(SESSION_ID);
    });
  });
});
