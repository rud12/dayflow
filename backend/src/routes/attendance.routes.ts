import { Router } from 'express';
import {
  checkInController,
  checkOutController,
  getTodayAttendanceController,
  getAttendanceHistoryController,
  getWeeklyAttendanceController,
} from '../controllers/attendance.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.post('/check-in', authenticate, checkInController);
router.post('/check-out', authenticate, checkOutController);
router.get('/today', authenticate, getTodayAttendanceController);
router.get('/history', authenticate, getAttendanceHistoryController);
router.get('/weekly', authenticate, getWeeklyAttendanceController);

export default router;

