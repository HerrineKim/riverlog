---
title: "예측 가능성을 높이는 전략"
concept: "Predictability"
summary: "예측 가능한 코드는 이름·파라미터·반환 값만 보고 동작을 알 수 있다. 라이브러리와 같은 이름으로 다른 동작을 하지 않고, 같은 종류의 함수는 반환 타입을 통일하고(Discriminated Union), 이름에 드러나지 않는 로깅 같은 숨은 로직은 호출부로 꺼낸다."
tags: ["frontend", "clean-code", "typescript", "code-review"]
source: other
date: "2026-10-17"
sources: ["https://frontend-fundamentals.com/code-quality/code/"]
---

> 토스의 「[Frontend Fundamentals: 코드 품질](https://frontend-fundamentals.com/code-quality/code/)」 예측 가능성 문서들을 바탕으로 재구성한 노트다.

## 예측 가능성이란

예측 가능성(Predictability)은 동료가 함수나 컴포넌트의 동작을 얼마나 예측할 수 있는지다. 예측 가능한 코드는 **일관된 규칙을 따르고, 이름·파라미터·반환 값만 보고도 동작을 알 수 있다.** 구현을 열어 봐야 안심할 수 있다면 예측 가능성이 낮다.

| 전략 | 깨지는 신호 |
| --- | --- |
| 이름 겹치지 않게 관리하기 | 같은 이름인데 미묘하게 다른 일을 한다 |
| 같은 종류의 함수는 반환 타입 통일하기 | 비슷한 훅마다 쓸 때마다 반환 타입을 확인한다 |
| 숨은 로직 드러내기 | 이름에 없는 부수 효과가 일어난다 |

## 1. 이름 겹치지 않게 관리하기

**같은 이름은 같은 동작을 해야 한다.** HTTP 라이브러리 `http`를 감싸 인증 토큰을 붙이는 모듈을 또 `http`라고 부르면, `http.get`을 부르는 사람은 단순한 GET을 기대하지만 실제로는 토큰 조회가 먼저 일어난다. 기대와 실제의 차이는 버그와 혼란스러운 디버깅으로 이어진다.

```ts
import { http as httpLibrary } from "@some-library/http";

// 라이브러리와 구분되는 이름, 동작을 말해 주는 메서드명
export const httpService = {
  async getWithAuth(url: string) {
    const token = await fetchToken();
    return httpLibrary.get(url, { headers: { Authorization: `Bearer ${token}` } });
  },
};
```

이름만 보고 "서비스가 만든 함수이고, 인증된 요청을 보낸다"는 것을 알 수 있다.

## 2. 같은 종류의 함수는 반환 타입 통일하기

### API 훅

`useUser`는 TanStack Query의 query 객체를, `useServerTime`은 `query.data`만 반환하면, 쓰는 사람은 매번 `data`를 꺼내야 하는지 확인해야 한다. **서버 API를 부르는 훅은 일관되게 query 객체를 반환**한다. 로딩·에러 상태도 같은 방식으로 다룰 수 있다.

```ts
function useUser() {
  return useQuery({ queryKey: ["user"], queryFn: fetchUser });
}

function useServerTime() {
  return useQuery({ queryKey: ["serverTime"], queryFn: fetchServerTime });
}
```

### 검증 함수

`checkIsNameValid`는 `boolean`을, `checkIsAgeValid`는 `{ ok, reason }` 객체를 반환하면 위험하다. 객체는 항상 truthy라서 `if (checkIsAgeValid(age))`는 **항상 참**이 된다. 같은 종류의 검증 함수는 모두 같은 모양을 반환하고, 반환 타입을 판별 유니온(Discriminated Union)으로 정의한다.

```ts
type ValidationResult = { ok: true } | { ok: false; reason: string };

function checkIsNameValid(name: string): ValidationResult {
  if (name.length === 0) return { ok: false, reason: "이름은 빈 값일 수 없어요." };
  if (name.length >= 20) return { ok: false, reason: "이름은 20자 이상 입력할 수 없어요." };
  return { ok: true };
}

const result = checkIsNameValid(name);
if (!result.ok) {
  result.reason; // ok가 false일 때만 reason에 접근할 수 있다
}
```

typescript-eslint의 `strict-boolean-expressions` 규칙을 켜면 객체를 조건식에 넣는 실수를 컴파일 단계에서 잡을 수 있다.

## 3. 숨은 로직 드러내기

이름·파라미터·반환 타입에 드러나지 않는 로직은 숨은 로직이다.

```ts
// ✗ 이름은 "잔액 조회"인데 로깅까지 한다
async function fetchBalance(): Promise<number> {
  const balance = await http.get<number>("...");
  logging.log("balance_fetched");
  return balance;
}
```

로깅을 원하지 않는 곳에서도 로그가 남고, 로깅이 실패하면 잔액 조회까지 깨진다. **함수에는 이름으로 예측되는 로직만 남기고**, 부수 효과는 호출부에서 드러나게 한다.

```tsx
async function fetchBalance(): Promise<number> {
  return http.get<number>("...");
}

<Button
  onClick={async () => {
    const balance = await fetchBalance();
    logging.log("balance_fetched");
    await syncBalance(balance);
  }}
>
  계좌 잔액 갱신하기
</Button>;
```

값을 돌려주는 함수가 상태를 바꾸지 않게 하는 일반 원칙은 명령-질의 분리다([[clear-code-principles|명확한 코드의 네 가지 원칙]]).

## 정리

- 이름·파라미터·반환 값이 동작에 대한 **약속**이다. 구현이 그 약속을 넘어서면 안 된다.
- 라이브러리와 같은 이름으로 다른 일을 하는 래퍼를 만들지 않는다.
- 같은 종류의 함수·훅은 반환 모양을 통일하고, 결과 타입은 판별 유니온으로 둔다.
- 로깅·저장 같은 부수 효과는 함수 안에 숨기지 말고 호출부에 드러낸다.

관련 노트: [[changeable-code-criteria|변경하기 쉬운 코드의 네 가지 기준]], [[clear-code-principles|명확한 코드의 네 가지 원칙]], [[typescript-advanced-types|TypeScript로 동적인 코드에 정적 타입 입히기]], [[tanstack-query|TanStack Query]], [[clean-code-functions-naming|클린 코드: 함수와 이름]]
