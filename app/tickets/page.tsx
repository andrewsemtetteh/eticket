import TicketSection from "../components/TicketSection";
import { supabaseAdmin } from '@/lib/supabase';

// Server-side data fetching
async function getTicketData() {
  try {
    // Get event settings (no caching on server-side)
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('event_settings')
      .select('*')
      .single();

    if (settingsError) {
      console.error('Settings error:', settingsError);
      return { settings: null, stats: null };
    }

    // Get ticket statistics with optimized query
    const { data: tickets } = await supabaseAdmin
      .from('tickets')
      .select('type, quantity')
      .eq('status', 'confirmed');

    // Calculate stats efficiently
    const stats = tickets?.reduce((acc, ticket: any) => {
      const qty = ticket.quantity || 1;
      if (ticket.type === 'early_bird') {
        acc.earlyBirdSold += qty;
      } else {
        acc.generalSold += qty;
      }
      acc.totalSold += qty;
      return acc;
    }, { earlyBirdSold: 0, generalSold: 0, totalSold: 0 }) || { earlyBirdSold: 0, generalSold: 0, totalSold: 0 };

    // Early bird availability calculation
    const earlyBirdEnabled = settings.early_bird_enabled !== false;
    const earlyBirdLeft = earlyBirdEnabled 
      ? Math.max(0, settings.early_bird_limit - stats.earlyBirdSold)
      : 0;
    const earlyBirdAvailable = earlyBirdEnabled && earlyBirdLeft > 0;

    return {
      settings,
      stats: {
        ...stats,
        earlyBirdLeft,
        earlyBirdAvailable,
        earlyBirdEnabled,
      }
    };
  } catch (error) {
    console.error('Ticket data fetch error:', error);
    return { settings: null, stats: null };
  }
}

export default async function Tickets() {
  // Pre-load data on server
  const initialData = await getTicketData();

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-8 md:px-12">
      <div className="mx-auto w-full max-w-md text-center">
        <h1 className="text-2xl font-medium tracking-tight text-[var(--foreground)] sm:text-3xl">
          Tickets
        </h1>
        <p className="font-event-title mt-2 text-sm text-[var(--foreground-muted)]">
          Sitting with the Silence After the Noise
        </p>

        <div className="mt-10">
          <TicketSection initialData={initialData} />
        </div>
      </div>
    </div>
  );
}
