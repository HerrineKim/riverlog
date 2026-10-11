---
title: "Web"
concept: "Web"
summary: "브라우저가 문서를 해석하고 서버와 상태를 주고받는 웹의 기본 구조."
tags: ["web", "browser", "html", "dom"]
source: til
---

웹 프론트엔드의 출발점은 브라우저다. 브라우저는 서버에서 받은 HTML을 파싱해 DOM을 만들고, CSS와 JavaScript를 적용해 화면을 그린다. 또 HTTP는 상태가 없기 때문에 쿠키·세션으로 사용자를 기억하며, 이 과정에서 CSRF·XSS 같은 보안 문제가 생긴다.

## 노트

- [HTML](/knowledge/dictionary/frontend/web/html): 문서 구조, 요소와 속성, 시맨틱 태그, 표, 폼과 input, HTML5
- [DOM](/knowledge/dictionary/frontend/web/dom): 브라우저가 문서를 객체 트리로 표현하는 방식, DOM tree와 노드 종류, BOM
- [SPA와 CSR·SSR](/knowledge/dictionary/frontend/web/spa-csr-ssr): 단일 페이지 애플리케이션과 렌더링 주체에 따른 차이
- [쿠키와 세션](/knowledge/dictionary/frontend/web/cookie-session): 상태 없는 HTTP에서 사용자를 기억하는 방법
- [웹 보안: CSRF와 XSS](/knowledge/dictionary/frontend/web/web-security): 대표적인 두 공격과 방어 방법
