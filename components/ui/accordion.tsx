"use client";

import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, ChevronUp } from "lucide-react";
import { ReactNode } from "react";

interface AccordionItemProps {
  isOpen: boolean;
  onToggle: () => void;
  title: string;
  icon: ReactNode;
  badge?: string | number;
  badgeColor?: "cyan" | "amber" | "red" | "green";
  children: ReactNode;
}

export function AccordionItem({
  isOpen,
  onToggle,
  title,
  icon,
  badge,
  badgeColor = "cyan",
  children,
}: AccordionItemProps) {
  const badgeColors = {
    cyan: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
    amber: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    red: "bg-red-500/20 text-red-400 border-red-500/30",
    green: "bg-green-500/20 text-green-400 border-green-500/30",
  };

  return (
    <div className="glass-card rounded-lg border border-border/50 overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-muted/30 transition-colors accordion-trigger cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <span className="text-cyan-400">{icon}</span>
          <span className="font-medium">{title}</span>
          {badge !== undefined && (
            <span className={`px-2 py-0.5 text-xs rounded-full border ${badgeColors[badgeColor]}`}>
              {badge}
            </span>
          )}
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className="p-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface AccordionProps {
  children: ReactNode;
  defaultOpen?: number;
}

export function Accordion({ children, defaultOpen = 0 }: AccordionProps) {
  return <div className="space-y-3">{children}</div>;
}
