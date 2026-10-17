---
title: "속성 설명자(Property Descriptor)"
concept: "Property Descriptor"
summary: "객체의 모든 속성에는 값 말고도 writable·enumerable·configurable 같은 숨은 설정이 붙어 있다. 데이터 속성과 접근자(getter·setter) 속성의 차이, Object.defineProperty의 기본값이 리터럴과 정반대라는 점, enumerable이 for...in·Object.keys·spread·JSON에 미치는 영향, Object.create의 두 번째 인자, preventExtensions·seal·freeze의 차이를 정리한다."
tags: ["javascript", "frontend", "oop", "prototype"]
source: other
date: "2026-10-17"
sources: ["https://web.dev/learn/javascript/objects/property-descriptors", "https://web.dev/learn/javascript/control-flow", "https://web.dev/learn/javascript/collections/indexed", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/defineProperty", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Enumerability_and_ownership_of_properties", "https://ko.javascript.info/property-descriptors", "https://ko.javascript.info/property-accessors"]
---

> web.dev의 「[Learn JavaScript](https://web.dev/learn/javascript)」 강좌의 「Property descriptors」 모듈과 javascript.info(모던 JavaScript 튜토리얼)의 「프로퍼티 플래그와 설명자」, 「프로퍼티 getter와 setter」 글을 바탕으로, MDN으로 확인해 재구성한 노트다.

## 속성 설명자란

**객체의 속성은 "키 → 값"이 전부가 아니다.** 각 속성에는 그 속성을 바꿀 수 있는지, 순회에 나오는지, 지우거나 재설정할 수 있는지를 정하는 숨은 속성(attribute)이 붙어 있다. 이 묶음을 **속성 설명자(property descriptor)** 라고 한다. 명세에서는 `[[Writable]]`처럼 이중 대괄호로 쓰는데, 코드로 직접 접근하는 이름이 아니라 내부 슬롯이라는 표시다(`[[Prototype]]`과 같은 표기).

설명자는 두 종류다. 한 속성은 둘 중 하나만 될 수 있다.

| 종류 | 가지는 설정 | 뜻 |
| --- | --- | --- |
| 데이터 속성(data) | `value`, `writable` | 값을 그대로 저장한다 |
| 접근자 속성(accessor) | `get`, `set` | 읽고 쓸 때 함수가 실행된다. 값 자체는 저장하지 않는다 |
| 공통 | `enumerable`, `configurable` | 순회 노출 여부, 삭제·재설정 가능 여부 |

| 설정 | 뜻 | 리터럴·대입으로 만든 속성 | `defineProperty` 기본값 |
| --- | --- | --- | --- |
| `value` | 속성의 값 | 대입한 값 | `undefined` |
| `writable` | 값을 바꿀 수 있나 | `true` | **`false`** |
| `get` / `set` | 읽기·쓰기 때 부를 함수 | 없음 | `undefined` |
| `enumerable` | `for...in`·`Object.keys`에 나오나 | `true` | **`false`** |
| `configurable` | 지우거나 설정을 바꿀 수 있나 | `true` | **`false`** |

**기본값이 정반대라는 점이 핵심 함정이다.** `{ a: 1 }`이나 `obj.a = 1`로 만든 속성은 세 플래그가 모두 `true`지만, `Object.defineProperty`로 만들면서 생략한 플래그는 모두 `false`가 된다.

## 읽고 정의하기

```javascript
const user = { name: 'river' }
Object.getOwnPropertyDescriptor(user, 'name')
// { value: 'river', writable: true, enumerable: true, configurable: true }

Object.defineProperty(user, 'id', { value: 42 }) // 나머지는 전부 false
user.id = 7
user.id                    // 42 — sloppy mode에서는 조용히 무시된다
Object.keys(user)          // ['name'] — enumerable: false라 안 나온다
delete user.id             // false — configurable: false (strict mode에서는 TypeError)
```

| API | 하는 일 |
| --- | --- |
| `Object.getOwnPropertyDescriptor(obj, key)` | 속성 하나의 설명자 |
| `Object.getOwnPropertyDescriptors(obj)` | 모든 자기 속성의 설명자. Symbol 키와 열거 불가 속성까지 포함한다. getter·setter까지 보존해 복사할 때 `Object.defineProperties({}, Object.getOwnPropertyDescriptors(src))` |
| `Object.defineProperty(obj, key, desc)` | 속성 하나를 만들거나 고친다 |
| `Object.defineProperties(obj, { key: desc, … })` | 여러 개를 한 번에 |
| `Object.create(proto, { key: desc, … })` | 프로토타입을 정해 새 객체를 만들면서, 두 번째 인자로 자기 속성을 설명자 형식으로 정의한다 |

`writable: false`인 속성에 쓰면 **sloppy mode에서는 조용히 실패하고 strict mode에서는 `TypeError`** 가 난다([[strict-mode|strict mode]]). 모듈 코드는 strict이므로 대개 에러로 드러난다.

`configurable: false`여도 `writable: true`면 값은 바꿀 수 있다. **configurable은 값이 아니라 속성의 "설정"을 잠근다.** 한 번 `false`로 만들면 `defineProperty`로도 되돌릴 수 없다.

| `configurable: false`일 때 | 가능 여부 |
| --- | --- |
| `delete obj.key` | 불가 |
| `configurable`·`enumerable` 바꾸기 | 불가 |
| `writable`을 `false` → `true` | 불가 |
| `writable`을 `true` → `false` | **가능**(더 잠그는 방향만 허용) |
| 접근자의 `get`·`set` 교체 | 불가 |

`writable: false`와 `configurable: false`를 함께 주면 영원히 바뀌지 않는 상수 속성이 된다. 내장 `Math.PI`가 그렇다. 세 플래그가 모두 `false`라 `Math.PI = 3`은 무시(strict mode에서는 `TypeError`)되고 지울 수도 없다.

## 접근자 속성: getter와 setter

접근자 속성은 속성처럼 읽고 쓰지만 실제로는 함수가 돈다. 객체 리터럴과 class에서는 `get`·`set` 키워드로 쓰고, 그 결과가 접근자 설명자다.

```javascript
const temp = {
  celsius: 20,
  get fahrenheit() { return this.celsius * 1.8 + 32 },
  set fahrenheit(f) { this.celsius = (f - 32) / 1.8 },
}
temp.fahrenheit = 212
temp.celsius   // 100
Object.getOwnPropertyDescriptor(temp, 'fahrenheit')
// { get: ƒ, set: ƒ, enumerable: true, configurable: true } — value·writable이 없다
```

- getter만 있고 setter가 없으면 대입이 무시된다(strict mode에서는 `TypeError`).
- 한 설명자에 `value`와 `get`을 함께 주면 `TypeError`다.
- class의 `get`·`set`은 인스턴스가 아니라 `prototype`에 정의된다([[class|class 문법]]).
- `Object.defineProperty(obj, 'x', { get() {…}, set(v) {…} })`로도 만든다. 이때 `enumerable`을 주지 않으면 `false`라서 `for...in`에 나오지 않는다.

접근자는 두 가지 용도로 쓴다.

| 용도 | 방법 |
| --- | --- |
| 값 검증·통제 | 실제 값은 `_name`(관례상 내부용) 또는 `#name`(언어가 막는 private)에 두고, setter에서 검사한 뒤 저장한다 |
| 호환성 유지 | 저장 형식이 바뀌어도 옛 속성 이름을 계산된 getter로 남긴다. `age`를 저장하다 `birthday`로 바꿨다면 `get age()`가 생일로 나이를 계산해, `user.age`를 읽는 기존 코드를 고치지 않아도 된다 |

```javascript
function User(name, birthday) {
  this.name = name
  this.birthday = birthday
  Object.defineProperty(this, 'age', {
    get() { return new Date().getFullYear() - this.birthday.getFullYear() },
  })
}
```

## enumerable이 정하는 것

열거 불가능한 속성은 "있지만 순회에는 안 나오는" 속성이다. 내장 메서드(`Object.prototype.toString`, 배열의 `length`, class 메서드)가 모두 `enumerable: false`라서 `for...in`에 끼어들지 않는다.

| 기능 | 열거 불가 속성 | 상속 속성 | Symbol 키 |
| --- | --- | --- | --- |
| `for...in` | 제외 | **포함**(열거 가능한 것만) | 제외 |
| `Object.keys`·`values`·`entries` | 제외 | 제외 | 제외 |
| `{ ...obj }`, `Object.assign` | 제외 | 제외 | 포함 |
| `JSON.stringify` | 제외 | 제외 | 제외 |
| `Object.getOwnPropertyNames` | **포함** | 제외 | 제외 |
| `Reflect.ownKeys` | 포함 | 제외 | 포함 |
| `key in obj` | 포함 | 포함 | 포함 |

그래서 spread로 만든 복사본은 **프로토타입과 열거 불가 속성을 잃고, getter는 그 순간의 값으로 바뀐다.** 프로토타입·플래그·접근자까지 그대로인 얕은 복사본은 `Object.create(Object.getPrototypeOf(obj), Object.getOwnPropertyDescriptors(obj))`로 만든다. 겉보기에 같은 객체라도 원본의 성질까지 복사되지는 않는다. 자기 속성인지는 `Object.hasOwn(obj, key)`로 판별한다([[prototype-and-inheritance|프로토타입과 상속]]).

## 객체 전체를 잠그기

속성 하나가 아니라 객체 단위로 플래그를 일괄 적용하는 메서드도 있다. 모두 **얕게** 동작한다. 중첩 객체는 따로 잠가야 한다.

| 메서드 | 속성 추가 | 속성 삭제 | 값 변경 | 판별 |
| --- | --- | --- | --- | --- |
| `Object.preventExtensions(obj)` | 불가 | 가능 | 가능 | `Object.isExtensible` |
| `Object.seal(obj)` | 불가 | 불가(모든 속성 `configurable: false`) | 가능 | `Object.isSealed` |
| `Object.freeze(obj)` | 불가 | 불가 | 불가(모든 데이터 속성 `writable: false`) | `Object.isFrozen` |

`const`와 `Object.freeze`의 차이는 [[variables-and-types|변수와 데이터 타입]]의 「const와 Object.freeze」에 있다.

## 정리

- 속성마다 `writable`·`enumerable`·`configurable`(또는 `get`·`set`) 설정이 숨어 있다.
- 리터럴로 만든 속성은 모두 `true`, `defineProperty`로 만들면서 생략한 플래그는 모두 `false`다.
- 쓰기 실패는 sloppy mode에서 조용히 무시되고 strict mode에서 `TypeError`가 된다.
- `enumerable: false`는 `for...in`·`Object.keys`·spread·JSON에서 빠진다. 내장 메서드가 순회에 안 나오는 이유다.
- 객체 단위 잠금은 `preventExtensions` < `seal` < `freeze` 순으로 강하고, 모두 얕다.

관련 노트: [[prototype-and-inheritance|프로토타입과 상속]], [[class|class 문법]], [[arrays-and-objects|배열·객체·문자열 다루기]], [[strict-mode|strict mode]], [[js-symbol|Symbol]], [[proxy-and-reflect|Proxy와 Reflect]]
