import React from "react";
import { render } from "@testing-library/react";
import Settings from "./Settings";

test("renders without crashing", () => {
  const { baseElement } = render(<Settings />);
  expect(baseElement).toBeDefined();
});
