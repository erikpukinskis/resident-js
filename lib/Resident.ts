/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Json } from "./helpers/json"

export type ResidentStrategy<Args extends any[], UserType extends Json> = {
  verify(req: Request, ...args: Args): Promise<UserType>
}

type StrategyDictionary<
  StrategiesType extends string,
  ArgsType extends Record<StrategiesType, any[]>,
  UserType extends Json
> = {
  [Key in StrategiesType]: ResidentStrategy<ArgsType[Key], UserType>
}

export class Resident<
  Keys extends string,
  Args extends Record<Keys, any[]>,
  UserType extends Json
> {
  strategies: StrategyDictionary<Keys, Args, UserType>

  constructor(strategies: StrategyDictionary<Keys, Args, UserType>) {
    this.strategies = strategies
  }

  identify<Key extends Keys>(method: Key, ...args: Args[Key]) {}
}
