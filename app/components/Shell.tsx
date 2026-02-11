"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import MenuOverlay from "./MenuOverlay";
import Footer from "./Footer";

const HOMEPAGE_BG =
  "https://images.unsplash.com/photo-1728827895991-ee4ad76b2678?q=80&w=1020&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

export default function Shell({ children }: { children: React.ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAdmin = pathname.startsWith("/admin");

  return (
    <div className="app-shell relative min-h-screen overflow-x-hidden">
      {/* Full-viewport background on home only – covers header, main, footer */}
      {isHome && (
        <div
          className="fixed inset-0 z-[-1] min-h-[100vh] bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${HOMEPAGE_BG})` }}
          aria-hidden
        >
          <div className="absolute inset-0 bg-[var(--background)]/80" />
        </div>
      )}
      <Header onMenuOpen={() => setMenuOpen(true)} />
      <MenuOverlay isOpen={menuOpen} onClose={() => setMenuOpen(false)} />
      <main className="flex min-h-0 flex-1 flex-col pt-[72px] pb-[72px] sm:pt-20 sm:pb-20 md:pb-20">
        {children}
      </main>
      {!isAdmin && <Footer />}
    </div>
  );
}
