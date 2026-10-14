---
title: "Frontend"
concept: "Frontend"
summary: "브라우저와 모바일 화면에서 사용자가 직접 만나는 UI를 만드는 분야의 지식 모음."
tags: ["frontend", "html", "css", "javascript", "react"]
source: mixed
date: "2026-10-13"
---

프론트엔드는 사용자가 직접 보고 조작하는 화면을 만드는 분야다. 브라우저가 HTML·CSS·JavaScript를 해석해 화면을 그리는 원리에서 출발해, React 같은 UI 라이브러리로 컴포넌트를 조립하고, Next.js로 렌더링 전략을 고르고, React Native로 모바일 앱까지 확장한다. 이 분야의 노트는 "웹 기초 → 언어 → 라이브러리 → 플랫폼 확장 → 품질(테스트)" 순서로 읽으면 자연스럽다.

## 하위 주제

| 주제 | 내용 |
| --- | --- |
| [Web](/knowledge/dictionary/frontend/web) | HTML·시맨틱 마크업, DOM과 브라우저 렌더링, SPA와 CSR/SSR/SSG/ISR·스트리밍 SSR, 웹 성능 지표(Core Web Vitals), SEO, PWA, 쿠키·세션·OAuth, CSRF·XSS 같은 웹 보안, 용어집 |
| [CSS](/knowledge/dictionary/frontend/css) | 문법과 단위, 선택자와 우선순위, 박스 모델, position, Flexbox |
| [JavaScript](/knowledge/dictionary/frontend/javascript) | 변수·타입, 연산자·제어문, 함수와 this, 배열·객체, 템플릿 리터럴, class, DOM 조작과 이벤트, 비동기(콜백·Promise·async/await), AJAX, 날짜 라이브러리 |
| [Vue](/knowledge/dictionary/frontend/vue/vuex) | Vuex 상태 관리(actions·mutations·state 변화 감지), Vue 2 EOL과 Pinia, [Quasar](Frontend/Vue/quasar.md) UI 프레임워크 |
| [React](/knowledge/dictionary/frontend/react) | JSX, 컴포넌트·Props, State·생명주기, Hooks, 폼·리스트·조건부 렌더링, Context, 스타일링, SWR·TanStack Query, Redux, 리렌더링 추적, react-hook-form·react-router·MUI 실무 패턴 |
| [Next.js](/knowledge/dictionary/frontend/next-js) | React 기반 프레임워크를 쓰는 이유(SSR·SSG와 SEO), App Router의 내비게이션과 데이터 가져오기, `proxy.ts`, `fetch` 캐싱과 `use cache`, 서버·클라이언트 컴포넌트 조합 규칙 |
| [Architecture](/knowledge/dictionary/frontend/architecture) | 의존성 관리, 프론트엔드의 SOLID 원칙, 폴더 구조의 진화, Feature-Sliced Design |
| [Mobile](/knowledge/dictionary/frontend/mobile) | 네이티브·하이브리드·크로스 플랫폼 비교, React Native 핵심과 실무 팁, CodePush OTA 업데이트, Flutter 구조와 Dart 문법, Swift Codable, Android 상태·Context·SDK 버전 |
| [Testing](/knowledge/dictionary/frontend/testing) | 테스트의 층(정적·단위·통합·E2E)과 테스트 대역, TDD, 험블 객체 패턴, 접근성 기반 UI 테스트, Vitest·Jest·Testing Library·Playwright |
| [UI Design](/knowledge/dictionary/frontend/ui-design) | 디자인 시스템과 공용 스킬 배포, Animated Icon, Three.js로 웹에서 3D 그리기 (AI로 디자인을 뽑는 프롬프트 기법은 [[ai-frontend-design-prompting|AI & Data]] 분야에 있다) |

학습 순서는 [프론트엔드 로드맵](/knowledge/dictionary/frontend/frontend-roadmap)에 정리했다.

- [프론트엔드 개발자의 업무 범위와 역량](Frontend/frontend-developer-role.md): 데이터 흐름으로 본 여섯 업무 영역, 퍼블리셔·백엔드·풀스택과의 경계, 잘하는 프론트엔드 개발자의 조건
- [기술 스택 고르기](Frontend/tech-stack-selection.md): 기술 수용 주기·캐즘·하이프 사이클, 스택을 고르는 다섯 기준, 범주로 트렌드 읽기, 레거시를 대하는 자세
