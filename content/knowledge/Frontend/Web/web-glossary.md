---
title: "프론트엔드 웹 개발 용어집"
concept: "Web Glossary"
summary: "API부터 Yarn까지 프론트엔드 개발에서 자주 듣는 용어 61개를 주제별로 묶어 한두 줄로 설명하고, 자세한 노트가 있는 용어는 그 노트로 연결했다."
tags: ["frontend", "web", "html", "css", "javascript"]
source: mixed
date: "2026-10-13"
sources: ["https://velog.io/@cookie004/61-frontend-web-development-buzz-words"]
---

> Tapajyoti Bose의 「61 Frontend Web Development Buzz Words Every Developer Should Have in Their Vocabulary」를 Minjeong Koo가 번역한 글(velog, 2022.08)의 용어 목록을 바탕으로, 설명을 보충하고 주제별로 다시 묶은 노트입니다.

원문은 알파벳순 목록이다. 이 노트는 **주제별**로 묶었다. 자세한 설명이 있는 용어는 「자세히」 칸의 노트로 이어진다.

## 웹의 기본 구조

| 용어 | 뜻과 보충 | 자세히 |
| --- | --- | --- |
| Browser (브라우저) | 웹 페이지를 받아 해석하고 그리는 프로그램. 크롬·엣지는 Blink, 사파리는 WebKit, 파이어폭스는 Gecko 엔진을 쓴다. 같은 코드도 엔진마다 다르게 보일 수 있다 | [[browser-rendering|브라우저 렌더링 과정]] |
| Server (서버) | 요청을 받아 HTML·데이터를 돌려주는 컴퓨터나 프로그램. 정적 파일을 주는 웹 서버와 로직을 실행하는 WAS로 나뉜다 | [[web-server-and-nginx|웹 서버, WAS, Nginx]] |
| Domain (도메인) | `example.com`처럼 사람이 읽는 웹사이트 주소. DNS가 IP 주소로 바꿔 준다 | [[dns|DNS]] |
| HTTP | 브라우저와 서버가 요청·응답을 주고받는 규약. 상태를 기억하지 않는다 | [[http|HTTP 프로토콜]] |
| HTTPS | TLS로 암호화한 HTTP. 요즘 브라우저는 HTTP 페이지에 「안전하지 않음」을 띄우고, 많은 웹 API가 HTTPS에서만 동작한다 | [[https|HTTPS와 TLS]] |
| API | 프로그램끼리 대화하는 약속. 웹 개발에서는 보통 서버의 REST·GraphQL API나 브라우저가 제공하는 Web API(fetch, localStorage 등)를 말한다 | [[rest-api|REST API 설계]] |
| Cookies (쿠키) | 서버가 브라우저에 저장시키고 이후 요청마다 돌려받는 작은 데이터. 로그인 유지와 추적에 쓴다. `HttpOnly`, `Secure`, `SameSite`로 보호한다 | [[cookie-session|쿠키와 세션]] |
| Cache (캐시) | 한 번 받은 파일을 저장해 두었다가 다시 쓰는 것. 브라우저 캐시, CDN 캐시, 서버 캐시가 층을 이룬다 | [[http-cache|HTTP 캐시]] |
| Redirects (리다이렉트) | 방문자를 다른 URL로 보내는 것. 301은 영구, 302는 임시 이동이다 | [[seo-basics|SEO 기초]] |
| SaaS | Software as a Service. 설치 없이 인터넷으로 구독해 쓰는 소프트웨어(슬랙, 노션, 피그마). 프론트엔드 입장에서는 대부분의 SaaS가 곧 복잡한 웹 앱이다 | |

## HTML

| 용어 | 뜻과 보충 | 자세히 |
| --- | --- | --- |
| HTML | 웹 페이지의 구조와 의미를 표현하는 마크업 언어 | [[html|HTML 기초와 HTML5]] |
| Opening/Closing Tags | `<p>`와 `</p>`처럼 요소를 감싸는 표시. `<img>`, `<input>` 같은 빈 요소는 닫는 태그가 없다 | [[html|HTML 기초와 HTML5]] |
| Attribute (속성) | 여는 태그에 `이름="값"`으로 적는 부가 정보. `id`, `class`, `href` 등. HTML 속성(초깃값)과 DOM 프로퍼티(현재 값)는 다를 수 있다. 예: 입력 후 `input.value`는 바뀌지만 `value` 속성은 그대로다 | [[html|HTML 기초와 HTML5]] |
| Semantic HTML | 모양이 아니라 의미에 맞는 태그를 쓰는 것 | [[semantic-html|시맨틱 HTML]] |
| Meta Tag | `<head>`에서 페이지 정보를 주는 태그. 설명, 뷰포트, 공유 미리보기 등 | [[seo-basics|SEO 기초]] |
| iFrame | 페이지 안에 다른 페이지를 넣는 요소. 지도·영상·결제창 임베드에 쓴다. 남의 페이지를 넣을 때는 `sandbox`로 권한을 줄이고, 내 페이지가 남에게 몰래 넣어지는 클릭재킹은 CSP `frame-ancestors`로 막는다 | [[html|HTML 기초와 HTML5]] |
| Favicon (파비콘) | 탭·북마크·검색 결과에 보이는 사이트 아이콘. `<link rel="icon" href="/favicon.svg">`로 지정한다. SVG를 쓰면 다크 모드 대응이 쉽고, iOS 홈 화면용은 `apple-touch-icon`을 따로 둔다 | |
| Fields (입력 필드) | 이름·이메일처럼 사용자가 값을 넣는 칸. 반드시 `<label>`을 연결한다 | [[html-input-types|HTML 입력 요소 치트시트]], [[form-usability|더 나은 폼]] |
| Navigation (내비게이션) | 다른 페이지로 가는 링크 묶음. `<nav>`로 감싸고 실제 `<a href>`를 쓴다 | [[semantic-html|시맨틱 HTML]] |
| Sitemap (사이트맵) | 사이트의 모든 페이지 목록. 검색 엔진용 `sitemap.xml`이 있다 | [[seo-basics|SEO 기초]] |

## CSS와 화면

| 용어 | 뜻과 보충 | 자세히 |
| --- | --- | --- |
| CSS Selectors | 스타일을 줄 요소를 고르는 패턴. 여러 규칙이 겹치면 특정성으로 승자를 정한다 | [[selectors|CSS 선택자와 우선순위]] |
| CSS Property | `color`, `margin`처럼 바꿀 스타일 항목. 값과 함께 선언 하나를 이룬다 | [[css-basics|CSS 기초]] |
| Hex | `#ff0000` 같은 16진수 색상 코드. 빨강·초록·파랑을 두 자리씩 00~ff로 쓴다 | [[css-basics|CSS 기초]] |
| Responsive Design | 어떤 화면 크기에서도 읽기 좋게 보이도록 만드는 방식 | [[responsive-design|반응형 디자인]] |
| Breakpoint | 레이아웃이 바뀌는 화면 너비 | [[responsive-design|반응형 디자인]] |
| Mobile-first | 작은 화면을 기본으로 쓰고 큰 화면 스타일을 덧붙이는 방식 | [[responsive-design|반응형 디자인]] |
| Resolution (해상도) | 화면·이미지의 픽셀 수. 고해상도 화면은 CSS 1px을 여러 물리 픽셀로 그린다 | [[responsive-design|반응형 디자인]] |
| Fold | 스크롤 없이 처음 보이는 영역의 경계 | [[responsive-design|반응형 디자인]] |
| SVG | 점·선·도형을 수식으로 기록하는 XML 기반 벡터 이미지. 확대해도 깨지지 않고 CSS로 색을 바꿀 수 있어 아이콘에 알맞다. 사진에는 JPEG·WebP 같은 비트맵이 맞다. 의미 있는 SVG에는 `role="img"`와 `aria-label`을 준다 | |
| Slider (슬라이더·캐러셀) | 이미지나 카드를 옆으로 넘기는 UI. 자동 재생은 읽기를 방해하고 접근성 문제가 많다. 멈춤 버튼과 키보드 조작을 넣는다. 범위 값을 고르는 `<input type="range">`도 슬라이더라고 부르니 구분한다 | [[html-input-types|HTML 입력 요소 치트시트]] |

## JavaScript와 도구

| 용어 | 뜻과 보충 | 자세히 |
| --- | --- | --- |
| JavaScript | 웹 페이지에 동작을 더하는 언어. 지금은 서버(Node.js)에서도 돈다 | [[variables-and-types|변수와 데이터 타입]] |
| TypeScript | 정적 타입을 더한 JavaScript의 상위 집합. 컴파일하면 JavaScript가 된다. 타입은 실행 중에는 사라지므로 외부 데이터 검증은 따로 한다 | [[typescript-coding-convention|TypeScript 코딩 컨벤션]] |
| DOM | 브라우저가 HTML을 객체 트리로 표현한 것. JavaScript는 DOM을 고쳐 화면을 바꾼다 | [[dom|DOM과 BOM]] |
| Promises | 비동기 작업의 미래 결과를 담는 객체. 대기·이행·거부 세 상태가 있고 `async/await`는 그 위의 문법이다 | [[callback-and-promise|콜백과 Promise]] |
| Libraries (라이브러리) | 가져다 쓰는 재사용 코드 묶음. 내 코드가 라이브러리를 **호출**한다. 패키지는 npm 같은 저장소로 배포하는 단위다 | [[frontend-dependency|프론트엔드 의존성 관리]] |
| Framework (프레임워크) | 앱의 뼈대와 규칙을 정해 주는 도구. 프레임워크가 내 코드를 **호출**한다(제어의 역전). React는 스스로를 라이브러리라 부르지만 Next.js와 함께 쓰면 프레임워크에 가깝다 | [[frontend-frameworks|React와 Vue 말고]] |
| Bootstrap | 트위터에서 2011년 공개한 CSS 프레임워크. 그리드와 미리 만든 컴포넌트를 클래스로 쓴다. 요즘은 Tailwind CSS 같은 유틸리티 방식이 많이 쓰인다. 「부트스트랩」은 프로젝트를 초기화한다는 일반 동사로도 쓴다 | |
| NPM | Node.js와 함께 설치되는 기본 패키지 매니저이자 패키지 저장소 | [[package-managers|자바스크립트 패키지 매니저]] |
| Yarn | 페이스북이 2016년 내놓은 npm 대안 패키지 매니저. 잠금 파일과 빠른 설치로 출발했다 | [[package-managers|자바스크립트 패키지 매니저]] |
| Git | 코드 변경 이력을 기록하는 분산 버전 관리 시스템 | [[git-basics|Git 기본 명령]] |
| GitHub | Git 저장소를 올려 두고 PR·이슈로 협업하는 서비스 | [[remote-github|원격 저장소와 GitHub]] |
| Minification (압축) | 공백·주석·긴 이름을 줄여 파일 크기를 줄이는 것. 빌드 도구가 자동으로 한다 | [[web-vitals|웹 성능 지표]] |
| Widgets (위젯) | 날씨·달력처럼 한 가지 기능을 하는 작은 UI 조각. FSD 아키텍처에서는 여러 기능을 묶은 독립 화면 블록을 뜻하는 층 이름이다 | [[feature-sliced-design|Feature-Sliced Design]] |
| WYSIWYG | 「보이는 대로 얻는다」. 서식이 적용된 모습을 보며 편집하는 에디터(블로그 글쓰기 창, 노션). `contenteditable`이나 TipTap·Lexical 같은 라이브러리로 만든다. 사용자가 쓴 HTML을 그대로 보여 주면 XSS가 생기므로 반드시 정제한다 | [[web-security|웹 보안]] |

## 렌더링과 성능

| 용어 | 뜻과 보충 | 자세히 |
| --- | --- | --- |
| SSR | 서버에서 HTML을 완성해 보내는 렌더링. 첫 화면과 SEO에 유리하다 | [[spa-csr-ssr|SPA와 CSR·SSR]] |
| FCP | 첫 콘텐츠가 그려지는 시간 | [[web-vitals|웹 성능 지표]] |
| LCP | 가장 큰 콘텐츠가 그려지는 시간. Core Web Vitals 중 하나 | [[web-vitals|웹 성능 지표]] |
| Lighthouse | 구글의 페이지 품질 검사 도구. 성능·접근성·권장사항·SEO 점수를 매긴다 | [[web-vitals|웹 성능 지표]] |
| Crawl (크롤링) | 검색 엔진 봇이 링크를 따라 페이지를 수집하는 것 | [[seo-basics|SEO 기초]] |
| SEO | 검색 결과에서 잘 발견되도록 콘텐츠와 구조를 다듬는 일 | [[seo-basics|SEO 기초]] |

## 개발 과정

| 용어 | 뜻과 보충 | 자세히 |
| --- | --- | --- |
| Application (애플리케이션) | 특정 기능을 하는 프로그램. 웹 앱은 설치 없이 브라우저에서 돈다. 정적인 문서 위주면 「웹사이트」, 상호작용이 많으면 「웹 앱」이라 부르는 편이다 | |
| Bug (버그) | 의도와 다르게 동작하는 결함 | |
| Debugging (디버깅) | 버그의 원인을 찾아 고치는 일. 재현 → 범위 좁히기 → 가설 검증 순서로 한다. 브라우저 DevTools의 중단점과 `debugger` 문이 기본 도구다 | [[devtools-time-savers|웹 개발 시간을 줄이는 팁]] |
| Deployment (배포) | 만든 코드를 사용자가 쓸 수 있는 환경에 올리는 일 | [[ci-cd|CI/CD]] |
| CI/CD | 코드를 합칠 때마다 자동으로 빌드·테스트(CI)하고 배포까지 이어 가는(CD) 자동화 | [[ci-cd|CI/CD]] |
| Documentation (문서화) | 코드와 시스템을 쓰고 고치는 방법을 적은 글. README, API 문서, 결정 기록(ADR)이 있다. 코드가 「무엇」을 말하면 문서는 「왜」를 말한다 | [[markdown|Markdown]] |
| MVP | Minimum Viable Product. 가설을 검증할 수 있는 가장 작은 제품. 「덜 만든 제품」이 아니라 「배우기 위해 가장 작게 만든 제품」이다 | [[project-process|새 서비스 개발 진행 순서]] |
| Wireframe (와이어프레임) | 색과 장식 없이 배치와 내용만 그린 화면 설계도. 와이어프레임 → 목업 → 프로토타입 순으로 구체화한다 | [[project-process|새 서비스 개발 진행 순서]] |

## UI와 UX

| 용어 | 뜻과 보충 | 자세히 |
| --- | --- | --- |
| UI | User Interface. 사용자가 보고 만지는 화면 요소 | [[design-system|디자인 시스템]] |
| UX | User Experience. 제품을 쓰며 겪는 경험 전체. 예쁜 UI가 아니라 「목표를 쉽게 이뤘나」로 판단한다 | [[form-usability|더 나은 폼을 만드는 팁]] |
| CTA | Call to Action. 「가입하기」, 「구매하기」처럼 행동을 유도하는 버튼·링크. 한 화면에 주된 CTA는 하나로 두고, 동사로 구체적으로 쓴다(「확인」보다 「주문하기」) | |

## 정리

- 용어 대부분은 웹의 세 층으로 나뉜다. 네트워크(HTTP, 캐시), 문서(HTML, CSS, DOM), 동작(JavaScript, 도구)이다.
- 낯선 용어를 만나면 「어느 층의 이야기인가」부터 따지면 빨리 자리를 잡는다.

관련 노트: [[frontend-roadmap|프론트엔드 학습 로드맵]], [[html|HTML 기초와 HTML5]], [[seo-basics|SEO 기초]], [[web-vitals|웹 성능 지표와 Lighthouse]]
