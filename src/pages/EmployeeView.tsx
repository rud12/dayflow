import React, { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { User, Mail, Phone, MapPin, Building, Briefcase, Calendar, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { apiService } from '@/services/api';
import { useToast } from '@/hooks/use-toast';

const EmployeeView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();
  const [employee, setEmployee] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Only admin/hr can view employee profiles
  if (user?.role !== 'admin' && user?.role !== 'hr') {
    return <Navigate to="/dashboard" replace />;
  }

  useEffect(() => {
    if (id) {
      loadEmployee();
    }
  }, [id]);

  const loadEmployee = async () => {
    try {
      setLoading(true);
      const response = await apiService.getEmployeeById(parseInt(id!));
      if (response.success) {
        setEmployee(response.data);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to load employee",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (!employee) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Employee not found</p>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Employee Profile</h1>
            <p className="text-muted-foreground mt-1">View-only employee information</p>
          </div>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-card">
          <div className="flex items-center gap-6 pb-6 border-b border-border">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary text-3xl font-bold text-primary-foreground shadow-primary">
              {employee.firstName?.[0]}{employee.lastName?.[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">
                {employee.firstName} {employee.lastName}
              </h2>
              <p className="text-muted-foreground">{employee.position}</p>
            </div>
          </div>

          <div className="grid gap-6 pt-6 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Employee ID</Label>
              <p className="text-foreground font-medium">{employee.employeeId}</p>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <p className="text-foreground font-medium">{employee.email}</p>
            </div>
            <div className="space-y-2">
              <Label>Phone</Label>
              <p className="text-foreground font-medium">{employee.phone || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <p className="text-foreground font-medium">{employee.department || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <Label>Position</Label>
              <p className="text-foreground font-medium">{employee.position || 'N/A'}</p>
            </div>
            <div className="space-y-2">
              <Label>Date of Joining</Label>
              <p className="text-foreground font-medium">{employee.dateOfJoining || 'N/A'}</p>
            </div>
            {employee.dateOfBirth && (
              <div className="space-y-2">
                <Label>Date of Birth</Label>
                <p className="text-foreground font-medium">{employee.dateOfBirth}</p>
              </div>
            )}
            {employee.gender && (
              <div className="space-y-2">
                <Label>Gender</Label>
                <p className="text-foreground font-medium capitalize">{employee.gender}</p>
              </div>
            )}
            {employee.maritalStatus && (
              <div className="space-y-2">
                <Label>Marital Status</Label>
                <p className="text-foreground font-medium capitalize">{employee.maritalStatus}</p>
              </div>
            )}
            {employee.emergencyContact && (
              <div className="space-y-2">
                <Label>Emergency Contact</Label>
                <p className="text-foreground font-medium">{employee.emergencyContact}</p>
              </div>
            )}
            {employee.reportingManager && (
              <div className="space-y-2">
                <Label>Reporting Manager</Label>
                <p className="text-foreground font-medium">{employee.reportingManager}</p>
              </div>
            )}
            {employee.employmentType && (
              <div className="space-y-2">
                <Label>Employment Type</Label>
                <p className="text-foreground font-medium capitalize">{employee.employmentType}</p>
              </div>
            )}
          </div>

          {employee.address && (
            <div className="mt-6 space-y-2">
              <Label>Address</Label>
              <p className="text-foreground font-medium">{employee.address}</p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default EmployeeView;

