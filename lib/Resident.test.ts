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

  it("persists each time you authenticate", async () => {
    const req = mockRequest()
    const res = mockResponse()

    const resident = new Resident<Session>({
      secrets: ["secret"],
      setSessionToken(newToken) {
        req.cookie("session", newToken)
      },
      getSessionToken() {
        return res.cookies["session"]
      },
    })

    const firstToken = await resident.authenticate({
      email: "one@example.com",
    })

    expect(resident.decodeToken(firstToken)).toMatchObject({
      email: "one@example.com",
    })
    expect(resident.getSessionPayload()).toMatchObject({
      email: "one@example.com",
    })

    const secondToken = await resident.authenticate({
      email: "two@example.com",
    })

    expect(resident.decodeToken(secondToken)).toMatchObject({
      email: "two@example.com",
    })
    expect(resident.getSessionPayload()).toMatchObject({
      email: "two@example.com",
    })
    expect(resident.decodeToken(firstToken)).not.toMatchObject({
      email: "one@example.com",
    })
    expect(resident.getSessionPayload()).not.toMatchObject({
      email: "one@example.com",
    })
  })

  it("signs in on instantiation", () => {})

  it("signs out", async () => {
    await resident.signOut()
  })
})

function mockRequest() {
  return {
    cookie(key: string, value: any) {},
    cookies: {} as Record<string, string>,
  }
}

function mockResponse() {
  return mockRequest()
}
