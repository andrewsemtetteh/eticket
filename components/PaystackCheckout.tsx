"use client";

import { useState, useEffect } from 'react';

declare global {
  interface Window {
    PaystackPop: {
      setup: (options: {
        key: string;
        email: string;
        amount: number;
        currency: string;
        ref: string;
        channels?: string[];
        metadata?: any;
        callback: (response: any) => void;
        onClose: () => void;
        cancel_action?: string;
      }) => {
        openIframe: () => void;
      };
    };
  }
}

interface PaystackCheckoutProps {
  email: string;
  name: string;
  phone?: string;
  amount: number;
  ticketType: string;
  quantity: number;
  onSuccess: (reference: string) => void;
  onError: (error: string) => void;
  onCancel?: (reference?: string) => void;
}

export default function PaystackCheckout({
  email,
  name,
  phone,
  amount,
  ticketType,
  quantity,
  onSuccess,
  onError,
  onCancel
}: PaystackCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'initializing' | 'processing' | 'success' | 'failed'>('idle');
  const [currentReference, setCurrentReference] = useState<string>('');

  useEffect(() => {
    // Load Paystack inline script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.onload = () => setScriptLoaded(true);
    script.onerror = () => onError('Failed to load payment system');
    document.body.appendChild(script);

    return () => {
      // Cleanup script on unmount
      const existingScript = document.querySelector('script[src="https://js.paystack.co/v1/inline.js"]');
      if (existingScript) {
        document.body.removeChild(existingScript);
      }
    };
  }, [onError]);

  const handlePayment = async () => {
    if (!scriptLoaded) {
      onError('Payment system not ready. Please try again.');
      return;
    }

    setLoading(true);
    setPaymentStatus('initializing');
    
    try {
      // Initialize payment
      const response = await fetch('/api/payments/initialize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name,
          phone,
          ticketType,
          quantity,
          amount,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // Store reference for cancellation
      setCurrentReference(data.reference);
      setPaymentStatus('processing');

      // Use Paystack inline modal with enhanced configuration
      const handler = window.PaystackPop.setup({
        key: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || 'pk_live_e6eb7a894f085785afbeff75e3fc6a69ba71b893',
        email: email,
        amount: amount * 100, // Convert to kobo
        currency: 'GHS',
        ref: data.reference,
        channels: ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'],
        metadata: {
          user_name: name,
          user_phone: phone || '',
          ticket_type: ticketType,
          quantity: quantity,
          custom_fields: [
            {
              display_name: "Event Ticket",
              variable_name: "event_ticket",
              value: `${quantity}x ${ticketType === 'early-bird' ? 'Early Bird' : 'General'} Ticket${quantity > 1 ? 's' : ''}`
            }
          ]
        },
        callback: function(response: any) {
          setLoading(false);
          if (response.status === 'success') {
            setPaymentStatus('success');
            // Add a small delay to show success state
            setTimeout(() => {
              onSuccess(response.reference);
            }, 1000);
          } else {
            setPaymentStatus('failed');
            onError('Payment was not completed successfully');
          }
        },
        onClose: function() {
          setLoading(false);
          if (paymentStatus === 'processing') {
            setPaymentStatus('idle');
            // Handle payment cancellation with reference
            if (onCancel) {
              onCancel(currentReference);
            }
          }
        }
      });

      // Open the payment modal
      handler.openIframe();

    } catch (error) {
      console.error('Payment error:', error);
      setPaymentStatus('failed');
      onError(error instanceof Error ? error.message : 'Payment failed');
      setLoading(false);
    }
  };

  const getButtonContent = () => {
    if (!scriptLoaded) {
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-[var(--background)] border-t-transparent rounded-full animate-spin"></div>
          <span>Loading Payment System...</span>
        </div>
      );
    }

    if (paymentStatus === 'initializing') {
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-[var(--background)] border-t-transparent rounded-full animate-spin"></div>
          <span>Initializing Payment...</span>
        </div>
      );
    }

    if (paymentStatus === 'processing') {
      return (
        <div className="flex items-center justify-center gap-2">
          <div className="w-4 h-4 border-2 border-[var(--background)] border-t-transparent rounded-full animate-spin"></div>
          <span>Processing Payment...</span>
        </div>
      );
    }

    if (paymentStatus === 'success') {
      return (
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-[var(--background)]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
          </svg>
          <span>Payment Successful!</span>
        </div>
      );
    }

    if (paymentStatus === 'failed') {
      return (
        <div className="flex items-center justify-center gap-2">
          <svg className="w-4 h-4 text-[var(--background)]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
          <span>Payment Failed - Try Again</span>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2">
        <svg className="w-4 h-4 text-[var(--background)]" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <span>Pay GHS {amount}</span>
      </div>
    );
  };

  const getButtonClassName = () => {
    const baseClasses = "ora-btn w-full rounded-[var(--radius)] px-5 py-3.5 text-sm font-medium transition-all duration-200 disabled:cursor-not-allowed";
    
    if (paymentStatus === 'success') {
      return `${baseClasses} bg-green-500 text-white hover:bg-green-600`;
    }
    
    if (paymentStatus === 'failed') {
      return `${baseClasses} bg-red-500 text-white hover:bg-red-600`;
    }
    
    if (loading || !scriptLoaded) {
      return `${baseClasses} bg-[var(--accent)] text-[var(--background)] opacity-75`;
    }
    
    return `${baseClasses} bg-[var(--accent)] text-[var(--background)] hover:bg-[var(--accent-hover)] hover:scale-[1.02] active:scale-[0.98]`;
  };

  return (
    <div className="space-y-4">
      {/* Payment Summary */}
      <div className="bg-[var(--surface)] p-4 rounded-[var(--radius)] border border-[var(--border)]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-[var(--foreground)]">Payment Summary</span>
          <span className="text-xs text-[var(--foreground-muted)]">Secure Payment</span>
        </div>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-[var(--foreground-muted)]">Item:</span>
            <span className="text-[var(--foreground)]">
              {quantity}x {ticketType === 'early-bird' ? 'Early Bird' : 'General'} Ticket{quantity > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--foreground-muted)]">Customer:</span>
            <span className="text-[var(--foreground)]">{name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[var(--foreground-muted)]">Email:</span>
            <span className="text-[var(--foreground)]">{email}</span>
          </div>
          <div className="border-t border-[var(--border)] pt-2 mt-2">
            <div className="flex justify-between font-medium">
              <span className="text-[var(--foreground)]">Total Amount:</span>
              <span className="text-[var(--accent)] text-lg">GHS {amount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading || !scriptLoaded || paymentStatus === 'success'}
        className={getButtonClassName()}
      >
        {getButtonContent()}
      </button>

      {/* Payment Methods Info */}
      <div className="text-center">
        <p className="text-xs text-[var(--foreground-muted)] mb-2">
          Accepted Payment Methods
        </p>
        <div className="flex items-center justify-center gap-4 text-xs text-[var(--foreground-muted)]">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
            </svg>
            Cards
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17 2v2h3v16H4V4h3V2h2v2h6V2h2zm-2 4H9v2h6V6zm0 4H9v2h6v-2z"/>
            </svg>
            Mobile Money
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M11.5 1L2 6v2h20V6l-9.5-5zM4 8v12h16V8H4zm2 2h12v2H6v-2zm0 4h8v2H6v-2z"/>
            </svg>
            Bank Transfer
          </span>
        </div>
      </div>
    </div>
  );
}
