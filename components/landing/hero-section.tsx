"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Shield, Terminal, Zap, Lock, Target, Eye, Fingerprint, Key, Cookie, FileCode, Globe, Link } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { useRouter } from "next/navigation";

export function HeroSection() {
  const [url, setUrl] = useState("");
  const router = useRouter();

  const handleScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (url.trim()) {
      router.push(`/scan?url=${encodeURIComponent(url.trim())}`);
    }
  };

  return (
    <section className="min-h-screen flex items-center justify-center px-4 py-20 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500/5 via-background to-background" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-xs text-cyan-400 mb-6">
            <Target className="w-3 h-3" />
            <span>Sentinel v1.0.0 — Stateless Security Scanner</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
            Scan any URL. <span className="text-cyan-400 text-glow-cyan">Stay secure.</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
            Detect leaked secrets, misconfigured headers, cookie issues, and 100+ security vulnerabilities in seconds. Zero storage. Complete privacy.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          onSubmit={handleScan}
          className="max-w-xl mx-auto mb-12"
        >
          <div className="relative group">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/50 to-blue-500/50 rounded-lg blur opacity-25 group-hover:opacity-50 transition-opacity" />
            <div className="relative flex gap-2">
              <Input
                type="url"
                placeholder="https://example.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="h-14 pl-4 text-base bg-muted/50 border-border focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500/50 rounded-lg"
                required
              />
              <Button type="submit" size="lg" className="h-14 px-8 bg-gradient-to-r from-cyan-500 to-blue-600 text-black hover:from-cyan-400 hover:to-blue-500 transition-all glow-cyan">
                <Zap className="w-4 h-4 mr-2" />
                Scan Now
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            No signup required. We don't store your scan results.
          </p>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {[
            { icon: Key, label: "Secrets Detection", desc: "50+ patterns for API keys, tokens, database URLs", color: "text-cyan-400" },
            { icon: Lock, label: "Security Headers", desc: "CSP, HSTS, COOP, CORP, and 9 more", color: "text-amber-400" },
            { icon: Cookie, label: "Cookie Security", desc: "Secure, HttpOnly, SameSite flags", color: "text-green-400" },
            { icon: FileCode, label: "JavaScript Safety", desc: "eval(), inline scripts, XSS patterns", color: "text-red-400" },
            { icon: Globe, label: "Mixed Content", desc: "HTTP resources on HTTPS pages", color: "text-orange-400" },
            { icon: Link, label: "Subresource Integrity", desc: "SRI validation for scripts & styles", color: "text-purple-400" },
            { icon: Eye, label: "GraphQL Security", desc: "Introspection & exposed schemas", color: "text-pink-400" },
            { icon: Fingerprint, label: "Tech Stack", desc: "100+ frameworks, servers & services", color: "text-blue-400" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className="flex items-center gap-3 p-4 rounded-lg glass-card border border-border/50 hover:border-cyan-500/30 transition-all group cursor-pointer"
            >
              <div className={`p-2 rounded-lg bg-muted/50 ${item.color} group-hover:bg-muted transition-colors`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="font-medium text-sm">{item.label}</div>
                <div className="text-xs text-muted-foreground">{item.desc}</div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
