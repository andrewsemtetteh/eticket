"use client";

import { useState, useEffect } from "react";
import CountdownTimer from "./CountdownTimer";

/* Social links – icon colors come from theme (globals.css --social-*) */
const SOCIAL_HANDLE = "ora_duku";

const SOCIAL_LINKS = [
  {
    href: `https://instagram.com/${SOCIAL_HANDLE}`,
    aria: "Instagram",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" aria-hidden>
        <defs>
          <linearGradient id="ig-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f09433" />
            <stop offset="25%" stopColor="#e6683c" />
            <stop offset="50%" stopColor="#dc2743" />
            <stop offset="75%" stopColor="#cc2366" />
            <stop offset="100%" stopColor="#bc1888" />
          </linearGradient>
        </defs>
        <path
          fill="url(#ig-gradient)"
          d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"
        />
      </svg>
    ),
  },
  {
    href: `https://facebook.com/${SOCIAL_HANDLE}`,
    aria: "Facebook",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" aria-hidden>
        <path
          fill="var(--social-facebook)"
          d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
        />
      </svg>
    ),
  },
  {
    href: `https://linkedin.com/company/${SOCIAL_HANDLE}`,
    aria: "LinkedIn",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" aria-hidden>
        <path
          fill="var(--social-linkedin)"
          d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"
        />
      </svg>
    ),
  },
  {
    href: `https://x.com/${SOCIAL_HANDLE}`,
    aria: "X",
    icon: (
      <svg viewBox="0 0 24 24" className="h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7" aria-hidden>
        <path
          fill="var(--social-x)"
          d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
        />
      </svg>
    ),
  },
] as const;

export default function Footer() {
  // Set default event date immediately to avoid loading state
  const [eventDate, setEventDate] = useState<Date>(new Date("2026-04-25T18:00:00"));
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchEventDate = async () => {
      try {
        const response = await fetch('/api/settings');
        const data = await response.json();
        
        if (response.ok && data.settings) {
          // Combine event_date and event_time from settings
          const dateStr = data.settings.event_date || "April 25, 2026";
          const timeStr = data.settings.event_time || "6:00 PM";
          
          // Parse the date and time
          const eventDateTime = new Date(`${dateStr} ${timeStr}`);
          
          // Only update if parsing succeeds
          if (!isNaN(eventDateTime.getTime())) {
            setEventDate(eventDateTime);
          }
        }
      } catch (error) {
        console.error('Failed to fetch event date:', error);
        // Keep default date
      }
    };

    fetchEventDate();
  }, []);

  return (
    <footer className="absolute bottom-0 left-0 right-0 z-10 flex items-center justify-between px-4 py-5 sm:px-6 sm:py-5 md:px-8 md:gap-8">
      <div className="flex items-center gap-4 sm:gap-5 md:gap-6">
        {SOCIAL_LINKS.map(({ href, aria, icon }, index) => (
          <a
            key={aria}
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="ora-transition cursor-pointer opacity-90 hover:opacity-100 transition-all duration-500 hover:scale-110 hover:-translate-y-1 hover:rotate-12 group"
            aria-label={aria}
            style={{
              animationDelay: `${index * 150}ms`,
              animation: loading ? 'none' : 'socialBounceIn 0.8s ease-out forwards'
            }}
          >
            <div className="transition-all duration-300 group-hover:drop-shadow-lg group-hover:brightness-110">
              {icon}
            </div>
          </a>
        ))}
      </div>
      <p className="hidden flex-1 text-center text-xs text-[var(--foreground-muted)] md:block sm:text-sm">
        © {new Date().getFullYear()} All Rights Reserved.
      </p>
      <CountdownTimer targetDate={eventDate} />
    </footer>
  );
}
