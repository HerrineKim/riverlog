---
title: "스코프와 클로저"
concept: "Scope & Closure"
summary: "변수를 어디서 쓸 수 있는지 정하는 스코프(전역·모듈·함수·블록), 안쪽에서 바깥으로 찾아가는 스코프 체인과 섀도잉, 정의된 위치로 정해지는 렉시컬 스코프, 선언이 끌어올려지는 호이스팅과 TDZ, 바깥 함수가 끝난 뒤에도 그 변수를 붙잡는 클로저와 쓰임새(함수 공장, private 상태)를 정리했다."
tags: ["javascript", "frontend", "scope", "closure", "function"]
source: other
date: "2026-10-15"
sources: ["https://wesbos.com/javascript/03-the-tricky-bits/scope", "https://wesbos.com/javascript/03-the-tricky-bits/hoisting", "https://wesbos.com/javascript/03-the-tricky-bits/closures", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Closures", "https://developer.mozilla.org/en-US/docs/Glossary/Hoisting"]
---

> Wes Bos의 「[Beginner JavaScript](https://wesbos.com/javascript)」 강의 노트를 바탕으로 재구성한 노트다.

## 스코프란

**스코프(scope)는 "이 변수와 함수를 어디서 쓸 수 있는가"에 대한 답이다.** 중괄호 `{}`는 문(gate)처럼 동작한다. 안에서 만든 변수는 밖으로 새어 나가지 않지만, 안에서는 바깥 변수를 볼 수 있다.

| 스코프 | 경계 | 들어가는 것 |
| --- | --- | --- |
| 전역(global) | 일반 `<script>`의 최상위 | 어느 스크립트·콘솔에서든 보인다 |
| 모듈(module) | `type="module"` 파일 하나 | `export`하지 않으면 파일 밖에서 안 보인다 |
| 함수(function) | 함수 본문 | 매개변수, 함수 안의 모든 선언(`var` 포함) |
| 블록(block) | `if`·`for`·`{}` 등 중괄호 | `let`·`const`·`class` (`var`는 블록을 무시한다) |

### 전역 스코프와 window

브라우저에서 전역 객체는 `window`다(환경과 무관하게 쓰려면 `globalThis`). `setTimeout()`과 `window.setTimeout()`이 같은 이유다. 일반 스크립트 최상위에서 선언하면 모두 전역이지만, `window`에 붙는지는 선언 방식에 따라 다르다.

```javascript
const first = 'wes'
var age = 100
function sayHi() {}

first         // 'wes' — 다른 <script>나 콘솔에서도 보인다
window.first  // undefined — let·const는 전역이지만 window에 붙지 않는다
window.age    // 100 — var와 함수 선언은 window의 속성이 된다
```

전역 변수는 다른 스크립트·라이브러리와 이름이 부딪치므로 만들지 않는다. **ES 모듈에서는 파일이 곧 스코프**여서 `window.x = …`처럼 명시하지 않는 한 전역이 생기지 않는다([[es-modules|모듈: export와 import]]).

### 함수 스코프와 블록 스코프

```javascript
if (true) {
  const cool = true
  var old = true
}
cool // ReferenceError — 블록 밖으로 못 나온다
old  // true — var는 블록을 무시하고 함수(여기서는 전역)까지 샌다

for (var i = 0; i < 3; i++) {}
i    // 3 — 반복문 변수가 밖에 남는다. let이면 남지 않는다
```

블록 안에서 정한 값을 밖에서 써야 하면 **바깥에 먼저 선언하고 안에서 재할당**한다.

```javascript
function isCool(name) {
  let cool
  if (name === 'wes') cool = true
  return cool
}
```

블록 스코프가 새는 변수를 막아 주기 때문에 "`const` 기본, 재할당할 때만 `let`, `var`는 쓰지 않는다"가 표준 규칙이다. 키워드별 재선언·재할당 비교는 [[variables-and-types|변수와 데이터 타입]]에 있다. 함수도 변수와 똑같이 스코프를 따른다. 함수 안에서 선언한 함수는 그 함수 밖에서 부를 수 없다.

## 스코프 체인과 섀도잉

변수를 쓰면 엔진은 **현재 스코프에서 찾고, 없으면 한 단계 바깥으로** 올라가며 전역까지 찾는다. 끝까지 없으면 `ReferenceError`다. 이 연결을 스코프 체인이라고 한다.

안쪽 스코프에 같은 이름을 선언하면 바깥 변수가 가려진다. 이것이 **섀도잉(shadowing)** 이다. 문법상 허용되지만, 가려진 바깥 변수에 접근할 방법이 사라지므로 ESLint `no-shadow`가 경고한다. 안쪽 이름을 `myAge`처럼 더 구체적으로 짓는다.

## 렉시컬 스코프: 정의된 곳이 기준이다

JavaScript는 **렉시컬 스코프(lexical scope, 정적 스코프)** 를 쓴다. 함수가 바깥 변수를 찾는 경로는 **함수를 정의한 위치**로 정해지고, 호출한 위치와는 상관없다.

```javascript
const dog = 'snickers'
function logDog() {
  console.log(dog)
}
function go() {
  const dog = 'sunny'
  logDog() // 'snickers' — logDog는 전역에 정의됐으니 전역의 dog를 본다
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
console.log(age) // undefined — 엔진은 var age; console.log(age); age = 10 처럼 처리한다
var age = 10
```

`let`·`const`가 선언된 줄에 닿기 전까지의 구간을 **TDZ(Temporal Dead Zone)** 라고 한다. 이 구간에서는 `typeof`도 에러를 낸다. TDZ 덕분에 "선언 전에 쓴" 실수가 조용한 `undefined` 대신 에러로 드러난다.

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
innerFn()               // 'outer' — 그래도 outerVar를 읽는다
```

안쪽 함수를 바깥 함수 안에서 바로 부르는 것은 단순한 스코프 체인이다. **바깥 함수가 끝난 뒤, 다른 곳에서 나중에 불릴 때** 클로저가 드러난다.

### 쓰임새

| 용도 | 방식 | 예 |
| --- | --- | --- |
| 함수 공장 | 설정값을 받아 그 값을 기억하는 함수를 돌려준다 | `createGreeting('hello')`, 인자를 미리 채운 부분 적용 |
| private 상태 | 바깥에서 접근할 수 없는 변수를 안쪽 함수만 읽고 쓴다 | 점수 카운터, 모듈 패턴 |
| 콜백·이벤트 핸들러 | 등록할 때의 값을 나중에 실행될 때 쓴다 | `setTimeout`, `addEventListener` |
| 실행 제어 | 호출 사이에 타이머·캐시를 유지한다 | [[debounce-throttle|debounce·throttle]], 메모이제이션 |

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
soccer() // 'Soccer 점수: 1' — 호출마다 별개의 score가 생긴다
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
- **메모리**: 클로저가 살아 있는 동안 붙잡은 변수도 해제되지 않는다. 큰 객체를 붙잡은 이벤트 리스너는 쓰지 않을 때 `removeEventListener`로 떼어 낸다.
- 과거에는 IIFE와 클로저로 private 변수를 숨기는 **모듈 패턴**을 썼다. 지금은 ES 모듈이 그 역할을 맡는다([[js-design-patterns|JavaScript 디자인 패턴]]).

## 정리

- 스코프는 전역·모듈·함수·블록으로 나뉘고, `let`·`const`는 블록, `var`는 함수 단위다.
- 변수는 안쪽에서 바깥으로 찾아 올라간다. 같은 이름으로 가리는 섀도잉은 피한다.
- 찾는 경로는 **정의된 위치**가 정한다(렉시컬 스코프). `this`만 예외로 호출 방식을 따른다.
- 함수 선언은 통째로, `var`는 `undefined`로, `let`·`const`는 TDZ에 갇힌 채 호이스팅된다.
- 클로저는 끝난 함수의 변수를 기억하는 함수다. 함수 공장과 private 상태의 기본 도구다.

관련 노트: [[variables-and-types|변수와 데이터 타입]], [[functions|함수와 this]], [[js-engine-v8|JavaScript는 인터프리터 언어일까, 컴파일 언어일까]], [[debounce-throttle|Debounce와 Throttle]], [[es-modules|모듈: export와 import]], [[hooks|React Hooks]]
