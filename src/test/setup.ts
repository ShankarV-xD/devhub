import "@testing-library/jest-dom";
import { webcrypto } from "crypto";

// Polyfill WebCrypto API for jsdom environment
// jsdom's crypto implementation is incomplete, so we use Node.js's webcrypto
// This is required for the jose library to work correctly in tests
Object.defineProperty(globalThis, "crypto", {
  value: webcrypto,
  writable: true,
  configurable: true,
});
