import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 sm:px-8 md:px-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        {/* Context */}
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--foreground-muted)] sm:text-sm">
          An art experience
        </p>

        {/* Event title – one line on large screens */}
        <h1 className="font-event-title mt-3 text-center text-3xl font-semibold leading-[1.15] tracking-tight text-[var(--foreground)] sm:text-4xl md:text-5xl lg:whitespace-nowrap">
          Sitting with the Silence After the Noise
        </h1>

        {/* Date and time – centered as a block */}
        <p className="mt-6 flex justify-center text-base font-medium tabular-nums text-[var(--foreground)] sm:text-lg">
          April 25, 2026
        </p>

        {/* Primary action – gradient border, inner fill via ::after in globals.css */}
        <div className="mt-14 flex justify-center sm:mt-16">
          <span className="rotating-gradient-border inline-block transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]">
            <Link
              href="/tickets"
              className="rotating-gradient-border-inner relative z-10 inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-[var(--background)] sm:text-xl"
            >
              Get tickets
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}
