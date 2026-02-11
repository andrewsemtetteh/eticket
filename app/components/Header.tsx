"use client";

import Link from "next/link";

interface HeaderProps {
  onMenuOpen: () => void;
}

export default function Header({ onMenuOpen }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-4 py-5 sm:px-6 sm:py-5 md:px-8">
      <Link
        href="/"
        className="ora-transition inline-flex cursor-pointer items-center text-[var(--foreground)] hover:opacity-80"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/oraduku.svg"
          alt="Orà duku"
          className="h-8 w-auto sm:h-9"
          width={140}
          height={50}
        />
      </Link>
      <button
        type="button"
        onClick={onMenuOpen}
        className="flex cursor-pointer items-center justify-center text-[var(--foreground)] ora-btn hover:text-[var(--accent)] transition-colors duration-300"
        aria-label="Open menu"
      >
        <span className="flex flex-col gap-2 rotate-180 transform">
          <span className="h-0.5 w-5 bg-current sm:w-6 ml-auto transition-colors duration-300" />
          <span className="h-0.5 w-4 bg-current sm:w-5 rounded-full transition-colors duration-300" />
          <span className="h-0.5 w-5 bg-current sm:w-6 ml-auto transition-colors duration-300" />
        </span>
      </button>
    </header>
  );
}
