---
title: "Web"
concept: "Web"
summary: "브라우저가 문서를 해석하고 서버와 상태를 주고받는 웹의 기본 구조."
tags: ["web", "browser", "html", "dom"]
source: mixed
---

웹 프론트엔드의 출발점은 브라우저다. 브라우저는 서버에서 받은 HTML을 파싱해 DOM을 만들고, CSS와 JavaScript를 적용해 화면을 그린다. 또 HTTP는 상태가 없기 때문에 쿠키·세션으로 사용자를 기억하며, 이 과정에서 CSRF·XSS 같은 보안 문제가 생긴다.

## 노트

- [HTML](/knowledge/dictionary/frontend/web/html): 문서 구조, 요소와 속성, 시맨틱 태그, 표, 폼과 input, HTML5
- [HTML 입력 요소 치트시트](/knowledge/dictionary/frontend/web/html-input-types): input의 22가지 type, label·select·textarea·fieldset·datalist
- [DOM](/knowledge/dictionary/frontend/web/dom): 브라우저가 문서를 객체 트리로 표현하는 방식, DOM tree와 노드 종류, BOM
- [SPA와 CSR·SSR](/knowledge/dictionary/frontend/web/spa-csr-ssr): 단일 페이지 애플리케이션과 렌더링 주체에 따른 차이
- [웹 아키텍처의 다음 전환](/knowledge/dictionary/frontend/web/webs-next-transition): MPA → PEMPA → SPA → PESPA, 코드가 어디에 사는지로 본 아키텍처 변화
- [프론트엔드 개발자가 알아야 할 지연 시간 숫자](/knowledge/dictionary/frontend/web/frontend-latency-numbers): 네트워크 왕복·파싱·프레임 예산·체감 한계의 ms 단위 표와 성능 원칙
- [쿠키와 세션](/knowledge/dictionary/frontend/web/cookie-session): 상태 없는 HTTP에서 사용자를 기억하는 방법
- [웹 보안: CSRF와 XSS](/knowledge/dictionary/frontend/web/web-security): 대표적인 두 공격과 방어 방법
- [OAuth 2.0](/knowledge/dictionary/frontend/web/oauth2): 비밀번호 없이 권한을 위임하는 흐름(Authorization Code + PKCE), 토큰, OIDC와의 차이
- [이전 페이지 URL 알아내기](/knowledge/dictionary/frontend/web/previous-url): document.referrer, 라우터 state, 쿠키·sessionStorage
