import { test } from "node:test";
import assert from "node:assert/strict";
import {
  LlmInvalidOutputError,
  LlmTimeoutError,
  LlmToolCallError,
  NotFoundError,
} from "./errors.js";

// Sanity check para tener al menos un test corriendo en CI.
// Los tests reales de servicios (con FakeLlmClient) van en cada
// PR que toque esa lógica.

test("LlmInvalidOutputError guarda el raw output y el name correcto", () => {
  const err = new LlmInvalidOutputError("json invalido", { foo: "bar" });
  assert.equal(err.name, "LlmInvalidOutputError");
  assert.deepEqual(err.raw, { foo: "bar" });
});

test("LlmTimeoutError tiene mensaje por defecto", () => {
  const err = new LlmTimeoutError();
  assert.equal(err.name, "LlmTimeoutError");
  assert.match(err.message, /tardó demasiado/);
});

test("LlmToolCallError guarda el nombre de la tool", () => {
  const err = new LlmToolCallError("fallo la tool", "buscar_empresa");
  assert.equal(err.name, "LlmToolCallError");
  assert.equal(err.toolName, "buscar_empresa");
});

test("NotFoundError arma el mensaje con entidad e id", () => {
  const err = new NotFoundError("Lead", "123");
  assert.equal(err.name, "NotFoundError");
  assert.equal(err.message, "Lead con id 123 no encontrado");
});
