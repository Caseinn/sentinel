"use server";

export interface ScanResult {
  url: string;
  originalUrl: string;
  timestamp: number;
  duration: number;
  score: number;
  grade: "A" | "B" | "C" | "D" | "F";
  redirectChain: RedirectStep[];
  headers: HeaderResult[];
  secrets: SecretResult[];
  technologies: TechnologyResult[];
  tlsCheck: TLSResult;
  cookieAnalysis: CookieAnalysis;
  mixedContentAnalysis: MixedContentAnalysis;
  jsAnalysis: JSAnalysis;
  sriAnalysis: SRIAnalysis;
  graphQLAnalysis: GraphQLAnalysis;
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
    passed: number;
    info: number;
  };
  scoringDetails: ScoringDetail[];
}

export interface RedirectStep {
  url: string;
  statusCode: number;
  location?: string;
}

export interface HeaderResult {
  name: string;
  status: "pass" | "warning" | "fail";
  severity: "high" | "medium" | "low";
  value?: string;
  description: string;
  details?: string;
  recommendation?: string;
  cspDetails?: CSPAnalysis;
  hstsDetails?: HSTSAnalysis;
}

export interface CSPAnalysis {
  hasDefaultSrc: boolean;
  hasUnsafeInline: boolean;
  hasUnsafeEval: boolean;
  hasObjectSrcNone: boolean;
  hasFrameAncestors: boolean;
  hasUnsafeScriptSrc: boolean;
  hasUnsafeStyleSrc: boolean;
  hasDataUriInImg: boolean;
  hasDataUriInFont: boolean;
  hasDataUriInMedia: boolean;
  hasWildcardConnect: boolean;
  scriptSrc: string;
  styleSrc: string;
  imgSrc: string;
  connectSrc: string;
  objectSrc: string;
  frameAncestors: string;
  formAction: string;
  baseUri: string;
  directives: string[];
}

export interface HSTSAnalysis {
  maxAge: number;
  includeSubDomains: boolean;
  preload: boolean;
  isValid: boolean;
}

export interface SecretResult {
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  location: string;
  redacted: string;
  description: string;
  confidence: "high" | "medium" | "low";
  evidence?: string;
  recommendation?: string;
}

export interface TechnologyResult {
  name: string;
  category: string;
  confidence: "high" | "medium" | "low";
  confidenceScore: number;
  evidence: string[];
  signals: TechnologySignal[];
}

export interface TechnologySignal {
  type: "header" | "html" | "script" | "cookie";
  value: string;
}

export interface CookieResult {
  name: string;
  value: string;
  domain: string;
  path: string;
  secure: boolean;
  httpOnly: boolean;
  sameSite: "strict" | "lax" | "none" | "unspecified" | null;
  maxAge: number | null;
  sessionCookie: boolean;
  issues: CookieIssue[];
}

export interface CookieIssue {
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  recommendation: string;
}

export interface CookieAnalysis {
  totalCookies: number;
  sessionCookies: number;
  persistentCookies: number;
  secureCookies: number;
  httpOnlyCookies: number;
  sameSiteCookies: number;
  cookiesWithIssues: number;
  cookies: CookieResult[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface MixedContent {
  type: "script" | "stylesheet" | "image" | "iframe" | "video" | "audio" | "object" | "embed" | "font" | "other";
  url: string;
  sourceLocation: string;
  sourceLine: number;
  severity: "critical" | "high" | "medium" | "low";
}

export interface MixedContentAnalysis {
  hasMixedContent: boolean;
  totalMixedContent: number;
  mixedContent: MixedContent[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface JSAnalysisIssue {
  type: string;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  location: string;
  lineNumber: number;
  recommendation: string;
}

export interface JSAnalysis {
  hasInlineScripts: boolean;
  inlineScriptCount: number;
  hasEval: boolean;
  evalCount: number;
  hasDocumentWrite: boolean;
  documentWriteCount: number;
  hasInlineHandlers: boolean;
  inlineHandlerCount: number;
  hasDangerousProtocols: boolean;
  dangerousProtocolCount: number;
  hasTargetBlank: boolean;
  targetBlankCount: number;
  missingNoopener: number;
  issues: JSAnalysisIssue[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface SRIAnalysis {
  externalScripts: number;
  scriptsWithSRI: number;
  externalStylesheets: number;
  stylesheetsWithSRI: number;
  scriptsWithoutSRI: string[];
  stylesheetsWithoutSRI: string[];
  summary: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
}

export interface GraphQLAnalysis {
  endpoint?: string;
  introspectionEnabled: boolean;
  graphiqlAvailable: boolean;
  schemaAccessible: boolean;
  severity: "high" | "medium" | "low" | null;
}

export interface TLSResult {
  httpRedirectsToHttps: boolean;
  httpsStatus: number;
  httpsReachable: boolean;
  certificateInfo?: {
    issuer?: string;
    subject?: string;
    validFrom?: string;
    validTo?: string;
  };
}

export interface ScoringDetail {
  category: "header" | "secret" | "tls" | "redirect" | "cookie" | "content";
  item: string;
  points: number;
  reason: string;
  recommendation: string;
}

const BODY_SIZE_LIMIT = 2 * 1024 * 1024;
const FETCH_TIMEOUT_MS = 10000;
const MAX_REDIRECT_CHAIN = 50;
const MIN_SCORE = 0;
const MAX_SCORE = 100;
const CONFIDENCE_HIGH_THRESHOLD = 50;
const CONFIDENCE_MEDIUM_THRESHOLD = 25;
const REDACTION_SHOW_CHARS = 8;
const REDACTION_HIDE_CHARS = 4;
const MIN_SECRET_LENGTH = 20;

const SCORING = {
  HEADER_FAIL_HIGH: -20,
  HEADER_FAIL_MEDIUM: -10,
  HEADER_FAIL_LOW: -5,
  HEADER_WARN_HIGH: -10,
  HEADER_WARN_MEDIUM: -5,
  HEADER_WARN_LOW: -2,
  SECRET_CRITICAL: -40,
  SECRET_HIGH_HIGH_CONFIDENCE: -25,
  SECRET_HIGH_LOW_CONFIDENCE: -15,
  SECRET_MEDIUM_HIGH_CONFIDENCE: -15,
  SECRET_MEDIUM_LOW_CONFIDENCE: -10,
  SECRET_LOW: -5,
  TLS_NO_HTTPS_REDIRECT: -5,
  COOKIE_CRITICAL: -10,
  COOKIE_HIGH: -5,
  COOKIE_MEDIUM: -3,
  COOKIE_LOW: -1,
  MIXED_CRITICAL: -15,
  MIXED_HIGH: -10,
  MIXED_MEDIUM: -5,
  MIXED_LOW: -2,
  JS_HIGH: -5,
  JS_MEDIUM: -3,
  JS_LOW: -1,
  SRI_SCRIPT: -5,
  SRI_STYLESHEET: -2,
  GRAPHQL_HIGH: -15,
  GRAPHQL_MEDIUM: -10,
  GRAPHQL_LOW: -5,
} as const;

const WEIGHTED_SCORING = {
  baseScore: 50,
  weights: {
    securityHeaders: 0.20,
    secretDetection: 0.25,
    transportSecurity: 0.15,
    contentSecurity: 0.15,
    cookieSecurity: 0.10,
    thirdPartyRisks: 0.15,
  },
  bonuses: {
    strongCSP: 15,
    hstsPreload: 10,
    noSecrets: 10,
    sriAllScripts: 5,
    sriAllStylesheets: 3,
  },
} as const;

const GRADE_THRESHOLDS = {
  A: 90,
  B: 80,
  C: 70,
  D: 60,
} as const;

const HSTS_RECOMMENDED_MAX_AGE = 15552000;
const HSTS_MIN_RECOMMENDED_MAX_AGE = 2592000;

const SECURITY_HEADERS = [
  {
    name: "Content-Security-Policy",
    description: "Prevents XSS by controlling resource loading",
    severity: "high" as const,
    recommendation: "Add CSP header with default-src 'self' and specific directives for your resources.",
  },
  {
    name: "Strict-Transport-Security",
    description: "Enforces HTTPS connections",
    severity: "high" as const,
    recommendation: "Add HSTS header with max-age=15552000 (180 days) and includeSubDomains.",
  },
  {
    name: "X-Frame-Options",
    description: "Prevents clickjacking attacks",
    severity: "medium" as const,
    recommendation: "Add X-Frame-Options: DENY or SAMEORIGIN. Consider using CSP frame-ancestors instead.",
  },
  {
    name: "X-Content-Type-Options",
    description: "Prevents MIME type sniffing",
    severity: "medium" as const,
    recommendation: "Add X-Content-Type-Options: nosniff header.",
  },
  {
    name: "Referrer-Policy",
    description: "Controls referrer information leakage",
    severity: "low" as const,
    recommendation: "Add Referrer-Policy: strict-origin-when-cross-origin.",
  },
  {
    name: "Permissions-Policy",
    description: "Controls browser feature access",
    severity: "low" as const,
    recommendation: "Add Permissions-Policy header to disable unneeded browser features.",
  },
  {
    name: "Cross-Origin-Opener-Policy",
    description: "Prevents Spectre-style cross-origin attacks",
    severity: "high" as const,
    recommendation: "Add Cross-Origin-Opener-Policy: same-origin to prevent cross-origin attacks.",
  },
  {
    name: "Cross-Origin-Resource-Policy",
    description: "Prevents cross-origin resource loading attacks",
    severity: "medium" as const,
    recommendation: "Add Cross-Origin-Resource-Policy: same-origin to restrict cross-origin reads.",
  },
  {
    name: "Cross-Origin-Embedder-Policy",
    description: "Requires cross-origin resources to opt-in",
    severity: "medium" as const,
    recommendation: "Add Cross-Origin-Embedder-Policy: require-corp for full isolation.",
  },
  {
    name: "Cache-Control",
    description: "Controls caching of sensitive content",
    severity: "low" as const,
    recommendation: "Set appropriate Cache-Control headers for sensitive pages (no-store, private).",
  },
  {
    name: "Clear-Site-Data",
    description: "Clears browsing data on logout",
    severity: "low" as const,
    recommendation: "Add Clear-Site-Data header to clear cookies and cache on logout.",
  },
  {
    name: "X-XSS-Protection",
    description: "Legacy XSS filter (useful for older browsers)",
    severity: "low" as const,
    recommendation: "Add X-XSS-Protection: 1; mode=block for legacy browser protection.",
  },
];

const SECRET_PATTERNS: Array<{
  type: string;
  pattern: RegExp;
  severity: "critical" | "high" | "medium" | "low";
  description: string;
  recommendation: string;
  validate?: (match: string) => boolean;
  keywords?: string[];
}> = [
  {
    type: "Stripe Live Key",
    pattern: /sk_live_[0-9a-zA-Z]{24,}/gi,
    severity: "critical" as const,
    description: "Live Stripe secret key exposed",
    recommendation: "Rotate this key immediately. Use environment variables and server-side only.",
    validate: (match: string) => match.length >= 32 && /^sk_live_[0-9a-zA-Z]{24,}$/.test(match),
  },
  {
    type: "Stripe Test Key",
    pattern: /sk_test_[0-9a-zA-Z]{24,}/gi,
    severity: "high" as const,
    description: "Test Stripe secret key exposed",
    recommendation: "Remove test keys from production code. Use environment variables.",
    validate: (match: string) => match.length >= 32 && /^sk_test_[0-9a-zA-Z]{24,}$/.test(match),
  },
  {
    type: "AWS Access Key ID",
    pattern: /\b(AKIA|ASIA)[0-9A-Z]{16}\b/g,
    severity: "critical" as const,
    description: "AWS access key ID exposed",
    recommendation: "Rotate this key in AWS IAM. Use IAM roles instead of access keys where possible.",
  },
  {
    type: "Google API Key",
    pattern: /\bAIza[0-9A-Za-z\-_]{35}\b/g,
    severity: "high" as const,
    description: "Google API key exposed",
    recommendation: "Restrict this key to your domain in Google Cloud Console. Use key restrictions.",
    validate: (match: string) => /^AIza[0-9A-Za-z\-_]{35}$/.test(match),
  },
  {
    type: "GitHub Personal Access Token",
    pattern: /\b(ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36,}\b/g,
    severity: "critical" as const,
    description: "GitHub PAT exposed",
    recommendation: "Revoke this token immediately in GitHub Settings > Developer settings > Personal access tokens.",
  },
  {
    type: "GitHub OAuth Token",
    pattern: /\b(gho_[A-Za-z0-9_]{36,})\b/g,
    severity: "critical" as const,
    description: "GitHub OAuth token exposed",
    recommendation: "Revoke this token immediately. Use GitHub Apps or fine-grained PATs instead.",
  },
  {
    type: "Slack Webhook URL",
    pattern: /https:\/\/hooks\.slack\.com\/services\/T[0-9A-Z]+\/B[0-9A-Z]+\/[0-9A-Za-z]+/gi,
    severity: "high" as const,
    description: "Slack webhook URL exposed",
    recommendation: "Regenerate this webhook URL in Slack App settings.",
  },
  {
    type: "OpenAI API Key",
    pattern: /\bsk-[a-zA-Z0-9]{48,}\b/g,
    severity: "critical" as const,
    description: "OpenAI API key exposed",
    recommendation: "Rotate this key in OpenAI platform settings. Use organization-level API keys carefully.",
    validate: (match: string) => match.length >= 48 && /^sk-[a-zA-Z0-9]{48,}$/.test(match),
  },
  {
    type: "Private Key (RSA/EC/DSA/OPENSSH/PGP)",
    pattern: /-----BEGIN (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |DSA |OPENSSH |PGP )?PRIVATE KEY-----/g,
    severity: "critical" as const,
    description: "Private key certificate exposed",
    recommendation: "Remove this private key from code immediately. Use secrets management (Vault, AWS Secrets Manager, etc.).",
  },
  {
    type: "Database Connection String",
    pattern: /\b(mongodb(\+srv)?|postgresql|mysql|mssql|redis):\/\/[^\s"'<>]+/gi,
    severity: "critical" as const,
    description: "Database connection string exposed",
    recommendation: "Use environment variables or secrets manager for database credentials. Never commit to code.",
    validate: (match: string) => {
      const schemes = ["mongodb://", "mongodb+srv://", "postgresql://", "mysql://", "mssql://", "redis://"];
      return schemes.some(s => match.toLowerCase().startsWith(s)) && match.includes("@");
    },
  },
  {
    type: "JWT Token",
    pattern: /\beyJ[A-Za-z0-9-_]+\.eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*\b/g,
    severity: "medium" as const,
    description: "JWT token possibly exposed",
    recommendation: "Ensure JWTs are not exposed in client-side code. Use httpOnly cookies for sensitive tokens.",
    validate: (match: string) => {
      const parts = match.split(".");
      if (parts.length !== 3) return false;
      try {
        const header = JSON.parse(Buffer.from(parts[0], "base64url").toString());
        return header.alg && header.typ;
      } catch {
        return false;
      }
    },
  },
  {
    type: "SendGrid API Key",
    pattern: /\bSG\.[A-Za-z0-9-_]{22}\.[A-Za-z0-9-_]{43}\b/g,
    severity: "high" as const,
    description: "SendGrid API key exposed",
    recommendation: "Rotate this key in SendGrid dashboard. Use environment variables.",
  },
  {
    type: "Twilio API Key",
    pattern: /\bSK[0-9a-f]{32}\b/g,
    severity: "high" as const,
    description: "Twilio API key exposed",
    recommendation: "Rotate this key in Twilio Console. Use API keys with least privilege.",
  },
  {
    type: "Discord Webhook URL",
    pattern: /https:\/\/discord(?:app)?\.com\/api\/webhooks\/[0-9]+\/[a-zA-Z0-9_-]+/gi,
    severity: "high" as const,
    description: "Discord webhook URL exposed",
    recommendation: "Regenerate this webhook in Discord server settings. Never commit webhooks to code.",
  },
  {
    type: "NPM Token",
    pattern: /\bnpm_[A-Za-z0-9]{36}\b/g,
    severity: "critical" as const,
    description: "NPM access token exposed",
    recommendation: "Revoke this token in NPM settings. Use .npmrc with appropriate permissions.",
  },
  {
    type: "Mailgun API Key",
    pattern: /key-[0-9a-zA-Z]{32}/g,
    severity: "high" as const,
    description: "Mailgun API key exposed",
    recommendation: "Rotate this key in Mailgun dashboard. Use environment variables.",
  },
  {
    type: "Mailchimp API Key",
    pattern: /[0-9a-f]{32}-us[0-9]{1,2}/g,
    severity: "high" as const,
    description: "Mailchimp API key exposed",
    recommendation: "Rotate this key in Mailchimp account settings. Use API keys with limited permissions.",
  },
  {
    type: "Square Access Token",
    pattern: /\bsq0atp-[0-9A-Za-z\-_]{22,}\b/g,
    severity: "critical" as const,
    description: "Square access token exposed",
    recommendation: "Rotate this token in Square Developer Dashboard. Use OAuth instead.",
  },
  {
    type: "Shopify Access Token",
    pattern: /shpat_[a-fA-F0-9]{32}/g,
    severity: "critical" as const,
    description: "Shopify access token exposed",
    recommendation: "Rotate this token in Shopify Admin API settings.",
  },
  {
    type: "Resend API Key",
    pattern: /re_[A-Za-z0-9]{24,}/g,
    severity: "high" as const,
    description: "Resend API key exposed",
    recommendation: "Rotate this key in Resend dashboard. Use environment variables.",
  },
  {
    type: "Supabase API Key",
    pattern: /\b(eyJhbGci|eyJhbGc)[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\b/g,
    severity: "high" as const,
    description: "Supabase API key exposed",
    recommendation: "Rotate this key in Supabase dashboard. Use row-level security instead.",
  },
  {
    type: "PlanetScale Database URL",
    pattern: /mysql:\/\/[^\s"'<>]+@[^"'<>]+\.mysql\.database\.azure\.com/gi,
    severity: "critical" as const,
    description: "PlanetScale database connection exposed",
    recommendation: "Rotate credentials and use environment variables.",
  },
  {
    type: "Neon Database URL",
    pattern: /postgres:\/\/[^\s"'<>]+@[^"'<>]+\.neon\.tech\//gi,
    severity: "critical" as const,
    description: "Neon database connection exposed",
    recommendation: "Rotate credentials and use environment variables.",
  },
  {
    type: "Railway Database URL",
    pattern: /postgres:\/\/[^\s"'<>]+@[^"'<>]+\.railway\.internal/gi,
    severity: "critical" as const,
    description: "Railway database connection exposed",
    recommendation: "Rotate credentials and use environment variables.",
  },
];

const TECH_SIGNATURES: Array<{
  name: string;
  category: string;
  headers?: string[];
  html?: string[];
  scripts?: string[];
  cookies?: string[];
}> = [
  {
    name: "Next.js",
    category: "Frontend Framework",
    html: ["id=\"__next\"", "__NEXT_DATA__"],
    scripts: ["/_next/static/"],
    cookies: ["__nextauth"],
  },
  {
    name: "React",
    category: "Frontend Framework",
    html: ["data-reactroot", "data-reactid"],
    scripts: ["react-dom.", "/node_modules/react-dom"],
    cookies: [],
  },
  {
    name: "Vue.js",
    category: "Frontend Framework",
    html: [],
    scripts: ["vue.js", "vue.min.js", "/dist/vue."],
    cookies: [],
  },
  {
    name: "Nuxt.js",
    category: "Frontend Framework",
    html: ["data-n-head=", "__nuxt"],
    scripts: ["/_nuxt/"],
    cookies: [],
  },
  {
    name: "Svelte",
    category: "Frontend Framework",
    html: ["data-svelte", "svelte-"],
    scripts: ["svelte/", "svelte.js"],
    cookies: [],
  },
  {
    name: "Remix",
    category: "Frontend Framework",
    html: ["__remix", "_data"],
    scripts: ["/build/"],
    cookies: [],
  },
  {
    name: "Astro",
    category: "Frontend Framework",
    html: ["data-astro", "astro-"],
    scripts: ["astro.", "/@astro"],
    cookies: [],
  },
  {
    name: "Preact",
    category: "Frontend Framework",
    html: ["preact-"],
    scripts: ["preact.js", "preact.min.js", "/bundles/preact"],
    cookies: [],
  },
  {
    name: "SolidJS",
    category: "Frontend Framework",
    html: [],
    scripts: ["solid-js", "solid-js/web"],
    cookies: [],
  },
  {
    name: "Qwik",
    category: "Frontend Framework",
    html: ["q:container", "q:slot", "q:target"],
    scripts: ["qwik.", "/qwik/"],
    cookies: [],
  },
  {
    name: "Express",
    category: "Backend Framework",
    headers: ["x-powered-by: express"],
    scripts: [],
    cookies: ["connect.sid"],
  },
  {
    name: "Django",
    category: "Backend Framework",
    headers: ["x-framework: django"],
    html: ["csrfmiddlewaretoken"],
    scripts: [],
    cookies: ["csrftoken", "sessionid"],
  },
  {
    name: "Ruby on Rails",
    category: "Backend Framework",
    headers: ["x-runtime:", "x-request-id:"],
    html: ["authenticity_token"],
    scripts: [],
    cookies: ["_session_id", "rack.session"],
  },
  {
    name: "Laravel",
    category: "Backend Framework",
    html: ["XSRF-TOKEN", "laravel_session"],
    scripts: [],
    cookies: ["laravel_session", "XSRF-TOKEN"],
  },
  {
    name: "Spring Boot",
    category: "Backend Framework",
    headers: ["x-application-context"],
    scripts: [],
    cookies: ["JSESSIONID"],
  },
  {
    name: "ASP.NET Core",
    category: "Backend Framework",
    headers: ["server: kestrel", "x-aspnet-version"],
    scripts: [],
    cookies: [".AspNetCore"],
  },
  {
    name: "NestJS",
    category: "Backend Framework",
    headers: ["x-powered-by"],
    scripts: [],
    cookies: [],
  },
  {
    name: "Fastify",
    category: "Backend Framework",
    headers: ["x-powered-by: fastify"],
    scripts: [],
    cookies: [],
  },
  {
    name: "Phoenix",
    category: "Backend Framework",
    scripts: [],
    cookies: ["_phoenix"],
  },
  {
    name: "Gin",
    category: "Backend Framework",
    headers: ["server: gin"],
    scripts: [],
    cookies: [],
  },
  {
    name: "Echo",
    category: "Backend Framework",
    headers: ["server: echo"],
    scripts: [],
    cookies: [],
  },
  {
    name: "Fiber",
    category: "Backend Framework",
    headers: ["server: fasthttp"],
    scripts: [],
    cookies: [],
  },
  {
    name: "Nginx",
    category: "Server",
    headers: ["server: nginx"],
    scripts: [],
    cookies: [],
  },
  {
    name: "Apache",
    category: "Server",
    headers: ["server: apache"],
    scripts: [],
    cookies: [],
  },
  {
    name: "IIS",
    category: "Server",
    headers: ["server: microsoft-iis"],
    scripts: [],
    cookies: [],
  },
  {
    name: "Caddy",
    category: "Server",
    headers: ["server: caddy"],
    scripts: [],
    cookies: [],
  },
  {
    name: "LiteSpeed",
    category: "Server",
    headers: ["server: litespeed"],
    scripts: [],
    cookies: [],
  },
  {
    name: "Cloudflare",
    category: "CDN",
    headers: ["server: cloudflare", "cf-ray"],
    scripts: [],
    cookies: ["__cf"],
  },
  {
    name: "Fastly",
    category: "CDN",
    headers: ["x-fastly-request-id"],
    scripts: [],
    cookies: ["__fastly"],
  },
  {
    name: "Akamai",
    category: "CDN",
    headers: ["x-akamai-transformed", "x-akamai-request-id"],
    scripts: [],
    cookies: [],
  },
  {
    name: "Vercel",
    category: "Hosting",
    headers: ["server: vercel", "x-vercel-id"],
    scripts: [],
    cookies: ["__vc"],
  },
  {
    name: "Netlify",
    category: "Hosting",
    headers: ["x-nf-request-id"],
    scripts: [],
    cookies: ["nf_*"],
  },
  {
    name: "Supabase",
    category: "Backend-as-a-Service",
    headers: ["x-supabase-request-id"],
    scripts: ["supabase.com"],
    cookies: ["supabase"],
  },
  {
    name: "Firebase",
    category: "Backend-as-a-Service",
    scripts: ["firebaseio.com", "firebaseapp.com"],
    cookies: ["firebase"],
  },
  {
    name: "AWS Lambda",
    category: "Serverless",
    headers: ["x-amz-request-id", "x-amz-id-2"],
    scripts: [],
    cookies: [],
  },
  {
    name: "WordPress",
    category: "CMS",
    scripts: ["/wp-includes/", "/wp-content/"],
    cookies: ["wordpress", "wp-settings"],
  },
  {
    name: "Drupal",
    category: "CMS",
    html: ["Drupal.settings"],
    scripts: ["drupal.js", "drupal.min.js"],
    cookies: ["SESS", "SSESS"],
  },
  {
    name: "jQuery",
    category: "JavaScript Library",
    scripts: ["jquery-", "jquery.js", "jquery.min.js"],
    cookies: [],
  },
  {
    name: "Lodash",
    category: "JavaScript Library",
    scripts: ["lodash.js", "lodash.min.js", "/lodash/"],
    cookies: [],
  },
  {
    name: "Moment.js",
    category: "JavaScript Library",
    scripts: ["moment.js", "moment.min.js"],
    cookies: [],
  },
  {
    name: "Day.js",
    category: "JavaScript Library",
    scripts: ["dayjs", "day.min.js"],
    cookies: [],
  },
  {
    name: "Axios",
    category: "JavaScript Library",
    scripts: ["axios", "axios/dist/"],
    cookies: [],
  },
  {
    name: "Zod",
    category: "JavaScript Library",
    scripts: ["zod", "zod/lib/"],
    cookies: [],
  },
  {
    name: "Tailwind CSS",
    category: "CSS Framework",
    html: ["class=\"tw-"],
    scripts: ["tailwindcss", "tailwind.js"],
    cookies: [],
  },
  {
    name: "Bootstrap",
    category: "CSS Framework",
    scripts: ["bootstrap.js", "bootstrap.min.js", "bootstrap.bundle"],
    cookies: [],
  },
  {
    name: "Material-UI",
    category: "UI Framework",
    html: ["MuiBox", "MuiButton", "MuiPaper"],
    scripts: ["@mui/material", "@mui/icons"],
    cookies: [],
  },
  {
    name: "Chakra UI",
    category: "UI Framework",
    html: ["chakra-ui"],
    scripts: ["@chakra-ui"],
    cookies: [],
  },
  {
    name: "Ant Design",
    category: "UI Framework",
    html: ["ant-btn", "ant-table", "ant-layout"],
    scripts: ["antd", "ant-design"],
    cookies: [],
  },
  {
    name: "Webpack",
    category: "Build Tool",
    scripts: ["webpack", "webpack-", "/webpack/"],
    cookies: [],
  },
  {
    name: "Vite",
    category: "Build Tool",
    scripts: ["/@vite/client", "vite"],
    cookies: [],
  },
  {
    name: "Babel",
    category: "Build Tool",
    scripts: ["babel", "babel-standalone", "@babel"],
    cookies: [],
  },
  {
    name: "Google Analytics",
    category: "Analytics",
    scripts: ["google-analytics.com/analytics.js", "googletagmanager.com/gtag"],
    cookies: ["_ga", "_gid", "_gat"],
  },
  {
    name: "Google Tag Manager",
    category: "Analytics",
    scripts: ["googletagmanager.com/gtag"],
    cookies: [],
  },
  {
    name: "Hotjar",
    category: "Analytics",
    scripts: ["static.hotjar.com"],
    cookies: ["_hj"],
  },
  {
    name: "Mixpanel",
    category: "Analytics",
    scripts: ["mixpanel.com", "mxpnl"],
    cookies: ["mp_*"],
  },
  {
    name: "Segment",
    category: "Analytics",
    scripts: ["segment.io", "segment.com"],
    cookies: [],
  },
  {
    name: "Sentry",
    category: "Error Tracking",
    scripts: ["sentry.io", "sentryjs", "/sentry/"],
    cookies: [],
  },
  {
    name: "Datadog",
    category: "Monitoring",
    scripts: ["datadog.com", "dd-trace"],
    cookies: [],
  },
  {
    name: "New Relic",
    category: "Monitoring",
    headers: ["x-newrelic-request-id"],
    scripts: ["newrelic.com"],
    cookies: ["nr-"],
  },
  {
    name: "Stripe",
    category: "Payments",
    scripts: ["js.stripe.com", "stripe.com"],
    cookies: ["__stripe"],
  },
  {
    name: "PayPal",
    category: "Payments",
    scripts: ["paypal.com", "paypalobjects.com"],
    cookies: ["paypal"],
  },
  {
    name: "Intercom",
    category: "Customer Support",
    scripts: ["widget.intercom.io", "intercom.io"],
    cookies: ["intercom"],
  },
  {
    name: "HubSpot",
    category: "Marketing",
    scripts: ["hubspot.com", "hs-scripts.com"],
    cookies: ["hubspot", "__h"],
  },
  {
    name: "Mailchimp",
    category: "Marketing",
    scripts: ["mailchimp.com", "chimpstatic"],
    cookies: ["mailchimp"],
  },
  {
    name: "Algolia",
    category: "Search",
    scripts: ["algolia.com", "algoliasearch"],
    cookies: [],
  },
  {
    name: "Redis",
    category: "Database",
    cookies: ["connect-redis"],
  },
  {
    name: "MongoDB",
    category: "Database",
    cookies: ["connect-mongo"],
  },
  {
    name: "Prisma",
    category: "ORM",
    scripts: ["prisma", "prismaclient"],
    cookies: [],
  },
  {
    name: "GraphQL",
    category: "GraphQL",
    scripts: ["graphql", "graphiql"],
    cookies: [],
  },
  {
    name: "Apollo Client",
    category: "GraphQL",
    scripts: ["apollo-client", "@apollo/client"],
    cookies: [],
  },
  {
    name: "Redux",
    category: "State Management",
    scripts: ["redux", "redux.js", "redux.min.js"],
    cookies: [],
  },
  {
    name: "Recoil",
    category: "State Management",
    scripts: ["recoil"],
    cookies: [],
  },
  {
    name: "Zustand",
    category: "State Management",
    scripts: ["zustand"],
    cookies: [],
  },
  {
    name: "Squarespace",
    category: "Website Builder",
    scripts: ["squarespace.com"],
    cookies: [],
  },
  {
    name: "Wix",
    category: "Website Builder",
    scripts: ["wix.com", "wixstatic.com"],
    cookies: ["wix"],
  },
  {
    name: "Shopify",
    category: "E-commerce",
    scripts: ["cdn.shopify.com", "shopify.com"],
    cookies: ["shopify", "_shopify"],
  },
  {
    name: "WooCommerce",
    category: "E-commerce",
    scripts: ["woocommerce"],
    cookies: ["woocommerce"],
  },
  {
    name: "Typeform",
    category: "Forms",
    scripts: ["typeform.com", "embed.typeform"],
    cookies: [],
  },
  {
    name: "Calendly",
    category: "Scheduling",
    scripts: ["calendly.com", "assets.calendly.com"],
    cookies: [],
  },
  {
    name: "Swagger UI",
    category: "Documentation",
    html: ["swagger-ui", "swagger-ui-container"],
    scripts: ["swagger-ui", "swagger-ui-bundle"],
    cookies: [],
  },
  {
    name: "Redoc",
    category: "Documentation",
    html: ["redoc", "api-description"],
    scripts: ["redoc", "redoc.bundle"],
    cookies: [],
  },
  {
    name: "SendGrid",
    category: "Email",
    scripts: ["sendgrid.com", "sg.sendgrid"],
    cookies: [],
  },
  {
    name: "Mailgun",
    category: "Email",
    scripts: ["mailgun.com", "mailgun.js"],
    cookies: [],
  },
  {
    name: "Postmark",
    category: "Email",
    scripts: ["postmarkapp.com"],
    cookies: [],
  },
];

const PRIVATE_IP_RANGES = [
  { range: "0.0.0.0/8", description: "Broadcast" },
  { range: "10.0.0.0/8", description: "Private Network" },
  { range: "100.64.0.0/10", description: "Shared Address Space" },
  { range: "127.0.0.0/8", description: "Loopback" },
  { range: "169.254.0.0/16", description: "Link-Local" },
  { range: "172.16.0.0/12", description: "Private Network" },
  { range: "192.0.2.0/24", description: "Documentation" },
  { range: "192.168.0.0/16", description: "Private Network" },
  { range: "198.51.100.0/24", description: "Documentation" },
  { range: "203.0.113.0/24", description: "Documentation" },
  { range: "224.0.0.0/4", description: "Multicast" },
  { range: "240.0.0.0/4", description: "Reserved" },
  { range: "::1/128", description: "Loopback IPv6" },
  { range: "fe80::/10", description: "Link-Local IPv6" },
  { range: "fc00::/7", description: "Unique Local IPv6" },
];

function ipToLong(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function parseCIDR(cidr: string): { start: number; end: number } | null {
  const parts = cidr.split("/");
  if (parts.length !== 2) return null;
  
  const ipParts = parts[0].split(".");
  if (ipParts.length !== 4) return null;
  
  const start = ipToLong(parts[0]);
  const mask = parseInt(parts[1], 10);
  
  if (mask < 0 || mask > 32) return null;
  if (mask === 0) {
    return { start: 0, end: 0xFFFFFFFF };
  }
  
  const end = start | ((1 << (32 - mask)) - 1);
  
  return { start, end };
}

function isPrivateIPAddress(ip: string): boolean {
  const ipLong = ipToLong(ip);
  
  for (const cidr of PRIVATE_IP_RANGES) {
    if (cidr.range.includes("/")) {
      const parsed = parseCIDR(cidr.range);
      if (parsed && ipLong >= parsed.start && ipLong <= parsed.end) {
        return true;
      }
    }
  }
  return false;
}

function validateURL(url: string): { valid: boolean; error?: string; normalizedUrl?: string } {
  try {
    let normalized = url.trim();
    if (!normalized.match(/^https?:\/\//i)) {
      normalized = "https://" + normalized;
    }
    
    const parsed = new URL(normalized);
    
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return { valid: false, error: `Protocol '${parsed.protocol}' is not allowed. Only HTTP and HTTPS are permitted.` };
    }

    const blockedSchemes = ["file:", "ftp:", "gopher:", "data:", "mailto:", "tel:", "ssh:", "git:"];
    if (blockedSchemes.includes(parsed.protocol)) {
      return { valid: false, error: `URL scheme '${parsed.protocol}' is not allowed.` };
    }

    const hostname = parsed.hostname;

    if (!hostname || hostname.length === 0) {
      return { valid: false, error: "Invalid hostname" };
    }

    if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
      return { valid: false, error: "Localhost addresses are not allowed." };
    }

    if (/^0x7f000001$/i.test(hostname)) {
      return { valid: false, error: "Localhost addresses are not allowed." };
    }

    if (hostname.includes(":")) {
      return { valid: false, error: "IPv6 addresses are not allowed." };
    }

    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) {
      if (isPrivateIPAddress(hostname)) {
        return { valid: false, error: "Private IP addresses are not allowed." };
      }
    }

    const encodedIPPatterns = [
      /^0x[\da-fA-F]{1,8}$/i,
      /^0o[0-7]{1,11}$/,
      /^\d{1,10}$/,
    ];
    
    for (const pattern of encodedIPPatterns) {
      if (pattern.test(hostname)) {
        return { valid: false, error: "Encoded IP addresses are not allowed." };
      }
    }

    return { valid: true, normalizedUrl: normalized };
  } catch {
    return { valid: false, error: "Invalid URL format" };
  }
}

function calculateGrade(score: number): "A" | "B" | "C" | "D" | "F" {
  if (score >= 90) return "A";
  if (score >= 80) return "B";
  if (score >= 70) return "C";
  if (score >= 60) return "D";
  return "F";
}

function analyzeCSP(cspValue: string): CSPAnalysis {
  const directives = cspValue
    .toLowerCase()
    .split(";")
    .map(s => s.trim())
    .filter(Boolean);
  
  const getDirectiveValue = (name: string): string => {
    const found = directives.find(d => d.startsWith(name));
    return found ? found.split(" ").slice(1).join(" ") : "not set";
  };

  const hasDefaultSrc = directives.some(d => d.startsWith("default-src"));
  const hasUnsafeInline = directives.some(d => d.includes("unsafe-inline"));
  const hasUnsafeEval = directives.some(d => d.includes("unsafe-eval"));
  const hasObjectSrcNone = directives.some(d => d.startsWith("object-src") && (d.includes("'none'") || d === "object-src"));
  const hasFrameAncestors = directives.some(d => d.startsWith("frame-ancestors"));
  
  const scriptSrc = getDirectiveValue("script-src");
  const styleSrc = getDirectiveValue("style-src");
  const imgSrc = getDirectiveValue("img-src");
  const connectSrc = getDirectiveValue("connect-src");
  const fontSrc = getDirectiveValue("font-src");
  const mediaSrc = getDirectiveValue("media-src");
  const objectSrc = getDirectiveValue("object-src");
  const frameAncestors = getDirectiveValue("frame-ancestors");
  const formAction = getDirectiveValue("form-action");
  const baseUri = getDirectiveValue("base-uri");

  const hasUnsafeScriptSrc = scriptSrc !== "not set" && (
    scriptSrc.includes("unsafe-inline") || 
    scriptSrc.includes("unsafe-eval") ||
    scriptSrc.includes("*") ||
    scriptSrc.includes("https:") ||
    scriptSrc.includes("http:")
  );

  const hasUnsafeStyleSrc = styleSrc !== "not set" && (
    styleSrc.includes("unsafe-inline") ||
    styleSrc.includes("*")
  );

  const hasDataUriInImg = imgSrc !== "not set" && imgSrc.includes("data:");
  const hasDataUriInFont = fontSrc !== "not set" && fontSrc.includes("data:");
  const hasDataUriInMedia = mediaSrc !== "not set" && mediaSrc.includes("data:");

  const hasWildcardConnect = connectSrc !== "not set" && (connectSrc.includes("*") || connectSrc.includes("https:") || connectSrc.includes("http:"));

  return {
    hasDefaultSrc,
    hasUnsafeInline,
    hasUnsafeEval,
    hasObjectSrcNone,
    hasFrameAncestors,
    hasUnsafeScriptSrc,
    hasUnsafeStyleSrc,
    hasDataUriInImg,
    hasDataUriInFont,
    hasDataUriInMedia,
    hasWildcardConnect,
    scriptSrc,
    styleSrc,
    imgSrc,
    connectSrc,
    objectSrc,
    frameAncestors,
    formAction,
    baseUri,
    directives,
  };
}

function parseCookies(setCookieHeader: string): CookieResult[] {
  const cookies: CookieResult[] = [];
  const cookieStrings = setCookieHeader.split(/,(?=[^;]+?=)/);

  for (const cookieString of cookieStrings) {
    const trimmed = cookieString.trim();
    if (!trimmed) continue;

    const parts = trimmed.split(";");
    const firstEquals = parts[0].indexOf("=");
    if (firstEquals === -1) continue;

    const name = parts[0].substring(0, firstEquals).trim();
    const value = parts[0].substring(firstEquals + 1).trim();

    let domain = "";
    let path = "/";
    let secure = false;
    let httpOnly = false;
    let sameSite: "strict" | "lax" | "none" | "unspecified" | null = "unspecified";
    let maxAge: number | null = null;

    for (let i = 1; i < parts.length; i++) {
      const part = parts[i].trim().toLowerCase();
      const equalsIndex = part.indexOf("=");
      const key = equalsIndex > -1 ? part.substring(0, equalsIndex).trim() : part;
      const val = equalsIndex > -1 ? part.substring(equalsIndex + 1).trim() : "";

      switch (key) {
        case "domain":
          domain = val;
          break;
        case "path":
          path = val || "/";
          break;
        case "secure":
          secure = true;
          break;
        case "httponly":
          httpOnly = true;
          break;
        case "samesite":
          sameSite = val as "strict" | "lax" | "none" | "unspecified";
          break;
        case "max-age":
          maxAge = parseInt(val, 10) || null;
          break;
        case "expires":
          if (!maxAge) {
            const expiresDate = new Date(val);
            if (!isNaN(expiresDate.getTime())) {
              maxAge = Math.floor((expiresDate.getTime() - Date.now()) / 1000);
            }
          }
          break;
      }
    }

    const issues: CookieIssue[] = [];
    const isSession = maxAge === null || maxAge < 0;

    if (!secure) {
      issues.push({
        type: "Missing Secure Flag",
        severity: "high",
        description: `Cookie "${name}" does not have the Secure flag set`,
        recommendation: `Add the Secure flag to cookie "${name}" to ensure it's only sent over HTTPS connections.`,
      });
    }

    if (!httpOnly) {
      issues.push({
        type: "Missing HttpOnly Flag",
        severity: "high",
        description: `Cookie "${name}" does not have the HttpOnly flag set`,
        recommendation: `Add the HttpOnly flag to cookie "${name}" to prevent JavaScript access and mitigate XSS attacks.`,
      });
    }

    if (sameSite === "unspecified" || sameSite === null) {
      issues.push({
        type: "Missing SameSite Attribute",
        severity: "medium",
        description: `Cookie "${name}" does not have a SameSite attribute set`,
        recommendation: `Add SameSite=Strict or SameSite=Lax to cookie "${name}" to prevent CSRF attacks.`,
      });
    }

    if (name.toLowerCase().includes("session") && isSession && !httpOnly) {
      issues.push({
        type: "Session Cookie Without Protection",
        severity: "critical",
        description: `Session cookie "${name}" is missing security flags`,
        recommendation: `Ensure session cookies have Secure, HttpOnly, and SameSite attributes set.`,
      });
    }

    if (isSession && maxAge !== null && maxAge < 0) {
      issues.push({
        type: "Negative Max-Age",
        severity: "low",
        description: `Cookie "${name}" has a negative max-age`,
        recommendation: `Remove the negative max-age or use session cookie without max-age.`,
      });
    }

    cookies.push({
      name,
      value: value.length > 50 ? value.substring(0, 50) + "..." : value,
      domain,
      path,
      secure,
      httpOnly,
      sameSite: sameSite === "unspecified" ? null : sameSite,
      maxAge,
      sessionCookie: isSession,
      issues,
    });
  }

  return cookies;
}

function analyzeCookies(cookies: CookieResult[]): CookieAnalysis {
  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;

  for (const cookie of cookies) {
    for (const issue of cookie.issues) {
      switch (issue.severity) {
        case "critical":
          critical++;
          break;
        case "high":
          high++;
          break;
        case "medium":
          medium++;
          break;
        case "low":
          low++;
          break;
      }
    }
  }

  return {
    totalCookies: cookies.length,
    sessionCookies: cookies.filter(c => c.sessionCookie).length,
    persistentCookies: cookies.filter(c => !c.sessionCookie).length,
    secureCookies: cookies.filter(c => c.secure).length,
    httpOnlyCookies: cookies.filter(c => c.httpOnly).length,
    sameSiteCookies: cookies.filter(c => c.sameSite !== null).length,
    cookiesWithIssues: cookies.filter(c => c.issues.length > 0).length,
    cookies,
    summary: {
      critical,
      high,
      medium,
      low,
    },
  };
}

function analyzeMixedContent(html: string, finalUrl: string): MixedContentAnalysis {
  const issues: MixedContent[] = [];
  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;

  const parsedUrl = new URL(finalUrl);
  const isHttps = parsedUrl.protocol === "https:";

  if (!isHttps) {
    return {
      hasMixedContent: false,
      totalMixedContent: 0,
      mixedContent: [],
      summary: { critical: 0, high: 0, medium: 0, low: 0 },
    };
  }

  const sourceLines = html.split("\n");

  const patterns: Array<{
    type: "script" | "stylesheet" | "image" | "iframe" | "video" | "audio" | "object" | "embed" | "font";
    regex: RegExp;
    tag: string;
    severity: "critical" | "high" | "medium" | "low";
  }> = [
    { type: "script", regex: /<script[^>]+src=["']http:/gi, tag: "<script", severity: "high" },
    { type: "stylesheet", regex: /<link[^>]+href=["']http:/gi, tag: "<link", severity: "medium" },
    { type: "image", regex: /<img[^>]+src=["']http:/gi, tag: "<img", severity: "medium" },
    { type: "iframe", regex: /<iframe[^>]+src=["']http:/gi, tag: "<iframe", severity: "high" },
    { type: "video", regex: /<video[^>]+src=["']http:/gi, tag: "<video", severity: "low" },
    { type: "audio", regex: /<audio[^>]+src=["']http:/gi, tag: "<audio", severity: "low" },
    { type: "object", regex: /<object[^>]+data=["']http:/gi, tag: "<object", severity: "high" },
    { type: "embed", regex: /<embed[^>]+src=["']http:/gi, tag: "<embed", severity: "high" },
    { type: "font", regex: /url\(["']?http:/gi, tag: "url()", severity: "low" },
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);

    while ((match = regex.exec(html)) !== null) {
      const fullMatch = match[0];
      const urlMatch = fullMatch.match(/["']([^"']+)["']/);
      const url = urlMatch ? urlMatch[1] : "unknown";

      const lineNumber = html.substring(0, match.index).split("\n").length;

      let severity: "critical" | "high" | "medium" | "low" = pattern.severity;

      if (pattern.type === "script" || pattern.type === "iframe" || pattern.type === "object" || pattern.type === "embed") {
        severity = "high";
      }

      switch (severity) {
        case "critical":
          critical++;
          break;
        case "high":
          high++;
          break;
        case "medium":
          medium++;
          break;
        case "low":
          low++;
          break;
      }

      issues.push({
        type: pattern.type,
        url,
        sourceLocation: `${pattern.tag} tag`,
        sourceLine: lineNumber,
        severity,
      });
    }
  }

  const xhrFetchPatterns: Array<{
    type: "other";
    regex: RegExp;
    severity: "critical" | "high" | "medium" | "low";
  }> = [
    { type: "other", regex: /fetch\s*\(\s*["']http:/gi, severity: "high" },
    { type: "other", regex: /XMLHttpRequest\s*\(\s*\.open\s*\(\s*["']GET["'][^)]*["']http:/gi, severity: "high" },
    { type: "other", regex: /\.ajax\s*\(\s*\{[^}]*url\s*:\s*["']http:/gi, severity: "high" },
  ];

  for (const pattern of xhrFetchPatterns) {
    let match: RegExpExecArray | null;
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);

    while ((match = regex.exec(html)) !== null) {
      const urlMatch = match[0].match(/["']([^"']+)["']/);
      const url = urlMatch ? urlMatch[1] : "unknown";
      const lineNumber = html.substring(0, match.index).split("\n").length;

      switch (pattern.severity) {
        case "critical":
          critical++;
          break;
        case "high":
          high++;
          break;
        case "medium":
          medium++;
          break;
        case "low":
          low++;
          break;
      }

      issues.push({
        type: pattern.type,
        url,
        sourceLocation: "JavaScript",
        sourceLine: lineNumber,
        severity: pattern.severity,
      });
    }
  }

  return {
    hasMixedContent: issues.length > 0,
    totalMixedContent: issues.length,
    mixedContent: issues,
    summary: {
      critical,
      high,
      medium,
      low,
    },
  };
}

function analyzeJavaScript(html: string): JSAnalysis {
  const issues: JSAnalysisIssue[] = [];
  let critical = 0;
  let high = 0;
  let medium = 0;
  let low = 0;

  const lines = html.split("\n");

  const inlineScriptRegex = /<script[^>]*>(?!<\s*\/script>)/gi;
  let match: RegExpExecArray | null;
  const scriptRegex = new RegExp(inlineScriptRegex.source, inlineScriptRegex.flags);
  let inlineScriptCount = 0;

  while ((match = scriptRegex.exec(html)) !== null) {
    const scriptContent = match[0];
    if (!scriptContent.includes("src=")) {
      inlineScriptCount++;
      const lineNumber = html.substring(0, match.index).split("\n").length;
      issues.push({
        type: "Inline Script",
        severity: "high",
        description: "Inline JavaScript detected. External scripts are preferred for better CSP and security.",
        location: `<script> tag`,
        lineNumber,
        recommendation: "Move inline JavaScript to external files and reference them with src attributes. This enables better Content-Security-Policy enforcement.",
      });
      high++;
    }
  }

  const evalRegex = /\beval\s*\(/g;
  let evalCount = 0;
  while ((match = evalRegex.exec(html)) !== null) {
    evalCount++;
    const lineNumber = html.substring(0, match.index).split("\n").length;
    issues.push({
      type: "eval() Usage",
      severity: "high",
      description: "Use of eval() detected, which is a security risk.",
      location: "JavaScript code",
      lineNumber,
      recommendation: "Avoid using eval(). It can execute arbitrary code and makes applications vulnerable to XSS attacks. Use alternatives like JSON.parse() or Function constructor with extreme caution.",
    });
    high++;
  }

  const documentWriteRegex = /document\.write\s*\(/g;
  let documentWriteCount = 0;
  while ((match = documentWriteRegex.exec(html)) !== null) {
    documentWriteCount++;
    const lineNumber = html.substring(0, match.index).split("\n").length;
    issues.push({
      type: "document.write() Usage",
      severity: "medium",
      description: "Use of document.write() detected. This is deprecated and can cause performance issues.",
      location: "JavaScript code",
      lineNumber,
      recommendation: "Replace document.write() with modern DOM manipulation methods like document.createElement(), appendChild(), or innerHTML.",
    });
    medium++;
  }

  const inlineHandlerRegex = /\s+on\w+\s*=/g;
  let inlineHandlerCount = 0;
  while ((match = inlineHandlerRegex.exec(html)) !== null) {
    inlineHandlerCount++;
    const lineNumber = html.substring(0, match.index).split("\n").length;
    issues.push({
      type: "Inline Event Handler",
      severity: "medium",
      description: "Inline event handlers (onclick, onmouseover, etc.) detected.",
      location: "HTML element",
      lineNumber,
      recommendation: "Move event handlers to external JavaScript files using addEventListener() for better CSP compliance and code organization.",
    });
    medium++;
  }

  const dangerousProtocolRegex = /javascript:/gi;
  let dangerousProtocolCount = 0;
  while ((match = dangerousProtocolRegex.exec(html)) !== null) {
    dangerousProtocolCount++;
    const lineNumber = html.substring(0, match.index).split("\n").length;
    issues.push({
      type: "JavaScript Protocol",
      severity: "high",
      description: "javascript: protocol detected in href or other attributes.",
      location: "HTML attribute",
      lineNumber,
      recommendation: "Avoid using javascript: protocol. Use # or proper event handlers instead. This can be exploited for XSS attacks.",
    });
    high++;
  }

  const targetBlankRegex = /<a[^>]+target\s*=\s*["']_blank["'][^>]*>(?!.*rel\s*=\s*["']noopener[^"']*["'])/gi;
  let targetBlankCount = 0;
  let missingNoopener = 0;

  const targetRegex = new RegExp(targetBlankRegex.source, targetBlankRegex.flags);
  while ((match = targetRegex.exec(html)) !== null) {
    targetBlankCount++;
    const lineNumber = html.substring(0, match.index).split("\n").length;
    issues.push({
      type: "target='_blank' without rel='noopener'",
      severity: "medium",
      description: "Links with target='_blank' should also have rel='noopener' for security.",
      location: `<a> tag`,
      lineNumber,
      recommendation: "Add rel='noopener noreferrer' to links with target='_blank' to prevent window.opener vulnerabilities.",
    });
    missingNoopener++;
    medium++;
  }

  return {
    hasInlineScripts: inlineScriptCount > 0,
    inlineScriptCount,
    hasEval: evalCount > 0,
    evalCount,
    hasDocumentWrite: documentWriteCount > 0,
    documentWriteCount,
    hasInlineHandlers: inlineHandlerCount > 0,
    inlineHandlerCount,
    hasDangerousProtocols: dangerousProtocolCount > 0,
    dangerousProtocolCount,
    hasTargetBlank: targetBlankCount > 0,
    targetBlankCount,
    missingNoopener,
    issues,
    summary: {
      critical: 0,
      high,
      medium,
      low,
    },
  };
}

function analyzeSRI(html: string): SRIAnalysis {
  const scriptsWithoutSRI: string[] = [];
  const stylesheetsWithoutSRI: string[] = [];

  const scriptRegex = /<script[^>]+src=["']([^"']+)["'][^>]*>/gi;
  const linkStylesheetRegex = /<link[^>]+rel=["']?stylesheet["']?[^>]*>/gi;
  const scriptWithIntegrityRegex = /<script[^>]+integrity=["']([^"']+)["'][^>]*>/gi;
  const linkWithIntegrityRegex = /<link[^>]+integrity=["']([^"']+)["'][^>]*>/gi;

  let match: RegExpExecArray | null;
  let scriptsWithSRI = 0;
  let externalScripts = 0;

  while ((match = scriptWithIntegrityRegex.exec(html)) !== null) {
    scriptsWithSRI++;
  }

  const scriptSrcRegex = new RegExp(scriptRegex.source, scriptRegex.flags);
  while ((match = scriptSrcRegex.exec(html)) !== null) {
    externalScripts++;
    const srcMatch = match[0].match(/src=["']([^"']+)["']/);
    if (srcMatch) {
      const src = srcMatch[1];
      if (!match[0].includes("integrity=")) {
        scriptsWithoutSRI.push(src);
      }
    }
  }

  let stylesheetsWithSRI = 0;
  let externalStylesheets = 0;

  while ((match = linkWithIntegrityRegex.exec(html)) !== null) {
    stylesheetsWithSRI++;
  }

  const linkStylesheetSrcRegex = new RegExp(linkStylesheetRegex.source, linkStylesheetRegex.flags);
  while ((match = linkStylesheetSrcRegex.exec(html)) !== null) {
    externalStylesheets++;
    if (!match[0].includes("integrity=")) {
      const hrefMatch = match[0].match(/href=["']([^"']+)["']/);
      if (hrefMatch) {
        stylesheetsWithoutSRI.push(hrefMatch[1]);
      }
    }
  }

  const high = scriptsWithoutSRI.length;

  return {
    externalScripts,
    scriptsWithSRI,
    externalStylesheets,
    stylesheetsWithSRI,
    scriptsWithoutSRI,
    stylesheetsWithoutSRI,
    summary: {
      critical: 0,
      high,
      medium: 0,
      low: stylesheetsWithoutSRI.length,
    },
  };
}

async function analyzeGraphQL(finalUrl: string): Promise<GraphQLAnalysis> {
  const result: GraphQLAnalysis = {
    endpoint: undefined,
    introspectionEnabled: false,
    graphiqlAvailable: false,
    schemaAccessible: false,
    severity: null,
  };

  const graphqlPaths = [
    "/graphql",
    "/api/graphql",
    "/api/v1/graphql",
    "/graphql/api",
    "/graphQL",
    "/GraphQL",
    "/api/graphq",
    "/query",
    "/v1/api",
    "/gql",
  ];

  const introspectionQuery = '{"query":"{__schema{queryType{name}}}"}';

  for (const path of graphqlPaths) {
    try {
      const graphqlUrl = new URL(path, finalUrl).toString();

      const response = await fetch(graphqlUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: introspectionQuery,
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        const data = await response.json();
        result.endpoint = graphqlUrl;
        result.introspectionEnabled = true;

        if (data.data && data.data.__schema) {
          result.schemaAccessible = true;
        }

        if (data.errors && data.errors.some((e: { message: string }) => e.message.includes("introspection"))) {
          result.introspectionEnabled = false;
        }

        break;
      }
    } catch {
      continue;
    }
  }

  const graphiqlPaths = [
    "/graphiql",
    "/graphql/ui",
    "/playground",
    "/api/graphiql",
    "/docs",
    "/graphiql.html",
  ];

  for (const path of graphiqlPaths) {
    try {
      const graphiqlUrl = new URL(path, finalUrl).toString();
      const response = await fetch(graphiqlUrl, {
        method: "GET",
        signal: AbortSignal.timeout(5000),
      });

      if (response.ok) {
        result.graphiqlAvailable = true;
        break;
      }
    } catch {
      continue;
    }
  }

  if (result.endpoint) {
    if (result.introspectionEnabled && result.graphiqlAvailable) {
      result.severity = "high";
    } else if (result.introspectionEnabled) {
      result.severity = "medium";
    } else if (result.graphiqlAvailable) {
      result.severity = "low";
    } else {
      result.severity = null;
    }
  }

  return result;
}

function analyzeHSTS(hstsValue: string): HSTSAnalysis {
  const directives = hstsValue.toLowerCase().split(";").map(d => d.trim());
  let maxAge = 0;
  let includeSubDomains = false;
  let preload = false;

  for (const directive of directives) {
    if (directive.startsWith("max-age=")) {
      const match = directive.match(/max-age=(\d+)/);
      if (match) maxAge = parseInt(match[1], 10);
    }
    if (directive.includes("includesubdomains")) {
      includeSubDomains = true;
    }
    if (directive.includes("preload")) {
      preload = true;
    }
  }

  return {
    maxAge,
    includeSubDomains,
    preload,
    isValid: maxAge > 0,
  };
}

function calculateSecretConfidence(match: string, context: string, pattern: typeof SECRET_PATTERNS[0]): "high" | "medium" | "low" {
  let confidence = 0;

  if (pattern.validate) {
    confidence += pattern.validate(match) ? 40 : -20;
  }

  if (pattern.keywords) {
    const lowerContext = context.toLowerCase();
    const nearbyKeywords = pattern.keywords.filter(keyword => 
      lowerContext.includes(keyword.toLowerCase())
    );
    confidence += nearbyKeywords.length * 15;
  }

  if (match.length >= 32) confidence += 10;
  if (match.length >= 50) confidence += 10;

  if (/^[A-Za-z0-9_-]{20,}$/.test(match)) {
    confidence += 15;
  }

  if (confidence >= 50) return "high";
  if (confidence >= 25) return "medium";
  return "low";
}

function extractContext(html: string, matchIndex: number, windowSize: number = 100): string {
  const start = Math.max(0, matchIndex - windowSize);
  const end = Math.min(html.length, matchIndex + windowSize);
  return html.substring(start, end);
}

export async function scanURL(url: string): Promise<ScanResult> {
  const validation = validateURL(url);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  const originalUrl = validation.normalizedUrl!;
  const startTime = Date.now();
  const redirectChain: RedirectStep[] = [];
  const scoringDetails: ScoringDetail[] = [];

  let currentUrl = originalUrl;
  let htmlContent = "";
  let responseHeaders: Record<string, string> = {};
  const tlsCheck: TLSResult = {
    httpRedirectsToHttps: false,
    httpsStatus: 0,
    httpsReachable: false,
  };

  if (originalUrl.startsWith("http:")) {
    try {
      const httpsUrl = originalUrl.replace("http://", "https://");
      const httpsResponse = await fetch(httpsUrl, {
        method: "GET",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      tlsCheck.httpRedirectsToHttps = httpsResponse.redirected || httpsResponse.url !== httpsUrl || originalUrl === httpsResponse.url;
      tlsCheck.httpsStatus = httpsResponse.status;
      tlsCheck.httpsReachable = httpsResponse.ok;
    } catch {
      tlsCheck.httpsReachable = false;
    }
  } else {
    try {
      const response = await fetch(originalUrl, {
        method: "HEAD",
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
      tlsCheck.httpsStatus = response.status;
      tlsCheck.httpsReachable = response.ok;
    } catch {
      tlsCheck.httpsReachable = false;
    }
  }

  const seenUrls = new Set<string>();
  let finalUrl = originalUrl;

  for (let redirectCount = 0; redirectCount < MAX_REDIRECT_CHAIN; redirectCount++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
      
      const response = await fetch(currentUrl, {
        method: "GET",
        redirect: "manual",
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      finalUrl = response.url;
      
      if (seenUrls.has(finalUrl)) {
        throw new Error(`Redirect loop detected: ${finalUrl} was already visited in this chain`);
      }
      seenUrls.add(finalUrl);

      redirectChain.push({
        url: finalUrl,
        statusCode: response.status,
        location: response.headers.get("location") || undefined,
      });

      responseHeaders = {};
      response.headers.forEach((value, key) => {
        responseHeaders[key.toLowerCase()] = value;
      });

      if (response.status >= 300 && response.status < 400 && response.headers.has("location")) {
        const location = response.headers.get("location")!;
        currentUrl = new URL(location, finalUrl).toString();
        continue;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const contentLength = response.headers.get("content-length");
      if (contentLength && parseInt(contentLength, 10) > BODY_SIZE_LIMIT) {
        throw new Error(`Response too large (${parseInt(contentLength, 10)} bytes). Maximum allowed: ${BODY_SIZE_LIMIT / 1024 / 1024}MB`);
      }

      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer.byteLength > BODY_SIZE_LIMIT) {
        throw new Error(`Response too large (${arrayBuffer.byteLength} bytes). Maximum allowed: ${BODY_SIZE_LIMIT / 1024 / 1024}MB`);
      }

      const decoder = new TextDecoder("utf-8", { fatal: false });
      htmlContent = decoder.decode(arrayBuffer);
      break;
    } catch (error) {
      if (error instanceof Error && error.name === "TimeoutError") {
        throw new Error("Request timed out. The target may be unreachable.");
      }
      if (error instanceof Error && error.message.includes("Redirect loop detected")) {
        throw error;
      }
      if (redirectCount === MAX_REDIRECT_CHAIN - 1) {
        const chainPreview = redirectChain.slice(0, 10).map((s, i) => `${i + 1}. ${s.statusCode} → ${s.url.substring(0, 80)}`).join("\n");
        throw new Error(`Reached maximum redirects (${MAX_REDIRECT_CHAIN}). Redirect chain:\n${chainPreview}\n\nThis typically happens with:\n- URL shorteners (bit.ly, t.co)\n- Affiliate/tracking links\n- Analytics redirects\n- Sophisticated firewall redirects\n\nTry using the final destination URL directly.`);
      }
    }
  }

  if (!htmlContent) {
    throw new Error("Failed to retrieve page content");
  }

  const headerResults: HeaderResult[] = SECURITY_HEADERS.map((header) => {
    const value = responseHeaders[header.name.toLowerCase()];
    let status: "pass" | "warning" | "fail" = value ? "pass" : "fail";
    let details = "";
    let cspDetails: CSPAnalysis | undefined;
    let hstsDetails: HSTSAnalysis | undefined;
    let recommendation = header.recommendation;

    if (header.name === "Content-Security-Policy" && value) {
      cspDetails = analyzeCSP(value);
      if (!cspDetails.hasDefaultSrc) {
        status = "warning";
        details = "Missing default-src directive";
      } else if (cspDetails.hasUnsafeInline || cspDetails.hasUnsafeEval) {
        status = cspDetails.hasUnsafeInline && cspDetails.hasUnsafeEval ? "fail" : "warning";
        details = cspDetails.hasUnsafeInline ? "Contains unsafe-inline" : "Contains unsafe-eval";
        recommendation = "Remove 'unsafe-inline' and 'unsafe-eval' from CSP. Use nonces or hashes for inline scripts.";
      }
      if (!cspDetails.hasObjectSrcNone) {
        status = status === "pass" ? "warning" : status;
        details += (details ? ". " : "") + "Missing object-src 'none'";
        recommendation += " Add 'object-src 'none'' to prevent plugin-based attacks.";
      }
    }

    if (header.name === "Strict-Transport-Security" && value) {
      hstsDetails = analyzeHSTS(value);
      if (!hstsDetails.isValid) {
        status = "fail";
        details = "Invalid max-age";
        recommendation = "Set max-age to a positive value (recommended: 15552000 for 180 days).";
      } else if (hstsDetails.maxAge < 2592000) {
        status = "warning";
        details = `max-age too short (${hstsDetails.maxAge} seconds). Recommended: >= 2592000 (30 days)`;
        recommendation = "Increase max-age to at least 2592000 seconds (30 days), ideally 15552000 (180 days).";
      }
      if (!hstsDetails.includeSubDomains) {
        details += (details ? ". " : "") + "Missing includeSubDomains";
        recommendation += " Add 'includeSubDomains' to protect subdomains.";
      }
    }

    if (header.name === "X-Frame-Options" && value) {
      const cspValue = responseHeaders["content-security-policy"] || "";
      if (cspValue.includes("frame-ancestors")) {
        status = "warning";
        details = "X-Frame-Options present but CSP frame-ancestors is more modern alternative";
        recommendation = "X-Frame-Options is superseded by CSP frame-ancestors. Consider migrating to CSP.";
      }
    }

    const result: HeaderResult = {
      name: header.name,
      status,
      severity: header.severity,
      value,
      description: header.description,
      details: details || undefined,
      recommendation: recommendation || header.recommendation,
    };

    if (cspDetails) result.cspDetails = cspDetails;
    if (hstsDetails) result.hstsDetails = hstsDetails;

    if (status === "fail") {
      const penalty = header.severity === "high" ? 20 : header.severity === "medium" ? 10 : 5;
      scoringDetails.push({
        category: "header",
        item: header.name,
        points: -penalty,
        reason: status === "fail" ? "Header missing" : details,
        recommendation: recommendation || header.recommendation,
      });
    } else if (status === "warning") {
      const penalty = header.severity === "high" ? 10 : header.severity === "medium" ? 5 : 2;
      scoringDetails.push({
        category: "header",
        item: header.name,
        points: -penalty,
        reason: details,
        recommendation: recommendation || header.recommendation,
      });
    }

    return result;
  });

  const secretResults: SecretResult[] = [];
  const lowerHtml = htmlContent.toLowerCase();

  for (const secretPattern of SECRET_PATTERNS) {
    const regex = new RegExp(secretPattern.pattern.source, secretPattern.pattern.flags);
    let match: RegExpExecArray | null;
    
    while ((match = regex.exec(htmlContent)) !== null) {
      const fullMatch = match[0];
      const capturedValue = match[1] || fullMatch;
      const matchIndex = match.index;
      
      const context = extractContext(htmlContent, matchIndex);
      const confidence = calculateSecretConfidence(capturedValue, context, secretPattern);
      
      const redacted = capturedValue.length > 12 
        ? capturedValue.substring(0, 8) + "*".repeat(capturedValue.length - 12) + capturedValue.substring(capturedValue.length - 4)
        : "*".repeat(capturedValue.length);

      let points = 0;
      switch (secretPattern.severity) {
        case "critical": points = -40; break;
        case "high": points = confidence === "high" ? -25 : -15; break;
        case "medium": points = confidence === "high" ? -15 : -10; break;
        case "low": points = -5; break;
      }

      scoringDetails.push({
        category: "secret",
        item: secretPattern.type,
        points,
        reason: `${confidence.toUpperCase()} confidence match`,
        recommendation: secretPattern.recommendation,
      });

      secretResults.push({
        type: secretPattern.type,
        severity: secretPattern.severity,
        location: "HTML Content",
        redacted,
        description: secretPattern.description,
        confidence,
        evidence: `Found pattern "${secretPattern.type}" in HTML content`,
        recommendation: secretPattern.recommendation,
      });
    }
  }

  const technologyResults: TechnologyResult[] = [];

  for (const tech of TECH_SIGNATURES) {
    const signals: TechnologySignal[] = [];

    for (const header of (tech.headers || [])) {
      const colonIndex = header.indexOf(":");
      const headerName = colonIndex > 0 ? header.substring(0, colonIndex).trim() : header.trim();
      const headerValue = colonIndex > 0 ? header.substring(colonIndex + 1).trim() : undefined;
      const headerVal = responseHeaders[headerName.toLowerCase()];
      if (headerVal && (!headerValue || headerVal.toLowerCase().includes(headerValue.toLowerCase()))) {
        signals.push({ type: "header", value: header });
      }
    }

    for (const pattern of (tech.html || [])) {
      if (lowerHtml.includes(pattern.toLowerCase())) {
        signals.push({ type: "html", value: pattern });
      }
    }

    for (const script of (tech.scripts || [])) {
      if (lowerHtml.includes(script.toLowerCase())) {
        signals.push({ type: "script", value: script });
      }
    }

    for (const cookieName of (tech.cookies || [])) {
      let found = false;
      if (typeof responseHeaders === "object" && responseHeaders) {
        const cookieHeader = responseHeaders["set-cookie"] || "";
        if (cookieHeader.toLowerCase().includes(cookieName.toLowerCase())) {
          found = true;
        }
      }
      const rawHeaders = responseHeaders as Record<string, string> & { getSetCookie?: () => string[] };
      if (!found && typeof rawHeaders.getSetCookie === "function") {
        const cookies = rawHeaders.getSetCookie();
        if (cookies.some(c => c.toLowerCase().includes(cookieName.toLowerCase()))) {
          found = true;
        }
      }
      if (found) {
        signals.push({ type: "cookie", value: cookieName });
      }
    }

    if (signals.length > 0) {
      const confidenceScore = Math.min(100, signals.length * 25);
      let confidence: "high" | "medium" | "low";
      if (signals.length >= 3) confidence = "high";
      else if (signals.length >= 2) confidence = "medium";
      else confidence = "low";

      technologyResults.push({
        name: tech.name,
        category: tech.category,
        confidence,
        confidenceScore,
        evidence: signals.map(s => `${s.type}: ${s.value}`),
        signals,
      });
    }
  }

  const setCookieHeader = responseHeaders["set-cookie"] || "";
  const cookieAnalysis = analyzeCookies(parseCookies(setCookieHeader));

  for (const cookie of cookieAnalysis.cookies) {
    for (const issue of cookie.issues) {
      let points = 0;
      switch (issue.severity) {
        case "critical":
          points = SCORING.COOKIE_CRITICAL;
          break;
        case "high":
          points = SCORING.COOKIE_HIGH;
          break;
        case "medium":
          points = SCORING.COOKIE_MEDIUM;
          break;
        case "low":
          points = SCORING.COOKIE_LOW;
          break;
      }
      scoringDetails.push({
        category: "cookie",
        item: `${cookie.name}: ${issue.type}`,
        points,
        reason: issue.description,
        recommendation: issue.recommendation,
      });
    }
  }

  const mixedContentAnalysis = analyzeMixedContent(htmlContent, finalUrl);

  for (const item of mixedContentAnalysis.mixedContent) {
    let points = 0;
    switch (item.severity) {
      case "critical":
        points = SCORING.MIXED_CRITICAL;
        break;
      case "high":
        points = SCORING.MIXED_HIGH;
        break;
      case "medium":
        points = SCORING.MIXED_MEDIUM;
        break;
      case "low":
        points = SCORING.MIXED_LOW;
        break;
    }
    scoringDetails.push({
      category: "content",
      item: `Mixed Content: ${item.type}`,
      points,
      reason: `${item.type} resource loaded from insecure URL: ${item.url}`,
      recommendation: `Replace http:// with https:// for the ${item.type} resource, or remove it if not essential.`,
    });
  }

  const jsAnalysis = analyzeJavaScript(htmlContent);

  for (const issue of jsAnalysis.issues) {
    let points = 0;
    switch (issue.severity) {
      case "critical":
        points = SCORING.JS_HIGH;
        break;
      case "high":
        points = SCORING.JS_HIGH;
        break;
      case "medium":
        points = SCORING.JS_MEDIUM;
        break;
      case "low":
        points = SCORING.JS_LOW;
        break;
    }
    scoringDetails.push({
      category: "content",
      item: `JS: ${issue.type}`,
      points,
      reason: issue.description,
      recommendation: issue.recommendation,
    });
  }

  const sriAnalysis = analyzeSRI(htmlContent);

  for (const src of sriAnalysis.scriptsWithoutSRI) {
    scoringDetails.push({
      category: "content",
      item: "SRI: Script without integrity",
      points: SCORING.SRI_SCRIPT,
      reason: `External script loaded without Subresource Integrity: ${src}`,
      recommendation: `Add integrity attribute (SHA256/SHA384/SHA512) to the script tag for ${src}. This protects against CDN compromises and supply chain attacks.`,
    });
  }

  for (const href of sriAnalysis.stylesheetsWithoutSRI) {
    scoringDetails.push({
      category: "content",
      item: "SRI: Stylesheet without integrity",
      points: SCORING.SRI_STYLESHEET,
      reason: `External stylesheet loaded without Subresource Integrity: ${href}`,
      recommendation: `Add integrity attribute to the link tag for ${href} to protect against stylesheet tampering.`,
    });
  }

  const graphQLAnalysis = await analyzeGraphQL(finalUrl);

  if (graphQLAnalysis.endpoint && graphQLAnalysis.severity) {
    let points = 0;
    switch (graphQLAnalysis.severity) {
      case "high":
        points = -15;
        break;
      case "medium":
        points = -10;
        break;
      case "low":
        points = -5;
        break;
    }
    scoringDetails.push({
      category: "content",
      item: "GraphQL Introspection",
      points,
      reason: `GraphQL endpoint found at ${graphQLAnalysis.endpoint} with ${graphQLAnalysis.introspectionEnabled ? "introspection enabled" : "GraphiQL available"}`,
      recommendation: "Disable introspection in production by setting graphql.introspection = false in your schema configuration.",
    });
  }

  let score: number = WEIGHTED_SCORING.baseScore;

  for (const detail of scoringDetails) {
    score += detail.points;
  }

  if (tlsCheck.httpRedirectsToHttps === false && originalUrl.startsWith("http:")) {
    score -= 5;
    scoringDetails.push({
      category: "tls",
      item: "HTTP to HTTPS",
      points: -5,
      reason: "HTTP does not redirect to HTTPS",
      recommendation: "Configure your server to redirect HTTP to HTTPS.",
    });
  }

  const cspHeader = responseHeaders["content-security-policy"];
  if (cspHeader) {
    const csp = analyzeCSP(cspHeader);
    if (csp.hasDefaultSrc && !csp.hasUnsafeInline && !csp.hasUnsafeEval) {
      score += WEIGHTED_SCORING.bonuses.strongCSP;
      scoringDetails.push({
        category: "header",
        item: "Strong CSP",
        points: WEIGHTED_SCORING.bonuses.strongCSP,
        reason: "Content-Security-Policy is well configured with default-src and no unsafe directives",
        recommendation: "Continue maintaining your CSP configuration.",
      });
    }
  }

  const hstsHeader = responseHeaders["strict-transport-security"];
  if (hstsHeader) {
    const hsts = analyzeHSTS(hstsHeader);
    if (hsts.preload) {
      score += WEIGHTED_SCORING.bonuses.hstsPreload;
      scoringDetails.push({
        category: "header",
        item: "HSTS Preload",
        points: WEIGHTED_SCORING.bonuses.hstsPreload,
        reason: "Strict-Transport-Security includes preload directive",
        recommendation: "Continue maintaining your HSTS configuration.",
      });
    }
  }

  if (secretResults.length === 0) {
    score += WEIGHTED_SCORING.bonuses.noSecrets;
    scoringDetails.push({
      category: "secret",
      item: "No Secrets Detected",
      points: WEIGHTED_SCORING.bonuses.noSecrets,
      reason: "No leaked secrets found in the scanned content",
      recommendation: "Continue monitoring for secret exposure.",
    });
  }

  if (sriAnalysis.externalScripts > 0 && sriAnalysis.scriptsWithoutSRI.length === 0) {
    score += WEIGHTED_SCORING.bonuses.sriAllScripts;
    scoringDetails.push({
      category: "content",
      item: "All Scripts Have SRI",
      points: WEIGHTED_SCORING.bonuses.sriAllScripts,
      reason: "All external scripts have Subresource Integrity",
      recommendation: "Continue maintaining SRI for all external resources.",
    });
  }

  if (sriAnalysis.externalStylesheets > 0 && sriAnalysis.stylesheetsWithoutSRI.length === 0) {
    score += WEIGHTED_SCORING.bonuses.sriAllStylesheets;
    scoringDetails.push({
      category: "content",
      item: "All Stylesheets Have SRI",
      points: WEIGHTED_SCORING.bonuses.sriAllStylesheets,
      reason: "All external stylesheets have Subresource Integrity",
      recommendation: "Continue maintaining SRI for all external resources.",
    });
  }

  score = Math.max(0, Math.min(100, score));

  const duration = Date.now() - startTime;

  const summary = {
    critical: secretResults.filter((s) => s.severity === "critical").length + cookieAnalysis.summary.critical + mixedContentAnalysis.summary.critical + jsAnalysis.summary.critical + sriAnalysis.summary.critical + (graphQLAnalysis.severity === "high" ? 1 : 0),
    high: secretResults.filter((s) => s.severity === "high").length + headerResults.filter((h) => h.status === "fail" && h.severity === "high").length + cookieAnalysis.summary.high + mixedContentAnalysis.summary.high + jsAnalysis.summary.high + sriAnalysis.summary.high + (graphQLAnalysis.severity === "medium" ? 1 : 0),
    medium: secretResults.filter((s) => s.severity === "medium").length + headerResults.filter((h) => h.status === "fail" && h.severity === "medium").length + cookieAnalysis.summary.medium + mixedContentAnalysis.summary.medium + jsAnalysis.summary.medium + sriAnalysis.summary.medium + (graphQLAnalysis.severity === "low" ? 1 : 0),
    low: secretResults.filter((s) => s.severity === "low").length + headerResults.filter((h) => h.status === "fail" && h.severity === "low").length + cookieAnalysis.summary.low + mixedContentAnalysis.summary.low + jsAnalysis.summary.low + sriAnalysis.summary.low,
    passed: headerResults.filter((h) => h.status === "pass").length,
    info: technologyResults.length,
  };

  return {
    url: redirectChain[redirectChain.length - 1]?.url || originalUrl,
    originalUrl,
    timestamp: startTime,
    duration,
    score,
    grade: calculateGrade(score),
    redirectChain,
    headers: headerResults,
    secrets: secretResults,
    technologies: technologyResults,
    tlsCheck,
    cookieAnalysis,
    mixedContentAnalysis,
    jsAnalysis,
    sriAnalysis,
    graphQLAnalysis,
    summary,
    scoringDetails,
  };
}
