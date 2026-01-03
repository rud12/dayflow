import bcrypt from 'bcrypt';
import { pool } from '../database/connection';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken, TokenPayload } from '../utils/jwt';
import { createError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface SignupData {
  employeeId: string;
  email: string;
  password: string;
  role: 'admin' | 'hr' | 'employee';
  firstName: string;
  lastName: string;
  secretQuestion?: string;
}

export interface AuthResponse {
  user: {
    id: number;
    employeeId: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
    department?: string;
    position?: string;
  };
  accessToken: string;
  refreshToken: string;
}

export const login = async (credentials: LoginCredentials): Promise<AuthResponse> => {
  const { email, password } = credentials;

  // Find user by email or employee_id
  const userResult = await pool.query(
    `SELECT u.id, u.employee_id, u.email, u.password_hash, u.role, u.status,
            ep.first_name, ep.last_name, ep.department, ep.position
     FROM users u
     LEFT JOIN employee_profiles ep ON u.id = ep.user_id
     WHERE u.email = $1 OR u.employee_id = $1`,
    [email]
  );

  if (userResult.rows.length === 0) {
    throw createError('Invalid email or password', 401);
  }

  const user = userResult.rows[0];

  if (user.status !== 'active') {
    throw createError('Account is not active', 403);
  }

  // Verify password
  const isValidPassword = await bcrypt.compare(password, user.password_hash);
  if (!isValidPassword) {
    throw createError('Invalid email or password', 401);
  }

  // Generate tokens
  const tokenPayload: TokenPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
    employeeId: user.employee_id,
  };

  const accessToken = generateAccessToken(tokenPayload);
  const refreshToken = generateRefreshToken(tokenPayload);

  return {
    user: {
      id: user.id,
      employeeId: user.employee_id,
      email: user.email,
      role: user.role,
      firstName: user.first_name || '',
      lastName: user.last_name || '',
      department: user.department,
      position: user.position,
    },
    accessToken,
    refreshToken,
  };
};

export const signup = async (data: SignupData): Promise<AuthResponse> => {
  const { employeeId, email, password, role, firstName, lastName, secretQuestion } = data;

  // Check if email already exists
  const emailCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (emailCheck.rows.length > 0) {
    throw createError('Email already exists', 409);
  }

  // Check if employee ID already exists
  const employeeIdCheck = await pool.query('SELECT id FROM users WHERE employee_id = $1', [employeeId]);
  if (employeeIdCheck.rows.length > 0) {
    throw createError('Employee ID already exists', 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);
  // Hash secret answer if provided
  const secretAnswerHash = secretQuestion ? await bcrypt.hash(secretQuestion, 10) : null;

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Insert user
    const userResult = await client.query(
      `INSERT INTO users (employee_id, email, password_hash, role, status, secret_question, secret_answer_hash)
       VALUES ($1, $2, $3, $4, 'active', $5, $6)
       RETURNING id, employee_id, email, role`,
      [employeeId, email, passwordHash, role, secretQuestion || null, secretAnswerHash]
    );

    const user = userResult.rows[0];

    // Insert employee profile
    await client.query(
      `INSERT INTO employee_profiles (user_id, first_name, last_name, department, position, date_of_joining)
       VALUES ($1, $2, $3, 'Unassigned', 'New Employee', CURRENT_DATE)`,
      [user.id, firstName, lastName]
    );

    await client.query('COMMIT');

    // Generate tokens
    const tokenPayload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      employeeId: user.employee_id,
    };

    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    return {
      user: {
        id: user.id,
        employeeId: user.employee_id,
        email: user.email,
        role: user.role,
        firstName,
        lastName,
        department: 'Unassigned',
        position: 'New Employee',
      },
      accessToken,
      refreshToken,
    };
  } catch (error: any) {
    await client.query('ROLLBACK');
    logger.error('Signup error:', error);
    throw createError('Failed to create account', 500);
  } finally {
    client.release();
  }
};

export const refreshAccessToken = async (refreshToken: string): Promise<{ accessToken: string }> => {
  try {
    const decoded = verifyRefreshToken(refreshToken);
    
    // Verify user still exists and is active
    const userResult = await pool.query(
      'SELECT id, status FROM users WHERE id = $1',
      [decoded.userId]
    );

    if (userResult.rows.length === 0 || userResult.rows[0].status !== 'active') {
      throw createError('User not found or inactive', 401);
    }

    const tokenPayload: TokenPayload = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
      employeeId: decoded.employeeId,
    };

    const accessToken = generateAccessToken(tokenPayload);
    return { accessToken };
  } catch (error: any) {
    throw createError('Invalid refresh token', 401);
  }
};

