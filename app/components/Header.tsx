"use client";

import Link from "next/link";

interface HeaderProps {
  onMenuOpen: () => void;
}

export default function Header({ onMenuOpen }: HeaderProps) {
  return (
    <header className="absolute top-0 left-0 right-0 z-20 flex items-center justify-between px-6 py-5 sm:px-8">
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
        className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-[var(--radius)] border border-[var(--foreground)] bg-transparent text-[var(--foreground)] ora-btn hover:border-[var(--accent)] hover:text-[var(--accent)] sm:h-11 sm:w-11"
        aria-label="Open menu"
      >
        <span className="flex flex-col gap-1.5">
          <span className="h-0.5 w-4 bg-current sm:w-5" />
          <span className="h-0.5 w-4 bg-current sm:w-5" />
          <span className="h-0.5 w-4 bg-current sm:w-5" />
        </span>
      </button>
    </header>
  );
}
