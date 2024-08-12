import { randomBytes } from "crypto"

export class EmailStrategy {
  /**
   * Generates a cryptopgraphically secure token, somewhere between 32 and 48
   * bits, formatted as 8 groups of 8 alphanumeric characters, separated by
   * dashes, e.g.:
   *
   *       2b3bsuhc-l9564w3d-7u52qtt4-w5gcdo1p-41xagvos-5cf5w44v-i6o9zt10-viw42n6b
   */
  static generateVerificationToken() {
    const buffer = randomBytes(48)
    const hex = buffer.toString("hex")
    const decimal = BigInt("0x" + hex)
    let alphanumeric = decimal.toString(36)

    function take() {
      const chunk = alphanumeric.slice(0, 8)
      alphanumeric = alphanumeric.slice(8)
      if (chunk.length === 8) {
        return chunk
      } else {
        return undefined
      }
    }

    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    let split = take()!
    let chunk = take()
    while (chunk && split.length < 64) {
      split = `${split}-${chunk}`
      chunk = take()
    }

    return split
  }
}
