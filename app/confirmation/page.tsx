"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";

interface Ticket {
  id: string;
  ticket_id: string;
  type: string;
  quantity: number;
  price: number;
  status: string;
  qr_code: string;
}

interface Payment {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
}

function useThemeColors() {
  const [colors, setColors] = useState({ fg: "#e8e6e3", bg: "#000000" });
  useEffect(() => {
    const s = getComputedStyle(document.documentElement);
    setColors({
      fg: s.getPropertyValue("--foreground").trim() || "#e8e6e3",
      bg: s.getPropertyValue("--background").trim() || "#000000",
    });
  }, []);
  return colors;
}

function ConfirmationContent() {
  const { fg, bg } = useThemeColors();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [payment, setPayment] = useState<Payment | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    if (reference) {
      verifyPaymentAndGetTickets();
    } else {
      setError('No payment reference provided');
      setLoading(false);
    }
  }, [reference]);

  const verifyPaymentAndGetTickets = async () => {
    try {
      // First verify the payment
      const verifyResponse = await fetch('/api/payments/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reference }),
      });

      const verifyData = await verifyResponse.json();

      if (!verifyResponse.ok) {
        throw new Error(verifyData.error || 'Payment verification failed');
      }

      if (!verifyData.success) {
        setError('Payment was not successful');
        setLoading(false);
        return;
      }

      // Get ticket details
      const ticketsResponse = await fetch(`/api/tickets?reference=${reference}`);
      const ticketsData = await ticketsResponse.json();

      if (!ticketsResponse.ok) {
        throw new Error(ticketsData.error || 'Failed to load tickets');
      }

      setPayment(ticketsData.payment);
      setTickets(ticketsData.tickets);
      setUser(ticketsData.user);

    } catch (err) {
      console.error('Confirmation error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load ticket information');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-md text-center">
          <p className="text-[var(--foreground-muted)]">Verifying payment...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-md text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <Link
            href="/tickets"
            className="ora-btn inline-flex items-center justify-center rounded-[var(--radius)] border border-[var(--border)] bg-transparent px-5 py-3.5 text-sm font-medium text-[var(--foreground)] hover:border-[var(--foreground-muted)] hover:text-[var(--accent)]"
          >
            ← Back to tickets
          </Link>
        </div>
      </div>
    );
  }

  if (!tickets.length || !payment || !user) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-8">
        <div className="mx-auto w-full max-w-md text-center">
          <p className="text-[var(--foreground-muted)]">No tickets found</p>
        </div>
      </div>
    );
  }

  const mainTicket = tickets[0];
  const ticketTypeLabel = mainTicket.type === 'early_bird' ? 'Early Bird' : 'General';

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-8 md:px-12">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-2xl font-medium tracking-tight text-[var(--foreground)] sm:text-3xl text-center">
          Your e-ticket{tickets.length > 1 ? 's' : ''}
        </h1>
        <p className="font-event-title mt-2 text-sm text-[var(--foreground-muted)] text-center">
          Sitting with the Silence After the Noise
        </p>

        <div className="ora-card mt-8 border border-[var(--border)] bg-[var(--surface)] p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[var(--foreground)] mb-4">
            Payment Successful!
          </h2>
          <p className="text-[var(--foreground)]">
            A copy of your ticket has been sent to <strong>{user.email}</strong>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 sm:px-8 md:px-12">
        <div className="mx-auto w-full max-w-2xl text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-[var(--surface)] rounded mb-4"></div>
            <div className="h-4 bg-[var(--surface)] rounded mb-8"></div>
            <div className="h-32 bg-[var(--surface)] rounded"></div>
          </div>
        </div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
