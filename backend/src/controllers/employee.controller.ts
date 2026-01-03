import { Response, NextFunction } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { getEmployeeProfile, updateEmployeeProfile, getAllEmployees, updateEmployeeStatus, getEmployeeById } from '../services/employee.service';

export const getProfileController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const profile = await getEmployeeProfile(userId);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfileController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.userId;
    const profile = await updateEmployeeProfile(userId, req.body);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllEmployeesController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string | undefined;
    
    const result = await getAllEmployees(page, limit, search);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getEmployeeByIdController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const employeeId = parseInt(req.params.id);
    const profile = await getEmployeeById(employeeId);
    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    next(error);
  }
};

export const updateEmployeeStatusController = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const employeeId = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status || !['active', 'inactive', 'suspended'].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid status. Must be "active", "inactive", or "suspended"',
      });
    }

    await updateEmployeeStatus(employeeId, status);
    res.status(200).json({
      success: true,
      message: 'Employee status updated successfully',
    });
  } catch (error) {
    next(error);
  }
};

