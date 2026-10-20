---
title: "프론트엔드 학습 로드맵"
concept: "Roadmap"
summary: "웹 표준(HTML·CSS·JavaScript·DOM)에서 TypeScript, React와 메타 프레임워크, 데이터 가져오기, 테스트·배포로 이어지는 프론트엔드 학습 순서, 필수와 관심·직무에 따른 선택 기술, 함께 쌓을 CS 기초, 공부하는 방법."
tags: ["frontend", "roadmap", "career"]
source: mixed
date: "2026-10-13"
sources: ["https://miryang.dev/blog/how-studied-frontend", "https://roadmap.sh/frontend", "https://www.zerocho.com"]
---

> MiryangJung의 「내가 프론트엔드를 학습한 방법」(2022.05), roadmap.sh의 Frontend 로드맵, 제로초(ZeroCho)의 프론트엔드 로드맵 다이어그램을 바탕으로 재구성한 노트다.

프론트엔드는 배울 것이 많아 보이지만, **앞 단계가 다음 단계의 토대**가 되도록 순서를 잡으면 수월하다. 라이브러리보다 웹 표준이 먼저이고, 프레임워크는 하나만 깊게 익힌 뒤 범주로 넓힌다.

## 학습 순서

```text
HTML → CSS → JavaScript → DOM·브라우저 → Git/GitHub → TypeScript
     → React → 메타 프레임워크(Next.js) → 데이터 가져오기(HTTP·API)
     → 테스트 → 빌드·배포
```

| 단계 | 핵심 질문 | 관련 노트 |
| --- | --- | --- |
| HTML | 문서의 구조와 의미를 어떻게 표현하는가. 시맨틱 태그와 접근성 | [[html\|HTML 기초와 HTML5]], [[semantic-html\|시맨틱 HTML과 문서 구조]] |
| CSS | 요소를 어떻게 배치하고 꾸미는가. Flexbox·Grid, 반응형 | [[css-basics\|CSS 기초]], [[flexbox\|Flexbox]], [[css-grid\|CSS Grid]], [[responsive-design\|반응형 디자인]] |
| JavaScript | 화면을 어떻게 동적으로 바꾸는가. 타입, 함수, 비동기 | [[variables-and-types\|변수와 데이터 타입]], [[async-await\|async/await]] |
| DOM·브라우저 | 브라우저는 문서를 어떤 구조로 들고 어떻게 그리는가 | [[dom\|DOM]], [[dom-manipulation\|DOM 조작]], [[browser-rendering\|브라우저 렌더링 과정]] |
| Git/GitHub | 코드를 어떻게 관리·협업하는가 | [[git-basics\|Git 기초]] |
| TypeScript | 타입으로 실수를 어떻게 컴파일 단계에서 잡는가. 사실상 필수다 | [[typescript-basics\|TypeScript 학습]] |
| React | UI를 컴포넌트와 상태로 어떻게 조립하는가 | [[jsx\|JSX]], [[hooks\|Hooks]] |
| 메타 프레임워크 | 라우팅·서버 렌더링·캐싱을 어떻게 고르는가 | [[nextjs\|Next.js를 쓰는 이유]], [[spa-csr-ssr\|SPA와 CSR·SSR]] |
| 데이터 가져오기 | 프론트가 데이터를 어디서 어떻게 받아오는가 | [[ajax\|AJAX]], [[tanstack-query\|TanStack Query]] |
| 테스트 | 동작을 어떻게 자동으로 확인하는가 | [[frontend-test-types\|프론트엔드 테스트의 종류와 도구]] |

- HTML(구조)·CSS(모양)·JavaScript(동작)는 하나씩 끝내기보다 **한 과목의 1·2·3교시처럼 함께** 익힌다. CSS에서는 Flexbox와 Grid를 꼭 짚는다.
- JavaScript는 문법을 넘어 실행 컨텍스트·[[scope-and-closures|스코프와 클로저]], [[prototype-and-inheritance|프로토타입]], [[callback-and-promise|Promise]], 콜 스택과 [[event-loop|이벤트 루프]]까지 이해해야 다음 단계가 막히지 않는다.
- CSS 프레임워크는 CSS를 익힌 뒤에 고른다. 유틸리티 클래스 방식의 Tailwind CSS가 주류다.
- 프레임워크는 React·Vue·Svelte·Angular 중 하나를 깊게 익힌다. 모두 "데이터로 컴포넌트를 렌더링한다"는 같은 범주라 하나를 알면 나머지는 빨리 배운다([[tech-stack-selection|기술 스택 고르기]]).
- 서버·DB는 "프론트엔드가 소비하는 데이터가 어디서 오는지"를 이해하는 수준에서 시작해도 충분하다.

## 필수와 선택

로드맵의 모든 칸을 다 배울 필요는 없다. **필수 줄기**를 먼저 세우고, 나머지는 관심 분야나 지원하는 회사의 스택에 맞춰 고른다.

| 영역 | 필수 | 관심·직무에 따라 |
| --- | --- | --- |
| 상태 관리 | `useState`·[[context\|Context]], 서버 데이터는 [[tanstack-query\|TanStack Query]] | Zustand(가장 가벼운 전역 스토어), [[redux\|Redux Toolkit]](레거시·대규모 코드베이스에서 여전히 많다), [[swr\|SWR]]. 고르는 기준은 [[react-state-management\|리액트 상태 관리]] |
| 서버 통신 | fetch·[[ajax\|AJAX]], 실시간이 필요하면 [[websocket\|WebSocket]]과 Socket.IO | GraphQL(Apollo·urql). 쓰는 팀이면 Redux 같은 전역 스토어 대신 GraphQL 클라이언트 캐시가 그 역할을 한다 |
| 메타 프레임워크 | [[nextjs\|Next.js]](App Router) | React Router 프레임워크 모드(옛 Remix) |
| 스타일링 | CSS, Tailwind CSS | CSS Modules, Emotion. styled-components는 유지보수 모드다([[styling\|스타일링]]) |
| 인증 | 쿠키·세션·토큰의 원리([[cookie-session\|쿠키와 세션]]) | Better Auth, Auth.js(2025년부터 Better Auth 팀이 관리하며 보안 패치 위주) |
| 테스트 | Vitest·Jest, Testing Library([[js-testing-best-practices\|테스트 모범 사례]]) | MSW(필수는 아니지만 강력 추천), Playwright |
| 플랫폼 확장 | | 앱: [[react-native-basics\|React Native]] + Expo, Flutter(Dart) ([[mobile-frameworks\|모바일 프레임워크]]). 데스크톱: Electron, 더 가벼운 Tauri |
| 레거시 | | jQuery는 오래된 사이트를 유지보수할 때만. JavaScript와 DOM을 알면 금방 읽힌다 |

## 함께 쌓을 CS 기초

비전공자라도 코딩 테스트와 실무 대화를 위해 다음은 따로 시간을 낸다.

| 과목 | 프론트엔드에서 특히 볼 것 | 관련 노트 |
| --- | --- | --- |
| 자료구조·알고리즘 | 스택·큐·트리·그래프·해시. 코딩 테스트 대비 | [[data-structures\|기초 자료구조]], [[coding-test\|코딩 테스트]] |
| 네트워크 | HTTP 요청·응답, 헤더·바디, 쿠키·토큰, OSI 7계층 | [[http\|HTTP]], [[osi-7-layer\|OSI 7계층]] |
| 데이터베이스 | CRUD, JOIN, PK·FK, 인덱스, 트랜잭션 | [[sql-basics\|SQL 기초]], [[transaction\|트랜잭션]] |
| 운영체제 | 프로세스·스레드, 리눅스 기본 | [[process-and-thread\|프로세스와 스레드]] |

프론트엔드 다음 단계로 백엔드를 넓히고 싶다면 Supabase 같은 BaaS로 인증·DB·API의 개념을 먼저 잡고, Node.js(Express·NestJS)로 직접 서버를 만든다.

## 공부하는 방법

순서보다 중요한 것은 **배운 것을 바로 코드로 옮기는 습관**이다.

| 방법 | 구체적으로 |
| --- | --- |
| 배우고 바로 만들기 | 강의 하나를 끝내면 한 페이지짜리라도 직접 만든다. 단계마다 작은 개인 프로젝트를 하나씩 남긴다 |
| 잘 만든 코드를 통째로 읽기 | 완성도 높은 오픈 소스 저장소와 PR을 파일 하나하나 열어 읽는다 |
| 에러로 배우기 | 기존 프로젝트에 TypeScript를 붙이고 쏟아지는 타입 에러를 직접 고친다 |
| 묻고 기록하기 | 검색하고 커뮤니티에 묻고, 답을 문서로 정리해 공유한다 |
| README 쓰기 | 프로젝트마다 무엇을 왜 했는지, 어떤 문제를 어떻게 풀었는지 남긴다 |
| AI 도구는 설명을 듣는 데 쓰기 | 생성된 코드를 그대로 붙이지 말고, 왜 그렇게 동작하는지 설명할 수 있을 때 받아들인다 |

### 기본 자료

| 단계 | 자료 |
| --- | --- |
| 웹 표준 전반 | [MDN Web Docs](https://developer.mozilla.org/ko/), [web.dev](https://web.dev/learn) |
| JavaScript | [모던 JavaScript 튜토리얼](https://ko.javascript.info/), 『모던 자바스크립트 Deep Dive』 |
| TypeScript | [TypeScript 핸드북](https://www.typescriptlang.org/docs/handbook/intro.html) |
| React·Next.js | [react.dev](https://react.dev/learn), [Next.js 공식 문서](https://nextjs.org/docs) |
| 전체 지도 | [roadmap.sh Frontend](https://roadmap.sh/frontend) |

## 정리

- 라이브러리보다 **웹 표준(HTML·CSS·JS·DOM)** 이해가 먼저다. React도 결국 DOM을 효율적으로 바꾸는 도구다.
- TypeScript는 선택이 아니라 기본기다. 프레임워크는 하나를 깊게, 나머지는 범주로 이해한다.
- 필수 줄기(HTML·CSS·JS·TS·React·Next.js·서버 데이터·테스트)를 먼저 세우고, 상태 관리 도구·GraphQL·앱·데스크톱은 관심과 직무에 맞춰 고른다.
- 단계마다 작은 프로젝트를 만들고, 잘 만든 코드를 읽고, 막힌 것과 푼 것을 기록한다.
- 낯선 용어는 [[web-glossary|프론트엔드 웹 개발 용어집]], [[backend-developer-roadmap|백엔드 개발자가 알아야 할 것]], [[frontend-career-tracks|프론트엔드 엔지니어의 세 가지 성장 트랙]]에서 자리를 잡는다.

관련 노트: [[frontend-developer-role|프론트엔드 개발자의 업무 범위와 역량]], [[tech-stack-selection|기술 스택 고르기]], [[web-glossary|프론트엔드 웹 개발 용어집]], [[backend-developer-roadmap|백엔드 개발자가 알아야 할 것]]
