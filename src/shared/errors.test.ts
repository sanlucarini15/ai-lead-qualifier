import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LlmInvalidOutputError,
  LlmTimeoutError,
  LlmToolCallError,
  NotFoundError,
} from "./errors.js";

// Sanity check to have at least one test running in CI.
// Real service tests (with FakeLlmClient) go in whatever PR touches that logic.

test("LlmInvalidOutputError stores the raw output and the correct name", () => {
  const err = new LlmInvalidOutputError("invalid json", { foo: "bar" });
  assert.equal(err.name, "LlmInvalidOutputError");
  assert.deepEqual(err.raw, { foo: "bar" });
});

test("LlmTimeoutError has a default message", () => {
  const err = new LlmTimeoutError();
  assert.equal(err.name, "LlmTimeoutError");
  assert.match(err.message, /took too long/);
});

test("LlmToolCallError stores the tool name", () => {
  const err = new LlmToolCallError("tool call failed", "search_company");
  assert.equal(err.name, "LlmToolCallError");
  assert.equal(err.toolName, "search_company");
});

test("NotFoundError builds the message with entity and id", () => {
  const err = new NotFoundError("Lead", "123");
  assert.equal(err.name, "NotFoundError");
  assert.equal(err.message, "Lead with id 123 not found");
});
