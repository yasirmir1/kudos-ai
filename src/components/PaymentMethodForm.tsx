import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  CardElement,
  useStripe,
  useElements
} from '@stripe/react-stripe-js';

const stripePromise = loadStripe('pk_test_51Rs8oa4KgY8wu4UQ4vOk8g8SyArzfGsGa0hcqrhKwg2c3TGWZDt6gMv8FqSKEFhf7Gdo6q1OwjOuOt8KA2Oag1bz00cWbNgBYc');

interface PaymentMethodFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const PaymentForm = ({ onSuccess, onCancel }: PaymentMethodFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !user) {
      toast({
        title: "Error",
        description: "Payment system not ready or user not authenticated",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Create SetupIntent
      const { data, error } = await supabase.functions.invoke('create-setup-intent');
      
      if (error) throw error;

      const { client_secret } = data;

      // Confirm the SetupIntent with the card
      const cardElement = elements.getElement(CardElement);
      if (!cardElement) throw new Error("Card element not found");

      const { error: stripeError, setupIntent } = await stripe.confirmCardSetup(
        client_secret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              email: user.email,
            },
          },
        }
      );

      if (stripeError) {
        throw new Error(stripeError.message);
      }

      if (setupIntent.status === 'succeeded') {
        toast({
          title: "Success",
          description: "Payment method added successfully! Your subscription will continue after the trial ends.",
        });
        onSuccess?.();
      }
    } catch (error) {
      console.error('Error setting up payment method:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add payment method",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Add Payment Method</CardTitle>
        <CardDescription>
          Add a payment method to continue your subscription after the trial ends.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="p-4 border rounded-md">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: 'hsl(var(--foreground))',
                    '::placeholder': {
                      color: 'hsl(var(--muted-foreground))',
                    },
                  },
                },
              }}
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!stripe || loading}
              className="flex-1"
            >
              {loading ? "Processing..." : "Add Payment Method"}
            </Button>
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={loading}
              >
                Cancel
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export const PaymentMethodForm = (props: PaymentMethodFormProps) => {
  return (
    <Elements stripe={stripePromise}>
      <PaymentForm {...props} />
    </Elements>
  );
};