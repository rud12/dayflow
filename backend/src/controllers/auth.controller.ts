import { Request, Response, NextFunction } from 'express';
import { login, signup, refreshAccessToken } from '../services/auth.service';
import { createError } from '../middleware/errorHandler';

export const loginController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await login(req.body);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const signupController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await signup(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenController = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refreshToken } = req.body;
    const result = await refreshAccessToken(refreshToken);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const logoutController = async (req: Request, res: Response) => {
  // Since we're using stateless JWT, logout is handled client-side
  // In a production system, you might want to maintain a blacklist of tokens
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

