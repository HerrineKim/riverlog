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
  "/knowledge/dictionary/frontend/ui-design/web-accessibility": "/knowledge/dictionary/frontend/accessibility",
  "/knowledge/dictionary/frontend/ui-design/color-motion-accessibility": "/knowledge/dictionary/frontend/accessibility/color-motion-accessibility",
  "/knowledge/dictionary/frontend/nextjs": "/knowledge/dictionary/frontend/next-js/nextjs",
  "/knowledge/dictionary/frontend/nextjs-app-router": "/knowledge/dictionary/frontend/next-js/nextjs-app-router",
  "/knowledge/dictionary/frontend/server-client-components": "/knowledge/dictionary/frontend/next-js/server-client-components",
  "/knowledge/dictionary/frontend/feature-sliced-design": "/knowledge/dictionary/frontend/architecture/feature-sliced-design",
  "/knowledge/dictionary/frontend/frontend-folder-structure": "/knowledge/dictionary/frontend/architecture/frontend-folder-structure",
  "/knowledge/dictionary/frontend/react/frontend-dependency": "/knowledge/dictionary/frontend/architecture/frontend-dependency",
  "/knowledge/dictionary/frontend/react/frontend-solid": "/knowledge/dictionary/frontend/architecture/frontend-solid",
  "/knowledge/dictionary/backend/auth/telegram-mini-app-auth": "/knowledge/dictionary/backend/web-basics/telegram-mini-app-auth",
  "/knowledge/dictionary/tools/local-https-mkcert": "/knowledge/dictionary/tools/dev-environment/local-https-mkcert",
  "/knowledge/dictionary/tools/windows-dev-environment": "/knowledge/dictionary/tools/dev-environment/windows-dev-environment",
  "/knowledge/dictionary/tools/local-dev-environment": "/knowledge/dictionary/tools/dev-environment/java-build-tools",
  "/knowledge/dictionary/tools/office/google-sheets-vs-excel": "/knowledge/dictionary/tools/google-sheets-vs-excel",
  "/knowledge/dictionary/tools/database/dbeaver": "/knowledge/dictionary/tools/dbeaver",
  "/knowledge/dictionary/devops/aws/rds-security-group": "/knowledge/dictionary/devops/aws-cloud-basics",
  "/knowledge/dictionary/algorithm/coding-test/approach": "/knowledge/dictionary/algorithm/coding-test",
  "/knowledge/dictionary/algorithm/basics": "/knowledge/dictionary/algorithm",
  "/knowledge/dictionary/algorithm/basics/big-o": "/knowledge/dictionary/algorithm/big-o",
  "/knowledge/dictionary/algorithm/basics/prefix-sum": "/knowledge/dictionary/algorithm/prefix-sum",
  "/knowledge/dictionary/career/talks/developer-leadership": "/knowledge/dictionary/career/product/product-minded-engineer",
  "/knowledge/dictionary/career/talks/career-in-ai-era": "/knowledge/dictionary/career/work/growing-at-work",
  "/knowledge/dictionary/career/reading/tech-reading-list": "/knowledge/dictionary/career/tech-reading-list",
  "/knowledge/dictionary/tools/jira/issues-and-jql": "/knowledge/dictionary/tools/jira",
  "/knowledge/dictionary/tools/jira/workflow": "/knowledge/dictionary/tools/jira",
  "/knowledge/dictionary/life-and-learning/journalism/media-industry-2021": "/knowledge/dictionary/life-and-learning/journalism/media-digital-transformation",
  "/knowledge/dictionary/ai-data/vibe-coding-beautiful-ui": "/knowledge/dictionary/ai-data/ai-frontend-design-prompting",
  "/knowledge/dictionary/career/product/product-owner": "/knowledge/dictionary/career/product/product-minded-engineer",
  "/knowledge/dictionary/life-and-learning/writing/sentence-craft": "/knowledge/dictionary/life-and-learning/writing/persuasive-writing",
  "/knowledge/dictionary/career/work/phone-etiquette": "/knowledge/dictionary/career/work/work-habits",
  "/knowledge/dictionary/ai-data/copilot-leaked-prompt": "/knowledge/dictionary/ai-data/system-prompt-patterns",
  "/knowledge/dictionary/ai-data/chatgpt-prompt-cheat-sheet": "/knowledge/dictionary/ai-data/prompt-cheat-sheet",
  "/knowledge/dictionary/frontend/javascript/date-object": "/knowledge/dictionary/frontend/javascript/date-libraries",
  "/knowledge/dictionary/life-and-learning/life/marvel-watch-order": "/knowledge/dictionary/life-and-learning",
  "/knowledge/dictionary/backend/database/rdbms-vs-nosql": "/knowledge/dictionary/computer-science/database/database-models",
  "/knowledge/dictionary/life-and-learning/english/vocabulary": "/knowledge/dictionary/life-and-learning/english/toeic-grammar",
  "/books/computer-architecture": "/books/computer-architecture-book",
  "/knowledge/dictionary/career/product/developer-leadership": "/knowledge/dictionary/career/product/product-minded-engineer",
  "/knowledge/dictionary/frontend/ui-design/product-detail-page": "/knowledge/dictionary/career/product/product-detail-page",
  "/knowledge/dictionary/life-and-learning/design/user-research": "/knowledge/dictionary/career/product/user-research",
  "/knowledge/dictionary/career/work/career-in-ai-era": "/knowledge/dictionary/career/work/growing-at-work",
  "/knowledge/dictionary/computer-science/engineer-information-processing/programming-language": "/knowledge/dictionary/computer-science/programming-languages/abstract-class-vs-interface",
  "/knowledge/dictionary/computer-science/oop-messaging": "/knowledge/dictionary/computer-science/programming-languages/oop-messaging",
  "/knowledge/dictionary/computer-science/cs-roadmap": "/knowledge/dictionary/computer-science",
  "/knowledge/dictionary/frontend/ui-design/threejs": "/knowledge/dictionary/frontend/graphics/threejs",
  "/knowledge/dictionary/frontend/ui-design/animated-icon": "/knowledge/dictionary/frontend/graphics/animated-icon",
  "/knowledge/dictionary/frontend/ui-design/webgl-shaders": "/knowledge/dictionary/frontend/graphics/webgl-shaders",
  "/knowledge/dictionary/frontend/mobile/react-native-interaction": "/knowledge/dictionary/frontend/mobile/react-native-basics",
  "/knowledge/dictionary/frontend/react/auth-flow": "/knowledge/dictionary/frontend/react/swr",
  "/knowledge/dictionary/life-and-learning/design/designers-learning-code": "/knowledge/dictionary/frontend/ui-design/designers-learning-code",
  "/knowledge/dictionary/frontend/vue/vuex": "/knowledge/dictionary/frontend/vuex",
  "/knowledge/dictionary/frontend/web/devtools-time-savers": "/knowledge/dictionary/frontend/javascript/arrays-and-objects",
  "/knowledge/dictionary/frontend/javascript/frontend-frameworks": "/knowledge/dictionary/frontend/frontend-frameworks",
  "/knowledge/dictionary/frontend/vue/quasar": "/knowledge/dictionary/frontend/quasar",
  "/knowledge/dictionary/frontend/javascript/react-vs-vue": "/knowledge/dictionary/frontend/react-vs-vue",
  "/knowledge/dictionary/life-and-learning/design/free-fonts": "/knowledge/dictionary/life-and-learning/presentation-design",
  "/knowledge/dictionary/life-and-learning/learning/memorization": "/knowledge/dictionary/life-and-learning/memorization",
  "/knowledge/dictionary/life-and-learning/design/presentation-design": "/knowledge/dictionary/life-and-learning/presentation-design",
  "/knowledge/dictionary/tools/blender/basics-isometric-room": "/knowledge/dictionary/tools/blender",
  "/knowledge/dictionary/tools/blender/furniture-modeling": "/knowledge/dictionary/tools/blender",
  "/knowledge/dictionary/tools/blender/material-uv-rigging": "/knowledge/dictionary/tools/blender",
  "/knowledge/dictionary/tools/analytics/ga4-setup": "/knowledge/dictionary/tools/ga4-setup",
  "/knowledge/dictionary/tools/analytics/segment": "/knowledge/dictionary/tools/segment",
  "/knowledge/dictionary/tools/vim-tips": "/knowledge/dictionary/tools/vim-and-neovim",
  "/knowledge/dictionary/frontend/web/html-lesser-known-attributes": "/knowledge/dictionary/frontend/web/html",
  "/knowledge/dictionary/frontend/javascript/template-literals": "/knowledge/dictionary/frontend/javascript/js-strings",
  "/knowledge/dictionary/frontend/javascript/typescript-learning": "/knowledge/dictionary/frontend/javascript/typescript-basics",
  "/knowledge/dictionary/computer-science/operating-system/kernel-types": "/knowledge/dictionary/computer-science/operating-system/os-overview",
  "/knowledge/dictionary/computer-science/network/tcp": "/knowledge/dictionary/computer-science/network/transport-layer",
  "/knowledge/dictionary/computer-science/c-programming/c-pointer-pitfalls": "/knowledge/dictionary/computer-science/c-programming/pointers-and-memory",
  "/knowledge/dictionary/computer-science/computer-architecture/digital-components": "/knowledge/dictionary/computer-science/computer-architecture/digital-logic-circuits",
  "/knowledge/dictionary/frontend/architecture/readable-code": "/knowledge/dictionary/frontend/architecture/code-readability",
  "/knowledge/dictionary/frontend/testing/jest-practices": "/knowledge/dictionary/frontend/testing/test-run-stages",
  "/knowledge/dictionary/frontend/accessibility/web-accessibility": "/knowledge/dictionary/frontend/accessibility",
  "/knowledge/dictionary/career/job-search/tech-interview-tips": "/knowledge/dictionary/career/job-search/interview-attitude",
  "/knowledge/dictionary/career/job-search/recruiter-outreach-email": "/knowledge/dictionary/career/job-search/resume-writing",
  "/knowledge/dictionary/life-and-learning/writing/online-writing": "/knowledge/dictionary/life-and-learning/writing/persuasive-writing",
  "/knowledge/dictionary/life-and-learning/tips/everyday-tech-tips": "/knowledge/dictionary/life-and-learning/life/life-tips",
  "/knowledge/dictionary/life-and-learning/tips/out-of-print-books": "/knowledge/dictionary/life-and-learning/life/out-of-print-books",
  "/knowledge/dictionary/ai-data/ai-native-engineer": "/knowledge/dictionary/ai-data/ai-accelerated-development",
  "/knowledge/dictionary/ai-data/recommender-system/recsys-case-studies": "/knowledge/dictionary/ai-data/recommender-system",
  "/knowledge/dictionary/backend/nestjs/provider-di": "/knowledge/dictionary/backend/nestjs/module",
  "/knowledge/dictionary/backend/nestjs/nestjs-middleware": "/knowledge/dictionary/backend/nestjs/interceptor-aop",
  "/knowledge/dictionary/backend/django/admin": "/knowledge/dictionary/backend/django/model-migration",
  "/knowledge/dictionary/backend/architecture/data-flow": "/knowledge/dictionary/backend/architecture/web-scalability-components",
  "/knowledge/dictionary/devops/rds-security-group": "/knowledge/dictionary/devops/aws-cloud-basics",
  "/knowledge/dictionary/frontend/javascript/clear-code-principles": "/knowledge/dictionary/computer-science/programming-languages/clean-code-functions-naming",
};

const nextConfig: NextConfig = {
  poweredByHeader: false,
  // The repo is public anyway, so shipping source maps costs nothing and makes production errors readable
  productionBrowserSourceMaps: true,
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
