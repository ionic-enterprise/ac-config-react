import React from "react";
import { render } from "@testing-library/react";
import TestConnectionPage from "./TestConnectionPage";

test("renders without crashing", () => {
  const { baseElement } = render(<TestConnectionPage />);
  expect(baseElement).toBeDefined();
});
