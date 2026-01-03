import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { apiService } from '@/services/api';
import { LeaveType, LeaveStatus, LeaveRequest } from '@/types';
import { cn } from '@/lib/utils';

const leaveTypeLabels: Record<LeaveType, string> = {
  paid: 'Paid Time off',
  sick: 'Sick Leave',
  unpaid: 'Unpaid Leaves',
};

const statusColors: Record<LeaveStatus, string> = {
  pending: 'bg-warning/10 text-warning-foreground',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
};

const statusIcons: Record<LeaveStatus, React.ElementType> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
};

const Leave: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: 'paid' as LeaveType,
    startDate: '',
    endDate: '',
    reason: '',
  });

  useEffect(() => {
    loadLeaveRequests();
  }, []);

  const loadLeaveRequests = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLeaveRequests(1, 100);
      if (response.success) {
        setLeaveRequests(response.data.requests.map((req: any) => ({
          id: String(req.id),
          userId: String(req.userId),
          userName: req.userName,
          type: req.type,
          startDate: req.startDate,
          endDate: req.endDate,
          reason: req.reason,
          status: req.status,
          adminComment: req.adminComment,
          createdAt: req.createdAt,
        })));
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to load leave requests",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.startDate || !formData.endDate || !formData.reason) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please fill in all fields.",
      });
      return;
    }

    try {
      const response = await apiService.createLeaveRequest({
        type: formData.type,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      });

      if (response.success) {
        setIsDialogOpen(false);
        setFormData({ type: 'paid', startDate: '', endDate: '', reason: '' });
        toast({
          title: "Leave Request Submitted! 📨",
          description: "Your leave request has been sent for approval.",
        });
        loadLeaveRequests();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to submit leave request",
      });
    }
  };

  const userLeaves =
    user?.role === 'admin' || user?.role === 'hr'
      ? leaveRequests
      : leaveRequests.filter(l => l.userId === user?.id);

  const handleApproveReject = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const response = await apiService.updateLeaveStatus(parseInt(id), status);
      if (response.success) {
        toast({
          title: `Time Off ${status === 'approved' ? 'Approved' : 'Rejected'}`,
          description: `The time off request has been ${status}.`,
        });
        loadLeaveRequests();
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.response?.data?.message || "Failed to update time off status",
      });
    }
  };

  const leaveBalance = {
    paid: 12,
    sick: 8,
    unpaid: 'Unlimited',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Time Off Management</h1>
            <p className="text-muted-foreground mt-1">
              Apply for time off and track your requests
            </p>
          </div>

          {user?.role !== 'admin' && user?.role !== 'hr' && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  New Time Off Request
                </Button>
              </DialogTrigger>

              <DialogContent>
                <DialogHeader>
                  <DialogTitle>New Time Off Request</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <Label>Request Type</Label>
                  <Select
                    value={formData.type}
                    onValueChange={(value: LeaveType) =>
                      setFormData({ ...formData, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paid">Paid Time off</SelectItem>
                      <SelectItem value="sick">Sick Leave</SelectItem>
                      <SelectItem value="unpaid">Unpaid Leaves</SelectItem>
                    </SelectContent>
                  </Select>

                  <Input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                  />

                  <Input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                  />

                  <Textarea
                    placeholder="Reason"
                    value={formData.reason}
                    onChange={(e) =>
                      setFormData({ ...formData, reason: e.target.value })
                    }
                  />

                  <Button type="submit">Submit</Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {Object.entries(leaveBalance).map(([type, balance]) => (
            <div key={type} className="p-4 bg-card rounded-xl">
              <p className="text-sm capitalize">{type} Leave</p>
              <p className="text-xl font-bold">
                {typeof balance === 'number' ? `${balance} days` : balance}
              </p>
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Leave;
