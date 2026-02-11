"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center px-6 sm:px-8 md:px-12">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center text-center">
        {/* Context */}
        <p className={`text-xs font-medium uppercase tracking-[0.2em] text-[var(--foreground-muted)] sm:text-sm transition-all duration-700 ease-out ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          An art experience
        </p>

        {/* Event title – one line on large screens */}
        <h1 className={`font-event-title mt-3 text-center text-3xl font-semibold leading-[1.15] tracking-tight text-[var(--foreground)] sm:text-4xl md:text-5xl lg:whitespace-nowrap transition-all duration-1000 ease-out delay-200 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
        }`}>
          Sitting with the Silence After the Noise
        </h1>

        {/* Date and time – centered as a block */}
        <p className={`mt-6 flex justify-center text-base font-medium tabular-nums text-[var(--foreground)] sm:text-lg transition-all duration-800 ease-out delay-500 ${
          mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          April 25, 2026
        </p>

        {/* Primary action – rainbow border button */}
        <div className={`mt-14 flex justify-center sm:mt-16 transition-all duration-900 ease-out delay-700 ${
          mounted ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-6 scale-95'
        }`}>
          <Link
            href="/tickets"
            className="rotating-gradient-border relative inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-[var(--foreground)] sm:text-xl"
          >
            Get tickets
          </Link>
        </div>
      </div>
    </div>
  );
}
