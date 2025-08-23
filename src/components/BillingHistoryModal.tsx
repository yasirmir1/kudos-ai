import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  CreditCard, 
  Download, 
  ExternalLink, 
  Calendar, 
  DollarSign,
  Loader2,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  invoice_pdf?: string;
  hosted_invoice_url?: string;
  period_start?: string;
  period_end?: string;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  payment_method: string;
}

interface BillingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const BillingHistoryModal: React.FC<BillingHistoryModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (isOpen) {
      fetchBillingHistory();
    }
  }, [isOpen]);

  const fetchBillingHistory = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('get-billing-history');
      
      if (error) throw error;
      
      setInvoices(data.invoices || []);
      setPayments(data.payments || []);
    } catch (err) {
      console.error('Error fetching billing history:', err);
      setError('Failed to load billing history');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
      case 'succeeded':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Receipt className="h-5 w-5" />
            <span>Billing History</span>
          </DialogTitle>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
            <p className="text-sm text-blue-800">
              📝 <strong>Development Mode:</strong> This shows test data from Stripe's test environment. 
              In production, you'll see your actual billing history.
            </p>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <span className="ml-2 text-muted-foreground">Loading billing history...</span>
            </div>
          ) : error ? (
            <div className="flex items-center justify-center py-8 text-destructive">
              <AlertCircle className="h-5 w-5 mr-2" />
              <span>{error}</span>
            </div>
          ) : (
            <>
              {/* Invoices Section */}
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">Invoices</h3>
                  <Badge variant="secondary">{invoices.length}</Badge>
                </div>

                {invoices.length === 0 ? (
                  <Card>
                    <CardContent className="py-8 text-center text-muted-foreground">
                      <Receipt className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No invoices found</p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {invoices.map((invoice) => (
                      <Card key={invoice.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-3">
                                <span className="font-medium">{invoice.description}</span>
                                <Badge className={getStatusColor(invoice.status)}>
                                  {invoice.status}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(invoice.date)}
                                </span>
                                {invoice.period_start && invoice.period_end && (
                                  <span>
                                    Service period: {formatDate(invoice.period_start)} - {formatDate(invoice.period_end)}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right space-y-2">
                              <div className="text-lg font-semibold">
                                {formatAmount(invoice.amount, invoice.currency)}
                              </div>
                              <div className="flex space-x-2">
                                {invoice.invoice_pdf && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(invoice.invoice_pdf, '_blank')}
                                  >
                                    <Download className="h-3 w-3 mr-1" />
                                    PDF
                                  </Button>
                                )}
                                {invoice.hosted_invoice_url && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(invoice.hosted_invoice_url, '_blank')}
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Separator if both sections have content */}
              {invoices.length > 0 && payments.length > 0 && <Separator />}

              {/* Payments Section */}
              {payments.length > 0 && (
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold">Other Payments</h3>
                    <Badge variant="secondary">{payments.length}</Badge>
                  </div>

                  <div className="space-y-3">
                    {payments.map((payment) => (
                      <Card key={payment.id}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-3">
                                <span className="font-medium">{payment.description}</span>
                                <Badge className={getStatusColor(payment.status)}>
                                  {payment.status}
                                </Badge>
                              </div>
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {formatDate(payment.date)}
                                </span>
                                <span>via {payment.payment_method}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-lg font-semibold">
                                {formatAmount(payment.amount, payment.currency)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {invoices.length === 0 && payments.length === 0 && (
                <Card>
                  <CardContent className="py-12 text-center text-muted-foreground">
                    <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-2">No billing history found</h3>
                    <p>You haven't made any payments yet.</p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BillingHistoryModal;