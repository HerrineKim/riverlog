---
title: "React"
concept: "React"
summary: "상태가 바뀌면 필요한 부분만 다시 그리는, 컴포넌트 기반 UI 라이브러리."
tags: ["react", "frontend", "javascript"]
source: mixed
date: "2026-10-13"
---

React는 사용자 인터페이스를 만들기 위한 JavaScript 라이브러리다. 바닐라 JS에서는 HTML 요소를 먼저 만들고 JS로 찾아서 바꿨다면, React에서는 **JS(JSX)로 화면을 선언**하고 상태(state)가 바뀌면 React가 알아서 필요한 최소 부분만 다시 그린다. 이벤트가 많아질수록 복잡해지는 DOM 조작을 React가 대신 맡아 주는 셈이다. 정적 타입을 더하는 TypeScript, 서버 컴포넌트·SSR을 지원하는 Next.js와 흔히 함께 쓰인다. React 19에서 폼 Actions·`use`·ref as prop이 들어왔고, React Compiler가 메모이제이션을 자동으로 넣어 준다.

## 노트

### 기본 개념
- [JSX와 엘리먼트 렌더링](/knowledge/dictionary/frontend/react/jsx): JSX 문법 규칙, Babel 변환, React 엘리먼트와 불변성
- [컴포넌트와 Props](/knowledge/dictionary/frontend/react/components-and-props): 함수 컴포넌트, props 전달, TypeScript로 props 타입 정하기, ref as prop
- [State](/knowledge/dictionary/frontend/react/state): useState, 함수형 업데이트, 불변성, State 끌어올리기
- [생명주기](/knowledge/dictionary/frontend/react/lifecycle): 마운트·업데이트·언마운트를 useEffect로 다루기, StrictMode 이중 실행, 클래스 메서드 대응표
- [Hooks](/knowledge/dictionary/frontend/react/hooks): 규칙, useEffect·useEffectEvent, 메모이제이션과 React Compiler, 커스텀 훅

### 화면 구성
- [이벤트 처리](/knowledge/dictionary/frontend/react/react-events)
- [조건부 렌더링](/knowledge/dictionary/frontend/react/conditional-rendering)
- [리스트와 Key](/knowledge/dictionary/frontend/react/lists-and-keys): map 렌더링, key의 역할, key 값에 따른 리렌더링·리마운트 차이
- [폼](/knowledge/dictionary/frontend/react/forms): 제어 컴포넌트, 여러 input, 파생 값 계산, React 19 폼 액션(useActionState·useFormStatus)
- [합성](/knowledge/dictionary/frontend/react/composition): children, 특수화, 상속 대신 합성
- [재사용 컴포넌트를 위한 리액트 패턴 5가지](/knowledge/dictionary/frontend/react/advanced-react-patterns): Compound Components, Control Props, Custom Hook, Props Getters, State Reducer 비교
- [Context](/knowledge/dictionary/frontend/react/context): props drilling 없이 값 공유, Context로 부족할 때 고르는 Redux Toolkit·Zustand·Jotai
- [스타일링](/knowledge/dictionary/frontend/react/styling): CSS Modules, styled-components(유지보수 모드), emotion, 인라인 스타일

### 실전
- [React 빌드 환경 직접 구성하기: webpack·Babel·TypeScript](Frontend/React/tooling.md): CDN 실습, CRA 종료 이후의 선택, webpack·Babel·tsconfig 역할, 라우팅·코드 스플리팅, 도구별 환경 변수 접두사
- [SWR로 데이터 가져오기](/knowledge/dictionary/frontend/react/swr): fetcher, mutate 옵션과 optimisticData, SWR 캐시로 로그인 상태 판단·보호된 페이지, useSWRInfinite
- [TanStack Query(React Query)](/knowledge/dictionary/frontend/react/tanstack-query): QueryClientProvider, query key, useQuery·useMutation, v5 변경점
- [Redux와 react-redux](/knowledge/dictionary/frontend/react/redux): Flux 패턴, store·reducer·dispatch, useSelector·useDispatch, Redux Toolkit
- [use 훅과 리액트 비동기 처리](/knowledge/dictionary/frontend/react/react-use-hook): Promise·Context를 읽는 React 19 API, 캐시된 Promise만 넘기기, 서버 컴포넌트에서 내려받은 Promise 읽기
- [실시간 채팅 앱의 데이터 흐름: REST와 WebSocket 역할 나누기](Frontend/React/realtime-chat-app.md): 쓰기는 REST·알림은 소켓, 리소스 계층이 드러나는 URL, 소켓 연결 수명, optimistic UI와 중복 방지, 긴 목록 최적화
- [프런트엔드 에러 핸들링: 분류와 선언적 처리](/knowledge/dictionary/frontend/react/frontend-error-handling): 예상 가능·해결 가능으로 나눈 에러 분류, Suspense·ErrorBoundary 경계, 이벤트 핸들러 에러와 unhandledrejection 전역 처리
- [리렌더링 원인 추적하기](/knowledge/dictionary/frontend/react/re-rendering): memo가 안 먹힐 때, useQuery의 렌더링, DevTools 하이라이트·Profiler
- [react-hook-form과 MUI Select](/knowledge/dictionary/frontend/react/react-hook-form): Controller, 빈 값 처리, 수정 폼 초기값
- [react-router로 레이아웃과 Breadcrumbs 만들기](/knowledge/dictionary/frontend/react/react-router-layout): URL 규칙, Outlet, 경로 기반 Breadcrumbs
- [MUI Dialog로 삭제 확인 창 만들기](/knowledge/dictionary/frontend/react/confirm-dialog): 재사용 다이얼로그, 위험한 버튼 디자인
- [음성 녹음하고 파일로 보내기](/knowledge/dictionary/frontend/react/audio-recording): getUserMedia·MediaRecorder, Blob 다운로드, FormData 업로드

관련: 컴포넌트 설계 원칙(SOLID)과 의존성 관리, 폴더 구조와 Feature-Sliced Design은 [Architecture](Frontend/Architecture.md) 주제에 모았다.

## 참고 자료

인프런 「처음 만나는 리액트」·「Slack 클론 코딩」, 노마드코더 「ReactJS로 영화 웹 서비스 만들기」, 생활코딩 React(2022), React 공식 문서를 개념별로 합쳐 정리했다.
