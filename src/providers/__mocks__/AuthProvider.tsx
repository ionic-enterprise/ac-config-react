import { vi } from "vitest";

export const useAuth = vi.fn(() => ({
  session: null,
  flow: null,
  provider: null,
  options: null,
  canRefresh: vi.fn().mockResolvedValue(false),
  login: vi.fn().mockResolvedValue(undefined),
  logout: vi.fn().mockResolvedValue(undefined),
  updateAuthConfig: vi.fn().mockResolvedValue(undefined),
  refresh: vi.fn().mockResolvedValue(undefined),
}));
