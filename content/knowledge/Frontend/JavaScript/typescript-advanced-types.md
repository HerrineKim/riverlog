---
title: "TypeScript로 동적인 코드에 정적 타입 입히기"
concept: "TypeScript Types"
summary: "Express식 라우터를 예로, 리터럴 유니온·never 완전성 검사·제네릭·제네릭 기본값·템플릿 리터럴 타입·infer를 쓴 재귀 조건부 타입으로 '경로 문자열에서 매개변수 이름을 뽑아 req.params 타입을 만드는' 과정을 정리한다. 동적인 JS의 동작을 실행 전에 검사하는 것이 TypeScript의 목적이다."
tags: ["typescript", "javascript", "frontend"]
source: other
date: "2026-10-13"
sources: ["https://webactually.com/2021/02/23/%ed%83%80%ec%9e%85%ec%8a%a4%ed%81%ac%eb%a6%bd%ed%8a%b8%ec%97%90%ec%84%9c-%eb%8f%99%ec%a0%81%c2%b7%ec%a0%95%ec%a0%81-%ed%83%80%ec%9e%85-%ec%82%ac%ec%9a%a9%ed%95%98%ea%b8%b0/", "https://www.typescriptlang.org/docs/handbook/2/types-from-types.html"]
---

> Stefan Baumgartner의 「타입스크립트에서 동적·정적 타입 사용하기」(웹액츄얼리 번역, 2021.02)를 바탕으로 재구성한 노트입니다.

## 왜 타입을 다듬나

"JavaScript에는 타입이 없다"는 말은 틀렸다. 타입은 있지만 **그것을 적어 둘 공식적인 방법이 없을 뿐**이다. 개발자가 머릿속에 들고 있던 규칙("이 콜백은 GET 요청만 받는다", "상태 코드는 정해진 숫자뿐이다")을 타입으로 옮기면, 실행하기 전에 컴파일러가 실수를 잡는다.

다음 코드는 세 줄에 버그가 셋이다.

```javascript
app.get('/api/users/:userID', (req, res) => {
  if (req.method === 'POST') {          // GET 핸들러인데 POST를 검사한다 → 영원히 응답 없음
    res.status(20).send({                 // 20은 유효한 상태 코드가 아니다
      message: 'Hello ' + req.params.userId,  // userID 오타
    })
  }
})
```

아래 단계를 거치면 세 버그가 모두 컴파일 오류가 된다.

## 1. 기본 타입: 모양부터 적는다

```typescript
type ServerRequest = { method: string; params: Record<string, string> }
type ServerReply = { send: (obj?: unknown) => void; status: (code: number) => ServerReply }
type CallbackFn = (req: ServerRequest, reply: ServerReply) => void
// 3단계 이후에는 CallbackFn<Met, Par>도 같은 제네릭을 받아 ServerRequest<Met, Par>에 넘긴다
```

모양은 잡혔지만 `method`는 아무 문자열, `status`는 아무 숫자나 받는다.

## 2. 리터럴 유니온: 값의 집합을 좁힌다

`string`은 모든 문자열의 집합이다. 가능한 값만 나열한 **리터럴 타입의 유니온**은 그 부분집합이다.

```typescript
type Methods = 'GET' | 'POST' | 'PUT' | 'DELETE'
type StatusCode = 200 | 201 | 301 | 400 | 404 | 500 // 필요한 만큼
```

`switch (req.method)`에서 모든 경우를 처리하면 `default`의 값은 `never`가 된다. 새 메서드를 유니온에 추가하고 처리를 잊으면 여기서 오류가 난다(완전성 검사).

## 3. 제네릭: 호출하는 쪽이 부분집합을 정한다

`app.get`에서는 `method`가 `'GET'`뿐이다. 요청 타입을 **매개변수를 받는 타입**으로 바꾼다.

```typescript
type ServerRequest<Met extends Methods, Par extends string = string> = {
  method: Met
  params: Record<Par, string>
}
```

- `Met extends Methods`는 "Methods의 부분집합만 받는다"는 제약이다.
- `Par extends string = string`은 기본값이 있는 제네릭이다. 지정하지 않으면 예전처럼 아무 키나 허용한다.
- `app.get`은 `ServerRequest<'GET'>`을 넘기므로 `req.method === 'POST'` 비교 자체가 오류가 된다.

## 4. 템플릿 리터럴 타입: 문자열 패턴을 타입으로

TypeScript 4.1부터 타입 수준에서 템플릿 문자열을 쓸 수 있다.

```typescript
type HasRouteParam<Par extends string> =
  | `${string}/:${Par}`
  | `${string}/:${Par}/${string}`
```

경로 문자열에 `:userID`가 실제로 들어 있어야 통과한다. 하지만 아직 매개변수 이름을 직접 적어야 하고, 매개변수가 여럿이면 다루기 어렵다.

## 5. 제네릭 바인딩과 추론: 인자에서 타입을 뽑는다

```typescript
function identity<T>(arg: T): T { return arg }
const a = identity<string>('yes') // T = string
const b = identity('yes')          // T = "yes" (리터럴로 추론)
```

제네릭을 명시하지 않으면 TypeScript는 인자를 보고 **가장 좁은 리터럴 타입**으로 추론한다. 이를 이용해 경로 문자열 자체를 타입으로 받는다.

```typescript
function get<Path extends string>(
  path: Path,
  cb: CallbackFn<'GET', ParseRouteParams<Path>>,
): void
```

## 6. 조건부 타입 + infer + 재귀: 매개변수 이름 추출

```typescript
type ParseRouteParams<Rte> =
  Rte extends `${string}/:${infer P}/${infer Rest}`
    ? P | ParseRouteParams<`/${Rest}`>
    : Rte extends `${string}/:${infer P}`
      ? P
      : never

type T = ParseRouteParams<'/api/users/:userID/orders/:orderID'>
// "userID" | "orderID"
```

| 문법 | 역할 |
| --- | --- |
| `A extends B ? X : Y` | 타입 수준의 삼항 연산자(조건부 타입) |
| `infer P` | 패턴에 맞는 부분을 새 타입 변수로 꺼낸다 |
| 자기 자신 호출 | 남은 문자열에 같은 규칙을 반복 적용한다 |
| `never` | "더 이상 없음". 유니온에서는 사라진다 |

이제 호출 코드는 처음의 JavaScript와 똑같이 생겼지만, `req.params.userId` 오타·`POST` 비교·잘못된 상태 코드가 모두 편집기에서 바로 빨간 줄이 된다.

## 언제 이렇게까지 하나

| 상황 | 판단 |
| --- | --- |
| 라이브러리·프레임워크의 공개 API | 사용자 코드를 지켜 주는 효과가 커서 투자할 만하다. 실제로 Express 타입, 라우터 라이브러리, tRPC 등이 이런 기법을 쓴다 |
| 앱 내부의 일회성 코드 | 리터럴 유니온과 기본 제네릭이면 대부분 충분하다. 복잡한 조건부 타입은 읽는 비용이 크다 |

타입이 복잡해지면 오류 메시지도 길어진다. 타입 테스트(`expectTypeOf` 등)와 짧은 별칭으로 의도를 드러낸다.

## 정리

- 타입은 머릿속 규칙을 컴파일러가 검사하게 적어 두는 것이다.
- 리터럴 유니온으로 값의 집합을 좁히고, `never`로 빠진 경우를 잡는다.
- 제네릭은 호출하는 쪽이 부분집합을 고르게 한다. 기본값으로 하위 호환을 지킨다.
- 템플릿 리터럴 타입 + `infer` + 재귀로 문자열에서 타입을 뽑아낼 수 있다.
- **동적인 JS 코드의 모양은 그대로 두고, 검사만 정적으로 한다.**

관련 노트: [[typescript-coding-convention|TypeScript 코딩 컨벤션]], [[template-literals|템플릿 리터럴과 태그드 템플릿]], [[variables-and-types|변수와 데이터 타입]], [[routing-crud|Express 라우팅과 CRUD API]]
