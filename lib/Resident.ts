import jwt from "jsonwebtoken"
import type { JsonObject } from "./helpers/json"

type ResidentArgs = {
  secrets: [string] & string[]
  setSessionToken: (id: string) => Promise<void> | void
  getSessionToken: () => Promise<string | null> | string | null
}

export class Resident<SessionPayload extends JsonObject> {
  private _args: ResidentArgs

  constructor(args: ResidentArgs) {
    this._args = args
  }

  async authenticate(payload: SessionPayload) {
    const jwtSignArgs = [
      payload,
      this._args.secrets[0],
      {
        algorithm: "HS256",
      },
    ] as const

    const token = jwt.sign(...jwtSignArgs)

    // // Uncomment to debug token signing issues
    // console.log("signed", jwtSignArgs, "and got token", token)

    await this._args.setSessionToken(`resident.v1.${token}`)
  }
}
