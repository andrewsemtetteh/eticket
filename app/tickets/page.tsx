import TicketSection from "../components/TicketSection";

export default function Tickets() {
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
          <TicketSection />
        </div>
      </div>
    </div>
  );
}
