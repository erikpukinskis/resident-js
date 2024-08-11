import { describe, expect, it } from "vitest"
import { noop } from "~/helpers/functions"
import { Resident } from "~/Resident"

type Session = {
  email: string
}

describe("PasswordStrategy", () => {
  it("works with old secrets", async () => {
    const oldResident = new Resident<Session>({
      secrets: ["old-secret"],
      setSessionToken: noop,
      getSessionToken: noop,
    })

    const token = await oldResident.authenticate({
      email: "old-account@example.com",
    })

    const resident = new Resident<Session>({
      secrets: ["new-secret", "old-secret"],
      setSessionToken: noop,
      getSessionToken: noop,
    })

    const sessionFromToken = await resident.authenticateFromToken(token)

    expect(sessionFromToken).toMatchObject({
      email: "old-account@example.com",
    })
  })
})
