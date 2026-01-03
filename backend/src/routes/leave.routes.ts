import { Router } from 'express';
import {
  createLeaveRequestController,
  getLeaveRequestsController,
  updateLeaveStatusController,
} from '../controllers/leave.controller';
import { authenticate, authorize } from '../middleware/auth.middleware';

const router = Router();

router.post('/', authenticate, createLeaveRequestController);
router.get('/', authenticate, getLeaveRequestsController);
router.patch('/:id/status', authenticate, authorize('admin'), updateLeaveStatusController);

export default router;

