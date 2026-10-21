---
title: "숫자와 Math"
concept: "Number"
summary: "JavaScript의 숫자 타입 하나(double)로 생기는 일: 지수·진법 리터럴과 toString(base), 산술·나머지·거듭제곱 연산자, Math의 반올림·무작위 수, 문자열을 숫자로 바꾸는 방법의 차이, NaN이 생기는 경우와 Infinity 판별, 0과 -0을 가르는 Object.is, 0.1 + 0.2 오차와 돈은 정수 최소 단위로 다루는 원칙, 안전한 정수 범위를 넘는 BigInt, Intl.NumberFormat으로 표시하기."
tags: ["javascript", "frontend", "computer-science"]
source: other
date: "2026-10-17"
sources: ["https://wesbos.com/javascript/01-the-basics/types-numbers", "https://wesbos.com/javascript/07-logic-and-flow-control/bedmas", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/NumberFormat", "https://web.dev/learn/javascript/data-types/number", "https://web.dev/learn/javascript/data-types/bigint", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt", "https://ko.javascript.info/number", "https://ko.javascript.info/operators", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is"]
---

> Wes Bos의 「[Beginner JavaScript](https://wesbos.com/javascript)」 강의 노트를 바탕으로, web.dev의 「[Learn JavaScript](https://web.dev/learn/javascript)」 강좌의 Numbers·BigInt 모듈, javascript.info(모던 JavaScript 튜토리얼)의 「숫자형」, 「기본 연산자와 수학」 글을 더하고 MDN으로 확인해 재구성한 노트다.

## 숫자 타입은 하나다

JavaScript의 `number`는 정수와 실수를 구분하지 않는다. `100`과 `100.5`가 같은 타입이고, 내부적으로는 모두 **IEEE 754 배정밀도 부동소수점(double)** 이다. 비트 구조와 표현 범위는 [[data-representation|데이터의 표현]]에 있다. 정수는 −(2^53 − 1)부터 2^53 − 1(`Number.MAX_SAFE_INTEGER`)까지만 정확하다. 이 범위를 넘는 정수는 아래의 `BigInt`나 문자열로 다룬다. 정수와 실수는 저장 방식이 같아 동작에 차이가 없지만, 정수로 계산할 수 있으면 정수로 하는 편이 오차가 없다.

## 숫자 리터럴과 진법

| 표기 | 예 | 값 |
| --- | --- | --- |
| 지수 `e` | `1e9`, `7.3e9`, `1e-6` | `1000000000`, `7300000000`, `0.000001` |
| 자릿수 구분 `_` | `1_000_000` | 읽기용. 값에는 영향 없다(ES2021) |
| 16진수 `0x` | `0xff` | `255`. 대소문자 무관 |
| 2진수 `0b` / 8진수 `0o` | `0b11111111`, `0o377` | 둘 다 `255` |

반대로 숫자를 다른 진법의 **문자열**로 바꾸는 것은 `num.toString(base)`다(`base`는 2~36). 36진법은 0~9와 a~z를 다 써서 긴 숫자 ID를 짧게 줄일 때 쓴다. 다른 진법 문자열을 읽을 때는 `parseInt(str, base)`다.

```javascript
const n = 255
n.toString(16)         // 'ff'
n.toString(2)          // '11111111'
123456..toString(36)   // '2n9c' — 점 두 개: 첫 점은 소수점으로 읽힌다
parseInt('2n9c', 36)   // 123456
```

숫자 리터럴에 바로 메서드를 붙이려면 `123..toString()`이나 `(123).toString()`처럼 쓴다. `123.toString()`은 `123.`을 소수로 읽다가 SyntaxError가 난다.

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

소수점 **n번째 자리**에서 자르려면 10의 거듭제곱을 곱했다가 나누거나(`Math.floor(1.23456 * 100) / 100` → `1.23`), 문자열이 필요하면 `toFixed(n)`을 쓴다(아래 「숫자 표시하기」). 곱했다 나누는 방법도 부동소수점 오차를 완전히 없애지는 못한다(`(0.28 * 100 + 0.14 * 100) / 100` → `0.4200000000000001`).

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

`Number()`는 문자열이 아닌 값도 바꾼다. `null`·`false`·`[]`는 `0`, `true`는 `1`, `undefined`와 일반 객체는 `NaN`이다. 앞뒤 공백은 무시한다(`Number(' 12 ')`은 `12`). 형변환에는 `Number(x)`를 쓰고, 객체를 만드는 `new Number(x)`는 쓰지 않는다([[variables-and-types|변수와 데이터 타입]]의 「원시값과 래퍼 객체」).

- `Number`는 **문자열 전체**가 숫자여야 한다. 폼 입력 검증에 맞다. 빈 문자열이 `0`이 되는 점은 따로 막는다.
- `parseInt`·`parseFloat`는 **앞에서부터 읽을 수 있는 데까지** 읽는다. `'42px'` 같은 CSS 값에서 숫자만 뽑을 때 쓴다. `parseInt`에는 진법(`10`)을 넘긴다.

## NaN과 Infinity

`NaN`(Not a Number)은 숫자로 계산할 수 없을 때 에러 대신 나오는 값이다(`10 / 'dog'`). 이름과 달리 `typeof NaN`은 `'number'`다.

- `NaN`은 **자기 자신과도 같지 않다**(`NaN === NaN`은 `false`). 판별은 `Number.isNaN(x)`로 한다.
- 전역 `isNaN(x)`은 먼저 숫자로 바꾸고 검사해서 `isNaN('hello')`가 `true`다. 쓰지 않는다.
- `NaN`이 계산에 섞이면 결과 전체가 `NaN`이 된다. 없는 키에 `+ 1`을 하면(`undefined + 1`) `NaN`이 되는 것이 흔한 출처다.

| `NaN`이 생기는 경우 | 예 |
| --- | --- |
| 숫자로 바꿀 수 없는 값 | `Number('two')`, `parseInt(undefined)`, `'two' * 2` |
| 실수 범위에 답이 없는 연산 | `0 / 0`, `Math.sqrt(-1)` |
| 값이 정해지지 않는 연산 | `0 * Infinity`, `Infinity - Infinity` |
| `NaN`이 끼어든 연산 | `NaN + 2`, `2 * 'a' / 2` |

- 표현 범위를 넘거나 0으로 나누면 `Infinity`·`-Infinity`가 된다(`1 / 0`, `1e500`). 숫자 연산은 이상한 입력에도 에러를 던지지 않고 `NaN`·`Infinity`로 끝난다. 유한한 수인지는 `Number.isFinite(x)`, 정수인지는 `Number.isInteger(x)`로 본다. 전역 `isFinite`도 `isNaN`처럼 먼저 숫자로 바꾼다(`isFinite('15')`는 `true`, `isFinite('')`도 `0`이 되어 `true`).

### 두 개의 0과 Object.is

부호를 비트 하나로 저장하므로 `0`과 `-0`이 따로 있다(`-0`은 `0 * -1`, `Math.round(-0.4)` 등에서 생긴다). 대부분의 연산은 둘을 같게 다룬다. 정확히 같은지를 가려야 할 때는 `Object.is`를 쓴다.

| 비교 | `===` | `Object.is` |
| --- | --- | --- |
| `NaN`과 `NaN` | `false` | `true` |
| `0`과 `-0` | `true` | `false` |
| 그 밖의 값 | 같다 | 같다 |

명세는 이 비교를 SameValue라 부른다. React가 state 변경을 감지할 때도 `Object.is`를 쓴다. Map·Set의 키 비교(SameValueZero)는 `NaN`을 같게, `0`과 `-0`도 같게 본다([[map-and-set|Map과 Set]]).

## 0.1 + 0.2와 돈

```javascript
0.1 + 0.2          // 0.30000000000000004
0.1 + 0.2 === 0.3  // false
```

10진법에서 1/3이 0.333…으로 끝나지 않듯, 2진법에서는 1/10이 끝나지 않는다. 0.1은 2진수로 정확히 나타낼 수 없는 무한소수라서 근삿값이 저장되고, 근삿값끼리 더하면 오차가 드러난다. `(0.1).toFixed(20)`이 `'0.10000000000000000555'`인 것으로 저장된 근삿값이 보인다. JavaScript의 버그가 아니라 부동소수점을 쓰는 거의 모든 언어에서 같다. 정수도 2^53을 넘으면 같은 이유로 `9999999999999999`가 `10000000000000000`이 된다. 정밀도를 잃어도 에러는 나지 않는다. 오차를 허용하는 비교 방법과 오차가 커지는 계산은 [[floating-point-arithmetic|부동소수점 오차: 반올림·비교·누적]]에, 분야별 함정은 [[developer-traps|개발자가 빠지는 함정 모음]]에 있다.

**돈은 소수로 저장하지 않는다.** `10.34`달러 대신 `1034`센트처럼 **최소 단위의 정수**로 저장·계산하고, 화면에 보일 때만 100으로 나눠 형식을 입힌다. 원화는 원래 정수다. 이자·환율처럼 소수 계산이 불가피하면 decimal 라이브러리나 서버의 decimal 타입에 맡긴다.

## BigInt: 안전한 정수 범위 밖

`BigInt`는 크기 제한 없이 정확한 정수를 다루는 별도의 원시 타입이다(ES2020). 숫자 끝에 `n`을 붙이거나 `BigInt()`에 정수·숫자 문자열을 넘겨 만든다. 데이터베이스의 64비트 ID, 큰 수의 암호·해시 계산처럼 2^53을 넘는 정수가 필요할 때 쓴다.

```javascript
9999999999999999      // 10000000000000000 — Number로는 반올림된다
9999999999999999n     // 9999999999999999n
typeof 10n            // 'bigint'
BigInt('9007199254740993') // 9007199254740993n — 문자열로 넘겨야 정밀도를 잃지 않는다
```

| 규칙 | 예 |
| --- | --- |
| Number와 섞어 계산할 수 없다 | `10n + 5` → `TypeError`. `10n + 5n`이나 `Number(10n) + 5`처럼 한쪽으로 맞춘다 |
| 나눗셈은 소수점 아래를 버린다 | `10n / 3n` → `3n` |
| `Math` 메서드를 쓸 수 없다 | `Math.max(1n, 2n)` → `TypeError` |
| 비교는 섞어도 된다 | `1n == 1` → `true`, `1n === 1` → `false`(타입이 다르다), `2n > 1` → `true` |
| `new`로 만들 수 없다 | `new BigInt(1)` → `TypeError` |
| 단항 `+`를 쓸 수 없다 | `+1n` → `TypeError`. `asm.js` 호환 때문에 막혀 있다. 숫자로 바꿀 때는 `Number(1n)` |
| 정수만 BigInt가 된다 | `BigInt(1.5)` → `RangeError`, `BigInt('1.5')` → `SyntaxError` |
| 불리언 변환은 Number와 같다 | `0n`은 falsy, 나머지는 truthy. `if (count)`처럼 쓸 수 있다 |
| JSON으로 바로 못 보낸다 | `JSON.stringify({ id: 1n })` → `TypeError`. 문자열로 바꿔 보낸다 |

`Number(big)`으로 되돌리면 2^53을 넘는 부분의 정밀도를 다시 잃는다. 서버가 큰 정수 ID를 숫자로 내려 주면 `JSON.parse` 단계에서 이미 반올림되므로, 이런 ID는 API에서 문자열로 주고받는다.

## 숫자 표시하기

| 방법 | 결과 | 비고 |
| --- | --- | --- |
| `(1234.5).toFixed(2)` | `'1234.50'` | **문자열**을 반환하고 모자란 자리는 `0`으로 채운다. 반올림이 2진 근삿값 기준이라 `(1.005).toFixed(2)`는 `'1.00'`. 숫자가 필요하면 `+x.toFixed(2)` |
| `(1234567).toLocaleString('ko-KR')` | `'1,234,567'` | 천 단위 구분 |
| `new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(15000)` | `'₩15,000'` | 통화·퍼센트·단위·축약(`notation: 'compact'`)까지 로케일에 맞춘다 |

같은 형식을 여러 번 쓰면 `Intl.NumberFormat` 인스턴스를 한 번 만들어 재사용한다. 센트 정수는 `format(cents / 100)`으로 표시한다.

## 정리

- 숫자 타입은 double 하나다. 2^53을 넘는 정수는 `BigInt`나 문자열로 다룬다. BigInt는 Number와 섞어 계산할 수 없다.
- `+`는 문자열이 섞이면 연결한다. 입력값은 `Number()`로 바꾼 뒤 계산한다.
- 반올림은 `round`, 내림은 `floor`, 버림은 `trunc`. 음수에서 셋이 다르다.
- `NaN` 판별은 `Number.isNaN`. 전역 `isNaN`은 쓰지 않는다.
- 돈은 최소 단위 정수로 계산하고, 표시는 `Intl.NumberFormat`으로 한다.

관련 노트: [[variables-and-types|변수와 데이터 타입]], [[operators-and-control-flow|연산자와 제어문]], [[data-representation|데이터의 표현]], [[developer-traps|개발자가 빠지는 함정 모음]]
