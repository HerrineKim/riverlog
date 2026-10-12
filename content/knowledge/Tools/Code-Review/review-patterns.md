---
title: "코드 리뷰에서 자주 나온 지적"
concept: "Review Patterns"
summary: "코드 리뷰에서 자주 반복되는 JavaScript·React 코드 지적(const, else, 기본값, 불리언 이름, 빈 문자열 비교, 비동기 에러, 불변 업데이트, props 설계 등)을 고친 코드와 함께 정리."
tags: ["code-review", "javascript", "react", "clean-code"]
source: notion
---

코드 리뷰에서 **반복해서 나오는 지적**만 모았다. 하나하나는 작지만, 습관이 되면 코드의 의도가 훨씬 분명해진다. 각 항목은 "왜 문제인가 → 고친 코드" 순서로 정리했다.

## 1. 재할당하지 않으면 `const`

`let`은 "이 값이 나중에 바뀐다"는 신호다. 바뀌지 않는 값에 `let`을 쓰면 읽는 사람이 재할당 지점을 찾아 헤맨다.

```javascript
// Before
let alert = { callback: () => router.push('/login'), cancel: () => {} }
// After
const alert = { callback: () => router.push('/login'), cancel: () => {} }
```

## 2. 나머지 모든 경우는 `else`

조건의 반대 경우를 `else if`로 다시 쓰면, 읽는 사람은 "둘 다 아닌 경우가 있나?"를 고민하게 된다.

```javascript
// Before
if (!isCorp) { /* ... */ } else if (isCorp) { /* ... */ }
// After
if (!isCorp) { /* ... */ } else { /* ... */ }
```

## 3. 기본값은 인자를 만들 때 미리

함수 호출부에서 `||` 방어 코드를 줄줄이 쓰기보다, 변수를 만들 때 기본값을 처리하면 호출부가 짧아지고 **단축 속성명**을 쓸 수 있다. 필드가 여럿이면 기본값 객체와 spread를 쓴다.

```javascript
// Before
await getList({
  yearMonth: date ? date.slice(0, 6) : '',
  pNumber: value.pNumber || '',
  exNo: value.exNo || '',
})

// After
const DEFAULT_PARAMS = { yearMonth: '', pNumber: '', exNo: '' }
const yearMonth = date?.slice(0, 6) ?? ''
await getList({ ...DEFAULT_PARAMS, ...value, yearMonth })
```

`||`는 `0`, `''`, `false`도 기본값으로 바꿔 버린다. `null`/`undefined`일 때만 기본값을 쓰려면 `??`를 쓴다.

## 4. 불리언 변수 이름은 질문처럼

`isOpen`, `shouldReload`, `hasError`처럼 읽으면 예/아니오로 답할 수 있는 이름을 붙인다. 아래처럼 "재장전해야 하는가?"가 변수 이름에 그대로 드러나면 조건문이 문장처럼 읽힌다.

```typescript
class Gun {
  private bulletCount = 8
  private shouldReload = false

  shoot() {
    if (this.shouldReload) this.reload()
    this.bulletCount--
    if (this.bulletCount <= 0) this.shouldReload = true
  }

  reload() {
    this.bulletCount = 8
    this.shouldReload = false
  }
}
```

모달·드롭다운처럼 **보임 여부**를 정하는 값도 문자열이나 숫자 대신 `isOpen` 같은 불리언 state로 둔다.

`is`·`has`·조동사별 형태 표와 `is` + 동사원형 같은 흔한 실수는 [[boolean-naming|불리언 변수 이름 짓기]]에 정리했다.

## 5. 빈 문자열 검사는 의도대로

`value !== ''`는 "빈 문자열이 아니다"만 확인한다. `null`·`undefined`도 `''`와 **다르므로** 통과해 버린다. (`!=`도 마찬가지로 `null != ''`는 `true`다. 느슨한 비교에서 `null`은 `undefined`와만 같다.)

```javascript
// "값이 있는 문자열"인지 확인하고 싶다면
if (typeof account === 'string' && account.trim() !== '') { /* ... */ }

// 문자열 타입이 보장된다면 truthy 검사로 충분
if (account) { /* ... */ }
```

비교는 항상 `===`/`!==`를 쓰고([연산자](/knowledge/dictionary/frontend/javascript/operators-and-control-flow)), 무엇을 걸러야 하는지(빈 문자열? 공백? null?)를 먼저 정한다.

## 6. 없을 수도 있는 값은 옵셔널 체이닝

조회 결과가 `null`일 수 있는 곳(예: 첫·마지막 항목의 이전/다음 항목)에서 바로 속성에 접근하면 런타임 에러가 난다.

```javascript
// Before: 마지막 항목이면 nextItem이 null → TypeError
return { nextKey: nextItem.key }
// After
return { nextKey: nextItem?.key }
```

## 7. 비동기 에러는 `try/catch`로 못 잡는 경우가 있다

`subscribe`나 콜백처럼 **나중에** 실행되는 코드에서 난 에러는 바깥의 `try/catch`가 잡지 못한다. Observable을 Promise로 바꿀 때는 `error` 콜백을 연결하거나 RxJS의 `firstValueFrom`/`lastValueFrom`을 쓴다.

```typescript
// Before: catch에 절대 도달하지 않고, 에러가 나면 Promise가 영원히 pending
const toPromise = <T>(source: Observable<T>) =>
  new Promise<T>((resolve, reject) => {
    try {
      source.subscribe({ next: resolve })
    } catch (err) {
      reject(err)
    }
  })

// After
const toPromise = <T>(source: Observable<T>) =>
  new Promise<T>((resolve, reject) => {
    source.subscribe({ next: resolve, error: reject })
  })

// 또는 (RxJS 7+)
import { firstValueFrom } from 'rxjs'
const value = await firstValueFrom(source)
```

또 어떤 API(일부 gRPC 클라이언트 등)는 잘못된 요청에도 에러 대신 `null`을 돌려준다. 이런 경우 `catch`가 아니라 **반환값을 검사**해야 한다. 같은 함수 안에서는 성공·실패 모두 같은 형태(예: 항상 Promise)로 반환하도록 일관성을 맞춘다.

## 8. 에러 로그는 `console.error`로

`console.log(err)`와 `console.error(err)`는 둘 다 에러 객체를 출력하지만, `console.error`는 **에러 레벨**로 기록되어 브라우저 콘솔에서 빨간색·필터로 구분되고 Node.js에서는 stderr로 나간다. 디버깅용 출력은 `log`, 실패 처리는 `error`로 나눠 쓰고, 운영 환경에서는 Sentry 같은 에러 추적 도구로 보낸다.

## 9. 불변 업데이트: 원본 배열·객체를 건드리지 않기

Vuex·Redux 같은 스토어의 state나 React state를 직접 바꾸면 에러가 나거나 화면이 갱신되지 않는다. `map` 안에서 spread로 **새 객체**를 만들어 반환한다.

```javascript
// Before: [...undefined]는 TypeError, 배열은 항상 truthy라 || []는 의미가 없다
const copyList = [...value.beforeList] || []

// After
const newList = (value.beforeList ?? []).map((item) => ({
  ...item,
  label: item.name.replace('!', ''),
}))
```

spread는 **얕은 복사**다. 객체 안의 중첩 객체까지 바꿔야 한다면 그 단계도 spread하거나 `structuredClone`을 쓴다.

## 10. props는 적을수록 좋다

props가 많다는 것은 관리하고 파악해야 할 지점이 많다는 뜻이다. Todo 앱에서 "생성용, 수정용, 삭제용" props를 각각 정의할 필요가 있는지 따져 보면, 대부분 항목 데이터와 콜백 한두 개로 충분하다.

```tsx
// Before
<TodoItem todo={todo} onCreate={...} onUpdateTitle={...} onToggle={...} onDelete={...} />
// After
<TodoItem todo={todo} onChange={handleChange} />  // 변경 종류는 인자로 구분
```

## 11. 컴포넌트 선언 방식은 팀에서 하나로

`function` 선언과 화살표 함수는 동작이 거의 같다. 차이는 `function` 선언은 호이스팅되고 `export default function Name() {}`처럼 선언과 내보내기를 한 줄에 쓸 수 있다는 정도다. 어느 쪽이든 **한 프로젝트 안에서 일관되게** 쓰는 것이 중요하다.

## 12. 입력이 많은 폼은 form 요소를 활용

입력마다 state를 두는 것이 일반적이지만, 입력이 아주 많거나 제출 시점에만 값이 필요하다면 `<form>`의 `onSubmit`에서 `FormData`로 한 번에 읽는 비제어 방식도 있다. 입력할 때마다 리렌더링되지 않는다.

```tsx
function SignUpForm() {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const name = formData.get('name')
    const agreed = formData.get('agree') === 'on'
    // ...
  }
  return (
    <form onSubmit={handleSubmit}>
      <input name="name" type="text" />
      <input name="password" type="password" />
      <input name="agree" type="checkbox" />
      <button type="submit">가입</button>
    </form>
  )
}
```

## 13. 그 밖에

- **크기 단위**: 디바이스 대응이 필요한 스타일은 `px`보다 `rem`(또는 프로젝트의 rem 변환 함수)을 쓴다.
- **날짜 포맷**: 문자열을 잘라 붙이지 말고 프로젝트에 있는 날짜 라이브러리의 `format()`을 쓴다([날짜 라이브러리](/knowledge/dictionary/frontend/javascript/date-libraries)).
- **처음 만드는 구조는 레퍼런스부터**: Todo 앱처럼 흔한 기능은 잘 짜인 예제 코드를 먼저 보고 시작하면 구조 설계에서 덜 헤맨다.
- **복사해 온 코드도 이해하고 쓴다**: "명세에 있던 코드를 그대로 붙였다"는 리뷰에서 가장 설득력 없는 답이다.

## 핵심 정리

| 지적 | 한 줄 처방 |
| --- | --- |
| `let` 남용 | 재할당 없으면 `const` |
| `else if (!x)` / `else if (x)` | `else` |
| 호출부의 `||` 범벅 | 기본값 객체 + spread, `??` |
| 모호한 불리언 이름 | `is`/`should`/`can`/`has` |
| `!== ''` 만으로 검사 | 무엇을 거를지 정하고 타입까지 확인 |
| 비동기 콜백 안 에러 | `error` 콜백, `firstValueFrom` |
| state 직접 수정 | `map` + spread로 새 객체 |
| props 과다 | 데이터 + 콜백 한두 개로 |

관련 노트: [[async-await|async/await와 비동기 에러 처리]], [[forms|폼과 제어 컴포넌트]], [[principles|코드 리뷰 원칙]], [[typescript-coding-convention|TypeScript 코딩 컨벤션]], [[boolean-naming|불리언 변수 이름 짓기]]
