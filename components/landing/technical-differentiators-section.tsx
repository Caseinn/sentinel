"use client";

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Terminal, Key, Lock, Eye, Globe, Cookie, Fingerprint, CheckCircle } from "lucide-react";

export function TechnicalDifferentiatorsSection() {
  const features = [
    {
      icon: Key,
      title: "50+ Secret Patterns",
      description: "Detects Stripe, AWS, GitHub, OpenAI, JWT, private keys, database URLs, Slack/Discord webhooks, NPM tokens, and more.",
    },
    {
      icon: Lock,
      title: "12 Security Headers",
      description: "Analyzes CSP, HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP, CORP, COEP.",
    },
    {
      icon: Cookie,
      title: "Cookie Security",
      description: "Checks Secure, HttpOnly, SameSite flags on all cookies. Identifies session cookies missing protection.",
    },
    {
      icon: Globe,
      title: "Mixed Content",
      description: "Finds HTTP resources loaded on HTTPS pages — scripts, stylesheets, images, iframes, and AJAX calls.",
    },
    {
      icon: Eye,
      title: "GraphQL Security",
      description: "Detects exposed GraphQL endpoints with introspection enabled. Prevents schema exposure attacks.",
    },
    {
      icon: Fingerprint,
      title: "100+ Tech Signatures",
      description: "Identifies frontend frameworks, backend servers, CDNs, databases, ORMs, analytics, payments, and more.",
    },
  ];

  const comparison = [
    { feature: "Secrets Detection (50+ patterns)", sentinel: true, traditional: false },
    { feature: "Security Headers (12 checks)", sentinel: true, traditional: true },
    { feature: "Cookie Security Analysis", sentinel: true, traditional: false },
    { feature: "Mixed Content Scanning", sentinel: true, traditional: false },
    { feature: "GraphQL Introspection Check", sentinel: true, traditional: false },
    { feature: "Tech Stack Fingerprinting", sentinel: true, traditional: false },
    { feature: "No Signup Required", sentinel: true, traditional: false },
    { feature: "Zero Data Storage", sentinel: true, traditional: false },
    { feature: "Instant Results", sentinel: true, traditional: false },
  ];

  return (
    <section id="features" className="py-24 px-4 bg-muted/20">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            100+ Security Checks
          </h2>
          <p className="text-muted-foreground text-lg">
            Comprehensive security scanning that goes far beyond traditional tools
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.05 }}
            >
              <Card className="bg-muted/30 border-border h-full">
                <CardHeader className="pb-2">
                  <feature.icon className="w-5 h-5 text-primary mb-2" />
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="rounded-lg border border-border overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50 border-b border-border">
                  <th className="text-left p-4 font-medium">Feature</th>
                  <th className="text-center p-4 font-medium text-primary">Sentinel</th>
                  <th className="text-center p-4 font-medium text-muted-foreground">Traditional Tools</th>
                </tr>
              </thead>
              <tbody>
                {comparison.map((row, i) => (
                  <tr key={i} className="border-b border-border/50">
                    <td className="p-4">{row.feature}</td>
                    <td className="text-center p-4">
                      {row.sentinel ? (
                        <CheckCircle className="w-5 h-5 text-cyan-400 mx-auto" />
                      ) : (
                        <Badge variant="outline" className="text-xs">—</Badge>
                      )}
                    </td>
                    <td className="text-center p-4">
                      {row.traditional ? (
                        <CheckCircle className="w-5 h-5 text-muted-foreground mx-auto" />
                      ) : (
                        <Badge variant="outline" className="text-xs">—</Badge>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
