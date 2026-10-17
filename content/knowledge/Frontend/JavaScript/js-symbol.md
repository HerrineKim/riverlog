---
title: "Symbol"
concept: "Symbol"
summary: "Symbol은 만들 때마다 세상에 하나뿐인 값이 되는 원시 타입이다. 다른 코드와 겹치지 않는 속성 키로 쓰고, 일반 순회와 JSON에서는 숨겨진다. 설명(description)과 고유성, 전역 레지스트리의 Symbol.for·keyFor, 언어의 내장 동작을 여는 well-known symbol(Symbol.iterator·toPrimitive·toStringTag 등)을 정리한다."
tags: ["javascript", "frontend", "data-structure"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/javascript/data-types/symbol", "https://web.dev/learn/javascript/collections/keyed", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol", "https://ko.javascript.info/symbol"]
---

> web.dev의 「[Learn JavaScript](https://web.dev/learn/javascript)」 강좌의 「Symbols」 모듈을 바탕으로, javascript.info(모던 JavaScript 튜토리얼)의 「심볼형」 글을 더하고 MDN으로 확인해 재구성한 노트다.

## Symbol이란

**Symbol은 다른 어떤 값과도 같지 않은 고유한 원시값이다**(ES2015). 같은 글자로 된 문자열 두 개는 `===`로 같지만, `Symbol()`을 두 번 부르면 언제나 서로 다른 값이 나온다.

```javascript
'id' === 'id'           // true
Symbol() === Symbol()   // false
Symbol('id') === Symbol('id') // false — 설명이 같아도 다르다

const sym = Symbol('id')
typeof sym              // 'symbol'
sym.description         // 'id'
new Symbol()            // TypeError: Symbol is not a constructor
```

- 괄호 안의 문자열은 **설명(description)** 이다. 디버깅용 이름표일 뿐 고유성에는 영향이 없다.
- 원시값이라 `new`로 만들 수 없다. `description` 같은 속성은 다른 원시값처럼 래퍼 객체를 거쳐 `Symbol.prototype`에서 온다.
- 문자열로 자동 변환되지 않는다. `'key: ' + sym`, `` `${sym}` ``, `alert(sym)`은 `TypeError`이고, `sym.toString()`(`'Symbol(id)'`)이나 `sym.description`(`'id'`)으로 명시해서 바꾼다. 문자열과 Symbol은 근본적으로 달라서 실수로 섞이지 않게 막아 둔 것이다. `console.log(sym)`은 된다.

## 속성 키로 쓰기

객체의 키는 문자열 아니면 Symbol이다. Symbol 키는 **누구와도 이름이 겹치지 않으므로**, 내가 만들지 않은 객체(라이브러리 객체, DOM 요소)에 정보를 붙여도 기존 속성이나 남이 붙인 속성을 덮어쓰지 않는다.

```javascript
const meta = Symbol('meta')
const el = document.querySelector('button')
el[meta] = { clicks: 0 }       // 다른 코드의 el.meta와 충돌하지 않는다
const obj = { [meta]: 'hidden', name: 'river' } // 리터럴에서는 계산된 키로
```

Symbol 키 속성은 일반적인 키 목록에 나오지 않는다. 비밀은 아니지만 "드러나지 않는" 속성이다.

| 기능 | Symbol 키가 나오나 |
| --- | --- |
| `for...in`, `Object.keys`·`entries`, `JSON.stringify` | 안 나온다 |
| `Object.getOwnPropertySymbols(obj)` | Symbol 키만 모아 준다 |
| `Reflect.ownKeys(obj)` | 문자열 키와 Symbol 키를 모두 준다 |
| `{ ...obj }`, `Object.assign` | 복사된다 |

다른 순회 방식과의 차이는 [[property-descriptors|속성 설명자]]의 enumerable 표에 함께 있다. 진짜로 숨겨야 하는 상태는 Symbol이 아니라 class의 `#private` 필드나 클로저로 감춘다.

## 전역 레지스트리: Symbol.for

`Symbol()`은 부를 때마다 새 값이다. 모듈이나 iframe을 넘어 **같은 Symbol을 함께 써야** 하면 런타임 전체가 공유하는 전역 레지스트리를 쓴다.

```javascript
const a = Symbol.for('app.cache') // 없으면 만들어 등록하고, 있으면 그것을 돌려준다
const b = Symbol.for('app.cache')
a === b                       // true
Symbol.keyFor(a)              // 'app.cache'
Symbol.keyFor(Symbol('x'))    // undefined — 레지스트리에 없는 Symbol
Symbol('k') === Symbol.for('k') // false — 설명과 레지스트리 키는 별개다
```

레지스트리 키는 전역 이름 공간이므로 `'app.cache'`처럼 접두사를 붙여 충돌을 피한다. 등록된 Symbol은 다시 만들어 낼 수 있는 값이라 WeakMap의 키가 될 수 없다. 등록하지 않은 Symbol만 키로 쓸 수 있다([[map-and-set|Map과 Set]]).

## well-known symbol: 언어 동작의 확장 지점

`Symbol.iterator`처럼 `Symbol`에 정적 속성으로 달린 Symbol들은 **엔진이 내장 동작을 할 때 찾아보는 키**다. 객체에 이 키로 메서드를 두면 그 객체가 언어 문법에 끼어든다. 문자열 이름(`'iterator'`)이 아니라 Symbol이라서, 기존 코드의 같은 이름 속성과 부딪치지 않고 ES2015 이후 기능을 추가할 수 있었다. 명세와 문서에서는 `@@iterator`나 `%Symbol.iterator%`처럼 표기한다.

| Symbol | 엔진이 쓰는 때 | 정의하면 |
| --- | --- | --- |
| `Symbol.iterator` | `for...of`, spread `[...x]`, 구조 분해, `Array.from` | 객체가 iterable이 된다([[iterators-and-generators\|이터레이터와 제너레이터]]) |
| `Symbol.asyncIterator` | `for await...of` | 비동기 iterable이 된다 |
| `Symbol.toPrimitive` | `+obj`, `` `${obj}` ``, `obj == 1` 같은 원시값 변환 | 변환 결과를 직접 정한다([[object-to-primitive\|객체의 원시형 변환]]) |
| `Symbol.toStringTag` | `Object.prototype.toString.call(obj)` | `'[object 이름]'`의 이름을 정한다 |
| `Symbol.hasInstance` | `x instanceof C` | `instanceof` 판정을 바꾼다 |
| `Symbol.species` | `map`·`filter`가 결과 배열을 만들 때 | 하위 클래스의 결과 타입을 정한다 |

```javascript
class Money {
  constructor(cents) { this.cents = cents }
  [Symbol.toPrimitive](hint) {
    return hint === 'number' ? this.cents : `${this.cents / 100}원`
  }
  get [Symbol.toStringTag]() { return 'Money' }
}
const m = new Money(1500)
+m                                  // 1500
`${m}`                              // '15원'
Object.prototype.toString.call(m)   // '[object Money]'
```

## 정리

- Symbol은 만들 때마다 고유한 원시값이다. 설명은 이름표일 뿐이고 `new`로 만들 수 없다.
- 남의 객체에 충돌 없이 속성을 붙이는 키로 쓴다. `Object.keys`·`for...in`·JSON에는 나오지 않는다.
- 여러 곳에서 같은 Symbol이 필요하면 `Symbol.for(키)`, 거꾸로 키를 얻으려면 `Symbol.keyFor`.
- well-known symbol은 `for...of`·형변환·`instanceof` 같은 언어 동작에 내 객체를 끼워 넣는 확장 지점이다.

관련 노트: [[variables-and-types|변수와 데이터 타입]], [[iterators-and-generators|이터레이터와 제너레이터]], [[property-descriptors|속성 설명자]], [[map-and-set|Map과 Set]], [[object-to-primitive|객체의 원시형 변환]], [[proxy-and-reflect|Proxy와 Reflect]]
