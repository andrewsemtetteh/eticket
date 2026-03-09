"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState, useEffect } from "react";
import Link from "next/link";
import PaystackCheckout from "@/components/PaystackCheckout";

interface EventSettings {
  early_bird_price: number;
  general_price: number;
  early_bird_limit: number;
  early_bird_end_date: string;
}

interface EventStats {
  earlyBirdSold: number;
  generalSold: number;
  totalSold: number;
  earlyBirdLeft: number;
  earlyBirdAvailable: boolean;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") || "early-bird") as "early-bird" | "general";
  const qty = Math.min(10, Math.max(1, Number(searchParams.get("qty")) || 1));
  const cancelled = searchParams.get("cancelled") === "true";
  const cancelledRef = searchParams.get("reference");

  const [settings, setSettings] = useState<EventSettings | null>(null);
  const [stats, setStats] = useState<EventStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: ''
  });

  useEffect(() => {
    fetchEventSettings();
  }, []);

  // Auto-refresh every 15 seconds only when page is visible
  useEffect(() => {
    const interval = setInterval(async () => {
      // Only refresh if page is visible (not in background tab)
      if (document.visibilityState === 'visible') {
        try {
          await fetchEventSettings();
        } catch (error) {
          console.error('Auto-refresh failed:', error);
          // Silently fail auto-refresh to avoid errors in console
        }
      }
    }, 15000); // 15 seconds

    return () => clearInterval(interval);
  }, []);

  // Handle Paystack cancel action redirect
  useEffect(() => {
    if (cancelled && cancelledRef) {
      handlePaymentCancel(cancelledRef);
    }
  }, [cancelled, cancelledRef]);

  const fetchEventSettings = async () => {
    try {
      // Add timestamp and cache-busting to bypass cache
      const response = await fetch(`/api/settings?t=${Date.now()}&bust=true`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      
      if (data.settings) {
        setSettings(data.settings);
        setStats(data.stats);
        setError(null); // Clear any previous errors
      } else {
        console.warn('No settings data received');
      }
    } catch (err) {
      console.error('Failed to fetch event settings:', err);
      // Only set error for manual fetch, not auto-refresh
      if (loading) {
        setError('Failed to load event settings');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentSuccess = (reference: string) => {
    window.location.href = `/confirmation?reference=${reference}`;
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const handlePaymentCancel = async (reference?: string) => {
    try {
      // Call cancel API to update database
      const cancelReference = reference || cancelledRef;
      if (cancelReference) {
        await fetch('/api/payments/cancel', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference: cancelReference })
        });
        console.log('✅ Payment cancelled manually:', cancelReference);
      }
    } catch (error) {
      console.error('Cancellation failed:', error);
    }
    
    // Redirect back to tickets page
    window.location.href = '/tickets';
  };

  if (loading) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-md text-center">
          <p className="text-[var(--foreground-muted)]">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-md text-center">
          <p className="text-red-500 mb-4">{error}</p>
        </div>
      </div>
    );
  }

  if (!settings || !stats) {
    return null;
  }

  const price = type === "early-bird" ? settings.early_bird_price : settings.general_price;
  const total = price * qty;
  const isFormValid = formData.email && formData.name;

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-md">
        {cancelled && (
          <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-orange-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-orange-800">Payment Cancelled</h3>
                <p className="mt-1 text-sm text-orange-700">
                  Your payment was cancelled. You can try again below.
                </p>
              </div>
            </div>
          </div>
        )}
        
        <h1 className="text-2xl font-medium tracking-tight text-[var(--foreground)] sm:text-3xl">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          {qty} × {type === "early-bird" ? "Early Bird" : "General"} · GHS {total}
        </p>

        <div className="mt-10 space-y-8">
          <div>
            <h2 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-widest mb-4">
              Your details
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="ora-card w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] rounded-[var(--radius)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className="ora-card w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] rounded-[var(--radius)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="0XX XXX XXXX"
                  className="ora-card w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] rounded-[var(--radius)]"
                />
              </div>
            </div>
          </div>

          {isFormValid && (
            <div className="ora-transition border-t border-[var(--border)] pt-6">
              <h2 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-widest mb-4">
                Payment
              </h2>
              <PaystackCheckout
                email={formData.email}
                name={formData.name}
                phone={formData.phone}
                amount={total}
                ticketType={type}
                quantity={qty}
                onSuccess={handlePaymentSuccess}
                onError={handlePaymentError}
                onCancel={handlePaymentCancel}
              />
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-full flex-1 items-center justify-center">
          <p className="text-sm text-[var(--foreground-muted)]">Loading…</p>
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
