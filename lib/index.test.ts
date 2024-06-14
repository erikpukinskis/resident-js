import { it, expect } from "vitest";

const myFunction = () => "hello world!";

it("returns a greeting", () => {
  expect(myFunction()).toContain("hello");
});
