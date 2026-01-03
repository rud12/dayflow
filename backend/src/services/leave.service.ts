import { pool } from '../database/connection';
import { createError } from '../middleware/errorHandler';

export interface LeaveRequest {
  id: number;
  userId: number;
  userName: string;
  type: 'paid' | 'sick' | 'unpaid';
  startDate: string;
  endDate: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  adminComment?: string;
  createdAt: string;
}

export const createLeaveRequest = async (
  userId: number,
  data: {
    type: 'paid' | 'sick' | 'unpaid';
    startDate: string;
    endDate: string;
    reason: string;
  }
): Promise<LeaveRequest> => {
  const { type, startDate, endDate, reason } = data;

  // Validate dates
  if (new Date(endDate) < new Date(startDate)) {
    throw createError('End date must be after start date', 400);
  }

  // Check for overlapping leave requests
  const overlapping = await pool.query(
    `SELECT id FROM leave_requests 
     WHERE user_id = $1 
     AND status = 'pending'
     AND (
       (start_date <= $2 AND end_date >= $2) OR
       (start_date <= $3 AND end_date >= $3) OR
       (start_date >= $2 AND end_date <= $3)
     )`,
    [userId, startDate, endDate]
  );

  if (overlapping.rows.length > 0) {
    throw createError('You have a pending leave request for these dates', 400);
  }

  // Get user name
  const userResult = await pool.query(
    `SELECT ep.first_name, ep.last_name 
     FROM employee_profiles ep 
     WHERE ep.user_id = $1`,
    [userId]
  );

  const userName = userResult.rows[0]
    ? `${userResult.rows[0].first_name} ${userResult.rows[0].last_name}`
    : 'Unknown';

  const result = await pool.query(
    `INSERT INTO leave_requests (user_id, type, start_date, end_date, reason, status)
     VALUES ($1, $2, $3, $4, $5, 'pending')
     RETURNING *`,
    [userId, type, startDate, endDate, reason]
  );

  return formatLeaveRequest(result.rows[0], userName);
};

export const getLeaveRequests = async (
  userId?: number,
  status?: 'pending' | 'approved' | 'rejected',
  page: number = 1,
  limit: number = 10
): Promise<{ requests: LeaveRequest[]; total: number; page: number; limit: number }> => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT lr.*, 
           ep.first_name, ep.last_name
    FROM leave_requests lr
    LEFT JOIN employee_profiles ep ON lr.user_id = ep.user_id
    WHERE 1=1
  `;
  const params: any[] = [];
  let paramCount = 1;

  if (userId) {
    query += ` AND lr.user_id = $${paramCount}`;
    params.push(userId);
    paramCount++;
  }

  if (status) {
    query += ` AND lr.status = $${paramCount}`;
    params.push(status);
    paramCount++;
  }

  query += ` ORDER BY lr.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) FROM leave_requests WHERE 1=1';
  const countParams: any[] = [];
  let countParamCount = 1;

  if (userId) {
    countQuery += ` AND user_id = $${countParamCount}`;
    countParams.push(userId);
    countParamCount++;
  }

  if (status) {
    countQuery += ` AND status = $${countParamCount}`;
    countParams.push(status);
    countParamCount++;
  }

  const countResult = await pool.query(countQuery, countParams);

  const requests = result.rows.map((row) =>
    formatLeaveRequest(row, `${row.first_name} ${row.last_name}`)
  );

  return {
    requests,
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
  };
};

export const updateLeaveRequestStatus = async (
  leaveId: number,
  adminId: number,
  status: 'approved' | 'rejected',
  adminComment?: string
): Promise<LeaveRequest> => {
  // Check if leave request exists
  const leaveResult = await pool.query('SELECT * FROM leave_requests WHERE id = $1', [leaveId]);
  if (leaveResult.rows.length === 0) {
    throw createError('Leave request not found', 404);
  }

  if (leaveResult.rows[0].status !== 'pending') {
    throw createError('Leave request has already been processed', 400);
  }

  // Update status
  await pool.query(
    `UPDATE leave_requests 
     SET status = $1, admin_comment = $2, reviewed_by = $3, reviewed_at = CURRENT_TIMESTAMP
     WHERE id = $4`,
    [status, adminComment || null, adminId, leaveId]
  );

  // Get updated record with user name
  const result = await pool.query(
    `SELECT lr.*, ep.first_name, ep.last_name
     FROM leave_requests lr
     LEFT JOIN employee_profiles ep ON lr.user_id = ep.user_id
     WHERE lr.id = $1`,
    [leaveId]
  );

  return formatLeaveRequest(result.rows[0], `${result.rows[0].first_name} ${result.rows[0].last_name}`);
};

const formatLeaveRequest = (row: any, userName: string): LeaveRequest => {
  return {
    id: row.id,
    userId: row.user_id,
    userName,
    type: row.type,
    startDate: row.start_date,
    endDate: row.end_date,
    reason: row.reason,
    status: row.status,
    adminComment: row.admin_comment,
    createdAt: row.created_at,
  };
};

