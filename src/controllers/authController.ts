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
import bcrypt from 'bcrypt';
import { prisma } from '../prisma/client';
import { generateToken } from '../utils/jwtUtils';
import { APIError, validationError } from '../utils/errorHandler';

/**
 * Sign up a new user
 */
export const signup = async (data: {
  email: string;
  password: string;
  name: string;
  role?: 'ADMIN' | 'ORGANIZER' | 'ATTENDEE';
}) => {
  const { email, password, name, role } = data;

  // Validate input
  if (!email || !password || !name) {
    throw validationError('Email, password, and name are required');
  }

  if (password.length < 6) {
    throw validationError('Password must be at least 6 characters long');
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    throw new APIError(409, 'User with this email already exists');
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create user
  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role: role || 'ATTENDEE',
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    success: true,
    message: 'User registered successfully',
    data: {
      user,
      token,
    },
  };
};

/**
 * Login a user
 */
export const login = async (data: { email: string; password: string }) => {
  const { email, password } = data;

  // Validate input
  if (!email || !password) {
    throw validationError('Email and password are required');
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new APIError(401, 'Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    throw new APIError(401, 'Invalid email or password');
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  });

  return {
    success: true,
    message: 'Login successful',
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      token,
    },
  };
};

/**
 * Get current user profile
 */
export const getProfile = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new APIError(404, 'User not found');
  }

  return {
    success: true,
    data: user,
  };
};
