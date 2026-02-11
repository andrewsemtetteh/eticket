"use client";

import Link from "next/link";

interface GradientButtonProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export default function GradientButton({ href, children, className = "" }: GradientButtonProps) {
  return (
    <span className="gradient-border-button inline-block transition-all duration-300 hover:scale-[1.05] active:scale-[0.98] hover:rotate-1">
      <Link
        href={href}
        className={`gradient-border-button-inner relative z-10 inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-[var(--background)] sm:text-xl transition-all duration-300 hover:px-10 ${className}`}
      >
        {children}
      </Link>
    </span>
  );
}
