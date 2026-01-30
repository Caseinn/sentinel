"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Key, Cookie, Globe, Eye, Lock } from "lucide-react";

export function ProductShowcaseSection() {
  return (
    <section id="demo" className="py-24 px-4 bg-muted/20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            See It In Action
          </h2>
          <p className="text-muted-foreground text-lg">
            Scan any URL and get instant results with 100+ security checks
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="relative"
        >
          <div className="rounded-lg border border-border overflow-hidden bg-[#1e1e1e]">
            <div className="flex items-center gap-2 px-4 py-3 bg-[#2d2d2d] border-b border-border">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
              </div>
              <div className="text-xs text-muted-foreground ml-2">
                sentinel — scan result
              </div>
            </div>
            <div className="p-6 font-mono text-sm space-y-4 overflow-x-auto">
              <div className="text-muted-foreground">
                <span className="text-success">$</span> sentinel scan https://example.com
              </div>
              <div className="text-muted-foreground">
                {`>`} Connecting to target...
              </div>
              <div className="text-muted-foreground">
                {`>`} Analyzing 12 security headers...
              </div>
              <div className="text-muted-foreground">
                {`>`} Hunting for secrets in JavaScript bundles...
              </div>
              <div className="text-muted-foreground">
                {`>`} Checking cookies for Secure/HttpOnly/SameSite...
              </div>
              <div className="text-muted-foreground">
                {`>`} Detecting mixed content...
              </div>
              <div className="text-muted-foreground">
                {`>`} Technology fingerprinting...
              </div>
              <div className="h-px bg-border my-4" />
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="text-muted-foreground text-xs">SECURITY GRADE</div>
                  <div className="text-4xl font-bold text-warning">B</div>
                </div>
                <div className="space-y-2">
                  <div className="text-muted-foreground text-xs">ISSUES FOUND</div>
                  <div className="text-4xl font-bold text-warning">5</div>
                </div>
                <div className="space-y-2">
                  <div className="text-muted-foreground text-xs">TECH DETECTED</div>
                  <div className="text-4xl font-bold text-cyan-400">8</div>
                </div>
              </div>
              <div className="h-px bg-border my-4" />
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-destructive">✗</span>
                  <span className="text-destructive">Content-Security-Policy missing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-destructive">✗</span>
                  <span className="text-destructive">Strict-Transport-Security missing</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-amber-400">!</span>
                  <span className="text-amber-400">Cookie without HttpOnly flag</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-success">✓</span>
                  <span className="text-success">X-Frame-Options present</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-success">✓</span>
                  <span className="text-success">No secrets detected</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 mt-12">
          {[
            { icon: Lock, label: "Security Headers", desc: "12 headers checked" },
            { icon: Key, label: "Secrets Detection", desc: "50+ patterns" },
            { icon: Cookie, label: "Cookie Security", desc: "Secure, HttpOnly, SameSite" },
            { icon: Globe, label: "Mixed Content", desc: "HTTP on HTTPS pages" },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 + i * 0.1 }}
            >
              <Card className="bg-muted/30 border-border">
                <CardHeader className="pb-2">
                  <item.icon className="w-5 h-5 text-primary mb-2" />
                  <CardTitle className="text-base">{item.label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
