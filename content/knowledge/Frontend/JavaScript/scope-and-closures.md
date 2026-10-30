---
title: "스코프와 클로저"
concept: "Scope & Closure"
summary: "변수를 어디서 쓸 수 있는지 정하는 스코프(전역·모듈·함수·블록)와 globalThis, 안쪽에서 바깥으로 찾아가는 스코프 체인과 섀도잉, 정의된 위치로 정해지는 렉시컬 스코프, 선언이 끌어올려지는 호이스팅과 TDZ, var가 블록을 무시하는 동작, 렉시컬 환경과 함수가 기억하는 태어난 환경으로 설명하는 클로저의 원리, 클로저의 쓰임새(함수 공장, private 상태)와 메모리·디버깅 주의점을 정리했다."
tags: ["javascript", "frontend", "scope", "closure", "function"]
source: other
date: "2026-10-21"
sources: ["https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/javascript/closure.md", "https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/javascript/scope.md", "https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/javascript/hoisting.md", "https://wesbos.com/javascript/03-the-tricky-bits/scope", "https://wesbos.com/javascript/03-the-tricky-bits/hoisting", "https://wesbos.com/javascript/03-the-tricky-bits/closures", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures", "https://developer.mozilla.org/en-US/docs/Glossary/Hoisting", "https://web.dev/learn/javascript/data-types/variable", "https://ko.javascript.info/closure", "https://ko.javascript.info/var", "https://ko.javascript.info/global-object", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%ED%81%B4%EB%A1%9C%EC%A0%80.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%ED%98%B8%EC%9D%B4%EC%8A%A4%ED%8C%85.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%EC%A0%84%EC%97%AD%20%EB%B3%80%EC%88%98%EC%9D%98%20%EB%AC%B8%EC%A0%9C%EC%A0%90.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%EC%8A%A4%EC%BD%94%ED%94%84.md", "https://github.com/lydiahallie/javascript-questions"]
---

> Wes Bos의 「[Beginner JavaScript](https://wesbos.com/javascript)」 강의 노트를 바탕으로 재구성하고, web.dev의 「[Learn JavaScript](https://web.dev/learn/javascript)」 강좌의 「Variables」 모듈, javascript.info(모던 JavaScript 튜토리얼)의 「변수의 유효범위와 클로저」, 「오래된 var」, 「전역 객체」 글로 보강한 노트다. 「[Frontend_TIL: 클로저](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%ED%81%B4%EB%A1%9C%EC%A0%80.md)」, 「[Frontend_TIL: 호이스팅](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%ED%98%B8%EC%9D%B4%EC%8A%A4%ED%8C%85.md)」, 「[Frontend_TIL: 전역 변수의 문제점](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%EC%A0%84%EC%97%AD%20%EB%B3%80%EC%88%98%EC%9D%98%20%EB%AC%B8%EC%A0%9C%EC%A0%90.md)」을 바탕으로 보강했다. 「[Must-Know-About-Frontend: 클로저](https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/javascript/closure.md)」, 「[Must-Know-About-Frontend: 스코프](https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/javascript/scope.md)」, 「[Must-Know-About-Frontend: 호이스팅](https://github.com/baeharam/Must-Know-About-Frontend/blob/main/Notes/javascript/hoisting.md)」의 내용을 더해 보강했다. 「[Frontend_TIL: 스코프](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%EC%8A%A4%EC%BD%94%ED%94%84.md)」을 바탕으로 보강했다.
> 헷갈리기 쉬운 출력 문제는 Lydia Hallie의 「[JavaScript Questions](https://github.com/lydiahallie/javascript-questions)」에서 개념별로 뽑아 보강했다.

## 스코프란

**스코프(scope)는 "이 변수와 함수를 어디서 쓸 수 있는가"에 대한 답이다.** 중괄호 `{}`는 문(gate)처럼 동작한다. 안에서 만든 변수는 밖으로 새어 나가지 않지만, 안에서는 바깥 변수를 볼 수 있다.

| 스코프 | 경계 | 들어가는 것 |
| --- | --- | --- |
| 전역(global) | 일반 `<script>`의 최상위 | 어느 스크립트·콘솔에서든 보인다 |
| 모듈(module) | `type="module"` 파일 하나 | `export`하지 않으면 파일 밖에서 안 보인다 |
| 함수(function) | 함수 본문 | 매개변수, 함수 안의 모든 선언(`var` 포함) |
| 블록(block) | `if`·`for`·`{}` 등 중괄호 | `let`·`const`·`class` (`var`는 블록을 무시한다) |

스코프 밖의 변수는 "값이 `undefined`인 변수"가 아니라 **아예 선언되지 않은 것**과 같다. 접근하면 `ReferenceError`다. class의 정적 초기화 블록 `static {}`은 함수처럼 동작해서 그 안의 `var`도 블록 밖으로 새지 않는다([[class|class 문법]]).

### 전역 스코프와 window

브라우저에서 전역 객체는 `window`다(환경과 무관하게 쓰려면 `globalThis`). `setTimeout()`과 `window.setTimeout()`이 같은 이유다. 일반 스크립트 최상위에서 선언하면 모두 전역이지만, `window`에 붙는지는 선언 방식에 따라 다르다.

```javascript
const first = 'wes'
var age = 100
function sayHi() {}

first         // 'wes': 다른 <script>나 콘솔에서도 보인다
window.first  // undefined: let·const는 전역이지만 window에 붙지 않는다
window.age    // 100: var와 함수 선언은 window의 속성이 된다
```

브라우저의 `window`에는 `name`·`status`처럼 처음부터 있는 속성이 많다. 그래서 선언하지 않은 `name`을 읽어도 `ReferenceError` 대신 `''`가 나와 오타가 가려진다. Node.js에서는 같은 코드가 `ReferenceError`다.

전역 변수는 만들지 않는다. **변수의 생명주기는 그 스코프의 생명주기**다. 지역 변수는 함수 호출과 함께 생기고 끝나면 사라지지만, `var` 전역 변수는 전역 객체의 속성이라 페이지를 닫을 때까지 살아 있다.

| 전역 변수의 문제 | 내용 |
| --- | --- |
| 암묵적 결합(implicit coupling) | 어느 코드든 읽고 바꿀 수 있어, 한 곳의 변경이 어디로 번질지 알 수 없다 |
| 긴 생명주기 | 메모리를 오래 차지하고, 같은 이름의 `var`를 다시 선언하면 에러 없이 덮어쓴다 |
| 스코프 체인의 끝 | 식별자 검색이 가장 마지막에 닿는 곳이다 |
| 네임스페이스 오염 | 파일이 나뉘어 있어도 일반 스크립트는 전역 스코프 하나를 함께 쓴다 |

전역을 줄이는 방법은 IIFE로 감싸기, 전역 객체 하나(`MYAPP`)에 속성으로 몰아넣는 네임스페이스 객체, IIFE와 클로저로 공개할 것만 돌려주는 모듈 패턴 순으로 발전했다. 지금은 **ES 모듈이 표준 답이다. 파일이 곧 스코프**여서 `window.x = …`처럼 명시하지 않는 한 전역이 생기지 않는다([[es-modules|모듈: export와 import]]).

전역 객체에는 `Array`·`Promise` 같은 내장 객체와 `innerHeight` 같은 환경 전용 값이 들어 있다. 이름은 환경마다 달라서 브라우저는 `window`(워커는 `self`), Node.js는 `global`이었고, ES2020부터 모든 환경에서 **`globalThis`** 로 같은 객체를 가리킨다.

- 프로젝트 전체가 꼭 공유해야 하는 값이라면 `window.currentUser = …`처럼 **전역 객체 속성으로 명시해** 붙인다. 같은 이름의 지역 변수가 있어도 `window.currentUser`로 구별해 읽을 수 있다.
- 기능 지원 여부를 확인할 때도 전역 객체를 본다. `if (!('Promise' in globalThis))`처럼 없을 때만 표준과 같은 구현을 채워 넣는 것이 폴리필이다([[prototype-and-inheritance|프로토타입과 상속]]의 폴리필 절).

### 함수 스코프와 블록 스코프

```javascript
if (true) {
  const cool = true
  var old = true
}
cool // ReferenceError: 블록 밖으로 못 나온다
old  // true: var는 블록을 무시하고 함수(여기서는 전역)까지 샌다

for (var i = 0; i < 3; i++) {}
i    // 3: 반복문 변수가 밖에 남는다. let이면 남지 않는다
```

`if`·`for` 없이 중괄호만 써도 블록이다. `{ const message = '안녕'; … }`처럼 감싸면 같은 이름을 다른 블록에서 다시 선언할 수 있어, 한 파일 안에서 작업 단위를 격리할 때 쓴다. `for (let i …)`의 괄호 안 변수는 중괄호 밖에 적혀 있지만 반복문 블록에 속한다. `catch (err)`의 매개변수도 그 `catch` 블록에만 있는 변수라, 바깥에 같은 이름이 있으면 가리기만 하고 바꾸지 않는다.

```javascript
let x, y
try { throw new Error() } catch (x) {
  x = 1             // catch의 x
  y = 2             // 바깥 y
}
x // undefined
y // 2
```

`var`의 다른 성질도 이 "블록 무시"에서 나온다. 같은 스코프에서 **다시 선언해도 에러가 없고**(두 번째 `var`는 무시되고 대입만 일어난다), 실행되지 않는 `if (false) { var x }` 안의 선언도 함수 맨 위로 끌어올려진다. 아주 초기의 JavaScript에는 블록 단위 스코프가 없었기 때문이다. 옛 코드를 `let`으로 바꿀 때 이 차이 때문에 에러가 날 수 있다.

블록 안에서 정한 값을 밖에서 써야 하면 **바깥에 먼저 선언하고 안에서 재할당**한다.

```javascript
function isCool(name) {
  let cool
  if (name === 'wes') cool = true
  return cool
}
```

블록 안에서는 바깥 변수를 읽고 재할당할 수 있고, 같은 이름을 `let`으로 새로 선언하면 바깥 것을 가린다(아래 섀도잉). 반대로 **`var`·`let`·`const` 없이 대입**하면 블록·함수 안이라도 전역 변수가 생긴다(암묵적 전역). strict mode에서는 `ReferenceError`로 막힌다([[strict-mode|strict mode]]).

블록 스코프가 새는 변수를 막아 주기 때문에 "`const` 기본, 재할당할 때만 `let`, `var`는 쓰지 않는다"가 표준 규칙이다. 키워드별 재선언·재할당 비교는 [[variables-and-types|변수와 데이터 타입]]에 있다. 함수도 변수와 똑같이 스코프를 따른다. 함수 안에서 선언한 함수는 그 함수 밖에서 부를 수 없다.

## 스코프 체인과 섀도잉

변수를 쓰면 엔진은 **현재 스코프에서 찾고, 없으면 한 단계 바깥으로** 올라가며 전역까지 찾는다. 끝까지 없으면 `ReferenceError`다. 이 연결을 스코프 체인이라고 한다.

안쪽 스코프에 같은 이름을 선언하면 바깥 변수가 가려진다. 이것이 **섀도잉(shadowing)** 이다. 문법상 허용되지만, 가려진 바깥 변수에 접근할 방법이 사라지므로 ESLint `no-shadow`가 경고한다. 안쪽 이름을 `myAge`처럼 더 구체적으로 짓는다.

## 렉시컬 스코프: 정의된 곳이 기준이다

JavaScript는 **렉시컬 스코프(lexical scope, 정적 스코프)** 를 쓴다. 함수가 바깥 변수를 찾는 경로는 **함수를 정의한 위치**로 정해지고, 호출한 위치와는 상관없다. 반대로 호출한 위치로 상위 스코프를 정하는 방식은 **동적 스코프(dynamic scope)** 라고 하며, 정의할 때는 어디서 불릴지 몰라 코드만 보고 변수를 추적할 수 없다. 대부분의 언어가 렉시컬 스코프를 쓴다.

```javascript
const dog = 'snickers'
function logDog() {
  console.log(dog)
}
function go() {
  const dog = 'sunny'
  logDog() // 'snickers': logDog는 전역에 정의됐으니 전역의 dog를 본다
}
go()
```

값이 필요하면 바깥 변수에 기대지 말고 매개변수로 받는다. 매개변수는 그 함수의 지역 변수가 되므로 이름이 겹쳐도 충돌하지 않는다.

> 대조: 스코프는 **정의 위치**, `this`는 **호출 방식**이 정한다. 같은 함수라도 `this`는 부르는 방법에 따라 달라진다([[functions|함수와 this]]).

## 호이스팅과 TDZ

**호이스팅(hoisting)** 은 실행 전에 엔진이 스코프 안의 선언을 먼저 등록해서, 선언이 맨 위로 끌어올려진 것처럼 동작하는 현상이다. 실제로 코드가 옮겨지지는 않는다. 실행 컨텍스트를 만들 때 선언을 먼저 처리하기 때문이다([[js-engine-v8|V8 파이프라인]]).

| 선언 | 끌어올려지는 것 | 선언 전에 쓰면 |
| --- | --- | --- |
| 함수 선언 `function f() {}` | 이름과 **본문 전체** | 정상 호출된다 |
| `var x = 1` | 이름만, `undefined`로 초기화 | `undefined` (에러 없음) |
| `let`·`const`·`class` | 이름만, **초기화하지 않음** | `ReferenceError: Cannot access 'x' before initialization` |
| 함수 표현식·화살표 함수 | 담긴 변수의 규칙을 따른다 | `const`면 에러, `var`면 `TypeError: f is not a function` |

```javascript
console.log(age) // undefined: 엔진은 var age; console.log(age); age = 10 처럼 처리한다
var age = 10
```

같은 이름으로 함수 선언과 `var`가 함께 있으면 **함수 선언이 이긴다.** `var`의 선언만으로는 이미 등록된 함수를 덮지 않고, 대입문이 실행되는 순간에야 값이 바뀐다.

```javascript
func()                                  // '함수 선언': 아직 대입 전이다
var func = function () { console.log('함수 표현식') }
function func() { console.log('함수 선언') }
func()                                  // '함수 표현식': 대입 뒤
```

선언을 먼저 등록하는 순서는 [[execution-context|실행 컨텍스트]]의 생성 단계에서 나온다.

`let`·`const`도 호이스팅은 된다. 호이스팅되지 않는다면 아래 블록의 `console.log`는 바깥 `foo`를 읽어야 하지만, 블록 안의 `foo`가 이미 등록돼 있어 에러가 난다.

```javascript
let foo = 1
{
  console.log(foo) // ReferenceError: Cannot access 'foo' before initialization
  let foo = 2
}
```

`let`·`const`가 선언된 줄에 닿기 전까지의 구간을 **TDZ(Temporal Dead Zone)** 라고 한다. 이 구간에서는 `typeof`도 에러를 낸다. TDZ 덕분에 "선언 전에 쓴" 실수가 조용한 `undefined` 대신 에러로 드러난다. 에러 메시지도 다르다. 엔진은 이 스코프에 그 변수가 **곧 생긴다는 것을 이미 알기 때문에** "is not defined"가 아니라 "before initialization"이라고 알려 준다. `const`에는 TDZ가 필수다. `var`처럼 `undefined`로 미리 초기화해 두면, 다시 대입할 수 없는 상수에 진짜 값을 넣을 기회가 없어진다.

함수 선언 호이스팅을 이용해 파일 위쪽에 "무엇을 하는지(호출)"를, 아래쪽에 "어떻게 하는지(정의)"를 두는 스타일도 있다. 다만 ESLint `no-use-before-define`처럼 선언 후 사용을 권하는 규칙이 흔하고, 보조 함수는 모듈로 분리해 `import`하는 편이 읽기 쉽다.

## 클로저

**클로저(closure)는 함수가 자신이 정의된 렉시컬 환경을 기억해서, 바깥 함수가 끝난 뒤에도 그 변수에 접근하는 것**이다. 안쪽 함수가 바깥 변수를 참조하고 있으면 엔진은 그 변수를 가비지 컬렉션하지 않고 메모리에 남겨 둔다.

```javascript
function outer() {
  const outerVar = 'outer'
  return function inner() {
    console.log(outerVar)
  }
}
const innerFn = outer() // outer는 여기서 끝났다
innerFn()               // 'outer': 그래도 outerVar를 읽는다
```

안쪽 함수를 바깥 함수 안에서 바로 부르는 것은 단순한 스코프 체인이다. **바깥 함수가 끝난 뒤, 다른 곳에서 나중에 불릴 때** 클로저가 드러난다.

### 렉시컬 환경으로 보는 원리

명세는 스코프를 **렉시컬 환경(Lexical Environment)** 이라는 내부 객체로 설명한다. 코드에서 직접 꺼낼 수는 없는 이론상의 객체이고, 엔진은 같은 결과를 내는 범위에서 자유롭게 최적화한다.

| 구성 | 내용 |
| --- | --- |
| 환경 레코드(Environment Record) | 그 스코프의 변수를 속성처럼 담는다. "변수를 바꾼다"는 이 레코드의 속성을 바꾸는 것이다 |
| 바깥 환경 참조(outer) | 한 단계 바깥 렉시컬 환경을 가리킨다. 전역 환경의 바깥은 `null`이다. 이 연결이 스코프 체인이다 |

```text
counter() 호출 시          makeCounter() 호출 때 만든 환경        전역 환경
┌──────────────┐  outer   ┌──────────────┐   outer   ┌────────────────────────┐  outer
│ (지역 변수 없음) │ ───────▶ │ count: 0     │ ────────▶ │ makeCounter, counter │ ──────▶ null
└──────────────┘          └──────────────┘           └────────────────────────┘
                              ▲
                     counter.[[Environment]]
```

1. 스크립트·블록·함수 호출이 시작되면 새 렉시컬 환경이 만들어지고, 안에서 선언한 이름이 **미리 등록**된다. 함수 선언문은 이때 바로 함수로 초기화되고, `let`·`const`는 "초기화되지 않음(uninitialized)" 상태로 남는다. 이 상태가 아래의 TDZ다.
2. **모든 함수는 만들어질 때 자기가 태어난 렉시컬 환경을 숨은 속성 `[[Environment]]`에 기억한다.** 한 번 정해지면 바뀌지 않는다.
3. 함수를 호출하면 그 호출만의 새 환경이 생기고, 그 outer는 함수의 `[[Environment]]`다. 그래서 변수를 찾는 경로가 **호출 위치가 아니라 정의 위치**로 정해진다.
4. 변수를 바꾸면 그 변수가 **들어 있는 환경**에서 바뀐다. 그래서 `counter()`를 부를 때마다 같은 `count`가 1, 2, 3으로 늘고, `makeCounter()`를 다시 부르면 별개의 `count`를 가진 새 환경이 생긴다.

이 모델에서 보면 **JavaScript의 함수는 모두 클로저**다. 다만 보통 "클로저"라고 부르는 것은 더 좁다. **바깥 함수보다 오래 살아남으면서 바깥 스코프의 식별자를 실제로 참조하는 함수**다. 이렇게 붙잡힌 바깥 변수를 **자유 변수(free variable)** 라고 한다. 바깥 변수를 하나도 쓰지 않거나, 바깥 함수 안에서만 쓰이고 함께 사라지는 안쪽 함수는 클로저라고 하지 않는다. 예외는 `new Function`으로 만든 함수로, `[[Environment]]`가 만든 위치가 아니라 전역 환경을 가리킨다([[functions|함수와 this]]).

### 쓰임새

| 용도 | 방식 | 예 |
| --- | --- | --- |
| 함수 공장 | 설정값을 받아 그 값을 기억하는 함수를 돌려준다 | `createGreeting('hello')`, 인자를 미리 채운 부분 적용 |
| private 상태 | 바깥에서 접근할 수 없는 변수를 안쪽 함수만 읽고 쓴다 | 점수 카운터, 모듈 패턴 |
| 콜백·이벤트 핸들러 | 등록할 때의 값을 나중에 실행될 때 쓴다 | `setTimeout`, `addEventListener` |
| 실행 제어 | 호출 사이에 타이머·캐시를 유지한다 | [[debounce-throttle\|debounce·throttle]], 메모이제이션 |

```javascript
function createGreeting(greeting = '') {
  const myGreet = greeting.toUpperCase()
  return (name) => `${myGreet} ${name}`
}
const sayHello = createGreeting('hello')
sayHello('wes') // 'HELLO wes'

function createGame(gameName) {
  let score = 0 // 밖에서는 읽을 수도, 바꿀 수도 없다
  return function win() {
    score++
    return `${gameName} 점수: ${score}`
  }
}
const hockey = createGame('Hockey')
const soccer = createGame('Soccer')
hockey() // 'Hockey 점수: 1'
hockey() // 'Hockey 점수: 2'
soccer() // 'Soccer 점수: 1': 호출마다 별개의 score가 생긴다
```

`createGame`을 부를 때마다 새 렉시컬 환경이 만들어지므로 게임마다 독립된 `score`를 가진다. 클래스의 `#private` 필드([[class|class 문법]])와 같은 목적을 함수만으로 이룬다.

### 반복문과 클로저

```javascript
for (var i = 0; i < 3; i++) setTimeout(() => console.log(i)) // 3, 3, 3
for (let j = 0; j < 3; j++) setTimeout(() => console.log(j)) // 0, 1, 2
```

`var`는 함수 스코프라 세 콜백이 **같은 `i` 하나**를 공유하고, 실행될 때는 반복이 끝나 3이 돼 있다. `let`은 반복마다 새 바인딩을 만들어 각 콜백이 자기 값을 기억한다.

### 주의할 점

- **오래된 클로저(stale closure)**: 클로저는 만들어질 때의 변수를 붙잡는다. React에서 의존성 배열을 빠뜨리면 첫 렌더의 state를 계속 읽는 버그가 이것이다([[hooks|React Hooks]]).
- **메모리**: 함수 호출이 끝나면 그 렉시컬 환경은 보통 사라지지만, 그 환경을 `[[Environment]]`로 붙잡은 함수가 하나라도 도달 가능하면 남는다. `const fns = [f(), f(), f()]`는 환경 세 개를 살려 두고, `g = null`로 마지막 참조를 끊어야 함께 해제된다. 큰 객체를 붙잡은 이벤트 리스너나 타이머는 쓰지 않을 때 `removeEventListener`·`clearInterval`로 떼어 낸다.
- **디버거에서 변수가 안 보일 때**: V8(Chrome·Edge)은 안쪽 함수가 쓰지 않는 바깥 변수를 최적화로 버린다. 그래서 `debugger`로 멈춘 콘솔에서 이론상 보여야 할 바깥 변수가 `ReferenceError`로 나오거나, 같은 이름의 더 바깥 변수가 대신 보이기도 한다. 코드의 동작이 아니라 디버깅 화면만의 현상이다.
- 과거에는 `var`에 블록 스코프를 주려고 IIFE로 감쌌고, IIFE와 클로저로 private 변수를 숨기는 **모듈 패턴**을 썼다. 지금은 `let`·`const`와 ES 모듈이 그 역할을 맡는다([[js-design-patterns|JavaScript 디자인 패턴]]).
- 클로저 변수 대신 함수 자체에 속성(`counter.count`)을 달아 상태를 둘 수도 있다. 차이는 바깥에서 고칠 수 있느냐다([[functions|함수와 this]]의 「함수도 객체다」).

## 정리

- 스코프는 전역·모듈·함수·블록으로 나뉘고, `let`·`const`는 블록, `var`는 함수 단위다.
- 변수는 안쪽에서 바깥으로 찾아 올라간다. 같은 이름으로 가리는 섀도잉은 피한다.
- 찾는 경로는 **정의된 위치**가 정한다(렉시컬 스코프). `this`만 예외로 호출 방식을 따른다.
- 함수 선언은 통째로, `var`는 `undefined`로, `let`·`const`는 TDZ에 갇힌 채 호이스팅된다.
- 모든 함수는 태어난 렉시컬 환경을 `[[Environment]]`로 기억한다. 그래서 끝난 함수의 변수를 계속 읽는 클로저가 되고, 그 환경은 함수가 살아 있는 동안 메모리에 남는다.
- 클로저는 함수 공장과 private 상태의 기본 도구다. 전역 객체는 `globalThis`로 읽고, 전역 변수는 만들지 않는다.

관련 노트: [[execution-context|실행 컨텍스트]], [[variables-and-types|변수와 데이터 타입]], [[functions|함수와 this]], [[strict-mode|strict mode]], [[js-engine-v8|JavaScript는 인터프리터 언어일까, 컴파일 언어일까]], [[debounce-throttle|Debounce와 Throttle]], [[es-modules|모듈: export와 import]], [[hooks|React Hooks]]
