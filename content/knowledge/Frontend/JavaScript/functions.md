---
title: "함수와 this"
concept: "Function"
summary: "함수 선언식·표현식(이름 있는 함수 표현식)·화살표 함수·IIFE(식 자리에 문장 쓰기)·메서드·new Function, 블록 안 함수 선언의 스코프, 함수도 객체라는 점(name·length·커스텀 속성), 매개변수와 인자(호출마다 평가되는 기본값·arguments·rest·spread), return과 early return, 이름 짓기, 생성자 함수(new.target·return 규칙)와 팩토리 함수, 호출 방식에 따라 달라지는 this(전역·암묵적·명시적·new·이벤트 핸들러), 화살표 함수에 없는 것들, bind·call·apply와 이벤트 리스너에 메서드를 넘길 때의 함정, 재귀와 콜 스택 깊이."
tags: ["javascript", "function", "frontend"]
source: til
date: "2026-10-21"
sources: ["https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/javascript/iife.md", "https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/javascript/this.md", "https://medium.com/@junep/%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C%EC%97%90%EC%84%9C-%ED%81%B4%EB%9E%98%EC%8A%A4%EC%99%80-%EC%A6%89%EC%8B%9C-%EC%8B%A4%ED%96%89-%ED%95%A8%EC%88%98-%EC%93%B0%EA%B8%B0-315c21bb2493", "https://riverkim.kr/209", "https://riverkim.kr/116", "https://wesbos.com/javascript/02-functions/functions-parameters-and-arguments", "https://wesbos.com/javascript/02-functions/different-ways-to-declare-functions", "https://wesbos.com/javascript/11-prototypes-this-new-and-inheritance/61-the-this-keyword", "https://wesbos.com/javascript/11-prototypes-this-new-and-inheritance/65-bind-call-and-apply", "https://wesbos.com/javascript/11-prototypes-this-new-and-inheritance/62-prototype-refactor-of-gallery-exercise", "https://web.dev/learn/javascript/functions", "https://web.dev/learn/javascript/functions/function-expressions", "https://web.dev/learn/javascript/functions/new", "https://web.dev/learn/javascript/functions/return", "https://web.dev/learn/javascript/functions/this", "https://ko.javascript.info/function-basics", "https://ko.javascript.info/function-expressions", "https://ko.javascript.info/arrow-functions-basics", "https://ko.javascript.info/object-methods", "https://ko.javascript.info/constructor-new", "https://ko.javascript.info/recursion", "https://ko.javascript.info/rest-parameters-spread", "https://ko.javascript.info/function-object", "https://ko.javascript.info/new-function", "https://ko.javascript.info/bind", "https://ko.javascript.info/arrow-functions", "https://ko.javascript.info/reference-type", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%ED%95%A8%EC%88%98%20%EA%B0%9D%EC%B2%B4%EC%9D%98%20%ED%94%84%EB%A1%9C%ED%8D%BC%ED%8B%B0%EC%99%80%20%EC%9D%BC%EA%B8%89%20%EA%B0%9D%EC%B2%B4.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%ED%95%A8%EC%88%98-2.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%EC%83%9D%EC%84%B1%EC%9E%90%20%ED%95%A8%EC%88%98%EC%97%90%20%EC%9D%98%ED%95%9C%20%EA%B0%9D%EC%B2%B4%20%EC%83%9D%EC%84%B1.md"]
---

> 직접 정리한 TIL에 Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)와 web.dev의 「[Learn JavaScript](https://web.dev/learn/javascript)」 강좌(함수 모듈), javascript.info(모던 JavaScript 튜토리얼)의 함수 기초·함수 심화 글(「함수」, 「함수 표현식」, 「메서드와 this」, 「new 연산자와 생성자 함수」, 「재귀와 스택」, 「나머지 매개변수와 스프레드 문법」, 「객체로서의 함수와 기명 함수 표현식」, 「new Function 문법」, 「함수 바인딩」, 「화살표 함수 다시 살펴보기」, 「참조 타입」)을 함께 참고했다. 프론트엔드에서의 쓰임은 이문기의 「[프론트엔드에서 클래스와 즉시 실행 함수 쓰기](https://medium.com/@junep/%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C%EC%97%90%EC%84%9C-%ED%81%B4%EB%9E%98%EC%8A%A4%EC%99%80-%EC%A6%89%EC%8B%9C-%EC%8B%A4%ED%96%89-%ED%95%A8%EC%88%98-%EC%93%B0%EA%B8%B0-315c21bb2493)」(2023.08)를 더했다. 「[Must-Know-About-Frontend: IIFE](https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/javascript/iife.md)」, 「[Must-Know-About-Frontend: this의 바인딩](https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/javascript/this.md)」의 내용을 더해 보강했다. 「[Frontend_TIL: 함수 객체의 프로퍼티와 일급 객체](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%ED%95%A8%EC%88%98%20%EA%B0%9D%EC%B2%B4%EC%9D%98%20%ED%94%84%EB%A1%9C%ED%8D%BC%ED%8B%B0%EC%99%80%20%EC%9D%BC%EA%B8%89%20%EA%B0%9D%EC%B2%B4.md)」, 「[Frontend_TIL: 함수-2](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%ED%95%A8%EC%88%98-2.md)」을 바탕으로 보강했다. 「[Frontend_TIL: 생성자 함수에 의한 객체 생성](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%EC%83%9D%EC%84%B1%EC%9E%90%20%ED%95%A8%EC%88%98%EC%97%90%20%EC%9D%98%ED%95%9C%20%EA%B0%9D%EC%B2%B4%20%EC%83%9D%EC%84%B1.md)」을 바탕으로 보강했다.

JavaScript의 함수는 **일급 객체(first-class citizen)** 다. 변수에 할당할 수 있고, 다른 함수의 인자로 넘길 수 있고, 함수의 반환값이 될 수 있다. 이 성질 덕분에 콜백, 고차 함수, 클로저, React 컴포넌트 같은 패턴이 가능하다. 함수 안의 `this`는 함수를 **어떻게 호출했는지**에 따라 달라진다.

## 함수를 만드는 방법

```javascript
function add(a, b) { return a + b }          // 선언식(declaration)
const sub = function (a, b) { return a - b } // 표현식(expression): 함수를 값으로 변수에 담는다
const mul = (a, b) => a * b                   // 화살표 함수: 항상 표현식이다
const user = { sayHi() { return 'hi' } }      // 메서드: 객체 속성에 담긴 함수 (단축 문법)
```

| 구분 | 선언식 | 표현식·화살표 함수 |
| --- | --- | --- |
| 이름 | 필수 | 생략 가능(익명). 브라우저가 변수 이름을 함수 이름으로 추론해 스택 트레이스에 보여 준다 |
| 호이스팅 | 본문까지 끌어올려져 선언 전에 호출 가능 | 담긴 변수의 규칙을 따름 — `const`면 선언 전 호출 시 `ReferenceError` |

호이스팅의 자세한 동작과 TDZ는 [[scope-and-closures|스코프와 클로저]]에 있다. **블록 `{}` 안의 함수 선언**은 strict mode에서 `let`처럼 그 블록에 갇히고, sloppy mode에서는 바깥 함수 스코프로 새어 나간다. 모드에 따라 동작이 갈리므로 블록 안에서 함수가 필요하면 `const f = () => {}`로 쓴다. 선언 전에 호출하는 코드는 읽는 흐름을 헷갈리게 하므로, 선언식을 쓰더라도 먼저 정의하고 나중에 부르는 편이 낫다.

이 밖에 `async function`은 Promise를 돌려주는 함수([[async-await|async/await]]), `function*`은 실행을 멈췄다 이어 가는 제너레이터 함수다([[iterators-and-generators|이터레이터와 제너레이터]]).

### 이름 있는 함수 표현식

함수 표현식에도 이름을 붙일 수 있다. 이 이름은 **함수 자신의 본문 안에서만** 보인다. 바깥에서는 담은 변수 이름으로 부른다.

```javascript
const countdown = function tick(n) {
  if (n > 0) setTimeout(() => tick(n - 1), 1000) // 안에서는 자기 이름으로 재귀
}
typeof tick // 'undefined' — 바깥에서는 보이지 않는다
```

이름은 스택 트레이스에 찍혀 디버깅을 돕고, 담은 변수가 나중에 재할당돼도 자기 자신을 확실히 가리킨다.

**메서드**는 객체에 속한 함수다. `Math.max()`, `console.log()`처럼 점 왼쪽에 객체가 있는 호출이 메서드 호출이고, 그 객체가 메서드 안의 `this`가 된다.

### 즉시 실행 함수(IIFE)

함수 표현식을 괄호로 감싸 정의하자마자 실행한다. 함수가 자기 스코프를 만든다는 점을 이용해, 변수가 전역으로 새지 않게 가두는 데 썼다.

```javascript
(function (age) {
  const secret = 'hidden' // 밖에서 보이지 않는다
  console.log(age)
})(30)
```

함수 표현식이면 호출 괄호를 그룹 괄호 안(`(function () {}())`)에 둬도, 밖(`(function () {})()`)에 둬도 된다. **화살표 함수는 밖에만** 둘 수 있다. `(() => {}())`는 SyntaxError이고 `(() => {})()`로 쓴다. 화살표 함수는 식 자리에서 먼저 완성된 뒤에야 호출할 수 있기 때문이다.

과거에는 모듈 패턴과 클로저를 만드는 기본 도구였다. 인자로 전역을 받아 지역 이름으로 바꾸는 데도 썼다. `(function ($) { … })(jQuery)`는 다른 라이브러리가 전역 `$`를 차지해도 안에서는 `$`가 jQuery를 가리키게 하고, `(function (window, document) { … })(window, document)`는 압축 도구가 지역 이름을 `w`·`d`로 줄일 수 있게 한다. 지금은 블록 스코프(`let`·`const`)와 ES 모듈이 같은 일을 하므로, 스코프를 가두는 용도로는 거의 쓰지 않는다. 남은 쓰임은 둘이다. 최상위에서 `await`를 쓸 수 없는 환경에서 `(async () => { … })()`로 감쌀 때, 그리고 **식 자리에서 문장을 쓰고 싶을 때**다.

#### 식 자리에 문장 쓰기

`const`에 값을 한 번만 대입하고 싶은데 계산에 분기가 여러 개 필요하면 삼항 연산자가 중첩되기 쉽다. `let`으로 선언하고 `if`로 채우면 나중에 다른 곳에서 엉뚱한 값을 다시 대입할 여지가 생긴다. IIFE로 감싸면 `if`와 early return을 쓰면서도 결과는 `const` 하나에 한 번만 들어간다.

```javascript
const serviceDiscount = await getServiceDiscount()

// 중첩 삼항 대신
const price = (() => {
  const hasService = serviceDiscount > 0
  const hasProduct = product.discount > 0
  if (hasService && hasProduct) {
    return (1 - Math.max(serviceDiscount, product.discount)) * product.regularPrice
  }
  if (hasService) return (1 - serviceDiscount) * product.regularPrice
  if (hasProduct) return (1 - product.discount) * product.regularPrice
  return product.regularPrice
})()
```

- 계산에 쓴 임시 변수가 IIFE 안에 갇혀, 같은 스코프에서 비슷한 계산을 반복할 때 `slicedUsers` 같은 이름이 충돌하지 않는다.
- 함수 이름·매개변수·타입·위치를 고민하는 비용 없이 위에서 아래로 쓰던 흐름을 유지한다.
- **함수 추출의 예비 단계**가 된다. 나중에 IIFE 본문을 그대로 이름 붙은 함수로 옮기면 된다.
- 일반 IIFE 안에서는 `await`를 쓸 수 없다. 비동기 값은 바깥에서 먼저 받아 오거나 `async` IIFE의 결과를 `await`한다. 옛 코드의 `!function () {}()`, `+function () {}()`도 같은 IIFE다. 괄호 대신 단항 연산자를 앞에 붙여 `function`을 선언문이 아닌 식으로 읽히게 한 것이다(선언문은 이름이 필수이고 정의하자마자 호출할 수 없다).

### 문자열로 함수 만들기: new Function

`new Function('a', 'b', 'return a + b')`는 **실행 중에 받은 문자열**로 함수를 만든다. 마지막 인자가 본문이고 앞의 인자들이 매개변수다. 서버에서 받은 코드나 템플릿을 동적으로 컴파일하는 특수한 경우에만 쓴다.

```javascript
function getFunc() {
  const value = 'test'
  return new Function('return typeof value')
}
getFunc()() // 'undefined' — 바깥 함수의 value를 보지 못한다
```

- 이렇게 만든 함수는 **만들어진 위치가 아니라 전역 스코프**를 바깥 환경으로 가진다. 그래서 지역 변수에 접근할 수 없고, 필요한 값은 매개변수로 넘긴다. JavaScript에서 클로저가 되지 않는 유일한 함수 생성 방식이다([[scope-and-closures|스코프와 클로저]]).
- 이 제약 덕분에 압축기(minifier)가 지역 변수 이름을 줄여도 문자열 코드가 깨지지 않는다.
- `eval`처럼 문자열을 코드로 실행하므로, 콘텐츠 보안 정책(CSP)에 `'unsafe-eval'`이 없으면 막힌다. 사용자 입력을 넣으면 코드 주입 통로가 된다. `setTimeout('코드 문자열', ms)`도 같은 이유로 쓰지 않는다.

## 함수도 객체다

함수는 **호출할 수 있는 객체**다. `typeof`는 `'function'`이지만 속성을 읽고, 붙이고, 참조로 넘길 수 있다. `call`·`apply`·`bind`도 모든 함수가 `Function.prototype`에서 물려받은 메서드다.

| 속성 | 값 | 주의 |
| --- | --- | --- |
| `name` | 함수 이름 | 익명 함수라도 `const sayHi = function () {}`, 기본값 `(f = () => {})`, 객체 메서드처럼 **문맥에서 이름을 추론**한다(contextual name). `[function () {}]`처럼 추론할 곳이 없으면 빈 문자열 |
| `length` | 선언한 매개변수 개수 | rest 매개변수와, 기본값이 있는 첫 매개변수부터 뒤는 세지 않는다. `(a, b = 1, c) => {}`의 `length`는 1 |
| `prototype` | `new`로 만들 인스턴스의 프로토타입이 될 객체 | **생성자가 될 수 있는 함수**(함수 선언·표현식, `class`)에만 있다. 화살표 함수와 `{ method() {} }` 단축 메서드에는 없다([[prototype-and-inheritance\|프로토타입과 상속]]) |
| `__proto__` | 함수 자신의 프로토타입(`Function.prototype`) | 함수의 속성이 아니라 `Object.prototype`에서 물려받은 접근자다 |
| `arguments`·`caller` | 함수 객체에 붙은 인자 목록, 자신을 부른 함수 | 비표준이거나 폐기된 속성이다. strict mode 함수에서는 읽으면 `TypeError`다. 인자는 함수 안의 지역 `arguments`나 rest 매개변수로 읽는다 |
| 커스텀 속성 | `fn.counter = 0`처럼 직접 붙인 값 | 함수 안의 지역 변수와 아무 관계가 없다 |

`length`는 받은 콜백의 모양에 따라 다르게 부르는 다형적 함수에 쓰인다. 인자가 없는 핸들러(`handler.length === 0`)는 성공할 때만, 인자를 받는 핸들러는 결과를 넘겨 항상 부르는 식이다.

**커스텀 속성은 클로저 변수를 대신할 수 있지만 성질이 다르다.** 클로저의 변수는 바깥에서 건드릴 수 없고, 함수 속성은 누구나 `counter.count = 10`으로 바꿀 수 있다. 숨겨야 하면 클로저, 노출해도 되면 속성이다. jQuery의 `$`, lodash의 `_`처럼 주 함수 하나에 `_.clone` 같은 도우미를 속성으로 붙여 전역 이름 하나만 쓰는 라이브러리 구조도 이 성질을 이용한다.

이름 있는 함수 표현식의 이름을 재귀에 쓰는 이유도 여기서 나온다. 바깥 변수 이름으로 자기를 부르면, 그 변수가 `sayHi = null`처럼 바뀌는 순간 깨진다. 함수 표현식의 이름은 함수 자신의 스코프에만 있어서 바깥 재할당의 영향을 받지 않는다. 함수 선언문에는 이런 내부 이름을 따로 붙일 수 없다.

## 매개변수와 인자

**매개변수(parameter)** 는 함수를 정의할 때 적는 자리 표시자, **인자(argument)** 는 호출할 때 실제로 넘기는 값이다. 호출하면 인자 값이 매개변수에 **복사되어** 그 함수의 지역 변수가 되므로, 바깥 변수와 이름이 같아도 충돌하지 않고 함수 안에서 매개변수를 재할당해도 바깥 변수는 그대로다(객체를 넘기면 참조가 복사되므로 속성 변경은 바깥에 보인다. [[variables-and-types|변수와 데이터 타입]]). 인자 자리에는 값을 만드는 식이면 무엇이든 올 수 있다. 다른 함수의 호출 결과도 된다.

```javascript
const pair = (a, b) => [a, b]
pair(1, 2, 3) // [1, 2] — 남는 인자는 무시
pair(1)       // [1, undefined] — 모자란 인자는 undefined
```

엔진은 인자의 **개수도 타입도 검사하지 않는다.** `add('a', 2)`도 에러 없이 `'a2'`가 된다. 잘못된 인자를 막으려면 함수 안에서 `typeof`로 확인해 에러를 던지거나, 정적 검사인 [[typescript-basics|TypeScript]]를 쓴다. 매개변수는 적을수록 이해하기 쉽다. 셋을 넘으면 순서를 외워야 하므로 아래 「기본값」 끝의 방법처럼 객체 하나로 받는다.

### 기본값

```javascript
function calculateBill(meal, taxRate = 0.13, tipRate = 0.15) {
  return meal + meal * taxRate + meal * tipRate
}
calculateBill(100, undefined, 0.2) // 가운데만 기본값을 쓰고 싶으면 undefined를 넘긴다
calculateBill(100, null, 0.2)      // null·0은 값으로 취급되어 기본값이 적용되지 않는다
```

**기본값은 인자가 `undefined`일 때만** 쓰인다. 기본값 자리의 식은 **호출할 때마다, 그 인자가 빠졌을 때만** 평가된다. `function f(id = createId())`는 `id`를 넘기면 `createId`를 부르지 않고, 빼먹을 때마다 새로 부른다. 앞 매개변수를 뒤 기본값에 쓸 수도 있다(`(a, b = a * 2) => …`).

> 과거에는 기본값 문법이 없어서 본문에서 `if (text === undefined) text = '기본'`이나 `text = text || '기본'`으로 채웠다. `||`는 `''`·`0`까지 기본값으로 바꿔 버리므로, 본문에서 채워야 한다면 `text ?? '기본'`을 쓴다.

선택 인자가 여러 개라 순서가 헷갈리면 `({ taxRate = 0.13, tipRate = 0.15 } = {})`처럼 객체 하나를 구조 분해로 받는 편이 읽기 쉽다.

### arguments 객체

화살표 함수가 아닌 함수 안에는 넘어온 인자 전부를 담은 `arguments`가 자동으로 있다. 매개변수를 적지 않았어도 들어오고, 인덱스와 `length`가 있지만 배열은 아닌 **유사 배열**이라 `map` 같은 메서드가 없다.

```javascript
function legacySum() {
  let total = 0
  for (let i = 0; i < arguments.length; i++) total += arguments[i]
  return total
}
legacySum(1, 2, 3) // 6
```

개수가 정해지지 않은 인자를 받는 **가변 인자 함수(variadic function)** 를 만들던 옛 방식이다. `arguments`는 이터러블이라 `for...of`는 되지만, 배열 메서드가 없고 인자 일부만 골라 받을 수도 없다. 지금은 아래의 rest 매개변수로 쓴다. 이름이 붙고 진짜 배열이며 화살표 함수에서도 된다. 화살표 함수 안의 `arguments`는 자기 것이 아니라 **바깥 일반 함수의 것**이고, 바깥에 없으면 `ReferenceError`다.

### rest와 spread (`...`)

같은 `...` 기호지만 위치에 따라 역할이 반대다.

```javascript
// rest: 남은 인자들을 배열로 모은다 (Python의 *args와 유사)
const restOpr = (arg1, arg2, ...restArgs) => [arg1, arg2, restArgs]
restOpr(1, 2, 3, 4, 5) // [1, 2, [3, 4, 5]]
restOpr(1, 2)          // [1, 2, []] — 넘어온 인자가 없으면 빈 배열

// spread: 배열을 펼쳐 개별 인자로 전달한다
const sum3 = (a, b, c) => a + b + c
sum3(...[1, 2, 3]) // 6
Math.max(1, ...arr1, 2, ...arr2) // 여러 번, 일반 인자와 섞어서도 펼친다
```

- rest 매개변수는 **맨 마지막에 하나만** 둔다. `(a, ...rest, b)`는 SyntaxError다.
- spread는 배열뿐 아니라 **이터러블이면 무엇이든** 펼친다. `[...'Hello']`는 글자 배열이 된다. 내부에서 `for...of`와 같은 이터레이터를 쓰기 때문이다([[iterators-and-generators|이터레이터와 제너레이터]]).
- `length`와 인덱스만 있는 **유사 배열**(이터러블이 아닌 것)은 spread로 펼칠 수 없다. 둘 다 받는 `Array.from`이 배열 변환에 더 범용적이다.
- 배열·객체 리터럴 안의 spread로 얕은 복사를 만드는 법과 그 한계는 [[arrays-and-objects|배열·객체·문자열 다루기]]에 있다.

## return

`return`을 만나면 함수는 **그 자리에서 끝나고** 값을 호출한 쪽에 돌려준다. 그 뒤의 코드는 실행되지 않는다(콘솔이 "unreachable code" 경고를 띄우기도 한다). 값 없는 `return;`과 `return`이 없는 함수는 `undefined`를 돌려준다.

- 함수를 부른 식 자체가 반환값이 되므로 `double(2) + double(3)`처럼 값처럼 쓴다.
- 조건이 안 맞는 경우를 맨 앞에서 `return`으로 끝내는 **early return**은 중첩 if를 줄인다(예시는 [[operators-and-control-flow|연산자와 제어문]]의 조건문 절).
- `return` 바로 뒤에서 줄을 바꾸면 자동 세미콜론 삽입으로 `undefined`가 반환된다. 반환할 식은 같은 줄에서 시작한다([[statements-vs-expressions|문과 식]]).

## 이름 짓기

함수는 동작이므로 이름은 보통 **동사로 시작**한다. 팀이 뜻을 합의한 접두어를 쓰면 이름만 보고 무엇을 돌려주는지 안다.

| 접두어 | 하는 일 | 하지 않는 일 |
| --- | --- | --- |
| `get…` | 값을 구해 돌려준다 | 화면에 출력하지 않는다 |
| `calc…` | 계산해 결과를 돌려준다 | 상태를 바꾸지 않는다 |
| `create…` | 무언가를 만들어 돌려준다 | 만든 것을 문서에 붙이지 않는다 |
| `check…`·`is…`·`has…` | 확인해 불리언을 돌려준다 | 결과 메시지를 띄우지 않는다 |
| `show…` | 무언가를 보여 준다 | — |

**함수 하나는 이름이 말하는 일 하나만** 한다. 두 동작이 한곳에서 함께 필요하면 각각 함수로 만들고 셋째 함수에서 둘을 부른다. 길어진 함수를 `isPrime(n)`처럼 이름 붙은 작은 함수로 쪼개면 이름이 주석 역할을 한다(자기 설명적 코드). 원칙의 배경은 [[clean-code-functions-naming|클린 코드: 함수와 이름]]에 있다. 바깥 변수를 몰래 고치는 함수보다 **매개변수를 받아 반환값을 만드는 함수**가 읽고 테스트하기 쉽다.

## 화살표 함수

```javascript
const double = (num) => { return num * 2 } // function 키워드 생략
const double2 = num => num * 2             // 매개변수가 하나면 () 생략, 본문이 식 하나면 {}와 return 생략(암묵적 반환)
const makeObj = () => ({ key: 'value' })   // 객체를 바로 반환할 때는 ()로 감싼다
```

인수가 없으면 빈 괄호 `()`는 생략할 수 없다. `() => { key: 'value' }`처럼 괄호 없이 객체를 쓰면 `{}`가 본문 블록으로 해석되어 `undefined`를 반환한다.

화살표 함수는 짧은 문법 이상의 차이가 있다. **자기 문맥을 만들지 않는 작은 함수**로 설계됐다.

| 화살표 함수에 없는 것 | 결과 |
| --- | --- |
| 자기 `this` | 바깥 스코프의 `this`를 변수처럼 찾아 쓴다 |
| 자기 `arguments` | 바깥 일반 함수의 `arguments`를 읽는다 |
| 자기 `super` | 바깥 메서드의 `super`를 쓴다. 그래서 메서드 안 `setTimeout(() => super.stop())`이 동작한다([[class\|class 문법]]) |
| `[[Construct]]`·`prototype` | `new`로 부를 수 없다(생성자가 아니다) |

`fn.bind(this)`와도 다르다. `bind`는 this를 고정한 **새 함수(bound function)** 를 만들고, 화살표 함수는 아무것도 묶지 않은 채 바깥의 `this`를 렉시컬 스코프 규칙으로 찾을 뿐이다. 그래서 콜백 안에서 this가 바뀌는 문제를 피할 때 유용하지만, 객체의 메서드나 `this`가 필요한 이벤트 핸들러로 쓰면 this가 그 객체를 가리키지 않는다.

```javascript
button.addEventListener('click', function () {
  setTimeout(() => {
    this.textContent = '눌림' // 화살표 함수라 this는 바깥(클릭된 button)이다
  }, 1000)
})
```

콜백을 `function () { … }`로 쓰면 그 안의 `this`는 button이 아니게 되어(일반 함수 호출) 아무 일도 일어나지 않는다.

## this

`this`는 함수가 정의된 위치가 아니라 **호출된 방식(실행 문맥)** 에 따라 결정된다. 메서드 호출에서는 **점 왼쪽의 객체**가 this다.

| 호출 방식 | this |
| --- | --- |
| 메서드 호출 `obj.method()` | 메서드를 호출한 객체 |
| 생성자·클래스 `new Foo()` | 새로 만들어지는 인스턴스(Python의 `self`) |
| 이벤트 리스너 `el.addEventListener('click', fn)` | 리스너가 붙은 요소(`e.currentTarget`과 같다) |
| 일반 함수 호출 `fn()` | strict mode에서는 `undefined`, 아니면 전역 객체(`window`) |
| 화살표 함수 | 바깥 스코프의 this |
| `fn.call(x)`·`fn.bind(x)` | 명시한 `x`. 메서드 호출의 this보다 우선한다 |
| 함수 바깥(최상위) | 일반 스크립트에서는 전역 객체(`globalThis`: 브라우저 `window`, Node.js `global`), ES 모듈에서는 `undefined` |

여러 규칙이 겹치면 **`new` > 명시적 바인딩(`call`·`apply`·`bind`) > 메서드 호출(암시적 바인딩) > 일반 호출(기본 바인딩)** 순으로 이긴다. `bind`로 묶은 함수도 `new`로 부르면 묶은 값이 무시되고 새 인스턴스가 this가 된다. 화살표 함수는 이 순위 밖이다. 자기 this가 없어 `call`·`bind`·`new` 어느 것으로도 바꿀 수 없다([[execution-context|실행 컨텍스트]]).

sloppy mode에서는 `fn.call(null)`의 this가 전역 객체로, `fn.call(10)`의 this가 래퍼 객체 `Number {10}`으로 바뀐다. strict mode에서는 넘긴 값이 그대로 this가 된다([[strict-mode|strict mode]]).

ES 모듈과 `class` 본문은 자동으로 strict mode이므로, 요즘 코드에서 메서드를 떼어 부르면 this는 대개 `undefined`다.

```javascript
function getFullName() {
  return this.firstName + this.lastName
}
const me = { firstName: 'John', lastName: 'Doe', getFullName }

me.getFullName()  // 'JohnDoe' (this === me)
getFullName()     // 일반 함수 호출: strict면 TypeError, 아니면 NaN(this === window)
```

this가 살아남는 것은 **점(또는 대괄호) 접근 바로 뒤에서 호출할 때뿐**이다. 명세는 `obj.method`를 평가한 결과를 값이 아닌 "참조 타입(Reference Type)"으로 들고 있다가 바로 이어지는 `()`에 `obj`를 this로 넘긴다. 그 사이에 다른 연산이 끼면 참조 정보가 사라져 일반 함수 호출이 된다. `const f = obj.method; f()`, `(cond ? obj.a : obj.b)()`, `(obj.method || fallback)()`는 모두 this가 `undefined`(sloppy mode면 전역 객체)다. 괄호로만 감싼 `(obj.method)()`는 참조가 유지된다.

같은 이유로 객체 리터럴에 **화살표 함수로 메서드를 만들면** `obj.arrow()`로 불러도 this가 obj가 아니다. 화살표 함수의 this는 리터럴을 감싼 바깥(최상위라면 전역 객체나 `undefined`)이다. 반대로 메서드 안에서 만든 화살표 함수는 그 메서드의 this, 즉 obj를 물려받는다.

```javascript
const obj = {
  name: 'river',
  arrow: () => this?.name,          // 바깥 this — obj가 아니다
  method() { return this.name },    // 'river'
  later() { return () => this.name }, // 메서드의 this를 물려받아 'river'
}
```

객체 리터럴 안에서 메서드가 아닌 속성 값으로 `this`를 쓰면 그 객체를 가리키지 않는다. `{ fullName: this.firstName }`의 this는 리터럴 바깥의 this다. 생성자 안의 `this`로 인스턴스마다 데이터를 담는 방식은 [[prototype-and-inheritance|프로토타입과 상속]]에 있다.

## bind · call · apply

메서드를 변수·콜백·`setTimeout`·이벤트 핸들러로 넘기면 점 왼쪽의 객체가 사라져 `this`를 잃는다. 세 메서드는 모든 함수에 있고, 첫 인자로 this를 정한다.

| 메서드 | 실행 시점 | 나머지 인자 |
| --- | --- | --- |
| `fn.bind(thisArg, ...args)` | 실행하지 않고 **this를 고정한 새 함수**를 돌려준다 | 앞쪽 인자를 미리 채울 수 있다(부분 적용) |
| `fn.call(thisArg, a, b)` | 즉시 실행 | 하나씩 나열 |
| `fn.apply(thisArg, [a, b])` | 즉시 실행 | 배열 하나로. spread가 생긴 뒤로는 `fn.call(x, ...arr)`로 대신한다 |

```javascript
const bill = {
  total: 1000,
  calculate(taxRate) { return this.total + this.total * taxRate },
}
const calc = bill.calculate
calc(0.13)                                 // this를 잃음 — strict면 TypeError, 아니면 NaN
bill.calculate.bind(bill)(0.13)            // 1130
bill.calculate.bind({ total: 500 }, 0.06)() // 530 — this와 인자를 미리 채운 함수
bill.calculate.call({ total: 500 }, 0.06)   // 530 — 바로 실행

const $ = document.querySelector             // $('p') → TypeError: Illegal invocation
const $$ = document.querySelectorAll.bind(document) // 어디서 찾을지(document)를 고정
```

`querySelector`는 this(점 왼쪽의 `document`나 요소)를 보고 어디서 찾을지 정하므로, 떼어 내면 실행할 수 없다.

- `setTimeout(user.sayHi, 1000)`도 같은 문제다. 브라우저의 `setTimeout`은 콜백을 부를 때 this로 `window`를 넘기고, Node.js에서는 타이머 객체를 넘긴다. 어느 쪽이든 `user`가 아니다.
- **감싸는 함수와 `bind`는 시점이 다르다.** `setTimeout(() => user.sayHi(), 1000)`은 1초 뒤 **그때의** `user` 변수를 읽으므로, 그사이 `user`가 다른 객체로 바뀌면 바뀐 쪽을 부른다. `user.sayHi.bind(user)`는 bind하는 순간의 객체에 묶인다.
- **묶인 함수는 다시 묶을 수 없다.** `f.bind(a).bind(b)`의 this는 여전히 `a`다. bind가 돌려준 함수는 원래 함수를 감싼 특수 객체(exotic object)라, 원래 함수에 붙인 커스텀 속성도 보이지 않는다.
- 객체의 메서드를 한꺼번에 묶으려면 `for (const key in obj) if (typeof obj[key] === 'function') obj[key] = obj[key].bind(obj)`처럼 돈다(lodash `_.bindAll`).
- `bind(null, 값)`으로 인자만 미리 채우는 부분 적용과, this는 그대로 두고 인자만 채우는 `partial` 헬퍼는 [[functional-programming#7. 커링과 부분 적용|함수형 프로그래밍]]에 있다. 래퍼가 받은 this와 인자를 원래 함수에 그대로 넘기는 콜 포워딩, 유사 배열에 배열 메서드를 빌려 쓰는 메서드 빌리기도 거기서 다룬다.

화살표 함수와 `bind`가 생기기 전에는 `const self = this`(또는 `that`, `_this`)로 this를 변수에 담아 콜백에서 클로저로 읽었다. 옛 코드에서 이런 이름이 보이면 이 우회법이다.

### 이벤트 리스너에 메서드 넘기기

클래스나 프로토타입 메서드를 리스너로 넘기면 this가 인스턴스가 아니라 요소가 된다. 인라인 화살표 함수나 `this.show.bind(this)`로 감싸면 동작은 하지만, **호출할 때마다 새 함수가 생겨 `removeEventListener`로 떼어 낼 수 없다.** 떼어 낼 리스너는 바인딩한 함수를 한 번 만들어 붙잡아 둔다.

```javascript
class Gallery {
  constructor(el) {
    this.el = el
    this.showNext = this.showNext.bind(this) // 방법 1: 생성자에서 바인딩해 인스턴스 속성으로
  }
  showNext() { /* this === 인스턴스 */ }
  handleKeyUp = (e) => { /* 방법 2: 화살표 함수 클래스 필드. this가 인스턴스로 고정된다 */ }

  open() {
    this.el.addEventListener('click', this.showNext)
    window.addEventListener('keyup', this.handleKeyUp)
  }
  close() {
    this.el.removeEventListener('click', this.showNext) // 같은 참조라 떼어진다
    window.removeEventListener('keyup', this.handleKeyUp)
  }
}
```

두 방법 모두 인스턴스마다 함수가 하나씩 생긴다. 프로토타입에 한 벌만 두는 이점과 바꾸는 셈이다. 리스너가 많으면 `addEventListener(type, fn, { signal })`로 `AbortController`의 signal을 넘기고 `controller.abort()` 한 번으로 모두 떼어 낼 수도 있다. React처럼 떼어 낼 필요가 없는 핸들러는 `onPress={() => onDelete(id)}`처럼 인라인 화살표 함수로 인자를 채우는 경우가 흔하다([[react-native-basics|React Native 기초와 스타일링]]).

## 생성자 함수와 팩토리 함수

객체를 찍어 내는 함수는 두 가지 모양이 있다. 이름이 비슷하게 쓰이지만 동작이 다르다.

| | 생성자 함수 | 팩토리 함수 |
| --- | --- | --- |
| 부르는 법 | `new Person('river')` | `createPerson('river')` |
| 객체를 만드는 쪽 | `new`가 만들어 `this`로 넘기고, 본문이 채운다 | 본문이 객체 리터럴을 직접 `return`한다 |
| 이름 관례 | 대문자로 시작 | 소문자, `create`·`make` 접두사 |
| 프로토타입 공유 | `Person.prototype`에 메서드를 두면 모든 인스턴스가 공유 | 기본은 공유 없음(필요하면 `Object.create`) |
| `new`를 빼먹으면 | sloppy mode에서는 `this`가 전역 객체라 전역 변수가 생긴다 | 문제없다 |

```javascript
function Person(name) { this.name = name }          // 생성자
const createPerson = (name) => ({ name })           // 팩토리
```

생성자 함수의 세부 규칙은 다음과 같다. 함수 객체는 일반 호출용 내부 메서드 `[[Call]]`을 모두 갖지만, `new`용 `[[Construct]]`는 **constructor**만 갖는다. 함수 선언·함수 표현식·`class`가 constructor이고, 화살표 함수와 객체·클래스의 단축 메서드(`{ sayHi() {} }`)는 **non-constructor**라 `new`로 부르면 `TypeError`다. constructor인 함수는 `new`와 부르면 생성자처럼 동작하고, 대문자 이름은 "`new`와 부르라"는 약속일 뿐이다.

| 규칙 | 동작 |
| --- | --- |
| `return 객체` | `this` 대신 그 객체가 결과가 된다 |
| `return 원시값` 또는 `return;` | 무시되고 `this`가 결과가 된다 |
| `new.target` | `new`로 불렸으면 그 함수, 그냥 불렸으면 `undefined`. `if (!new.target) return new User(name)`으로 `new`를 빠뜨려도 동작하게 만드는 라이브러리가 있지만, 객체를 만드는지 코드만 보고 알 수 없게 되므로 남발하지 않는다 |
| `new User` | 인자가 없으면 괄호를 생략할 수 있지만 좋은 스타일이 아니다 |
| `new function () { … }` | 한 번만 쓸 복잡한 객체를 익명 생성자로 만든다. 재사용은 막고 지역 변수로 생성 로직을 감싼다 |

생성자 함수의 역할은 지금 `class`가 맡는다. class는 `new` 없이 부르면 `TypeError`라서 `new.target` 검사가 필요 없다. `new`가 내부에서 하는 일은 [[prototype-and-inheritance|프로토타입과 상속]]에, 클래스 문법은 [[class|class 문법]]에 있다. 팩토리 함수는 클로저로 비공개 상태를 숨기기 좋다([[scope-and-closures|스코프와 클로저]]).

## 재귀와 콜 스택

함수가 자기 자신을 부르는 **재귀(recursion)** 는 문제를 "바로 답이 나오는 경우(베이스)"와 "더 작은 같은 문제로 줄이는 경우(재귀 단계)"로 나눈다. 일반 개념과 종료 조건은 [[recursion|재귀 함수]]에 있고, 여기서는 JavaScript 엔진에서의 동작만 다룬다.

- 함수를 부를 때마다 매개변수·지역 변수·현재 실행 위치를 담은 **실행 컨텍스트**가 하나 만들어진다. 함수 안에서 다른 함수를 부르면 현재 컨텍스트는 **실행 컨텍스트 스택(콜 스택)** 에 쌓인 채 멈추고, 안쪽 호출이 끝나면 꺼내져 멈춘 곳부터 이어 간다([[stack|스택]], [[event-loop|이벤트 루프]]).
- 중첩 호출의 최대 개수를 **재귀 깊이**라 한다. 엔진은 깊이에 한도를 두며, 넘으면 `RangeError: Maximum call stack size exceeded`가 난다. 한도는 엔진과 프레임 크기에 따라 다르고 대략 만 단위다. 꼬리 호출 최적화(TCO)는 ES2015 명세에 있지만 Safari(JavaScriptCore) 말고는 구현하지 않았으므로 기대하지 않는다.
- 컨텍스트마다 메모리를 쓰므로, 깊이가 입력 크기에 비례하는 재귀(`pow(x, n)`)는 반복문으로 바꾸면 메모리가 일정해진다. 모든 재귀는 반복문으로 바꿀 수 있다. 다만 분기가 여러 갈래로 나뉘는 재귀는 반복문으로 바꿔도 이득이 적고 코드만 복잡해진다.

재귀가 빛나는 곳은 **재귀적 자료 구조**다. 자기와 같은 모양을 품는 구조(DOM 트리, 중첩 메뉴, 부서 안의 하위 부서, `{ value, next }`로 이어지는 연결 리스트)는 깊이를 미리 몰라도 재귀로 순회한다.

```javascript
// 부서는 직원 배열이거나, 하위 부서를 담은 객체다
function sumSalaries(department) {
  if (Array.isArray(department)) {                    // 베이스: 직원 배열
    return department.reduce((sum, p) => sum + p.salary, 0)
  }
  return Object.values(department)                    // 재귀 단계: 하위 부서마다
    .reduce((sum, sub) => sum + sumSalaries(sub), 0)
}
```

중첩 반복문으로는 깊이마다 반복문을 하나씩 더 써야 하지만, 재귀는 깊이와 상관없이 같은 코드로 끝난다. 연결 리스트는 [[data-structures|기초 자료구조]]를 참고한다.

## 핵심 정리

- 함수는 값이다(일급 객체). `name`·`length`·커스텀 속성을 가진 호출 가능한 객체이기도 하다. 선언식만 본문째 호이스팅되고, IIFE는 모듈 이전 시대의 스코프 가두기, `new Function`은 전역 스코프만 보는 문자열 함수다.
- 매개변수는 자리, 인자는 복사된 값이다. 기본값은 `undefined`일 때만, 호출할 때마다 평가된다.
- `...`은 매개변수 자리에서는 모으고(rest), 호출·리터럴 자리에서는 펼친다(spread).
- `this`는 호출 방식이 결정한다. 점 왼쪽의 객체, `new`의 인스턴스, 리스너의 요소, 아니면 `undefined`(strict).
- 화살표 함수는 this·arguments·super가 없어 바깥 것을 쓰고, `new`로 부를 수 없다. `bind`는 this를 고정한(다시 바꿀 수 없는) 함수를, `call`·`apply`는 this를 정해 바로 실행한다.
- `arguments`는 옛 가변 인자 방식이다. 새 코드는 rest 매개변수를 쓴다.
- `return`은 함수를 즉시 끝낸다. 객체를 찍어 내는 일은 생성자 함수 대신 class나 팩토리 함수로 한다.
- 재귀는 호출마다 실행 컨텍스트를 콜 스택에 쌓는다. 깊이에 한도가 있어, 깊이가 입력에 비례하면 반복문을 고려한다.

관련 노트: [[scope-and-closures|스코프와 클로저]], [[function-decorators|데코레이터와 콜 포워딩]], [[prototype-and-inheritance|프로토타입과 상속]], [[class|class 문법]], [[recursion|재귀 함수]], [[statements-vs-expressions|문(Statement)과 식(Expression)]], [[debounce-throttle|Debounce와 Throttle]], [[strict-mode|strict mode]], [[iterators-and-generators|이터레이터와 제너레이터]]
