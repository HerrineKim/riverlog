---
title: "함수와 this"
concept: "Function"
summary: "함수 선언식·표현식·화살표 함수·IIFE·메서드, 매개변수와 인자(기본값·rest·spread), 호출 방식에 따라 달라지는 this, this를 정하는 bind·call·apply와 이벤트 리스너에 메서드를 넘길 때의 함정."
tags: ["javascript", "function", "frontend"]
source: til
date: "2026-10-15"
sources: ["https://riverkim.kr/209", "https://riverkim.kr/116", "https://wesbos.com/javascript/02-functions/functions-parameters-and-arguments", "https://wesbos.com/javascript/02-functions/different-ways-to-declare-functions", "https://wesbos.com/javascript/11-prototypes-this-new-and-inheritance/61-the-this-keyword", "https://wesbos.com/javascript/11-prototypes-this-new-and-inheritance/65-bind-call-and-apply", "https://wesbos.com/javascript/11-prototypes-this-new-and-inheritance/62-prototype-refactor-of-gallery-exercise"]
---

> 직접 정리한 TIL에 Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)를 함께 참고했다.

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

호이스팅의 자세한 동작과 TDZ는 [[scope-and-closures|스코프와 클로저]]에 있다. 선언 전에 호출하는 코드는 읽는 흐름을 헷갈리게 하므로, 선언식을 쓰더라도 먼저 정의하고 나중에 부르는 편이 낫다.

**메서드**는 객체에 속한 함수다. `Math.max()`, `console.log()`처럼 점 왼쪽에 객체가 있는 호출이 메서드 호출이고, 그 객체가 메서드 안의 `this`가 된다.

### 즉시 실행 함수(IIFE)

함수 표현식을 괄호로 감싸 정의하자마자 실행한다. 함수가 자기 스코프를 만든다는 점을 이용해, 변수가 전역으로 새지 않게 가두는 데 썼다.

```javascript
(function (age) {
  const secret = 'hidden' // 밖에서 보이지 않는다
  console.log(age)
})(30)
```

과거에는 모듈 패턴과 클로저를 만드는 기본 도구였다. 지금은 블록 스코프(`let`·`const`)와 ES 모듈이 같은 일을 하므로, 최상위에서 `await`를 쓸 수 없는 환경에서 `(async () => { … })()`로 감쌀 때 정도에만 쓴다.

## 매개변수와 인자

**매개변수(parameter)** 는 함수를 정의할 때 적는 자리 표시자, **인자(argument)** 는 호출할 때 실제로 넘기는 값이다. 호출하면 매개변수가 그 함수의 지역 변수가 되므로, 바깥 변수와 이름이 같아도 충돌하지 않는다. 인자 자리에는 값을 만드는 식이면 무엇이든 올 수 있다. 다른 함수의 호출 결과도 된다.

```javascript
const pair = (a, b) => [a, b]
pair(1, 2, 3) // [1, 2] — 남는 인자는 무시
pair(1)       // [1, undefined] — 모자란 인자는 undefined
```

### 기본값

```javascript
function calculateBill(meal, taxRate = 0.13, tipRate = 0.15) {
  return meal + meal * taxRate + meal * tipRate
}
calculateBill(100, undefined, 0.2) // 가운데만 기본값을 쓰고 싶으면 undefined를 넘긴다
calculateBill(100, null, 0.2)      // null·0은 값으로 취급되어 기본값이 적용되지 않는다
```

**기본값은 인자가 `undefined`일 때만** 쓰인다. 선택 인자가 여러 개라 순서가 헷갈리면 `({ taxRate = 0.13, tipRate = 0.15 } = {})`처럼 객체 하나를 구조 분해로 받는 편이 읽기 쉽다.

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
```

## 화살표 함수

```javascript
const double = (num) => { return num * 2 } // function 키워드 생략
const double2 = num => num * 2             // 매개변수가 하나면 () 생략, 본문이 식 하나면 {}와 return 생략(암묵적 반환)
const makeObj = () => ({ key: 'value' })   // 객체를 바로 반환할 때는 ()로 감싼다
```

인수가 없으면 빈 괄호 `()`는 생략할 수 없다. `() => { key: 'value' }`처럼 괄호 없이 객체를 쓰면 `{}`가 본문 블록으로 해석되어 `undefined`를 반환한다.

화살표 함수는 자기만의 `this`를 가지지 않고, **바깥 스코프의 this**를 그대로 쓴다. 그래서 콜백 안에서 this가 바뀌는 문제를 피할 때 유용하지만, 객체의 메서드나 `this`가 필요한 이벤트 핸들러로 쓰면 this가 그 객체를 가리키지 않는다.

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
| `fn.call(x)`·`fn.bind(x)` | 명시한 `x` |

ES 모듈과 `class` 본문은 자동으로 strict mode이므로, 요즘 코드에서 메서드를 떼어 부르면 this는 대개 `undefined`다.

```javascript
function getFullName() {
  return this.firstName + this.lastName
}
const me = { firstName: 'John', lastName: 'Doe', getFullName }

me.getFullName()  // 'JohnDoe' (this === me)
getFullName()     // 일반 함수 호출: strict면 TypeError, 아니면 NaN(this === window)
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

## 핵심 정리

- 함수는 값이다(일급 객체). 선언식만 본문째 호이스팅되고, IIFE는 모듈 이전 시대의 스코프 가두기다.
- 매개변수는 자리, 인자는 값이다. 기본값은 `undefined`일 때만 쓰인다.
- `...`은 매개변수 자리에서는 모으고(rest), 호출·리터럴 자리에서는 펼친다(spread).
- `this`는 호출 방식이 결정한다. 점 왼쪽의 객체, `new`의 인스턴스, 리스너의 요소, 아니면 `undefined`(strict).
- 화살표 함수는 바깥 this를 쓰고, `bind`는 this를 고정한 함수를, `call`·`apply`는 this를 정해 바로 실행한다.

관련 노트: [[scope-and-closures|스코프와 클로저]], [[prototype-and-inheritance|프로토타입과 상속]], [[class|class 문법]], [[statements-vs-expressions|문(Statement)과 식(Expression)]], [[debounce-throttle|Debounce와 Throttle]]
