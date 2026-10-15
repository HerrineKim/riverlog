---
title: "프로토타입과 상속"
concept: "Prototype"
summary: "JavaScript 객체는 프로토타입 객체에 연결되어, 자기에게 없는 속성을 그 체인을 따라 찾는다. 클래스와 다른 철학적 뿌리(분류 대 가족 유사성·원형), 생성자 함수와 new가 하는 일, 인스턴스 속성과 프로토타입 메서드의 구분, 프로토타입 체인과 섀도잉, Object.create와 getPrototypeOf, class 문법이 프로토타입 코드로 어떻게 풀리는지, 내장 프로토타입을 고치면 안 되는 이유와 폴리필을 정리했다."
tags: ["javascript", "frontend", "oop", "prototype"]
source: other
date: "2026-10-15"
sources: ["https://wesbos.com/javascript/11-prototypes-this-new-and-inheritance/60-the-new-keyword", "https://wesbos.com/javascript/11-prototypes-this-new-and-inheritance/61-the-this-keyword", "https://wesbos.com/javascript/11-prototypes-this-new-and-inheritance/63-prototypes-and-prototypal-inheritance", "https://wesbos.com/javascript/11-prototypes-this-new-and-inheritance/62-prototype-refactor-of-gallery-exercise", "https://medium.com/@limsungmook/%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8%EB%8A%94-%EC%99%9C-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85%EC%9D%84-%EC%84%A0%ED%83%9D%ED%96%88%EC%9D%84%EA%B9%8C-997f985adb42", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Inheritance_and_the_prototype_chain", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/new"]
---

> Wes Bos의 「[Beginner JavaScript](https://wesbos.com/javascript)」 강의 노트를 바탕으로 재구성한 노트다. 프로토타입의 철학적 배경은 임성묵의 「[자바스크립트는 왜 프로토타입을 선택했을까](https://medium.com/@limsungmook/%EC%9E%90%EB%B0%94%EC%8A%A4%ED%81%AC%EB%A6%BD%ED%8A%B8%EB%8A%94-%EC%99%9C-%ED%94%84%EB%A1%9C%ED%86%A0%ED%83%80%EC%9E%85%EC%9D%84-%EC%84%A0%ED%83%9D%ED%96%88%EC%9D%84%EA%B9%8C-997f985adb42)」(2021.12)를 바탕으로 덧붙였다.

## 프로토타입이란

JavaScript의 모든 객체는 숨은 링크 `[[Prototype]]`으로 다른 객체 하나(또는 `null`)를 가리킨다. 그 객체가 **프로토타입**이다. 객체에서 속성을 찾을 때 자기에게 없으면 프로토타입에서, 거기도 없으면 프로토타입의 프로토타입에서 찾는다. 이것이 **프로토타입 체인**이고, JavaScript 상속의 전부다.

배열을 만들 때마다 `push`·`filter`가 복사되지 않는 이유가 여기에 있다. 메서드는 `Array.prototype`에 한 벌만 있고 모든 배열이 그것을 빌려 쓴다.

```javascript
const names = ['wes', 'kait']
const numbers = [1, 2, 3]
names.filter === numbers.filter                // true — 같은 함수 하나를 공유한다
Object.getPrototypeOf(names) === Array.prototype // true
```

## 왜 클래스가 아니라 프로토타입인가

클래스와 프로토타입은 "같은 종류의 객체를 어떻게 묶나"에 대한 두 가지 답이다. 차이는 철학에서 왔다(Antero Taivalsaari, 「Classes vs. Prototypes: Some Philosophical and Historical Observations」, 1996).

| | 클래스 기반 | 프로토타입 기반 |
| --- | --- | --- |
| 뿌리 | 플라톤의 이데아, 아리스토텔레스의 **분류**: 공통 속성이 같으면 같은 범주다 | 비트겐슈타인의 **가족 유사성**과 Rosch의 **프로토타입 이론**: 범주는 정의가 아니라 가장 전형적인 본보기(원형)와 얼마나 닮았는가로 정해진다 |
| 객체 만들기 | 먼저 추상적인 설계도(클래스)를 정의하고 `new`로 구체화한다 | 이미 있는 구체적인 객체를 본보기로 삼아 복사하거나 연결한다 |
| 확장 | 클래스 상속 | 위임(delegation). 자기가 모르는 메시지는 원형에게 넘긴다 |
| 설계 순서 | 분류 체계를 미리 잘 세워야 한다. 잘못 세운 상속 계층은 나중에 바꾸기 어렵다 | 개별 객체를 고쳐 가며 점진적으로 발전시킨다 |

Rosch의 실험에서 사람들은 '새'를 떠올릴 때 참새를 전형으로, 타조·펭귄을 가장자리로 둔다. 모든 새가 공유하는 속성 목록이 아니라 원형과의 거리로 범주를 판단한다는 뜻이다. 이 생각을 언어로 옮긴 것이 1980년대의 **Self**이고, JavaScript는 Self에서 프로토타입을, Scheme에서 일급 함수와 클로저를, Java에서 문법의 겉모양을 가져왔다.

```javascript
const sparrow = { wings: 2, canFly: true }
const chicken = Object.create(sparrow)  // 설계도가 아니라 실제 객체를 원형으로 삼는다
chicken.canFly = false                  // 원형은 그대로, 자기만 달라진다(섀도잉)
chicken.wings                           // 2 — 원형에 위임
```

| 관점 | 근거 |
| --- | --- |
| 렉시컬 스코프·호이스팅·호출 방식에 따라 정해지는 `this`도 "의미는 맥락에서 정해진다"는 프로토타입 철학에서 나왔다 | 이렇게 보면 `this`를 경우의 수로 외우지 않고 "누가 호출했나"라는 하나의 원리로 이해할 수 있다 |
| 이 기능들은 철학이 아니라 설계상의 선택이다 | 렉시컬 스코프는 Scheme 계열에서, 동적 `this`는 함수를 메서드로 빌려 쓰는 위임 모델에서 왔다. 클래스 언어도 렉시컬 스코프를 쓴다 |

어느 쪽이든 `this`의 규칙 자체는 [[functions|함수와 this]]에, 스코프와 호이스팅은 [[scope-and-closures|스코프와 클로저]]에 있다.

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

- 클래스는 미리 정한 분류에서, 프로토타입은 실제 본보기와의 닮음에서 출발한다. JavaScript는 Self에서 이 모델을 가져왔다.
- 객체는 `[[Prototype]]` 링크로 다른 객체에 위임한다. 없는 속성은 체인을 따라 `null`까지 찾는다.
- `new`는 빈 객체를 `F.prototype`에 잇고, `this`로 본문을 실행해 돌려준다.
- 데이터는 인스턴스(`this`)에, 공유 동작은 `prototype`에 둔다.
- 프로토타입은 `Object.getPrototypeOf`·`Object.create`·`Object.hasOwn`으로 다루고 `__proto__`는 쓰지 않는다.
- `class`는 이 모든 것을 감싼 문법이다. 내장 프로토타입은 폴리필 말고는 건드리지 않는다.

관련 노트: [[class|class 문법]], [[oop-and-javascript|객체 지향 프로그래밍과 JavaScript]], [[js-design-patterns|JavaScript 디자인 패턴: 생성 패턴]], [[functions|함수와 this]], [[scope-and-closures|스코프와 클로저]], [[arrays-and-objects|배열·객체·문자열]]
