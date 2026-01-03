import { pool } from '../database/connection';
import { createError } from '../middleware/errorHandler';

export interface EmployeeProfile {
  id: number;
  employeeId: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  avatar?: string;
  department?: string;
  position?: string;
  dateOfJoining?: string;
  dateOfBirth?: string;
  gender?: string;
  maritalStatus?: string;
  emergencyContact?: string;
  reportingManager?: string;
  employmentType?: string;
  salary?: number;
  status?: string;
}

/* ===================== PROFILE ===================== */

export const getEmployeeProfile = async (userId: number): Promise<EmployeeProfile> => {
  const result = await pool.query(
    `SELECT u.id, u.employee_id, u.email, u.role, u.status,
            ep.first_name, ep.last_name, ep.phone, ep.address, ep.avatar,
            ep.department, ep.position, ep.date_of_joining, ep.date_of_birth,
            ep.gender, ep.marital_status, ep.emergency_contact, ep.reporting_manager,
            ep.employment_type, ep.salary
     FROM users u
     LEFT JOIN employee_profiles ep ON u.id = ep.user_id
     WHERE u.id = $1`,
    [userId]
  );

  if (result.rows.length === 0) {
    throw createError('Employee not found', 404);
  }

  const row = result.rows[0];
  return {
    id: row.id,
    employeeId: row.employee_id,
    email: row.email,
    role: row.role,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    address: row.address,
    avatar: row.avatar,
    department: row.department,
    position: row.position,
    dateOfJoining: row.date_of_joining,
    dateOfBirth: row.date_of_birth,
    gender: row.gender,
    maritalStatus: row.marital_status,
    emergencyContact: row.emergency_contact,
    reportingManager: row.reporting_manager,
    employmentType: row.employment_type,
    salary: row.salary ? parseFloat(row.salary) : undefined,
    status: row.status,
  };
};

/* ===================== UPDATE PROFILE ===================== */

export const updateEmployeeProfile = async (
  userId: number,
  updates: Partial<EmployeeProfile>
): Promise<EmployeeProfile> => {
  const updatesToApply: any = {};

  if (updates.firstName !== undefined) updatesToApply.first_name = updates.firstName;
  if (updates.lastName !== undefined) updatesToApply.last_name = updates.lastName;
  if (updates.phone !== undefined) updatesToApply.phone = updates.phone;
  if (updates.address !== undefined) updatesToApply.address = updates.address;
  if (updates.avatar !== undefined) updatesToApply.avatar = updates.avatar;
  if (updates.department !== undefined) updatesToApply.department = updates.department;
  if (updates.position !== undefined) updatesToApply.position = updates.position;
  if (updates.dateOfBirth !== undefined) updatesToApply.date_of_birth = updates.dateOfBirth;
  if (updates.gender !== undefined) updatesToApply.gender = updates.gender;
  if (updates.maritalStatus !== undefined) updatesToApply.marital_status = updates.maritalStatus;
  if (updates.emergencyContact !== undefined) updatesToApply.emergency_contact = updates.emergencyContact;
  if (updates.reportingManager !== undefined) updatesToApply.reporting_manager = updates.reportingManager;
  if (updates.employmentType !== undefined) updatesToApply.employment_type = updates.employmentType;

  if (Object.keys(updatesToApply).length === 0) {
    return getEmployeeProfile(userId);
  }

  const setClause = Object.keys(updatesToApply)
    .map((key, index) => `${key} = $${index + 2}`)
    .join(', ');

  await pool.query(
    `UPDATE employee_profiles SET ${setClause} WHERE user_id = $1`,
    [userId, ...Object.values(updatesToApply)]
  );

  return getEmployeeProfile(userId);
};

/* ===================== GET ALL EMPLOYEES (FIXED) ===================== */

export const getAllEmployees = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{ employees: EmployeeProfile[]; total: number; page: number; limit: number }> => {
  const offset = (page - 1) * limit;

  let query = `
    SELECT u.id, u.employee_id, u.email, u.role, u.status,
           ep.first_name, ep.last_name, ep.phone, ep.department,
           ep.position, ep.date_of_joining, ep.salary
    FROM users u
    LEFT JOIN employee_profiles ep ON u.id = ep.user_id
    WHERE LOWER(u.role) IN ('employee', 'hr')
  `;

  const params: any[] = [];
  let paramCount = 1;

  if (search) {
    query += ` AND (
      ep.first_name ILIKE $${paramCount} OR 
      ep.last_name ILIKE $${paramCount} OR 
      u.email ILIKE $${paramCount} OR
      u.employee_id ILIKE $${paramCount}
    )`;
    params.push(`%${search}%`);
    paramCount++;
  }

  query += ` ORDER BY ep.first_name ASC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  const countResult = await pool.query(
    `
    SELECT COUNT(*)
    FROM users u
    WHERE LOWER(u.role) IN ('employee', 'hr')
    `,
    []
  );

  const employees = result.rows.map((row) => ({
    id: row.id,
    employeeId: row.employee_id,
    email: row.email,
    role: row.role,
    firstName: row.first_name,
    lastName: row.last_name,
    phone: row.phone,
    department: row.department,
    position: row.position,
    dateOfJoining: row.date_of_joining,
    salary: row.salary ? parseFloat(row.salary) : undefined,
    status: row.status,
  }));

  return {
    employees,
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
  };
};

/* ===================== GET BY ID ===================== */

export const getEmployeeById = async (id: number): Promise<EmployeeProfile> => {
  return getEmployeeProfile(id);
};

/* ===================== UPDATE STATUS ===================== */

export const updateEmployeeStatus = async (
  userId: number,
  status: string
): Promise<void> => {
  const result = await pool.query(
    `UPDATE users SET status = $1 WHERE id = $2`,
    [status, userId]
  );

  if (result.rowCount === 0) {
    throw createError('Employee not found', 404);
  }
};
