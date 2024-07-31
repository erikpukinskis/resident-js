import type { JsonObject } from "~/helpers/json"
import type { Resident } from "~/Resident"
// import type { ResidentStrategy } from "~/Resident"

type AuthenticateFunction<SessionPayload> = (input: {
  username: string
  password: string
}) => Promise<SessionPayload | null> | SessionPayload | null

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

  async authenticate({
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
