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
    const wrappedToken = wrapToken({ token, version: 1 })

    // // Uncomment to debug token signing issues
    // console.log("signed", jwtSignArgs, "and got token", token)

    await this._args.setSessionToken(wrappedToken)

    return wrappedToken
  }

  async authenticateFromToken(token: string) {
    const payload = this.decodeToken(token)

    await this._args.setSessionToken(token)

    return payload
  }

  decodeToken(token: string) {
    const { token: unwrappedToken } = unwrapToken(token)
    for (const secret of this._args.secrets) {
      try {
        const payload = jwt.verify(unwrappedToken, secret, {
          algorithms: ["HS256"],
        })

        return payload
      } catch (e) {
        continue
      }
    }
    throw new Error(`Could not verify JWT token: ${token}`)
  }

  async getSessionPayload() {
    const token = await this._args.getSessionToken()
    return token ? this.decodeToken(token) : null
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
