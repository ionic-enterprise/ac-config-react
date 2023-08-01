import { ProviderOptions } from "@ionic-enterprise/auth";
import { isPlatform } from "@ionic/react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
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
} from "../util/auth-config";
import {
  getFlow,
  getProvider,
  getProviderOptions,
  storeConfig,
} from "../util/auth-store";
import AuthProvider, { useAuth } from "./AuthProvider";

vi.mock("../util/auth-store");
vi.mock("@ionic/react", async () => {
  const actual = (await vi.importActual("@ionic/react")) as any;
  return { ...actual, isPlatform: vi.fn().mockReturnValue(true) };
});

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
    const { isSetup, provider, flow, options, updateAuthConfig } = useAuth();

    return (
      <div>
        {isSetup && <div data-testid="ready">Ready to test</div>}
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
          <button
            onClick={() =>
              updateAuthConfig(testProviderOptions, testProvider, testFlow)
            }
            data-testid="updateButton"
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
      expect(storeConfig).toHaveBeenCalledWith(
        testProvider,
        testProviderOptions,
        testFlow,
      );
    });
  });

  describe("initialization", () => {
    it("gets the provider options", async () => {
      renderTestHarness();
      await screen.findByTestId("ready");
      expect(getProviderOptions).toHaveBeenCalledTimes(1);
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
          (isPlatform as Mock).mockReturnValue(true);
        });

        it("defaults to AWS", async () => {
          renderTestHarness();
          await expectOptions(awsConfig);
        });
      });

      describe("on web", () => {
        beforeEach(() => {
          (isPlatform as Mock).mockReturnValue(false);
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
  });
});
