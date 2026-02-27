import { describe, expect, it } from "vitest";
import { stub } from "./index.js";

describe("stub", () => {
  it("returns input as an array", () => {
    expect(stub("hello")).toEqual(["hello"]);
  });
});
