import React, { useState, useEffect } from 'react';
import { Users, UserCheck, Calendar, Building, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { RecentActivity } from '@/components/dashboard/RecentActivity';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { apiService } from '@/services/api';
import { User } from '@/types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === 'admin' || user?.role === 'hr';
  const [stats, setStats] = useState<any>(null);
  const [pendingLeaves, setPendingLeaves] = useState<any[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const [statsResponse, leavesResponse, employeesResponse] = await Promise.all([
        apiService.getDashboardStats(),
        apiService.getLeaveRequests(1, 10, 'pending'),
        isAdmin ? apiService.getAllEmployees(1, 100) : Promise.resolve(null),
      ]);

      if (statsResponse.success) {
        setStats(statsResponse.data);
      }

      if (leavesResponse.success) {
        setPendingLeaves(leavesResponse.data.requests);
      }

      if (employeesResponse?.success) {
        setEmployees(employeesResponse.data.employees.map((emp: any) => ({
          id: String(emp.id),
          employeeId: emp.employeeId,
          email: emp.email,
          role: emp.role,
          firstName: emp.firstName,
          lastName: emp.lastName,
          phone: emp.phone,
          department: emp.department || '',
          position: emp.position || '',
          dateOfJoining: emp.dateOfJoining || '',
          salary: emp.salary || 0,
        })));
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.employeeId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleEmployeeClick = (employee: User) => {
    // Navigate to employee view (view-only mode)
    navigate(`/employee/${employee.id}`);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">
            {greeting()}, {user?.firstName}! 👋
          </h1>
          <p className="text-muted-foreground mt-1">
            {isAdmin 
              ? "Here's what's happening with your team today." 
              : "Here's your work summary for today."
            }
          </p>
        </div>

        {/* Stats Grid */}
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading...</div>
        ) : isAdmin ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Employees"
              value={stats?.totalEmployees || 0}
              icon={Users}
              trend={{ value: 12, isPositive: true }}
              delay={0}
            />
            <StatCard
              title="Present Today"
              value={stats?.presentToday || 0}
              icon={UserCheck}
              trend={{ value: 5, isPositive: true }}
              delay={50}
            />
            <StatCard
              title="Pending Leaves"
              value={stats?.pendingLeaves || 0}
              icon={Calendar}
              delay={100}
            />
            <StatCard
              title="Departments"
              value={stats?.totalDepartments || 0}
              icon={Building}
              delay={150}
            />
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              title="Days Present (This Month)"
              value={stats?.daysPresentThisMonth || 0}
              icon={UserCheck}
              trend={{ value: 95, isPositive: true }}
              delay={0}
            />
            <StatCard
              title="Leave Balance"
              value={`${stats?.leaveBalance?.paid || 0} days`}
              icon={Calendar}
              delay={50}
            />
            <StatCard
              title="Pending Requests"
              value={stats?.pendingRequests || 0}
              icon={Calendar}
              delay={100}
            />
          </div>
        )}

        {/* Employee Cards (Admin/HR) */}
        {isAdmin && (
          <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '200ms' }}>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Employees</h3>
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by name, ID, or department..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  onClick={() => handleEmployeeClick(employee)}
                  className="cursor-pointer rounded-xl border border-border bg-card p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full gradient-primary text-lg font-bold text-primary-foreground">
                      {employee.firstName[0]}{employee.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">
                        {employee.firstName} {employee.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{employee.position}</p>
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
          </div>
        )}

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-2">
          <QuickActions />
          <RecentActivity />
        </div>

        {/* Admin-specific sections */}
        {isAdmin && (
          <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '400ms' }}>
            <h3 className="mb-4 text-lg font-semibold text-foreground">Pending Leave Approvals</h3>
            {pendingLeaves.length > 0 ? (
              <div className="space-y-3">
                {pendingLeaves.slice(0, 3).map((leave) => (
                  <div 
                    key={leave.id} 
                    className="flex items-center justify-between rounded-lg bg-muted/50 p-4"
                  >
                    <div>
                      <p className="font-medium text-foreground">{leave.userName}</p>
                      <p className="text-sm text-muted-foreground">
                        {leave.type.charAt(0).toUpperCase() + leave.type.slice(1)} Leave • {leave.startDate} to {leave.endDate}
                      </p>
                    </div>
                    <span className="rounded-full bg-warning/20 px-3 py-1 text-xs font-medium text-warning-foreground">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground">No pending leave requests.</p>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
