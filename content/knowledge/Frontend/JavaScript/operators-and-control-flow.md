---
title: "연산자와 제어문"
concept: "Control Flow"
summary: "연산자 우선순위와 그룹 연산자, 단항 +·전위/후위 증감·할당의 반환값·쉼표 연산자, 형변환(coercion)과 truthy·falsy, == vs ===(그리고 == true가 불리언 비교가 아닌 이유), 단축 평가와 ?.·??, 논리 할당 &&=·||=·??=, 삼항 연산자, if의 평가 순서와 early return, switch의 fall through와 case 스코프, for·for...in·for...of·while·do...while·forEach 반복문."
tags: ["javascript", "frontend"]
source: mixed
date: "2026-10-17"
sources: ["https://riverkim.kr/166", "https://riverkim.kr/104", "https://wesbos.com/javascript/07-logic-and-flow-control/bedmas", "https://wesbos.com/javascript/07-logic-and-flow-control/if-statements-function-returns-truthy-falsy", "https://wesbos.com/javascript/07-logic-and-flow-control/coercion-ternaries-and-conditional-abuse", "https://wesbos.com/javascript/07-logic-and-flow-control/case-switch-and-animating-a-turtle-with-css-variables", "https://wesbos.com/javascript/01-the-basics/types-booleans-and-equality", "https://wesbos.com/javascript/09-gettin-loopy/54-looping-and-iterating-for-for-in-for-off-and-while-loops", "https://web.dev/learn/javascript/comparison", "https://web.dev/learn/javascript/control-flow", "https://ko.javascript.info/operators", "https://ko.javascript.info/comparison", "https://ko.javascript.info/type-conversions", "https://ko.javascript.info/logical-operators", "https://ko.javascript.info/nullish-coalescing-operator", "https://ko.javascript.info/optional-chaining", "https://ko.javascript.info/ifelse", "https://ko.javascript.info/while-for", "https://ko.javascript.info/switch"]
---

> 개인 TIL을 바탕으로, Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)와 web.dev의 「[Learn JavaScript](https://web.dev/learn/javascript)」 강좌(비교 연산자·제어 흐름 모듈), javascript.info(모던 JavaScript 튜토리얼)의 「기본 연산자와 수학」, 「비교 연산자」, 「형 변환」, 「논리 연산자」, 「nullish 병합 연산자 '??'」, 「옵셔널 체이닝 '?.'」, 「if와 '?'를 사용한 조건 처리」, 「while과 for 반복문」, 「switch문」 글을 함께 참고해 보강했다.

연산자와 제어문은 대부분의 언어와 비슷하지만, JavaScript에는 **암묵적 형변환**을 하는 `+`와 `==`, 객체용 `for...in`과 iterable용 `for...of`의 구분처럼 헷갈리기 쉬운 지점이 있다.

## 연산자

할당 연산자(`=`, `+=`, `*=`, `++`, `--`)와 산술 연산자는 다른 언어와 같다. 거듭제곱은 `**`, 나머지는 `%`다(숫자 연산의 세부는 [[js-numbers|숫자와 Math]]).

**우선순위**는 수학과 같이 괄호 → 거듭제곱 → 곱셈·나눗셈 → 덧셈·뺄셈 순이다. `10 * 5 - 2`는 48, `10 * (5 - 2)`는 30이다. 함수 호출은 먼저 값이 된다. 논리 연산자는 `&&`가 `||`보다 먼저 묶이므로 `a || b && c`는 `a || (b && c)`다. 섞어 쓸 때는 괄호로 의도를 드러낸다. 이 괄호를 **그룹 연산자(grouping operator)** 라 하며, 안쪽 식을 한 단위로 먼저 평가하게 한다. `2 + 2 * 4`는 10, `(2 + 2) * 4`는 16이다.

### 단항·증감·할당·쉼표

| 연산자 | 동작 | 주의 |
| --- | --- | --- |
| 단항 `+x` | `Number(x)`와 같은 숫자 변환. `+'3'` → `3`, `+''` → `0`, `+true` → `1` | 단항 `+`·`-`는 이항 연산자보다 먼저 묶여서 `+a + +b`는 숫자 덧셈이 된다 |
| `++x` / `x++` | 1 증가. **전위형은 증가한 값, 후위형은 증가 전 값**을 돌려준다 | 변수(대입 가능한 자리)에만 쓴다. `5++`는 SyntaxError. 반환값을 쓰지 않으면 둘은 같다 |
| `x += 5` 등 복합 할당 | `x = x + 5` | 우선순위가 할당과 같아 오른쪽 식이 먼저 계산된다. `n *= 3 + 5`는 `n *= 8` |
| `=` | 대입하고 **대입한 값을 돌려준다** | `c = 3 - (a = b + 1)`, `a = b = c = 4`(오른쪽부터) 같은 코드는 읽기 어렵다. 한 줄에 한 동작만 둔다 |
| `,` 쉼표 연산자 | 왼쪽부터 모두 평가하고 **마지막 값**을 돌려준다 | 우선순위가 `=`보다 낮다. `a = 1 + 2, 3 + 4`에서 `a`는 `3`. `for (a = 1, b = 3; …)` 정도에서만 본다 |
| 비트 연산 `& \| ^ ~ << >> >>>` | 피연산자를 32비트 정수로 바꿔 계산 | 플래그·해시 같은 저수준 작업용. `~~x`나 `x \| 0`으로 정수를 만드는 옛 트릭은 32비트를 넘으면 틀린다. `Math.trunc`를 쓴다 |

`2 * counter++` 같은 식은 증가를 놓치기 쉽다. 증감은 따로 한 줄로 쓴다.

비교 연산자 `<`, `>`, `<=`, `>=`는 Boolean을 반환한다. 문자열끼리는 유니코드 값 기준 사전 순으로 비교하고(`'a' > 'Z'`는 `true`), 문자열과 숫자를 섞으면 숫자로 바꿔 비교한다. `>==` 같은 연산자는 없다. 정확한 문자열 비교 규칙과 사람용 정렬(`localeCompare`)은 [[js-strings|문자열 다루기]]에 있다.

## 형변환(coercion)

한 타입의 값을 다른 타입으로 바꾸는 것이다. 직접 바꾸는 **명시적** 변환과, 연산자가 알아서 바꾸는 **암묵적** 변환이 있다.

| 목표 | 명시적 | 암묵적 |
| --- | --- | --- |
| 숫자 | `Number('42')`, `parseInt('42px', 10)` | `'6' * '2'` → `12`, `+'3'` → `3` |
| 문자열 | `String(42)`, `(42).toString()` | `42 + ''` → `'42'` |
| 불리언 | `Boolean(x)` | `!!x`, `if (x)` |

**`+`는 둘 중 하나라도 문자열이면 연결**한다. 왼쪽부터 계산하므로 `2 + 2 + '1'`은 `'221'`이 아니라 `'41'`이다. `-`·`*`·`/`는 항상 숫자로 바꾼다. `'1' + 1`은 `'11'`, `'1' - 1`은 `0`이다. 입력값(`input.value`는 늘 문자열)으로 계산할 때는 먼저 `Number()`로 바꾼다. 문자열을 이을 때는 `+`보다 [[template-literals|템플릿 리터럴]]이 안전하다.

`Number()`가 원시값을 바꾸는 규칙은 다음 표가 전부다.

| 값 | `Number(값)` |
| --- | --- |
| `undefined` | `NaN` |
| `null` | `0` |
| `true` / `false` | `1` / `0` |
| 문자열 | 앞뒤 공백·줄바꿈을 지운 뒤 읽는다. 비면 `0`, 숫자가 아닌 글자가 섞이면 `NaN`(`'123z'` → `NaN`) |

`String()`은 거의 보이는 그대로다(`null` → `'null'`). **`null`은 `0`, `undefined`는 `NaN`** 이 되는 차이가 아래 비교 함정의 원인이다. 객체가 섞이면 먼저 원시값으로 바뀌는 단계를 거친다([[object-to-primitive|객체의 원시형 변환]]).

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

**`== true`는 "truthy인가"를 묻는 비교가 아니다.** 불리언이 섞이면 `==`는 불리언을 먼저 **숫자**로 바꾼다(`true` → `1`). 그래서 truthy인 값도 `true`와 느슨하게 같지 않을 수 있다.

```javascript
'1' == true          // true  — '1' → 1, true → 1
'My string' == true  // false — 'My string' → NaN
100 == true          // false — 100 !== 1
[] == false          // true  — [] → '' → 0, false → 0. 그런데 []는 truthy다
```

truthy 여부는 `if (x)`나 `Boolean(x)`로 확인하고, 불리언과 `==`로 비교하지 않는다.

### null·undefined와 크기 비교

`==`는 `null`·`undefined`를 숫자로 바꾸지 않고 **둘끼리만 같다**고 본다. 반면 `<`·`>`·`<=`·`>=`는 숫자로 바꾼다(`null` → `0`, `undefined` → `NaN`). 그래서 결과가 서로 모순돼 보인다.

```javascript
null > 0         // false — 0 > 0
null == 0        // false — null은 null·undefined하고만 같다
null >= 0        // true  — 0 >= 0
undefined > 0    // false — NaN과의 비교는 언제나 false
undefined == 0   // false
```

`null`·`undefined`일 수 있는 값은 크기 비교 전에 따로 걸러 낸다. 마찬가지로 `0 == '0'`, `'' == 0`은 `true`지만 `Boolean(0)`과 `Boolean('0')`은 다르다. `==`는 숫자 변환, `if`는 불리언 변환이라 규칙이 다르기 때문이다.

`x == null`은 `x === null || x === undefined`의 관용적 축약이다. 대신 `x ?? 기본값`이나 `x?.prop`을 쓰면 이 비교 자체가 필요 없는 경우가 많다. 객체는 내용이 아니라 참조로 비교된다는 점은 [[variables-and-types|변수와 데이터 타입]]의 「값과 참조」에 있다.

### 논리 연산자와 단축 평가

`&&`와 `||`는 **단축 평가(short-circuit evaluation)** 를 한다. 결과가 확정되는 순간 나머지를 평가하지 않고, true/false가 아니라 **결과를 결정한 피연산자를 그대로** 반환한다. `check1() && check2() && check3()`에서 `check2()`가 false면 `check3()`은 호출조차 되지 않는다.

| 식 | 결과 | 쓰임 |
| --- | --- | --- |
| `'Cat' && 'Dog'` | `'Dog'` | 조건이 truthy일 때만 값: `msg = done && '완료'` |
| `false && fn()` | `false` (`fn`은 호출 안 됨) | 조건부 실행: `isAdmin && showAdminBar()`, JSX의 `{cond && <A />}` |
| `'Cat' \|\| 'Dog'` | `'Cat'` | falsy일 때 대체값: `msg = done \|\| '미완료'` |

`||`가 모두 falsy면 **마지막 피연산자**를, `&&`가 모두 truthy면 마지막 피연산자를 돌려준다(`undefined || null || 0` → `0`). 우선순위는 `!` > `&&` > `||`다.

`isAdmin && showAdminBar()`처럼 식을 문 대신 쓰는 것은 짧지만 의도가 덜 드러난다. 부수 효과가 있는 호출은 `if`로 쓰는 편이 읽기 쉽다. JSX처럼 식만 받는 자리에서만 이 형태가 필요하다([[statements-vs-expressions|문과 식]]).

### 옵셔널 체이닝 `?.`와 null 병합 `??` (ES2020)

`&&`와 `||`는 **falsy 전체**에 반응한다. `0`이나 `''`가 정상 값인 경우에는 의도와 다르게 동작한다. ES2020에서 들어온 두 연산자는 **`null`과 `undefined`에만** 반응한다.

| 연산자 | 동작 | 대체하던 코드 |
| --- | --- | --- |
| `a?.b` | `a`가 null/undefined면 에러 없이 `undefined`, 아니면 `a.b` | `a && a.b`, `a ? a.b : undefined` |
| `a ?? b` | `a`가 null/undefined면 `b`, 아니면 `a` | `a \|\| b` |
| `a ??= b` | `a`가 null/undefined일 때만 `b`를 대입(ES2021) | `if (a == null) a = b` |

같은 ES2021에 들어온 **논리 할당 연산자**는 셋이 짝을 이룬다. 왼쪽 값을 보고 대입할지 정하며, 대입하지 않을 때는 오른쪽 식을 평가조차 하지 않는다.

| 연산자 | 대입하는 때 | 쓰임 |
| --- | --- | --- |
| `a \|\|= b` | `a`가 falsy일 때 | 비어 있으면 기본값: `opts.title \|\|= '제목 없음'` |
| `a &&= b` | `a`가 truthy일 때 | 있을 때만 가공: `user.name &&= user.name.trim()` |
| `a ??= b` | `a`가 null/undefined일 때 | `0`·`''`를 지키는 기본값: `config.retries ??= 3` |

**`??`는 `&&`·`||`와 괄호 없이 섞을 수 없다**(`a && b ?? c`는 SyntaxError). `||`를 `??`로 바꾸다 생기는 실수를 막으려는 명세의 제약이라, `(a && b) ?? c`처럼 괄호로 의도를 밝힌다. 우선순위도 산술보다 낮아서 `(height ?? 100) * (width ?? 50)`처럼 감싸야 한다.

왼쪽은 대입할 수 있는 자리(변수, 속성)여야 한다. `x > 2 &&= 'y'`처럼 비교식을 두면 SyntaxError다.

옵셔널 체이닝은 세 모양이 있고, 왼쪽이 null/undefined면 **오른쪽 전체를 평가하지 않는다**(단축 평가).

| 모양 | 예 |
| --- | --- |
| `obj?.prop` | `user?.address?.street` |
| `obj?.[expr]` | `user?.[key]` |
| `fn?.()` | `user.admin?.()` — 메서드가 없으면 호출하지 않는다 |

- `user?.sayHi(x++)`에서 `user`가 없으면 `x++`도 실행되지 않는다.
- 읽기와 `delete user?.name`에는 쓸 수 있지만 **대입의 왼쪽에는 못 쓴다**(`user?.name = 'x'`는 SyntaxError).
- `?.` 앞의 변수는 선언돼 있어야 한다. 선언 안 된 이름은 여전히 `ReferenceError`다.
- **없어도 되는 것에만 붙인다.** 반드시 있어야 할 `user`에 `user?.`를 쓰면 버그가 `undefined`로 조용히 묻힌다. `user.address?.street`처럼 선택적인 단계에만 쓴다.

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

중첩하면 읽기 어려워진다. 갈래가 셋 이상이면 `if`나 객체 조회로 바꾼다. **값을 고르는 데만 쓰고 `if` 대신 쓰지 않는다.** `cond ? alert('a') : alert('b')`처럼 부수 효과를 고르는 식은 `if`가 더 읽기 쉽고, `break`·`continue` 같은 문은 아예 넣을 수 없다(SyntaxError). 결과가 이미 불리언이면 `age > 18 ? true : false` 대신 `age > 18`이다.

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

`break`를 빼면 일치한 case부터 아래 case들이 **모두 실행**된다(fall through). 일부러 여러 case를 묶을 때(`case 'a': case 'b':`)만 생략한다. 어느 case에도 안 맞을 때를 위해 `default`를 둔다. `default`도 fall through 대상이라 중간에 두면 아래 case까지 실행되므로, 맨 끝에 두거나 `break`로 닫는다.

**`case`는 스코프를 만들지 않는다.** switch 본문 전체가 블록 하나라서, 두 case에서 같은 이름을 `let`·`const`로 선언하면 SyntaxError다. case 본문을 중괄호로 감싸 블록을 따로 만든다.

```javascript
switch (action.type) {
  case 'add': {
    const item = action.payload // 이 블록 안에서만 유효
    break
  }
  case 'remove': {
    const item = action.id      // 다른 블록이라 같은 이름을 써도 된다
    break
  }
}
```

`switch`와 `case`에는 상수뿐 아니라 **아무 식**이나 올 수 있다(`switch (+a) { case b + 1: … }`). 비교가 `===`이므로 `prompt`·`input.value`처럼 문자열로 들어온 값은 `case 3:`에 걸리지 않는다. `case '3':`으로 쓰거나 먼저 숫자로 바꾼다.

범위 조건으로 나누고 싶을 때 `switch (true) { case score >= 90: … }`처럼 쓰는 관용구도 있지만, 대부분 if 체인이 더 읽기 쉽다.

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

- `for...of`·`for...in`에서는 반복 변수를 `const`로 선언할 수 있다. 회차마다 변수가 새로 만들어지고 회차가 끝나면 버려지기 때문이다. 일반 `for`의 `i`는 같은 변수를 `i++`로 재할당하므로 `let`이어야 한다.
- `for...of`는 **이터러블**(Array, String, Map, Set, 제너레이터 등)만 돈다. 일반 객체는 `TypeError: not iterable`이다. 이 약속(`Symbol.iterator`와 `next()`)과 직접 iterable을 만드는 법은 [[iterators-and-generators|이터레이터와 제너레이터]]에 있다.
- 배열은 `for...in`으로 돌지 않는다. 키가 문자열 인덱스로 나오고 상속된 속성까지 돈다. 객체의 자기 속성만 필요하면 `Object.keys`·`Object.entries`를 쓴다([[arrays-and-objects|배열·객체·문자열 다루기]]).
- `for...of`로 문자열을 돌면 코드 포인트 단위로 나뉘어 `split('')`과 달리 이모지 하나가 반쪽으로 깨지지 않는다. 다만 👨‍👩‍👧처럼 여러 이모지를 ZWJ로 이어 붙인 글자는 여전히 나뉜다. 보이는 글자 단위가 필요하면 `Intl.Segmenter`를 쓴다.
- `for`의 세 부분은 모두 생략할 수 있지만 세미콜론 두 개는 남긴다. `for (;;)`는 무한 루프다. `for (let i …)`로 선언한 `i`는 반복문 밖에서 보이지 않는다.
- 조건을 본문 중간에서 검사해야 하면 `while (true) { … if (!value) break … }` 꼴이 자연스럽다. `continue`로 조건에 맞지 않는 회차를 먼저 넘기면 중첩이 한 단계 줄어든다.
- `while`에는 반드시 빠져나올 조건을 둔다. 없으면 무한 루프로 탭이 멈춘다. `break`는 반복을 끝내고, `continue`는 이번 회차만 건너뛴다.
- **중첩 반복문을 한 번에 빠져나오려면 레이블**을 쓴다. 바깥 반복문 앞에 `outer:`를 붙이고 안쪽에서 `break outer`(또는 `continue outer`)한다. 레이블은 `goto`가 아니다. 그 레이블이 붙은 반복문 안에서만 쓸 수 있다. 쓸 일이 잦다면 안쪽을 함수로 빼고 `return`하는 편이 읽기 쉽다.

```javascript
outer: for (let i = 0; i < 3; i++) {
  for (let j = 0; j < 3; j++) {
    if (!grid[i][j]) break outer // 두 반복문을 모두 끝낸다
  }
}
```

- 배열 변환·필터·집계는 반복문보다 `map`·`filter`·`reduce`가 의도를 잘 드러낸다. `for`가 필요한 곳은 중간에 `break`하거나 간격을 직접 제어할 때다.
- `forEach`(Array·Map·Set·NodeList에 있다)는 콜백으로 돌기 때문에 **`break`·`continue`로 멈출 수 없고, 콜백 안의 `await`도 기다려 주지 않는다.** 중간에 멈추거나 순서대로 기다려야 하면 `for...of`를 쓴다. 콜백 인자는 Array가 `(값, 인덱스, 배열)`, Map이 `(값, 키, 맵)`, Set이 `(값, 값, 셋)`이다. Set은 키가 없어서 모양을 맞추려고 값을 두 번 준다.

## 핵심 정리

- 비교는 `===`. `==`는 `x == null` 정도만 쓴다. `+`는 문자열이 섞이면 연결한다.
- `null`은 숫자로 `0`, `undefined`는 `NaN`. null일 수 있는 값을 `<`·`>`에 넣지 않는다.
- `??`는 `&&`·`||`와 섞을 때 괄호가 필수다. `?.`는 없어도 되는 단계에만 붙인다.
- falsy는 `false`, `0`, `-0`, `0n`, `NaN`, `''`, `null`, `undefined`뿐이다. `[]`, `{}`, `'0'`은 truthy다.
- 논리 연산자는 단축 평가를 하고, 결정한 피연산자를 그대로 반환한다. null/undefined만 걸러야 하면 `?.`·`??`.
- `if` 체인은 처음 참인 것 하나만 실행한다. 함수에서는 early return으로 else를 줄인다.
- switch는 `===` 정확 일치이고, break를 잊으면 fall through.
- 객체 키는 `Object.keys`(또는 `for...in`), 배열·iterable 값은 `for...of`.

관련 노트: [[variables-and-types|변수와 데이터 타입]], [[js-numbers|숫자와 Math]], [[conditional-rendering|React 조건부 렌더링(&&·삼항 연산자 활용)]], [[statements-vs-expressions|문(Statement)과 식(Expression)]], [[iterators-and-generators|이터레이터와 제너레이터]], [[object-to-primitive|객체의 원시형 변환]], [[js-strings|문자열 다루기]]
