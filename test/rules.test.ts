import test from "node:test";
import assert from "node:assert/strict";
import { detectSlices } from "../src/rules.js";
import type { SourceFile } from "../src/fs.js";

function sourceFile(relativePath: string, text: string): SourceFile {
  return { path: `/fixture/${relativePath}`, relativePath, text };
}

const plainSlice = "const initialState = { count: 0 };\nexport function cartReducer(state = initialState, action) { return state; }\n";
const explicitNameSlice = "const initialState = { name: \"Guest\" };\nexport function profileReducer(state = initialState, action) { return state; }\n";
const pairedTest = "describe(\"cart\", () => {});\n";
const describeOnlyTest = "describe(\"cart slice\", () => {});\n";

for (const extension of [".mts", ".cts", ".mjs", ".cjs"]) {
  test(`inferSliceName and hasMatchingTest treat ${extension} like the .ts equivalent`, () => {
    const reference = detectSlices([
      sourceFile("src/cart.slice.ts", plainSlice),
      sourceFile("src/cart.slice.test.ts", pairedTest)
    ])[0];
    const candidate = detectSlices([
      sourceFile(`src/cart.slice${extension}`, plainSlice),
      sourceFile(`src/cart.slice.test${extension}`, pairedTest)
    ])[0];

    assert.ok(reference, `${extension} slice should be detected`);
    assert.deepEqual({ ...candidate, file: reference.file }, reference);
    assert.equal(candidate.name, "cart");
    assert.equal(candidate.hasTests, true);
  });
}

test("explicit createSlice-style names keep precedence across module extensions", () => {
  const names = [".ts", ".mts", ".cts"].map((extension) => detectSlices([
    sourceFile(`src/profile.reducer${extension}`, explicitNameSlice),
    sourceFile(`src/profile.reducer.test${extension}`, pairedTest)
  ])[0].name);

  assert.deepEqual(names, ["Guest", "Guest", "Guest"]);
});

test("describe-only tests pair .mts/.cts slices without a name match", () => {
  for (const extension of [".mts", ".cts"]) {
    const paired = detectSlices([
      sourceFile(`src/cart.slice${extension}`, plainSlice),
      sourceFile(`src/checkout-notes.test${extension}`, describeOnlyTest)
    ])[0];
    assert.equal(paired.hasTests, true, `describe text must satisfy ${extension} coverage`);

    const unpaired = detectSlices([
      sourceFile(`src/cart.slice${extension}`, plainSlice),
      sourceFile(`src/checkout-notes.test${extension}`, "describe(\"billing\", () => {});\n")
    ])[0];
    assert.equal(unpaired.hasTests, false, `negative control for ${extension}`);
  }
});
