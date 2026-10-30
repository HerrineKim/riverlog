---
title: "리렌더링 원인과 추적"
concept: "Re-rendering"
summary: "리렌더링을 일으키는 원인, React.memo가 효과 없는 경우, useQuery가 최소 두 번 렌더링하는 이유, DevTools로 추적하고 줄이는 순서."
tags: ["react", "rendering", "performance", "debugging", "frontend"]
source: notion
date: "2026-10-13"
sources: ["https://react.dev/learn/react-compiler", "https://prepare-frontend-interview.vercel.app/react"]
---

> 「[프론트엔드 면접 준비: React](https://prepare-frontend-interview.vercel.app/react)」 정리로 리렌더링 조건을 보강했다.

React 컴포넌트는 **state가 바뀌거나, 부모가 렌더링되거나, 구독한 Context·외부 스토어 값이 바뀌면** 다시 렌더링된다. 리렌더링 자체는 나쁜 것이 아니지만, 값이 그대로인데 여러 번 다시 그려진다면 원인을 찾아 줄일 수 있다. `React.memo`를 여기저기 씌우기보다 **렌더링을 일으키는 원인을 먼저 찾는다**. 메모이제이션 API 자체는 [Hooks](/knowledge/dictionary/frontend/react/hooks)의 메모이제이션 절 참고.

## 무엇이 리렌더링을 일으키나

| 일어난 일 | 리렌더링 | 비고 |
| --- | --- | --- |
| 자기 state 갱신 | 된다 | 새 값이 이전 값과 `Object.is`로 같으면 건너뛴다(bail out). 확인하려고 컴포넌트를 한 번 더 호출할 수는 있지만 자식으로 내려가지 않는다. 객체를 직접 고쳐 같은 참조를 넘기면 바뀐 것이 보이지 않는다([[state\|State와 useState]]) |
| 부모 리렌더링 | 된다 | props가 그대로여도 다시 호출된다. 「props가 바뀌어서」 다시 그려지는 것도 결국 부모가 렌더링했기 때문이다. `memo`가 막는 것이 이 경우다 |
| 구독한 Context 값 변경 | 된다 | Provider `value`의 참조가 바뀌면 그 Context를 읽는 컴포넌트 전부. `memo`로 막지 못한다([[context\|Context]]) |
| 외부 스토어 변경 | 된다 | `useSyncExternalStore`나 `useSelector`가 고른 값이 바뀔 때 |
| `ref.current` 변경 | 안 된다 | 렌더링과 상관없는 값을 담는 상자다([[hooks\|Hooks]]의 useRef 절) |
| 일반 변수·props 객체를 직접 수정 | 안 된다 | React가 바뀐 줄 알 방법이 없다 |
| 클래스 컴포넌트의 `forceUpdate()` | 된다 | 비교 없이 강제로 다시 그린다. 함수 컴포넌트에는 대응 API가 없다 |

## React.memo가 효과 없는 경우

`React.memo`는 **props가 같을 때만** 렌더링을 건너뛴다. 아래 경우에는 감싸도 렌더링 횟수가 줄지 않는다.

| 원인 | 설명 | 해결 |
| --- | --- | --- |
| 부모가 새 객체·배열·함수를 props로 넘김 | 부모가 렌더링될 때마다 참조가 바뀌어 props가 달라진 것으로 판단된다 | `useMemo`/`useCallback`으로 참조 고정 |
| 컴포넌트 자신의 state·Context가 바뀜 | memo는 props 비교만 하므로 내부 변화는 막지 못한다 | state를 쓰는 쪽으로 내리거나 Context 분리 |
| 렌더링의 출발점이 부모 쪽 데이터 흐름 | 자식만 감싸면 부모가 계속 렌더링되고, 계층 전체를 감싸도 같다 | 어느 층에서 렌더링이 시작되는지 찾아 그 층을 고친다 |

자식 컴포넌트가 여러 번 렌더링될 때는 자식이 아니라 **그 위 컴포넌트가 이미 여러 번 렌더링되고 있는 것**일 수 있다. 자식은 결과일 뿐이다.

## useQuery가 최소 두 번 렌더링하는 이유

react-query(TanStack Query)의 `useQuery`를 쓰는 컴포넌트는 최소 두 번 렌더링된다.

1. 데이터를 받기 전(로딩 상태)에 한 번
2. 데이터를 받은 뒤 한 번 더

`isFetching`처럼 요청 상태가 바뀔 때마다 렌더링이 추가로 생길 수도 있다. 따라서 `useQuery`를 쓰는 부모 아래의 자식은 여러 번 렌더링될 수 있다. 이런 동작을 알고 있어야 어디에 로그를 찍을지도 판단할 수 있다.

> 참고: TanStack Query는 기본적으로 컴포넌트가 실제로 읽은 속성이 바뀔 때만 다시 렌더링하도록 최적화되어 있다(tracked queries). 그래도 로딩→성공 전환에 따른 렌더링은 피할 수 없다.

## 추적 방법

- **계층별 `console.log`**: 부모부터 자식까지 렌더링 시점을 찍어 보면 어느 층에서 렌더링이 시작되는지 보인다. 로그 순서상 자식이 부모보다 먼저 끝나는 것처럼 보일 수 있는데, 렌더 완료·커밋이 자식부터 이루어지기 때문이다.
- **React DevTools → "Highlight updates when components render"**: 렌더링될 때마다 해당 컴포넌트에 테두리가 깜빡여 눈으로 바로 추적할 수 있다.
- **React DevTools Profiler**: 각 렌더링이 *왜* 일어났는지(props 변경, state 변경, 부모 렌더링)와 소요 시간을 기록해 준다. "Record why each component rendered" 옵션을 켜 둔다. 컴포넌트 단위가 아니라 메인 스레드 전체 비용(스크립트·레이아웃·페인트)은 Chrome DevTools의 Performance 패널로 본다([[devtools-performance|DevTools로 성능·메모리 분석하기]]).

## 줄이는 순서

1. 렌더링을 촉발하는 원인을 찾는다: 자기 state 변경인가, 부모 렌더링인가, Context인가, 데이터 패칭 상태인가.
2. 원인을 제거한다: state를 실제로 쓰는 컴포넌트 가까이로 내리기, 부모에서 바뀌는 부분과 안 바뀌는 부분을 컴포넌트로 분리하기, 필요 없는 state 제거하기.
3. 그래도 남는 경우에만 `React.memo` + `useCallback`/`useMemo`로 props 참조를 고정한다. React Compiler를 켠 프로젝트에서는 이 단계의 메모이제이션을 컴파일러가 자동으로 넣으므로, 손으로 고정할 곳은 컴파일러가 건너뛴 컴포넌트 정도다.
4. 측정한다. 렌더링 몇 번이 실제로 느린지 Profiler로 확인하고, 느리지 않다면 굳이 최적화하지 않는다.

## 핵심 정리

- 리렌더링 원인: state, 부모 렌더링, Context·외부 스토어 변경.
- `React.memo`는 props가 같을 때만 효과가 있다. 원인을 모른 채 씌우면 소용없다.
- `useQuery` 같은 데이터 패칭 훅은 로딩→성공 전환만으로도 최소 두 번 렌더링한다.
- DevTools의 하이라이트와 Profiler로 원인을 찾은 다음 고친다.

관련 노트: [[inp-optimization|INP 최적화: 긴 작업 쪼개기와 양보]], [[frontend-performance-strategy|프론트엔드 성능 최적화: 언제, 무엇을]]
