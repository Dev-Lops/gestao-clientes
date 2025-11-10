import { createElement } from "react";
import { render, screen } from "@testing-library/react";

test("sanity", () => {
  render(createElement("span", null, "sanity"));
  expect(screen.getByText("sanity")).toBeInTheDocument();
});
