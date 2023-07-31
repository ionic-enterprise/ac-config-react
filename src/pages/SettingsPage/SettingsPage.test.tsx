import React from "react";
import { render } from "@testing-library/react";
import SettingsPage from "./SettingsPage";

test("renders without crashing", () => {
  const { baseElement } = render(<SettingsPage />);
  expect(baseElement).toBeDefined();
});
