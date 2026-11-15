---
title: "Web"
concept: "Web"
summary: "브라우저가 문서를 해석하고 서버와 상태를 주고받는 웹의 기본 구조."
tags: ["web", "browser", "html", "dom"]
source: mixed
date: "2026-10-13"
---

웹 프론트엔드의 출발점은 브라우저다. 브라우저는 서버에서 받은 HTML을 파싱해 DOM을 만들고, CSS와 JavaScript를 적용해 화면을 그린다. 또 HTTP는 상태가 없기 때문에 쿠키·세션으로 사용자를 기억하며, 이 과정에서 CSRF·XSS 같은 보안 문제가 생긴다.

## 노트

- [프론트엔드의 등장 배경](/knowledge/dictionary/frontend/web/frontend-history): Web 1.0·2.0, img·CGI·CSS·JavaScript·AJAX의 등장, Flash와 RIA의 흥망, 프론트엔드·백엔드 분리, React 이후 생태계 흐름
- [HTML](/knowledge/dictionary/frontend/web/html): 문서 구조, DOCTYPE과 렌더링 모드, 요소와 속성, data-*, 속성 하나로 끝나는 기능(enterkeyhint·download·loading·integrity·popover 등), 시맨틱 태그, 표, form 속성, HTML5
- [시맨틱 HTML과 문서 구조](/knowledge/dictionary/frontend/web/semantic-html): 랜드마크 태그, h1~h6 제목 계층, 구현되지 않은 아웃라인 알고리즘, article과 section 고르기
- [문서 head와 메타데이터](/knowledge/dictionary/frontend/web/html-head-metadata): charset·viewport·title, 요소 순서, link rel 종류, meta의 http-equiv·name, Open Graph와 SEO의 관계, base, 웹 앱 매니페스트
- [텍스트 의미 요소와 문자 참조](/knowledge/dictionary/frontend/web/html-text-elements): blockquote·q·cite, em·strong·mark·i·b·u·s, code·kbd·samp·data·time, abbr·dfn·ruby, br·hr·wbr, 문자 참조
- [링크와 내비게이션 마크업](/knowledge/dictionary/frontend/web/html-links-navigation): href 형식, download, target과 noopener·이름 붙은 맥락, rel·ping, 건너뛰기 링크·목차·브레드크럼·전역 내비게이션
- [목록과 표 마크업](/knowledge/dictionary/frontend/web/html-lists-tables): ul·ol·dl 규칙과 번호 속성, 표 구조·scope·headers·colspan, colgroup·col, 표 CSS
- [이미지·오디오·비디오 임베드](/knowledge/dictionary/frontend/web/html-media-elements): img의 alt·width·height·loading, figure, video·audio·source·track, 배경 영상과 사용자 정의 컨트롤
- [웹 컴포넌트: template·slot·Shadow DOM](/knowledge/dictionary/frontend/web/web-components): 커스텀 요소, 슬롯, 스타일 캡슐화, :host·::slotted·::part, 선언적 Shadow DOM
- [포커스 속성과 details·dialog](/knowledge/dictionary/frontend/web/html-interactive-elements): tabindex·autofocus·disabled·inert 비교, details/summary, dialog 모달·닫기·포커스
- [HTML 입력 요소 치트시트](/knowledge/dictionary/frontend/web/html-input-types): input의 22가지 type, label·select·textarea·fieldset·datalist
- [더 나은 폼을 만드는 팁](/knowledge/dictionary/frontend/web/form-usability): 브라우저 기본 동작 존중, inputmode, 보이는 검증 메시지, 커서·포커스를 빼앗지 않는 입력 처리
- [폼 제출과 데이터 전송](/knowledge/dictionary/frontend/web/form-submission): form이 주는 기본 기능, GET·POST 고르기, 제출 버튼과 type="button" 함정, FormData·fetch 점진적 향상, 보안·개인정보와 스팸 막기
- [제약 검증: required·pattern·ValidityState](/knowledge/dictionary/frontend/web/constraint-validation): 검증 속성과 validity 플래그, pattern의 v 플래그, :user-invalid, setCustomValidity·reportValidity, 오류를 띄우는 시점
- [자동 완성과 autocomplete 토큰](/knowledge/dictionary/frontend/web/form-autofill): 브라우저의 칸 인식, 토큰 순서 문법, 이름·주소·카드·비밀번호 토큰표, autocomplete="off"의 한계, :autofill
- [로그인·가입 폼과 인증 입력](/knowledge/dictionary/frontend/web/sign-in-sign-up-forms): 비밀번호 관리자 대응, 비밀번호 보기 버튼, NIST 비밀번호 규칙, 패스키 자동 완성, one-time-code·WebOTP, 계정 설정
- [결제·주소 폼](/knowledge/dictionary/frontend/web/payment-address-forms): 비회원 결제와 결제 흐름, 카드 칸, 한 칸 이름, 주소·우편번호, 국제화
- [폼 스타일링](/knowledge/dictionary/frontend/web/form-styling): 글자 크기·테두리·탭 영역 기준, select와 base-select, 체크박스·라디오 숨김 기법, accent-color, field-sizing
- [DOM](/knowledge/dictionary/frontend/web/dom): 브라우저가 문서를 객체 트리로 표현하는 방식, DOM tree와 노드 종류, BOM
- [Intersection Observer와 관찰자 API](/knowledge/dictionary/frontend/web/intersection-observer): 스크롤 이벤트 대신 보이는지 묻기, root·rootMargin·threshold, 무한 스크롤·지연 로딩 패턴, ResizeObserver·MutationObserver
- [브라우저 아키텍처: 다중 프로세스, 내비게이션, 렌더러 스레드, 입력 처리](/knowledge/dictionary/frontend/web/browser-architecture): 프로세스 분리와 사이트 격리, 내비게이션과 커밋, 메인·컴포지터·래스터 스레드, 입력 이벤트와 passive 리스너
- [브라우저 렌더링 과정](/knowledge/dictionary/frontend/web/browser-rendering): 브라우저 구성 요소, DOM·CSSOM → 렌더 트리 → 레이아웃(리플로우) → 페인팅, 스크립트·CSS의 차단, 강제 동기 레이아웃, 리렌더링 비용
- [스크립트·스타일 로딩 순서와 점진적 렌더링](/knowledge/dictionary/frontend/web/script-loading): script·async·defer·module의 실행 시점, CSS는 head·스크립트는 defer인 이유와 예외, FOUC, 점진적 렌더링 기법
- [반응형 이미지: srcset·sizes와 picture](/knowledge/dictionary/frontend/web/responsive-images): 크기만 다르면 srcset·sizes, 자르기·형식 대체는 picture, sizes 근삿값, 이미지 CDN·CMS 자동화, sizes 근삿값·sizes="auto", 픽셀 밀도, picture 규칙
- [웹 이미지 형식: 벡터·래스터와 GIF·PNG·JPEG·WebP·AVIF·JPEG XL](/knowledge/dictionary/frontend/web/image-formats): SVG와 래스터 구분, 무손실·손실 압축, 형식별 특징과 브라우저 지원, 형식 고르는 흐름
- [이미지 압축과 인코딩 자동화](/knowledge/dictionary/frontend/web/image-compression): JPEG·WebP 압축 원리, 품질 값 다루기, Sharp·Eleventy·WordPress로 형식·크기 자동 생성
- [이미지 CDN과 Accept 헤더 협상](/knowledge/dictionary/frontend/web/image-cdn): URL 매개변수 변환, Accept·Content-Type 협상, Vary: Accept 캐시, picture+type과 비교
- [브라우저 기본 동작을 존중하기](/knowledge/dictionary/frontend/web/respect-browser-defaults): 스크롤바·스크롤·강조색·글자 크기·포커스·클립보드·방문 기록을 덮어쓰지 않는 이유와 원칙
- [SPA와 CSR·SSR](/knowledge/dictionary/frontend/web/spa-csr-ssr): 단일 페이지 애플리케이션과 렌더링 주체·시점에 따른 차이(CSR·SSR·SSG·ISR)
- [클라이언트 사이드 라우팅: 해시, History API, Navigation API](/knowledge/dictionary/frontend/web/client-side-routing): hashchange·pushState·popstate, 새로고침 때 서버의 index.html 폴백, Navigation API
- [웹 개발에 대한 이상한 믿음들](/knowledge/dictionary/frontend/web/web-dev-myths): 브라우저 엔지니어·표준 제정자·개발자가 웹을 잘 안다는 믿음, SPA·MPA·JS 없는 사이트·빌드 단계에 대한 단정, 내 웹이 웹 전체는 아니다
- [웹 표준은 어떻게 만들어지나: W3C·WHATWG·WICG](/knowledge/dictionary/frontend/web/web-standards-process): 권고안 트랙과 성숙 단계, 리빙 스탠더드, 인큐베이션, TC39 단계, 표준·구현 상태 확인하는 곳
- [정적 사이트 생성기와 Jamstack](/knowledge/dictionary/frontend/web/static-site-generator): 빌드 때 HTML 만들기, 도구 고르기(Eleventy·Hugo·Astro·Next.js), WordPress에서 옮기는 흐름
- [AMP: 규칙으로 빠르게 만드는 모바일 페이지](/knowledge/dictionary/frontend/web/amp-pages): HTML 제약·전용 런타임·캐시 CDN, 비판과 Core Web Vitals로 옮겨 간 흐름
- [스트리밍 SSR](/knowledge/dictionary/frontend/web/streaming-ssr): Suspense 경계 단위로 HTML을 나눠 보내는 SSR, 선택적 hydration, 상태 코드·버퍼링 제약, React 18 이후의 발전
- [웹 아키텍처의 다음 전환](/knowledge/dictionary/frontend/web/webs-next-transition): MPA → PEMPA → SPA → PESPA, 코드가 어디에 사는지로 본 아키텍처 변화
- [SEO 기초](/knowledge/dictionary/frontend/web/seo-basics): 크롤링·색인 흐름, robots.txt와 사이트맵, 메타 태그·canonical, 301·302 리다이렉트, 렌더링 방식
- [다국어 페이지: lang·hreflang과 국제화](/knowledge/dictionary/frontend/web/multilingual-pages): 언어별 URL, Accept-Language와 언어 선택기, lang·dir·translate·hreflang, 문자열 연결 금지·Intl·텍스트 길이·RTL 같은 i18n 주의점
- [프론트엔드 출시 전 체크리스트](/knowledge/dictionary/frontend/web/frontend-launch-checklist): head·HTML·CSS·이미지·폰트·JS·보안·성능·접근성·SEO 점검표와 자동화
- [프론트엔드 성능 최적화: 언제, 무엇을](/knowledge/dictionary/frontend/web/frontend-performance-strategy): 측정·p95 기준·트레이드오프, 초기 로딩의 세 원인(대역폭·지연 시간·JS 실행), 실제 성능과 체감 성능, 파생 상태와 리렌더링 범위
- [웹 성능 지표와 Lighthouse](/knowledge/dictionary/frontend/web/web-vitals): FCP·LCP·INP·CLS 기준값, LCP 후보·INP 세 구간·CLS 세션 창, 실험실·필드 데이터와 web-vitals 라이브러리, Lighthouse
- [성능 측정 API: Navigation·Resource·User Timing과 PerformanceObserver](/knowledge/dictionary/frontend/web/performance-timing-apis): 성능 항목 읽기, mark·measure, buffered 구독, Timing-Allow-Origin
- [TTFB 줄이기: 리디렉션·HTML 캐시·압축·CDN](/knowledge/dictionary/frontend/web/ttfb-optimization): 리디렉션 체인, 짧은 캐시와 ETag 재검증, Server-Timing, Brotli 정적·동적 압축, CDN 엣지
- [LCP 최적화: 네 구간으로 나눠 줄이기](/knowledge/dictionary/frontend/web/lcp-optimization): TTFB·로드 지연·로드 시간·렌더 지연, HTML에서 발견되게, fetchpriority, 지연 로딩 금지, 막는 CSS·JS 걷어 내기
- [INP 최적화: 긴 작업 쪼개기와 양보](/knowledge/dictionary/frontend/web/inp-optimization): 입력 지연·처리 시간·표시 지연별 처방, scheduler.yield, 레이아웃 스래싱, DOM 크기와 content-visibility
- [CLS 최적화: 자리를 먼저 잡기](/knowledge/dictionary/frontend/web/cls-optimization): 이동 찾기, 이미지 크기·aspect-ratio, 광고·늦은 UI, transform 애니메이션, 폰트 지표 보정, bfcache
- [리소스 힌트와 미리 불러오기: preconnect·preload·fetchpriority·Speculation Rules](/knowledge/dictionary/frontend/web/resource-hints): 연결·발견·우선순위 힌트와 두 번 받기 실수, prefetch·prerender, 서비스 워커 프리캐싱
- [웹 폰트 성능 최적화: 발견·내려받기·렌더링](/knowledge/dictionary/frontend/web/web-font-performance): preload·인라인 @font-face, 자체 호스팅, WOFF2, 서브셋과 unicode-range, font-display 비교
- [동영상 성능: 형식·poster·자동 재생·임베드](/knowledge/dictionary/frontend/web/video-performance): 컨테이너·코덱과 source 순서, FFmpeg, GIF 대체 자동 재생, preload·poster와 LCP
- [지연 로딩: 이미지·iframe·퍼사드](/knowledge/dictionary/frontend/web/lazy-loading): loading="lazy"와 첫 화면 예외, 무거운 임베드의 퍼사드, IntersectionObserver 기반 라이브러리
- [자바스크립트 코드 분할](/knowledge/dictionary/frontend/web/code-splitting): 시작 JS와 TBT·INP, 커버리지, 동적 import()와 번들러 청크, 캐시·압축·평가의 균형
- [웹 워커로 메인 스레드 비우기](/knowledge/dictionary/frontend/web/web-workers): Worker와 postMessage, DOM 없는 스레드의 제약, 무거운 가져오기·파싱 옮기기
- [WebAssembly: 브라우저의 두 번째 언어](/knowledge/dictionary/frontend/web/webassembly): JS 대비 줄어드는 단계, Module·Memory·Table·Instance와 JS API, 툴체인, Wasm 2.0·3.0, WASI
- [프론트엔드 개발자가 알아야 할 지연 시간 숫자](/knowledge/dictionary/frontend/web/frontend-latency-numbers): 네트워크 왕복·파싱·프레임 예산·체감 한계의 ms 단위 표와 성능 원칙
- [PWA와 서비스 워커 캐시 전략](/knowledge/dictionary/frontend/web/pwa-service-worker): HTTPS·매니페스트·서비스 워커, 2026년 지원 범위, 시작 방법·체크리스트, 사이트 원형별 이점, 미디어 중요도별 캐시와 캐시 정리, PWA 하위 노트 안내
- [서비스 워커 등록·스코프·생명주기와 업데이트](/knowledge/dictionary/frontend/web/service-worker-lifecycle): 등록·스코프 규칙, install·activate·waiting, skipWaiting·clients.claim, 수명, 브라우저별 디버깅
- [서비스 워커 캐싱과 응답 전략](/knowledge/dictionary/frontend/web/service-worker-caching): Cache Storage API, 프리캐시, fetch·respondWith, 다섯 가지 캐시 전략, 불투명 응답, Workbox, 서비스 워커 인클루드
- [PWA 오프라인 데이터와 저장소 관리](/knowledge/dictionary/frontend/web/pwa-offline-storage): Cache Storage vs IndexedDB, idb, 출처 단위 할당량, eviction과 persist(), 백그라운드 동기화
- [웹 앱 매니페스트](/knowledge/dictionary/frontend/web/web-app-manifest): 필드, id·start_url·scope, 마스크 가능 아이콘, display_override, shortcuts, iOS 전용 link·meta, 메타데이터 갱신 시점
- [PWA 설치와 설치 유도](/knowledge/dictionary/frontend/web/pwa-installation): Chrome 설치 기준, 플랫폼별 설치(WebAPK·iOS 홈 화면·Safari Dock·Firefox 작업 표시줄), beforeinstallprompt, display-mode 감지, 스토어 배포
- [PWA 앱 경험 설계와 창 관리](/knowledge/dictionary/frontend/web/pwa-app-experience): 미니 모드, display-mode CSS, 창 제목, 앱다운 CSS·safe area, 앱 안 브라우저와 OAuth, 창·화면 API
- [PWA 기능과 OS 통합](/knowledge/dictionary/frontend/web/pwa-os-integration): 웹 푸시(iOS 조건·선언적 웹 푸시), 배지, 공유·공유 대상, 파일 시스템·파일 핸들러, 프로토콜 핸들러, Fugu·오리진 트라이얼
- [지속 가능한 웹 디자인](/knowledge/dictionary/frontend/web/sustainable-web-design): 전송량·CPU로 어림하는 에너지 사용, 요청·기능 덜어내기, 서버 캐시와 친환경 호스팅
- [쿠키와 세션](/knowledge/dictionary/frontend/web/cookie-session): 상태 없는 HTTP에서 사용자를 기억하는 방법
- [Web Storage: localStorage와 sessionStorage](/knowledge/dictionary/frontend/web/web-storage): 키-값 API, JSON 직렬화와 복원, storage 이벤트로 탭 동기화, 용량·예외, 토큰을 넣지 않는 이유
- [IndexedDB](/knowledge/dictionary/frontend/web/indexeddb): 버전과 upgradeneeded, 객체 저장소·인덱스·커서, 자동 커밋 트랜잭션의 함정, 탭 간 버전 충돌, idb 대응표
- [창과 프레임: 팝업, iframe, postMessage](/knowledge/dictionary/frontend/web/windows-and-frames): 동일 출처와 창 접근, sandbox, postMessage·BroadcastChannel, COOP, 클릭재킹 방어
- [브라우저 실시간 통신: 롱 폴링, SSE, WebSocket 클라이언트](/knowledge/dictionary/frontend/web/browser-realtime-apis): 롱 폴링 루프, EventSource 형식·재연결, fetch 스트림으로 SSE 읽기, WebSocket 버퍼·종료 코드·재연결
- [미디어 캡처와 Web Audio API](/knowledge/dictionary/frontend/web/media-capture-web-audio): MediaStream·트랙, getUserMedia·getDisplayMedia, AudioContext 노드 그래프, 예약 재생과 자동 재생 정책
- [권한 모델과 기기 API](/knowledge/dictionary/frontend/web/device-permission-apis): Permissions API와 권한 상태, 위치·기기 방향·게임패드·음성 합성과 인식·진동
- [웹 보안: CSRF와 XSS](/knowledge/dictionary/frontend/web/web-security): 대표적인 두 공격과 방어 방법
- [데이터 최소화와 프라이버시 실천](/knowledge/dictionary/frontend/web/privacy-data-minimization): 수집하지 않기·구간화·무작위 응답·차등 프라이버시, 보존 기한과 Clear-Site-Data, 수집 이유 설명, 데이터 목록 문서화와 감사
- [서드파티와 프라이버시](/knowledge/dictionary/frontend/web/third-party-privacy): 서드파티가 받는 정보, 기술·비기술 감사, 공유 링크·퍼사드·nocookie 임베드, Referrer-Policy·Permissions-Policy·CSP Report-Only, GPC
- [서드파티 쿠키와 브라우저 추적 방지](/knowledge/dictionary/frontend/web/browser-tracking-protection): 사파리 ITP·파이어폭스 Total Cookie Protection·크롬의 폐지 철회와 Privacy Sandbox 정리, CHIPS(Partitioned), Storage Access API
- [브라우저 지문 채취와 User-Agent 축소](/knowledge/dictionary/frontend/web/browser-fingerprinting): 수동·능동 지문과 엔트로피, 브라우저의 대응, UA 축소와 Client Hints, 넓은 환경 테스트
- [프라이버시를 위한 암호화: 전송·저장·종단 간](/knowledge/dictionary/frontend/web/privacy-encryption): HTTPS·301·HSTS·upgrade-insecure-requests, 저장 데이터 암호화, Web Crypto와 URL 조각 키로 하는 종단 간 암호화
- [HTTPS 전환](/knowledge/dictionary/frontend/web/https-migration): DV·OV·EV와 인증서 범위, ACME 자동 갱신, 혼합 콘텐츠·301·HSTS 체크리스트
- [OAuth 2.0](/knowledge/dictionary/frontend/web/oauth2): 비밀번호 없이 권한을 위임하는 흐름(Authorization Code + PKCE), 토큰, OIDC와의 차이
- [이전 페이지 URL 알아내기](/knowledge/dictionary/frontend/web/previous-url): document.referrer, 라우터 state, 쿠키·sessionStorage
- [구조화된 콘텐츠와 기계가 읽는 웹](/knowledge/dictionary/frontend/web/structured-content): 음성 비서·검색·AI 답변이 콘텐츠를 합치고 추론하는 방식, 시맨틱 HTML과 schema.org JSON-LD, CMS 콘텐츠 모델
- [브라우저 안 빌드·프리뷰 환경](/knowledge/dictionary/frontend/web/in-browser-preview-runtime): AI가 만든 화면을 바로 띄우는 런타임, 정책은 API 프록시·화면은 AI, 가상 FS + esbuild-wasm + 패키지 조합 해시 + import map
- [프론트엔드 웹 개발 용어집](/knowledge/dictionary/frontend/web/web-glossary): API부터 Yarn까지 70여 개 용어를 주제별로 묶고 자세한 노트로 연결
