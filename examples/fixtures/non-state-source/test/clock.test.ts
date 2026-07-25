import test from "node:test";
import assert from "node:assert/strict";
import { randomId, timestamp } from "../src/clock.js";

test("ordinary test setup may use clocks, randomness, mutation, and loose fixtures", () => {
  const state: any = { count: Math.random() };
  state.count = Date.now();

  assert.equal(typeof timestamp(), "number");
  assert.equal(typeof randomId(), "string");
});
