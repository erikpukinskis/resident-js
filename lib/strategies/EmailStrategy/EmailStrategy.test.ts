import { describe, expect, it } from "vitest"
import { EmailStrategy } from "./EmailStrategy"

describe("EmailStrategy", () => {
  it("generates verification tokens", () => {
    const token1 = EmailStrategy.generateVerificationToken()
    const token2 = EmailStrategy.generateVerificationToken()

    expect(token1).toMatch(/^([a-z0-9]{8}-?){8}$/)
    expect(token1).not.toEqual(token2)
  })
})
