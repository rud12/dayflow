import { Router } from 'express';
import {
  getPayrollRecordsController,
  createPayrollRecordController,
  updatePayrollStatusController,
} from '../controllers/payroll.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.get('/', authenticate, getPayrollRecordsController);
router.post('/', authenticate, authorize('admin'), createPayrollRecordController);
router.patch('/:id/status', authenticate, authorize('admin'), updatePayrollStatusController);

export default router;

