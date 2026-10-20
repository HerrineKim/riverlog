---
title: "프론트엔드에서 의존성 관리하기"
concept: "Dependency"
summary: "의존성은 곧 변경에 노출되는 관계다. 변수는 스코프를 좁히고 값을 바꾸는 길을 하나로 만들고, 여러 곳이 쓰는 함수는 의존성 역전으로 계약에 기대게 하고, 타입은 API 응답이 아니라 잘 바뀌지 않는 도메인 타입에 기대게 한다."
tags: ["frontend", "react", "typescript", "architecture", "design"]
source: other
date: "2026-10-12"
sources: ["https://medium.com/@junep/%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C%EC%97%90%EC%84%9C-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%82%B4%ED%8E%B4%EB%B3%B4%EA%B8%B0-b242a2fd4e85"]
---

> 이문기의 글 「[프론트엔드에서 의존성 살펴보기](https://medium.com/@junep/%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C%EC%97%90%EC%84%9C-%EC%9D%98%EC%A1%B4%EC%84%B1-%EC%82%B4%ED%8E%B4%EB%B3%B4%EA%B8%B0-b242a2fd4e85)」(Medium, 2023.09)를 요약·재구성한 노트다. 코드는 설명용으로 줄여 다시 썼다.

## 의존성이란

A가 동작하려면 B가 필요하면 **A는 B에 의존한다**. 의존성(dependency)은 관계가 있다는 사실을, 결합도(coupling)는 그 관계가 얼마나 강한지를 말한다. 그래서 "의존성이 있다", "결합도가 강하다"처럼 쓴다.

의존성이 문제인 이유는 하나다. **의존하는 대상이 바뀌면 나도 바뀔 수 있다.** 작은 수정이 여러 파일로 번진다면 의존성 관리가 안 된 경우가 많다.

| 대상 | 문제가 되는 모습 | 대응 |
| --- | --- | --- |
| 변수(상태) | 여러 곳이 같은 변수를 읽고 쓴다 | 스코프 제한 + 값 바꾸는 함수 하나로 (캡슐화) |
| 함수·컴포넌트 | 공용 유틸이 쓰임새마다 매개변수·분기를 늘린다 | 그 자리만 따로 고치거나 의존성 역전 |
| 타입 | 모든 컴포넌트가 API 응답 타입에 기댄다 | 도메인 타입을 분리하고 컴포넌트가 props 타입을 스스로 정한다 |

## 1. 변수 의존성

프론트엔드에서 변수는 주로 **최근 값을 들고 있는 역할**을 한다. 사용자 입력 → 가공 → 변수 → 화면 출력. 변수는 만들기 쉬워서 의존성도 쉽게 생긴다.

`price`, `discount`를 이벤트 리스너 밖으로 꺼내 여러 리스너가 함께 쓰면 문제가 커진다.

- 이름 하나를 바꿔도 살펴볼 범위가 넓어진다.
- 누가 숫자를 넣고 누가 문자열을 넣는지 알 수 없어 쓰는 쪽이 모든 경우를 대비해야 한다.
- 화면에 보여 주는 곳이 늘수록 변수에 기대는 로직도 늘어난다.

해결은 **스코프를 좁히고, 값을 바꾸는 길을 정해 두는 것**이다. 바닐라 JS라면 즉시 실행 함수로 감싸고 `setPrice` 같은 함수로만 값을 넣는다. React에서는 이렇게 한다.

```tsx
const usePrice = (initial: number) => {
  const [price, setPriceState] = useState(initial);
  const setPrice = (value: string) => setPriceState(Number(value)); // 항상 숫자로
  return [price, setPrice] as const;
};

function PriceAndDiscount() {           // Page에서 분리해 접근 범위를 좁힌다
  const [price, setPrice] = usePrice(10000);
  const [discount, setDiscount] = useDiscount(0.1);
  return (/* input 두 개 + 할인가 출력 */);
}
```

- 상태와 그 상태를 다루는 이벤트를 **작은 컴포넌트로 옮긴다**. 큰 페이지에 두면 다른 코드가 가져다 쓸 가능성이 커진다.
- 커스텀 훅으로 **값이 항상 예상한 형태로 들어가게** 보장한다.
- 정리하면 캡슐화(encapsulation)다.

## 2. 함수·컴포넌트 의존성

`getNumber(str)`는 문자열에서 숫자만 남기는 유틸이다. 가격 입력, 전화번호 입력이 함께 쓴다. 그런데 "전화번호는 하이픈을 남겨 달라"는 요구가 온다.

| 선택 | 결과 |
| --- | --- |
| `getNumber`의 정규식을 바꾼다 | 가격 입력까지 깨진다. 공용 대상을 고치면 의존하는 모두가 흔들린다 |
| `getNumber(str, exception)`처럼 옵션을 붙인다 | 쓰임새마다 매개변수·분기가 쌓여 수정이 점점 어려워지고 이름도 안 맞게 된다 |
| 전화번호 리스너만 따로 고친다 | 단순하고 안전하다 |
| 의존성 역전 | 쓰는 쪽이 유틸이 아니라 **계약**에 기댄다 |

공용 컴포넌트도 똑같다. 여러 곳이 쓰는 컴포넌트에 props와 조건문이 계속 붙으면, 쓰는 쪽보다 커져 아무도 못 건드리는 덩어리가 된다.

### 의존성 역전

```ts
function parsePhoneNumber(value: string, parser: (value: string) => string) {
  return parser(value);
}

parsePhoneNumber(input, getNumber);                          // 기존
parsePhoneNumber(input, (s) => s.replace(/[^0-9-]/g, ''));   // 요구 변경
```

```text
전 : 전화번호 리스너 ──▶ getNumber ◀── 가격 리스너
후 : 전화번호 리스너 ──▶ parsePhoneNumber ──▶ 계약 (string) => string
                                                 ▲
                                            getNumber
```

코드 양은 오히려 늘었다. 이득은 **고칠 지점이 명확해진다**는 것이다. 파싱 방법을 바꾸려면 두 번째 인자만 바꾸면 된다는 메시지를 인터페이스가 전한다. 이제 `getNumber`가 계약을 지켜야 쓰일 수 있다. 방향이 뒤집혔다.

- JSDoc도 계약 역할을 하지만 문서에 가까워 **약한 계약**이다. TypeScript 타입은 어기면 IDE가 바로 알려 주는 **강한 계약**이다.
- 매번 이렇게 할 필요는 없다. 관리 자체도 비용이다. 의존성 때문에 코드가 꼬였을 때 떠올리면 된다.

## 3. 타입 의존성

게시글 API 응답 타입 `PostResponse`를 페이지, `PostDetail`, `Comments`가 모두 props 타입으로 쓴다고 하자. 같은 API를 수정 페이지에서도 부르게 되면 `PostResponse` 하나가 바뀔 때 영향받는 곳이 여섯 군데로 늘어난다.

### 단계별로 풀기

| 단계 | 방법 | 문제 |
| --- | --- | --- |
| 0 | 모든 곳이 `PostResponse`에 의존 | 응답 모양이 바뀌면 컴포넌트가 끌려간다 |
| 1 | `PostDetail` 안에 자기 `Post` 타입을 따로 선언 | 게시글 필드가 바뀌면 IDE가 못 찾아 줘 하나하나 손으로 고쳐야 한다. 더 나쁘다 |
| 2 | 공용 도메인 타입 `Post`를 분리하고 응답·컴포넌트가 모두 `Post`에 기댄다 | 의존 수는 늘지만 안정적이다 |

```ts
// types.ts — 도메인 타입
type Post = { id: number; title: string; content: string; /* ... */ };

// api — 응답은 도메인 타입 + 응답 고유 필드
type PostResponse = Post & { comments: Comment[] };

// 컴포넌트 — 필요한 만큼 스스로 깎고 더한다
function PostDetail(props: { post?: Omit<Post, 'userId'>; readonly?: boolean }) {}
```

**왜 2단계가 나은가.** `Post`가 바뀌려면 백엔드까지 함께 바뀌어야 한다. 즉 **잘 바뀌지 않는 대상**이다. 의존 수가 많아도 안정적인 것에 기대는 편이 낫다. 코드 전체가 `Post`라는 도메인에 기반한다고 보면 된다.

**props 타입의 책임은 컴포넌트에 있다.** `PostDetail`은 "게시글 정보를 받아 요소를 그린다"는 인터페이스를 갖는다. `Omit`·추가 props로 자기 필요를 스스로 표현하고, `Post`의 `createdAt`이 `string`으로 바뀌는 식의 변경은 컴파일 에러로 바로 드러난다.

### 미래를 미리 들이지 않기

DB 테이블에 `deletedAt`이 있다고 프론트의 `Post`에 미리 넣으면, 아직 아무도 안 쓰는 필드를 모든 사용처에서 `Omit`으로 빼야 한다. **현실이 아니라 미래를 걱정한 코드가 복잡도를 만든다.**

## 정리

- 의존성은 "변경에 노출된다"는 뜻이다. 의존 대상이 얼마나 자주 바뀌는지를 함께 봐야 한다.
- 변수: 접근 범위를 좁히고 값을 넣는 길을 하나로 만든다.
- 공용 함수·컴포넌트: 한 사용처의 요구로 공용 코드를 고치지 않는다. 꼬였으면 의존성 역전으로 계약에 기대게 한다.
- 타입: 자주 바뀌는 API 응답 대신 잘 바뀌지 않는 도메인 타입에 기대고, props 타입은 컴포넌트가 스스로 정한다.
- 어디까지 공용으로 두고 어디부터 각자 관리할지는 정답이 없다. 상황과 팀의 합의로 정한다.

관련 노트: [[frontend-solid|프론트엔드와 SOLID 원칙]], [[hooks|Hooks]], [[composition|합성]], [[module|NestJS Module과 Provider(DI)]], [[feature-sliced-design|Feature-Sliced Design]]
