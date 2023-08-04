import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import InfoPage from "./InfoPage";

vi.mock("../../providers/AuthProvider");

describe("info page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { baseElement } = render(<InfoPage />);
    expect(baseElement).toBeDefined();
  });
});
