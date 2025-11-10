import test from "node:test";
import assert from "node:assert/strict";
import React from "react";
import { renderToString } from "react-dom/server";

test("sanity", () => {
  const html = renderToString(React.createElement("span", null, "sanity"));
  assert.ok(html.includes("sanity"));
});
