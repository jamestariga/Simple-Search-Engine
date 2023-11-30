export type User = {
  id: string
  name: string
  username: string
  gender: string
  country: string
  favorites: string
}

export type Boosts = {
  type: string
  value: string[]
  operation: string
  factor: number
}[]

export type BoostsQuery = Record<string, Boosts>

export type CardProps = {
  title: string
  extract: string
  id: number
}
