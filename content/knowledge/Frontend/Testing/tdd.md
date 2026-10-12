---
title: "프론트엔드에서의 TDD"
concept: "TDD"
summary: "실패하는 테스트를 먼저 쓰고 통과시킨 뒤 리팩터링하는 TDD를 Jest와 React Testing Library로 프론트엔드에 적용하는 방법."
tags: ["testing", "tdd", "react", "jest"]
source: til
---

**TDD(Test Driven Development, 테스트 주도 개발)** 는 기능 코드보다 **테스트를 먼저 작성**하고, 그 테스트를 통과하는 코드를 만드는 방식으로 개발하는 것이다(Test First Programming). 아래에서는 React Todo 앱을 예로 프론트엔드에서 TDD를 적용하는 방법을 정리한다.

## 왜 테스트를 안 쓰게 될까

- 기획·디자인·개발·배포까지 일정이 늘 빠듯하다.
- 드는 노력에 비해 효과를 체감하기 어렵다.
- "프로젝트 끝나고 쓰자"고 하지만 그 "나중"은 오지 않는다.

예전에 만든 독서 기록 앱의 OCR 기능은 여러 단계의 처리가 한 메서드에, UI가 한 컴포넌트에 몰려 있었다. 버그 위치를 찾지 못해 주말 이틀을 날리고 나서야 분리와 테스트의 필요성을 절감했다. 그래도 TDD는 알아 둘 가치가 있다.

## TDD의 목표

TDD를 체계화한 켄트 벡(Kent Beck, XP 창시자, 『테스트 주도 개발』 저자)이 말하는 목표는 **"작동하는 깔끔한 코드(Clean code that works)"** 다.

1. 먼저 테스트로 **작동하는** 코드를 만들고,
2. 그다음 리팩터링으로 **깔끔한** 코드를 만든다.

"두려움이 지루함으로 바뀔 때까지 테스트를 작성하라"는 말처럼, 코드에 대한 불안이 사라질 만큼 신뢰가 쌓일 때까지 테스트한다.

### 흔한 오해

TDD는 오류 없는 완벽한 프로그램을 보장하는 도구가 아니다. 설계 방법론 자체도 아니다. 오히려 **지뢰 탐지기**에 가깝다. 실제로 TDD가 주는 것은 다음과 같다.

- 코드를 쓰기 전에 요구사항과 설계를 먼저 꼼꼼히 생각하게 해 **좋은 설계를 유도**한다.
- 테스트가 **예제로 표현된 스펙**이 된다. 테스트를 보면 이 코드를 어떻게 쓰는지 알 수 있어 협업과 유지보수에 도움이 된다.
- 공용 로직(DB 등)을 건드리지 않고 기능 단위로 개발할 수 있다.

## TDD 사이클

```text
테스트 목록 작성 → [Red] 실패하는 테스트 추가 → [Green] 통과하는 최소한의 코드
                    ↑                                         ↓
                    └────── [Refactor] 동작을 유지하며 중복 제거 ┘
```

1. 테스트가 필요한 동작의 목록과 사용 예를 적는다.
2. 실패하는 단위 테스트를 하나 추가한다(Red).
3. 테스트를 통과하도록 프로덕션 코드를 작성한다(Green).
4. 기능을 해치지 않는 선에서 리팩터링해 중복을 제거한다(Refactor).
5. 반복한다.

### 어려운 이유: 테스트하기 좋은 코드

사이클은 단순하지만, 실제로 어려운 것은 **테스트 가능한(testable) 코드**를 만드는 일이다. 테스트를 쓸 수 있다는 것은 이미 코드의 구조가 머릿속에 있다는 뜻이기 때문이다.

- **관심사의 분리(Separation of Concerns)**: 프로그램을 각자 하나의 관심사만 다루는 부분으로 나눈다. 그렇지 않으면 코드는 금방 진흙 덩어리가 된다.
- **단일 책임 원칙(SRP)**: 하나의 모듈은 하나의 책임만 가진다.

좋은 설계가 있어야 TDD가 잘 되고, TDD를 하면 좋은 설계로 유도된다. 뫼비우스의 띠 같은 관계다.

## 도구: Jest와 React Testing Library

- **Jest**: Meta(Facebook)가 만든 테스트 프레임워크. 테스트 러너, 결과를 비교하는 matcher, 모킹(mock) 함수 등 테스트에 필요한 기능을 한 번에 제공해 널리 쓰인다.
- **React Testing Library**: 컴포넌트를 렌더링하고, 사용자가 보는 방식(텍스트, 역할)으로 요소를 찾아 상호작용하는 도구.

| API | 역할 |
| --- | --- |
| `describe` | 관련 테스트를 그룹으로 묶음 |
| `test` / `it` | 테스트 하나 |
| `expect(...).matcher()` | 결과 검증. `toBe`, `toEqual`, `toHaveBeenCalledTimes`, `toHaveTextContent` 등 |
| `jest.fn()` | 호출 여부·횟수를 기록하는 가짜 함수 |
| `render`, `screen.getByText`, `fireEvent` | 렌더링, 요소 찾기, 이벤트 발생 |

- `toHaveTextContent` 같은 DOM 전용 matcher는 `@testing-library/jest-dom`을 설정해야 쓸 수 있다.
- 아래 예제는 `fireEvent`로 이벤트를 직접 발생시키지만, Testing Library 문서는 실제 사용자 동작(포커스 이동, 키 입력 순서 등)을 흉내 내는 **`@testing-library/user-event`** 를 우선 쓰고, user-event가 지원하지 않는 경우에만 `fireEvent`를 쓰라고 권한다.

```jsx
import userEvent from '@testing-library/user-event'

const user = userEvent.setup()
await user.click(screen.getByText('완료'))
```

## 예제: Todo 앱

### Item: 할 일 하나

먼저 테스트를 쓴다. 할 일 제목과 "완료" 버튼이 보여야 하고, 버튼을 누르면 완료 처리 함수가 한 번 호출되어야 한다.

```jsx
// Item.test.jsx
import { render, fireEvent } from '@testing-library/react'
import Item from './Item'

test('Item', () => {
  const task = { id: 1, title: '아무 일도 하지 않기' }
  const handleClick = jest.fn()

  const { container, getByText } = render(<Item task={task} onClickDelete={handleClick} />)

  expect(container).toHaveTextContent('아무 일도 하지 않기')
  expect(container).toHaveTextContent('완료')

  fireEvent.click(getByText('완료'))
  expect(handleClick).toHaveBeenCalledTimes(1)
})
```

아직 `Item`이 없으므로 테스트는 실패한다(Red). 이제 테스트를 통과하도록 `Item`을 만든다(Green).

```jsx
// Item.jsx
export default function Item({ task, onClickDelete }) {
  return (
    <li>
      {task.title}
      <button type="button" onClick={() => onClickDelete(task.id)}>완료</button>
    </li>
  )
}
```

### List: 행동(context)별 테스트

**BDD(Behavior Driven Development)** 스타일은 맥락 있는 행동을 테스트 단위로 보고, `context`로 상황을 나눈다. 비개발자도 읽을 수 있게 설명을 써서 협업에 도움이 된다. (`context`는 jest-plugin-context 등이 제공하는 `describe`의 별칭이다.)

```jsx
// List.test.jsx
describe('List', () => {
  const handleClickDelete = jest.fn()

  function renderList(tasks) {
    return render(<List tasks={tasks} onClickDelete={handleClickDelete} />)
  }

  context('할 일이 있으면', () => {
    it('할 일 목록을 보여 준다', () => {
      const tasks = [{ id: 1, title: '청소하기' }, { id: 2, title: '공부하기' }]
      const { container } = renderList(tasks)
      expect(container).toHaveTextContent('청소하기')
      expect(container).toHaveTextContent('공부하기')
    })
  })

  context('할 일이 없으면', () => {
    it('할 일이 없다는 메시지를 보여 준다', () => {
      const { container } = renderList([])
      expect(container).toHaveTextContent('할 일이 없어요!')
    })
  })
})
```

```jsx
// List.jsx
export default function List({ tasks, onClickDelete }) {
  if (tasks.length === 0) {
    return <p>할 일이 없어요!</p>
  }
  return (
    <ol>
      {tasks.map((task) => (
        <Item key={task.id} task={task} onClickDelete={onClickDelete} />
      ))}
    </ol>
  )
}
```

### 상태 관리와 TDD

React의 관심사는 **상태를 화면에 반영하는 것(state reflection)** 이다. Hooks 이전의 Redux 생태계에서는 컴포넌트를 둘로 나누는 패턴이 널리 권장되었다(레거시 패턴 — 아래 참고).

- **Presentational 컴포넌트**: props를 받아 보여 주기만 한다(`List`, `Item`).
- **Container 컴포넌트**: store에서 상태를 가져와 Presentational에 넘긴다(`ListContainer`).

이렇게 책임을 나누면 단일 책임 원칙을 자연스럽게 지키게 되고, 불필요한 의존성이 줄어 테스트도 쉬워진다. 상태를 바꾸는 reducer는 순수 함수라서 "이 상태에 이 액션을 주면 이 상태가 나온다"를 그대로 테스트할 수 있고, 그 테스트가 곧 API 사용 예시 문서가 된다.

```javascript
// reducer.test.js
describe('reducer', () => {
  describe('deleteTask', () => {
    it('해당 id의 할 일을 지운다', () => {
      const state = { tasks: [{ id: 1, title: '청소하기' }] }
      const newState = reducer(state, deleteTask(1))
      expect(newState.tasks).toHaveLength(0)
    })
  })
})
```

Container 테스트에서는 실제 store 대신 가짜 상태(fixture)와 모킹한 `useSelector`/`useDispatch`를 넣어 테스트한다.

> 참고: Presentational/Container 분리는 이 패턴을 알린 Dan Abramov 본인이 2019년에 "더 이상 컴포넌트를 이렇게 나누라고 권하지 않는다(자연스럽게 맞는 코드베이스라면 쓸 만하다)"고 덧붙인 패턴이다. Hooks가 래퍼 컴포넌트 없이 같은 관심사 분리를 해 주기 때문이다. 지금은 컴포넌트 안에서 `useSelector`/커스텀 훅으로 상태를 읽고, Redux 공식 문서는 훅 모킹 대신 실제 store를 넣어 렌더링하는 통합 테스트를 권한다. "보여 주는 로직과 상태 로직을 분리하면 테스트가 쉬워진다"는 원리는 그대로 유효하다.

## No Silver Bullet

TDD는 만능이 아니다. 테스트를 통과하면서도 좋은 설계 원칙에 어긋난 코드는 얼마든지 있고, 단기적으로는 도입 비용이 크다는 현실이 가장 큰 장벽이다.

그럼에도 도입할 이유:

- 프로젝트가 커질수록 **미래의 큰 버그를 현재의 작은 실패로** 끌어온다. 덩어리가 작을 때 고치는 편이 훨씬 싸다.
- 요구사항을 기능별로 명확히 하는 습관이 생기고, 구현이 아니라 **인터페이스에 집중**하게 되어 설계가 좋아진다.
- 장기적으로 비용과 시간을 줄인다는 사례가 많다.

현실적인 도입 전략은 다음과 같다.

1. 먼저 **단일 책임 원칙**부터 지켜서 평소 디버깅 시간을 줄인다.
2. 비즈니스 상황에 맞춰 천천히, 중요한 흐름의 E2E 테스트부터 시작한다.
3. 내 코드가 항상 100점일 필요는 없다. 원칙을 세우고 지켜 가는 것 자체에 의미가 있다.

## 참고 자료

- 켄트 벡, 『테스트 주도 개발』 ([요약 정리](https://www.rinae.dev/posts/tdd-by-example-summary))
- 『클린 코드를 위한 테스트 주도 개발』, 로버트 C. 마틴 『클린 코드』
- [FEConf: 프론트엔드에서 TDD가 가능하다는 것을 보여드립니다](https://www.youtube.com/watch?v=L1dtkLeIz-M)

## 핵심 정리

- TDD = Red(실패하는 테스트) → Green(통과) → Refactor, 목표는 작동하는 깔끔한 코드.
- 핵심은 테스트 가능한 코드: 관심사의 분리와 단일 책임 원칙.
- Jest(`describe`/`it`/`expect`/`jest.fn`) + React Testing Library(`render`/`fireEvent`)로 컴포넌트를 테스트한다.
- 보여 주는 로직과 상태 로직을 분리하고(예전엔 Presentational / Container, 지금은 커스텀 훅), 순수 함수 reducer로 상태 로직을 테스트하기 쉽게 만든다.
- 상호작용은 `fireEvent`보다 `user-event`, Redux 연결 컴포넌트는 훅 모킹 대신 실제 store로 통합 테스트한다.
- 만능은 아니다. 설계 습관부터 들이고 상황에 맞게 점진적으로 도입한다.

관련 노트: [[software-testing|소프트웨어 테스트(테스트 레벨과 기법)]]
