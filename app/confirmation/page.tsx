"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";

const TICKET_ID = "OD-2026-" + Math.random().toString(36).slice(2, 10).toUpperCase();

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

export default function ConfirmationPage() {
  const { fg, bg } = useThemeColors();
  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 sm:px-8 md:px-12">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-2xl font-medium tracking-tight text-[var(--foreground)] sm:text-3xl">
          Your e-ticket
        </h1>
        <p className="font-event-title mt-2 text-sm text-[var(--foreground-muted)]">
          Sitting with the Silence After the Noise
        </p>

        <div className="ora-card mt-10 border border-[var(--border)] bg-[var(--surface)] p-6">
          <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-8">
            <div className="flex shrink-0 items-center justify-center rounded-[var(--radius)] border border-[var(--border)] bg-[var(--background)] p-4">
              <QRCodeSVG
                value={TICKET_ID}
                size={140}
                level="M"
                includeMargin={false}
                fgColor={fg}
                bgColor={bg}
              />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <p className="text-xs font-medium text-[var(--foreground-muted)] uppercase tracking-widest">
                Ticket ID
              </p>
              <p className="mt-1 font-mono text-lg tracking-wide text-[var(--foreground)]">
                {TICKET_ID}
              </p>
              <p className="mt-4 text-sm text-[var(--foreground-muted)]">
                1 × Early Bird
              </p>
              <p className="mt-1 text-sm text-[var(--foreground)]">
                Present this QR code at the door.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-6 text-xs text-[var(--foreground-muted)]">
          A copy has been sent to your email. You can return to this page anytime
          from the link in the confirmation.
        </p>

        <Link
          href="/"
          className="ora-btn mt-10 inline-flex items-center justify-center rounded-[var(--radius)] border border-[var(--border)] bg-transparent px-5 py-3.5 text-sm font-medium text-[var(--foreground)] hover:border-[var(--foreground-muted)] hover:text-[var(--accent)]"
        >
          Back to home
        </Link>
      </div>
    </div>
  );
}
