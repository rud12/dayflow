import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Building, Briefcase, Calendar, Save, Loader2, DollarSign, Clock, CalendarDays } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { AttendanceRecord, LeaveRequest } from '@/types';

const Profile: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('profile');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [leaveData, setLeaveData] = useState<LeaveRequest[]>([]);
  const [payrollData, setPayrollData] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    dateOfBirth: '',
    gender: '',
    maritalStatus: '',
    emergencyContact: '',
    department: '',
    position: '',
    reportingManager: '',
    employmentType: '',
  });

  const isAdmin = user?.role === 'admin' || user?.role === 'hr';

  useEffect(() => {
    loadProfileData();
    if (activeTab === 'attendance') loadAttendance();
    if (activeTab === 'timeoff') loadLeaveRequests();
    if (activeTab === 'salary' && isAdmin) loadPayroll();
  }, [activeTab]);

  const loadProfileData = async () => {
    try {
      const response = await apiService.getProfile();
      if (response.success) {
        setProfileData(response.data);
        setFormData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          phone: response.data.phone || '',
          address: response.data.address || '',
          dateOfBirth: response.data.dateOfBirth || '',
          gender: response.data.gender || '',
          maritalStatus: response.data.maritalStatus || '',
          emergencyContact: response.data.emergencyContact || '',
          department: response.data.department || '',
          position: response.data.position || '',
          reportingManager: response.data.reportingManager || '',
          employmentType: response.data.employmentType || '',
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
  };

  const loadAttendance = async () => {
    try {
      const response = await apiService.getAttendanceHistory(1, 10);
      if (response.success) {
        setAttendanceData(response.data.records);
      }
    } catch (error) {
      console.error('Failed to load attendance:', error);
    }
  };

  const loadLeaveRequests = async () => {
    try {
      const response = await apiService.getLeaveRequests(1, 10);
      if (response.success) {
        setLeaveData(response.data.requests);
      }
    } catch (error) {
      console.error('Failed to load leave requests:', error);
    }
  };

  const loadPayroll = async () => {
    try {
      const response = await apiService.getPayrollRecords(1, 1);
      if (response.success && response.data.records.length > 0) {
        setPayrollData(response.data.records[0]);
      }
    } catch (error) {
      console.error('Failed to load payroll:', error);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      await updateProfile(formData);
      setIsLoading(false);
      setIsEditing(false);
      toast({
        title: "Profile Updated",
        description: "Your changes have been saved successfully.",
      });
      loadProfileData();
    } catch (error: any) {
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update profile",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground mt-1">View and manage your personal information</p>
          </div>
          {activeTab === 'profile' && !isEditing && (
            <Button onClick={() => setIsEditing(true)}>Edit Profile</Button>
          )}
          {activeTab === 'profile' && isEditing && (
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsEditing(false)}>Cancel</Button>
              <Button variant="gradient" onClick={handleSave} disabled={isLoading}>
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </div>
          )}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="profile">My Profile</TabsTrigger>
            {isAdmin && <TabsTrigger value="salary">Salary Info</TabsTrigger>}
            <TabsTrigger value="attendance">Attendance</TabsTrigger>
            <TabsTrigger value="timeoff">Time Off</TabsTrigger>
          </TabsList>

          {/* My Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="rounded-2xl bg-card p-6 shadow-card">
              <div className="flex items-center gap-6 pb-6 border-b border-border">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl gradient-primary text-3xl font-bold text-primary-foreground shadow-primary">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">
                    {user?.firstName} {user?.lastName}
                  </h2>
                  <p className="text-muted-foreground">{user?.position}</p>
                </div>
              </div>

              <div className="grid gap-6 pt-6 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Employee ID</Label>
                  <p className="text-foreground font-medium">{user?.employeeId || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <p className="text-foreground font-medium">{user?.email || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <Label>First Name {isEditing && <span className="text-destructive">*</span>}</Label>
                  {isEditing ? (
                    <Input
                      value={formData.firstName}
                      onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      required
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profileData?.firstName || 'N/A'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Last Name {isEditing && <span className="text-destructive">*</span>}</Label>
                  {isEditing ? (
                    <Input
                      value={formData.lastName}
                      onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      required
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profileData?.lastName || 'N/A'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Phone Number {isEditing && <span className="text-destructive">*</span>}</Label>
                  {isEditing ? (
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profileData?.phone || 'N/A'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Date of Birth {isEditing && <span className="text-destructive">*</span>}</Label>
                  {isEditing ? (
                    <Input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profileData?.dateOfBirth || 'N/A'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Gender {isEditing && <span className="text-destructive">*</span>}</Label>
                  {isEditing ? (
                    <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-foreground font-medium capitalize">{profileData?.gender || 'N/A'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Marital Status {isEditing && <span className="text-destructive">*</span>}</Label>
                  {isEditing ? (
                    <Select value={formData.maritalStatus} onValueChange={(value) => setFormData({ ...formData, maritalStatus: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single">Single</SelectItem>
                        <SelectItem value="married">Married</SelectItem>
                        <SelectItem value="divorced">Divorced</SelectItem>
                        <SelectItem value="widowed">Widowed</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-foreground font-medium capitalize">{profileData?.maritalStatus || 'N/A'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Emergency Contact {isEditing && <span className="text-destructive">*</span>}</Label>
                  {isEditing ? (
                    <Input
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profileData?.emergencyContact || 'N/A'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Department {isEditing && <span className="text-destructive">*</span>}</Label>
                  {isEditing ? (
                    <Input
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profileData?.department || 'N/A'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Position {isEditing && <span className="text-destructive">*</span>}</Label>
                  {isEditing ? (
                    <Input
                      value={formData.position}
                      onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profileData?.position || 'N/A'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Date of Joining</Label>
                  <p className="text-foreground font-medium">{profileData?.dateOfJoining || 'N/A'}</p>
                </div>
                <div className="space-y-2">
                  <Label>Reporting Manager {isEditing && <span className="text-destructive">*</span>}</Label>
                  {isEditing ? (
                    <Input
                      value={formData.reportingManager}
                      onChange={(e) => setFormData({ ...formData, reportingManager: e.target.value })}
                    />
                  ) : (
                    <p className="text-foreground font-medium">{profileData?.reportingManager || 'N/A'}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label>Employment Type {isEditing && <span className="text-destructive">*</span>}</Label>
                  {isEditing ? (
                    <Select value={formData.employmentType} onValueChange={(value) => setFormData({ ...formData, employmentType: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="full-time">Full-time</SelectItem>
                        <SelectItem value="part-time">Part-time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="text-foreground font-medium capitalize">{profileData?.employmentType || 'N/A'}</p>
                  )}
                </div>
              </div>

              <div className="mt-6 space-y-2">
                <Label>Address {isEditing && <span className="text-destructive">*</span>}</Label>
                {isEditing ? (
                  <Textarea
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    rows={2}
                  />
                ) : (
                  <p className="text-foreground font-medium">{profileData?.address || 'N/A'}</p>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Salary Info Tab (Admin only) */}
          {isAdmin && (
            <TabsContent value="salary" className="space-y-6">
              <div className="rounded-2xl bg-card p-6 shadow-card">
                <h3 className="text-lg font-semibold text-foreground mb-4">Salary Information</h3>
                {payrollData ? (
                  <div className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label>Basic Salary</Label>
                        <p className="text-foreground font-medium">${payrollData.basicSalary?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>House Rent Allowance</Label>
                        <p className="text-foreground font-medium">${payrollData.houseRentAllowance?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Medical Allowance</Label>
                        <p className="text-foreground font-medium">${payrollData.medicalAllowance?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Conveyance Allowance</Label>
                        <p className="text-foreground font-medium">${payrollData.conveyanceAllowance?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Special Allowance</Label>
                        <p className="text-foreground font-medium">${payrollData.specialAllowance?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Gross Salary</Label>
                        <p className="text-foreground font-medium">${payrollData.grossSalary?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Provident Fund</Label>
                        <p className="text-foreground font-medium">${payrollData.providentFund?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Professional Tax</Label>
                        <p className="text-foreground font-medium">${payrollData.professionalTax?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Income Tax</Label>
                        <p className="text-foreground font-medium">${payrollData.incomeTax?.toLocaleString() || '0'}</p>
                      </div>
                      <div className="space-y-2">
                        <Label>Net Salary</Label>
                        <p className="text-2xl font-bold text-foreground">${payrollData.netSalary?.toLocaleString() || '0'}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground">No payroll data available</p>
                )}
              </div>
            </TabsContent>
          )}

          {/* Attendance Tab */}
          <TabsContent value="attendance" className="space-y-6">
            <div className="rounded-2xl bg-card p-6 shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Recent Attendance</h3>
              {attendanceData.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Day</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Check In</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Check Out</th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {attendanceData.map((record) => (
                        <tr key={record.id} className="border-b border-border/50">
                          <td className="py-3 px-4 text-sm text-foreground">{new Date(record.date).toLocaleDateString()}</td>
                          <td className="py-3 px-4 text-sm text-foreground">{record.day}</td>
                          <td className="py-3 px-4 text-sm text-foreground">{record.checkIn || '-'}</td>
                          <td className="py-3 px-4 text-sm text-foreground">{record.checkOut || '-'}</td>
                          <td className="py-3 px-4 text-sm text-foreground capitalize">{record.status}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-muted-foreground">No attendance records found</p>
              )}
            </div>
          </TabsContent>

          {/* Time Off Tab */}
          <TabsContent value="timeoff" className="space-y-6">
            <div className="rounded-2xl bg-card p-6 shadow-card">
              <h3 className="text-lg font-semibold text-foreground mb-4">Time Off Requests</h3>
              {leaveData.length > 0 ? (
                <div className="space-y-3">
                  {leaveData.map((leave) => (
                    <div key={leave.id} className="border border-border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-foreground capitalize">{leave.type} Leave</p>
                          <p className="text-sm text-muted-foreground">
                            {leave.startDate} to {leave.endDate}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">{leave.reason}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          leave.status === 'approved' ? 'bg-success/10 text-success' :
                          leave.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                          'bg-warning/10 text-warning-foreground'
                        }`}>
                          {leave.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No time off requests found</p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default Profile;
