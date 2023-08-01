import { Preferences } from "@capacitor/preferences";
import { Mock, beforeEach, describe, expect, it, vi } from "vitest";
import {
  getFlow,
  getProvider,
  getProviderOptions,
  resetCache,
  storeConfig,
} from "./auth-store";
import { ProviderOptions } from "@ionic-enterprise/auth";
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

  beforeEach(() => {
    resetCache();
    vi.resetAllMocks();
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
