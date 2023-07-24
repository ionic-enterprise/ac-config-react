import React from "react";
import { render } from "@testing-library/react";
import TestConnection from "./TestConnection";

test("renders without crashing", () => {
  const { baseElement } = render(<TestConnection />);
  expect(baseElement).toBeDefined();
});
