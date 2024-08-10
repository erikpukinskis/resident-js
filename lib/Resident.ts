import jwt from "jsonwebtoken"
import type { JsonObject } from "./helpers/json"

type ResidentArgs = {
  secrets: [string, ...string[]]
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

    await this._args.setSessionToken(wrapToken({ token, version: 1 }))
  }

  async authenticateFromToken(token: string) {
    const { token: unwrappedToken } = unwrapToken(token)

    for (const secret of this._args.secrets) {
      try {
        const payload = jwt.verify(unwrappedToken, secret, {
          algorithms: ["HS256"],
        })

        await this._args.setSessionToken(token)

        return payload
      } catch (e) {
        continue
      }
    }
  }
}

function wrapToken({ token, version }: { token: string; version: number }) {
  return `resident*v${version}*${token}`
}

function unwrapToken(wrappedToken: string) {
  const match = wrappedToken.match(/^resident\*v([0-9]+)\*(.+)$/)

  if (!match) {
    throw new Error(
      `Token is not a valid resident session token. Must match the format "resident*v[version]*[jwt]": ${wrappedToken}`
    )
  }

  const [_, versionString, token] = match

  const version = parseInt(versionString)

  if (!/^[\w-]+\.[\w-]+\.[\w-]+$/.test(token)) {
    throw new Error(
      `JWT part of resident token is not a valid JWT: ${wrappedToken}`
    )
  }

  return { version, token }
}
