import { vi } from "vitest";

export const useAuth = vi.fn(() => ({
  session: null,
  flow: null,
  provider: null,
  options: null,
  updateAuthConfig: vi.fn().mockResolvedValue(undefined),
}));
