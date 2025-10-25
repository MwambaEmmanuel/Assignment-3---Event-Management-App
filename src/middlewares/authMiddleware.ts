import { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwtUtils'

// Simple auth middleware: verifies JWT and attaches `req.user`.
export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ success: false, error: 'Unauthorized' })

  const payload: any = verifyToken(token)
  if (!payload) return res.status(401).json({ success: false, error: 'Invalid token' })

  ;(req as any).user = payload
  next()
}

// Role guard: pass allowed roles
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user
    if (!user) return res.status(401).json({ success: false, error: 'Unauthorized' })
    if (roles.length && !roles.includes(user.role)) {
      return res.status(403).json({ success: false, error: 'Forbidden - insufficient role' })
    }
    next()
  }
}
