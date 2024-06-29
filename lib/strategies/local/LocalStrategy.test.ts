import { describe, it } from "vitest"
import { LocalStrategy } from "./LocalStrategy"
import { Resident } from "~/Resident"

describe("LocalStrategy", () => {
  it("sets the session key when the verify function returns true", () => {
    const resident = new Resident({
      local: new LocalStrategy(),
    })
  })
})
