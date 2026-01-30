"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { motion } from "framer-motion";
import {
  Terminal, Code, RefreshCw, Copy, Check,
  ExternalLink, AlertTriangle, ChevronDown, ChevronUp,
  Lock, Globe, Server, Database, Eye, Share2, Target,
  ShieldCheck, ShieldAlert, Fingerprint, Shield
} from "lucide-react";
import { useState } from "react";
import type { ScanResult } from "@/app/actions";
import { generateMarkdownReport, generateShareableLink } from "@/lib/export";
import Link from "next/link";
import { LogoIcon } from "@/components/logo";

interface ScanResultsProps {
  result: ScanResult;
  onRescan: () => void;
}

export function ScanResults({ result, onRescan }: ScanResultsProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Set<string>>(new Set(["overview"]));
  const [showSecrets, setShowSecrets] = useState<Set<number>>(new Set());
  const [exportFormat, setExportFormat] = useState<"json" | "markdown" | "link" | null>(null);

  const toggleSection = (section: string) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(section)) {
      newOpen.delete(section);
    } else {
      newOpen.add(section);
    }
    setOpenSections(newOpen);
  };

  const copyToClipboard = async (text: string, format: string) => {
    await navigator.clipboard.writeText(text);
    setCopied(format);
    setTimeout(() => setCopied(null), 2000);
  };

  const toggleSecretReveal = (index: number) => {
    const newShow = new Set(showSecrets);
    if (newShow.has(index)) {
      newShow.delete(index);
    } else {
      newShow.add(index);
    }
    setShowSecrets(newShow);
  };

  const shareLink = generateShareableLink(result);

  const getExportData = () => {
    if (exportFormat === "json") {
      return JSON.stringify(result, null, 2);
    } else if (exportFormat === "markdown") {
      return generateMarkdownReport(result);
    }
    return "";
  };

  const getConfidenceBadge = (confidence: string) => {
    switch (confidence) {
      case "high": return <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">HIGH</Badge>;
      case "medium": return <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">MEDIUM</Badge>;
      case "low": return <Badge className="text-xs bg-slate-500/20 text-slate-400 border-slate-500/30">LOW</Badge>;
      default: return null;
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case "critical": return <Badge className="text-xs bg-red-500/20 text-red-400 border-red-500/30">CRITICAL</Badge>;
      case "high": return <Badge className="text-xs bg-orange-500/20 text-orange-400 border-orange-500/30">HIGH</Badge>;
      case "medium": return <Badge className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">MEDIUM</Badge>;
      case "low": return <Badge className="text-xs bg-slate-500/20 text-slate-400 border-slate-500/30">LOW</Badge>;
      default: return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full max-w-5xl mx-auto space-y-6"
    >
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-cyan-400 transition-colors cursor-pointer"
        >
          <LogoIcon className="w-4 h-4" />
          <span>Sentinel</span>
        </Link>
        <Button
          variant="outline"
          size="sm"
          onClick={onRescan}
          className="border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          New Scan
        </Button>
      </div>

      {result.redirectChain.length > 1 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg glass-card border border-border/50"
        >
          <div className="flex items-center gap-2 mb-3">
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            <h3 className="font-medium text-sm">Redirect Chain</h3>
          </div>
          <div className="space-y-2">
            {result.redirectChain.map((step, i) => (
              <div key={i} className="flex items-center gap-2 text-xs">
                <span className="text-muted-foreground w-16">#{i + 1}</span>
                <span className="text-muted-foreground w-12">{step.statusCode}</span>
                <span className="truncate text-foreground flex-1 font-mono">{step.url}</span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="md:col-span-2 rounded-lg glass-card border border-border/50 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Terminal className="w-5 h-5 text-cyan-400" />
              <h3 className="font-medium">TLS Check</h3>
            </div>
            <div className="text-xs text-muted-foreground flex items-center gap-2">
              <Target className="w-3 h-3" />
              {result.url.startsWith("https") ? "HTTPS" : "HTTP"}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              {result.tlsCheck.httpRedirectsToHttps ? (
                <Check className="w-4 h-4 text-cyan-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <span className={result.tlsCheck.httpRedirectsToHttps ? "text-cyan-400" : "text-amber-400"}>
                HTTP → HTTPS
              </span>
            </div>
            <div className="flex items-center gap-2">
              {result.tlsCheck.httpsReachable ? (
                <Check className="w-4 h-4 text-cyan-400" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-amber-400" />
              )}
              <span className={result.tlsCheck.httpsReachable ? "text-cyan-400" : "text-amber-400"}>
                HTTPS Reachable
              </span>
            </div>
            <div className="text-muted-foreground">
              Status: {result.tlsCheck.httpsStatus || "N/A"}
            </div>
            <div className="text-muted-foreground">
              Duration: {(result.duration / 1000).toFixed(2)}s
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        {[
          { label: "Critical", value: result.summary.critical, color: "text-red-400", bg: "bg-red-500/10 border-red-500/30" },
          { label: "High", value: result.summary.high, color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/30" },
          { label: "Medium", value: result.summary.medium, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/30" },
          { label: "Low", value: result.summary.low, color: "text-slate-400", bg: "bg-slate-500/10 border-slate-500/30" },
          { label: "Cookies", value: result.cookieAnalysis.totalCookies, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
          { label: "Tech", value: result.technologies.length, color: "text-cyan-400", bg: "bg-cyan-500/10 border-cyan-500/30" },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          >
            <div className={`rounded-lg border p-4 text-center ${stat.bg}`}>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 rounded-lg glass-card border border-border/50">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-sm flex items-center gap-2">
            <Share2 className="w-4 h-4 text-cyan-400" />
            Export Report
          </h3>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportFormat("json")}
              className="text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              JSON
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setExportFormat("markdown")}
              className="text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              Markdown
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => copyToClipboard(shareLink, "link")}
              className="text-xs border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
            >
              {copied === "link" ? <Check className="w-3 h-3" /> : <Share2 className="w-3 h-3" />}
              <span className="ml-1">Share</span>
            </Button>
          </div>
        </div>
        {exportFormat && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="relative"
          >
            <textarea
              value={getExportData()}
              readOnly
              className="w-full h-32 p-3 text-xs font-mono bg-muted/50 border border-border rounded-lg resize-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50"
            />
            <Button
              size="sm"
              variant="outline"
              className="absolute top-2 right-2 border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10"
              onClick={() => copyToClipboard(getExportData(), exportFormat)}
            >
              {copied === exportFormat ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="absolute bottom-2 right-2 text-xs text-muted-foreground hover:text-foreground"
              onClick={() => setExportFormat(null)}
            >
              Close
            </Button>
          </motion.div>
        )}
      </div>

      <Accordion defaultOpen={0}>
        <AccordionItem
          isOpen={openSections.has("overview")}
          onToggle={() => toggleSection("overview")}
          title="Security Overview"
          icon={<ShieldCheck className="w-5 h-5" />}
          badge={result.summary.critical + result.summary.high + result.summary.medium + result.summary.low}
          badgeColor={result.summary.critical > 0 ? "red" : result.summary.high > 0 ? "amber" : "green"}
        >
          <div className="space-y-4">
            {result.summary.critical > 0 && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <ShieldAlert className="w-4 h-4 text-red-400" />
                  <h4 className="font-medium text-red-400">Critical Issues Found</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  {result.summary.critical} critical security issue(s) require immediate attention.
                </p>
              </div>
            )}

            {result.secrets.length === 0 ? (
              <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
                <div className="flex items-center gap-2 mb-2">
                  <Check className="w-4 h-4 text-cyan-400" />
                  <h4 className="font-medium text-cyan-400">No Secrets Detected</h4>
                </div>
                <p className="text-sm text-muted-foreground">
                  No leaked credentials found in the scanned content.
                </p>
              </div>
            ) : null}

            {result.technologies.length > 0 && (
              <div>
                <h4 className="font-medium text-sm mb-3 flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-cyan-400" />
                  Detected Technologies ({result.technologies.length})
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.technologies.map((tech, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border"
                    >
                      {tech.category === "Frontend Framework" && <Code className="w-3 h-3 text-cyan-400" />}
                      {tech.category === "Backend Framework" && <Server className="w-3 h-3 text-cyan-400" />}
                      {tech.category === "Server" && <Globe className="w-3 h-3 text-cyan-400" />}
                      {tech.category === "Analytics" && <Eye className="w-3 h-3 text-cyan-400" />}
                      {tech.category === "Payments" && <Database className="w-3 h-3 text-cyan-400" />}
                      <span className="text-sm">{tech.name}</span>
                      {getConfidenceBadge(tech.confidence)}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-border">
              <div className="text-xs text-muted-foreground">
                Scan completed in {(result.duration / 1000).toFixed(2)}s
              </div>
            </div>
          </div>
        </AccordionItem>

        <AccordionItem
          isOpen={openSections.has("headers")}
          onToggle={() => toggleSection("headers")}
          title="Security Headers"
          icon={<Terminal className="w-5 h-5" />}
          badge={result.headers.filter(h => h.status === "fail").length}
          badgeColor={result.headers.some(h => h.status === "fail" && h.severity === "high") ? "red" : "amber"}
        >
          <div className="space-y-3">
            {result.headers.map((header, i) => (
              <div
                key={i}
                className={`p-4 rounded-lg border ${
                  header.status === "pass"
                    ? "bg-cyan-500/10 border-cyan-500/20"
                    : header.status === "warning"
                    ? "bg-amber-500/10 border-amber-500/20"
                    : "bg-red-500/10 border-red-500/20"
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-lg ${
                        header.status === "pass" ? "text-cyan-400" : header.status === "warning" ? "text-amber-400" : "text-red-400"
                      }`}
                    >
                      {header.status === "pass" ? "✓" : header.status === "warning" ? "!" : "✗"}
                    </span>
                    <div>
                      <div className="font-medium text-sm">{header.name}</div>
                      <div className="text-xs text-muted-foreground">{header.description}</div>
                    </div>
                  </div>
                  {getSeverityBadge(header.severity)}
                </div>
                
                {header.details && (
                  <div className="ml-8 mb-2 text-xs text-muted-foreground">
                    {header.details}
                  </div>
                )}
                
                {header.recommendation && (
                  <div className="ml-8 mt-2 p-2 rounded bg-muted/50 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Fix: </span>
                    {header.recommendation}
                  </div>
                )}
                
                {header.value && (
                  <div className="ml-8 mt-2 p-2 rounded bg-[#0d1117] border border-border font-mono text-xs break-all max-h-20 overflow-y-auto">
                    {header.value}
                  </div>
                )}
              </div>
            ))}
          </div>
        </AccordionItem>

        <AccordionItem
          isOpen={openSections.has("secrets")}
          onToggle={() => toggleSection("secrets")}
          title="Detected Secrets"
          icon={<Lock className="w-5 h-5" />}
          badge={result.secrets.length}
          badgeColor={result.secrets.some(s => s.severity === "critical") ? "red" : result.secrets.length > 0 ? "amber" : "green"}
        >
          {result.secrets.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-cyan-400 text-4xl mb-2">✓</div>
              <h3 className="font-medium mb-1">No secrets detected</h3>
              <p className="text-sm text-muted-foreground">
                No leaked credentials found in the scanned content.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {result.secrets.map((secret, i) => (
                <div
                  key={i}
                  className="p-4 rounded-lg bg-red-500/10 border border-red-500/20"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getSeverityBadge(secret.severity)}
                      <span className="text-sm font-medium">{secret.type}</span>
                      {getConfidenceBadge(secret.confidence)}
                    </div>
                    <span className="text-xs text-muted-foreground">{secret.location}</span>
                  </div>
                  
                  <p className="text-xs text-muted-foreground mb-3">{secret.description}</p>
                  
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => toggleSecretReveal(i)}
                    >
                      {showSecrets.has(i) ? (
                        <>
                          <ChevronUp className="w-3 h-3 mr-1" />
                          Hide
                        </>
                      ) : (
                        <>
                          <ChevronDown className="w-3 h-3 mr-1" />
                          Reveal
                        </>
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 text-xs text-muted-foreground hover:text-foreground"
                      onClick={() => copyToClipboard(secret.redacted, `secret-${i}`)}
                    >
                      {copied === `secret-${i}` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </Button>
                  </div>
                  
                  <div className="p-2 rounded bg-[#0d1117] border border-border font-mono text-xs break-all">
                    {secret.redacted}
                  </div>
                  
                  {secret.evidence && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      <span className="font-medium">Evidence: </span>
                      {secret.evidence}
                    </div>
                  )}
                  
                  {secret.recommendation && (
                    <div className="mt-2 p-2 rounded bg-amber-500/10 border border-amber-500/20 text-xs">
                      <span className="font-medium text-amber-400">Recommendation: </span>
                      {secret.recommendation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </AccordionItem>

        <AccordionItem
          isOpen={openSections.has("cookies")}
          onToggle={() => toggleSection("cookies")}
          title="Cookie Security"
          icon={<Shield size={20} />}
          badge={result.cookieAnalysis.cookiesWithIssues}
          badgeColor={result.cookieAnalysis.summary.critical > 0 ? "red" : result.cookieAnalysis.cookiesWithIssues > 0 ? "amber" : "green"}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
              <div className="text-2xl font-bold text-foreground">{result.cookieAnalysis.totalCookies}</div>
              <div className="text-xs text-muted-foreground">Total</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
              <div className="text-2xl font-bold text-cyan-400">{result.cookieAnalysis.secureCookies}</div>
              <div className="text-xs text-muted-foreground">Secure</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
              <div className="text-2xl font-bold text-cyan-400">{result.cookieAnalysis.httpOnlyCookies}</div>
              <div className="text-xs text-muted-foreground">HttpOnly</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
              <div className="text-2xl font-bold text-amber-400">{result.cookieAnalysis.cookiesWithIssues}</div>
              <div className="text-xs text-muted-foreground">Issues</div>
            </div>
          </div>

          {result.cookieAnalysis.totalCookies === 0 ? (
            <div className="text-center py-8">
              <div className="text-cyan-400 text-4xl mb-2">✓</div>
              <h3 className="font-medium mb-1">No cookies detected</h3>
              <p className="text-sm text-muted-foreground">
                No cookies were found in the response headers.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {result.cookieAnalysis.cookies.map((cookie, i) => (
                <div
                  key={i}
                  className={`p-4 rounded-lg border ${
                    cookie.issues.length === 0
                      ? "bg-cyan-500/10 border-cyan-500/20"
                      : cookie.issues.some(i => i.severity === "critical")
                      ? "bg-red-500/10 border-red-500/20"
                      : "bg-amber-500/10 border-amber-500/20"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <div className="font-medium text-sm flex items-center gap-2">
                        <span>{cookie.name}</span>
                        {cookie.sessionCookie ? (
                          <Badge className="text-xs bg-slate-500/20 text-slate-400 border-slate-500/30">Session</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs">Persistent</Badge>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Path: {cookie.path} {cookie.domain && `| Domain: ${cookie.domain}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {cookie.secure ? (
                        <span className="text-cyan-400 flex items-center gap-1"><Check className="w-3 h-3" /> Secure</span>
                      ) : (
                        <span className="text-red-400">✗ Secure</span>
                      )}
                      {cookie.httpOnly ? (
                        <span className="text-cyan-400 flex items-center gap-1"><Check className="w-3 h-3" /> HttpOnly</span>
                      ) : (
                        <span className="text-red-400">✗ HttpOnly</span>
                      )}
                      {cookie.sameSite ? (
                        <Badge variant="outline" className="text-xs">SameSite={cookie.sameSite}</Badge>
                      ) : (
                        <span className="text-amber-400">No SameSite</span>
                      )}
                    </div>
                  </div>

                  {cookie.issues.length > 0 && (
                    <div className="space-y-2 mt-3 pt-3 border-t border-border">
                      {cookie.issues.map((issue, j) => (
                        <div key={j} className="text-xs">
                          <div className="flex items-center gap-2 mb-1">
                            {getSeverityBadge(issue.severity)}
                            <span className="font-medium">{issue.type}</span>
                          </div>
                          <p className="text-muted-foreground ml-2">{issue.description}</p>
                          <div className="ml-2 mt-1 p-2 rounded bg-muted/50 text-xs">
                            <span className="font-medium">Fix: </span>
                            {issue.recommendation}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </AccordionItem>

          <AccordionItem
            isOpen={openSections.has("mixed")}
            onToggle={() => toggleSection("mixed")}
            title="Mixed Content"
            icon={<Globe className="w-5 h-5" />}
            badge={result.mixedContentAnalysis.totalMixedContent}
            badgeColor={result.mixedContentAnalysis.summary.high > 0 ? "amber" : result.mixedContentAnalysis.totalMixedContent > 0 ? "red" : "green"}
          >
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center p-3 rounded-lg bg-muted/50 border border-border">
                <div className="text-2xl font-bold text-foreground">{result.mixedContentAnalysis.totalMixedContent}</div>
                <div className="text-xs text-muted-foreground">Total</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-red-500/10 border border-red-500/30">
                <div className="text-2xl font-bold text-red-400">{result.mixedContentAnalysis.summary.critical}</div>
                <div className="text-xs text-muted-foreground">Critical</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-orange-500/10 border border-orange-500/30">
                <div className="text-2xl font-bold text-orange-400">{result.mixedContentAnalysis.summary.high}</div>
                <div className="text-xs text-muted-foreground">High</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-amber-500/10 border border-amber-500/30">
                <div className="text-2xl font-bold text-amber-400">{result.mixedContentAnalysis.summary.medium}</div>
                <div className="text-xs text-muted-foreground">Medium</div>
              </div>
              <div className="text-center p-3 rounded-lg bg-slate-500/10 border border-slate-500/30">
                <div className="text-2xl font-bold text-slate-400">{result.mixedContentAnalysis.summary.low}</div>
                <div className="text-xs text-muted-foreground">Low</div>
              </div>
            </div>

            {result.mixedContentAnalysis.totalMixedContent === 0 ? (
              <div className="text-center py-8">
                <div className="text-cyan-400 text-4xl mb-2">✓</div>
                <h3 className="font-medium mb-1">No mixed content detected</h3>
                <p className="text-sm text-muted-foreground">
                  All resources are loaded securely over HTTPS.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {result.mixedContentAnalysis.mixedContent.map((item, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-lg border ${
                      item.severity === "critical" ? "bg-red-500/10 border-red-500/20" :
                      item.severity === "high" ? "bg-orange-500/10 border-orange-500/20" :
                      item.severity === "medium" ? "bg-amber-500/10 border-amber-500/20" :
                      "bg-slate-500/10 border-slate-500/20"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        {getSeverityBadge(item.severity)}
                        <span className="text-sm font-medium capitalize">{item.type}</span>
                      </div>
                      <span className="text-xs text-muted-foreground">Line {item.sourceLine}</span>
                    </div>
                    <div className="text-xs font-mono text-muted-foreground break-all">{item.url}</div>
                    <div className="text-xs text-muted-foreground mt-2">{item.sourceLocation}</div>
                  </div>
                ))}
              </div>
            )}
          </AccordionItem>

          <AccordionItem
            isOpen={openSections.has("graphql")}
            onToggle={() => toggleSection("graphql")}
            title="GraphQL Security"
            icon={<Eye className="w-5 h-5" />}
            badge={result.graphQLAnalysis.endpoint ? 1 : 0}
            badgeColor={result.graphQLAnalysis.severity === "high" ? "red" : result.graphQLAnalysis.severity === "medium" ? "amber" : "green"}
          >
            {result.graphQLAnalysis.endpoint ? (
              <div className="space-y-4">
                <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="flex items-center gap-2 mb-2">
                    {getSeverityBadge(result.graphQLAnalysis.severity || "medium")}
                    <span className="font-medium">GraphQL Endpoint Detected</span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    A GraphQL endpoint was found at <code className="text-xs bg-muted px-2 py-1 rounded">{result.graphQLAnalysis.endpoint}</code>
                  </p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className={result.graphQLAnalysis.introspectionEnabled ? "text-red-400" : "text-cyan-400"}>
                        {result.graphQLAnalysis.introspectionEnabled ? "✗" : "✓"}
                      </span>
                      <span>Introspection {result.graphQLAnalysis.introspectionEnabled ? "enabled" : "disabled"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={result.graphQLAnalysis.graphiqlAvailable ? "text-amber-400" : "text-cyan-400"}>
                        {result.graphQLAnalysis.graphiqlAvailable ? "!" : "✓"}
                      </span>
                      <span>GraphiQL {result.graphQLAnalysis.graphiqlAvailable ? "available" : "not found"}</span>
                    </div>
                  </div>
                </div>
                <div className="p-3 rounded bg-amber-500/10 border border-amber-500/20 text-sm">
                  <span className="font-medium text-amber-400">Recommendation: </span>
                  Disable introspection in production by setting <code>graphql.introspection = false</code> in your schema configuration.
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-cyan-400 text-4xl mb-2">✓</div>
                <h3 className="font-medium mb-1">No GraphQL endpoints detected</h3>
                <p className="text-sm text-muted-foreground">
                  No GraphQL endpoints were found during the scan.
                </p>
              </div>
            )}
          </AccordionItem>

          <AccordionItem
            isOpen={openSections.has("tech")}
            onToggle={() => toggleSection("tech")}
            title="Technology Stack"
            icon={<Code className="w-5 h-5" />}
            badge={result.technologies.length}
          >
            {result.technologies.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No technologies detected.
              </div>
            ) : (
              <div className="space-y-4">
                {result.technologies.map((tech, i) => (
                  <div
                    key={i}
                    className="p-4 rounded-lg bg-muted/50 border border-border"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <div className="font-medium text-sm">{tech.name}</div>
                        <div className="text-xs text-muted-foreground">{tech.category}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-xs text-muted-foreground">Confidence</div>
                        <div className="flex items-center gap-1">
                          <div className="w-24 h-2 rounded-full bg-muted">
                            <div
                              className={`h-full rounded-full ${
                                tech.confidence === "high" ? "bg-cyan-400" : tech.confidence === "medium" ? "bg-amber-400" : "bg-slate-400"
                              }`}
                              style={{ width: `${tech.confidenceScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-medium">{tech.confidenceScore}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-1">
                      <div className="text-xs font-medium text-muted-foreground">Evidence:</div>
                      {tech.evidence.map((ev, j) => (
                        <div key={j} className="flex items-center gap-2 text-xs">
                          <span className="text-cyan-400">•</span>
                          <span className="font-mono text-muted-foreground">{ev}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3 flex flex-wrap gap-1">
                      {tech.signals.map((signal, j) => (
                        <Badge key={j} variant="outline" className="text-xs border-slate-500/30 text-slate-400">
                          {signal.type}: {signal.value}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </AccordionItem>

        </Accordion>
    </motion.div>
  );
}
