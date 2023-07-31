import { act, renderHook, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import {
  Flow,
  Provider,
  auth0Config,
  awsConfig,
  azureConfig,
  flows,
  providers,
  webConfig,
} from "../util/auth-config";
import {
  getFlow,
  getProvider,
  getProviderOptions,
  storeConfig,
} from "../util/auth-store";
import AuthProvider, { useAuth } from "./AuthProvider";
import { isPlatform } from "@ionic/react";

vi.mock("../util/auth-store");
vi.mock("@ionic/react", async () => {
  const actual = (await vi.importActual("@ionic/react")) as any;
  return { ...actual, isPlatform: vi.fn().mockReturnValue(true) };
});

describe("<AuthProvider />", () => {
  const wrapper = ({ children }: any) => (
    <AuthProvider>{children}</AuthProvider>
  );

  const testSession = {
    accessToken: "test-access-token",
    refreshToken: "test-refresh-token",
    idToken: "test-id-token",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("update auth config", () => {
    it("sets the options", async () => {
      const provider = providers.find((p) => p.key === "azure") as Provider;
      const { result } = await waitFor(() =>
        renderHook(() => useAuth(), { wrapper }),
      );
      await act(
        async () =>
          await result.current.updateAuthConfig(azureConfig, provider),
      );
      expect(result.current.options).toEqual(azureConfig);
    });

    it("sets the provider", async () => {
      const provider = providers.find((p) => p.key === "azure") as Provider;
      const { result } = await waitFor(() =>
        renderHook(() => useAuth(), { wrapper }),
      );
      await act(
        async () =>
          await result.current.updateAuthConfig(azureConfig, provider),
      );
      expect(result.current.provider).toEqual(provider);
    });

    it("sets the flow", async () => {
      const flow = flows.find((f) => f.key === "implicit") as Flow;
      const provider = providers.find((p) => p.key === "azure") as Provider;
      const { result } = await waitFor(() =>
        renderHook(() => useAuth(), { wrapper }),
      );
      await act(
        async () =>
          await result.current.updateAuthConfig(azureConfig, provider, flow),
      );
      expect(result.current.flow).toEqual(flow);
    });

    it("stores the config", async () => {
      const flow = flows.find((f) => f.key === "implicit") as Flow;
      const provider = providers.find((p) => p.key === "azure") as Provider;
      const { result } = await waitFor(() =>
        renderHook(() => useAuth(), { wrapper }),
      );
      await act(
        async () =>
          await result.current.updateAuthConfig(azureConfig, provider, flow),
      );
      expect(storeConfig).toHaveBeenCalledTimes(1);
      expect(storeConfig).toHaveBeenCalledWith(provider, azureConfig, flow);
    });
  });

  describe("initialization", () => {
    it("gets the provider options", async () => {
      await waitFor(() => renderHook(() => useAuth(), { wrapper }));
      expect(getProviderOptions).toHaveBeenCalledTimes(1);
    });

    it("sets the provider options", async () => {
      (getProviderOptions as Mock).mockResolvedValue(auth0Config);
      const { result } = await waitFor(() =>
        renderHook(() => useAuth(), { wrapper }),
      );
      expect(result.current.options).toEqual(auth0Config);
    });

    describe("when there are no options set", () => {
      beforeEach(() => {
        (getProviderOptions as Mock).mockResolvedValue(undefined);
      });

      describe("on mobile", () => {
        beforeEach(() => {
          (isPlatform as Mock).mockReturnValue(true);
        });

        it("defaults to AWS", async () => {
          const { result } = await waitFor(() =>
            renderHook(() => useAuth(), { wrapper }),
          );
          expect(result.current.options).toEqual(awsConfig);
        });
      });

      describe("on web", () => {
        beforeEach(() => {
          (isPlatform as Mock).mockReturnValue(false);
        });

        it("defaults to AWS with the web config", async () => {
          const { result } = await waitFor(() =>
            renderHook(() => useAuth(), { wrapper }),
          );
          expect(result.current.options).toEqual({
            ...awsConfig,
            ...webConfig,
          });
        });
      });
    });

    it("gets the flow", async () => {
      await waitFor(() => renderHook(() => useAuth(), { wrapper }));
      expect(getFlow).toHaveBeenCalledTimes(1);
    });

    it("sets the flow", async () => {
      (getFlow as Mock).mockResolvedValue(flows[0]);
      const { result } = await waitFor(() =>
        renderHook(() => useAuth(), { wrapper }),
      );
      expect(result.current.flow).toEqual(flows[0]);
    });

    it("defaults to PKCE", async () => {
      (getFlow as Mock).mockResolvedValue(undefined);
      const { result } = await waitFor(() =>
        renderHook(() => useAuth(), { wrapper }),
      );
      expect(result.current.flow).toEqual(flows.find((f) => f.key === "PKCE"));
    });

    it("gets the provider", async () => {
      await waitFor(() => renderHook(() => useAuth(), { wrapper }));
      expect(getProvider).toHaveBeenCalledTimes(1);
    });

    it("sets the provider", async () => {
      (getProvider as Mock).mockResolvedValue(providers[1]);
      const { result } = await waitFor(() =>
        renderHook(() => useAuth(), { wrapper }),
      );
      expect(result.current.provider).toEqual(providers[1]);
    });

    it("defaults to congnito", async () => {
      (getProvider as Mock).mockResolvedValue(undefined);
      const { result } = await waitFor(() =>
        renderHook(() => useAuth(), { wrapper }),
      );
      expect(result.current.provider).toEqual(
        providers.find((p) => p.key === "cognito"),
      );
    });
  });
});
