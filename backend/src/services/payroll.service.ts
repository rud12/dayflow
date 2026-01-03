import { pool } from '../database/connection';
import { createError } from '../middleware/errorHandler';

export interface PayrollRecord {
  id: number;
  userId: number;
  month: number;
  year: number;
  basicSalary: number;
  houseRentAllowance?: number;
  medicalAllowance?: number;
  conveyanceAllowance?: number;
  specialAllowance?: number;
  grossSalary: number;
  providentFund?: number;
  professionalTax?: number;
  incomeTax?: number;
  allowances: number;
  deductions: number;
  netSalary: number;
  status: 'pending' | 'paid';
}

export const getPayrollRecords = async (
  userId?: number,
  month?: number,
  year?: number,
  page: number = 1,
  limit: number = 12
): Promise<{ records: PayrollRecord[]; total: number; page: number; limit: number }> => {
  const offset = (page - 1) * limit;
  let query = 'SELECT * FROM payroll WHERE 1=1';
  const params: any[] = [];
  let paramCount = 1;

  if (userId) {
    query += ` AND user_id = $${paramCount}`;
    params.push(userId);
    paramCount++;
  }

  if (month) {
    query += ` AND month = $${paramCount}`;
    params.push(month);
    paramCount++;
  }

  if (year) {
    query += ` AND year = $${paramCount}`;
    params.push(year);
    paramCount++;
  }

  query += ` ORDER BY year DESC, month DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  params.push(limit, offset);

  const result = await pool.query(query, params);

  // Get total count
  let countQuery = 'SELECT COUNT(*) FROM payroll WHERE 1=1';
  const countParams: any[] = [];
  let countParamCount = 1;

  if (userId) {
    countQuery += ` AND user_id = $${countParamCount}`;
    countParams.push(userId);
    countParamCount++;
  }

  if (month) {
    countQuery += ` AND month = $${countParamCount}`;
    countParams.push(month);
    countParamCount++;
  }

  if (year) {
    countQuery += ` AND year = $${countParamCount}`;
    countParams.push(year);
    countParamCount++;
  }

  const countResult = await pool.query(countQuery, countParams);

  return {
    records: result.rows.map(formatPayrollRecord),
    total: parseInt(countResult.rows[0].count),
    page,
    limit,
  };
};

export const createPayrollRecord = async (
  data: {
    userId: number;
    month: number;
    year: number;
    basicSalary: number;
    houseRentAllowance?: number;
    medicalAllowance?: number;
    conveyanceAllowance?: number;
    specialAllowance?: number;
    providentFund?: number;
    professionalTax?: number;
    incomeTax?: number;
    allowances?: number;
    deductions?: number;
  }
): Promise<PayrollRecord> => {
  const { 
    userId, month, year, basicSalary, 
    houseRentAllowance = 0, medicalAllowance = 0, conveyanceAllowance = 0, specialAllowance = 0,
    providentFund = 0, professionalTax = 0, incomeTax = 0,
    allowances = 0, deductions = 0 
  } = data;

  // Check if record already exists
  const existing = await pool.query(
    'SELECT id FROM payroll WHERE user_id = $1 AND month = $2 AND year = $3',
    [userId, month, year]
  );

  if (existing.rows.length > 0) {
    throw createError('Payroll record already exists for this month and year', 409);
  }

  // Calculate totals
  const totalAllowances = houseRentAllowance + medicalAllowance + conveyanceAllowance + specialAllowance;
  const totalDeductions = providentFund + professionalTax + incomeTax;
  const grossSalary = basicSalary + totalAllowances;
  const netSalary = grossSalary - totalDeductions;

  const result = await pool.query(
    `INSERT INTO payroll (user_id, month, year, basic_salary, house_rent_allowance, medical_allowance, 
     conveyance_allowance, special_allowance, gross_salary, provident_fund, professional_tax, income_tax,
     allowances, deductions, net_salary, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'pending')
     RETURNING *`,
    [userId, month, year, basicSalary, houseRentAllowance, medicalAllowance, conveyanceAllowance, 
     specialAllowance, grossSalary, providentFund, professionalTax, incomeTax, totalAllowances, 
     totalDeductions, netSalary]
  );

  return formatPayrollRecord(result.rows[0]);
};

export const updatePayrollStatus = async (
  payrollId: number,
  status: 'pending' | 'paid'
): Promise<PayrollRecord> => {
  await pool.query('UPDATE payroll SET status = $1 WHERE id = $2', [status, payrollId]);

  const result = await pool.query('SELECT * FROM payroll WHERE id = $1', [payrollId]);
  if (result.rows.length === 0) {
    throw createError('Payroll record not found', 404);
  }

  return formatPayrollRecord(result.rows[0]);
};

const formatPayrollRecord = (row: any): PayrollRecord => {
  return {
    id: row.id,
    userId: row.user_id,
    month: row.month,
    year: row.year,
    basicSalary: parseFloat(row.basic_salary),
    houseRentAllowance: row.house_rent_allowance ? parseFloat(row.house_rent_allowance) : undefined,
    medicalAllowance: row.medical_allowance ? parseFloat(row.medical_allowance) : undefined,
    conveyanceAllowance: row.conveyance_allowance ? parseFloat(row.conveyance_allowance) : undefined,
    specialAllowance: row.special_allowance ? parseFloat(row.special_allowance) : undefined,
    grossSalary: parseFloat(row.gross_salary),
    providentFund: row.provident_fund ? parseFloat(row.provident_fund) : undefined,
    professionalTax: row.professional_tax ? parseFloat(row.professional_tax) : undefined,
    incomeTax: row.income_tax ? parseFloat(row.income_tax) : undefined,
    allowances: parseFloat(row.allowances),
    deductions: parseFloat(row.deductions),
    netSalary: parseFloat(row.net_salary),
    status: row.status,
  };
};

