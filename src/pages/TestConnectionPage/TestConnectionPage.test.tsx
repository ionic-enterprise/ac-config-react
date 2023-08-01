import { render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import TestConnectionPage from "./TestConnectionPage";

describe("test connection page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing", () => {
    const { baseElement } = render(<TestConnectionPage />);
    expect(baseElement).toBeDefined();
  });
});
