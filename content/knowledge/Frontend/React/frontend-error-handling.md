---
title: "프런트엔드 에러 핸들링: 분류와 선언적 처리"
concept: "Frontend Error Handling"
summary: "에러를 '예상 가능한가'와 '사용자가 해결할 수 있는가'로 나눠 대응(가이드·격리·모니터링)을 정하고, React에서는 Suspense·ErrorBoundary로 로딩·에러를 선언적으로 처리한다. 이벤트 핸들러 에러를 경계로 넘기는 법과 예상치 못한 에러의 전역 처리까지."
tags: ["react", "frontend", "error-handling", "suspense", "monitoring"]
source: other
date: "2026-10-15"
sources: ["https://jbee.io/articles/react/%ED%9A%A8%EC%9C%A8%EC%A0%81%EC%9D%B8%20%ED%94%84%EB%9F%B0%ED%8A%B8%EC%97%94%EB%93%9C%20%EC%97%90%EB%9F%AC%20%ED%95%B8%EB%93%A4%EB%A7%81", "https://react.dev/reference/react/Component#catching-rendering-errors-with-an-error-boundary", "https://github.com/bvaughn/react-error-boundary"]
---

> Jbee의 연재 「[효율적인 프런트엔드 에러 핸들링](https://jbee.io/articles/react/%ED%9A%A8%EC%9C%A8%EC%A0%81%EC%9D%B8%20%ED%94%84%EB%9F%B0%ED%8A%B8%EC%97%94%EB%93%9C%20%EC%97%90%EB%9F%AC%20%ED%95%B8%EB%93%A4%EB%A7%81)」(2021.03, 3편)을 바탕으로 React 19·TanStack Query v5·react-error-boundary 기준으로 재구성한 노트다.

## 에러 분류: 두 개의 축

에러를 잘 다루려면 먼저 나눠야 한다. 기준은 두 가지다.

- **예상 가능한가?** 언제 어떻게 나는지 아는 에러(Expected)와 모르는 에러(Unexpected).
- **사용자가 해결할 수 있는가?** 안내하면 사용자가 스스로 벗어날 수 있는 에러와 그렇지 않은 에러.

| | 사용자가 해결 가능 | 사용자가 해결 불가 |
| --- | --- | --- |
| **예상 가능** | 401 로그인 필요, 404, 입력 검증 실패, 비즈니스 에러 코드 → **가이드가 중요** | 정상 UI로는 닿을 수 없는 요청(조작된 파라미터 등) → **보안 점검 대상** |
| **예상 불가** | 일시적인 네트워크 끊김 → **재시도 안내 + 영향 범위 격리** | 500, 브라우저 호환성, 코드 버그 → **모니터링이 중요** |

대응은 칸마다 하나로 딱 떨어지지 않지만 세 가지 원칙은 공통이다.

1. **예상 못 한 에러는 전부 모니터링한다.** Sentry 같은 도구로 수집하고 소스 맵을 올려 경로를 추적한다.
2. **해결 가능한 에러는 다음 행동을 알려 준다.** 메시지만이 아니라 CTA(Call To Action)를 함께 준다. 로그인 버튼, 뒤로 가기, 다시 시도, 잘못된 필드에 포커스.
3. **어떤 에러도 앱 전체를 무너뜨리면 안 된다.** 한 화면의 API 10개 중 하나가 실패하면 그 영역만 에러 UI를 보이고 거기서만 다시 시도하게 한다.

## 명령형 처리의 비용

```tsx
function useUser() {
  const [data, setData] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  // useEffect 안에서 try/catch, 취소 처리, 상태 세 개 갱신…
  return { data, isLoading, error }
}
```

호출마다 로딩·에러 상태를 만들고, 쓰는 컴포넌트마다 `if (isLoading)`·`if (error)` 분기를 반복한다. 컴포넌트가 **성공한 경우만 신경 쓰게** 하려면 로딩과 에러를 바깥 경계로 넘긴다.

## 선언적 처리: Suspense + ErrorBoundary

| 경계 | 맡는 상태 | Promise 상태로 보면 |
| --- | --- | --- |
| `<Suspense fallback>` | 로딩 | pending |
| `<ErrorBoundary>` | 에러 | rejected |
| 자식 컴포넌트 | 데이터가 있는 화면 | fulfilled |

```tsx
function UserMenu() {
  const { data: user } = useSuspenseQuery({ queryKey: ['user'], queryFn: getUser })
  return <div>{user.name}</div>  // data가 항상 있다
}

<ErrorBoundary fallbackRender={({ error, resetErrorBoundary }) => (
  <ErrorCard error={error} onRetry={resetErrorBoundary} />
)}>
  <Suspense fallback={<Skeleton />}>
    <UserMenu />
  </Suspense>
</ErrorBoundary>
```

두 경계를 묶은 컴포넌트를 흔히 **AsyncBoundary**라 부른다. 경계를 화면 단위가 아니라 **API를 부르는 영역 단위로** 감싸면 원칙 3(격리)이 자연히 지켜진다. Promise를 직접 다루는 경우는 [[react-use-hook|use 훅]]에 있다.

### ErrorBoundary에 필요한 기능

React의 에러 경계는 지금도 클래스 컴포넌트(`getDerivedStateFromError`·`componentDidCatch`)로만 만든다. 직접 짜기보다 `react-error-boundary`를 쓰는 것이 보통이고, 쓸모 있는 경계는 다음을 갖춘다.

| 기능 | react-error-boundary | 왜 필요한가 |
| --- | --- | --- |
| 에러를 받는 fallback | `fallbackRender`, `FallbackComponent` | 에러 종류마다 다른 UI |
| fallback 안의 재시도 | `resetErrorBoundary` | 한 번 잡힌 에러는 다시 마운트하지 않으면 안 풀린다 |
| 값이 바뀌면 자동 초기화 | `resetKeys={[userId]}` | 다른 사용자로 바뀌면 에러를 지우고 다시 시도 |
| 초기화 시 부수 작업 | `onReset` | 캐시에 남은 에러도 함께 지운다 |
| 로깅 | `onError` | 예상 못 한 에러를 모니터링으로 보낸다 |

TanStack Query는 실패한 쿼리의 에러를 캐시에 들고 있어서, 경계만 초기화하면 같은 에러가 다시 던져진다. `QueryErrorResetBoundary`(또는 `useQueryErrorResetBoundary`)의 `reset`을 `onReset`에 연결한다.

```tsx
<QueryErrorResetBoundary>
  {({ reset }) => (
    <ErrorBoundary onReset={reset} fallbackRender={...}>
      <Suspense fallback={<Skeleton />}><UserMenu /></Suspense>
    </ErrorBoundary>
  )}
</QueryErrorResetBoundary>
```

### 경계에서 에러를 가려 받기

모든 에러를 가장 가까운 경계가 먹으면 안 된다. 401처럼 **전역에서 처리할 에러**(로그인 페이지로 이동)는 지역 경계가 다시 던져 상위로 넘긴다.

```tsx
fallbackRender={({ error, resetErrorBoundary }) => {
  if (isGlobalError(error)) throw error           // 상위 경계·전역 처리로
  if (!isExpectedError(error)) Sentry.captureException(error)
  return <ErrorCard error={error} onRetry={resetErrorBoundary} />
}}
```

예상한 에러인지는 HTTP 상태 코드만으로 부족하다. 서버와 `errorCode` 같은 **합의된 필드**를 정해 두고 `isExpectedError(error)` 한 함수로 판별한다.

## 이벤트 핸들러와 비동기 코드의 에러

에러 경계는 **렌더링 중** 던진 에러만 잡는다. 이벤트 핸들러, `setTimeout`, 렌더링 밖의 `await`에서 난 에러는 잡지 못한다. 폼 제출처럼 렌더링 밖의 에러는 셋 중 하나로 처리한다.

| 방법 | 언제 | 코드 |
| --- | --- | --- |
| 그 자리에서 처리 | 예상한 에러 (중복 이메일, 형식 오류) | `catch`에서 `switch (error.errorCode)` |
| 가장 가까운 경계로 넘김 | 영역 전체를 에러 화면으로 바꿔야 할 때 | `const { showBoundary } = useErrorBoundary()` 후 `showBoundary(error)` |
| 전역으로 넘김 | 예상 못 한 에러 | 다시 `throw`하고 `unhandledrejection`에서 토스트 + 로깅 |

```tsx
async function handleSubmit(payload: LoginPayload) {
  try {
    await login(payload)
  } catch (error) {
    if (isExpectedError(error)) return showFieldError(error.errorCode)
    throw error  // 처리하지 않은 reject → 전역 핸들러로
  }
}

// 앱 루트에서 한 번
useEffect(() => {
  const onRejection = ({ reason }: PromiseRejectionEvent) => {
    toast.error(reason?.message || '문제가 발생했습니다. 잠시 후 다시 시도해 주세요.')
    Sentry.captureException(reason)
  }
  window.addEventListener('unhandledrejection', onRejection)
  return () => window.removeEventListener('unhandledrejection', onRejection)
}, [])
```

이렇게 하면 예상 못 한 에러에 대한 로깅·토스트를 API 호출마다 반복하지 않는다. `useMutation`을 쓰면 `QueryClient`의 `mutationCache: new MutationCache({ onError })`가 같은 역할을 한다.

React 19는 루트 단위 훅도 준다. `createRoot(el, { onCaughtError, onUncaughtError, onRecoverableError })`로 경계가 잡은 에러와 못 잡은 에러를 한곳에서 로깅할 수 있다. Next.js App Router에서는 라우트 구획마다 `error.tsx`가 에러 경계 역할을 한다.

## 역사

React 18 이전에는 서버 렌더링에서 `<Suspense>`를 쓸 수 없어서, 마운트 뒤에만 Suspense를 켜는 `SSRSafeSuspense` 같은 우회가 필요했다. 지금은 서버에서도 Suspense가 동작하고 [[streaming-ssr|스트리밍 SSR]]의 단위가 된다. TanStack Query의 `{ suspense: true }` 옵션은 v5에서 `useSuspenseQuery`로 바뀌었고, react-error-boundary의 `useErrorBoundary`가 돌려주는 함수도 `showBoundary`로 이름이 정해졌다.

## 정리

- 에러는 "예상 가능한가"와 "사용자가 해결할 수 있는가"로 나누고, 각각 가이드·보안 점검·격리·모니터링으로 대응한다.
- 로딩은 Suspense, 에러는 ErrorBoundary에 맡기고, 컴포넌트는 성공한 경우만 그린다.
- 경계는 API를 부르는 영역 단위로 작게 둔다. 재시도와 `resetKeys`, 캐시 에러 초기화(`onReset`)를 함께 건다.
- 이벤트 핸들러 에러는 경계가 못 잡는다. 예상한 에러는 그 자리에서, 나머지는 `showBoundary`나 전역 핸들러로 넘긴다.
- 예상 못 한 에러의 토스트·로깅은 한곳에 모아 반복을 없앤다.

관련 노트: [[react-use-hook|use 훅과 리액트 비동기 처리]], [[tanstack-query|TanStack Query(React Query)]], [[lifecycle|생명주기]], [[streaming-ssr|스트리밍 SSR]], [[js-error-handling|에러 처리: try...catch와 커스텀 에러]]
