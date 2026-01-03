import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import {
  createLeaveRequest,
  getLeaveRequests,
  updateLeaveRequestStatus,
} from '../services/leave.service';

export const createLeaveRequestController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const request = await createLeaveRequest(userId, req.body);
    res.status(201).json({
      success: true,
      data: request,
      message: 'Leave request submitted successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const getLeaveRequestsController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.role === 'admin' ? undefined : req.user!.userId;
    const status = req.query.status as 'pending' | 'approved' | 'rejected' | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;

    const result = await getLeaveRequests(userId, status, page, limit);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const updateLeaveStatusController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const leaveId = parseInt(req.params.id);
    const adminId = req.user!.userId;
    const { status, adminComment } = req.body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "approved" or "rejected"',
      });
    }

    const request = await updateLeaveRequestStatus(leaveId, adminId, status, adminComment);
    res.status(200).json({
      success: true,
      data: request,
      message: `Leave request ${status} successfully`,
    });
  } catch (error) {
    next(error);
  }
};

