"use client";

import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Terminal, Shield, Zap, Key, Lock, Globe, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function ConversionSection() {
  const router = useRouter();

  return (
    <section className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 via-background to-background opacity-50" />
      <div className="max-w-4xl mx-auto text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-3xl md:text-5xl font-bold mb-6">
            Ready To Secure Your Application?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Get instant security analysis with 100+ checks. Detect secrets, headers, cookies, JavaScript issues, and more.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              onClick={() => router.push("/scan")}
              className="text-lg h-14 px-8"
            >
              <Terminal className="w-5 h-5 mr-2" />
              Run Security Check
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-primary" />
              <span>Free forever</span>
            </div>
            <div className="flex items-center gap-2">
              <Key className="w-4 h-4 text-primary" />
              <span>50+ secret patterns</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-primary" />
              <span>No data stored</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-primary" />
              <span>100+ security checks</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-primary" />
              <span>Instant results</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
