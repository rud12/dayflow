import { Router } from 'express';
import { getProfileController, updateProfileController, getAllEmployeesController, getEmployeeByIdController, updateEmployeeStatusController } from '../controllers/employee.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

// Get own profile
router.get('/profile', authenticate, getProfileController);

// Update own profile
router.put('/profile', authenticate, updateProfileController);

// Get all employees (admin/hr only)
router.get('/', authenticate, authorize('admin', 'hr'), getAllEmployeesController);

// Get employee by ID (admin/hr only)
router.get('/:id', authenticate, authorize('admin', 'hr'), getEmployeeByIdController);

// Update employee status (admin only)
router.patch('/:id/status', authenticate, authorize('admin'), updateEmployeeStatusController);

export default router;

