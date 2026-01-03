export type UserRole = 'admin' | 'hr' | 'employee';
export type EmploymentType = 'full-time' | 'part-time' | 'contract' | 'intern';
export type Gender = 'male' | 'female' | 'other';
export type MaritalStatus = 'single' | 'married' | 'divorced' | 'widowed';

export interface User {
  id: string;
  employeeId: string;
  email: string;
  role: UserRole;
  firstName: string;
  lastName: string;
  avatar?: string;
  phone?: string;
  address?: string;
  department: string;
  position: string;
  dateOfJoining: string;
  salary: number;
  dateOfBirth?: string;
  gender?: Gender;
  maritalStatus?: MaritalStatus;
  emergencyContact?: string;
  reportingManager?: string;
  employmentType?: EmploymentType;
  status?: 'active' | 'inactive' | 'suspended';
  secretQuestion?: string;
  secretAnswer?: string;
}

export type AttendanceStatus = 'present' | 'absent' | 'half-day' | 'late' | 'weekend' | 'holiday';

export interface AttendanceRecord {
  id: string;
  userId: string;
  date: string;
  day?: string;
  checkIn?: string;
  checkOut?: string;
  checkInLocation?: string;
  checkOutLocation?: string;
  status: AttendanceStatus;
  workHours?: number;
}

export type LeaveType = 'paid' | 'sick' | 'unpaid';
export type TimeOffType = 'paid-time-off' | 'sick-leave' | 'unpaid-leaves';
export type LeaveStatus = 'pending' | 'approved' | 'rejected';

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  type: LeaveType;
  startDate: string;
  endDate: string;
  reason: string;
  status: LeaveStatus;
  adminComment?: string;
  createdAt: string;
}

export interface PayrollRecord {
  id: string;
  userId: string;
  month: string;
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

export interface DashboardStats {
  totalEmployees: number;
  presentToday: number;
  pendingLeaves: number;
  totalDepartments: number;
}
