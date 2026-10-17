---
title: "Proxy와 Reflect"
concept: "Proxy & Reflect"
summary: "객체에 가해지는 읽기·쓰기·in·delete·호출·new 같은 기본 동작을 트랩으로 가로채는 Proxy와, 그 동작을 원래 객체에 그대로 넘기는 Reflect. 기본값·검증·가상 속성·함수 래퍼 같은 쓰임, getter 상속에서 receiver가 필요한 이유, 내부 슬롯·private 필드·동일성 비교에서 생기는 한계, Vue·Immer 같은 라이브러리가 Proxy를 쓰는 방식을 정리한다."
tags: ["javascript", "frontend", "oop", "design-pattern"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/proxy", "https://javascript.info/proxy", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Proxy", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Reflect"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「Proxy와 Reflect」 글을 바탕으로, MDN으로 확인해 재구성한 노트다.

## Proxy란

**Proxy는 대상 객체(target)를 감싸서, 그 객체에 가해지는 기본 동작을 중간에서 가로채는 객체다.** 가로챈 동작은 Proxy가 직접 처리하거나 원래 객체로 넘긴다. 이렇게 언어의 기본 동작을 바꾸는 일을 메타프로그래밍(metaprogramming)이라고 한다.

```javascript
const proxy = new Proxy(target, handler)
```

| 인자 | 역할 |
| --- | --- |
| `target` | 감쌀 객체. 함수·배열·클래스를 포함한 모든 객체가 된다 |
| `handler` | 가로챌 동작을 메서드로 담은 객체. 이 메서드를 **트랩(trap)** 이라고 한다 |

handler가 비어 있으면 Proxy는 **투명한 래퍼**다. 읽기·쓰기·반복이 모두 target에 그대로 전달된다. Proxy 자체는 속성을 갖지 않는다.

```javascript
const target = {}
const proxy = new Proxy(target, {})
proxy.test = 5
target.test       // 5 — 쓰기가 target에 전달됐다
for (const key in proxy) console.log(key) // 'test'
```

## 트랩: 가로챌 수 있는 동작

객체에 대한 동작은 명세상 **내부 메서드(internal method)** 로 정의돼 있다. 속성 읽기는 `[[Get]]`, 쓰기는 `[[Set]]`이다. 코드에서 직접 부를 수는 없고, Proxy의 트랩이 이 내부 메서드 호출을 가로챈다. 내부 메서드마다 대응하는 트랩이 하나씩 있다.

| 트랩 | 가로채는 동작 |
| --- | --- |
| `get(target, prop, receiver)` | 속성 읽기 `obj.x`, `obj[x]` |
| `set(target, prop, value, receiver)` | 속성 쓰기 `obj.x = v` |
| `has(target, prop)` | `in` 연산자 |
| `deleteProperty(target, prop)` | `delete obj.x` |
| `apply(target, thisArg, args)` | 함수 호출 (target이 함수일 때) |
| `construct(target, args, newTarget)` | `new` 연산자 |
| `ownKeys(target)` | `Object.keys`·`values`·`entries`, `for...in`, `Object.getOwnPropertyNames`·`getOwnPropertySymbols` |
| `getOwnPropertyDescriptor(target, prop)` | `Object.getOwnPropertyDescriptor`, 그리고 `Object.keys`·`for...in`이 열거 가능 여부를 확인할 때 |
| `defineProperty` | `Object.defineProperty(ies)` |
| `getPrototypeOf`·`setPrototypeOf` | `Object.getPrototypeOf`·`setPrototypeOf` |
| `isExtensible`·`preventExtensions` | `Object.isExtensible`·`preventExtensions` |

트랩은 **불변 조건(invariant)** 을 지켜야 한다. `set`·`deleteProperty`는 성공하면 `true`를 돌려줘야 하고, falsy를 돌려주면 strict mode에서 `TypeError`가 난다. `getPrototypeOf`는 target의 프로토타입과 같은 값을 돌려줘야 한다. 이런 규칙은 Proxy가 언어의 일관성을 깨지 못하게 막는다.

## 쓰임새

### get: 기본값과 가상 속성

없는 속성을 읽을 때 `undefined` 대신 다른 값을 돌려준다.

```javascript
const dictionary = new Proxy({ Hello: '안녕하세요' }, {
  get(target, phrase) {
    return phrase in target ? target[phrase] : phrase // 번역이 없으면 원문 그대로
  },
})
dictionary.Hello // '안녕하세요'
dictionary.Bye   // 'Bye'
```

**Proxy로 감싼 뒤에는 원래 객체를 참조하지 않는다.** `dictionary = new Proxy(dictionary, …)`처럼 같은 변수에 덮어쓰는 이유다. 원본에 직접 접근하는 코드가 남아 있으면 트랩을 우회한다.

### set: 값 검증

```javascript
const numbers = new Proxy([], {
  set(target, prop, value) {
    if (typeof value !== 'number') return false // false → TypeError
    target[prop] = value
    return true                                 // 성공하면 반드시 true
  },
})
numbers.push(1)      // 된다. length도 정상적으로 바뀐다
numbers.push('test') // TypeError: 'set' on proxy: trap returned falsish
```

`push`·`unshift` 같은 배열 메서드는 내부에서 `[[Set]]`을 쓰므로, 메서드를 덮어쓰지 않아도 검증이 걸린다. 배열의 다른 기능은 그대로 동작한다.

### ownKeys·getOwnPropertyDescriptor: 반복 대상 바꾸기

`ownKeys`로 `_`로 시작하는 키를 빼면 `for...in`, `Object.keys`, `Object.values`에 모두 적용된다. 반대로 target에 **없는 키**를 `ownKeys`로 돌려주면 `Object.keys`에는 나오지 않는다. `Object.keys`가 키마다 설명자를 확인해 열거 가능한 것만 남기기 때문이다. 이때는 `getOwnPropertyDescriptor` 트랩에서 `{ enumerable: true, configurable: true }`를 돌려준다([[property-descriptors|속성 설명자]]).

### has: in 연산자에 의미 붙이기

```javascript
const range = new Proxy({ start: 1, end: 10 }, {
  has(target, n) {
    return n >= target.start && n <= target.end
  },
})
5 in range  // true
50 in range // false
```

### apply: 함수 래퍼

함수를 감싸는 데코레이터를 일반 래퍼 함수로 만들면 원래 함수의 `name`·`length` 같은 속성이 사라진다. Proxy는 호출만 가로채고 나머지 동작은 target에 넘기므로 이 속성이 그대로 보인다.

```javascript
function delay(fn, ms) {
  return new Proxy(fn, {
    apply(target, thisArg, args) {
      setTimeout(() => target.apply(thisArg, args), ms)
    },
  })
}
function sayHi(user) { console.log(`Hi, ${user}`) }
sayHi = delay(sayHi, 3000)
sayHi.length // 1 — 래퍼 함수였다면 0
```

한 객체를 여러 Proxy로 겹겹이 감싸 기능을 하나씩 덧입힐 수도 있다.

### private 흉내는 쓰지 않는다

`get`·`set`·`deleteProperty`·`ownKeys`에서 `_`로 시작하는 속성을 막아 private처럼 만들 수 있다. 그런데 메서드가 `this._password`를 읽게 하려면 `get`에서 함수를 `value.bind(target)`으로 묶어야 하고, 그러면 메서드가 원본 객체를 밖으로 넘겨 보호가 풀릴 수 있다. 진짜 private이 필요하면 클래스의 `#필드`를 쓴다([[class|class 문법]]).

## Reflect: 동작을 원래 객체로 넘기기

**Reflect는 내부 메서드를 함수로 부를 수 있게 한 내장 객체다.** Proxy 트랩마다 **같은 이름, 같은 인자**의 Reflect 메서드가 있다. 그래서 트랩이 동작을 target에 그대로 넘길 때는 `return Reflect.<트랩 이름>(...arguments)`이면 된다.

| 동작 | Reflect 호출 | 내부 메서드 |
| --- | --- | --- |
| `obj[prop]` | `Reflect.get(obj, prop, receiver)` | `[[Get]]` |
| `obj[prop] = value` | `Reflect.set(obj, prop, value, receiver)` → 성공 여부 boolean | `[[Set]]` |
| `delete obj[prop]` | `Reflect.deleteProperty(obj, prop)` | `[[Delete]]` |
| `prop in obj` | `Reflect.has(obj, prop)` | `[[HasProperty]]` |
| `new F(...args)` | `Reflect.construct(F, args)` | `[[Construct]]` |
| `fn.apply(thisArg, args)` | `Reflect.apply(fn, thisArg, args)` | `[[Call]]` |
| 모든 자기 키 | `Reflect.ownKeys(obj)` (문자열 키 + Symbol 키) | `[[OwnPropertyKeys]]` |

`new`·`delete` 같은 연산자를 함수로 부를 수 있다는 점도 쓸모 있지만, 핵심은 트랩에서 **빠뜨리는 것 없이** 원래 동작을 재현하는 것이다.

```javascript
const logged = new Proxy(user, {
  get(target, prop, receiver) {
    console.log(`GET ${String(prop)}`)
    return Reflect.get(target, prop, receiver)
  },
  set(target, prop, value, receiver) {
    console.log(`SET ${String(prop)}=${value}`)
    return Reflect.set(target, prop, value, receiver) // true/false를 그대로 돌려준다
  },
})
```

### receiver가 필요한 이유: getter와 상속

`target[prop]`으로 넘기면 대개 같아 보이지만, **getter를 상속할 때** 결과가 달라진다.

```javascript
const user = {
  _name: 'Guest',
  get name() { return this._name },
}
const userProxy = new Proxy(user, {
  get(target, prop) { return target[prop] }, // getter가 this = target(user)로 실행된다
})
const admin = { __proto__: userProxy, _name: 'Admin' }
admin.name // 'Guest' — 'Admin'이어야 한다
```

`admin`에 `name`이 없으니 프로토타입인 `userProxy`에서 찾고, 트랩의 `target[prop]`은 getter를 `this = user`로 실행한다. 세 번째 인자 **receiver**에는 원래 접근한 객체(`admin`)가 들어 있다. getter는 호출하는 것이 아니라 읽는 것이라 `call`로 this를 넘길 수 없고, `Reflect.get(target, prop, receiver)`가 그 일을 한다. `set`의 receiver도 setter에 대해 같은 역할을 한다.

## 한계

| 한계 | 원인 | 대처 |
| --- | --- | --- |
| `Map`·`Set`·`Date`·`Promise`를 감싸면 메서드가 실패한다 (`proxy.set(...)` → TypeError) | 이 객체들은 데이터를 **내부 슬롯**(`[[MapData]]` 등)에 두고, 내장 메서드는 `[[Get]]` 없이 `this`의 슬롯에 바로 접근한다. Proxy에는 슬롯이 없다 | `get`에서 함수면 `value.bind(target)`으로 돌려준다. 배열은 내부 슬롯을 쓰지 않아 문제가 없다 |
| 클래스의 `#private` 필드에 접근하는 메서드가 실패한다 | private 필드도 내부 슬롯 방식이라, `this`가 Proxy면 찾지 못한다 | 메서드를 target에 bind한다. 다만 원본이 메서드에 노출된다 |
| `proxy !== target` | 둘은 다른 객체이고 `===`는 가로챌 수 없다 | 원본을 키로 넣은 `Set`·`Map`·`WeakMap`에서 Proxy로는 찾지 못한다. 처음부터 Proxy만 쓰게 한다 |
| 느려진다 | 접근마다 트랩을 거친다 | 단순한 Proxy도 속성 접근이 몇 배 느릴 수 있다. 수많이 접근하는 병목 객체에서만 문제가 된다 |

## 취소 가능한 Proxy

`Proxy.revocable(target, handler)`는 `{ proxy, revoke }`를 돌려준다. `revoke()`를 부르면 Proxy가 target과의 연결을 끊고, 이후 모든 동작은 `TypeError`가 된다. target은 다른 참조가 없으면 가비지 컬렉션 대상이 된다. 자원 접근을 나중에 막아야 할 때 쓰고, `revoke`를 들고 다니기 싫으면 `WeakMap`에 `proxy → revoke`로 넣어 둔다(키가 사라지면 함께 정리된다).

## 라이브러리 속 Proxy

| 쓰임 | 예 | 방식 |
| --- | --- | --- |
| 반응형 상태 | Vue 3의 `reactive()`, MobX, Valtio | `get`에서 "누가 이 값을 읽었나"를 기록하고, `set`에서 그 구독자에게 알린다. 상태를 바로 고쳐도 화면이 갱신되는 원리다([[react-vs-vue\|React와 Vue]]) |
| 불변 업데이트 | Immer (Redux Toolkit의 `createSlice`) | 초안(draft) Proxy에 가한 변경을 기록해 새 객체를 만든다([[functional-programming\|함수형 프로그래밍]]의 카피 온 라이트를 대신한다) |
| 검증·로깅·목(mock) | 테스트 더블, 개발용 경고 | `set` 검증, `get` 로깅 |

과거(ES5)에는 `Object.defineProperty`로 속성마다 getter/setter를 심어 변경을 감지했다(Vue 2). 이 방식은 **나중에 추가한 속성**이나 배열 인덱스 대입을 감지하지 못한다. Proxy는 객체 전체를 감싸므로 없는 속성의 읽기·쓰기까지 가로챈다.

## 정리

- Proxy는 객체의 기본 동작(읽기·쓰기·in·delete·호출·new·키 열거)을 트랩으로 가로챈다. 트랩이 없으면 target에 그대로 넘긴다.
- 감싼 뒤에는 Proxy만 쓴다. 원본 참조가 남으면 트랩을 우회한다.
- `set`·`deleteProperty` 트랩은 성공하면 `true`를 돌려준다.
- 원래 동작으로 넘길 때는 같은 이름의 `Reflect` 메서드에 같은 인자(receiver 포함)를 넘긴다.
- 내부 슬롯을 쓰는 내장 객체·private 필드·`===` 비교는 Proxy가 투명하지 않은 지점이다.

관련 노트: [[property-descriptors|속성 설명자]], [[js-symbol|Symbol]], [[reactive-programming|반응형 프로그래밍과 RxJS]], [[react-vs-vue|React와 Vue]], [[class|class 문법]], [[js-design-patterns|JavaScript 디자인 패턴]]
