---
title: "연산자와 제어문"
concept: "Control Flow"
summary: "연산자 우선순위, 형변환(coercion)과 truthy·falsy, == vs ===, 단축 평가와 ?.·??, 삼항 연산자, if의 평가 순서와 early return, switch, for·for...in·for...of·while·do...while 반복문."
tags: ["javascript", "frontend"]
source: mixed
date: "2026-10-15"
sources: ["https://riverkim.kr/166", "https://riverkim.kr/104", "https://wesbos.com/javascript/07-logic-and-flow-control/bedmas", "https://wesbos.com/javascript/07-logic-and-flow-control/if-statements-function-returns-truthy-falsy", "https://wesbos.com/javascript/07-logic-and-flow-control/coercion-ternaries-and-conditional-abuse", "https://wesbos.com/javascript/07-logic-and-flow-control/case-switch-and-animating-a-turtle-with-css-variables", "https://wesbos.com/javascript/01-the-basics/types-booleans-and-equality", "https://wesbos.com/javascript/09-gettin-loopy/54-looping-and-iterating-for-for-in-for-off-and-while-loops"]
---

> 개인 TIL을 바탕으로, Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)를 함께 참고해 보강했다.

연산자와 제어문은 대부분의 언어와 비슷하지만, JavaScript에는 **암묵적 형변환**을 하는 `+`와 `==`, 객체용 `for...in`과 iterable용 `for...of`의 구분처럼 헷갈리기 쉬운 지점이 있다.

## 연산자

할당 연산자(`=`, `+=`, `*=`, `++`, `--`)와 산술 연산자는 다른 언어와 같다. 거듭제곱은 `**`, 나머지는 `%`다(숫자 연산의 세부는 [[js-numbers|숫자와 Math]]).

**우선순위**는 수학과 같이 괄호 → 거듭제곱 → 곱셈·나눗셈 → 덧셈·뺄셈 순이다. `10 * 5 - 2`는 48, `10 * (5 - 2)`는 30이다. 함수 호출은 먼저 값이 된다. 논리 연산자는 `&&`가 `||`보다 먼저 묶이므로 `a || b && c`는 `a || (b && c)`다. 섞어 쓸 때는 괄호로 의도를 드러낸다.

비교 연산자 `<`, `>`, `<=`, `>=`는 Boolean을 반환한다. 문자열끼리는 유니코드 값 기준 사전 순으로 비교하고(`'a' > 'Z'`는 `true`), 문자열과 숫자를 섞으면 숫자로 바꿔 비교한다. `>==` 같은 연산자는 없다.

## 형변환(coercion)

한 타입의 값을 다른 타입으로 바꾸는 것이다. 직접 바꾸는 **명시적** 변환과, 연산자가 알아서 바꾸는 **암묵적** 변환이 있다.

| 목표 | 명시적 | 암묵적 |
| --- | --- | --- |
| 숫자 | `Number('42')`, `parseInt('42px', 10)` | `'6' * '2'` → `12`, `+'3'` → `3` |
| 문자열 | `String(42)`, `(42).toString()` | `42 + ''` → `'42'` |
| 불리언 | `Boolean(x)` | `!!x`, `if (x)` |

**`+`는 둘 중 하나라도 문자열이면 연결**한다. `-`·`*`·`/`는 항상 숫자로 바꾼다. `'1' + 1`은 `'11'`, `'1' - 1`은 `0`이다. 입력값(`input.value`는 늘 문자열)으로 계산할 때는 먼저 `Number()`로 바꾼다. 문자열을 이을 때는 `+`보다 [[template-literals|템플릿 리터럴]]이 안전하다.

`!`는 값을 불리언으로 바꾼 뒤 뒤집는다. 그래서 `!!x`는 "x가 truthy인가"를 진짜 `true`/`false`로 만든다.

### truthy와 falsy

`if`·`while`·`&&`·`||`·`!`는 값을 불리언으로 바꿔 판단한다. **falsy는 아래 목록뿐이고 나머지는 전부 truthy**다.

| falsy | 헷갈리는 truthy |
| --- | --- |
| `false`, `0`, `-0`, `0n`, `NaN`, `''`, `null`, `undefined` | `'0'`, `' '`(공백 한 칸), `'false'`, `[]`, `{}`, `-10`, `Infinity` |

빈 배열과 빈 객체는 truthy다. 비었는지는 `arr.length`, `Object.keys(obj).length`로 확인한다. 반대로 `0`이나 `''`가 정상 값일 수 있는 곳에서 `if (score)`처럼 쓰면 0점을 "점수 없음"으로 처리하는 버그가 난다.

### `==` vs `===`

| | 동등 비교 `==` | 일치 비교 `===` |
| --- | --- | --- |
| 타입 변환 | 암묵적으로 타입을 맞춘 뒤 비교 | 변환 없이 타입과 값 모두 비교 |
| 객체끼리 | 같은 객체(참조)인지 판별 | 같은 객체(참조)인지 판별 |
| 권장 | `x == null`(null·undefined 동시 검사) 외에는 쓰지 않음 | **기본으로 사용** |

```javascript
1004 == '1004'  // true
1 == true       // true
1004 === '1004' // false
10 != '10'      // false, 10 !== '10'은 true
```

`x == null`은 `x === null || x === undefined`의 관용적 축약이다. 대신 `x ?? 기본값`이나 `x?.prop`을 쓰면 이 비교 자체가 필요 없는 경우가 많다. 객체는 내용이 아니라 참조로 비교된다는 점은 [[variables-and-types|변수와 데이터 타입]]의 「값과 참조」에 있다.

### 논리 연산자와 단축 평가

`&&`와 `||`는 **단축 평가(short-circuit evaluation)** 를 한다. 결과가 확정되는 순간 나머지를 평가하지 않고, true/false가 아니라 **결과를 결정한 피연산자를 그대로** 반환한다. `check1() && check2() && check3()`에서 `check2()`가 false면 `check3()`은 호출조차 되지 않는다.

| 식 | 결과 | 쓰임 |
| --- | --- | --- |
| `'Cat' && 'Dog'` | `'Dog'` | 조건이 truthy일 때만 값: `msg = done && '완료'` |
| `false && fn()` | `false` (`fn`은 호출 안 됨) | 조건부 실행: `isAdmin && showAdminBar()`, JSX의 `{cond && <A />}` |
| `'Cat' \|\| 'Dog'` | `'Cat'` | falsy일 때 대체값: `msg = done \|\| '미완료'` |

`isAdmin && showAdminBar()`처럼 식을 문 대신 쓰는 것은 짧지만 의도가 덜 드러난다. 부수 효과가 있는 호출은 `if`로 쓰는 편이 읽기 쉽다. JSX처럼 식만 받는 자리에서만 이 형태가 필요하다([[statements-vs-expressions|문과 식]]).

### 옵셔널 체이닝 `?.`와 null 병합 `??` (ES2020)

`&&`와 `||`는 **falsy 전체**에 반응한다. `0`이나 `''`가 정상 값인 경우에는 의도와 다르게 동작한다. ES2020에서 들어온 두 연산자는 **`null`과 `undefined`에만** 반응한다.

| 연산자 | 동작 | 대체하던 코드 |
| --- | --- | --- |
| `a?.b` | `a`가 null/undefined면 에러 없이 `undefined`, 아니면 `a.b` | `a && a.b`, `a ? a.b : undefined` |
| `a ?? b` | `a`가 null/undefined면 `b`, 아니면 `a` | `a \|\| b` |
| `a ??= b` | `a`가 null/undefined일 때만 `b`를 대입(ES2021) | `if (a == null) a = b` |

```javascript
'' || 'default'   // 'default' — 빈 문자열이 유효한 값이어도 덮어쓴다
'' ?? 'default'   // ''
const code = error.response?.data?.code // 중간이 없으면 TypeError 대신 undefined
const name = document.querySelector('[name="first"]')?.value ?? ''
```

### 삼항 연산자

`조건 ? 참일 때 값 : 거짓일 때 값`. 문이 아니라 식이라서 변수에 바로 담거나 템플릿 리터럴 안에 넣을 수 있다. 두 갈래 모두 써야 한다.

```javascript
const word = count === 1 ? 'item' : 'items'
const sentence = `You have ${count} item${count === 1 ? '' : 's'}`
```

중첩하면 읽기 어려워진다. 갈래가 셋 이상이면 `if`나 객체 조회로 바꾼다.

## 조건문

`if`·`else if`·`else`는 **위에서부터 처음 참인 조건 하나만** 실행하고 나머지는 평가하지 않는다. 범위가 겹치는 조건(`age > 70`, `age > 60` …)은 좁은 쪽부터 써야 한다. 여러 조건을 각각 검사해야 하면 `if`를 따로 나란히 쓴다.

```javascript
// 함수 안에서는 return이 함수를 끝내므로 else가 필요 없다 (early return)
function slugify(sentence, lowercase) {
  const slug = sentence.replace(/\s/g, '-')
  if (lowercase) return slug.toLowerCase()
  return slug
}

// 조건식이 이미 불리언이면 if로 true/false를 돌려줄 필요가 없다
const isAdult = (person) => person.age >= 19
```

- 긴 조건은 이름 있는 변수(`const isAwesomeName = …`)나 불리언을 반환하는 함수로 빼면 읽기 쉽다.
- 중괄호 없는 한 줄 `if (x) doIt()`도 문법상 허용되지만, 나중에 줄을 더하면 첫 문장만 조건에 묶이는 버그가 생긴다. ESLint의 `curly` 규칙으로 중괄호를 강제하는 팀이 많다.

### switch

표현식의 결과가 어느 `case` 값과 **일치(`===`)** 하는지로 분기한다. 정확한 값 몇 개로 나뉠 때 if보다 읽기 좋다. `> 20` 같은 범위 조건은 쓸 수 없으니 if를 쓴다.

```javascript
switch (event.key) {
  case 'ArrowUp':
    y -= 1
    break
  case 'ArrowDown':
    y += 1
    break
  default:
    console.log('That is not a valid move')
}
```

`break`를 빼면 일치한 case부터 아래 case들이 **모두 실행**된다(fall through). 일부러 여러 case를 묶을 때(`case 'a': case 'b':`)만 생략한다. 어느 case에도 안 맞을 때를 위해 `default`를 둔다.

## 반복문

| 문법 | 용도 | 비고 |
| --- | --- | --- |
| `for` | 횟수·간격을 직접 제어 | 픽셀 데이터처럼 4칸씩 건너뛸 때(`i += 4`) |
| `for...of` | **iterable의 값** 순회 (Array, String, Map, Set 등) | `await`를 쓸 수 있어 비동기 작업을 순서대로 처리할 때 쓴다 |
| `for...in` | **객체의 키** 순회 | 프로토타입에서 상속한 열거 가능 속성까지 돈다 |
| `while` | 조건이 참인 동안 반복 | 조건이 처음부터 거짓이면 한 번도 안 돈다 |
| `do...while` | 일단 한 번 실행한 뒤 조건 검사 | 최소 1회 실행 보장 |

```javascript
// for: 초기식은 처음 1회, 조건식은 매 반복 전, 증감식은 매 반복 후
for (let i = 0; i < 6; i++) console.log(i) // i는 재할당되므로 const 불가

for (const key in { korea: 'seoul' }) console.log(key)      // korea
for (const fruit of ['딸기', '바나나']) console.log(fruit)  // 딸기, 바나나
for (const [i, fruit] of ['딸기', '바나나'].entries()) {}   // 인덱스가 필요할 때
```

- 배열은 `for...in`으로 돌지 않는다. 키가 문자열 인덱스로 나오고 상속된 속성까지 돈다. 객체의 자기 속성만 필요하면 `Object.keys`·`Object.entries`를 쓴다([[arrays-and-objects|배열·객체·문자열 다루기]]).
- `for...of`로 문자열을 돌면 코드 포인트 단위로 나뉘어 `split('')`과 달리 이모지 하나가 반쪽으로 깨지지 않는다. 다만 👨‍👩‍👧처럼 여러 이모지를 ZWJ로 이어 붙인 글자는 여전히 나뉜다. 보이는 글자 단위가 필요하면 `Intl.Segmenter`를 쓴다.
- `while`에는 반드시 빠져나올 조건을 둔다. 없으면 무한 루프로 탭이 멈춘다. `break`는 반복을 끝내고, `continue`는 이번 회차만 건너뛴다.
- 배열 변환·필터·집계는 반복문보다 `map`·`filter`·`reduce`가 의도를 잘 드러낸다. `for`가 필요한 곳은 중간에 `break`하거나 간격을 직접 제어할 때다.

## 핵심 정리

- 비교는 `===`. `==`는 `x == null` 정도만 쓴다. `+`는 문자열이 섞이면 연결한다.
- falsy는 `false`, `0`, `-0`, `0n`, `NaN`, `''`, `null`, `undefined`뿐이다. `[]`, `{}`, `'0'`은 truthy다.
- 논리 연산자는 단축 평가를 하고, 결정한 피연산자를 그대로 반환한다. null/undefined만 걸러야 하면 `?.`·`??`.
- `if` 체인은 처음 참인 것 하나만 실행한다. 함수에서는 early return으로 else를 줄인다.
- switch는 `===` 정확 일치이고, break를 잊으면 fall through.
- 객체 키는 `Object.keys`(또는 `for...in`), 배열·iterable 값은 `for...of`.

관련 노트: [[variables-and-types|변수와 데이터 타입]], [[js-numbers|숫자와 Math]], [[conditional-rendering|React 조건부 렌더링(&&·삼항 연산자 활용)]], [[statements-vs-expressions|문(Statement)과 식(Expression)]]
