---
title: "use 훅과 리액트 비동기 처리"
concept: "use Hook"
summary: "use는 컴포넌트가 Promise를 직접 읽게 해 주는 저수준 API다. 조건문·반복문 안에서도 부를 수 있지만 캐싱·프리페치는 직접 붙여야 하고, 컴파일러 최적화를 위해 컴포넌트·훅 안에서만 부를 수 있다."
tags: ["react", "hooks", "frontend", "async", "promise"]
source: other
date: "2026-10-12"
sources: ["https://yozm.wishket.com/magazine/detail/2374/"]
---

> 요즘IT에 실린 「[use 훅이 바꿀 리액트 비동기 처리의 미래 맛보기(2)](https://yozm.wishket.com/magazine/detail/2374/)」(2023.12)를 요약·재구성한 노트입니다. 원 자료는 데브시스터즈 문태근 님의 FEConf 2023 발표입니다. `use`가 정식 출시되기 전에 쓰인 글이라 지금의 React와 다를 수 있습니다. 원문 코드는 이미지라 아래 코드는 설명용으로 새로 쓴 예시입니다.

## use란

`use`는 **Promise(또는 Context)의 값을 컴포넌트 안에서 직접 꺼내는 API**다. Promise가 아직 끝나지 않았으면 컴포넌트는 가장 가까운 `Suspense`에 걸려 대기하고, 끝나면 값을 받아 다시 렌더링한다.

`use` 이전에는 Promise를 데이터 페칭 라이브러리의 훅(`useSWR`, `useQuery` 등)을 거쳐 간접적으로만 다룰 수 있었다. RFC는 이를 **Promise의 일급 지원(first-class support)** 이라고 부른다.

## 기존 훅의 제약을 푼다

일반 훅은 다음 위치에서 부를 수 없다.

| 위치 | 일반 훅 | `use` |
| --- | --- | --- |
| 조건문·반복문 안 | ✗ | ✓ |
| 조기 `return` 뒤 | ✗ | ✓ |
| 이벤트 핸들러 | ✗ | ✗ |
| 클래스 컴포넌트 | ✗ | ✗ |
| `useMemo`·`useReducer`·`useEffect`에 넘긴 클로저 | ✗ | ✗ |

조건부로 부를 수 있으니 **데이터를 쓰는 바로 그 자리에서 읽을 수 있다.** 컴포넌트 맨 위에 훅을 몰아 선언할 필요가 없어진다.

- **DX**: 상단에 쌓이던 불필요한 훅이 사라진다.
- **UX**: 실제로 필요할 때만 리소스를 불러온다.

```tsx
function ItemPanel({ showEvent }: { showEvent: boolean }) {
  if (!showEvent) return <NormalItems />;
  const events = use(fetchEventItems()); // 조건 뒤에서도 호출 가능
  return <EventList items={events} />;
}
```

## 은탄환은 아니다: 직접 붙여야 하는 것

`use`는 저수준 API라서 페칭 라이브러리가 해 주던 **캐싱과 프리페치**가 없다. 발표자 팀이 겪은 문제와 해결은 이렇다.

| 문제 | 원인 | 해결 |
| --- | --- | --- |
| 중복 요청·무한 루프 | 렌더링마다 fetch 함수가 **새 Promise**를 만든다 → 완료되면 리렌더 → 또 새 요청 | fetch 함수를 메모이즈해 **같은 Promise 인스턴스**를 돌려준다 (lodash `memoize`) |
| 요청 워터폴 | 반복문 안에서 `use(fetch...)`가 하나씩 차례로 막힌다. 서로 무관한 요청인데도 순차 로딩 | **프리페치**: 코드 위쪽에서 `use` 없이 요청만 먼저 시작해 두고, 쓰는 자리에서 진행 중인 Promise를 받는다 |
| 응집도 하락 | 위쪽 프리페치 코드가 데이터를 쓰는 곳과 떨어진다 | **동적 프리페치**: 런타임에 무엇을 미리 불러올지 정한다 |

```ts
// 같은 인자에는 같은 Promise를 돌려준다 → 리렌더해도 새 요청이 생기지 않는다
const fetchNormalItems = memoize((userId: string) =>
  fetch(`/api/items?user=${userId}`).then((r) => r.json()),
);
```

### 동적 프리페치

```text
fetch 함수 실행 ──> localStorage에 "이 페이지는 일반 아이템을 쓴다" 기록
        ...
다음에 페이지 진입 ──> 진입 이벤트 핸들러가 기록을 읽음 ──> 해당 요청을 미리 시작
```

- 프리페치 로직이 데이터 훅 밖의 한 곳으로 모인다(관심사 분리).
- 아이템 종류별 fetch 코드는 **쓰는 자리 한 곳에만** 남는다.

캐시를 비우고 다시 받는 `refetch`도 있으면 좋다. React가 공식 `cache` API를 준비하고 있었지만, 글 작성 시점에는 실험 단계이고 서버 컴포넌트에서만 쓸 수 있었다.

## use의 제약: 컴포넌트·훅 안에서만

`use`는 조건문 안에서는 되지만 **일반 함수 안에서는 부를 수 없다.** 발표자는 `filter`에 넘긴 콜백 안에서 `use`를 불렀다가 이 사실을 알게 됐다. 런타임 오류도 나지 않아 더 헷갈렸다고 한다.

- `map`·`filter`·`reduce` 콜백 안에서 호출 불가
- `use`를 부르는 공용 로직을 일반 헬퍼 함수로 뽑을 수 없음
- 컴포넌트나 훅 본문에서 직접 불러야 함

### 왜 막았나

RFC에 따르면 일반 함수에서 부르면 런타임은 돌아가도 **컴파일러 오류**가 난다. 여기서 컴파일러는 Babel·webpack·tsc가 아니라 React Conf 2021에서 공개된 최적화 컴파일러 **React Forget**(지금의 React Compiler)이다.

| 문법 | 쓸 수 있는 곳 |
| --- | --- |
| `await` | `async` 함수 안 |
| `yield` | 제너레이터 안 |
| `use` | 컴포넌트·훅 안 |

`async`/`await`는 문법이라 컴파일러가 변환·최적화할 수 있다(예: Babel이 구형 브라우저용 제너레이터 코드로 바꾼다). `use`는 함수지만 **React가 문법처럼 다루려고** 위치를 제한한다. 비동기 처리와 서버 컴포넌트를 컴파일러로 최적화하기 위한 준비다.

## DX와 UX의 균형

`useMemo`로 리렌더를 줄이면 UX는 좋아지지만 코드가 번거로워지고(DX 하락), 생략하면 반대가 된다. React Forget은 **UX 최적화를 컴파일러에 맡겨 DX를 지키는** 방향이고, 발표자는 `use`도 같은 방향에 있다고 본다.

## 정리

- `use`는 클라이언트 컴포넌트에서 Promise를 직접 읽게 해 준다. 조건문·반복문 안에서도 된다.
- 렌더마다 새 Promise를 만들면 무한 루프가 난다. **Promise는 캐싱해서 같은 인스턴스를 넘긴다.**
- 독립 요청을 반복문 안에서 `use`하면 워터폴이 된다. 미리 요청을 시작해 두는 프리페치로 병렬화한다.
- 컴포넌트·훅 밖에서는 부를 수 없다. 컴파일러 최적화를 위한 제약이다.
- 직접 캐싱·프리페치를 짜기 번거롭다면 여전히 [[swr|SWR]]·TanStack Query 같은 라이브러리가 실용적이다. (내 판단)

관련 노트: [[hooks|Hooks]], [[swr|SWR로 데이터 가져오기]], [[re-rendering|리렌더링 원인 추적하기]], [[frontend-latency-numbers|프론트엔드 개발자가 알아야 할 지연 시간 숫자]]
