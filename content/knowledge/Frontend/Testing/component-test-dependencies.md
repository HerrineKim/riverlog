---
title: "의존성이 있는 컴포넌트 테스트하기"
concept: "Component Test Doubles"
summary: "fetch로 데이터를 받고, 자식 컴포넌트를 가져오고, Context에서 콜백을 받는 컴포넌트를 Vitest와 Testing Library로 테스트하는 세 가지 기법: 전역 fetch 바꿔 끼우기(vi.stubGlobal), 모듈 목(vi.mock), Provider로 테스트용 값 주입. 각 기법의 정리 방법과 한계, 그리고 MSW와 테스트하기 쉬운 설계로 넘어갈 시점을 정리한다."
tags: ["testing", "react", "vitest", "frontend"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/testing/get-started/component-testing", "https://web.dev/learn/testing/get-started/test-types", "https://vitest.dev/config/unstubglobals"]
---

> web.dev의 「[Learn Testing](https://web.dev/learn/testing)」 강좌의 「Component testing in practice」 모듈을 바탕으로, Testing Library 사용법을 지금 권장하는 방식으로 바꿔 재구성한 노트다.

## 컴포넌트 테스트란

컴포넌트 테스트는 단위 테스트와 E2E 사이에 있다. React 컴포넌트나 Web Component처럼 **사용자에게 보이는 단위 하나**를 렌더링하고 DOM으로 확인한다. 「컴포넌트」는 맥락마다 뜻이 다르다. 웹에서는 보통 UI 컴포넌트지만, 넓게는 외부 의존성이 있는 테스트 가능한 덩어리(클래스 등)를 가리킨다.

컴포넌트가 바깥에 기대는 것이 많을수록 테스트가 어렵다. 그 의존을 **테스트가 통제하는 대역**으로 바꾸는 것이 핵심이다. 실제 운영 환경을 흉내 내 코드를 시험할 수 있게 해 주는 대체 환경을 **테스트 하네스(test harness)**라 한다.

## 예제: 의존성이 세 개인 컴포넌트

```tsx
export function UserList({ count = 4 }: { count?: number }) {
  const [users, setUsers] = useState<User[]>([])
  useEffect(() => {
    fetch(`https://jsonplaceholder.typicode.com/users?_limit=${count}`)
      .then((r) => r.json())
      .then(setUsers)
  }, [count])

  const { userChosen } = useContext(UserContext)
  return (
    <section>
      <h2>Users</h2>
      <ul>
        {users.map((u) => (
          <li key={u.id}>
            <button onClick={() => userChosen(u.id)}>Choose</button> <UserRow u={u} />
          </li>
        ))}
      </ul>
    </section>
  )
}
```

`useEffect` 안에서 직접 `fetch`하는 것은 좋은 React 코드가 아니지만, 실제 코드베이스에는 이런 컴포넌트가 많다. 확인하고 싶은 것은 두 가지다.

1. 네트워크 데이터로 올바른 DOM을 만드는가.
2. 사용자를 고르면 콜백이 그 ID로 불리는가.

| 의존 | 테스트를 어렵게 하는 이유 | 기법 |
| --- | --- | --- |
| 전역 `fetch` | 실제 네트워크는 느리고 불안정하며 응답을 통제할 수 없다 | 전역 바꿔 끼우기 → 결국 MSW |
| 가져온 `UserRow` | 자체 데이터 요청·부수 효과가 있을 수 있다. 이 테스트의 관심사가 아니다 | 모듈 목 |
| `UserContext` | 평소에는 부모가 Provider로 준다. 없으면 기본값이 엉뚱하게 동작하거나 터진다 | Provider로 테스트용 값 주입 |

## 0. 렌더링만 확인하는 테스트의 함정

```tsx
test('렌더링된다', async () => {
  render(<UserList />)
  expect(await screen.findByRole('heading', { name: 'Users' })).toBeInTheDocument()
})
```

이 테스트는 통과한다. 하지만 실제 `fetch`는 응답을 받지 못한 채 남고, 사용자 목록은 전혀 확인하지 않는다. **「렌더링된다」만 확인하는 테스트는 컴포넌트가 다 테스트된 것처럼 보이게 해서 오히려 해롭다.**

## 1. 전역 `fetch` 바꿔 끼우기

`fetch`는 전역이므로 import 없이 `vi.stubGlobal`로 바꾼다.

```tsx
import { afterEach, expect, test, vi } from 'vitest'

afterEach(() => vi.unstubAllGlobals())

test('받은 사용자를 보여 준다', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    json: () => Promise.resolve([{ id: 'sam', name: 'Sam' }]),
  })
  vi.stubGlobal('fetch', fetchMock)

  render(<UserList />)

  expect(await screen.findByText('Sam')).toBeInTheDocument()
})
```

- `findBy*`는 요소가 나타날 때까지 기다린다. `waitFor` 안에서 `queryBy*`를 반복할 필요가 없다.
- **반드시 복원한다.** `vi.unstubAllGlobals()`를 부르거나 설정에서 `unstubGlobals: true`로 각 테스트 전에 자동 복원한다. 복원하지 않으면 목이 다른 테스트로 새어 나간다.
- 데이터를 일부러 틀리게 바꿔서 테스트가 실패하는지 한 번 확인한다.

**한계**: 요청이 두세 개를 넘거나, 코드가 `response.ok`·`status`·헤더를 읽기 시작하면 가짜 `Response`를 손으로 맞추기 어렵다. 그때는 요청 단에서 가로채는 **MSW**로 넘어간다. 같은 핸들러를 테스트·개발 서버·Storybook에서 함께 쓴다.

```ts
// MSW로 같은 일을: fetch 구현이 아니라 HTTP 계약을 흉내 낸다
const server = setupServer(
  http.get('https://jsonplaceholder.typicode.com/users', () =>
    HttpResponse.json([{ id: 'sam', name: 'Sam' }]),
  ),
)
beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())
```

## 2. 가져온 모듈을 목으로

`UserRow`를 단순한 대역으로 바꾼다. 테스트 파일이 `UserRow`를 직접 쓰지 않아도 된다.

```tsx
vi.mock('./UserRow.tsx', () => ({
  UserRow: ({ u }: { u: User }) => <>{u.name}</>,
}))
```

- `vi.mock`은 파일 맨 위로 **끌어올려진다(hoisting)**. 어디에 쓰든 import보다 먼저 실행된다.
- 자식을 진짜로 렌더링하는 Sociable 테스트와 대역으로 바꾸는 Solitary 테스트의 차이는 [[frontend-test-types|프론트엔드 테스트의 종류와 도구]]에 있다. 자식이 단순하면 진짜를 그대로 쓰는 편이 실제와 가깝다.
- **의존이 많은 코드에서는 모듈 목이 금방 감당 못 할 만큼 늘어난다.** 모듈 목은 비용이 큰 전역 목이다([[humble-object-pattern|험블 객체 패턴]]).

## 3. Context로 테스트용 값 주입

Context는 props를 여러 단계로 내려보내지(prop drilling) 않고 트리 아래로 값을 전달한다. React와 Lit 모두 같은 개념이 있다. 이것은 그대로 **의존성 주입 통로**가 된다. Provider 없이 버튼을 누르면 기본값이 무엇을 할지 알 수 없다.

```tsx
test('고르면 그 사용자 ID로 콜백을 부른다', async () => {
  const user = userEvent.setup()
  const userChosen = vi.fn()

  render(
    <UserContext.Provider value={{ userChosen }}>
      <UserList />
    </UserContext.Provider>,
  )
  await user.click(await screen.findByRole('button', { name: 'Choose' }))

  expect(userChosen).toHaveBeenCalledWith('sam')
})
```

`vi.fn()`이 호출과 인자를 기록하는 스파이 역할을 한다. 앞의 `fetch` 대역이 ID가 `sam`인 사용자를 주므로 `'sam'`으로 불렸는지 확인할 수 있다. 콜백 호출은 컴포넌트 밖으로 나가는 결과라서 검증할 만한 요구사항이다. 여러 테스트에서 쓰면 Provider를 감싼 `renderWithProviders` 도우미나 `render`의 `wrapper` 옵션으로 묶는다.

## 언제 이 기법을 멈추나

| 신호 | 다음 단계 |
| --- | --- |
| `fetch` 목의 응답 모양을 계속 손으로 맞추고 있다 | MSW로 HTTP 계층에서 가로챈다 |
| 테스트 하나에 `vi.mock`이 여러 개 | 컴포넌트가 너무 많은 것을 안다. 데이터 요청을 훅·API 클라이언트로 떼어 내고, 표시 컴포넌트는 props만 받게 한다 |
| 테스트가 컴포넌트와 깔끔하게 상호작용하지 못한다 | 추상화가 약하다는 신호다. 의존을 인자·Context로 받게 바꾼다 |

이 기법들은 **이미 있는 테스트하기 어려운 코드**를 다루는 방법이다. 길게 보면 MSW와 [[humble-object-pattern|테스트하기 쉬운 설계]]가 답이다.

## 정리

- 컴포넌트의 외부 의존(전역, 모듈, Context)을 테스트가 통제하는 대역으로 바꾸는 것이 테스트 하네스다.
- 렌더링만 확인하는 테스트는 안심만 주고 아무것도 지키지 않는다.
- 전역은 `vi.stubGlobal` + 복원, 모듈은 `vi.mock`, Context는 Provider로 `vi.fn()`을 주입한다.
- 요청이 늘면 MSW, 목이 늘면 설계를 바꾼다.

관련 노트: [[api-mocking|API 모킹: MSW와 json-server]], [[humble-object-pattern|험블 객체 패턴]], [[frontend-test-types|프론트엔드 테스트의 종류와 도구]], [[test-environment|테스트 실행 환경]], [[a11y-driven-testing|접근성 기반 UI 테스트 자동화]]
