"use client";

import { motion } from "framer-motion";
import { AlertTriangle, Eye, Zap, Key, Lock, FileCode, Globe, Cookie } from "lucide-react";

export function ProblemSolutionSection() {
  return (
    <section id="how-it-works" className="py-24 px-4 relative">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Every Day, Secrets Slip Through
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            A single leaked API key can cost thousands. Misconfigured headers expose your site to XSS. Insecure cookies leak sessions. Most developers don't know until it's too late.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div className="p-6 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <h3 className="font-semibold">The Problem</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your frontend JavaScript is shipped to every user. Hidden in that bundle might be a Stripe secret, an AWS key, or a database connection string. Missing security headers leave you vulnerable to XSS, clickjacking, and data leakage. Attackers automate scanning millions of sites daily, looking for exactly these mistakes.
              </p>
            </div>
            <div className="p-6 rounded-lg bg-muted/30 border border-border">
              <div className="flex items-center gap-3 mb-4">
                <Eye className="w-5 h-5 text-warning" />
                <h3 className="font-semibold">The Reality</h3>
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Traditional security tools are slow, expensive, and require deployment. By the time you run a scan, the damage might already be done. You need to catch issues before they ship. And you need to understand what you're actually running — every framework, server, and service.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="p-6 rounded-lg bg-muted/50 border border-primary/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Zap className="w-24 h-24" />
            </div>
            <div className="flex items-center gap-3 mb-4">
              <Zap className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">The Sentinel Solution</h3>
            </div>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Sentinel scans any URL in seconds. No deployment needed. No accounts required. Just paste your URL and get an instant security report.
            </p>
            <ul className="space-y-2 text-sm">
              {[
                "50+ secret patterns: Stripe, AWS, GitHub, OpenAI, JWT, DB URLs",
                "12 security headers: CSP, HSTS, COOP, CORP, and more",
                "Cookie analysis: Secure, HttpOnly, SameSite flags",
                "JavaScript security: eval(), inline scripts, XSS patterns",
                "Mixed content detection: HTTP resources on HTTPS",
                "SRI validation: Scripts and styles without integrity",
                "GraphQL introspection: Exposed endpoint detection",
                "Tech fingerprinting: 100+ frameworks & services",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="text-primary">✓</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
