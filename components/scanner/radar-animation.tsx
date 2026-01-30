"use client";

import { motion } from "framer-motion";
import { Shield, Zap, CheckCircle } from "lucide-react";

interface RadarAnimationProps {
  scanComplete?: boolean;
  onComplete: () => void;
  url?: string;
  onCancel: () => void;
}

export function RadarAnimation({ scanComplete, onComplete, url, onCancel }: RadarAnimationProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0F1115]">
      <div className="relative w-full max-w-2xl px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative"
        >
          <div className="flex justify-center mb-8">
            <motion.div
              className="relative"
              animate={scanComplete ? { scale: [1, 1.1, 1] } : { scale: [1, 1.05, 1] }}
              transition={scanComplete ? { duration: 0.5, repeat: 0 } : { duration: 2, repeat: Infinity }}
            >
              {scanComplete ? (
                <>
                  <div className="absolute inset-0 bg-green-500/20 rounded-full blur-3xl" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-green-500/30 to-emerald-600/30 border border-green-500/50 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-cyan-500/20 rounded-full blur-3xl" />
                  <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-cyan-500/30 to-blue-600/30 border border-cyan-500/50 flex items-center justify-center">
                    <Shield className="w-10 h-10 text-cyan-400" />
                  </div>
                </>
              )}
            </motion.div>
          </div>

          <div className="relative h-80 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center justify-center">
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute rounded-full border border-cyan-500/20"
                  animate={scanComplete 
                    ? { opacity: 0, scale: [1, 1.5] } 
                    : { opacity: [0.3, 0.8, 0.3], scale: [1 + i * 0.3, 1.5 + i * 0.3, 1 + i * 0.3] }}
                  transition={scanComplete ? { duration: 0.5 } : { duration: 2, repeat: Infinity, delay: i * 0.3 }}
                  style={{
                    width: `${200 + i * 80}px`,
                    height: `${200 + i * 80}px`,
                  }}
                />
              ))}
            </div>

            {!scanComplete && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                {[0, 90, 180, 270].map((angle) => (
                  <div
                    key={angle}
                    className="absolute w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent"
                    style={{ top: "50%", transform: `rotate(${angle}deg)` }}
                  />
                ))}
              </motion.div>
            )}

            {!scanComplete && (
              <motion.div
                className="absolute"
                animate={{ rotate: 360 }}
                transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-64 h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent absolute top-0 left-0" />
                <div className="w-1 h-3 bg-cyan-400 rounded-full absolute top-0 left-1/2 -translate-x-1/2 shadow-[0_0_10px_#00F0FF]" />
              </motion.div>
            )}

            <motion.div
              className="relative z-10 text-center"
              animate={scanComplete 
                ? { opacity: [0.5, 1, 1], y: [10, 0, 0] } 
                : { opacity: [0.5, 1, 0.5] }}
              transition={scanComplete ? { duration: 0.8 } : { duration: 1.5, repeat: Infinity }}
            >
              {scanComplete ? (
                <>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <span className="text-green-400 font-mono text-sm tracking-widest">COMPLETE</span>
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  </div>
                  <p className="text-muted-foreground font-mono text-sm">Redirecting to report...</p>
                </>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Zap className="w-6 h-6 text-cyan-400" />
                    <span className="text-cyan-400 font-mono text-sm tracking-widest">SCANNING</span>
                    <Zap className="w-6 h-6 text-cyan-400" />
                  </div>
                  <p className="text-muted-foreground font-mono text-sm truncate max-w-xs">
                    {url}
                  </p>
                </>
              )}
            </motion.div>
          </div>

          {!scanComplete && (
            <motion.div
              className="mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              <div className="flex justify-center gap-2 mb-4">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 h-2 rounded-full bg-cyan-500/50"
                    animate={{ opacity: [0.3, 1, 0.3], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </div>
              <p className="text-center text-muted-foreground text-xs font-mono">
                Analyzing security headers, detecting secrets, scanning for vulnerabilities...
              </p>
            </motion.div>
          )}

          {!scanComplete && (
            <motion.button
              className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-colors cursor-pointer"
              onClick={onCancel}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          )}
        </motion.div>
      </div>
    </div>
  );
}
