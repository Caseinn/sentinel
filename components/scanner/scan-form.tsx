"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Shield, Search, Zap, ArrowLeft, ArrowRight, Target } from "lucide-react";
import Link from "next/link";

interface ScanFormProps {
  url: string;
  setUrl: (url: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function ScanForm({ url, setUrl, onSubmit, isLoading }: ScanFormProps) {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan-400 transition-colors cursor-pointer mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to home
        </Link>
        <div className="flex items-center justify-center gap-3 mb-4">
          <h1 className="text-3xl font-bold tracking-tight">Security Scanner</h1>
        </div>
        <p className="text-muted-foreground">
          Enter a URL to analyze for security vulnerabilities
        </p>
      </motion.div>

      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        onSubmit={onSubmit}
        className="space-y-4"
      >
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/50 to-blue-500/50 rounded-lg blur opacity-25 group-hover:opacity-50 transition-opacity" />
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-cyan-400 transition-colors" />
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-14 pl-12 text-base bg-muted/50 border-border focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 rounded-lg transition-all"
                required
              />
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={isLoading}
              className="h-14 px-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:from-cyan-400 hover:to-blue-500 transition-all glow-cyan"
            >
              {isLoading ? (
                <>
                  <Zap className="w-4 h-4 mr-2 animate-pulse" />
                  Scanning...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Scan
                </>
              )}
            </Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          No signup required. We don't store your scan results.
        </p>
      </motion.form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 p-4 rounded-lg glass-card border border-border/50"
      >
        <h3 className="font-medium text-sm mb-3 flex items-center gap-2">
          <Shield className="w-4 h-4 text-cyan-400" />
          Scanner Detects:
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs text-muted-foreground">
          {[
            "Stripe & AWS keys",
            "GitHub & Slack tokens",
            "Missing security headers",
            "Cookie vulnerabilities",
            "Mixed content issues",
            "JavaScript patterns",
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <ArrowRight className="w-3 h-3 text-cyan-400" />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
