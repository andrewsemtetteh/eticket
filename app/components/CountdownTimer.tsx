"use client";

import { useState, useEffect } from 'react';

interface CountdownTimerProps {
  targetDate: Date;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date().getTime();
      const target = targetDate.getTime();
      const difference = target - now;

      if (difference > 0) {
        return {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((difference % (1000 * 60)) / 1000)
        };
      }

      return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    };

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    // Set initial value
    setTimeLeft(calculateTimeLeft());

    return () => clearInterval(timer);
  }, [targetDate]);

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="inline-grid grid-cols-[min-content] text-right">
        <span className="text-2xl font-medium tabular-nums text-[var(--foreground)] sm:text-3xl md:text-4xl">
          --
        </span>
        <p className="text-sm text-[var(--foreground-muted)] sm:text-base">
          loading...
        </p>
      </div>
    );
  }

  const { days, hours, minutes, seconds } = timeLeft;

  return (
    <div className="inline-grid grid-cols-4 gap-1 text-right xs:gap-2 sm:gap-3">
      {/* Days */}
      <div className="flex flex-col items-center min-w-0">
        <span className="text-sm font-bold tabular-nums text-[var(--foreground)] xs:text-base sm:text-lg md:text-xl lg:text-2xl">
          {days.toString().padStart(2, '0')}
        </span>
        <p className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wide xs:text-xs">
          {days === 1 ? 'Day' : 'Days'}
        </p>
      </div>

      {/* Hours */}
      <div className="flex flex-col items-center min-w-0">
        <span className="text-sm font-bold tabular-nums text-[var(--foreground)] xs:text-base sm:text-lg md:text-xl lg:text-2xl">
          {hours.toString().padStart(2, '0')}
        </span>
        <p className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wide xs:text-xs">
          {hours === 1 ? 'Hr' : 'Hrs'}
        </p>
      </div>

      {/* Minutes */}
      <div className="flex flex-col items-center min-w-0">
        <span className="text-sm font-bold tabular-nums text-[var(--foreground)] xs:text-base sm:text-lg md:text-xl lg:text-2xl">
          {minutes.toString().padStart(2, '0')}
        </span>
        <p className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wide xs:text-xs">
          Min{minutes !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Seconds */}
      <div className="flex flex-col items-center min-w-0">
        <span className="text-sm font-bold tabular-nums text-[var(--foreground)] xs:text-base sm:text-lg md:text-xl lg:text-2xl animate-pulse">
          {seconds.toString().padStart(2, '0')}
        </span>
        <p className="text-[10px] text-[var(--foreground-muted)] uppercase tracking-wide xs:text-xs">
          Sec{seconds !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
}
