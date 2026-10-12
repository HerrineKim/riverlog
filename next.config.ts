import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

// Static site, so no nonces: inline scripts (theme bootstrap, RSC payload) need 'unsafe-inline'.
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' https: data: blob:", // book covers and note images may be remote
  "font-src 'self'",
  "connect-src 'self'",
  "frame-src https://giscus.app", // comments (GitHub Discussions)
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
];

// Knowledge notes that moved to another folder (2026-10). Old URLs keep working.
const movedNotes: Record<string, string> = {
  "/knowledge/dictionary/frontend/nextjs": "/knowledge/dictionary/frontend/next-js/nextjs",
  "/knowledge/dictionary/frontend/nextjs-app-router": "/knowledge/dictionary/frontend/next-js/nextjs-app-router",
  "/knowledge/dictionary/frontend/server-client-components": "/knowledge/dictionary/frontend/next-js/server-client-components",
  "/knowledge/dictionary/frontend/feature-sliced-design": "/knowledge/dictionary/frontend/architecture/feature-sliced-design",
  "/knowledge/dictionary/frontend/frontend-folder-structure": "/knowledge/dictionary/frontend/architecture/frontend-folder-structure",
  "/knowledge/dictionary/frontend/react/frontend-dependency": "/knowledge/dictionary/frontend/architecture/frontend-dependency",
  "/knowledge/dictionary/frontend/react/frontend-solid": "/knowledge/dictionary/frontend/architecture/frontend-solid",
  "/knowledge/dictionary/frontend/graphics/threejs": "/knowledge/dictionary/frontend/ui-design/threejs",
  "/knowledge/dictionary/backend/auth/telegram-mini-app-auth": "/knowledge/dictionary/backend/web-basics/telegram-mini-app-auth",
  "/knowledge/dictionary/tools/local-https-mkcert": "/knowledge/dictionary/tools/dev-environment/local-https-mkcert",
  "/knowledge/dictionary/tools/windows-dev-environment": "/knowledge/dictionary/tools/dev-environment/windows-dev-environment",
  "/knowledge/dictionary/tools/local-dev-environment": "/knowledge/dictionary/tools/dev-environment/java-build-tools",
  "/knowledge/dictionary/tools/office/google-sheets-vs-excel": "/knowledge/dictionary/tools/google-sheets-vs-excel",
  "/knowledge/dictionary/tools/database/dbeaver": "/knowledge/dictionary/tools/dbeaver",
  "/knowledge/dictionary/devops/aws/rds-security-group": "/knowledge/dictionary/devops/rds-security-group",
  "/knowledge/dictionary/algorithm/coding-test/approach": "/knowledge/dictionary/algorithm/coding-test",
  "/knowledge/dictionary/career/talks/developer-leadership": "/knowledge/dictionary/career/product/developer-leadership",
  "/knowledge/dictionary/career/talks/career-in-ai-era": "/knowledge/dictionary/career/work/career-in-ai-era",
  "/knowledge/dictionary/career/reading/tech-reading-list": "/knowledge/dictionary/career/tech-reading-list",
  "/knowledge/dictionary/tools/jira/issues-and-jql": "/knowledge/dictionary/tools/jira",
  "/knowledge/dictionary/tools/jira/workflow": "/knowledge/dictionary/tools/jira",
  "/knowledge/dictionary/life-and-learning/journalism/media-industry-2021": "/knowledge/dictionary/life-and-learning/journalism/media-digital-transformation",
  "/knowledge/dictionary/ai-data/vibe-coding-beautiful-ui": "/knowledge/dictionary/ai-data/ai-frontend-design-prompting",
  "/knowledge/dictionary/career/product/product-owner": "/knowledge/dictionary/career/product/developer-leadership",
  "/knowledge/dictionary/life-and-learning/writing/sentence-craft": "/knowledge/dictionary/life-and-learning/writing/persuasive-writing",
};

const nextConfig: NextConfig = {
  poweredByHeader: false,
  async redirects() {
    return Object.entries(movedNotes).map(([source, destination]) => ({ source, destination, permanent: true }));
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
