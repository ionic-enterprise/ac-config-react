import { isPlatform } from "@ionic/react";
import { fireEvent, render, screen } from "@testing-library/react";
import { Mock, beforeEach, describe, expect, it, vi } from "vitest";
import { useAuth } from "../../providers/AuthProvider";
import {
  auth0Config,
  awsConfig,
  azureConfig,
  flows,
  oktaConfig,
  providers,
  webConfig,
} from "../../util/auth-config";
import SettingsPage from "./SettingsPage";

vi.mock("../../providers/AuthProvider");
vi.mock("../../util/auth");
vi.mock("@ionic/react", async () => {
  const actual = (await vi.importActual("@ionic/react")) as any;
  return { ...actual, isPlatform: vi.fn().mockReturnValue(true) };
});

describe("Settings Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { baseElement } = render(<SettingsPage />);
    expect(baseElement).toBeDefined();
  });

  it("has the correct title", async () => {
    render(<SettingsPage />);
    const title = await screen.findByTestId("page-title");
    expect(title.textContent).toBe("Settings");
  });

  describe("when logged in", () => {
    beforeEach(() => {
      (useAuth as Mock).mockReturnValue({
        options: auth0Config,
        provider: providers.find((p) => p.key === "auth0"),
        flow: flows.find((f) => f.key === "implicit"),
        session: JSON.stringify({
          accessToken: "the-access-token",
          refreshToken: "the-refresh-token",
          idToken: "the-id-token",
        }),
        updateAuthConfig: vi.fn().mockResolvedValue(undefined),
      });
    });

    it("displays a message to logout first", async () => {
      render(<SettingsPage />);
      const message = screen.findByTestId("logout-message");
      expect((await message).textContent?.trim()).toBe("Please log out first");
    });

    it("does not allow swaps", async () => {
      render(<SettingsPage />);
      let button = await screen.findByTestId("use-azure");
      expect((button as HTMLButtonElement).disabled).toBe(true);
      button = await screen.findByTestId("use-aws");
      expect((button as HTMLButtonElement).disabled).toBe(true);
      button = await screen.findByTestId("use-auth0");
      expect((button as HTMLButtonElement).disabled).toBe(true);
      button = await screen.findByTestId("use-okta");
      expect((button as HTMLButtonElement).disabled).toBe(true);
      button = await screen.findByTestId("use-customization");
      expect((button as HTMLButtonElement).disabled).toBe(true);
    });

    describe("provider", () => {
      let input: HTMLElement;
      beforeEach(async () => {
        render(<SettingsPage />);
        input = await screen.findByTestId("provider-input");
      });

      it("is initialized", () => {
        expect((input as HTMLIonInputElement).value).toEqual(
          providers.find((p) => p.key === "auth0"),
        );
      });

      it("is disabled", async () => {
        expect((input as HTMLInputElement).disabled).toBe(true);
      });
    });

    describe("client ID", () => {
      let input: HTMLElement;
      beforeEach(async () => {
        render(<SettingsPage />);
        input = await screen.findByTestId("client-id-input");
      });

      it("is initialized", () => {
        expect((input as HTMLIonInputElement).value).toEqual(
          auth0Config.clientId,
        );
      });

      it("is disabled", async () => {
        expect((input as HTMLInputElement).disabled).toBe(true);
      });
    });

    describe("discovery URL", () => {
      let input: HTMLElement;
      beforeEach(async () => {
        render(<SettingsPage />);
        input = await screen.findByTestId("discovery-url-input");
      });

      it("is initialized", () => {
        expect((input as HTMLIonInputElement).value).toEqual(
          auth0Config.discoveryUrl,
        );
      });

      it("is disabled", () => {
        expect((input as HTMLInputElement).disabled).toBe(true);
      });
    });

    describe("scope", () => {
      let input: HTMLElement;
      beforeEach(async () => {
        render(<SettingsPage />);
        input = await screen.findByTestId("scope-input");
      });

      it("is initialized", () => {
        expect((input as HTMLIonInputElement).value).toEqual(auth0Config.scope);
      });

      it("is disabled", () => {
        expect((input as HTMLInputElement).disabled).toBe(true);
      });
    });

    describe("audience", () => {
      let input: HTMLElement;
      beforeEach(async () => {
        render(<SettingsPage />);
        input = await screen.findByTestId("audience-input");
      });

      it("is initialized", async () => {
        expect((input as HTMLIonInputElement).value).toEqual(
          auth0Config.audience,
        );
      });

      it("is disabled", () => {
        expect((input as HTMLInputElement).disabled).toBe(true);
      });
    });

    describe("flow", () => {
      let input: HTMLElement | null;

      describe("on mobile", () => {
        beforeEach(async () => {
          (isPlatform as Mock).mockReturnValue(true);
          const { queryByTestId } = render(<SettingsPage />);
          input = queryByTestId("flow-input");
        });

        it("is not rendered", () => {
          expect(input).toBeNull();
        });
      });

      describe("on web", () => {
        beforeEach(async () => {
          (isPlatform as Mock).mockReturnValue(false);
          render(<SettingsPage />);
          input = await screen.findByTestId("flow-input");
        });

        it("is initialized", () => {
          expect((input as HTMLIonInputElement).value).toEqual(
            flows.find((f) => f.key === "implicit"),
          );
        });

        it("is disabled", async () => {
          expect((input as HTMLInputElement).disabled).toBe(true);
        });
      });
    });
  });

  describe("when not logged in", () => {
    beforeEach(() => {
      (useAuth as Mock).mockReturnValue({
        options: auth0Config,
        provider: providers.find((p) => p.key === "auth0"),
        flow: flows.find((f) => f.key === "implicit"),
        session: null,
        updateAuthConfig: vi.fn().mockResolvedValue(undefined),
      });
    });

    it("does not display a message to logout first", async () => {
      const { queryByTestId } = render(<SettingsPage />);
      const message = queryByTestId("logout-message");
      expect(message).toBeNull();
    });

    it("allows swaps", async () => {
      render(<SettingsPage />);
      let button = await screen.findByTestId("use-azure");
      expect((button as HTMLButtonElement).disabled).toBe(false);
      button = await screen.findByTestId("use-aws");
      expect((button as HTMLButtonElement).disabled).toBe(false);
      button = await screen.findByTestId("use-auth0");
      expect((button as HTMLButtonElement).disabled).toBe(false);
      button = await screen.findByTestId("use-okta");
      expect((button as HTMLButtonElement).disabled).toBe(false);
      button = await screen.findByTestId("use-customization");
      expect((button as HTMLButtonElement).disabled).toBe(false);
    });

    describe("provider", () => {
      let input: HTMLElement;
      beforeEach(async () => {
        render(<SettingsPage />);
        input = await screen.findByTestId("provider-input");
      });

      it("is initialized", () => {
        expect((input as HTMLIonInputElement).value).toEqual(
          providers.find((p) => p.key === "auth0"),
        );
      });

      it("is enabled", async () => {
        expect((input as HTMLInputElement).disabled).toBe(false);
      });
    });

    describe("client ID", () => {
      let input: HTMLElement;
      beforeEach(async () => {
        render(<SettingsPage />);
        input = await screen.findByTestId("client-id-input");
      });

      it("is initialized", () => {
        expect((input as HTMLIonInputElement).value).toEqual(
          auth0Config.clientId,
        );
      });

      it("is enabled", async () => {
        expect((input as HTMLInputElement).disabled).toBe(false);
      });
    });

    describe("discovery URL", () => {
      let input: HTMLElement;
      beforeEach(async () => {
        render(<SettingsPage />);
        input = await screen.findByTestId("discovery-url-input");
      });

      it("is initialized", () => {
        expect((input as HTMLIonInputElement).value).toEqual(
          auth0Config.discoveryUrl,
        );
      });

      it("is enabled", () => {
        expect((input as HTMLInputElement).disabled).toBe(false);
      });
    });

    describe("scope", () => {
      let input: HTMLElement;
      beforeEach(async () => {
        render(<SettingsPage />);
        input = await screen.findByTestId("scope-input");
      });

      it("is initialized", () => {
        expect((input as HTMLIonInputElement).value).toEqual(auth0Config.scope);
      });

      it("is enabled", () => {
        expect((input as HTMLInputElement).disabled).toBe(false);
      });
    });

    describe("audience", () => {
      let input: HTMLElement;
      beforeEach(async () => {
        render(<SettingsPage />);
        input = await screen.findByTestId("audience-input");
      });

      it("is initialized", async () => {
        expect((input as HTMLIonInputElement).value).toEqual(
          auth0Config.audience,
        );
      });

      it("is enabled", () => {
        expect((input as HTMLInputElement).disabled).toBe(false);
      });
    });

    describe("flow", () => {
      let input: HTMLElement | null;

      describe("on mobile", () => {
        beforeEach(async () => {
          (isPlatform as Mock).mockReturnValue(true);
          const { queryByTestId } = render(<SettingsPage />);
          input = queryByTestId("flow-input");
        });

        it("is not rendered", () => {
          expect(input).toBeNull();
        });
      });

      describe("on web", () => {
        beforeEach(async () => {
          (isPlatform as Mock).mockReturnValue(false);
          render(<SettingsPage />);
          input = await screen.findByTestId("flow-input");
        });

        it("is initialized", () => {
          expect((input as HTMLIonInputElement).value).toEqual(
            flows.find((f) => f.key === "implicit"),
          );
        });

        it("is enabled", async () => {
          expect((input as HTMLInputElement).disabled).toBe(false);
        });
      });
    });

    describe("with a non-standard AUTH_URL_SCHEME", () => {
      beforeEach(() => {
        import.meta.env.VITE_AUTH_URL_SCHEME = "com.acme.custom";
      });

      afterEach(() => {
        import.meta.env.VITE_AUTH_URL_SCHEME = "msauth";
      });

      it("disables our big four templates", async () => {
        render(<SettingsPage />);
        let button = await screen.findByTestId("use-azure");
        expect((button as HTMLButtonElement).disabled).toBe(true);
        button = await screen.findByTestId("use-aws");
        expect((button as HTMLButtonElement).disabled).toBe(true);
        button = await screen.findByTestId("use-auth0");
        expect((button as HTMLButtonElement).disabled).toBe(true);
        button = await screen.findByTestId("use-okta");
        expect((button as HTMLButtonElement).disabled).toBe(true);
      });

      it("allows customization", async () => {
        render(<SettingsPage />);
        const button = await screen.findByTestId("use-customization");
        expect((button as HTMLButtonElement).disabled).toBe(false);
      });
    });

    describe("azure button", () => {
      describe("on the web", () => {
        beforeEach(() => {
          (isPlatform as Mock).mockReturnValue(false);
        });

        it("saves the config", async () => {
          const { updateAuthConfig } = useAuth();
          render(<SettingsPage />);
          const button = await screen.findByTestId("use-azure");
          fireEvent.click(button);
          expect(updateAuthConfig).toHaveBeenCalledTimes(1);
          expect(updateAuthConfig).toHaveBeenCalledWith(
            { ...azureConfig, ...webConfig },
            providers.find((p) => p.key === "azure"),
            flows.find((f) => f.key === "implicit"),
          );
        });
      });

      describe("on mobile", () => {
        beforeEach(() => {
          (isPlatform as Mock).mockReturnValue(true);
        });

        it("saves the config", async () => {
          const { updateAuthConfig } = useAuth();
          render(<SettingsPage />);
          const button = await screen.findByTestId("use-azure");
          fireEvent.click(button);
          expect(updateAuthConfig).toHaveBeenCalledTimes(1);
          expect(updateAuthConfig).toHaveBeenCalledWith(
            azureConfig,
            providers.find((p) => p.key === "azure"),
            undefined,
          );
        });
      });
    });

    describe("AWS button", () => {
      describe("on the web", () => {
        beforeEach(() => {
          (isPlatform as Mock).mockReturnValue(false);
        });

        it("saves the config", async () => {
          const { updateAuthConfig } = useAuth();
          render(<SettingsPage />);
          const button = await screen.findByTestId("use-aws");
          fireEvent.click(button);
          expect(updateAuthConfig).toHaveBeenCalledTimes(1);
          expect(updateAuthConfig).toHaveBeenCalledWith(
            { ...awsConfig, ...webConfig },
            providers.find((p) => p.key === "cognito"),
            flows.find((f) => f.key === "PKCE"),
          );
        });
      });

      describe("on mobile", () => {
        beforeEach(() => {
          (isPlatform as Mock).mockReturnValue(true);
        });

        it("saves the config", async () => {
          const { updateAuthConfig } = useAuth();
          render(<SettingsPage />);
          const button = await screen.findByTestId("use-aws");
          fireEvent.click(button);
          expect(updateAuthConfig).toHaveBeenCalledTimes(1);
          expect(updateAuthConfig).toHaveBeenCalledWith(
            awsConfig,
            providers.find((p) => p.key === "cognito"),
            undefined,
          );
        });
      });
    });

    describe("Auth0 button", () => {
      describe("on the web", () => {
        beforeEach(() => {
          (isPlatform as Mock).mockReturnValue(false);
        });

        it("saves the config", async () => {
          const { updateAuthConfig } = useAuth();
          render(<SettingsPage />);
          const button = await screen.findByTestId("use-auth0");
          fireEvent.click(button);
          expect(updateAuthConfig).toHaveBeenCalledTimes(1);
          expect(updateAuthConfig).toHaveBeenCalledWith(
            { ...auth0Config, ...webConfig },
            providers.find((p) => p.key === "auth0"),
            flows.find((f) => f.key === "implicit"),
          );
        });
      });

      describe("on mobile", () => {
        beforeEach(() => {
          (isPlatform as Mock).mockReturnValue(true);
        });

        it("saves the config", async () => {
          const { updateAuthConfig } = useAuth();
          render(<SettingsPage />);
          const button = await screen.findByTestId("use-auth0");
          fireEvent.click(button);
          expect(updateAuthConfig).toHaveBeenCalledTimes(1);
          expect(updateAuthConfig).toHaveBeenCalledWith(
            auth0Config,
            providers.find((p) => p.key === "auth0"),
            undefined,
          );
        });
      });
    });

    describe("Okta button", () => {
      describe("on the web", () => {
        beforeEach(() => {
          (isPlatform as Mock).mockReturnValue(false);
        });

        it("saves the config", async () => {
          const { updateAuthConfig } = useAuth();
          render(<SettingsPage />);
          const button = await screen.findByTestId("use-okta");
          fireEvent.click(button);
          expect(updateAuthConfig).toHaveBeenCalledTimes(1);
          expect(updateAuthConfig).toHaveBeenCalledWith(
            { ...oktaConfig, ...webConfig },
            providers.find((p) => p.key === "okta"),
            flows.find((f) => f.key === "PKCE"),
          );
        });
      });

      describe("on mobile", () => {
        beforeEach(() => {
          (isPlatform as Mock).mockReturnValue(true);
        });

        it("saves the config", async () => {
          const { updateAuthConfig } = useAuth();
          render(<SettingsPage />);
          const button = await screen.findByTestId("use-okta");
          fireEvent.click(button);
          expect(updateAuthConfig).toHaveBeenCalledTimes(1);
          expect(updateAuthConfig).toHaveBeenCalledWith(
            oktaConfig,
            providers.find((p) => p.key === "okta"),
            undefined,
          );
        });
      });
    });

    describe("customize button", () => {
      describe("on web", () => {
        beforeEach(() => {
          (isPlatform as Mock).mockReturnValue(false);
        });

        it("saves the config", async () => {
          const { updateAuthConfig } = useAuth();
          render(<SettingsPage />);
          const button = await screen.findByTestId("use-customization");
          let input = await screen.findByTestId("client-id-input");
          fireEvent(
            input,
            new CustomEvent("ionChange", { detail: { value: "1994-9940fks" } }),
          );
          input = await screen.findByTestId("discovery-url-input");
          fireEvent(
            input,
            new CustomEvent("ionChange", {
              detail: {
                value: "https://foo.bar.disco/.well-known/sticky-buns",
              },
            }),
          );
          input = await screen.findByTestId("scope-input");
          fireEvent(
            input,
            new CustomEvent("ionChange", {
              detail: { value: "email offline" },
            }),
          );
          input = await screen.findByTestId("audience-input");
          fireEvent(
            input,
            new CustomEvent("ionChange", { detail: { value: "people" } }),
          );
          input = await screen.findByTestId("flow-input");
          fireEvent(
            input,
            new CustomEvent("ionChange", {
              detail: { value: flows.find((f) => f.key === "PKCE") },
            }),
          );
          input = await screen.findByTestId("provider-input");
          fireEvent(
            input,
            new CustomEvent("ionChange", {
              detail: { value: providers.find((p) => p.key === "onelogin") },
            }),
          );
          fireEvent.click(button);
          expect(updateAuthConfig).toHaveBeenCalledTimes(1);
          expect(updateAuthConfig).toHaveBeenCalledWith(
            {
              clientId: "1994-9940fks",
              discoveryUrl: "https://foo.bar.disco/.well-known/sticky-buns",
              logoutUrl: "http://localhost:8100/auth-action-complete",
              redirectUri: "http://localhost:8100/auth-action-complete",
              scope: "email offline",
              audience: "people",
            },
            providers.find((p) => p.key === "onelogin"),
            flows.find((f) => f.key === "PKCE"),
          );
        });
      });

      describe("on mobile", () => {
        beforeEach(() => {
          (isPlatform as Mock).mockReturnValue(true);
        });

        it("saves the config", async () => {
          const { updateAuthConfig } = useAuth();
          render(<SettingsPage />);
          const button = await screen.findByTestId("use-customization");
          let input = await screen.findByTestId("client-id-input");
          fireEvent(
            input,
            new CustomEvent("ionChange", { detail: { value: "1994-9940fks" } }),
          );
          input = await screen.findByTestId("discovery-url-input");
          fireEvent(
            input,
            new CustomEvent("ionChange", {
              detail: {
                value: "https://foo.bar.disco/.well-known/sticky-buns",
              },
            }),
          );
          input = await screen.findByTestId("scope-input");
          fireEvent(
            input,
            new CustomEvent("ionChange", {
              detail: { value: "email offline" },
            }),
          );
          input = await screen.findByTestId("audience-input");
          fireEvent(
            input,
            new CustomEvent("ionChange", { detail: { value: "people" } }),
          );
          input = await screen.findByTestId("provider-input");
          fireEvent(
            input,
            new CustomEvent("ionChange", {
              detail: { value: providers.find((p) => p.key === "onelogin") },
            }),
          );
          fireEvent.click(button);
          expect(updateAuthConfig).toHaveBeenCalledTimes(1);
          expect(updateAuthConfig).toHaveBeenCalledWith(
            {
              clientId: "1994-9940fks",
              discoveryUrl: "https://foo.bar.disco/.well-known/sticky-buns",
              logoutUrl: "msauth://auth-action-complete",
              redirectUri: "msauth://auth-action-complete",
              scope: "email offline",
              audience: "people",
            },
            providers.find((p) => p.key === "onelogin"),
            undefined,
          );
        });
      });
    });
  });
});
