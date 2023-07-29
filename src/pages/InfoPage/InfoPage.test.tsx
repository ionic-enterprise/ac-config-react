import React from "react";
import { render } from "@testing-library/react";
import InfoPage from "./InfoPage";

test("renders without crashing", () => {
  const { baseElement } = render(<InfoPage />);
  expect(baseElement).toBeDefined();
});
