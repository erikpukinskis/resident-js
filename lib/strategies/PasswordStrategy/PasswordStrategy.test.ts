import jwt from "jsonwebtoken"
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { PasswordStrategy } from "./PasswordStrategy"
import { Resident } from "~/Resident"

type Session = {
  email: string
}

describe("LocalStrategy", () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it("sets the session key when the verify function returns a user", async () => {
    let token: string | undefined

    const resident = new Resident<Session>({
      /**
       * Note: In real usage, you should generate a secure secret with by running:
       *
       *   openssl rand -hex 32
       */
      secrets: ["secret"],
      setSessionToken(id) {
        token = id
      },
      getSessionToken() {
        if (!token) {
          throw new Error(
            "Expected sessionId to have been set somewhere in PasswordStrategy.test.ts?"
          )
        }

        return token
      },
    })

    const passwordStrategy = new PasswordStrategy<Session>({
      resident,
      authenticate({ username, password }) {
        if (username === "erik" && password === "password") {
          return { email: "erik@resident.dev" }
        }

        return null
      },
    })

    const erik = await passwordStrategy.authenticate({
      username: "erik",
      password: "password",
    })

    expect(erik).toMatchObject({
      email: "erik@resident.dev",
    })

    // // Uncomment to check a new expected value, if the token format changes:
    // const jwtSignArgs = [
    //   { email: "erik@resident.dev" },
    //   "secret",
    //   {
    //     algorithm: "HS256",
    //   },
    // ] as const
    // console.log(
    //   "expect signing args",
    //   jwtSignArgs,
    //   "to yield token",
    //   jwt.sign(...jwtSignArgs)
    // )

    expect(token).toEqual(
      "resident.v1.eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImVyaWtAcmVzaWRlbnQuZGV2IiwiaWF0IjoxNzA0MDY3MjAwfQ.y1OOmF3dEbaIPPfRgoP3GgnvelhcjtergD2U2rpvdH8"
    )
  })

  it("does not set the session token when the authenticate function returns undefined", async () => {
    const setSessionToken = vi.fn()

    const resident = new Resident<Session>({
      /**
       * Note: In real usage, you should generate a secure secret with by running:
       *
       *   openssl rand -hex 32
       */
      secrets: ["secret"],
      setSessionToken,
      getSessionToken() {
        return null
      },
    })

    const passwordStrategy = new PasswordStrategy<Session>({
      resident,
      authenticate() {
        return null
      },
    })

    const erik = await passwordStrategy.authenticate({
      username: "erik",
      password: "password",
    })

    expect(erik).toBe(null)

    expect(setSessionToken).not.toHaveBeenCalled()
  })
})
