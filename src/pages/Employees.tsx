import React, { useState, useEffect } from 'react';
import { Search, Users, Mail, Phone, Building } from 'lucide-react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/api';
import { User } from '@/types';
import { cn } from '@/lib/utils';

const Employees: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Only admins and HR can access
  if (user?.role !== 'admin' && user?.role !== 'hr') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);

      // ✅ CORRECT API CALL
      const response = await apiService.getEmployees(1, 100, searchQuery);

      if (response?.success && Array.isArray(response.data?.employees)) {
        setEmployees(
          response.data.employees.map((emp: any) => ({
            id: String(emp.id),
            employeeId: emp.employeeId,
            email: emp.email,
            role: emp.role,
            firstName: emp.firstName || '',
            lastName: emp.lastName || '',
            phone: emp.phone || '',
            department: emp.department || '',
            position: emp.position || '',
            dateOfJoining: emp.dateOfJoining || '',
            salary: emp.salary || 0,
          }))
        );
      } else {
        setEmployees([]);
      }
    } catch (error) {
      console.error('Failed to load employees:', error);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadEmployees();
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const departments = [...new Set(employees.map(e => e.department).filter(Boolean))];

  const handleEmployeeClick = (employee: User) => {
    navigate(`/employee/${employee.id}`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employees</h1>
            <p className="text-muted-foreground mt-1">
              Manage and view all employee records
            </p>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-5 w-5" />
            <span className="font-medium">{employees.length} employees</span>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 max-w-md"
          />
        </div>

        {/* Department Summary */}
        {departments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <span
                key={dept}
                className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground"
              >
                <Building className="h-3 w-3" />
                {dept}
                <span className="ml-1 rounded-full bg-primary/20 px-1.5 text-primary">
                  {employees.filter(e => e.department === dept).length}
                </span>
              </span>
            ))}
          </div>
        )}

        {/* Employee Grid */}
        {loading ? (
          <div className="text-center py-12 text-muted-foreground">Loading...</div>
        ) : filteredEmployees.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredEmployees.map((employee) => (
              <div
                key={employee.id}
                onClick={() => handleEmployeeClick(employee)}
                className="group cursor-pointer rounded-2xl bg-card p-5 shadow-card hover:shadow-card-hover transition-all"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary text-lg font-bold text-primary-foreground">
                    {employee.firstName[0] || '?'}
                    {employee.lastName[0] || ''}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">
                      {employee.firstName} {employee.lastName}
                    </h3>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                    <span className={cn(
                      "inline-flex mt-2 rounded-full px-2 py-0.5 text-xs font-medium capitalize",
                      employee.role === 'admin'
                        ? 'bg-primary/10 text-primary'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {employee.role}
                    </span>
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {employee.email}
                  </div>
                  {employee.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {employee.phone}
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    {employee.department || 'N/A'}
                  </div>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="mt-3 w-full"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEmployeeClick(employee);
                  }}
                >
                  View Profile
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">No employees found.</p>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Employees;
