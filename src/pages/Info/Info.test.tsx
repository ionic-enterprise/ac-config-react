import React from "react";
import { render } from "@testing-library/react";
import Info from "./Info";

test("renders without crashing", () => {
  const { baseElement } = render(<Info />);
  expect(baseElement).toBeDefined();
});
