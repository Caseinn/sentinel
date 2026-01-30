"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Terminal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LogoIcon } from "@/components/logo";

const navItems = [
  { label: "How it Works", href: "#how-it-works" },
  { label: "Demo", href: "#demo" },
  { label: "Features", href: "#features" },
  { label: "Reviews", href: "#reviews" },
];

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "glass-nav"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <LogoIcon size={28} />
            <span className="font-bold text-lg tracking-tight">Sentinel</span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-cyan-400 hover:bg-muted/30 rounded-md transition-all cursor-pointer"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/scan">
              <Button
                size="sm"
                className="bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:from-cyan-400 hover:to-blue-500 transition-all glow-cyan"
              >
                <Terminal className="w-4 h-4 mr-2" />
                Security Check
              </Button>
            </Link>
          </div>

          <button
            className="md:hidden p-2 text-muted-foreground hover:text-cyan-400 transition-colors cursor-pointer"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pb-4 border-t border-border/50 pt-4 glass-card rounded-lg"
            >
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-3 text-sm text-muted-foreground hover:text-cyan-400 hover:bg-muted/30 rounded-md transition-all cursor-pointer"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="h-px bg-border/50 my-2" />
                <Link href="/scan" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button
                    className="w-full justify-start bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:from-cyan-400 hover:to-blue-500"
                    size="sm"
                  >
                    <Terminal className="w-4 h-4 mr-2" />
                    Security Check
                  </Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}
