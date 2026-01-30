import type { ScanResult } from "@/app/actions";

function base64UrlEncode(str: string): string {
  if (typeof window !== "undefined" && window.btoa) {
    const base64 = window.btoa(str);
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  if (typeof Buffer !== "undefined") {
    return Buffer.from(str).toString("base64url");
  }
  throw new Error("No base64 encoding available");
}

export function compressReportForUrl(report: ScanResult): string {
  const summary = {
    u: report.url,
    o: report.originalUrl,
    s: report.score,
    g: report.grade,
    h: report.headers.map(h => [h.name, h.status]),
    sc: report.secrets.length,
    c: report.summary.critical,
    hg: report.summary.high,
    md: report.summary.medium,
    lw: report.summary.low,
    t: report.technologies.map(t => [t.name, t.confidence]),
    ts: [report.tlsCheck.httpRedirectsToHttps, report.tlsCheck.httpsReachable],
    ck: [report.cookieAnalysis.totalCookies, report.cookieAnalysis.cookiesWithIssues],
    mc: [report.mixedContentAnalysis.totalMixedContent, report.mixedContentAnalysis.summary.high],
  };
  
  const json = JSON.stringify(summary);
  const compressed = base64UrlEncode(json);
  return compressed;
}

export function generateMarkdownReport(report: ScanResult): string {
  let md = `# Sentinel Security Scan Report\n\n`;
  md += `## Summary\n\n`;
  md += `- **URL**: ${report.url}\n`;
  md += `- **Original URL**: ${report.originalUrl}\n`;
  md += `- **Grade**: ${report.grade} (${report.score}/100)\n`;
  md += `- **Duration**: ${(report.duration / 1000).toFixed(2)}s\n`;
  md += `- **Timestamp**: ${new Date(report.timestamp).toISOString()}\n\n`;

  md += `## Security Grade\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Grade | ${report.grade} |\n`;
  md += `| Score | ${report.score}/100 |\n`;
  md += `| Critical Issues | ${report.summary.critical} |\n`;
  md += `| High Issues | ${report.summary.high} |\n`;
  md += `| Medium Issues | ${report.summary.medium} |\n`;
  md += `| Low Issues | ${report.summary.low} |\n`;
  md += `| Passed Checks | ${report.summary.passed} |\n\n`;

  if (report.redirectChain.length > 0) {
    md += `## Redirect Chain\n\n`;
    md += `| Step | URL | Status |\n`;
    md += `|------|-----|--------|\n`;
    report.redirectChain.forEach((step, i) => {
      md += `| ${i + 1} | ${step.url} | ${step.statusCode} |\n`;
    });
    md += `\n`;
  }

  md += `## Security Headers\n\n`;
  md += `| Header | Status | Details |\n`;
  md += `|--------|--------|---------|\n`;
  for (const h of report.headers) {
    md += `| ${h.name} | ${h.status.toUpperCase()} | ${h.details || "OK"} |\n`;
  }
  md += `\n`;

  if (report.secrets.length > 0) {
    md += `## Detected Secrets\n\n`;
    md += `| Type | Severity | Confidence | Location |\n`;
    md += `|------|----------|------------|----------|\n`;
    for (const s of report.secrets) {
      md += `| ${s.type} | ${s.severity.toUpperCase()} | ${s.confidence.toUpperCase()} | ${s.location} |\n`;
    }
    md += `\n`;
  }

  if (report.technologies.length > 0) {
    md += `## Technology Stack\n\n`;
    md += `| Technology | Category | Confidence |\n`;
    md += `|------------|----------|------------|\n`;
    for (const t of report.technologies) {
      md += `| ${t.name} | ${t.category} | ${t.confidence.toUpperCase()} |\n`;
    }
    md += `\n`;
  }

  md += `## Cookie Security Analysis\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Total Cookies | ${report.cookieAnalysis.totalCookies} |\n`;
  md += `| Secure Cookies | ${report.cookieAnalysis.secureCookies} |\n`;
  md += `| HttpOnly Cookies | ${report.cookieAnalysis.httpOnlyCookies} |\n`;
  md += `| Cookies With Issues | ${report.cookieAnalysis.cookiesWithIssues} |\n`;
  md += `| Session Cookies | ${report.cookieAnalysis.sessionCookies} |\n`;
  md += `| Persistent Cookies | ${report.cookieAnalysis.persistentCookies} |\n\n`;

  if (report.cookieAnalysis.cookies.some((c) => c.issues.length > 0)) {
    md += `### Cookie Issues\n\n`;
    md += `| Cookie | Issue | Severity | Recommendation |\n`;
    md += `|--------|-------|----------|----------------|\n`;
    for (const cookie of report.cookieAnalysis.cookies) {
      for (const issue of cookie.issues) {
        md += `| ${cookie.name} | ${issue.type} | ${issue.severity.toUpperCase()} | ${issue.recommendation} |\n`;
      }
    }
    md += `\n`;
  }

  md += `## Mixed Content Analysis\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Total Mixed Content | ${report.mixedContentAnalysis.totalMixedContent} |\n`;
  md += `| Critical Issues | ${report.mixedContentAnalysis.summary.critical} |\n`;
  md += `| High Severity | ${report.mixedContentAnalysis.summary.high} |\n`;
  md += `| Medium Severity | ${report.mixedContentAnalysis.summary.medium} |\n`;
  md += `| Low Severity | ${report.mixedContentAnalysis.summary.low} |\n\n`;

  if (report.mixedContentAnalysis.mixedContent.length > 0) {
    md += `### Mixed Content Issues\n\n`;
    md += `| Type | URL | Severity | Location |\n`;
    md += `|------|-----|----------|----------|\n`;
    for (const item of report.mixedContentAnalysis.mixedContent) {
      md += `| ${item.type} | ${item.url.substring(0, 50)}... | ${item.severity.toUpperCase()} | Line ${item.sourceLine} |\n`;
    }
    md += `\n`;
  }

  md += `## JavaScript Security Analysis\n\n`;
  md += `| Metric | Value |\n`;
  md += `|--------|-------|\n`;
  md += `| Inline Scripts | ${report.jsAnalysis.inlineScriptCount} |\n`;
  md += `| eval() Usage | ${report.jsAnalysis.evalCount} |\n`;
  md += `| document.write() | ${report.jsAnalysis.documentWriteCount} |\n`;
  md += `| Inline Handlers | ${report.jsAnalysis.inlineHandlerCount} |\n`;
  md += `| Total Issues | ${report.jsAnalysis.issues.length} |\n\n`;

  if (report.jsAnalysis.issues.length > 0) {
    md += `### JavaScript Issues\n\n`;
    md += `| Type | Severity | Location | Recommendation |\n`;
    md += `|------|----------|----------|----------------|\n`;
    for (const issue of report.jsAnalysis.issues) {
      md += `| ${issue.type} | ${issue.severity.toUpperCase()} | Line ${issue.lineNumber} | ${issue.recommendation.substring(0, 50)}... |\n`;
    }
    md += `\n`;
  }

  md += `## TLS Check\n\n`;
  md += `- HTTP → HTTPS Redirect: ${report.tlsCheck.httpRedirectsToHttps ? "Yes" : "No"}\n`;
  md += `- HTTPS Reachable: ${report.tlsCheck.httpsReachable ? "Yes" : "No"}\n`;
  md += `- HTTPS Status: ${report.tlsCheck.httpsStatus}\n\n`;

  md += `## Scoring Summary\n\n`;
  md += `- Total Points Deducted: ${report.scoringDetails.reduce((sum, d) => sum + Math.abs(d.points), 0)}\n`;
  md += `- Issues Found: ${report.scoringDetails.length}\n\n`;

  md += `---\n`;
  md += `*Generated by Sentinel - Stateless Security Scanner*\n`;
  md += `*Scan URL: ${report.url}*\n`;
  md += `*Report Date: ${new Date(report.timestamp).toISOString()}*\n`;

  return md;
}

export function generateShareableLink(report: ScanResult): string {
  const compressed = compressReportForUrl(report);
  return `${typeof window !== "undefined" ? window.location.origin : ""}/scan?report=${compressed}`;
}
