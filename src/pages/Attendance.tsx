import React, { useState, useEffect } from 'react';
import { Clock, LogIn, LogOut, Calendar } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { cn } from '@/lib/utils';
import { AttendanceStatus, AttendanceRecord } from '@/types';

const statusColors: Record<AttendanceStatus, string> = {
  present: 'bg-success/10 text-success',
  absent: 'bg-destructive/10 text-destructive',
  'half-day': 'bg-warning/10 text-warning-foreground',
  late: 'bg-warning/10 text-warning-foreground',
  weekend: 'bg-muted text-muted-foreground',
  holiday: 'bg-info/10 text-info',
};

const statusLabels: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  'half-day': 'Half Day',
  late: 'Late',
  weekend: 'Weekend',
  holiday: 'Holiday',
};

const Attendance: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [checkedIn, setCheckedIn] = useState(false);
  const [checkInTime, setCheckInTime] = useState<string | null>(null);
  const [userAttendance, setUserAttendance] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [weeklyAttendance, setWeeklyAttendance] = useState<AttendanceRecord[]>([]);

  useEffect(() => {
    loadAttendance();
    loadTodayAttendance();
    loadWeeklyAttendance();
  }, []);

  const loadTodayAttendance = async () => {
    try {
      const response = await apiService.getTodayAttendance();
      if (response.success && response.data) {
        setCheckedIn(!!response.data.checkIn);
        setCheckInTime(response.data.checkIn || null);
      }
    } catch (error) {
      // No attendance today, that's fine
    }
  };

  const loadAttendance = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAttendanceHistory(1, 14);
      if (response.success) {
        setUserAttendance(response.data.records);
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to load attendance history",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWeeklyAttendance = async () => {
    try {
      const response = await apiService.getWeeklyAttendance();
      if (response.success) {
        setWeeklyAttendance(response.data);
      }
    } catch (error) {
      // Handle error silently
    }
  };

  const getLocation = (): Promise<string> => {
    return new Promise((resolve) => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve(`${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`);
          },
          () => {
            resolve('Location unavailable');
          }
        );
      } else {
        resolve('Location unavailable');
      }
    });
  };

  const handleCheckIn = async () => {
    try {
      const location = await getLocation();
      const response = await apiService.checkIn(location);
      if (response.success) {
        const record = response.data;
        setCheckInTime(record.checkIn || null);
        setCheckedIn(true);
        toast({
          title: "Checked In Successfully! ✅",
          description: `You checked in at ${record.checkIn}${location !== 'Location unavailable' ? ` (Location: ${location})` : ''}`,
        });
        loadAttendance();
        loadWeeklyAttendance();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to check in",
      });
    }
  };

  const handleCheckOut = async () => {
    try {
      const location = await getLocation();
      const response = await apiService.checkOut(location);
      if (response.success) {
        toast({
          title: "Checked Out Successfully! 👋",
          description: `You checked out at ${response.data.checkOut}${location !== 'Location unavailable' ? ` (Location: ${location})` : ''}`,
        });
        setCheckedIn(false);
        setCheckInTime(null);
        loadAttendance();
        loadWeeklyAttendance();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to check out",
      });
    }
  };

  const today = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Attendance</h1>
          <p className="text-muted-foreground mt-1">Track your daily attendance and work hours</p>
        </div>

        {/* Check In/Out Card */}
        <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{today}</span>
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                {checkedIn ? 'You are currently working' : 'Start your work day'}
              </h3>
              {checkInTime && (
                <p className="text-sm text-muted-foreground mt-1">
                  Checked in at {checkInTime}
                </p>
              )}
            </div>
            <div className="flex gap-3">
              {!checkedIn ? (
                <Button
                  variant="gradient"
                  size="lg"
                  onClick={handleCheckIn}
                  className="min-w-[140px]"
                >
                  <LogIn className="h-5 w-5 mr-2" />
                  Check In
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={handleCheckOut}
                  className="min-w-[140px]"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Check Out
                </Button>
              )}
            </div>
          </div>

          {/* Current Status Indicator */}
          <div className="mt-6 flex items-center gap-4 p-4 rounded-xl bg-muted/50">
            <div className={cn(
              "h-3 w-3 rounded-full",
              checkedIn ? "bg-success animate-pulse" : "bg-destructive"
            )} />
            <span className="text-sm font-medium text-foreground">
              {checkedIn ? 'Active Session' : 'No Active Session'}
            </span>
            <Clock className="h-4 w-4 text-muted-foreground ml-auto" />
            <span className="text-sm text-muted-foreground">
              {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">This Week's Summary</h3>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-4">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => {
              const record = weeklyAttendance[index];
              const status = (record?.status as AttendanceStatus) || 'absent';
              return (
                <div
                  key={day}
                  className={cn(
                    "flex flex-col items-center p-3 rounded-xl transition-all",
                    statusColors[status]
                  )}
                >
                  <span className="text-xs font-medium opacity-70">{day}</span>
                  <span className="text-sm font-semibold mt-1">{statusLabels[status]}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Attendance History */}
        <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Attendance History</h3>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : userAttendance.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No attendance records found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Date</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Day</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Check In</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Check Out</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Hours</th>
                    <th className="py-3 px-4 text-left text-sm font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {userAttendance.map((record, index) => (
                    <tr 
                      key={record.id} 
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                    <td className="py-3 px-4 text-sm text-foreground">
                      {new Date(record.date).toLocaleDateString('en-US', { 
                        month: 'short', 
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {new Date(record.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </td>
                    <td className="py-3 px-4 text-sm text-foreground">
                      {record.checkIn || '-'}
                      {record.checkInLocation && (
                        <span className="text-xs text-muted-foreground block">{record.checkInLocation}</span>
                      )}
                    </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                      {record.checkOut || '-'}
                      {record.checkOutLocation && (
                        <span className="text-xs text-muted-foreground block">{record.checkOutLocation}</span>
                      )}
                    </td>
                      <td className="py-3 px-4 text-sm text-foreground">
                        {record.workHours ? `${record.workHours}h` : '-'}
                      </td>
                      <td className="py-3 px-4">
                        <span className={cn(
                          "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                          statusColors[record.status as AttendanceStatus]
                        )}>
                          {statusLabels[record.status as AttendanceStatus]}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Attendance;
