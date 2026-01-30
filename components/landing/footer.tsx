"use client";

import { Github, Instagram } from "lucide-react";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="border-t border-border py-12 px-4 bg-muted/20">
      <div className="max-w-5xl mx-auto">
        <div className="grid gap-8 mb-8">
          <div>
            <Logo size="md" className="mb-4" />
            <p className="text-sm text-muted-foreground">
              Stateless security scanner for modern web applications. Find leaked secrets, misconfigured headers, and vulnerabilities before attackers do.
            </p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-border">
          <div className="text-xs text-muted-foreground mb-4 md:mb-0">
            © 2026 Caseinn. All rights reserved. No data stored.
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com/Caseinn"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Github className="w-5 h-5" />
            </a>
            <a
              href="https://instagram.com/ditorifkii"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Instagram className="w-5 h-5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
