---
title: "React"
concept: "React"
summary: "상태가 바뀌면 필요한 부분만 다시 그리는, 컴포넌트 기반 UI 라이브러리."
tags: ["react", "frontend", "javascript"]
source: mixed
---

React는 사용자 인터페이스를 만들기 위한 JavaScript 라이브러리다. 바닐라 JS에서는 HTML 요소를 먼저 만들고 JS로 찾아서 바꿨다면, React에서는 **JS(JSX)로 화면을 선언**하고 상태(state)가 바뀌면 React가 알아서 필요한 최소 부분만 다시 그린다. 이벤트가 많아질수록 복잡해지는 DOM 조작을 React가 대신 맡아 주는 셈이다. 국내 프론트엔드 채용에서도 가장 널리 쓰이는 기술이며, 정적 타입을 더하는 TypeScript와 SSR을 지원하는 Next.js가 흔히 함께 쓰인다.

## 노트

### 기본 개념
- [JSX와 엘리먼트 렌더링](/knowledge/dictionary/frontend/react/jsx): JSX 문법 규칙, Babel 변환, React 엘리먼트와 불변성
- [컴포넌트와 Props](/knowledge/dictionary/frontend/react/components-and-props): 함수 컴포넌트, props 전달, PropTypes
- [State](/knowledge/dictionary/frontend/react/state): useState, 함수형 업데이트, 불변성, State 끌어올리기
- [생명주기](/knowledge/dictionary/frontend/react/lifecycle): 클래스 컴포넌트의 마운트·업데이트·언마운트와 useEffect 대응
- [Hooks](/knowledge/dictionary/frontend/react/hooks): 규칙, useEffect, useCallback·useMemo·React.memo, 커스텀 훅

### 화면 구성
- [이벤트 처리](/knowledge/dictionary/frontend/react/react-events)
- [조건부 렌더링](/knowledge/dictionary/frontend/react/conditional-rendering)
- [리스트와 Key](/knowledge/dictionary/frontend/react/lists-and-keys)
- [폼](/knowledge/dictionary/frontend/react/forms): 제어 컴포넌트, 여러 input, 단위 변환기 예제
- [합성](/knowledge/dictionary/frontend/react/composition): children, 특수화, 상속 대신 합성
- [Context](/knowledge/dictionary/frontend/react/context): props drilling 없이 값 공유, Flux 패턴
- [스타일링](/knowledge/dictionary/frontend/react/styling): CSS Modules, styled-components, emotion, 인라인 스타일

### 실전
- [개발 환경과 빌드 도구](/knowledge/dictionary/frontend/react/tooling): CRA, webpack, Babel, TypeScript, ESLint·Prettier, 환경 변수
- [SWR로 데이터 가져오기](/knowledge/dictionary/frontend/react/swr): fetcher, mutate, useSWRInfinite
- [회원가입·로그인 구현](/knowledge/dictionary/frontend/react/auth-flow): useInput 훅, axios, 로그인 상태에 따른 리다이렉트
- [실시간 채팅 앱 구조](/knowledge/dictionary/frontend/react/realtime-chat-app): 폴더 구조, REST + WebSocket 설계, optimistic UI, 무한 스크롤
- [리렌더링 원인 추적하기](/knowledge/dictionary/frontend/react/re-rendering): memo가 안 먹힐 때, useQuery의 렌더링, DevTools 하이라이트·Profiler
- [react-hook-form과 MUI Select](/knowledge/dictionary/frontend/react/react-hook-form): Controller, 빈 값 처리, 수정 폼 초기값
- [react-router로 레이아웃과 Breadcrumbs 만들기](/knowledge/dictionary/frontend/react/react-router-layout): URL 규칙, Outlet, 경로 기반 Breadcrumbs
- [MUI Dialog로 삭제 확인 창 만들기](/knowledge/dictionary/frontend/react/confirm-dialog): 재사용 다이얼로그, 위험한 버튼 디자인

## 참고 자료

인프런 「처음 만나는 리액트」·「Slack 클론 코딩」, 노마드코더 「ReactJS로 영화 웹 서비스 만들기」, 생활코딩 React(2022), React 공식 문서를 개념별로 합쳐 정리했다.
