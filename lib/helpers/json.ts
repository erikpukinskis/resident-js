// From https://github.com/microsoft/TypeScript/issues/1897#issuecomment-302937788

export interface JsonMap {
  [member: string]: string | number | boolean | null | JsonArray | JsonMap
}

export type JsonArray = Array<
  string | number | boolean | null | JsonArray | JsonMap
>

export type Json = JsonMap | JsonArray | string | number | boolean | null
