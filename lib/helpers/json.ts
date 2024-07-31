// From https://github.com/microsoft/TypeScript/issues/1897#issuecomment-302937788

export interface JsonObject {
  [member: string]: string | number | boolean | null | JsonArray | JsonObject
}

export type JsonArray = Array<
  string | number | boolean | null | JsonArray | JsonObject
>

export type Json = JsonObject | JsonArray
