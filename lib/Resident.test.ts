import { describe, expect, it } from "vitest"
import { noop } from "~/helpers/functions"
import { Resident } from "~/Resident"

type Session = {
  email: string
}

describe("Resident class", () => {
  it("works with old secrets", async () => {
    const oldResident = new Resident<Session>({
      secrets: ["old-secret"],
      onSession: noop,
    })

    const token = await oldResident.authenticate({
      email: "old-account@example.com",
    })

    const resident = new Resident<Session>({
      secrets: ["new-secret", "old-secret"],
      onSession: noop,
    })

    const sessionFromToken = await resident.authenticateFromToken(token)

    expect(sessionFromToken).toMatchObject({
      email: "old-account@example.com",
    })
  })

  it("persists each time you authenticate", async () => {
    const resident = new Resident<Session>({
      secrets: ["secret"],
      onSession: noop,
    })

    await resident.authenticate({
      email: "one@example.com",
    })

    expect(resident.getSessionPayload()).toMatchObject({
      email: "one@example.com",
    })

    await resident.authenticate({
      email: "two@example.com",
    })

    expect(resident.getSessionPayload()).toMatchObject({
      email: "two@example.com",
    })
    expect(resident.getSessionPayload()).not.toMatchObject({
      email: "one@example.com",
    })
  })

  it("signs out", async () => {})
})
