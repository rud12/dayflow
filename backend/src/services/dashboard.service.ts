import { pool } from '../database/connection';

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  pendingLeaves: number;
  totalDepartments: number;
}

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const today = new Date().toISOString().split('T')[0];

  // Total employees
  const employeesResult = await pool.query(
    "SELECT COUNT(*) FROM users WHERE role = 'employee' AND status = 'active'"
  );
  const totalEmployees = parseInt(employeesResult.rows[0].count);

  // Present today
  const presentResult = await pool.query(
    `SELECT COUNT(DISTINCT user_id) 
     FROM attendance 
     WHERE date = $1 AND status IN ('present', 'late', 'half-day')`,
    [today]
  );
  const presentToday = parseInt(presentResult.rows[0].count);

  // Pending leaves
  const leavesResult = await pool.query(
    "SELECT COUNT(*) FROM leave_requests WHERE status = 'pending'"
  );
  const pendingLeaves = parseInt(leavesResult.rows[0].count);

  // Total departments
  const deptResult = await pool.query(
    'SELECT COUNT(DISTINCT department) FROM employee_profiles WHERE department IS NOT NULL'
  );
  const totalDepartments = parseInt(deptResult.rows[0].count);

  return {
    totalEmployees,
    presentToday,
    pendingLeaves,
    totalDepartments,
  };
};

export const getEmployeeDashboardStats = async (userId: number): Promise<{
  daysPresentThisMonth: number;
  leaveBalance: { paid: number; sick: number };
  pendingRequests: number;
}> => {
  const today = new Date();
  const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

  // Days present this month
  const presentResult = await pool.query(
    `SELECT COUNT(*) 
     FROM attendance 
     WHERE user_id = $1 
     AND date >= $2 
     AND date <= $3 
     AND status IN ('present', 'late', 'half-day')`,
    [userId, firstDayOfMonth.toISOString().split('T')[0], lastDayOfMonth.toISOString().split('T')[0]]
  );
  const daysPresentThisMonth = parseInt(presentResult.rows[0].count);

  // Leave balance (mock - in production, calculate from leave policy)
  const leaveBalance = { paid: 12, sick: 8 };

  // Pending requests
  const pendingResult = await pool.query(
    `SELECT COUNT(*) 
     FROM leave_requests 
     WHERE user_id = $1 AND status = 'pending'`,
    [userId]
  );
  const pendingRequests = parseInt(pendingResult.rows[0].count);

  return {
    daysPresentThisMonth,
    leaveBalance,
    pendingRequests,
  };
};

