import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  checkIn,
  checkOut,
  getTodayAttendance,
  getAttendanceHistory,
  getWeeklyAttendance,
} from '../services/attendance.service';

/* ================= CHECK IN ================= */

export const checkInController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id; // ✅ FIX HERE
    const { location } = req.body;

    const record = await checkIn(userId, location);

    res.status(200).json({
      success: true,
      data: record,
      message: 'Checked in successfully',
    });
  } catch (error) {
    next(error);
  }
};

/* ================= CHECK OUT ================= */

export const checkOutController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id; // ✅ FIX HERE
    const { location } = req.body;

    const record = await checkOut(userId, location);

    res.status(200).json({
      success: true,
      data: record,
      message: 'Checked out successfully',
    });
  } catch (error) {
    next(error);
  }
};

/* ================= TODAY ================= */

export const getTodayAttendanceController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id; // ✅ FIX HERE

    const record = await getTodayAttendance(userId);

    res.status(200).json({
      success: true,
      data: record,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= HISTORY ================= */

export const getAttendanceHistoryController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id; // ✅ FIX HERE
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 30;
    const startDate = req.query.startDate as string | undefined;
    const endDate = req.query.endDate as string | undefined;

    const result = await getAttendanceHistory(
      userId,
      page,
      limit,
      startDate,
      endDate
    );

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/* ================= WEEKLY ================= */

export const getWeeklyAttendanceController = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id; // ✅ FIX HERE

    const records = await getWeeklyAttendance(userId);

    res.status(200).json({
      success: true,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};
