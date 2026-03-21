"use client";

import { useState, useEffect } from "react";
import CheckoutModal from "../../components/CheckoutModal";

interface EventSettings {
  early_bird_price: number;
  general_price: number;
  early_bird_limit: number;
  early_bird_end_date: string;
  total_ticket_limit: number;
  event_date: string;
  event_title: string;
  early_bird_enabled?: boolean;
  early_bird_mode?: string; // 'deadline' or 'count'
}

interface EventStats {
  earlyBirdSold: number;
  generalSold: number;
  totalSold: number;
  earlyBirdLeft: number;
  earlyBirdAvailable: boolean;
}

interface TicketSectionProps {
  initialData?: {
    settings: EventSettings | null;
    stats: EventStats | null;
  };
}

export default function TicketSection({ initialData }: TicketSectionProps = {}) {
  const [settings, setSettings] = useState<EventSettings | null>(initialData?.settings || null);
  const [stats, setStats] = useState<EventStats | null>(initialData?.stats || null);
  const [loading, setLoading] = useState(!initialData?.settings); // Only loading if no initial data
  const [quantity, setQuantity] = useState(1);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  useEffect(() => {
    // Only fetch if we don't have initial data
    if (!initialData?.settings) {
      fetchSettings();
    } else {
      setLoading(false); // Data already loaded, no loading needed
    }
  }, [initialData]);

  const fetchSettings = async () => {
    try {
      // Add timestamp and cache-busting to bypass cache
      const response = await fetch(`/api/settings?t=${Date.now()}&bust=true`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('🎫 TicketSection - Settings loaded:', {
        early_bird_mode: data.settings?.early_bird_mode,
        early_bird_limit: data.settings?.early_bird_limit,
        early_bird_end_date: data.settings?.early_bird_end_date,
        early_bird_enabled: data.settings?.early_bird_enabled,
        earlyBirdAvailable: data.stats?.earlyBirdAvailable,
        earlyBirdLeft: data.stats?.earlyBirdLeft
      });
      
      if (data.settings) {
        setSettings(data.settings);
        setStats(data.stats);
        
        // Dispatch event to notify other components
        window.dispatchEvent(new CustomEvent('ticket-data-updated', {
          detail: { settings: data.settings, stats: data.stats }
        }));
      } else {
        console.warn('No settings data received');
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      // Don't update state on error to keep existing data
    } finally {
      setLoading(false);
    }
  };

  // Refresh function for manual updates
  const refreshData = async () => {
    setLoading(true);
    await fetchSettings();
  };

  // Auto-refresh every 5 seconds only when page is visible, and faster after admin changes
  useEffect(() => {
    const interval = setInterval(async () => {
      // Only refresh if page is visible (not in background tab)
      if (document.visibilityState === 'visible') {
        try {
          await fetchSettings();
        } catch (error) {
          console.error('Auto-refresh failed:', error);
          // Silently fail auto-refresh to avoid errors in console
        }
      }
    }, 5000); // Reduced to 5 seconds for better responsiveness

    return () => clearInterval(interval);
  }, []);

  // Listen for admin update events
  useEffect(() => {
    const handleAdminUpdate = () => {
      console.log('🔄 TicketSection - Admin update detected, refreshing data');
      fetchSettings();
    };

    // Listen for custom events from admin dashboard
    window.addEventListener('admin-settings-updated', handleAdminUpdate);
    
    return () => {
      window.removeEventListener('admin-settings-updated', handleAdminUpdate);
    };
  }, []);

  // Use the earlyBirdAvailable from stats which already considers early_bird_enabled
  const earlyBirdLeft = stats?.earlyBirdLeft ?? 0;
  const earlyBirdAvailable = stats?.earlyBirdAvailable ?? false;

  const maxQty = earlyBirdAvailable ? Math.min(10, earlyBirdLeft) : 10;
  
  const earlyBirdPrice = settings?.early_bird_price ?? 200;
  const generalPrice = settings?.general_price ?? 300;
  const earlyBirdLimit = settings?.early_bird_limit ?? 40;
  const earlyBirdEndDate = settings?.early_bird_end_date ?? "15 March 2026";
  const earlyBirdMode = settings?.early_bird_mode ?? "deadline";

  // Format the early bird end date for display
  const formatEarlyBirdDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return dateStr;
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  const price = earlyBirdAvailable ? earlyBirdPrice : generalPrice;
  const total = price * quantity;
  const ticketType = earlyBirdAvailable ? "early-bird" : "general";

  const handleSubtract = () => setQuantity((q) => Math.max(1, q - 1));
  const handleAdd = () => setQuantity((q) => Math.min(maxQty, q + 1));
  const handleBuyTicket = () => setIsCheckoutModalOpen(true);
  const handleCloseModal = () => setIsCheckoutModalOpen(false);

  if (loading) {
    return (
      <section className="w-full">
        <div className="ora-card border border-[var(--border)] bg-[var(--surface)] overflow-hidden">
          <div className="p-5 text-center">
            <p className="text-[var(--foreground-muted)]">Loading tickets...</p>
          </div>
        </div>
      </section>
    );
  }

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
                GHS {earlyBirdPrice}
              </p>
              <p className="mt-0.5 text-xs text-[var(--foreground-muted)]">
                {earlyBirdMode === 'count' 
                  // ? `First ${earlyBirdLimit} tickets only`
                  ? `Limited availability`
                  : `Until ${formatEarlyBirdDate(earlyBirdEndDate)}`
                }
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
                GHS {generalPrice}
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
          <button
            onClick={handleBuyTicket}
            className="ora-btn mt-3 flex items-center justify-center rounded bg-[var(--accent)] px-4 py-2 text-lg font-medium text-[var(--background)] hover:bg-[var(--accent-hover)] mx-auto transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 transform"
          >
            Buy ticket{quantity > 1 ? "s" : ""}
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={handleCloseModal}
        ticketType={ticketType}
        quantity={quantity}
      />
    </section>
  );
}
