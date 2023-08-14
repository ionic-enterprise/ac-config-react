import { vi } from "vitest";

export const getProviderOptions = vi.fn().mockResolvedValue(undefined);
export const getFlow = vi.fn().mockResolvedValue(undefined);
export const getProvider = vi.fn().mockResolvedValue(undefined);
export const getAuthResult = vi.fn().mockResolvedValue(undefined);
export const storeConfig = vi.fn().mockResolvedValue(undefined);
export const storeAuthResult = vi.fn().mockResolvedValue(undefined);
export const clearAuthResult = vi.fn().mockResolvedValue(undefined);
