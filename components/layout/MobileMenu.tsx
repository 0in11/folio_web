"use client";

import Link from "next/link";
import { useEffect } from "react";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  links: Array<{ label: string; href: string }>;
}

export default function MobileMenu({ isOpen, onClose, links }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-bg-primary/95 backdrop-blur-md flex flex-col"
      role="dialog"
      aria-modal="true"
      aria-label="모바일 메뉴"
    >
      <div className="flex justify-end p-6">
        <button
          onClick={onClose}
          aria-label="메뉴 닫기"
          className="text-text-secondary hover:text-text-primary transition-colors"
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
      <nav className="flex flex-col items-center justify-center flex-1 gap-8">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            className="font-display text-3xl font-bold text-text-primary hover:text-accent-primary transition-colors"
          >
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
