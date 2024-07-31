import { describe, expect, it } from "vitest"
import { PasswordStrategy } from "./PasswordStrategy"
import { Resident } from "~/Resident"

describe("LocalStrategy", () => {
  it("sets the session key when the verify function returns true", async () => {
    type User = {
      email: string
    }

    const resident = new Resident<User>()

    const passwordStrategy = new PasswordStrategy<User>({
      resident,
      authenticate({ username, password }) {
        if (username === "erik" && password === "password") {
          return { email: "erik@residentjs.dev" }
        }

        return null
      },
    })

    const erik = await passwordStrategy.authenticate({
      username: "erik",
      password: "password",
    })

    expect(erik).toMatchObject({
      email: "erik@residentjs.dev",
    })
  })
})
