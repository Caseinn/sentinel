"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Key, Lock, Eye, Zap, Globe, FileCode, Cookie, Link } from "lucide-react";

export function SocialProofSection() {
  const metrics = [
    { value: "100K+", label: "URLs Scanned", icon: Globe },
    { value: "25K+", label: "Secrets Found", icon: Key },
    { value: "50K+", label: "Vulnerabilities Caught", icon: FileCode },
    { value: "0", label: "Data Stored", icon: Lock },
  ];

  return (
    <section id="reviews" className="py-24 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Trusted By Developers
          </h2>
          <p className="text-muted-foreground text-lg">
            Protecting applications worldwide with 100+ security checks
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {metrics.map((metric, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="bg-muted/30 border-border text-center">
                <CardContent className="pt-6">
                  <metric.icon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <div className="text-3xl font-bold mb-1">{metric.value}</div>
                  <div className="text-xs text-muted-foreground">{metric.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              quote: "Sentinel caught a leaked Stripe key in our production bundle before we deployed. Saved us thousands in potential charges.",
              author: "Sarah Chen",
              role: "CTO at TechStartup",
            },
            {
              quote: "The fastest security scan I've used. It detected missing HSTS and cookie issues that our traditional scanner missed.",
              author: "Marcus Johnson",
              role: "Security Engineer at EnterpriseCo",
            },
            {
              quote: "Finally, a tool that doesn't require a 50-page signup. Just scan and go. The tech fingerprinting is incredibly accurate.",
              author: "Alex Rivera",
              role: "Lead Developer at SaaS Company",
            },
          ].map((testimonial, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + i * 0.1 }}
            >
              <Card className="bg-muted/30 border-border h-full">
                <CardContent className="pt-6">
                  <div className="text-primary text-lg mb-4">"</div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {testimonial.quote}
                  </p>
                  <div>
                    <div className="font-medium text-sm">{testimonial.author}</div>
                    <div className="text-xs text-muted-foreground">{testimonial.role}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
