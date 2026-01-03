import bcrypt from 'bcrypt';
import { pool } from './connection';
import { logger } from '../utils/logger';

const seedDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Clear existing data
    await client.query('TRUNCATE TABLE payroll, leave_requests, attendance, employee_profiles, users RESTART IDENTITY CASCADE');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const employeePassword = await bcrypt.hash('employee123', 10);

    // Insert users
    const adminUser = await client.query(`
      INSERT INTO users (employee_id, email, password_hash, role, status)
      VALUES ('EMP001', 'admin@dayflow.com', $1, 'admin', 'active')
      RETURNING id, employee_id, email, role
    `, [adminPassword]);

    const hrUser = await client.query(`
      INSERT INTO users (employee_id, email, password_hash, role, status)
      VALUES ('EMP006', 'hr@dayflow.com', $1, 'hr', 'active')
      RETURNING id, employee_id, email, role
    `, [adminPassword]);

    const employee1 = await client.query(`
      INSERT INTO users (employee_id, email, password_hash, role, status)
      VALUES ('EMP002', 'john.smith@dayflow.com', $1, 'employee', 'active')
      RETURNING id, employee_id, email, role
    `, [employeePassword]);

    const employee2 = await client.query(`
      INSERT INTO users (employee_id, email, password_hash, role, status)
      VALUES ('EMP003', 'emily.chen@dayflow.com', $1, 'employee', 'active')
      RETURNING id, employee_id, email, role
    `, [employeePassword]);

    const employee3 = await client.query(`
      INSERT INTO users (employee_id, email, password_hash, role, status)
      VALUES ('EMP004', 'michael.brown@dayflow.com', $1, 'employee', 'active')
      RETURNING id, employee_id, email, role
    `, [employeePassword]);

    const employee4 = await client.query(`
      INSERT INTO users (employee_id, email, password_hash, role, status)
      VALUES ('EMP005', 'jessica.wilson@dayflow.com', $1, 'employee', 'active')
      RETURNING id, employee_id, email, role
    `, [employeePassword]);

    const adminId = adminUser.rows[0].id;
    const hrId = hrUser.rows[0].id;
    const emp1Id = employee1.rows[0].id;
    const emp2Id = employee2.rows[0].id;
    const emp3Id = employee3.rows[0].id;
    const emp4Id = employee4.rows[0].id;

    // Insert employee profiles
    await client.query(`
      INSERT INTO employee_profiles (user_id, first_name, last_name, phone, address, department, position, date_of_joining, salary)
      VALUES
        ($1, 'Sarah', 'Johnson', '+1 234 567 8900', '123 Corporate Ave, New York, NY 10001', 'Human Resources', 'HR Manager', '2022-01-15', 85000),
        ($2, 'HR', 'Officer', '+1 234 567 8905', '123 Corporate Ave, New York, NY 10001', 'Human Resources', 'HR Officer', '2022-01-15', 80000),
        ($3, 'John', 'Smith', '+1 234 567 8901', '456 Worker St, New York, NY 10002', 'Engineering', 'Software Developer', '2023-03-20', 72000),
        ($4, 'Emily', 'Chen', '+1 234 567 8902', '789 Tech Blvd, New York, NY 10003', 'Design', 'UI/UX Designer', '2023-06-10', 68000),
        ($5, 'Michael', 'Brown', '+1 234 567 8903', '321 Finance Row, New York, NY 10004', 'Finance', 'Financial Analyst', '2022-09-01', 75000),
        ($6, 'Jessica', 'Wilson', '+1 234 567 8904', '654 Marketing Lane, New York, NY 10005', 'Marketing', 'Marketing Manager', '2023-01-05', 70000)
    `, [adminId, hrId, emp1Id, emp2Id, emp3Id, emp4Id]);

    // Insert attendance records (last 30 days)
    const today = new Date();
    const attendanceInserts = [];
    
    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayOfWeek = date.getDay();
      const dateStr = date.toISOString().split('T')[0];

      // Skip weekends
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        for (const userId of [adminId, hrId, emp1Id, emp2Id, emp3Id, emp4Id]) {
          attendanceInserts.push({
            userId,
            date: dateStr,
            status: 'weekend',
            checkIn: null,
            checkOut: null,
            workHours: null,
          });
        }
        continue;
      }

      // Generate attendance for each employee
      for (const userId of [adminId, hrId, emp1Id, emp2Id, emp3Id, emp4Id]) {
        const statuses = ['present', 'present', 'present', 'present', 'late', 'half-day', 'absent'];
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        
        let checkIn = null;
        let checkOut = null;
        let workHours = null;

        if (status !== 'absent') {
          const hour = status === 'late' ? 10 : 9;
          const minute = Math.floor(Math.random() * 30);
          checkIn = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
          
          if (status !== 'half-day') {
            const outHour = 18;
            const outMinute = Math.floor(Math.random() * 30);
            checkOut = `${String(outHour).padStart(2, '0')}:${String(outMinute).padStart(2, '0')}:00`;
            workHours = (8 + Math.random() * 0.5).toFixed(2);
          } else {
            checkOut = `13:${String(Math.floor(Math.random() * 30)).padStart(2, '0')}:00`;
            workHours = (4 + Math.random() * 0.5).toFixed(2);
          }
        }

        attendanceInserts.push({
          userId,
          date: dateStr,
          status,
          checkIn,
          checkOut,
          workHours,
        });
      }
    }

    // Batch insert attendance
    for (const record of attendanceInserts) {
      await client.query(`
        INSERT INTO attendance (user_id, date, check_in, check_out, status, work_hours)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (user_id, date) DO NOTHING
      `, [record.userId, record.date, record.checkIn, record.checkOut, record.status, record.workHours]);
    }

    // Insert leave requests
    await client.query(`
      INSERT INTO leave_requests (user_id, type, start_date, end_date, reason, status, admin_comment, reviewed_by, reviewed_at)
      VALUES
        ($1, 'paid', '2026-01-10', '2026-01-12', 'Family vacation planned for the new year.', 'pending', NULL, NULL, NULL),
        ($2, 'sick', '2026-01-05', '2026-01-06', 'Not feeling well, need to rest.', 'approved', 'Get well soon!', $5, CURRENT_TIMESTAMP),
        ($3, 'unpaid', '2026-01-20', '2026-01-25', 'Personal matters to attend to.', 'pending', NULL, NULL, NULL),
        ($4, 'paid', '2025-12-28', '2025-12-30', 'Year-end holidays.', 'approved', 'Approved. Enjoy your holidays!', $5, CURRENT_TIMESTAMP)
    `, [emp1Id, emp2Id, emp3Id, emp4Id, adminId]);

    // Insert payroll records
    const employees = [
      { id: adminId, salary: 85000 },
      { id: hrId, salary: 80000 },
      { id: emp1Id, salary: 72000 },
      { id: emp2Id, salary: 68000 },
      { id: emp3Id, salary: 75000 },
      { id: emp4Id, salary: 70000 },
    ];

    for (const emp of employees) {
      const basicSalary = emp.salary / 12;
      const houseRentAllowance = Math.floor(basicSalary * 0.1);
      const medicalAllowance = Math.floor(basicSalary * 0.03);
      const conveyanceAllowance = Math.floor(basicSalary * 0.01);
      const specialAllowance = Math.floor(basicSalary * 0.01);
      const grossSalary = basicSalary + houseRentAllowance + medicalAllowance + conveyanceAllowance + specialAllowance;
      const providentFund = Math.floor(basicSalary * 0.05);
      const professionalTax = Math.floor(basicSalary * 0.02);
      const incomeTax = Math.floor(basicSalary * 0.03);
      const totalDeductions = providentFund + professionalTax + incomeTax;
      const netSalary = grossSalary - totalDeductions;
      const totalAllowances = houseRentAllowance + medicalAllowance + conveyanceAllowance + specialAllowance;

      await client.query(`
        INSERT INTO payroll (user_id, month, year, basic_salary, house_rent_allowance, medical_allowance,
         conveyance_allowance, special_allowance, gross_salary, provident_fund, professional_tax, income_tax,
         allowances, deductions, net_salary, status)
        VALUES ($1, 1, 2026, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending')
        ON CONFLICT (user_id, month, year) DO NOTHING
      `, [emp.id, basicSalary, houseRentAllowance, medicalAllowance, conveyanceAllowance, specialAllowance,
          grossSalary, providentFund, professionalTax, incomeTax, totalAllowances, totalDeductions, netSalary]);
    }

    await client.query('COMMIT');
    logger.info('Database seeded successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    logger.error('Error seeding database:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
};

seedDatabase().catch(console.error);

