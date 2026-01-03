import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getPayrollRecords, createPayrollRecord, updatePayrollStatus } from '../services/payroll.service';

export const getPayrollRecordsController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.role === 'admin' ? undefined : req.user!.userId;
    const month = req.query.month ? parseInt(req.query.month as string) : undefined;
    const year = req.query.year ? parseInt(req.query.year as string) : undefined;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 12;

    const result = await getPayrollRecords(userId, month, year, page, limit);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const createPayrollRecordController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const record = await createPayrollRecord(req.body);
    res.status(201).json({
      success: true,
      data: record,
      message: 'Payroll record created successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const updatePayrollStatusController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const payrollId = parseInt(req.params.id);
    const { status } = req.body;

    if (!status || !['pending', 'paid'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "pending" or "paid"',
      });
    }

    const record = await updatePayrollStatus(payrollId, status);
    res.status(200).json({
      success: true,
      data: record,
      message: 'Payroll status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

