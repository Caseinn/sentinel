"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ScanForm } from "@/components/scanner/scan-form";
import { RadarAnimation } from "@/components/scanner/radar-animation";
import { ScanResults } from "@/components/scanner/scan-results";
import { scanURL, type ScanResult } from "@/app/actions";

function ScanPageContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const initialUrl = searchParams.get("url") || "";
  const reportParam = searchParams.get("report");

  const [url, setUrl] = useState(initialUrl);
  const [isLoading, setIsLoading] = useState(false);
  const [showRadarEffect, setShowRadarEffect] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (e: React.FormEvent | undefined, scanUrl?: string) => {
    e?.preventDefault();
    const targetUrl = (scanUrl || url).trim();
    if (!targetUrl) return;

    setIsLoading(true);
    setShowRadarEffect(true);
    setScanComplete(false);
    setResult(null);
    setError(null);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/scan");
    }

    try {
      const scanResult = await scanURL(targetUrl);
      setScanComplete(true);
      setTimeout(() => {
        setShowRadarEffect(false);
        setResult(scanResult);
      }, 1200);
    } catch (err) {
      setTimeout(() => {
        setShowRadarEffect(false);
        setError(err instanceof Error ? err.message : "An error occurred during scanning");
      }, 500);
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  const handleRescan = useCallback(() => {
    setResult(null);
    setError(null);
    setUrl("");
    setScanComplete(false);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", "/scan");
    } else {
      router.replace("/scan");
    }
  }, [router]);

  useEffect(() => {
    let mounted = true;
    if (initialUrl && mounted) {
      handleSubmit(undefined, initialUrl);
    } else if (reportParam && mounted) {
      try {
        let json: string;
        if (typeof window !== "undefined" && window.atob) {
          const base64 = reportParam.replace(/-/g, "+").replace(/_/g, "/");
          const padded = base64.padEnd(base64.length + (4 - base64.length % 4) % 4, "=");
          json = window.atob(padded);
        } else if (typeof Buffer !== "undefined") {
          json = Buffer.from(reportParam, "base64url").toString("utf-8");
        } else {
          throw new Error("No base64 decoding available");
        }
        const summary = JSON.parse(json);
        
        const mockResult: ScanResult = {
          url: summary.u || "Unknown",
          originalUrl: summary.u || "Unknown",
          timestamp: Date.now(),
          duration: 0,
          score: summary.s || 0,
          grade: summary.g || "F",
          redirectChain: [],
          headers: (summary.h || []).map((h: [string, string]) => ({
            name: h[0],
            status: h[1] as "pass" | "warning" | "fail",
            description: "",
          })),
          secrets: Array(summary.sc || 0).fill({
            type: "Shared Report",
            severity: "info" as const,
            location: "Shared Report",
            redacted: "***",
            description: "This is a shared report summary",
            confidence: "low" as const,
          }),
          technologies: (summary.t || []).map((t: [string, string]) => ({
            name: t[0],
            category: "Unknown",
            confidence: t[1] as "high" | "medium" | "low",
            confidenceScore: t[1] === "high" ? 75 : t[1] === "medium" ? 50 : 25,
            evidence: [],
            signals: [],
          })),
          tlsCheck: {
            httpRedirectsToHttps: summary.ts?.[0] || false,
            httpsStatus: 0,
            httpsReachable: summary.ts?.[1] || false,
          },
          cookieAnalysis: {
            totalCookies: summary.ck?.[0] || 0,
            sessionCookies: 0,
            persistentCookies: 0,
            secureCookies: 0,
            httpOnlyCookies: 0,
            sameSiteCookies: 0,
            cookiesWithIssues: summary.ck?.[1] || 0,
            cookies: [],
            summary: {
              critical: 0,
              high: 0,
              medium: 0,
              low: 0,
            },
          },
          mixedContentAnalysis: {
            hasMixedContent: false,
            totalMixedContent: 0,
            mixedContent: [],
            summary: {
              critical: 0,
              high: 0,
              medium: 0,
              low: 0,
            },
          },
          jsAnalysis: {
            hasInlineScripts: false,
            inlineScriptCount: 0,
            hasEval: false,
            evalCount: 0,
            hasDocumentWrite: false,
            documentWriteCount: 0,
            hasInlineHandlers: false,
            inlineHandlerCount: 0,
            hasDangerousProtocols: false,
            dangerousProtocolCount: 0,
            hasTargetBlank: false,
            targetBlankCount: 0,
            missingNoopener: 0,
            issues: [],
            summary: {
              critical: 0,
              high: 0,
              medium: 0,
              low: 0,
            },
          },
          sriAnalysis: {
            externalScripts: 0,
            scriptsWithSRI: 0,
            externalStylesheets: 0,
            stylesheetsWithSRI: 0,
            scriptsWithoutSRI: [],
            stylesheetsWithoutSRI: [],
            summary: {
              critical: 0,
              high: 0,
              medium: 0,
              low: 0,
            },
          },
          graphQLAnalysis: {
            endpoint: undefined,
            introspectionEnabled: false,
            graphiqlAvailable: false,
            schemaAccessible: false,
            severity: null,
          },
          summary: {
            critical: summary.c || 0,
            high: summary.hg || 0,
            medium: summary.md || 0,
            low: summary.lw || 0,
            passed: 0,
            info: 0,
          },
          scoringDetails: [],
        };
        setResult(mockResult);
      } catch {
        setError("Invalid report link");
      }
    }
    return () => { mounted = false; };
  }, [initialUrl, reportParam, handleSubmit]);

  return (
    <main className="min-h-screen py-12 px-4">
      {showRadarEffect ? (
        <RadarAnimation
          scanComplete={scanComplete}
          onComplete={() => {
            setShowRadarEffect(false);
          }}
          url={url}
          onCancel={() => {
            setShowRadarEffect(false);
            setIsLoading(false);
            setScanComplete(false);
          }}
        />
      ) : result ? (
        <ScanResults result={result} onRescan={handleRescan} />
      ) : error ? (
        <div className="w-full max-w-2xl mx-auto">
          <div className="glass-card rounded-lg border border-destructive/30 p-6 text-center">
            <h3 className="font-semibold text-destructive mb-2">Scan Failed</h3>
            <p className="text-sm text-muted-foreground mb-4">{error}</p>
            <button
              onClick={() => {
                setError(null);
                setUrl("");
              }}
              className="text-sm text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors"
            >
              Try another URL
            </button>
          </div>
        </div>
      ) : (
        <ScanForm
          url={url}
          setUrl={setUrl}
          onSubmit={handleSubmit}
          isLoading={isLoading}
        />
      )}
    </main>
  );
}

export default function ScanPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen py-12 px-4">
        <div className="w-full max-w-2xl mx-auto text-center">
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </main>
    }>
      <ScanPageContent />
    </Suspense>
  );
}
