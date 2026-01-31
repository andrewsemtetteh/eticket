"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import Link from "next/link";

const EARLY_BIRD_PRICE = 80;
const GENERAL_PRICE = 120;

const PAYMENT_METHODS = [
  { id: "card", label: "Bank card", desc: "Visa, Mastercard, local cards" },
  { id: "mtn", label: "MTN Mobile Money", desc: undefined },
  { id: "vodafone", label: "Vodafone / Telecel", desc: undefined },
  { id: "airteltigo", label: "AirtelTigo", desc: undefined },
] as const;

function CheckoutContent() {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") || "early-bird") as "early-bird" | "general";
  const qty = Math.min(10, Math.max(1, Number(searchParams.get("qty")) || 1));

  const price = type === "early-bird" ? EARLY_BIRD_PRICE : GENERAL_PRICE;
  const total = price * qty;
  const [method, setMethod] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 sm:px-8 md:px-12">
        <div className="mx-auto w-full max-w-md text-center">
          <p className="text-[var(--foreground-muted)]">Redirecting to confirmation…</p>
          <Link
            href="/confirmation"
            className="ora-btn mt-6 inline-flex items-center justify-center rounded-[var(--radius)] bg-[var(--accent)] px-5 py-3.5 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent-hover)]"
          >
            View e-ticket
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-8">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-2xl font-medium tracking-tight text-[var(--foreground)] sm:text-3xl">
          Checkout
        </h1>
        <p className="mt-2 text-sm text-[var(--foreground-muted)]">
          {qty} × {type === "early-bird" ? "Early Bird" : "General"} · GHS {total}
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-8">
          <div>
            <h2 className="text-sm font-medium text-[var(--foreground-muted)] uppercase tracking-widest mb-4">
              Payment method
            </h2>
            <div className="space-y-2">
              {PAYMENT_METHODS.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethod(m.id)}
                  className={`ora-card ora-btn w-full rounded-[var(--radius)] border px-4 py-3 text-left text-sm ${method === m.id ? "border-[var(--accent)] bg-[var(--surface-hover)] text-[var(--foreground)]" : "border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] hover:border-[var(--foreground-muted)] hover:text-[var(--foreground)]"}`}
                >
                  <span className="font-medium">{m.label}</span>
                  {m.desc && (
                    <span className="mt-0.5 block text-xs text-[var(--foreground-muted)]">
                      {m.desc}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {method && (
            <div className="ora-transition border-t border-[var(--border)] pt-6">
              <label className="block text-sm text-[var(--foreground-muted)] mb-2">
                {method === "card" ? "Card number" : "Mobile number"}
              </label>
              <input
                type="text"
                placeholder={method === "card" ? "•••• •••• •••• ••••" : "0XX XXX XXXX"}
                className="ora-card w-full border border-[var(--border)] bg-[var(--surface)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--foreground-muted)]"
              />
              <button
                type="submit"
                className="ora-btn mt-4 w-full rounded-[var(--radius)] bg-[var(--accent)] px-5 py-3.5 text-sm font-medium text-[var(--background)] hover:bg-[var(--accent-hover)]"
              >
                Confirm payment
              </button>
            </div>
          )}
        </form>

        <Link
          href="/tickets"
          className="ora-transition mt-8 inline-block text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)]"
        >
          ← Back to tickets
        </Link>
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
