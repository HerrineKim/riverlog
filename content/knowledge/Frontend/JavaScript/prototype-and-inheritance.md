---
title: "프로토타입과 상속"
concept: "Prototype"
summary: "JavaScript 객체는 프로토타입 객체에 연결되어, 자기에게 없는 속성을 그 체인을 따라 찾는다. 생성자 함수와 new가 하는 일, 인스턴스 속성과 프로토타입 메서드의 구분, 프로토타입 체인과 섀도잉, Object.create와 getPrototypeOf, class 문법이 프로토타입 코드로 어떻게 풀리는지, 내장 프로토타입을 고치면 안 되는 이유와 폴리필을 정리했다."
tags: ["javascript", "frontend", "oop", "prototype"]
source: other
date: "2026-10-15"
sources: ["https://wesbos.com/javascript/11-prototypes-this-new-and-inheritance/60-the-new-keyword", "https://wesbos.com/javascript/11-prototypes-this-new-and-inheritance/61-the-this-keyword", "https://wesbos.com/javascript/11-prototypes-this-new-and-inheritance/63-prototypes-and-prototypal-inheritance", "https://wesbos.com/javascript/11-prototypes-this-new-and-inheritance/62-prototype-refactor-of-gallery-exercise", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new"]
---

> Wes Bos의 「[Beginner JavaScript](https://wesbos.com/javascript)」 강의 노트를 바탕으로 재구성한 노트다.

## 프로토타입이란

JavaScript의 모든 객체는 숨은 링크 `[[Prototype]]`으로 다른 객체 하나(또는 `null`)를 가리킨다. 그 객체가 **프로토타입**이다. 객체에서 속성을 찾을 때 자기에게 없으면 프로토타입에서, 거기도 없으면 프로토타입의 프로토타입에서 찾는다. 이것이 **프로토타입 체인**이고, JavaScript 상속의 전부다.

배열을 만들 때마다 `push`·`filter`가 복사되지 않는 이유가 여기에 있다. 메서드는 `Array.prototype`에 한 벌만 있고 모든 배열이 그것을 빌려 쓴다.

```javascript
const names = ['wes', 'kait']
const numbers = [1, 2, 3]
names.filter === numbers.filter                // true — 같은 함수 하나를 공유한다
Object.getPrototypeOf(names) === Array.prototype // true
```

## 생성자 함수와 new

`Array`, `Date`, `Object`, `Map`은 모두 함수다. 함수 앞에 `new`를 붙여 부르면 그 함수가 **생성자(constructor)** 가 되어 인스턴스 객체를 돌려준다. 일반 함수와 구분하려고 이름을 대문자로 시작한다.

```javascript
function Pizza(toppings = [], customer) {
  this.toppings = toppings  // this = 지금 만들어지는 인스턴스
  this.customer = customer
  this.slices = 10
}

Pizza(['cheese'])               // undefined — new 없이 부르면 그냥 함수 호출이다
const pepperoni = new Pizza(['pepperoni'], 'wes')
pepperoni instanceof Pizza      // true
pepperoni.constructor === Pizza // true — 누가 만들었는지
```

`new F(...args)`는 다음 순서로 동작한다.

1. 빈 객체를 만들고, 그 `[[Prototype]]`을 `F.prototype`으로 잇는다.
2. `this`를 그 객체로 정해 `F`의 본문을 실행한다. 본문은 `this`에 인스턴스 데이터를 채운다.
3. `F`가 다른 객체를 `return`하면 그것을, 아니면 1에서 만든 객체를 돌려준다.

`[]`·`{}` 같은 **리터럴 문법**은 `new Array()`·`new Object()`를 짧게 쓴 것이고, `document.createElement('span')`은 내부에서 인스턴스를 만들어 준다. `Date`처럼 리터럴이 없는 것은 `new`를 직접 쓴다.

> 원시값(`'wes'`, `42`)은 객체가 아니다. `'wes'.toUpperCase()`가 되는 것은 메서드를 부르는 순간 엔진이 `String` 래퍼 객체로 잠시 감싸 `String.prototype`을 찾기 때문이다(오토박싱).

## 인스턴스 속성과 프로토타입 메서드

인스턴스마다 달라야 하는 **데이터는 `this`에**, 모두가 똑같이 쓰는 **동작은 `prototype`에** 둔다.

```javascript
// ✗ 인스턴스마다 함수가 새로 만들어진다
function Pizza() {
  this.eat = function () { this.slices-- }
}
new Pizza().eat === new Pizza().eat // false — 피자 2만 개면 함수도 2만 개

// ✓ 함수는 한 벌, 모든 인스턴스가 공유한다
Pizza.prototype.eat = function () {
  if (this.slices > 0) this.slices--
  return this.slices
}
Pizza.prototype.describe = function () {
  return `${this.customer}의 피자, ${this.slices}조각 남음`
}
```

프로토타입 메서드 안의 `this`는 **메서드를 부른 인스턴스**다(`pepperoni.eat()`이면 `pepperoni`). 그래서 공유 함수 하나가 인스턴스마다 다른 데이터를 다룬다. 프로토타입에 메서드를 나중에 추가해도 이미 만든 인스턴스가 바로 쓸 수 있다. 이 위임 방식을 디자인 패턴으로 본 설명은 [[js-design-patterns|JavaScript 디자인 패턴]]의 프로토타입 패턴에 있다.

## 프로토타입 체인과 섀도잉

```text
pepperoni ──▶ Pizza.prototype ──▶ Object.prototype ──▶ null
{toppings,     {eat, describe,      {toString,
 customer,      constructor}         hasOwnProperty …}
 slices}

span ──▶ HTMLSpanElement.prototype ──▶ HTMLElement.prototype ──▶ Element.prototype
     ──▶ Node.prototype ──▶ EventTarget.prototype ──▶ Object.prototype ──▶ null
```

- `pepperoni.toppings`는 인스턴스에서 바로 찾는다.
- `pepperoni.eat`은 인스턴스에 없으니 `Pizza.prototype`에서 찾는다.
- `pepperoni.toString`은 `Object.prototype`까지 올라간다.
- 끝(`null`)까지 없으면 `undefined`다.

DOM 요소가 `span instanceof Node`이면서 `Element`이기도 한 것은 이 체인 덕분이다. `instanceof`는 "오른쪽 생성자의 `prototype`이 왼쪽 객체의 체인 어딘가에 있는가"를 검사한다.

인스턴스에 같은 이름의 속성을 두면 체인을 따라가기 전에 그것이 먼저 잡힌다. 이것이 **섀도잉**이며, 메서드 오버라이딩도 같은 원리다.

```javascript
Pizza.prototype.size = 'Large'
pepperoni.size              // 'Large' — 프로토타입에서 찾음
pepperoni.size = 'Medium'
pepperoni.size              // 'Medium' — 인스턴스 속성이 가린다
Object.hasOwn(pepperoni, 'size') // true — 자기 속성인지 확인
'eat' in pepperoni          // true — in은 체인까지 본다
```

## 프로토타입을 다루는 API

| API | 하는 일 |
| --- | --- |
| `Object.getPrototypeOf(obj)` | 객체의 프로토타입을 읽는다 |
| `Object.create(proto)` | `proto`를 프로토타입으로 하는 새 객체를 만든다. 생성자 없이 상속할 때 |
| `Object.create(null)` | 프로토타입이 없는 순수 딕셔너리. `toString` 같은 키와 충돌하지 않는다(키-값 저장이면 `Map`이 더 낫다) |
| `Object.setPrototypeOf(obj, proto)` | 이미 만든 객체의 프로토타입을 바꾼다. 엔진 최적화를 깨므로 피한다 |
| `Object.hasOwn(obj, key)` | 체인을 보지 않고 자기 속성인지 확인한다 |
| `obj.__proto__` | 과거의 비표준 접근자. 호환용으로만 남아 있어 새 코드에서는 위 함수들을 쓴다 |

`F.prototype`과 `[[Prototype]]`을 헷갈리기 쉽다. `F.prototype`은 **함수가 가진 일반 속성**으로, `new F()`로 만들 인스턴스에 연결해 줄 객체다. 인스턴스 자신의 프로토타입은 `Object.getPrototypeOf(instance)`로 본다.

## class는 프로토타입 위의 문법이다

ES2015의 `class`는 새 상속 모델이 아니라 위 코드를 정리한 문법이다([[class|class 문법]]).

| class 문법 | 프로토타입으로 풀면 |
| --- | --- |
| `constructor(a) { this.a = a }` | 생성자 함수 본문 |
| `eat() {}` | `Pizza.prototype.eat = function () {}` |
| `static create() {}` | `Pizza.create = function () {}` (생성자 함수 자체의 속성) |
| `class Child extends Parent` | `Child.prototype`의 프로토타입을 `Parent.prototype`으로, `Child`의 프로토타입을 `Parent`로 잇는다 |
| `super.eat()` | 체인에서 한 단계 위의 `eat`을 부른다 |

다만 `class`에는 함수로 흉내 낼 때 없는 차이가 있다. `new` 없이 부르면 `TypeError`가 나고, 본문은 자동으로 strict mode이며, 메서드는 열거되지 않고, 선언은 `let`처럼 TDZ에 놓인다. 새 코드에서는 생성자 함수 대신 `class`를 쓴다.

메서드를 콜백으로 넘기면(`addEventListener('click', this.showNext)`) 프로토타입에서 꺼낸 함수만 넘어가 `this`가 인스턴스가 아니게 된다. 해결법은 [[functions|함수와 this]]의 bind 절에 있다.

## 내장 프로토타입은 고치지 않는다

`String.prototype`이나 `Array.prototype`에도 메서드를 넣거나 덮어쓸 수 있다. 하지만 **페이지의 모든 코드가 같은 프로토타입을 공유**하므로, 한 곳에서 `toUpperCase`를 바꾸면 그 동작을 믿는 라이브러리가 모두 깨진다. 이렇게 내장 객체를 고치는 것을 몽키 패치라 하며, 표준화에도 걸림돌이 된다. 2018년 MooTools가 넣어 둔 `Array.prototype.flatten` 때문에 표준 메서드 이름이 `flat`으로 바뀐 일이 대표적이다.

예외는 **폴리필(polyfill)** 이다. 표준에 이미 있지만 오래된 브라우저에 없는 기능을, 표준과 똑같은 동작으로 **없을 때만** 채운다.

```javascript
if (!Array.prototype.at) {
  Array.prototype.at = function (i) { /* 표준 명세대로 구현 */ }
}
```

직접 쓰기보다 core-js 같은 검증된 폴리필을 빌드 도구로 필요한 만큼만 넣는다. 지원 범위를 정하는 기준은 [[responsible-javascript|책임감 있는 자바스크립트]]의 Baseline을 참고한다.

## 정리

- 객체는 `[[Prototype]]` 링크로 다른 객체에 위임한다. 없는 속성은 체인을 따라 `null`까지 찾는다.
- `new`는 빈 객체를 `F.prototype`에 잇고, `this`로 본문을 실행해 돌려준다.
- 데이터는 인스턴스(`this`)에, 공유 동작은 `prototype`에 둔다.
- 프로토타입은 `Object.getPrototypeOf`·`Object.create`·`Object.hasOwn`으로 다루고 `__proto__`는 쓰지 않는다.
- `class`는 이 모든 것을 감싼 문법이다. 내장 프로토타입은 폴리필 말고는 건드리지 않는다.

관련 노트: [[class|class 문법]], [[oop-and-javascript|객체 지향 프로그래밍과 JavaScript]], [[js-design-patterns|JavaScript 디자인 패턴: 생성 패턴]], [[functions|함수와 this]], [[scope-and-closures|스코프와 클로저]], [[arrays-and-objects|배열·객체·문자열]]
