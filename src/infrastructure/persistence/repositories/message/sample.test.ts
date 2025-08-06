import { TYPES } from "@infrastructure/external/di/inversify/types";

console.log("TYPES:", TYPES); // <== This should not be undefined

test("basic", () => {
  expect(TYPES).toBeDefined();
});
