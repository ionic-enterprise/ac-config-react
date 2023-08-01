import { ProviderOptions } from "@ionic-enterprise/auth";
import { isPlatform } from "@ionic/react";
import { act, fireEvent, render } from "@testing-library/react";
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

const expectOptions = async (
  findByTestId: (id: string) => Promise<HTMLElement>,
  expected: ProviderOptions,
): Promise<void> => {
  const audience = await findByTestId("audience");
  const clientId = await findByTestId("clientId");
  const discoveryUrl = await findByTestId("discoveryUrl");
  const redirectUri = await findByTestId("redirectUri");
  const logoutUrl = await findByTestId("logoutUrl");
  const scope = await findByTestId("scope");
  expect(audience.textContent).toEqual(expected.audience);
  expect(clientId.textContent).toEqual(expected.clientId);
  expect(discoveryUrl.textContent).toEqual(expected.discoveryUrl);
  expect(redirectUri.textContent).toEqual(expected.redirectUri);
  expect(logoutUrl.textContent).toEqual(expected.logoutUrl);
  expect(scope.textContent).toEqual(expected.scope);
};

describe("<AuthProvider />", () => {
  const wrapper = ({ children }: any) => (
    <AuthProvider>{children}</AuthProvider>
  );

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
      const { findByTestId } = renderTestHarness();
      const button = await findByTestId("updateButton");
      act(() => fireEvent.click(button));
      await expectOptions(findByTestId, azureConfig);
    });

    it("sets the provider", async () => {
      const { findByTestId } = renderTestHarness();
      const button = await findByTestId("updateButton");
      act(() => fireEvent.click(button));
      const provider = await findByTestId("provider");
      expect(provider.textContent).toEqual("azure");
    });

    it("sets the flow", async () => {
      const { findByTestId } = renderTestHarness();
      const button = await findByTestId("updateButton");
      act(() => fireEvent.click(button));
      const flow = await findByTestId("flow");
      expect(flow.textContent).toEqual("implicit");
    });

    it("stores the config", async () => {
      const { findByTestId } = renderTestHarness();
      const button = await findByTestId("updateButton");
      act(() => fireEvent.click(button));
      expect(storeConfig).toHaveBeenCalledWith(
        testProvider,
        testProviderOptions,
        testFlow,
      );
    });
  });

  describe("initialization", () => {
    it("gets the provider options", async () => {
      const { findByTestId } = renderTestHarness();
      await findByTestId("ready");
      expect(getProviderOptions).toHaveBeenCalledTimes(1);
    });

    it("sets the provider options", async () => {
      (getProviderOptions as Mock).mockResolvedValue(auth0Config);
      const { findByTestId } = renderTestHarness();
      await expectOptions(findByTestId, auth0Config);
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
          const { findByTestId } = renderTestHarness();
          await expectOptions(findByTestId, awsConfig);
        });
      });

      describe("on web", () => {
        beforeEach(() => {
          (isPlatform as Mock).mockReturnValue(false);
        });

        it("defaults to AWS with the web config", async () => {
          const { findByTestId } = renderTestHarness();
          await expectOptions(findByTestId, { ...awsConfig, ...webConfig });
        });
      });
    });

    it("gets the flow", async () => {
      const { findByTestId } = renderTestHarness();
      await findByTestId("ready");
      expect(getFlow).toHaveBeenCalledTimes(1);
    });

    it("sets the flow", async () => {
      (getFlow as Mock).mockResolvedValue(flows[0]);
      const { findByTestId } = renderTestHarness();
      const flow = await findByTestId("flow");
      expect(flow.textContent).toEqual(flows[0].key);
    });

    it("defaults to PKCE", async () => {
      (getFlow as Mock).mockResolvedValue(undefined);
      const { findByTestId } = renderTestHarness();
      const flow = await findByTestId("flow");
      expect(flow.textContent).toEqual("PKCE");
    });

    it("gets the provider", async () => {
      const { findByTestId } = renderTestHarness();
      await findByTestId("ready");
      expect(getProvider).toHaveBeenCalledTimes(1);
    });

    it("sets the provider", async () => {
      (getProvider as Mock).mockResolvedValue(providers[1]);
      const { findByTestId } = renderTestHarness();
      const provider = await findByTestId("provider");
      expect(provider.textContent).toEqual(providers[1].key);
    });

    it("defaults to congnito", async () => {
      (getProvider as Mock).mockResolvedValue(undefined);
      const { findByTestId } = renderTestHarness();
      const provider = await findByTestId("provider");
      expect(provider.textContent).toEqual("cognito");
    });
  });
});
