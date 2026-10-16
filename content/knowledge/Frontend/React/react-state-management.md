---
title: "리액트 상태 관리의 흐름과 고르는 기준"
concept: "State Management"
summary: "상태를 종류(로컬·서버·URL·폼·전역 클라이언트)로 먼저 나누고, 전역 상태 라이브러리는 읽기·쓰기·리렌더링 최적화·메모리 네 가지 문제를 어떻게 푸는지로 비교한다. Flux·Redux에서 Context, 서버 상태 라이브러리, atom·proxy 기반 라이브러리로 이어진 흐름까지."
tags: ["react", "state", "frontend", "architecture", "performance"]
source: other
date: "2026-10-15"
sources: ["https://medium.com/@yujso66/%EB%B2%88%EC%97%AD-%EB%A6%AC%EC%95%A1%ED%8A%B8-%EC%83%81%ED%83%9C-%EA%B4%80%EB%A6%AC%EC%9D%98-%EC%83%88%EB%A1%9C%EC%9A%B4-%ED%9D%90%EB%A6%84-6e5ed0022e39", "https://frontendmastery.com/posts/the-new-wave-of-react-state-management/"]
---

> 「[리액트 상태 관리의 새로운 흐름](https://medium.com/@yujso66/%EB%B2%88%EC%97%AD-%EB%A6%AC%EC%95%A1%ED%8A%B8-%EC%83%81%ED%83%9C-%EA%B4%80%EB%A6%AC%EC%9D%98-%EC%83%88%EB%A1%9C%EC%9A%B4-%ED%9D%90%EB%A6%84-6e5ed0022e39)」을 바탕으로 재구성한 노트다. 원 자료는 Frontend Mastery의 「The new wave of React state management」(2022.06)다.

## 먼저 상태의 종류를 나눈다

"전역 상태 라이브러리를 뭘 쓸까"보다 먼저 물을 것은 **이 상태가 어떤 종류인가**다. 종류마다 알맞은 도구가 이미 있고, 전역 클라이언트 상태로 남는 것은 생각보다 적다.

| 종류 | 예 | 맞는 도구 |
| --- | --- | --- |
| 로컬 UI 상태 | 드롭다운 열림, 입력 중인 값 | `useState`·`useReducer` ([[state|State]]) |
| 서버 상태(원격 캐시) | 글 목록, 사용자 정보 | [[tanstack-query|TanStack Query]], [[swr|SWR]], Apollo·Relay, RTK Query, 또는 서버 컴포넌트 |
| URL 상태 | 검색어, 필터, 페이지 번호 | 라우터의 search params |
| 폼 상태 | 필드 값, 검증 에러, 제출 중 | [[react-hook-form|react-hook-form]], React 19 폼 액션 |
| 전역 클라이언트 상태 | 테마, 로그인 사용자 정보, 장바구니, 여러 화면이 함께 쓰는 편집 상태 | Context, Zustand, Jotai, Redux Toolkit, Valtio |

**로컬 상태로 시작하고, 정말 공유가 필요할 때만 끌어올린다.** 많은 앱의 "전역 상태"는 사실 서버 데이터의 사본이었고, 서버 상태 라이브러리로 옮기면 거의 사라진다.

## 전역 상태 라이브러리가 푸는 네 가지 문제

| 문제 | 질문 | 선택지 |
| --- | --- | --- |
| 읽기 | 트리 어디서나 어떻게 읽나 | React 안(Context + `useState`)에 두거나, React 밖 모듈 변수에 두고 구독한다 |
| 쓰기 | 어떤 모양으로 바꾸나 | 불변 업데이트(`{...state, count: 1}`) 또는 변경하듯 쓰기(Immer, Valtio) |
| 리렌더링 최적화 | 바뀐 조각을 쓰는 컴포넌트만 다시 그리나 | selector로 직접 고르거나(수동), atom 구독(반자동), Proxy로 접근한 속성 추적(자동) |
| 메모리 | 안 쓰는 상태가 정리되나 | React 생명주기에 묶으면 언마운트 때 사라지고, 모듈 전역 스토어는 직접 지워야 한다 |

- React 안에 두면 서브트리마다 다른 상태를 가질 수 있지만, Context는 값이 바뀌면 구독자 전체가 다시 그려진다([[context|Context]]).
- React 밖 모듈에 두면 싱글턴처럼 어디서나 쓰기 쉽지만, 서브트리별로 다른 값을 두기 어렵고 테스트·SSR에서 요청 간에 값이 섞이지 않게 신경 써야 한다.

### 그 밖의 함정

- **티어링(tearing)**: 동시성 렌더링 중 외부 스토어 값이 바뀌어 한 화면에 서로 다른 시점의 값이 섞이는 문제다. 외부 스토어는 `useSyncExternalStore`로 구독해야 막힌다. 지금의 주요 라이브러리는 내부에서 이 훅을 쓴다.
- **좀비 자식(zombie child)**: 부모보다 자식의 selector가 먼저 실행되어, 이미 지워진 항목을 읽다가 터지는 문제다.
- **오래된 props(stale props)**: selector가 클로저로 잡은 props가 최신이 아닐 때 생긴다.

## 세 가지 접근

| 접근 | 모양 | 대표 | 최적화 |
| --- | --- | --- | --- |
| 스토어(top-down) | 큰 상태 하나를 만들고 필요한 조각을 selector로 꺼낸다 | Redux Toolkit, Zustand | selector로 수동 |
| atom(bottom-up) | 가장 작은 상태 단위(atom)를 만들고 조합해 파생 상태 그래프를 만든다 | Jotai | atom 단위 구독 |
| proxy | 평범한 객체처럼 바꾸면, 읽은 속성만 추적해 다시 그린다 | Valtio | 자동 |

```js
// 스토어: Zustand
const useCart = create((set) => ({ items: [], add: (item) => set((s) => ({ items: [...s.items, item] })) }))
const count = useCart((s) => s.items.length)       // selector로 필요한 값만 구독

// atom: Jotai
const priceAtom = atom(1000)
const qtyAtom = atom(2)
const totalAtom = atom((get) => get(priceAtom) * get(qtyAtom))  // 파생 atom
const total = useAtomValue(totalAtom)

// proxy: Valtio
const state = proxy({ count: 0 })
const snap = useSnapshot(state)   // 읽은 속성만 추적
state.count++                     // 변경하듯 쓴다
```

atom 방식을 알린 Recoil은 2025년 1월 저장소가 보관됐고, 같은 모델은 Jotai가 잇는다. 어느 쪽이 정답은 아니다. 액션·미들웨어·DevTools 같은 구조가 필요하면 스토어, 상태가 잘게 흩어져 있고 파생 값이 많으면 atom, 변경하듯 쓰는 것이 자연스러운 도메인이면 proxy가 맞다. Redux가 언제 맞는지는 [[redux|Redux와 react-redux]]의 「언제 Redux를 쓰나」에 있다.

## 흐름: 어떻게 여기까지 왔나

Flux·Redux에서 Context, 서버 상태 라이브러리, 작은 전역 스토어로 이어진 변천은 [[frontend-mv-architecture#웹 프론트엔드 아키텍처의 변천|프론트엔드 MV* 아키텍처의 흐름]]에 표로 정리했다. 상태 관리 관점에서 남길 교훈은 두 가지다.

- Redux의 문제는 스토어 자체보다 **UI 상태와 서버 데이터를 한 곳에 섞은 것**이었다. 지금의 Redux Toolkit은 RTK Query로 이 둘을 나눈다.
- 서버 컴포넌트와 라우터 loader(Remix, 현 React Router)가 데이터를 서버에서 가져오면서, 클라이언트에 남는 상태는 더 줄었다([[react-server-components|React Server Components의 동작 원리]]).

## 정리

- 상태는 먼저 종류로 나눈다. 서버 데이터는 서버 상태 라이브러리나 서버 컴포넌트로, 검색 조건은 URL로, 폼은 폼 라이브러리로 보낸다.
- 남은 전역 클라이언트 상태만 라이브러리를 고른다. 기준은 읽기·쓰기·리렌더링 최적화·메모리 네 가지다.
- 외부 스토어는 `useSyncExternalStore`로 구독해야 동시성 렌더링에서 안전하다.
- 스토어·atom·proxy는 우열이 아니라 모양의 차이다. 팀과 앱에 맞는 쪽을 고른다.
- 로컬에서 시작하고 필요할 때만 끌어올린다.

관련 노트: [[state|State]], [[context|Context]], [[redux|Redux와 react-redux]], [[tanstack-query|TanStack Query(React Query)]], [[react-server-components|React Server Components의 동작 원리]], [[frontend-mv-architecture|프론트엔드 MV* 아키텍처의 흐름]]
