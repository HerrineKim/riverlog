---
title: "프론트엔드에서의 TDD"
concept: "TDD"
summary: "실패하는 테스트를 먼저 쓰고 통과시킨 뒤 리팩터링하는 TDD를 프론트엔드에 적용하는 방법. 목표와 사이클, 이점과 오해, 테스트하기 좋은 코드, Testing Library 예제, 현실적인 도입 순서."
tags: ["testing", "tdd", "react", "jest"]
source: til
date: "2026-10-13"
---

## TDD란

**TDD(Test Driven Development, 테스트 주도 개발)** 는 기능 코드보다 **테스트를 먼저 작성**하고, 그 테스트를 통과하는 코드를 만드는 개발 방식이다. 켄트 벡이 정리한 목표는 **"작동하는 깔끔한 코드(Clean code that works)"** 다. 먼저 테스트로 **작동하는** 코드를 만들고, 그다음 리팩터링으로 **깔끔한** 코드를 만든다.

```text
테스트 목록 작성 → [Red] 실패하는 테스트 하나 → [Green] 통과하는 최소한의 코드
                    ↑                                         ↓
                    └────── [Refactor] 동작을 유지하며 중복 제거 ┘
```

| 단계 | 할 일 |
| --- | --- |
| 목록 | 필요한 동작과 사용 예를 적는다 |
| Red | 실패하는 테스트를 하나 추가한다. 실패 메시지가 무엇이 빠졌는지 말해 줘야 한다 |
| Green | 테스트를 통과하는 가장 단순한 코드를 쓴다 |
| Refactor | 테스트가 통과하는 상태에서 중복을 없애고 이름을 다듬는다 |

"두려움이 지루함으로 바뀔 때까지 테스트를 작성하라"는 말처럼, 코드에 대한 불안이 사라질 만큼 신뢰가 쌓일 때까지 반복한다.

## 왜: 이점과 오해

| TDD가 주는 것 | TDD가 아닌 것 |
| --- | --- |
| 코드를 쓰기 전에 요구사항과 인터페이스를 먼저 생각하게 해 **좋은 설계를 유도**한다 | 오류 없는 완벽한 프로그램의 보장. 테스트를 통과하면서도 설계 원칙에 어긋난 코드는 얼마든지 있다 |
| 테스트가 **예제로 표현된 스펙**이 되어 협업과 유지보수를 돕는다 | 설계 방법론 자체. 설계를 대신하지 않고, 잘못 디딘 곳을 알려 주는 **지뢰 탐지기**에 가깝다 |
| **미래의 큰 버그를 현재의 작은 실패로** 끌어온다. 덩어리가 작을 때 고치는 편이 싸다 | 공짜. 단기적으로는 도입 비용이 크고, 효과는 늦게 나타난다 |

테스트가 일정에서 가장 먼저 밀려나는 이유도 마지막 줄에 있다. 그래서 도입은 전략이 필요하다(아래 「도입 전략」).

## 테스트하기 좋은 코드

사이클은 단순하지만 실제로 어려운 것은 **테스트 가능한(testable) 코드**를 만드는 일이다. 여러 단계의 처리가 한 함수에, UI가 한 컴포넌트에 몰리면 테스트를 쓰기도, 버그 위치를 찾기도 어렵다.

- **관심사의 분리**: 각 부분이 하나의 관심사만 다루게 나눈다([[separation-of-concerns|관심사의 분리]]).
- **단일 책임 원칙(SRP)**: 하나의 모듈은 하나의 바뀔 이유만 가진다.
- **보여 주는 로직과 상태 로직을 나눈다.** 상태 로직은 커스텀 훅이나 순수 함수(reducer)로 빼면 "이 상태에 이 액션을 주면 이 상태가 나온다"를 그대로 테스트할 수 있다.
- 상태 저장소와 연결된 컴포넌트는 훅을 모킹하지 않고 **실제 store를 넣어 렌더링하는 통합 테스트**로 검증한다. 과거에는 Presentational/Container 컴포넌트로 나누고 Container의 `useSelector`를 모킹했지만, 지금은 커스텀 훅이 같은 분리를 맡는다.

좋은 설계가 있어야 TDD가 잘 되고, TDD를 하면 좋은 설계로 유도된다. 테스트하기 어려운 입출력을 얇게 떼어 내는 방법은 [[humble-object-pattern|험블 객체 패턴]]에 있다.

## 예제: 할 일 항목

도구(Vitest·Jest, Testing Library, user-event)의 API는 [[frontend-test-types|프론트엔드 테스트의 종류와 도구]]에 정리했다. 예제는 Vitest 기준이고, Jest라면 `vi.fn()`을 `jest.fn()`으로 바꾼다.

**Red.** 할 일 제목과 "완료" 버튼이 보이고, 버튼을 누르면 완료 처리 함수가 그 id로 한 번 호출되어야 한다. 아직 `Item`이 없으므로 실패한다.

```jsx
// Item.test.jsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Item from './Item'

test('완료 버튼을 누르면 해당 할 일의 id로 onComplete를 호출한다', async () => {
  const user = userEvent.setup()
  const onComplete = vi.fn()
  render(<Item task={{ id: 1, title: '청소하기' }} onComplete={onComplete} />)

  expect(screen.getByText('청소하기')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: '완료' }))

  expect(onComplete).toHaveBeenCalledWith(1)
})
```

**Green.** 테스트를 통과하는 최소한의 코드를 쓴다.

```jsx
// Item.jsx
export default function Item({ task, onComplete }) {
  return (
    <li>
      {task.title}
      <button type="button" onClick={() => onComplete(task.id)}>완료</button>
    </li>
  )
}
```

**Refactor.** 테스트가 초록인 상태에서 이름·구조를 다듬는다. 다음 테스트("할 일이 없으면 안내 문구를 보여 준다")로 넘어가 같은 사이클을 반복한다.

- 요소는 `getByRole`·`getByText`처럼 **사용자가 화면을 찾는 방식**으로 찾는다. 역할로 찾을 수 있게 마크업하는 법은 [[a11y-driven-testing|접근성 기반 UI 테스트 자동화]]에 있다.
- 상황별로 묶고 싶으면 `describe('할 일이 없으면', ...)`처럼 맥락을 이름으로 쓴다(BDD 스타일).

## 도입 전략

1. 먼저 **단일 책임 원칙**부터 지켜서 평소 디버깅 시간을 줄인다. 테스트하기 좋은 구조가 먼저다.
2. 모든 코드에 TDD를 적용하지 않는다. **규칙이 복잡하고 깨지면 아픈 로직**(계산, 상태 전이, 검증)부터 적용한다.
3. UI 전체는 중요한 사용자 흐름의 E2E·통합 테스트로 덮고, 비즈니스 상황에 맞춰 천천히 넓힌다.

## 참고 자료

- 켄트 벡, 『테스트 주도 개발』 ([요약 정리](https://www.rinae.dev/posts/tdd-by-example-summary))
- [FEConf: 프론트엔드에서 TDD가 가능하다는 것을 보여드립니다](https://www.youtube.com/watch?v=L1dtkLeIz-M)

## 정리

- TDD = Red(실패하는 테스트) → Green(통과) → Refactor. 목표는 작동하는 깔끔한 코드.
- TDD는 설계를 유도하는 지뢰 탐지기이지 완벽함의 보장이 아니다.
- 핵심은 테스트 가능한 코드다. 관심사를 나누고, 상태 로직은 커스텀 훅·순수 함수로 뺀다.
- 컴포넌트는 `user-event`와 `getByRole`로 사용자처럼 테스트하고, store 연결은 실제 store로 통합 테스트한다.
- 깨지면 아픈 로직부터 점진적으로 도입한다.

관련 노트: [[software-testing|소프트웨어 테스트(테스트 레벨과 기법)]], [[bdd-sdd-task-design|BDD·SDD로 기획서를 태스크로 나누기]], [[frontend-test-types|프론트엔드 테스트의 종류와 도구]], [[humble-object-pattern|험블 객체 패턴]]
