import { Capacitor } from "@capacitor/core";
import {
  AuthConnect,
  CognitoProvider,
  ProviderOptions,
} from "@ionic-enterprise/auth";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React, { useState } from "react";
import { Mock, beforeEach, describe, expect, it, vi } from "vitest";
import {
  Flow,
  Provider,
  auth0Config,
  awsConfig,
  azureConfig,
  flows,
  providers,
  webConfig,
} from "../../util/auth-config";
import {
  clearAuthResult,
  getAuthResult,
  getFlow,
  getProvider,
  getProviderOptions,
  storeAuthResult,
  storeConfig,
} from "../../util/auth-store";
import { useAuth } from "./AuthContext";
import AuthProvider from "./AuthProvider";

vi.mock("@capacitor/core");
vi.mock("../../util/auth-store");
vi.mock("@ionic-enterprise/auth");

(Capacitor.isNativePlatform as Mock).mockReturnValue(true);

const expectOptions = async (expected: ProviderOptions): Promise<void> => {
  const audience = await screen.findByTestId("audience");
  const clientId = await screen.findByTestId("clientId");
  const discoveryUrl = await screen.findByTestId("discoveryUrl");
  const redirectUri = await screen.findByTestId("redirectUri");
  const logoutUrl = await screen.findByTestId("logoutUrl");
  const scope = await screen.findByTestId("scope");
  expect(audience.textContent).toEqual(expected.audience);
  expect(clientId.textContent).toEqual(expected.clientId);
  expect(discoveryUrl.textContent).toEqual(expected.discoveryUrl);
  expect(redirectUri.textContent).toEqual(expected.redirectUri);
  expect(logoutUrl.textContent).toEqual(expected.logoutUrl);
  expect(scope.textContent).toEqual(expected.scope);
};

describe("<AuthProvider />", () => {
  let testProviderOptions: ProviderOptions;
  let testProvider: Provider;
  let testFlow: Flow;

  const TestHarness: React.FC = () => {
    const [refreshIsAvailable, setRefreshIsAvailable] = useState(false);
    const {
      isSetup,
      provider,
      flow,
      options,
      session,
      canRefresh,
      login,
      logout,
      refresh,
      updateAuthConfig,
    } = useAuth();

    return (
      <div>
        {isSetup && <div data-testid="ready"></div>}
        {isSetup && session && <div data-testid="loggedIn"></div>}
        {isSetup && <div data-testid="provider">{provider?.key}</div>}
        {isSetup && <div data-testid="flow">{flow?.key}</div>}
        {isSetup && <div data-testid="audience">{options?.audience}</div>}
        {isSetup && <div data-testid="clientId">{options?.clientId}</div>}
        {isSetup && (
          <div data-testid="discoveryUrl">{options?.discoveryUrl}</div>
        )}
        {isSetup && <div data-testid="redirectUri">{options?.redirectUri}</div>}
        {isSetup && <div data-testid="logoutUrl">{options?.logoutUrl}</div>}
        {isSetup && <div data-testid="scope">{options?.scope}</div>}
        {isSetup && (
          <div data-testid="refreshAvailable">
            {refreshIsAvailable?.toString()}
          </div>
        )}
        {isSetup && (
          <button
            onClick={() =>
              updateAuthConfig(testProviderOptions, testProvider, testFlow)
            }
            data-testid="updateButton"
          ></button>
        )}
        {isSetup && (
          <button onClick={() => login()} data-testid="loginButton"></button>
        )}
        {isSetup && (
          <button onClick={() => logout()} data-testid="logoutButton"></button>
        )}
        {isSetup && (
          <button
            onClick={async () => setRefreshIsAvailable(await canRefresh())}
            data-testid="checkRefreshButton"
          ></button>
        )}
        {isSetup && (
          <button
            onClick={() => refresh()}
            data-testid="refreshButton"
          ></button>
        )}
      </div>
    );
  };

  const renderTestHarness = () =>
    render(
      <AuthProvider>
        <TestHarness />
      </AuthProvider>,
    );

  const testSession = {
    accessToken: "test-access-token",
    refreshToken: "test-refresh-token",
    idToken: "test-id-token",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (AuthConnect.setup as Mock).mockResolvedValue(undefined);
  });

  describe("update auth config", () => {
    beforeEach(() => {
      testProviderOptions = azureConfig;
      testProvider = providers.find((p) => p.key === "azure") as Provider;
      testFlow = flows.find((f) => f.key === "implicit") as Flow;
    });

    it("sets the options", async () => {
      renderTestHarness();
      const button = await screen.findByTestId("updateButton");
      fireEvent.click(button);
      await expectOptions(azureConfig);
    });

    it("sets the provider", async () => {
      renderTestHarness();
      const button = await screen.findByTestId("updateButton");
      fireEvent.click(button);
      const provider = await screen.findByTestId("provider");
      expect(provider.textContent).toEqual("azure");
    });

    it("sets the flow", async () => {
      renderTestHarness();
      const button = await screen.findByTestId("updateButton");
      fireEvent.click(button);
      const flow = await screen.findByTestId("flow");
      expect(flow.textContent).toEqual("implicit");
    });

    it("stores the config", async () => {
      renderTestHarness();
      const button = await screen.findByTestId("updateButton");
      fireEvent.click(button);
      await waitFor(() =>
        expect(storeConfig).toHaveBeenCalledWith(
          testProvider,
          testProviderOptions,
          testFlow,
        ),
      );
    });

    it("sets up AC again", async () => {
      renderTestHarness();
      const button = await screen.findByTestId("updateButton");
      expect(AuthConnect.setup).toHaveBeenCalledTimes(1);
      fireEvent.click(button);
      await waitFor(() => expect(AuthConnect.setup).toHaveBeenCalledTimes(3));
    });
  });

  describe("login", () => {
    beforeEach(() => {
      (AuthConnect.login as Mock).mockResolvedValue(testSession);
    });

    it("performs the login", async () => {
      renderTestHarness();
      const button = await screen.findByTestId("loginButton");
      fireEvent.click(button);
      await waitFor(() => expect(AuthConnect.login).toHaveBeenCalledTimes(1));
      expect(AuthConnect.login).toHaveBeenCalledWith(
        expect.any(CognitoProvider),
        awsConfig,
      );
    });

    it("saves the auth result", async () => {
      renderTestHarness();
      const button = await screen.findByTestId("loginButton");
      fireEvent.click(button);
      await waitFor(() => expect(storeAuthResult).toHaveBeenCalledTimes(1));
      await waitFor(() =>
        expect(storeAuthResult).toHaveBeenCalledWith(testSession),
      );
    });

    it("sets the session", async () => {
      renderTestHarness();
      const button = await screen.findByTestId("loginButton");
      fireEvent.click(button);
      await screen.findByTestId("loggedIn");
    });
  });

  describe("logout", () => {
    beforeEach(async () => {
      (AuthConnect.login as Mock).mockResolvedValue(testSession);
      renderTestHarness();
      const button = await screen.findByTestId("loginButton");
      fireEvent.click(button);
      await waitFor(() => expect(storeAuthResult).toHaveBeenCalledOnce());
      vi.clearAllMocks();
    });

    it("performs the logout", async () => {
      renderTestHarness();
      const button = await screen.findByTestId("logoutButton");
      fireEvent.click(button);
      await waitFor(() => expect(AuthConnect.logout).toHaveBeenCalledOnce());
      expect(AuthConnect.logout).toHaveBeenCalledWith(
        expect.any(CognitoProvider),
        testSession,
      );
    });

    it("clears the auth result", async () => {
      renderTestHarness();
      const button = await screen.findByTestId("logoutButton");
      fireEvent.click(button);
      await waitFor(() => expect(clearAuthResult).toHaveBeenCalledOnce());
    });
  });

  describe("an refresh", () => {
    describe("when logged in", () => {
      beforeEach(async () => {
        (AuthConnect.login as Mock).mockResolvedValue(testSession);
        renderTestHarness();
        const button = await screen.findByTestId("loginButton");
        fireEvent.click(button);
        await waitFor(() => expect(storeAuthResult).toHaveBeenCalledOnce());
        vi.clearAllMocks();
      });

      it("checks if a refresh token is available", async () => {
        const button = await screen.findByTestId("checkRefreshButton");
        fireEvent.click(button);
        await waitFor(() =>
          expect(AuthConnect.isRefreshTokenAvailable).toHaveBeenCalledOnce(),
        );
        expect(AuthConnect.isRefreshTokenAvailable).toHaveBeenCalledWith(
          testSession,
        );
      });

      it("resolves true if a refresh token is available", async () => {
        (AuthConnect.isRefreshTokenAvailable as Mock).mockResolvedValue(true);
        const button = await screen.findByTestId("checkRefreshButton");
        fireEvent.click(button);
        const flag = await screen.findByTestId("refreshAvailable");
        expect(flag.textContent).toEqual("true");
      });

      it("resolves false if a refresh token is not available", async () => {
        (AuthConnect.isRefreshTokenAvailable as Mock).mockResolvedValue(false);
        const button = await screen.findByTestId("checkRefreshButton");
        fireEvent.click(button);
        const flag = await screen.findByTestId("refreshAvailable");
        expect(flag.textContent).toEqual("false");
      });
    });

    describe("when not logged in", () => {
      beforeEach(async () => {
        renderTestHarness();
        vi.clearAllMocks();
      });

      it("resolves false without checking", async () => {
        (AuthConnect.isRefreshTokenAvailable as Mock).mockResolvedValue(true);
        const button = await screen.findByTestId("checkRefreshButton");
        fireEvent.click(button);
        const flag = await screen.findByTestId("refreshAvailable");
        expect(flag.textContent).toEqual("false");
        expect(AuthConnect.isRefreshTokenAvailable).not.toHaveBeenCalled();
      });
    });
  });

  describe("initialization", () => {
    it("gets the current auth result", async () => {
      renderTestHarness();
      await screen.findByTestId("ready");
      expect(getAuthResult).toHaveBeenCalledOnce();
    });

    it("sets te session", async () => {
      (getAuthResult as Mock).mockResolvedValue(testSession);
      renderTestHarness();
      await screen.findByTestId("loggedIn");
    });

    it("gets the provider options", async () => {
      renderTestHarness();
      await screen.findByTestId("ready");
      expect(getProviderOptions).toHaveBeenCalledOnce();
    });

    it("sets the provider options", async () => {
      (getProviderOptions as Mock).mockResolvedValue(auth0Config);
      renderTestHarness();
      await expectOptions(auth0Config);
    });

    describe("when there are no options set", () => {
      beforeEach(() => {
        (getProviderOptions as Mock).mockResolvedValue(undefined);
      });

      describe("on mobile", () => {
        beforeEach(() => {
          (Capacitor.isNativePlatform as Mock).mockReturnValue(true);
        });

        it("defaults to AWS", async () => {
          renderTestHarness();
          await expectOptions(awsConfig);
        });
      });

      describe("on web", () => {
        beforeEach(() => {
          (Capacitor.isNativePlatform as Mock).mockReturnValue(false);
        });

        it("defaults to AWS with the web config", async () => {
          renderTestHarness();
          await expectOptions({ ...awsConfig, ...webConfig });
        });
      });
    });

    it("gets the flow", async () => {
      renderTestHarness();
      await screen.findByTestId("ready");
      expect(getFlow).toHaveBeenCalledTimes(1);
    });

    it("sets the flow", async () => {
      (getFlow as Mock).mockResolvedValue(flows[0]);
      renderTestHarness();
      const flow = await screen.findByTestId("flow");
      expect(flow.textContent).toEqual(flows[0].key);
    });

    it("defaults to PKCE", async () => {
      (getFlow as Mock).mockResolvedValue(undefined);
      renderTestHarness();
      const flow = await screen.findByTestId("flow");
      expect(flow.textContent).toEqual("PKCE");
    });

    it("gets the provider", async () => {
      renderTestHarness();
      await screen.findByTestId("ready");
      expect(getProvider).toHaveBeenCalledTimes(1);
    });

    it("sets the provider", async () => {
      (getProvider as Mock).mockResolvedValue(providers[1]);
      renderTestHarness();
      const provider = await screen.findByTestId("provider");
      expect(provider.textContent).toEqual(providers[1].key);
    });

    it("defaults to congnito", async () => {
      (getProvider as Mock).mockResolvedValue(undefined);
      renderTestHarness();
      const provider = await screen.findByTestId("provider");
      expect(provider.textContent).toEqual("cognito");
    });

    describe("auth connect setup", () => {
      describe("on mobile", () => {
        beforeEach(() => {
          (Capacitor.isNativePlatform as Mock).mockReturnValue(true);
        });

        it("uses the AWS defaults on mobile if nothing is saved", async () => {
          (getProvider as Mock).mockResolvedValue(undefined);
          (getProviderOptions as Mock).mockResolvedValue(undefined);
          (getFlow as Mock).mockResolvedValue(undefined);
          renderTestHarness();
          await screen.findByTestId("ready");
          expect(AuthConnect.setup).toHaveBeenCalledOnce();
          expect(AuthConnect.setup).toHaveBeenCalledWith({
            logLevel: "DEBUG",
            platform: "capacitor",
            ios: {
              webView: "private",
            },
            web: {
              uiMode: "popup",
              authFlow: "PKCE",
            },
          });
        });

        it("uses the stored flow", async () => {
          (getFlow as Mock).mockResolvedValue(
            flows.find((f) => f.key === "implicit"),
          );
          renderTestHarness();
          await screen.findByTestId("ready");
          expect(AuthConnect.setup).toHaveBeenCalledOnce();
          expect(AuthConnect.setup).toHaveBeenCalledWith({
            logLevel: "DEBUG",
            platform: "capacitor",
            ios: {
              webView: "private",
            },
            web: {
              uiMode: "popup",
              authFlow: "implicit",
            },
          });
        });
      });

      describe("on web", () => {
        beforeEach(() => {
          (Capacitor.isNativePlatform as Mock).mockReturnValue(false);
        });

        it("uses the AWS defaults on mobile if nothing is saved", async () => {
          (getProvider as Mock).mockResolvedValue(undefined);
          (getProviderOptions as Mock).mockResolvedValue(undefined);
          (getFlow as Mock).mockResolvedValue(undefined);
          renderTestHarness();
          await screen.findByTestId("ready");
          expect(AuthConnect.setup).toHaveBeenCalledOnce();
          expect(AuthConnect.setup).toHaveBeenCalledWith({
            logLevel: "DEBUG",
            platform: "web",
            ios: {
              webView: "private",
            },
            web: {
              uiMode: "popup",
              authFlow: "PKCE",
            },
          });
        });

        it("uses the stored flow", async () => {
          (getFlow as Mock).mockResolvedValue(
            flows.find((f) => f.key === "implicit"),
          );
          renderTestHarness();
          await screen.findByTestId("ready");
          expect(AuthConnect.setup).toHaveBeenCalledOnce();
          expect(AuthConnect.setup).toHaveBeenCalledWith({
            logLevel: "DEBUG",
            platform: "web",
            ios: {
              webView: "private",
            },
            web: {
              uiMode: "popup",
              authFlow: "implicit",
            },
          });
        });
      });
    });
  });
});
