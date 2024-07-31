import type { Json } from "~/helpers/json"
import type { Resident } from "~/Resident"
// import type { ResidentStrategy } from "~/Resident"

type AuthenticateFunction<UserType> = (input: {
  username: string
  password: string
}) => Promise<UserType | null> | UserType | null

type PasswordStrategyArgs<UserType extends Json> = {
  resident: Resident<UserType>
  authenticate: AuthenticateFunction<UserType>
}

export class PasswordStrategy<UserType extends Json> {
  private _resident: Resident<UserType>
  private _authenticate: AuthenticateFunction<UserType>

  constructor({ resident, authenticate }: PasswordStrategyArgs<UserType>) {
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
