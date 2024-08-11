import { afterAll, beforeAll, describe, expect, it, vi } from "vitest"
import { PasswordStrategy } from "./PasswordStrategy"
import { noop } from "~/helpers/functions"
import { Resident } from "~/Resident"

type Session = {
  email: string
}

describe("PasswordStrategy class (fake timers)", () => {
  beforeAll(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date("2024-01-01T00:00:00.000Z"))
  })

  afterAll(() => {
    vi.useRealTimers()
  })

  it("sets the session key when the authenticate function returns a user", async () => {
    let token: string | undefined

    const resident = new Resident<Session>({
      /**
       * Note: In real usage, you should generate a secure secret with by running:
       *
       *   openssl rand -hex 32
       */
      secrets: ["secret", "old-secret"],
      setSessionToken(newToken) {
        token = newToken
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

    const sessionFromPassword = await passwordStrategy.authenticateFromPassword(
      {
        username: "erik",
        password: "password",
      }
    )

    expect(sessionFromPassword).toMatchObject({
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
      "resident*v1*eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImVyaWtAcmVzaWRlbnQuZGV2IiwiaWF0IjoxNzA0MDY3MjAwfQ.y1OOmF3dEbaIPPfRgoP3GgnvelhcjtergD2U2rpvdH8"
    )

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    const sessionFromToken = await resident.authenticateFromToken(token!)

    expect(sessionFromToken).toMatchObject({
      email: "erik@resident.dev",
    })
  })
})

describe("PasswordStrategy class (real timers)", () => {
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

    const erik = await passwordStrategy.authenticateFromPassword({
      username: "erik",
      password: "password",
    })

    expect(erik).toBe(null)

    expect(setSessionToken).not.toHaveBeenCalled()
  })

  it("works with an async authenticate function", async () => {
    const resident = new Resident<Session>({
      secrets: ["secret", "old-secret"],
      setSessionToken: noop,
      getSessionToken: noop,
    })

    const passwordStrategy = new PasswordStrategy<Session>({
      resident,
      async authenticate({ username, password }) {
        await sleep(1)

        if (username === "erik" && password === "password") {
          return { email: "erik@resident.dev" }
        }

        return null
      },
    })

    expect(
      await passwordStrategy.authenticateFromPassword({
        username: "erik",
        password: "password",
      })
    ).toMatchObject({
      email: "erik@resident.dev",
    })

    expect(
      await passwordStrategy.authenticateFromPassword({
        username: "erik",
        password: "pass1234",
      })
    ).toEqual(null)
  })
})

// From https://gist.github.com/erikpukinskis/c67c8b0a9ac731dec15784911c2cb0b4
async function sleep(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms)
  })
}
