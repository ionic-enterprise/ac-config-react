import { Preferences } from "@capacitor/preferences";
import { Mock, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAuthResult,
  getAuthResult,
  getFlow,
  getProvider,
  getProviderOptions,
  resetCache,
  storeAuthResult,
  storeConfig,
} from "./auth-store";
import { AuthResult, ProviderOptions } from "@ionic-enterprise/auth";
import { flows, providers } from "./auth-config";

vi.mock("@capacitor/preferences");

describe("auth storage", () => {
  const opt: ProviderOptions = {
    clientId: "4273afw",
    discoveryUrl: "https://some.azure.server/.well-known/openid-configuration",
    redirectUri: "msauth://login",
    logoutUrl: "msauth://login",
    scope: "openid email profile",
    audience: "all-the-users",
  };

  const testSession = {
    accessToken: "test-access-token",
    refreshToken: "test-refresh-token",
    idToken: "test-id-token",
  };

  beforeEach(() => {
    resetCache();
    vi.resetAllMocks();
    (Preferences.get as Mock).mockResolvedValue({ value: null });
  });

  describe("get provider options", () => {
    it("fetches the options from storage", async () => {
      (Preferences.get as Mock).mockResolvedValue({
        value: JSON.stringify(opt),
      });
      await getProviderOptions();
      expect(Preferences.get).toHaveBeenCalledTimes(1);
      expect(Preferences.get).toHaveBeenCalledWith({
        key: "auth-provider-options",
      });
    });

    it("caches the config", async () => {
      (Preferences.get as Mock).mockResolvedValue({
        value: JSON.stringify(opt),
      });
      await getProviderOptions();
      await getProviderOptions();
      expect(Preferences.get).toHaveBeenCalledTimes(1);
    });

    it("resolves the value", async () => {
      (Preferences.get as Mock).mockResolvedValue({
        value: JSON.stringify(opt),
      });
      expect(await getProviderOptions()).toEqual(opt);
    });

    it("resolves undefined if there is no value", async () => {
      (Preferences.get as Mock).mockResolvedValue({ value: null });
      expect(await getProviderOptions()).toBeUndefined();
    });
  });

  describe("get flow", () => {
    it("fetches the flow from storage", async () => {
      (Preferences.get as Mock).mockResolvedValue({
        value: JSON.stringify(flows[0]),
      });
      await getFlow();
      expect(Preferences.get).toHaveBeenCalledTimes(1);
      expect(Preferences.get).toHaveBeenCalledWith({
        key: "auth-flow",
      });
    });

    it("caches the flow", async () => {
      (Preferences.get as Mock).mockResolvedValue({
        value: JSON.stringify(flows[0]),
      });
      await getFlow();
      await getFlow();
      expect(Preferences.get).toHaveBeenCalledTimes(1);
    });

    it("resolves the value", async () => {
      (Preferences.get as Mock).mockResolvedValue({
        value: JSON.stringify(flows[0]),
      });
      expect(await getFlow()).toEqual(flows[0]);
    });

    it("resolves undefined if there is no value", async () => {
      (Preferences.get as Mock).mockResolvedValue({ value: null });
      expect(await getFlow()).toBeUndefined();
    });
  });

  describe("get provider", () => {
    it("fetches the provider from storage", async () => {
      (Preferences.get as Mock).mockResolvedValue({
        value: JSON.stringify(providers[0]),
      });
      await getProvider();
      expect(Preferences.get).toHaveBeenCalledTimes(1);
      expect(Preferences.get).toHaveBeenCalledWith({
        key: "auth-provider",
      });
    });

    it("caches the provider", async () => {
      (Preferences.get as Mock).mockResolvedValue({
        value: JSON.stringify(providers[0]),
      });
      await getProvider();
      await getProvider();
      expect(Preferences.get).toHaveBeenCalledTimes(1);
    });

    it("resolves the value", async () => {
      (Preferences.get as Mock).mockResolvedValue({
        value: JSON.stringify(providers[2]),
      });
      expect(await getProvider()).toEqual(providers[2]);
    });

    it("resolves undefined if there is no value", async () => {
      (Preferences.get as Mock).mockResolvedValue({ value: null });
      expect(await getProvider()).toBeUndefined();
    });
  });

  describe("get auth result", () => {
    it("fetches the auth result from storage", async () => {
      (Preferences.get as Mock).mockResolvedValue({
        value: JSON.stringify(testSession),
      });
      await getAuthResult();
      expect(Preferences.get).toHaveBeenCalledTimes(1);
      expect(Preferences.get).toHaveBeenCalledWith({
        key: "auth-result",
      });
    });

    it("caches the auth result", async () => {
      (Preferences.get as Mock).mockResolvedValue({
        value: JSON.stringify(testSession),
      });
      await getAuthResult();
      await getAuthResult();
      expect(Preferences.get).toHaveBeenCalledTimes(1);
    });

    it("resolves the value", async () => {
      (Preferences.get as Mock).mockResolvedValue({
        value: JSON.stringify(testSession),
      });
      expect(await getAuthResult()).toEqual(testSession);
    });

    it("resolves undefined if there is no value", async () => {
      (Preferences.get as Mock).mockResolvedValue({ value: null });
      expect(await getAuthResult()).toBeUndefined();
    });
  });

  describe("store auth result", () => {
    it("stores the passed auth result", async () => {
      await storeAuthResult(testSession as AuthResult);
      expect(Preferences.set).toHaveBeenCalledOnce();
      expect(Preferences.set).toHaveBeenCalledWith({
        key: "auth-result",
        value: JSON.stringify(testSession),
      });
    });

    it("caches the auth result", async () => {
      await storeAuthResult(testSession as AuthResult);
      expect(await getAuthResult()).toEqual(testSession);
      expect(Preferences.get).not.toHaveBeenCalled();
    });
  });

  describe("clearAuthResult", () => {
    it("removes the auth result", async () => {
      await clearAuthResult();
      expect(Preferences.remove).toHaveBeenCalledOnce();
      expect(Preferences.remove).toHaveBeenCalledWith({ key: "auth-result" });
    });

    it("clears the auth result from cache", async () => {
      await storeAuthResult(testSession as AuthResult);
      await clearAuthResult();
      await getAuthResult();
      expect(Preferences.get).toHaveBeenCalledOnce();
    });
  });

  describe("store config", () => {
    describe("without a flow", () => {
      it("saves the provider and provider options", async () => {
        await storeConfig(providers[3], opt);
        expect(Preferences.set).toHaveBeenCalledTimes(2);
        expect(Preferences.set).toHaveBeenCalledWith({
          key: "auth-provider",
          value: JSON.stringify(providers[3]),
        });
        expect(Preferences.set).toHaveBeenCalledWith({
          key: "auth-provider-options",
          value: JSON.stringify(opt),
        });
      });

      it("removes any flow", async () => {
        await storeConfig(providers[3], opt);
        expect(Preferences.remove).toHaveBeenCalledTimes(1);
        expect(Preferences.remove).toHaveBeenCalledWith({
          key: "auth-flow",
        });
      });

      it("caches the values", async () => {
        await storeConfig(providers[3], opt);
        expect(await getProvider()).toEqual(providers[3]);
        expect(await getProviderOptions()).toEqual(opt);
        expect(Preferences.get).not.toHaveBeenCalled();
      });
    });

    describe("with a flow", () => {
      it("saves the provider, provider options, and flow", async () => {
        await storeConfig(providers[3], opt, flows[1]);
        expect(Preferences.set).toHaveBeenCalledTimes(3);
        expect(Preferences.set).toHaveBeenCalledWith({
          key: "auth-provider",
          value: JSON.stringify(providers[3]),
        });
        expect(Preferences.set).toHaveBeenCalledWith({
          key: "auth-provider-options",
          value: JSON.stringify(opt),
        });
        expect(Preferences.set).toHaveBeenCalledWith({
          key: "auth-flow",
          value: JSON.stringify(flows[1]),
        });
      });

      it("does not remove anything", async () => {
        await storeConfig(providers[3], opt, flows[1]);
        expect(Preferences.remove).not.toHaveBeenCalled();
      });

      it("caches the values", async () => {
        await storeConfig(providers[3], opt, flows[1]);
        expect(await getProvider()).toEqual(providers[3]);
        expect(await getProviderOptions()).toEqual(opt);
        expect(await getFlow()).toEqual(flows[1]);
        expect(Preferences.get).not.toHaveBeenCalled();
      });
    });
  });
});
