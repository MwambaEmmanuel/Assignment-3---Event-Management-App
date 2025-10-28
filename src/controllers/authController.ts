import { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import prisma from '../config/client'
import { signToken } from '../utils/jwtUtils'

// Register a new user
export async function register(req: Request, res: Response) {
  const { name, email, password, role } = req.body
  if (!name || !email || !password) return res.status(400).json({ success: false, error: 'Missing fields' })

  const hashed = await bcrypt.hash(password, 10)
  try {
    const user = await prisma.user.create({ data: { name, email, password: hashed, role: role || 'ATTENDEE' } })
    const token = signToken({ id: user.id, email: user.email, role: user.role })
    res.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token } })
  } catch (err: any) {
    if (err.code === 'P2002') return res.status(400).json({ success: false, error: 'Email already registered' })
    console.error(err)
    res.status(500).json({ success: false, error: 'Server error' })
  }
}

// Login existing user
export async function login(req: Request, res: Response) {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ success: false, error: 'Missing fields' })

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return res.status(401).json({ success: false, error: 'Invalid credentials' })

  const ok = await bcrypt.compare(password, user.password)
  if (!ok) return res.status(401).json({ success: false, error: 'Invalid credentials' })

  const token = signToken({ id: user.id, email: user.email, role: user.role })
  res.json({ success: true, data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, token } })
}
