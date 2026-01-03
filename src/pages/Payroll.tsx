import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, TrendingDown, FileText } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { apiService } from '@/services/api';
import { cn } from '@/lib/utils';

const Payroll: React.FC = () => {
  const { user } = useAuth();
  const [payrollRecords, setPayrollRecords] = useState<any[]>([]);
  const [currentPayroll, setCurrentPayroll] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPayroll();
  }, []);

  const loadPayroll = async () => {
    try {
      setLoading(true);
      const response = await apiService.getPayrollRecords(1, 12);
      if (response.success) {
        setPayrollRecords(response.data.records);
        if (response.data.records.length > 0) {
          setCurrentPayroll(response.data.records[0]);
        }
      }
    } catch (error) {
      console.error('Failed to load payroll:', error);
    } finally {
      setLoading(false);
    }
  };

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const payrollBreakdown = currentPayroll ? [
    { label: 'Basic Salary', amount: currentPayroll.basicSalary, type: 'earning' as const },
    { label: 'House Rent Allowance', amount: currentPayroll.houseRentAllowance || 0, type: 'earning' as const },
    { label: 'Medical Allowance', amount: currentPayroll.medicalAllowance || 0, type: 'earning' as const },
    { label: 'Conveyance Allowance', amount: currentPayroll.conveyanceAllowance || 0, type: 'earning' as const },
    { label: 'Special Allowance', amount: currentPayroll.specialAllowance || 0, type: 'earning' as const },
    { label: 'Provident Fund', amount: currentPayroll.providentFund || 0, type: 'deduction' as const },
    { label: 'Professional Tax', amount: currentPayroll.professionalTax || 0, type: 'deduction' as const },
    { label: 'Income Tax', amount: currentPayroll.incomeTax || 0, type: 'deduction' as const },
  ] : [];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="animate-fade-in">
          <h1 className="text-2xl font-bold text-foreground">Payroll</h1>
          <p className="text-muted-foreground mt-1">View your salary and compensation details</p>
        </div>

        {/* Net Salary Card */}
        <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up overflow-hidden relative">
          <div className="absolute inset-0 gradient-primary opacity-5" />
          <div className="relative">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl gradient-primary shadow-primary">
                <DollarSign className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Net Salary</p>
                <p className="text-sm text-muted-foreground">
                  {currentPayroll ? `${monthNames[currentPayroll.month - 1]} ${currentPayroll.year}` : 'N/A'}
                </p>
              </div>
            </div>
            <p className="text-4xl font-bold text-foreground">
              ${currentPayroll?.netSalary?.toLocaleString() || '0'}
            </p>
            <span className={cn(
              "inline-flex items-center mt-3 rounded-full px-3 py-1 text-xs font-medium capitalize",
              currentPayroll?.status === 'paid' 
                ? 'bg-success/10 text-success' 
                : 'bg-warning/10 text-warning-foreground'
            )}>
              {currentPayroll?.status || 'N/A'}
            </span>
          </div>
        </div>

        {/* Salary Breakdown */}
        <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '100ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Salary Breakdown</h3>
          <div className="space-y-4">
            {payrollBreakdown.map((item, index) => (
              <div
                key={item.label}
                className="flex items-center justify-between p-4 rounded-xl bg-muted/30 animate-fade-in"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-lg",
                    item.type === 'earning' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  )}>
                    {item.type === 'earning' ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                  </div>
                  <span className="font-medium text-foreground">{item.label}</span>
                </div>
                <span className={cn(
                  "font-semibold",
                  item.type === 'earning' ? 'text-success' : 'text-destructive'
                )}>
                  {item.type === 'earning' ? '+' : '-'}${item.amount.toLocaleString()}
                </span>
              </div>
            ))}
            
            {/* Total */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-accent border-2 border-primary/20">
              <span className="font-semibold text-foreground">Net Salary</span>
              <span className="text-xl font-bold text-primary">
                ${currentPayroll?.netSalary?.toLocaleString() || '0'}
              </span>
            </div>
          </div>
        </div>

        {/* Payment History */}
        <div className="rounded-2xl bg-card p-6 shadow-card animate-slide-up" style={{ animationDelay: '200ms' }}>
          <h3 className="text-lg font-semibold text-foreground mb-4">Payment History</h3>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading...</div>
          ) : payrollRecords.length > 0 ? (
            <div className="space-y-3">
              {payrollRecords.slice(0, 6).map((record, index) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-muted/30 transition-colors cursor-pointer animate-fade-in"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setCurrentPayroll(record)}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {monthNames[record.month - 1]} {record.year}
                      </p>
                      <p className="text-sm text-muted-foreground">Salary Payment</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-foreground">
                      ${record.netSalary?.toLocaleString() || '0'}
                    </p>
                    <span className={cn(
                      "text-xs font-medium",
                      record.status === 'paid' ? 'text-success' : 'text-warning-foreground'
                    )}>
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No payroll records found</div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Payroll;
