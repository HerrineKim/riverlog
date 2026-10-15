---
title: "숫자와 Math"
concept: "Number"
summary: "JavaScript의 숫자 타입 하나(double)로 생기는 일: 산술·나머지·거듭제곱 연산자, Math의 반올림·무작위 수, 문자열을 숫자로 바꾸는 방법의 차이, NaN·Infinity 판별, 0.1 + 0.2 오차와 돈은 정수 최소 단위로 다루는 원칙, Intl.NumberFormat으로 표시하기."
tags: ["javascript", "frontend", "computer-science"]
source: other
date: "2026-10-15"
sources: ["https://wesbos.com/javascript/01-the-basics/types-numbers", "https://wesbos.com/javascript/07-logic-and-flow-control/bedmas", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat"]
---

> Wes Bos의 「[Beginner JavaScript](https://wesbos.com/javascript)」 강의 노트를 바탕으로, MDN으로 확인해 재구성한 노트다.

## 숫자 타입은 하나다

JavaScript의 `number`는 정수와 실수를 구분하지 않는다. `100`과 `100.5`가 같은 타입이고, 내부적으로는 모두 **IEEE 754 배정밀도 부동소수점(double)** 이다. 비트 구조와 표현 범위는 [[data-representation|데이터의 표현]]에 있다. 2^53 − 1(`Number.MAX_SAFE_INTEGER`)을 넘는 정수는 정확하지 않으므로 `BigInt`(`10n`)나 문자열로 다룬다.

## 연산자

| 연산자 | 뜻 | 예 | 주의 |
| --- | --- | --- | --- |
| `+ - * /` | 사칙연산 | `20 / 3` → `6.666…` | 정수 나눗셈 연산자는 없다. `Math.floor(20 / 3)` → `6` |
| `%` | 나머지 | `20 % 3` → `2` | 부호는 왼쪽 피연산자를 따른다: `-7 % 3` → `-1` |
| `**` | 거듭제곱(ES2016) | `2 ** 10` → `1024` | 오른쪽부터 묶인다. `-2 ** 2`는 문법 오류라 `(-2) ** 2`로 쓴다 |

`%`는 "고르게 나누고 남은 개수", 짝수·홀수 판별(`n % 2 === 0`), 배열 인덱스 순환(`(i + 1) % length`)에 쓴다. 큰 수는 `1_000_000`처럼 밑줄로 자릿수를 끊어 쓸 수 있다(ES2021).

`+`만은 피연산자 중 하나가 문자열이면 **연결**이 된다. `'10' + 5`는 `'105'`, `'10' - 5`는 `5`다. 형변환 규칙 전체는 [[operators-and-control-flow|연산자와 제어문]]에 있다.

## Math

| 메서드 | 동작 | `2.5` / `-2.5` |
| --- | --- | --- |
| `Math.round(x)` | 가장 가까운 정수. `.5`는 **+∞ 쪽**으로 | `3` / `-2` |
| `Math.floor(x)` | 내림(더 작은 정수) | `2` / `-3` |
| `Math.ceil(x)` | 올림(더 큰 정수) | `3` / `-2` |
| `Math.trunc(x)` | 소수점 아래 버림(0 쪽으로) | `2` / `-2` |

`Math.max(...arr)`, `Math.min(...arr)`, `Math.abs(x)`도 자주 쓴다. 나이처럼 "아직 채우지 못한 값"은 `round`가 아니라 `floor`다.

`Math.random()`은 0 이상 1 미만의 실수를 준다. 정수 범위로 바꾸는 공식은 다음과 같다.

```javascript
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min
randomInt(1, 10) // 1~10 중 하나 (양 끝 포함)
```

`Math.random()`은 암호학적으로 안전하지 않다. 토큰·비밀번호처럼 예측되면 안 되는 값은 `crypto.getRandomValues()`나 `crypto.randomUUID()`를 쓴다.

## 문자열을 숫자로

| 방법 | `'42'` | `'42px'` | `''` | `'3.14'` |
| --- | --- | --- | --- | --- |
| `Number(s)`, `+s` | `42` | `NaN` | `0` | `3.14` |
| `parseInt(s, 10)` | `42` | `42` | `NaN` | `3` |
| `parseFloat(s)` | `42` | `42` | `NaN` | `3.14` |

- `Number`는 **문자열 전체**가 숫자여야 한다. 폼 입력 검증에 맞다. 빈 문자열이 `0`이 되는 점은 따로 막는다.
- `parseInt`·`parseFloat`는 **앞에서부터 읽을 수 있는 데까지** 읽는다. `'42px'` 같은 CSS 값에서 숫자만 뽑을 때 쓴다. `parseInt`에는 진법(`10`)을 넘긴다.

## NaN과 Infinity

`NaN`(Not a Number)은 숫자로 계산할 수 없을 때 에러 대신 나오는 값이다(`10 / 'dog'`). 이름과 달리 `typeof NaN`은 `'number'`다.

- `NaN`은 **자기 자신과도 같지 않다**(`NaN === NaN`은 `false`). 판별은 `Number.isNaN(x)`로 한다.
- 전역 `isNaN(x)`은 먼저 숫자로 바꾸고 검사해서 `isNaN('hello')`가 `true`다. 쓰지 않는다.
- `NaN`이 계산에 섞이면 결과 전체가 `NaN`이 된다. 없는 키에 `+ 1`을 하면(`undefined + 1`) `NaN`이 되는 것이 흔한 출처다.
- 표현 범위를 넘거나 0으로 나누면 `Infinity`·`-Infinity`가 된다(`1 / 0`). 유한한 수인지는 `Number.isFinite(x)`, 정수인지는 `Number.isInteger(x)`로 본다.

## 0.1 + 0.2와 돈

```javascript
0.1 + 0.2          // 0.30000000000000004
0.1 + 0.2 === 0.3  // false
```

0.1은 2진수로 정확히 나타낼 수 없는 무한소수라서 근삿값이 저장되고, 근삿값끼리 더하면 오차가 드러난다. JavaScript의 버그가 아니라 부동소수점을 쓰는 거의 모든 언어에서 같다. 오차를 허용하는 비교 방법은 [[typescript-coding-convention|TypeScript 코딩 컨벤션]]에, 분야별 함정은 [[developer-traps|개발자가 빠지는 함정 모음]]에 있다.

**돈은 소수로 저장하지 않는다.** `10.34`달러 대신 `1034`센트처럼 **최소 단위의 정수**로 저장·계산하고, 화면에 보일 때만 100으로 나눠 형식을 입힌다. 원화는 원래 정수다. 이자·환율처럼 소수 계산이 불가피하면 decimal 라이브러리나 서버의 decimal 타입에 맡긴다.

## 숫자 표시하기

| 방법 | 결과 | 비고 |
| --- | --- | --- |
| `(1234.5).toFixed(2)` | `'1234.50'` | **문자열**을 반환. 반올림이 2진 근삿값 기준이라 `(1.005).toFixed(2)`는 `'1.00'` |
| `(1234567).toLocaleString('ko-KR')` | `'1,234,567'` | 천 단위 구분 |
| `new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(15000)` | `'₩15,000'` | 통화·퍼센트·단위·축약(`notation: 'compact'`)까지 로케일에 맞춘다 |

같은 형식을 여러 번 쓰면 `Intl.NumberFormat` 인스턴스를 한 번 만들어 재사용한다. 센트 정수는 `format(cents / 100)`으로 표시한다.

## 정리

- 숫자 타입은 double 하나다. 2^53을 넘는 정수는 `BigInt`나 문자열로 다룬다.
- `+`는 문자열이 섞이면 연결한다. 입력값은 `Number()`로 바꾼 뒤 계산한다.
- 반올림은 `round`, 내림은 `floor`, 버림은 `trunc`. 음수에서 셋이 다르다.
- `NaN` 판별은 `Number.isNaN`. 전역 `isNaN`은 쓰지 않는다.
- 돈은 최소 단위 정수로 계산하고, 표시는 `Intl.NumberFormat`으로 한다.

관련 노트: [[variables-and-types|변수와 데이터 타입]], [[operators-and-control-flow|연산자와 제어문]], [[data-representation|데이터의 표현]], [[developer-traps|개발자가 빠지는 함정 모음]]
