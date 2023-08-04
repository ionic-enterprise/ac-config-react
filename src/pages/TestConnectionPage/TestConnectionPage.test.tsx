import { fireEvent, render, screen } from "@testing-library/react";
import { Mock, beforeEach, describe, expect, it, vi } from "vitest";
import TestConnectionPage from "./TestConnectionPage";
import { useAuth } from "../../providers/AuthProvider";

vi.mock("../../providers/AuthProvider");

describe("test connection page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", async () => {
    const { baseElement } = render(<TestConnectionPage />);
    await screen.findByTestId("auth-status-label");
    expect(baseElement).toBeDefined();
  });

  describe("status label", () => {
    describe("when logged in", () => {
      beforeEach(() => {
        (useAuth as Mock).mockReturnValue({
          session: JSON.stringify({
            accessToken: "the-access-token",
            refreshToken: "the-refresh-token",
            idToken: "the-id-token",
          }),
          canRefresh: vi.fn().mockResolvedValue(true),
          login: vi.fn().mockResolvedValue(undefined),
          logout: vi.fn().mockResolvedValue(undefined),
        });
      });

      it("displays log in", async () => {
        render(<TestConnectionPage />);
        const label = await screen.findByTestId("auth-status-label");
        expect(label.textContent).toContain("Logged In");
      });
    });

    describe("when logged out", () => {
      beforeEach(() => {
        (useAuth as Mock).mockReturnValue({
          session: null,
          canRefresh: vi.fn().mockResolvedValue(true),
          login: vi.fn().mockResolvedValue(undefined),
          logout: vi.fn().mockResolvedValue(undefined),
        });
      });

      it("displays log in", async () => {
        render(<TestConnectionPage />);
        const label = await screen.findByTestId("auth-status-label");
        expect(label.textContent).toContain("Logged Out");
      });
    });
  });

  describe("auth button", () => {
    describe("when logged in", () => {
      beforeEach(() => {
        (useAuth as Mock).mockReturnValue({
          session: JSON.stringify({
            accessToken: "the-access-token",
            refreshToken: "the-refresh-token",
            idToken: "the-id-token",
          }),
          canRefresh: vi.fn().mockResolvedValue(true),
          login: vi.fn().mockResolvedValue(undefined),
          logout: vi.fn().mockResolvedValue(undefined),
        });
      });

      it("displays log out", async () => {
        render(<TestConnectionPage />);
        const button = await screen.findByTestId("auth-button");
        expect(button.textContent).toEqual("Log Out");
      });

      it("performs a logout on click", async () => {
        const { logout } = useAuth();
        render(<TestConnectionPage />);
        const button = await screen.findByTestId("auth-button");
        fireEvent.click(button);
        expect(logout).toHaveBeenCalledOnce();
      });
    });

    describe("when logged out", () => {
      beforeEach(() => {
        (useAuth as Mock).mockReturnValue({
          session: null,
          canRefresh: vi.fn().mockResolvedValue(true),
          login: vi.fn().mockResolvedValue(undefined),
          logout: vi.fn().mockResolvedValue(undefined),
        });
      });

      it("displays log in", async () => {
        render(<TestConnectionPage />);
        const button = await screen.findByTestId("auth-button");
        expect(button.textContent).toEqual("Log In");
      });

      it("performs a login on click", async () => {
        const { login } = useAuth();
        render(<TestConnectionPage />);
        const button = await screen.findByTestId("auth-button");
        fireEvent.click(button);
        expect(login).toHaveBeenCalledOnce();
      });
    });
  });

  describe("refresh button", () => {
    describe("when refresh is not available", () => {
      beforeEach(() => {
        (useAuth as Mock).mockReturnValue({
          session: JSON.stringify({
            accessToken: "the-access-token",
            refreshToken: "the-refresh-token",
            idToken: "the-id-token",
          }),
          canRefresh: vi.fn().mockResolvedValue(false),
        });
      });

      it("is disabled", async () => {
        render(<TestConnectionPage />);
        const button = await screen.findByTestId("refresh-button");
        expect((button as HTMLIonButtonElement).disabled).toBe(true);
      });
    });

    describe("when refresh is available", () => {
      beforeEach(() => {
        (useAuth as Mock).mockReturnValue({
          session: JSON.stringify({
            accessToken: "the-access-token",
            refreshToken: "the-refresh-token",
            idToken: "the-id-token",
          }),
          canRefresh: vi.fn().mockResolvedValue(true),
        });
      });

      it("is enabled", async () => {
        render(<TestConnectionPage />);
        const button = await screen.findByTestId("refresh-button");
        expect((button as HTMLIonButtonElement).disabled).toBe(false);
      });
    });
  });
});
