import bcrypt from "bcrypt"
import type { JsonObject } from "~/helpers/json"
import type { Resident } from "~/Resident"
// import type { ResidentStrategy } from "~/Resident"

type AuthenticateFunction<SessionPayload> = (input: {
  username: string
  password: string
}) => SessionPayload | null | Promise<SessionPayload | null>

type PasswordStrategyArgs<SessionPayload extends JsonObject> = {
  resident: Resident<SessionPayload>
  authenticate: AuthenticateFunction<SessionPayload>
}

export class PasswordStrategy<SessionPayload extends JsonObject> {
  private _resident: Resident<SessionPayload>
  private _authenticate: AuthenticateFunction<SessionPayload>

  constructor({
    resident,
    authenticate,
  }: PasswordStrategyArgs<SessionPayload>) {
    this._authenticate = authenticate
    this._resident = resident
  }

  /**
   * Generates a one-way hash for the provided string, with the provided salt.
   */
  static hashPassword(text: string, salt: string) {
    return new Promise<string>((resolve, reject) => {
      bcrypt.hash(text, salt, function (err, hash) {
        if (err) return reject(err)
        resolve(hash)
      })
    })
  }

  /**
   * Generates a fresh salt
   */
  static generateSalt() {
    return new Promise<string>((resolve, reject) => {
      bcrypt.genSalt(10, function (err, salt) {
        if (err) return reject(err)
        resolve(salt)
      })
    })
  }

  async authenticateFromPassword({
    username,
    password,
  }: {
    username: string
    password: string
  }) {
    const user = await this._authenticate({ username, password })

    if (user) {
      await this._resident.authenticate(user)
    }

    return user
  }
}
