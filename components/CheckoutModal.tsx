"use client";

import { useState, useEffect } from 'react';
import PaystackCheckout from './PaystackCheckout';

interface EventSettings {
  early_bird_price: number;
  general_price: number;
  early_bird_limit: number;
  early_bird_end_date: string;
  total_ticket_limit: number;
  event_date: string;
  event_title: string;
  early_bird_enabled?: boolean;
}

interface EventStats {
  totalSold: number;
  earlyBirdSold: number;
  generalSold: number;
  earlyBirdAvailable: boolean;
  generalAvailable: boolean;
}

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketType: 'early-bird' | 'general';
  quantity: number;
}

export default function CheckoutModal({ isOpen, onClose, ticketType, quantity }: CheckoutModalProps) {
  const [step, setStep] = useState<'details' | 'summary' | 'payment'>('details');
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
    if (isOpen) {
      fetchEventSettings();
      setStep('details');
      setError(null);
    }
  }, [isOpen]);

  const fetchEventSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      
      if (response.ok) {
        setSettings(data.settings);
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to load event settings');
      }
    } catch (err) {
      setError('Failed to load event settings');
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

  const handleContinueToSummary = () => {
    if (formData.email && formData.name) {
      setStep('summary');
    }
  };

  const handleContinueToPayment = () => {
    setStep('payment');
  };

  const handlePaymentSuccess = (reference: string) => {
    onClose();
    window.location.href = `/confirmation?reference=${reference}`;
  };

  const handlePaymentError = (error: string) => {
    setError(error);
  };

  const handleBackToDetails = () => {
    setStep('details');
    setError(null);
  };

  const handleBackToSummary = () => {
    setStep('summary');
    setError(null);
  };

  if (!isOpen) return null;

  // If early bird is disabled, always use general pricing regardless of ticketType passed
  const earlyBirdEnabled = settings?.early_bird_enabled !== false;
  const effectiveTicketType = earlyBirdEnabled && ticketType === 'early-bird' ? 'early-bird' : 'general';
  const price = settings ? (effectiveTicketType === 'early-bird' ? settings.early_bird_price : settings.general_price) : 0;
  const total = price * quantity;
  const isFormValid = formData.email && formData.name;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="ora-card w-full max-w-md bg-[var(--surface)] border border-[var(--border)] rounded-[var(--radius)] max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[var(--border)]">
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            {step === 'details' && 'Your Details'}
            {step === 'summary' && 'Order Summary'}
            {step === 'payment' && 'Payment'}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--foreground-muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Indicator */}
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <div className="flex items-center justify-between">
            <div className={`flex items-center gap-2 ${step === 'details' ? 'text-[var(--accent)]' : step === 'summary' || step === 'payment' ? 'text-green-500' : 'text-[var(--foreground-muted)]'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 'details' ? 'bg-[var(--accent)] text-[var(--background)]' : step === 'summary' || step === 'payment' ? 'bg-green-500 text-white' : 'bg-[var(--border)] text-[var(--foreground-muted)]'}`}>
                {step === 'summary' || step === 'payment' ? '✓' : '1'}
              </div>
              <span className="text-sm font-medium">Details</span>
            </div>
            <div className={`w-8 h-0.5 ${step === 'summary' || step === 'payment' ? 'bg-green-500' : 'bg-[var(--border)]'}`}></div>
            <div className={`flex items-center gap-2 ${step === 'summary' ? 'text-[var(--accent)]' : step === 'payment' ? 'text-green-500' : 'text-[var(--foreground-muted)]'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 'summary' ? 'bg-[var(--accent)] text-[var(--background)]' : step === 'payment' ? 'bg-green-500 text-white' : 'bg-[var(--border)] text-[var(--foreground-muted)]'}`}>
                {step === 'payment' ? '✓' : '2'}
              </div>
              <span className="text-sm font-medium">Summary</span>
            </div>
            <div className={`w-8 h-0.5 ${step === 'payment' ? 'bg-green-500' : 'bg-[var(--border)]'}`}></div>
            <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-[var(--accent)]' : 'text-[var(--foreground-muted)]'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${step === 'payment' ? 'bg-[var(--accent)] text-[var(--background)]' : 'bg-[var(--border)] text-[var(--foreground-muted)]'}`}>
                3
              </div>
              <span className="text-sm font-medium">Payment</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {loading && (
            <div className="text-center py-8">
              <p className="text-[var(--foreground-muted)]">Loading...</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-[var(--radius)]">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {!loading && !error && settings && (
            <>
              {/* Step 1: Details */}
              {step === 'details' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">
                      {quantity} × {effectiveTicketType === 'early-bird' ? 'Early Bird' : 'General'} Ticket{quantity > 1 ? 's' : ''}
                    </h3>
                    <p className="text-2xl font-bold text-[var(--accent)]">GHS {total}</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] rounded-[var(--radius)] focus:outline-none focus:border-[var(--accent)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="Your full name"
                        className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] rounded-[var(--radius)] focus:outline-none focus:border-[var(--accent)]"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[var(--foreground)] mb-2">
                        Phone Number (Optional)
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="0XX XXX XXXX"
                        className="w-full px-4 py-3 border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] placeholder:text-[var(--foreground-muted)] rounded-[var(--radius)] focus:outline-none focus:border-[var(--accent)]"
                      />
                    </div>
                  </div>

                  <button
                    onClick={handleContinueToSummary}
                    disabled={!isFormValid}
                    className="w-full ora-btn rounded-[var(--radius)] bg-[var(--accent)] px-5 py-3.5 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Continue to Summary
                  </button>
                </div>
              )}

              {/* Step 2: Summary */}
              {step === 'summary' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-4">Order Summary</h3>
                  </div>

                  {/* Event Details */}
                  <div className="bg-[var(--background)] p-4 rounded-[var(--radius)] border border-[var(--border)]">
                    <h4 className="font-medium text-[var(--foreground)] mb-3">Event Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--foreground-muted)]">Event:</span>
                        <span className="text-[var(--foreground)]">{settings.event_title}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--foreground-muted)]">Date:</span>
                        <span className="text-[var(--foreground)]">{settings.event_date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Ticket Details */}
                  <div className="bg-[var(--background)] p-4 rounded-[var(--radius)] border border-[var(--border)]">
                    <h4 className="font-medium text-[var(--foreground)] mb-3">Ticket Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--foreground-muted)]">Type:</span>
                        <span className="text-[var(--foreground)]">
                          {effectiveTicketType === 'early-bird' ? 'Early Bird' : 'General'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--foreground-muted)]">Quantity:</span>
                        <span className="text-[var(--foreground)]">x {quantity}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--foreground-muted)]">Price per ticket:</span>
                        <span className="text-[var(--foreground)]">GHS {price}</span>
                      </div>
                      <div className="border-t border-[var(--border)] pt-2 mt-2">
                        <div className="flex justify-between font-medium">
                          <span className="text-[var(--foreground)]">Total:</span>
                          <span className="text-[var(--accent)] text-lg">GHS {total}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Customer Details */}
                  <div className="bg-[var(--background)] p-4 rounded-[var(--radius)] border border-[var(--border)]">
                    <h4 className="font-medium text-[var(--foreground)] mb-3">Customer Details</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-[var(--foreground-muted)]">Name:</span>
                        <span className="text-[var(--foreground)]">{formData.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[var(--foreground-muted)]">Email:</span>
                        <span className="text-[var(--foreground)]">{formData.email}</span>
                      </div>
                      {formData.phone && (
                        <div className="flex justify-between">
                          <span className="text-[var(--foreground-muted)]">Phone:</span>
                          <span className="text-[var(--foreground)]">{formData.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={handleBackToDetails}
                      className="flex-1 ora-btn rounded-[var(--radius)] border border-[var(--border)] bg-transparent px-5 py-3.5 text-sm font-medium text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                    >
                      Back
                    </button>
                    <button
                      onClick={handleContinueToPayment}
                      className="flex-1 ora-btn rounded-[var(--radius)] bg-[var(--accent)] px-5 py-3.5 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent-hover)]"
                    >
                      Proceed to Payment
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Payment */}
              {step === 'payment' && (
                <div className="space-y-6">
                  <div className="text-center mb-6">
                    <h3 className="text-lg font-medium text-[var(--foreground)] mb-2">Complete Payment</h3>
                    <p className="text-2xl font-bold text-[var(--accent)]">GHS {total}</p>
                  </div>

                  <div className="bg-[var(--background)] p-4 rounded-[var(--radius)] border border-[var(--border)]">
                    <div className="flex items-center gap-3 mb-3">
                      <svg className="w-8 h-8 text-[var(--accent)]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z"/>
                      </svg>
                      <div>
                        <h4 className="font-medium text-[var(--foreground)]">Secure Payment</h4>
                        <p className="text-sm text-[var(--foreground-muted)]">Powered by Paystack</p>
                      </div>
                    </div>
                    <p className="text-xs text-[var(--foreground-muted)]">
                      Your payment is secured with 256-bit SSL encryption. We accept all major cards.
                    </p>
                  </div>

                  <PaystackCheckout
                    email={formData.email}
                    name={formData.name}
                    phone={formData.phone}
                    amount={total}
                    ticketType={effectiveTicketType}
                    quantity={quantity}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />

                  <button
                    onClick={handleBackToSummary}
                    className="w-full ora-btn rounded-[var(--radius)] border border-[var(--border)] bg-transparent px-5 py-3.5 text-sm font-medium text-[var(--foreground)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  >
                    Back to Summary
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
