import { pool } from '../database/connection';
import { createError } from '../middleware/errorHandler';

export interface AttendanceRecord {
  id: number;
  userId: number;
  date: string;
  day: string;
  checkIn?: string;
  checkOut?: string;
  checkInLocation?: string;
  checkOutLocation?: string;
  status: string;
  workHours?: number;
}

/* ================= CHECK IN ================= */

export const checkIn = async (
  userId: number,
  location?: string
): Promise<AttendanceRecord> => {
  if (!userId) {
    throw createError('Unauthorized', 401);
  }

  const today = new Date().toISOString().split('T')[0];
  const now = new Date();

  // Check existing record
  const existing = await pool.query(
    `SELECT * FROM attendance WHERE user_id = $1 AND date = $2`,
    [userId, today]
  );

  if (existing.rows.length > 0 && existing.rows[0].check_in_time) {
    throw createError('Already checked in today', 400);
  }

  // Late if after 9:30 AM
  const isLate =
    now.getHours() > 9 ||
    (now.getHours() === 9 && now.getMinutes() > 30);

  const status = isLate ? 'late' : 'present';

  if (existing.rows.length > 0) {
    await pool.query(
      `UPDATE attendance
       SET check_in_time = CURRENT_TIME,
           check_in_location = $1,
           status = $2,
           updated_at = CURRENT_TIMESTAMP
       WHERE user_id = $3 AND date = $4`,
      [location || null, status, userId, today]
    );
  } else {
    await pool.query(
      `INSERT INTO attendance
       (user_id, date, check_in_time, check_in_location, status)
       VALUES ($1, $2, CURRENT_TIME, $3, $4)`,
      [userId, today, location || null, status]
    );
  }

  const result = await pool.query(
    `SELECT * FROM attendance WHERE user_id = $1 AND date = $2`,
    [userId, today]
  );

  return formatAttendanceRecord(result.rows[0]);
};

/* ================= CHECK OUT ================= */

export const checkOut = async (
  userId: number,
  location?: string
): Promise<AttendanceRecord> => {
  if (!userId) {
    throw createError('Unauthorized', 401);
  }

  const today = new Date().toISOString().split('T')[0];

  const existing = await pool.query(
    `SELECT * FROM attendance WHERE user_id = $1 AND date = $2`,
    [userId, today]
  );

  if (existing.rows.length === 0 || !existing.rows[0].check_in_time) {
    throw createError('Please check in first', 400);
  }

  if (existing.rows[0].check_out_time) {
    throw createError('Already checked out today', 400);
  }

  await pool.query(
    `UPDATE attendance
     SET check_out_time = CURRENT_TIME,
         check_out_location = $1,
         work_hours = EXTRACT(EPOCH FROM (CURRENT_TIME - check_in_time)) / 3600,
         updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $2 AND date = $3`,
    [location || null, userId, today]
  );

  const result = await pool.query(
    `SELECT * FROM attendance WHERE user_id = $1 AND date = $2`,
    [userId, today]
  );

  return formatAttendanceRecord(result.rows[0]);
};

/* ================= TODAY ================= */

export const getTodayAttendance = async (
  userId: number
): Promise<AttendanceRecord | null> => {
  const today = new Date().toISOString().split('T')[0];

  const result = await pool.query(
    `SELECT * FROM attendance WHERE user_id = $1 AND date = $2`,
    [userId, today]
  );

  return result.rows.length ? formatAttendanceRecord(result.rows[0]) : null;
};

/* ================= HISTORY ================= */

export const getAttendanceHistory = async (
  userId: number,
  page = 1,
  limit = 30
): Promise<{ records: AttendanceRecord[]; total: number; page: number; limit: number }> => {
  const offset = (page - 1) * limit;

  const result = await pool.query(
    `SELECT * FROM attendance
     WHERE user_id = $1
     ORDER BY date DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  const count = await pool.query(
    `SELECT COUNT(*) FROM attendance WHERE user_id = $1`,
    [userId]
  );

  return {
    records: result.rows.map(formatAttendanceRecord),
    total: Number(count.rows[0].count),
    page,
    limit,
  };
};

/* ================= WEEKLY ================= */

export const getWeeklyAttendance = async (
  userId: number
): Promise<AttendanceRecord[]> => {
  const today = new Date();
  const monday = new Date(today);
  monday.setDate(today.getDate() - today.getDay() + 1);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const result = await pool.query(
    `SELECT * FROM attendance
     WHERE user_id = $1
     AND date BETWEEN $2 AND $3
     ORDER BY date ASC`,
    [
      userId,
      monday.toISOString().split('T')[0],
      sunday.toISOString().split('T')[0],
    ]
  );

  return result.rows.map(formatAttendanceRecord);
};

/* ================= FORMAT ================= */

const formatAttendanceRecord = (row: any): AttendanceRecord => {
  const dateObj = new Date(row.date);
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return {
    id: row.id,
    userId: row.user_id,
    date: row.date,
    day: days[dateObj.getDay()],
    checkIn: row.check_in_time?.substring(0, 5),
    checkOut: row.check_out_time?.substring(0, 5),
    checkInLocation: row.check_in_location,
    checkOutLocation: row.check_out_location,
    status: row.status,
    workHours: row.work_hours ? Number(row.work_hours) : undefined,
  };
};
