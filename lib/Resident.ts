import jwt from "jsonwebtoken"
import type { JsonObject } from "./helpers/json"

type ResidentArgs = {
  /**
   * An array of HS256 secret keys used to sign your tokens. The first one will
   * be used to _sign_ any new JWTs. However, for _decoding_ tokens, all of the
   * secrets can be used. Resident will try each secret, in order, until one
   * works.
   *
   * Can be any string, but it is recommended that you generate your production
   * tokens with openssl:
   *
   *       openssl rand -hex 32
   */
  secrets: [string, ...string[]]
  /**
   * Callback which is called whenever a new session is authenticated. You'll typically want to persist the token in this callback. For example:
   *
   *       onSession(token) {
   *         res.cookie("session", token)
   *       }
   */
  onSession: (token: string) => Promise<void> | void
}

/**
 * A Resident object is typically instantiated per request. It could be used
 * alone in some cases, but often will be connected to various "strategies".
 *
 * Ex:
 *
 *       type SessionPayload = {
 *         email: string,
 *         organizationId: string,
 *       }
 *
 *       const resident = new Resident<SessionPayload>({
 *         secrets: ["secret generated with openssl rand -hex 32"],
 *         onSession(token) {
 *           res.cookie("session", token)
 *         }
 *       })
 *
 *       const passwordStrategy = new PasswordStrategy({
 *         resident,
 *         authenticate({ username: email, password }) {
 *           return await db.User.find({
 *             where: {
 *               email,
 *               hashedPassword: resident.hashPassword(password)
 *             }
 *           })
 *         }
 *       })
 *
 *       // Authenticating from the request cookies:
 *       const sessionFromToken = resident.authenticateFromToken(
 *         req.cookies["session"]
 *       )
 *
 *       // Authenticating from a password:
 *       const sessionFromPassword = passwordStrategy.authenticateFromPassword({
 *         username: ...,
 *         password: ...,
 *       })
 *
 *       // Forcing authentication:
 *       const session = resident.authenticate({
 *         email: "someone@example.com",
 *         organizationId: ...,
 *       })
 */
export class Resident<SessionPayload extends JsonObject> {
  private _args: ResidentArgs
  private _token: string | null = null

  constructor(args: ResidentArgs) {
    this._args = args
  }

  /**
   * Generates a new session token for the provided payload, and sets the
   * session state to that.
   */
  async authenticate(payload: SessionPayload) {
    const jwtSignArgs = [
      payload,
      this._args.secrets[0],
      {
        algorithm: "HS256",
      },
    ] as const

    const wrappedToken = wrapToken({
      token: jwt.sign(...jwtSignArgs),
      version: 1,
    })

    // // Uncomment to debug token signing issues
    // console.log("signed", jwtSignArgs, "and got token", wrappedToken)

    await this.setSessionToken(wrappedToken)

    return wrappedToken
  }

  /**
   * Verifies that the provided token is valid. If it is, uses this token as our
   * new session state, and returns the payload.
   *
   * Throws errors if the token is invalid.
   */
  async authenticateFromToken(token: string) {
    const payload = this.decodeToken(token)

    await this.setSessionToken(token)

    return payload
  }

  /**
   * Returns the SessionPayload for the current session, if there is one.
   */
  getSessionPayload() {
    return this._token ? this.decodeToken(this._token) : null
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async signOut() {
    this._token = null
  }

  /**
   * Decodes a token into a SessionPayload without modifying the session state
   * at all.
   *
   * Throws errors if the token is invalid.
   */
  private decodeToken(token: string) {
    const { token: unwrappedToken } = unwrapToken(token)
    for (const secret of this._args.secrets) {
      try {
        const payload = jwt.verify(unwrappedToken, secret, {
          algorithms: ["HS256"],
        })

        return payload as SessionPayload
      } catch (e) {
        continue
      }
    }
    throw new Error(`Could not verify JWT token: ${token}`)
  }

  /**
   * Helper method to use whenever the session token changes. Doesn't do much,
   * but seems good to have a centralized place to do this every time, in case
   * it needs to change over time a bit.
   */
  private async setSessionToken(token: string) {
    await this._args.onSession(token)
    this._token = token
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
