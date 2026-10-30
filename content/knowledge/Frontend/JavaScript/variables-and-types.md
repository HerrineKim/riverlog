---
title: "변수와 데이터 타입"
concept: "Variables"
summary: "식별자 규칙과 이름 짓기, let·const·var의 차이와 호이스팅, 원시 타입과 참조 타입, 원시값의 래퍼 객체(new String을 쓰지 않는 이유), typeof, null과 undefined의 구분, 값 복사와 참조 공유(비교·얕은 복사·structuredClone·함수 인자·const와 Object.freeze), 스택·힙과 가비지 컬렉션, 동적 타입과 여덟 가지 타입, 대문자 상수를 쓰는 때와 변수를 재사용하지 않는 이유."
tags: ["javascript", "frontend", "memory"]
source: mixed
date: "2026-10-21"
sources: ["https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/javascript/var-let-const.md", "https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/javascript/stack-heap.md", "https://riverkim.kr/118", "https://wesbos.com/javascript/01-the-basics/variables-and-statements", "https://wesbos.com/javascript/01-the-basics/types-introduction", "https://wesbos.com/javascript/01-the-basics/types-null-and-undefined", "https://wesbos.com/javascript/08-data-types/object-references-vs-values", "https://wesbos.com/javascript/08-data-types/objects", "https://web.dev/learn/javascript/data-types", "https://web.dev/learn/javascript/data-types/variable", "https://web.dev/learn/javascript/data-types/null-undefined", "https://web.dev/learn/javascript/data-types/boolean", "https://web.dev/learn/javascript/appendix", "https://ko.javascript.info/variables", "https://ko.javascript.info/types", "https://ko.javascript.info/primitives-methods", "https://ko.javascript.info/object-copy", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%EB%B3%80%EC%88%98%20%EB%B0%8F%20%EB%8F%99%EC%9E%91%EC%9B%90%EB%A6%AC%20%EC%9D%B4%ED%95%B4.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%EB%8D%B0%EC%9D%B4%ED%84%B0%20%ED%83%80%EC%9E%85.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%EC%9B%90%EC%8B%9C%EA%B0%92%EA%B3%BC%20%EA%B0%9D%EC%B2%B4%EC%9D%98%20%EB%B9%84%EA%B5%90.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%EB%B9%8C%ED%8A%B8%EC%9D%B8%20%EA%B0%9D%EC%B2%B4.md", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures", "http://dmitrysoshnikov.com/ecmascript/chapter-8-evaluation-strategy/", "https://dmitripavlutin.com/variables-lifecycle-and-why-let-is-not-hoisted/", "https://dmitripavlutin.com/7-tips-to-handle-undefined-in-javascript/", "https://github.com/lydiahallie/javascript-questions"]
---

> 개인 TIL을 바탕으로, Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)와 web.dev의 「[Learn JavaScript](https://web.dev/learn/javascript)」 강좌(데이터 타입·변수·부록 모듈), javascript.info(모던 JavaScript 튜토리얼)의 「변수와 상수」, 「자료형」, 「원시값의 메서드」, 「참조에 의한 객체 복사」 글을 함께 참고해 보강했다. 「[Must-Know-About-Frontend: var vs let vs const](https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/javascript/var-let-const.md)」, 「[Must-Know-About-Frontend: 콜 스택과 힙](https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/javascript/stack-heap.md)」의 내용을 더해 보강했다. 「[Frontend_TIL: 변수 및 동작원리 이해](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%EB%B3%80%EC%88%98%20%EB%B0%8F%20%EB%8F%99%EC%9E%91%EC%9B%90%EB%A6%AC%20%EC%9D%B4%ED%95%B4.md)」, 「[Frontend_TIL: 데이터 타입](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%EB%8D%B0%EC%9D%B4%ED%84%B0%20%ED%83%80%EC%9E%85.md)」, 「[Frontend_TIL: 원시값과 객체의 비교](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%EC%9B%90%EC%8B%9C%EA%B0%92%EA%B3%BC%20%EA%B0%9D%EC%B2%B4%EC%9D%98%20%EB%B9%84%EA%B5%90.md)」을 바탕으로 보강했다. 「[Frontend_TIL: 빌트인 객체](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%EB%B9%8C%ED%8A%B8%EC%9D%B8%20%EA%B0%9D%EC%B2%B4.md)」을 바탕으로 보강했다. 평가 전략 비교는 Dmitry Soshnikov의 「[Evaluation strategy](http://dmitrysoshnikov.com/ecmascript/chapter-8-evaluation-strategy/)」를 바탕으로 보강했다.
> 헷갈리기 쉬운 출력 문제는 Lydia Hallie의 「[JavaScript Questions](https://github.com/lydiahallie/javascript-questions)」에서 개념별로 뽑아 보강했다.

변수를 어떻게 선언하느냐는 스코프와 재할당 가능 여부를 결정하고, 값의 타입이 원시 타입이냐 참조 타입이냐는 복사·비교 방식을 결정한다. JavaScript 버그의 상당수가 이 두 가지를 헷갈려서 생긴다.

## 식별자 규칙

- 식별자(identifier)는 변수를 구분하는 이름이다. 대소문자를 구분한다.
- 첫 글자는 문자, `$`, `_`만 된다. 숫자는 두 번째 글자부터 쓸 수 있다.
- 예약어(`for`, `if`, `function` 등)와 하이픈은 쓸 수 없다. `my-name`은 뺄셈으로 해석되므로 kebab-case는 불가능하다.
- 공백도 못 쓴다. 파서는 공백을 토큰 구분자로 보므로 `my Variable`은 식별자 두 개가 된다. 숫자로 시작하지 못하는 것도 같은 이유다. `10`이 식별자가 될 수 있다면 숫자 `10`과 구분할 수 없다.

| 스타일 | 용도 | 예 |
| --- | --- | --- |
| camelCase | 변수, 객체, 함수 | `userName` |
| PascalCase | 클래스, 생성자, React 컴포넌트 | `UserService` |
| UPPER_SNAKE_CASE | **실행 전에 이미 아는 하드코딩 값**의 별칭 | `COLOR_ORANGE = '#FF7F00'`, `ONE_HOUR_MS` |

- `const`라고 모두 대문자로 쓰지 않는다. `const pageLoadTime = measure()`처럼 **실행 중에 계산되고 그 뒤로 안 바뀌는 값**은 camelCase다. 대문자는 `'#FF7F00'`처럼 외우기 어렵고 오타 나기 쉬운 리터럴에 이름을 붙일 때만 쓴다.
- `let имя`, `let 이름`처럼 비라틴 문자도 식별자로 유효하지만, 코드는 국제적으로 읽히므로 영어로 짓는 것이 관례다. 예외는 [[typescript-coding-convention|TypeScript 코딩 컨벤션]]의 한글 식별자 항목에 있다.
- 이름은 **담긴 데이터의 성격**을 짧게 드러낸다. `val`보다 `originalValue`, `theNumberOfDaysInTheCurrentMonth`보다 `currentMonthDays`가 낫다.
- 반대로 **바뀔 수 있는 세부까지** 이름에 넣지 않는다. `miles`라고 지은 변수가 나중에 킬로미터를 담게 되면 이름이 거짓말을 한다. `distance`로 짓는다.
- `data`, `value`, `item`, `obj`, `str`처럼 무엇이든 담을 수 있는 이름과 `data1`·`data2` 같은 번호 붙이기는 아무것도 알려 주지 않는다. 팀이 정한 용어도 통일한다. 방문자를 `user`라 부르기로 했다면 `currentVisitor`가 아니라 `currentUser`다.
- **변수를 다른 뜻으로 재사용하지 않는다.** 이름표는 그대로인데 내용물이 바뀐 상자가 되어, 지금 무엇이 들어 있는지 매번 따라가 읽어야 한다. 새 의미에는 새 변수를 만든다. 변수를 늘려도 압축 도구와 엔진이 최적화하므로 성능 비용은 없다.
- `_name`처럼 밑줄로 시작하는 이름은 "외부에서 건드리지 말라"는 관례일 뿐 언어가 막아 주지 않는다. 진짜 비공개가 필요하면 class의 `#private` 필드를 쓴다([[class|class 문법]]).

## 선언, 할당, 초기화

```javascript
let foo        // 선언: 변수를 생성
console.log(foo) // undefined

foo = 11       // 할당: 값을 저장 (다시 선언하지 않는다)
let bar = 0    // 선언 + 할당 = 초기화
```

- **선언(declaration)**: 변수를 만드는 행위
- **할당(assignment)**: 변수에 값을 저장하는 행위
- **초기화(initialization)**: 선언된 변수에 처음으로 값을 저장하는 행위. `const`는 선언과 동시에 초기화해야 한다.

## let, const, var

| 키워드 | 재선언 | 재할당 | 스코프 | 비고 |
| --- | --- | --- | --- | --- |
| `let` | 불가 | 가능 | 블록 | 값이 바뀔 변수 |
| `const` | 불가 | **불가** | 블록 | 기본으로 사용 |
| `var` | 가능 | 가능 | 함수 | ES6 이전 방식, 사용 지양 |

- **블록 스코프**: `if`, `for`, 함수 등의 중괄호 `{}` 내부. 블록 밖에서는 접근할 수 없다.
- **함수 스코프**: 함수의 중괄호 내부. `var`는 `if`/`for` 블록을 무시하고 함수 단위로만 갇힌다. 그래서 `for (var i …)`의 `i`는 반복문이 끝난 뒤에도 남는다.
- 기본은 `const`로 선언하고, 재할당이 필요해질 때만 `let`으로 바꾼다. `const`는 "이 값은 다시 대입하지 않는다"는 의도를 다음 사람에게 알리는 표시이기도 하다.
- `let a, b, c`처럼 쉼표로 여러 개를 한 번에 선언할 수 있다(바인딩 목록). 한 줄에 하나씩 쓴 것과 같다.
- `var`는 같은 이름을 다시 선언해도 에러가 없다(`var x = 1; var x = 2`). 옛 코드 호환 때문이다. `let`·`const`·`class`는 SyntaxError다. 다만 **브라우저 콘솔은 편의상 `let` 재선언을 허용**하므로, 콘솔에서 되던 코드가 파일에서는 에러가 날 수 있다.

### 호이스팅(hoisting)

선언이 스코프의 맨 위로 끌어올려진 것처럼 동작하는 현상이다. `var`는 `undefined`로 초기화되어 선언 전에 읽어도 에러가 없고, `let`·`const`는 초기화 전 구간(TDZ)에 있어 `ReferenceError`가 난다. 선언 종류별 표와 TDZ의 이유는 [[scope-and-closures#호이스팅과 TDZ|스코프와 클로저]]에 있다.

### 선언 없이 대입하면: 암묵적 전역

초기 JavaScript는 선언하지 않은 이름에 값을 넣으면(`dog = 'snickers'`) 함수·블록 안이라도 전역 변수를 만들어 줬다(implied global). 오타 하나가 전역 변수가 되는 셈이다. 정확히는 변수 선언이 아니라 **전역 객체에 속성을 더하는 것**(`window.dog = …`)이라, 호이스팅되지 않고 `delete dog`로 지울 수도 있다. `var`로 선언한 전역 변수는 지워지지 않는다. 연쇄 대입에도 숨어 있다. `let x = (y = 10)`은 `y = 10; let x = y`와 같아서 `x`만 지역 변수이고 `y`는 암묵적 전역이 된다(함수가 끝난 뒤 바깥에서 `typeof y`는 `'number'`). 하위 호환 때문에 이 동작은 지금도 남아 있고, **strict mode에서는 `ReferenceError`** 가 난다. ES 모듈과 `class` 본문은 자동으로 strict mode라서 요즘 코드는 대부분 따로 적지 않아도 막힌다. 켜는 방법과 달라지는 동작 전체는 [[strict-mode|strict mode]]에 있다.

## 데이터 타입

JavaScript는 **동적 타입(dynamically typed)** 언어다. 값에는 타입이 있지만 변수에는 없어서, 같은 변수에 문자열을 넣었다가 숫자를 넣어도 된다(`let m = 'hi'; m = 123`). 타입은 모두 **여덟 가지**다. 아래 원시 타입 일곱 가지와 객체(Object).

| | 정적 타입 언어(Java, C, TypeScript) | 동적 타입 언어(JavaScript, Python) |
| --- | --- | --- |
| 타입이 정해지는 때 | 변수를 선언할 때 명시 | 값을 **할당할 때** 결정되고 재할당으로 바뀐다 |
| 타입 검사 | 컴파일 시점. 맞지 않으면 실행 전에 막는다 | 실행 중. 틀린 타입은 런타임 에러나 엉뚱한 결과로 드러난다 |
| 대가 | 선언이 길어진다 | 값의 타입을 코드만 보고 확신하기 어렵고, 암묵적 형변환까지 겹쳐 오류가 나기 쉽다 |

그래서 동적 타입 코드는 변수 수를 줄이고 스코프를 좁히며, 재할당 대신 `const`를 쓰고, 이름으로 의도를 드러낸다. 규모가 커지면 [[typescript-basics|TypeScript]]로 정적 타입을 얹는다. 엔진 쪽에서 보면 타입은 **값을 담을 메모리 크기와 비트를 읽는 방식**을 정한다. 같은 비트 `0100 0001`이 숫자로는 65, 문자로는 `'A'`다.

### 원시 타입(Primitive type)

객체가 아닌 기본 타입. 변수에 **값 자체**가 담기고, 다른 변수에 복사하면 값이 복사된다. 원시값은 바꿀 수 없다(immutable). 문자열 메서드도 원본을 고치지 않고 새 문자열을 돌려준다.

| 타입 | 설명 |
| --- | --- |
| Number | 정수·실수 구분 없는 하나의 숫자 타입(부동소수점). 자세한 함정은 [[js-numbers\|숫자와 Math]] |
| String | 텍스트. 작은따옴표·큰따옴표는 완전히 같고, 백틱은 여러 줄과 `${}` 삽입을 지원한다([[js-strings#템플릿 리터럴\|템플릿 리터럴]]). 글자 하나를 담는 `char` 타입은 따로 없다([[js-strings\|문자열 다루기]]) |
| Boolean | `true` / `false` |
| undefined | 값이 할당되지 않음 |
| null | 값이 없음을 **의도적으로** 표현 |
| Symbol | 다른 어떤 값과도 겹치지 않는 고유 식별자. 객체 속성 이름 충돌을 막을 때 쓴다([[js-symbol\|Symbol]]) |
| BigInt | 2^53 − 1을 넘는 아주 큰 정수(`10n`). Number와 섞어 계산할 수 없다([[js-numbers\|숫자와 Math]]) |

### 원시값과 래퍼 객체

원시값은 속성이 없는데도 `'hi'.toUpperCase()`가 된다. 메서드를 부르는 순간 엔진이 원시값을 대응하는 **래퍼 객체(wrapper object)** 로 잠깐 감싸 그 프로토타입(`String.prototype`)에서 메서드를 찾기 때문이다. 래퍼는 메서드가 끝나면 버려지므로 **원시값에 속성을 붙여도 남지 않는다.** `str.test = 5`는 sloppy mode에서 조용히 무시되고(다시 읽으면 `undefined`), strict mode에서는 `TypeError`다. 엔진은 실제로 래퍼를 만들지 않고 만든 것처럼 최적화한다. `null`과 `undefined`만 래퍼가 없어서 속성 접근이 `TypeError`다. 상속 구조는 [[prototype-and-inheritance|프로토타입과 상속]]에 있다.

`String`·`Number`·`Boolean`은 두 가지로 쓸 수 있고, 결과가 완전히 다르다.

| 쓰는 법 | 결과 | 쓰임 |
| --- | --- | --- |
| `String(10)`, `Number('10')`, `Boolean(0)` (함수 호출) | **원시값** `'10'`, `10`, `false` | 명시적 형변환. 이렇게 쓴다 |
| `new String('a')`, `new Number(10)`, `new Boolean(false)` (생성자) | **객체** `String {'a'}` | 쓸 일이 없다 |

```javascript
const n = new Number(10)
typeof n        // 'object'
n + 5           // 15: 연산에서는 값처럼 동작하지만
n === 10        // false: 타입이 달라 일치 비교에 실패한다
if (new Boolean(false)) {} // 실행된다: 객체는 내용과 상관없이 truthy
```

`Symbol`과 `BigInt`는 아예 `new`로 부를 수 없다(`TypeError`). `new Object(10)`도 `Number {10}`을 만든다. 배열·객체도 `new Array()`·`new Object()`보다 리터럴 `[]`·`{}`을 쓴다([[arrays-and-objects|배열·객체·문자열 다루기]]).

### 참조 타입(Reference type)

원시 타입이 아닌 모든 값은 객체(Object)다. Array, Function, Date, Map도 객체의 일종이다. 변수에는 **참조값(주소)** 이 담긴다.

### typeof

| 값 | `typeof` 결과 | 비고 |
| --- | --- | --- |
| `'a'`, `1`, `NaN`, `true`, `10n`, `Symbol()` | `'string'`, `'number'`, `'number'`, `'boolean'`, `'bigint'`, `'symbol'` | `NaN`도 number다 |
| `undefined` | `'undefined'` | 선언하지 않은 변수에 써도 에러 없이 `'undefined'` |
| `null` | `'object'` | 언어 초기의 버그(아래) |
| `{}`, `[]`, `new Date()` | `'object'` | 배열 판별은 `Array.isArray(x)` |
| `function () {}` | `'function'` | 함수 타입은 따로 없고 함수도 객체다. `typeof`만 오래된 규칙으로 따로 구분해 준다 |

### undefined vs null

| | undefined | null |
| --- | --- | --- |
| 의미 | 값이 아직 없음 | 값이 없음을 의도적으로 표시 |
| 누가 넣나 | 선언만 하면 JavaScript가 자동 할당 | 개발자가 직접 할당 |
| `typeof` | `'undefined'` | `'object'` |

| 상황 | undefined가 되는 예 |
| --- | --- |
| 값을 할당하지 않은 변수 | `let a; a // undefined` |
| 전달되지 않은 인자 | `function f(x) { return x }; f()` |
| 없는 속성에 접근 | `({}).foo` |
| `return`이 없는 함수의 반환값 | `(function () {})()` |

**선언하지 않은 변수**는 undefined가 아니라 `ReferenceError: x is not defined`다. 값을 비울 때는 `undefined`가 아니라 `null`을 대입해 "일부러 비웠다"는 뜻을 남긴다. 객체 속성에서는 "처음부터 없는 속성"(`undefined`)과 "있었는데 일부러 비운 속성"(`null`)을 구분할 수 있고, 속성 자체가 있는지는 `'last' in obj`나 `Object.hasOwn(obj, 'last')`로 확인한다.

```javascript
null === undefined // false: 타입이 다르다
null == undefined  // true: 동등 비교에서는 서로만 같다
1 + null           // 1: null은 숫자 연산에서 0으로 변환
1 + undefined      // NaN
```

`null`은 예약어지만 **`undefined`는 전역 객체의 속성**이다. 옛 브라우저에서는 `undefined = 1`로 덮어쓸 수도 있었고, 지금도 함수 안에서 `let undefined = 1`처럼 지역 이름으로 가릴 수 있다. 절대 식별자로 쓰지 않는다.

`typeof null`이 `'object'`인 것은 언어 초기 구현의 버그다. 초기 JavaScript는 값을 타입 태그와 값으로 표현했는데, 객체의 타입 태그가 0이었고 null은 널 포인터(0x00)로 표현되어 타입 태그가 0으로 읽혔다. 명세상 null은 원시 타입이다.

조건문에서 값이 true/false로 바뀌는 규칙(truthy·falsy)과 형변환은 [[operators-and-control-flow|연산자와 제어문]]에 있다.

## 값과 참조

원시값은 **값으로** 복사·비교되고, 객체는 **참조로** 복사·비교된다.

```javascript
let a = 'wes'
let b = a
b = 'scott'      // a는 그대로 'wes'

const p1 = { first: 'wes' }
const p2 = { first: 'wes' }
const p3 = p1     // 객체를 복사한 것이 아니라 같은 객체를 가리킨다
p3.first = 'Larry'
p1.first          // 'Larry'
p1 === p2         // false: 내용이 같아도 다른 객체
p1 === p3         // true: 같은 객체
```

| 상황 | 원시값 | 객체·배열 |
| --- | --- | --- |
| `===` 비교 | 값이 같으면 true | **같은 객체일 때만** true. `indexOf`·`includes`도 같은 규칙 |
| `b = a` 대입 | 값 복사 | 참조 복사. 한쪽을 고치면 다른 쪽도 바뀐다 |
| 함수 인자로 전달 | 함수 안에서 재할당해도 바깥은 그대로 | 함수 안에서 **속성을 고치면 바깥 객체가 바뀐다**. 매개변수 자체를 재할당하는 것은 바깥에 영향이 없다 |

흔히 원시값은 "값에 의한 전달", 객체는 "참조에 의한 전달"이라고 부르지만, 두 경우 모두 **변수에 든 값을 복사해 넘긴다**는 점은 같다. 객체 변수에 든 값이 참조값(주소)일 뿐이다. 그래서 JavaScript에는 C++식 참조 전달(매개변수 재할당이 바깥 변수를 바꾸는 것)이 없고, 이 방식을 **공유에 의한 전달(pass by sharing)** 이라고 부르기도 한다.

인자 전달 방식(평가 전략)을 비교하면 이렇다.

| 전략 | 넘기는 것 | 함수 안에서 속성 변경 | 함수 안에서 매개변수 재할당 | 언어 |
| --- | --- | --- | --- | --- |
| 값에 의한 호출(call by value) | 값 전체의 사본 | 바깥에 영향 없음(사본을 고친다) | 바깥에 영향 없음 | C의 구조체 |
| 참조에 의한 호출(call by reference) | 바깥 변수 자체의 별칭 | 바깥이 바뀐다 | **바깥 변수가 바뀐다** | C++의 `T&`, C#의 `ref` |
| 공유에 의한 호출(call by sharing) | 객체를 가리키는 참조값의 사본 | 바깥이 바뀐다 | 바깥에 영향 없음 | JavaScript, Python, Java, Ruby |

공유에 의한 호출은 "참조값을 값으로 복사하는" 값에 의한 호출의 특수한 경우로 볼 수 있다. Java 문서가 "자바는 언제나 값에 의한 호출"이라 하고 JavaScript 글들이 "객체는 참조로 넘긴다"고 하는 것은 같은 동작을 다른 용어로 부른 것이다. 또 JavaScript는 **인자를 호출 전에 왼쪽부터 모두 평가**한다(eager evaluation). `f(a(), b())`에서 `a()`가 먼저 실행되고, 인자가 실제로 쓰일 때까지 미루는 지연 평가(lazy evaluation)는 하지 않는다. 미루고 싶으면 `() => expensive()`처럼 함수로 감싸 넘긴다.

원시값은 바꿀 수 없으므로 원시값을 담은 변수에 재할당하면 **기존 메모리를 고치지 않고 새 값을 만든 뒤 변수가 그쪽을 가리키게** 된다. 바뀌는 것은 변수의 연결이지 값이 아니다. 반대로 객체는 크기가 크고 일정하지 않아 바꿀 때마다 복사하면 비효율적이라, 제자리에서 고치는 대신 여러 변수가 한 객체를 공유할 수 있게 설계됐다.

### 복사하기

| 방법 | 깊이 | 비고 |
| --- | --- | --- |
| `{ ...obj }`, `[...arr]`, `Object.assign({}, obj)`, `arr.slice()` | 얕은 복사 | 한 단계만 복사. 중첩 객체는 참조를 공유한다 |
| `structuredClone(obj)` | 깊은 복사 | 브라우저·Node 표준 API. Map·Set·Date·순환 참조도 복사한다. 함수·DOM 노드는 복사하지 못해 에러가 나고, 클래스 인스턴스는 프로토타입을 잃어 평범한 객체가 된다 |
| `JSON.parse(JSON.stringify(obj))` | 깊은 복사(제한적) | Date는 문자열이 되고 `undefined`·함수·Map은 사라진다. 과거의 우회법 |

과거에는 깊은 복사에 Lodash의 `_.cloneDeep`을 주로 썼다. 지금은 대부분 `structuredClone`으로 충분하다. 얕은/깊은 복사의 일반 개념은 [[data-structures|기초 자료구조]]에 있다.

```javascript
const person = { name: 'wes', clothing: { shirts: 10 } }
const shallow = { ...person }
shallow.clothing.shirts = 100 // person.clothing.shirts도 100
const deep = structuredClone(person)
deep.clothing.shirts = 1      // person은 그대로
```

### 메모리: 스택과 힙

JavaScript는 메모리를 자동으로 관리한다. 직접 할당하거나 해제하지 않는다. 이렇게 엔진에 내장된 가비지 컬렉터가 해제를 맡는 언어를 **매니지드 언어**라고 한다. C처럼 개발자가 직접 할당·해제하는 언매니지드 언어보다 실수가 적고 생산적이지만, 해제 시점을 예측할 수 없어 성능을 세밀하게 통제하기 어렵다. 개념적으로는 두 영역으로 나눠 이해한다.

| 영역 | 담는 것 | 성질 |
| --- | --- | --- |
| 스택(stack) | 원시값, 객체를 가리키는 참조 | 크기가 정해진 값. 함수 호출이 끝나면 함께 사라진다 |
| 힙(heap) | 객체·배열·함수 본체 | 실행 중에 크기가 바뀔 수 있어 동적으로 할당한다 |

실제 엔진은 짧은 문자열을 힙에 두거나 객체를 스택에 두는 등 최적화를 하므로, 위 표는 "참조는 주소를 복사한다"를 이해하기 위한 모델이다. 어디서도 닿지 않게 된 객체는 **가비지 컬렉션(GC)** 이 회수한다. 도달 가능성 기준과 mark-and-sweep, 메모리 누수 패턴, WeakMap·WeakRef는 [[garbage-collection|가비지 컬렉션과 메모리 누수]]에 있다.

### const와 Object.freeze

`const`는 **변수와 값의 연결(binding)** 을 고정할 뿐, 객체 내용을 고정하지 않는다. `const` 객체의 속성은 바꿀 수 있다. 내용까지 막으려면 `Object.freeze(obj)`를 쓴다.

- `freeze`는 사본을 만들지 않고 **같은 객체를 얼린 뒤 돌려준다**.
- 얼린 객체를 고치면 일반 모드에서는 조용히 무시되고, strict mode에서는 `TypeError`가 난다.
- **얕게** 얼린다. 중첩 객체는 여전히 바꿀 수 있다.
- 내부적으로는 모든 속성을 `writable: false`·`configurable: false`로 바꾸고 확장을 막는 것이다. `seal`·`preventExtensions`와의 차이는 [[property-descriptors|속성 설명자]]에 있다.

## 핵심 정리

- 기본은 `const`, 바뀌어야 하면 `let`, `var`는 쓰지 않는다. 모듈은 자동으로 strict mode다.
- 형변환은 `String(x)`·`Number(x)`처럼 함수로 부른다. `new String`·`new Number`는 객체를 만들어 비교를 깨뜨린다.
- `undefined`는 "아직 없음", `null`은 "일부러 비움". 배열 판별은 `typeof`가 아니라 `Array.isArray`.
- 원시 타입은 값이, 참조 타입은 주소가 복사된다. 객체는 내용이 아니라 참조로 비교된다.
- spread는 얕은 복사, `structuredClone`은 깊은 복사. 함수에 넘긴 객체를 고치면 바깥도 바뀐다.
- `const`는 재할당을 막고, `Object.freeze`는 (한 단계) 변경을 막는다.

관련 노트: [[operators-and-control-flow|연산자와 제어문]], [[arrays-and-objects|배열·객체·문자열 다루기]], [[js-numbers|숫자와 Math]], [[map-and-set|Map과 Set]], [[functional-programming|함수형 프로그래밍]], [[strict-mode|strict mode]], [[js-symbol|Symbol]], [[js-strings|문자열 다루기]], [[garbage-collection|가비지 컬렉션과 메모리 누수]], [[object-to-primitive|객체의 원시형 변환]]
