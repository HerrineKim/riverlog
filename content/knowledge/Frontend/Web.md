---
title: "Web"
concept: "Web"
summary: "브라우저가 문서를 해석하고 서버와 상태를 주고받는 웹의 기본 구조."
tags: ["web", "browser", "html", "dom"]
source: mixed
---

웹 프론트엔드의 출발점은 브라우저다. 브라우저는 서버에서 받은 HTML을 파싱해 DOM을 만들고, CSS와 JavaScript를 적용해 화면을 그린다. 또 HTTP는 상태가 없기 때문에 쿠키·세션으로 사용자를 기억하며, 이 과정에서 CSRF·XSS 같은 보안 문제가 생긴다.

## 노트

- [프론트엔드의 등장 배경](/knowledge/dictionary/frontend/web/frontend-history): Web 1.0·2.0, img·CSS·JavaScript·AJAX의 등장, Flash의 퇴장, 프론트엔드·백엔드 분리
- [HTML](/knowledge/dictionary/frontend/web/html): 문서 구조, 요소와 속성, 시맨틱 태그, 표, 폼과 input, HTML5
- [시맨틱 HTML과 문서 구조](/knowledge/dictionary/frontend/web/semantic-html): 랜드마크 태그, h1~h6 제목 계층, 구현되지 않은 아웃라인 알고리즘, article과 section 고르기
- [HTML 입력 요소 치트시트](/knowledge/dictionary/frontend/web/html-input-types): input의 22가지 type, label·select·textarea·fieldset·datalist
- [더 나은 폼을 만드는 팁](/knowledge/dictionary/frontend/web/form-usability): 브라우저 기본 동작 존중, inputmode, 보이는 검증 메시지, 커서·포커스를 빼앗지 않는 입력 처리
- [DOM](/knowledge/dictionary/frontend/web/dom): 브라우저가 문서를 객체 트리로 표현하는 방식, DOM tree와 노드 종류, BOM
- [브라우저 렌더링 과정](/knowledge/dictionary/frontend/web/browser-rendering): DOM·CSSOM → 렌더 트리 → 레이아웃(리플로우) → 페인팅, 스크립트의 파싱 차단, 리렌더링 비용
- [SPA와 CSR·SSR](/knowledge/dictionary/frontend/web/spa-csr-ssr): 단일 페이지 애플리케이션과 렌더링 주체·시점에 따른 차이(CSR·SSR·SSG·ISR)
- [스트리밍 SSR](/knowledge/dictionary/frontend/web/streaming-ssr): Suspense 경계 단위로 HTML을 나눠 보내는 SSR, 선택적 hydration, 상태 코드·버퍼링 제약, 2026년 기준 유효성
- [웹 아키텍처의 다음 전환](/knowledge/dictionary/frontend/web/webs-next-transition): MPA → PEMPA → SPA → PESPA, 코드가 어디에 사는지로 본 아키텍처 변화
- [SEO 기초](/knowledge/dictionary/frontend/web/seo-basics): 크롤링·색인 흐름, robots.txt와 사이트맵, 메타 태그·canonical, 301·302 리다이렉트, 렌더링 방식
- [웹 성능 지표와 Lighthouse](/knowledge/dictionary/frontend/web/web-vitals): FCP·LCP·INP·CLS 기준값, 실험실·필드 데이터, Lighthouse, 지표별 개선법
- [프론트엔드 개발자가 알아야 할 지연 시간 숫자](/knowledge/dictionary/frontend/web/frontend-latency-numbers): 네트워크 왕복·파싱·프레임 예산·체감 한계의 ms 단위 표와 성능 원칙
- [웹 개발 시간을 줄이는 브라우저·JS 팁](/knowledge/dictionary/frontend/web/devtools-time-savers): designMode, 구조 분해 교환·Set 중복 제거·performance.now, debugger 문, console.table·dir
- [쿠키와 세션](/knowledge/dictionary/frontend/web/cookie-session): 상태 없는 HTTP에서 사용자를 기억하는 방법
- [웹 보안: CSRF와 XSS](/knowledge/dictionary/frontend/web/web-security): 대표적인 두 공격과 방어 방법
- [OAuth 2.0](/knowledge/dictionary/frontend/web/oauth2): 비밀번호 없이 권한을 위임하는 흐름(Authorization Code + PKCE), 토큰, OIDC와의 차이
- [이전 페이지 URL 알아내기](/knowledge/dictionary/frontend/web/previous-url): document.referrer, 라우터 state, 쿠키·sessionStorage
- [프론트엔드 웹 개발 용어집](/knowledge/dictionary/frontend/web/web-glossary): API부터 Yarn까지 61개 용어를 주제별로 묶고 자세한 노트로 연결
