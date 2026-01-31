"use client";

import { useState } from "react";
import Link from "next/link";

const EARLY_BIRD_PRICE = 80;
const GENERAL_PRICE = 120;
const EARLY_BIRD_LIMIT = 40;
const EARLY_BIRD_END_DATE = "15 March 2026";

// In a real app this would come from the server
const EARLY_BIRD_SOLD = 12;
const earlyBirdLeft = Math.max(0, EARLY_BIRD_LIMIT - EARLY_BIRD_SOLD);
const earlyBirdAvailable = earlyBirdLeft > 0;

export default function TicketSection() {
  const maxQty = earlyBirdAvailable ? Math.min(10, earlyBirdLeft) : 10;
  const [quantity, setQuantity] = useState(1);

  const price = earlyBirdAvailable ? EARLY_BIRD_PRICE : GENERAL_PRICE;
  const total = price * quantity;
  const ticketType = earlyBirdAvailable ? "early-bird" : "general";
  const checkoutHref = `/checkout?type=${ticketType}&qty=${quantity}`;

  const handleSubtract = () => setQuantity((q) => Math.max(1, q - 1));
  const handleAdd = () => setQuantity((q) => Math.min(maxQty, q + 1));

  return (
    <section className="w-full">
      <div className="ora-card border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
        <div className="p-5">
          {/* Show only Early Bird when available */}
          {earlyBirdAvailable && (
            <div className="ora-card rounded-[var(--radius)] border border-[var(--accent)] bg-[var(--surface-hover)] px-4 py-3.5">
              <span className="inline-block rounded bg-[var(--accent)]/20 px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
                Early Bird
              </span>
              <p className="mt-2 text-base font-medium text-[var(--foreground)]">
                GHS {EARLY_BIRD_PRICE}
              </p>
              <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">
                First {EARLY_BIRD_LIMIT} tickets or until {EARLY_BIRD_END_DATE}
              </p>
              <p className="mt-1.5 text-xs text-[var(--accent)]">
                {earlyBirdLeft} left at this price
              </p>
            </div>
          )}

          {/* Show only General when early bird is done */}
          {!earlyBirdAvailable && (
            <div className="ora-card rounded-[var(--radius)] border border-[var(--border)] bg-[var(--surface-hover)] px-4 py-3.5">
              <p className="text-sm font-medium text-[var(--foreground-muted)]">
                General
              </p>
              <p className="mt-1 text-base font-medium text-[var(--foreground)]">
                GHS {GENERAL_PRICE}
              </p>
              <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">
                Standard admission
              </p>
            </div>
          )}

          {/* Quantity with add/sub buttons */}
          <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-5">
            <span className="text-sm text-[var(--foreground-muted)]">
              Quantity
            </span>
            <div className="flex items-center gap-0 rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)]">
              <button
                type="button"
                onClick={handleSubtract}
                disabled={quantity <= 1}
                className="ora-btn flex h-10 w-10 shrink-0 items-center justify-center text-[var(--foreground)] hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                aria-label="Decrease quantity"
              >
                <span className="text-lg font-light leading-none">−</span>
              </button>
              <span
                className="min-w-[2.5rem] px-1 text-center text-sm font-medium tabular-nums text-[var(--foreground)]"
                aria-live="polite"
              >
                {quantity}
              </span>
              <button
                type="button"
                onClick={handleAdd}
                disabled={quantity >= maxQty}
                className="ora-btn flex h-10 w-10 shrink-0 items-center justify-center text-[var(--foreground)] hover:bg-[var(--surface-hover)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent"
                aria-label="Increase quantity"
              >
                <span className="text-lg font-light leading-none">+</span>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-[var(--border)] pt-4">
            <span className="text-sm text-[var(--foreground-muted)]">
              Total
            </span>
            <span className="text-lg font-medium text-[var(--foreground)]">
              GHS {total}
            </span>
          </div>
          <Link
            href={checkoutHref}
            className="ora-btn mt-5 flex w-full items-center justify-center rounded-2xl bg-[var(--accent)] px-5 py-3.5 text-base font-medium text-[var(--background)] hover:bg-[var(--accent-hover)]"
          >
            Buy ticket{quantity > 1 ? "s" : ""}
          </Link>
        </div>
      </div>
    </section>
  );
}
