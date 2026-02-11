"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/tickets", label: "Tickets" },
  { href: "/contact", label: "Contact" },
  { href: "/more", label: "More" },
] as const;

interface MenuOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MenuOverlay({ isOpen, onClose }: MenuOverlayProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      const t = requestAnimationFrame(() => setMounted(true));
      return () => {
        cancelAnimationFrame(t);
        document.body.style.overflow = "";
      };
    } else {
      setMounted(false);
      document.body.style.overflow = "";
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      NAV_ITEMS.forEach((item) => router.prefetch(item.href));
    }
  }, [isOpen, router]);

  // Check if user is an authenticated admin
  useEffect(() => {
    const checkAdminAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/verify', {
          credentials: 'include'
        });
        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.authenticated && data.user?.is_admin);
        } else {
          setIsAdmin(false);
        }
      } catch (error) {
        setIsAdmin(false);
      }
    };

    if (isOpen) {
      checkAdminAuth();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onClose();
    router.push(href);
  };

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col bg-[var(--background)] transition-opacity duration-300 ease-out ${mounted ? "opacity-100" : "opacity-0"}`}
      role="dialog"
      aria-modal="true"
      aria-label="Navigation menu"
    >
      <div className="flex flex-1 flex-col justify-center px-6 py-20 sm:px-8 sm:py-24 md:px-12">
        <nav className="flex flex-col gap-1 sm:gap-2" aria-label="Main">
          {NAV_ITEMS.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`ora-menu-link-in flex items-center gap-3 py-3 text-xl font-medium tracking-tight ora-transition sm:text-2xl md:text-3xl ${
                  isActive
                    ? "text-[var(--accent)] font-semibold"
                    : "text-[var(--foreground)] hover:text-[var(--accent)]"
                }`}
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <span
                  className={`h-1 w-1 shrink-0 rounded-full bg-current opacity-0 transition-opacity ${isActive ? "opacity-100" : ""}`}
                  aria-hidden
                />
                {item.label}
              </a>
            );
          })}
          
          {/* Dashboard menu item - only show for authenticated admin users */}
          {isAdmin && (
            <a
              href="/admin"
              onClick={(e) => handleNavClick(e, "/admin")}
              className={`ora-menu-link-in flex items-center gap-3 py-3 text-xl font-medium tracking-tight ora-transition sm:text-2xl md:text-3xl ${
                pathname === "/admin" || pathname.startsWith("/admin/")
                  ? "text-[var(--accent)] font-semibold"
                  : "text-[var(--foreground)] hover:text-[var(--accent)]"
              }`}
              style={{ animationDelay: `${NAV_ITEMS.length * 50}ms` }}
            >
              <span
                className={`h-1 w-1 shrink-0 rounded-full bg-current opacity-0 transition-opacity ${pathname === "/admin" || pathname.startsWith("/admin/") ? "opacity-100" : ""}`}
                aria-hidden
              />
              Dashboard
            </a>
          )}
        </nav>
      </div>
      {/* Same position as menu icon in header */}
      <div className="absolute top-0 right-0 py-5 pr-4 sm:pr-6 md:pr-8">
        <button
          type="button"
          onClick={onClose}
          className="flex cursor-pointer items-center justify-center text-[var(--foreground)] ora-btn hover:text-[var(--accent)] transition-colors duration-300"
          aria-label="Close menu"
        >
          <span className="text-3xl font-normal leading-none text-[var(--foreground)] sm:text-4xl transition-colors duration-300">&times;</span>
        </button>
      </div>
    </div>
  );
}
