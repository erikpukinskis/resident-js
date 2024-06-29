import type { Json } from "~/helpers/json"
import type { ResidentStrategy } from "~/Resident"

export class LocalStrategy<UserType extends Json>
  implements ResidentStrategy<[], UserType>
{
  verify: (request: Request) => Promise<UserType>

  constructor(verify: (request: Request) => Promise<UserType>) {
    this.verify = verify
  }
}
