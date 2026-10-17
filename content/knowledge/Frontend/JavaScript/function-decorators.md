---
title: "데코레이터와 콜 포워딩"
concept: "Decorator"
summary: "함수를 고치지 않고 감싸서 동작을 더하는 데코레이터 함수. 캐싱 래퍼로 보는 기본 모양, 감싼 메서드가 this를 잃는 문제와 func.call(this, ...args)로 넘기는 콜 포워딩, call과 apply의 차이, 여러 인자를 키 하나로 바꾸는 해시, 유사 배열에 배열 메서드를 빌려 쓰는 메서드 빌리기, 래퍼가 원래 함수의 속성을 잃는 한계, bind와 partial 헬퍼로 만드는 부분 적용을 정리한다."
tags: ["javascript", "function", "design-pattern", "cache", "frontend"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/call-apply-decorators", "https://ko.javascript.info/bind", "https://ko.javascript.info/arrow-functions", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/apply"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「call/apply와 데코레이터, 포워딩」, 「함수 바인딩」, 「화살표 함수 다시 살펴보기」 글을 바탕으로 재구성한 노트다.

## 데코레이터란

**데코레이터(decorator)는 함수를 받아, 그 함수를 감싼 새 함수(래퍼)를 돌려주는 함수다.** 원래 함수의 코드는 건드리지 않고 캐싱, 로깅, 실행 지연, 호출 횟수 제한 같은 부가 기능을 덧붙인다. 함수가 값(일급 객체)이라서 가능한 패턴이다([[functions|함수와 this]]).

| 장점 | 내용 |
| --- | --- |
| 재사용 | 같은 데코레이터를 어떤 함수에든 씌울 수 있다 |
| 관심사 분리 | 캐싱·로깅 코드가 본래 함수의 로직과 섞이지 않는다 |
| 조합 | 여러 데코레이터를 겹쳐 씌울 수 있다 |

[[debounce-throttle|debounce와 throttle]]도 "함수를 받아 실행 시점을 조절하는 래퍼를 돌려주는" 데코레이터다.

> TypeScript와 ECMAScript 제안의 `@decorator` 문법은 클래스와 그 멤버에 이 아이디어를 문법으로 붙인 것이다([[typescript-basics|TypeScript 문법 한눈에 보기]]의 데코레이터 절). 이 노트는 문법 없이 함수만으로 만드는 데코레이터를 다룬다.

## 기본 모양: 캐싱 데코레이터

계산은 무겁지만 같은 입력에 늘 같은 결과를 내는 함수라면, 결과를 기억해 두는 래퍼를 씌운다(메모이제이션).

```javascript
function cachingDecorator(func) {
  const cache = new Map()
  return function (x) {
    if (cache.has(x)) return cache.get(x)
    const result = func(x)
    cache.set(x, result)
    return result
  }
}

let slow = (x) => { /* 무거운 계산 */ return x * 2 }
slow = cachingDecorator(slow)
slow(1) // 계산하고 저장
slow(1) // 저장된 값을 바로 돌려준다
```

`cache`는 [[scope-and-closures|클로저]]로 래퍼에 묶여 있어서, 감싼 함수마다 자기 캐시를 가진다.

## 콜 포워딩: this와 인자를 그대로 넘긴다

위 래퍼를 객체 **메서드**에 씌우면 깨진다.

```javascript
const worker = {
  factor: 2,
  slow(x) { return x * this.factor },
}
worker.slow = cachingDecorator(worker.slow)
worker.slow(3) // TypeError — 래퍼 안의 func(x)는 일반 함수 호출이라 this가 undefined
```

`worker.slow(3)`을 부르면 **래퍼**의 `this`는 `worker`다. 문제는 래퍼가 원래 함수를 `func(x)`로 부르면서 그 `this`를 전달하지 않는다는 점이다. 래퍼는 받은 `this`와 인자를 **그대로** 원래 함수에 넘겨야 한다. 이것을 **콜 포워딩(call forwarding)** 이라 한다.

```javascript
function cachingDecorator(func, hash = (args) => args.join(',')) {
  const cache = new Map()
  return function (...args) {
    const key = hash(args)              // 여러 인자를 키 하나로
    if (cache.has(key)) return cache.get(key)
    const result = func.apply(this, args) // 받은 this와 인자를 그대로
    cache.set(key, result)
    return result
  }
}
```

- 래퍼는 반드시 `function`으로 쓴다. 화살표 함수는 자기 `this`가 없어서, 래퍼를 부른 객체를 받을 수 없다.
- `Map`의 키는 값 하나라서, 인자가 여러 개면 해시 함수로 문자열 하나로 합치거나 중첩 `Map`을 쓴다.

### call과 apply

둘 다 **this를 정해서 함수를 즉시 실행**한다. 다른 점은 인자를 넘기는 모양뿐이다.

| | 인자 | 받을 수 있는 것 |
| --- | --- | --- |
| `func.call(ctx, a, b)` | 하나씩 나열. 배열은 `func.call(ctx, ...args)`로 펼친다 | spread가 받는 **이터러블** |
| `func.apply(ctx, args)` | 배열 하나 | `length`와 인덱스만 있으면 되는 **유사 배열**(이터러블이 아니어도 된다) |

가장 단순한 콜 포워딩은 `function () { return func.apply(this, arguments) }`다. 바깥에서 보면 원래 함수를 부른 것과 구별되지 않는다. this를 고정한 새 함수를 돌려주는 `bind`와의 비교는 [[functions|함수와 this]]의 bind·call·apply 절에 있다.

### 화살표 함수를 안쪽에 쓰는 이유

래퍼 **안에서** 다시 콜백을 만들 때는 반대로 화살표 함수가 편하다. 화살표 함수는 자기 `this`와 `arguments`가 없어서 래퍼의 것을 그대로 읽는다.

```javascript
function defer(f, ms) {
  return function (...args) {
    setTimeout(() => f.apply(this, args), ms) // this와 args는 래퍼의 것
  }
}
```

일반 함수로 쓰면 `const ctx = this`처럼 바깥 값을 변수에 담아 두어야 한다.

## 메서드 빌리기

`arguments`나 `{ 0: 'a', 1: 'b', length: 2 }` 같은 유사 배열에는 `join`·`map`이 없다. 하지만 많은 배열 메서드는 내부에서 `this[0]`, `this[1]`, `this.length`만 읽도록 명세되어 있어서, **배열의 메서드를 빌려 와 `this`만 바꿔 부르면** 그대로 동작한다.

```javascript
function hash() {
  return Array.prototype.join.call(arguments, ',') // 또는 [].join.call(arguments)
}
hash(1, 2, 3) // '1,2,3'

const arrayLike = { 0: 'Hello', 1: 'world', length: 2 }
Array.prototype.map.call(arrayLike, (s) => s.toUpperCase()) // ['HELLO', 'WORLD']
```

`Object.prototype.toString.call(value)`로 `[object Array]` 같은 내부 태그를 읽는 것도 같은 기법이다([[js-symbol|Symbol]]의 `Symbol.toStringTag`). 새 코드에서는 rest 매개변수와 `Array.from(arrayLike)`로 진짜 배열을 만들어 쓰는 편이 읽기 쉽다.

## 데코레이터의 한계: 함수 속성이 사라진다

래퍼는 **새 함수**다. 원래 함수에 붙어 있던 커스텀 속성(`func.calledCount` 등)은 래퍼에 없고, `name`·`length`도 래퍼의 것이 된다. 함수 속성에 기대는 코드가 있다면 데코레이터를 씌우기 전에 확인한다.

반대로 데코레이터가 래퍼에 자기 속성을 달아 정보를 노출하기도 한다.

```javascript
function spy(func) {
  function wrapper(...args) {
    wrapper.calls.push(args) // 호출 기록을 래퍼 자신의 속성에
    return func.apply(this, args)
  }
  wrapper.calls = []
  return wrapper
}
```

테스트 도구의 목 함수(`vi.fn()`, `jest.fn()`)가 이런 모양이다. 원래 함수의 속성까지 투명하게 전달하려면 `Proxy`로 감싼다.

## 부분 적용

**부분 적용(partial application)** 은 함수 인자의 앞부분을 미리 채워, 인자가 더 적은 새 함수를 만드는 것이다. 범용 함수에서 덜 범용적인 변형을 이름 붙여 만들 때 쓴다(`mul` → `double`, `send(from, to, text)` → `sendFromMe(to, text)`).

```javascript
const mul = (a, b) => a * b
const double = mul.bind(null, 2) // this는 쓰지 않으니 null
double(5) // 10
```

`bind`는 첫 인자로 반드시 `this`를 받는다. 메서드처럼 **this는 호출할 때 정하고 인자만 고정**하고 싶으면 헬퍼를 만든다.

```javascript
function partial(func, ...bound) {
  return function (...args) {
    return func.call(this, ...bound, ...args) // this는 호출 시점의 것
  }
}

const user = {
  name: 'river',
  say(time, phrase) { return `[${time}] ${this.name}: ${phrase}` },
}
user.sayNow = partial(user.say, '10:00')
user.sayNow('안녕') // '[10:00] river: 안녕'
```

lodash의 `_.partial`이 같은 일을 한다. 인자를 하나씩 받는 함수 사슬로 바꾸는 커링(currying)은 부분 적용을 일반화한 기법이다.

## 정리

- 데코레이터는 함수를 감싼 래퍼를 돌려주는 함수다. 원래 코드를 바꾸지 않고 기능을 더하고, 겹쳐 쓸 수 있다.
- 래퍼는 `func.apply(this, args)`로 **this와 인자를 그대로 넘긴다**(콜 포워딩). 래퍼 자체는 `function`으로, 래퍼 안의 콜백은 화살표 함수로 쓴다.
- `call`은 이터러블을 펼쳐, `apply`는 유사 배열을 그대로 받는다.
- 메서드 빌리기는 `this`만 바꿔 다른 객체의 메서드를 실행한다. 유사 배열에 배열 메서드를 쓸 때의 고전적 기법이다.
- 래퍼는 원래 함수의 속성을 잃는다. 인자만 미리 채우려면 `bind(null, …)`나 `partial` 헬퍼를 쓴다.

관련 노트: [[functions|함수와 this]], [[scope-and-closures|스코프와 클로저]], [[debounce-throttle|Debounce와 Throttle]], [[functional-programming|함수형 프로그래밍]], [[typescript-basics|TypeScript 문법 한눈에 보기]]
