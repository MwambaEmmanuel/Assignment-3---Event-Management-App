import * as jwt from 'jsonwebtoken'

const JWT_SECRET: string = process.env.JWT_SECRET || 'secret'

export function signToken(payload: object, expiresIn = '7d'): string {
  // use any casts to satisfy the type definitions simply
  return (jwt as any).sign(payload, JWT_SECRET, { expiresIn })
}

export function verifyToken(token: string) {
  try {
    return (jwt as any).verify(token, JWT_SECRET)
  } catch (err) {
    return null
  }
}
