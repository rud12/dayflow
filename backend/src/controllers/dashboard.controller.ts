import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getDashboardStats, getEmployeeDashboardStats } from '../services/dashboard.service';

export const getDashboardStatsController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    if (req.user!.role === 'admin') {
      const stats = await getDashboardStats();
      res.status(200).json({
        success: true,
        data: stats,
      });
    } else {
      const stats = await getEmployeeDashboardStats(req.user!.userId);
      res.status(200).json({
        success: true,
        data: stats,
      });
    }
  } catch (error) {
    next(error);
  }
};

