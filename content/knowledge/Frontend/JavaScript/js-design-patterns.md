---
title: "JavaScript 디자인 패턴: 생성 패턴"
concept: "JS Design Patterns"
summary: "객체를 만드는 방식을 다루는 생성 패턴 중 생성자·모듈·싱글톤·프로토타입 패턴을 JavaScript 코드로 정리하고, 프로토타입 기반 언어라서 달라지는 점을 짚는다. 단일 상속을 보완해 여러 클래스에 동작을 섞어 넣는 믹스인(Object.assign 방식, 클래스 팩토리 방식, 이벤트 믹스인)과 관찰자 패턴을 독립 클래스로 만든 이벤트 이미터 구현도 함께 다룬다."
tags: ["javascript", "design-pattern", "oop", "frontend"]
source: mixed
date: "2026-10-17"
sources: ["https://riverkim.kr/316", "https://ko.javascript.info/mixins", "https://ko.javascript.info/class-inheritance", "https://www.frontendinterviewhandbook.com/coding/javascript-utility-function"]
---

> 『자바스크립트 + 리액트 디자인 패턴』(한빛미디어)의 생성 패턴 부분을 바탕으로 재구성하고, 믹스인은 javascript.info(모던 JavaScript 튜토리얼)의 「믹스인」 글로 보강한 노트다. 이벤트 이미터 구현은 「[Front End Interview Handbook](https://www.frontendinterviewhandbook.com/coding/javascript-utility-function)」의 JavaScript 코딩 문제를 참고했다.

## 생성 패턴이란

**생성 패턴**은 객체를 어떻게 만들지를 다루는 패턴이다. 클래스가 먼저 있어야 객체를 만들 수 있는 Java·C++와 달리, JavaScript는 객체 리터럴로 객체를 바로 만들고 다른 객체를 원형으로 삼을 수 있다. 그래서 같은 패턴이라도 구현 모양과 필요성이 다르다.

| 패턴 | 핵심 | 장점 |
| --- | --- | --- |
| 생성자 | `class` + `constructor` + `new` | 재사용, 캡슐화 |
| 모듈 | 공개할 것만 노출하고 나머지는 숨김 | 은닉화, 네임스페이스 충돌 방지 |
| 싱글톤 | 인스턴스를 하나로 제한 | 전역 상태·설정의 단일 소스 |
| 프로토타입 | 원형 객체를 복제해 필요한 부분만 덮어씀 | 초기화 비용 절감, 런타임 확장 |

### 1. 생성자 패턴

ES6 `class`로 틀을 정의하고 `constructor`에서 초기화한 뒤 `new`로 인스턴스를 만든다. `class`는 프로토타입 위에 얹은 **문법적 설탕(syntactic sugar)** 이지만 상속·캡슐화 같은 OOP 개념을 자연스럽게 표현한다.

```javascript
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }
  sayHello() {
    console.log(`Hello, my name is ${this.name} and I am ${this.age} years old.`)
  }
}

new Person('John', 30).sayHello()
```

### 2. 모듈 패턴

변수와 함수를 감추고 공개 인터페이스만 돌려준다. 즉시 실행 함수(IIFE)와 클로저로 private 상태를 만든다([[scope-and-closures|스코프와 클로저]]).

```javascript
const CounterModule = (function () {
  let count = 0                    // private
  function logCount() {            // private
    console.log('Current count:', count)
  }
  return {                         // public API
    increment() { count++; logCount() },
    reset() { count = 0; logCount() },
  }
})()

CounterModule.increment() // Current count: 1
CounterModule.reset()     // Current count: 0
```

클로저를 쓰는 이 방식은 예전 방식이다. 지금은 **ES 모듈**이 같은 역할을 한다. 파일 자체가 스코프여서 `export`하지 않은 것은 자동으로 숨겨지고, 트리 셰이킹도 된다([[es-modules|모듈: export와 import]]).

### 3. 싱글톤 패턴

클래스의 인스턴스가 **하나만** 존재하도록 막는다. 두 번째 `new`부터는 처음 만든 인스턴스를 그대로 돌려준다.

```javascript
class Singleton {
  constructor() {
    if (Singleton.instance) return Singleton.instance
    this.timestamp = Date.now()
    Singleton.instance = this
  }
}

const a = new Singleton()
const b = new Singleton()
a === b // true
```

- 장점: 어디서든 같은 객체에 접근하므로 상태·설정의 단일 소스가 된다. 처음 쓰일 때 만들도록 초기화를 늦출 수도 있다.
- 주의: JavaScript는 객체 리터럴 하나로 "하나뿐인 객체"를 바로 만들 수 있다. 싱글톤 클래스가 필요하다고 느껴지면 설계를 다시 볼 신호일 수 있다.

### 4. 프로토타입 패턴

미리 만든 **원형(prototype) 객체를 복제**해 새 객체를 만들고 필요한 속성만 덮어쓴다. JavaScript 언어 자체의 상속 방식이기도 하다. 언어 차원의 프로토타입 체인은 [[prototype-and-inheritance|프로토타입과 상속]]에 정리했다.

```javascript
const ButtonProto = {
  type: 'primary',
  style: { padding: 12, color: '#fff', bg: '#2563eb' },
  render() { /* ... */ },
}

const dangerBtn = Object.create(ButtonProto)
dangerBtn.type = 'danger'
dangerBtn.style = { ...ButtonProto.style, bg: '#dc2626' } // 중첩 객체는 새로 만들어 덮는다
```

`Object.create`는 원형을 **복사하지 않고 위임**한다. 그래서 중첩 객체를 그대로 고치면 원형까지 바뀐다. 깊은/얕은 복사와 순환 참조를 신경 써야 한다.

**전통적인 클래스 기반 OOP와의 차이**는 런타임 확장이다. 인스턴스를 만든 뒤에 원형에 메서드를 추가해도 기존 인스턴스가 바로 쓸 수 있다. 클래스 기반 언어에서는 클래스를 바꾸려면 다시 컴파일·배포해야 한다.

```javascript
const Animal = { speak() { console.log(`${this.name} makes a sound`) } }
const a1 = Object.create(Animal); a1.name = '멍멍이'

Animal.run = function () { console.log(`${this.name} runs`) } // 나중에 추가
a1.run() // 멍멍이 runs
```

JavaScript가 프로토타입 방식을 택한 것은 1995년 아주 짧은 기간에 설계되면서, 클래스를 설계·컴파일·인스턴스화하는 방식보다 객체를 바로 만들고 다른 객체에 위임하는 방식이 단순하고 유연하다고 봤기 때문이다. ES6 `class`도 결국 이 위임 모델 위의 문법이다.

## 덧붙여: 믹스인

JavaScript는 **단일 상속**이다. 객체는 `[[Prototype]]`을 하나만, 클래스는 부모를 하나만 가진다. `User`가 `Person`을 상속하면서 이벤트를 내보내는 기능까지 얻고 싶을 때처럼, 계층과 상관없는 동작을 여러 클래스에 나눠 주고 싶으면 **믹스인(mixin)** 을 쓴다. 믹스인은 혼자 쓰이지 않고 다른 클래스에 메서드를 더해 주기 위한 메서드 묶음이다.

### 객체 믹스인: 프로토타입에 복사

```javascript
const sayHiMixin = {
  sayHi() { return `Hello ${this.name}` },
  sayBye() { return `Bye ${this.name}` },
}

class User extends Person {}
Object.assign(User.prototype, sayHiMixin) // 상속 체인을 건드리지 않고 메서드만 복사
new User('Dude').sayHi()                   // 'Hello Dude'
```

- 믹스인끼리 상속할 수도 있다(`const sayHiMixin = { __proto__: sayMixin, sayHi() { super.say(…) } }`). 이때 복사된 메서드의 `super`는 `User`의 부모가 아니라 **믹스인의 프로토타입**을 본다. 메서드가 자기가 정의된 객체를 `[[HomeObject]]`로 기억하기 때문이다([[class|class 문법]]의 super 절).
- 믹스인 메서드가 기존 메서드와 이름이 같으면 조용히 덮어쓴다. 이름을 신중히 정한다.

### 클래스 팩토리 믹스인

`extends` 뒤에 식이 올 수 있다는 점을 이용해, **부모 클래스를 받아 확장한 클래스를 돌려주는 함수**로 믹스인을 만든다. 믹스인이 상속 체인 안에 들어가므로 `super`와 `instanceof` 체인이 자연스럽게 동작한다.

```javascript
const Serializable = (Base) => class extends Base {
  toJSON() { return { ...this } }
}
const Timestamped = (Base) => class extends Base {
  createdAt = Date.now()
}

class Post extends Serializable(Timestamped(Model)) {}
```

### 이벤트 믹스인

여러 객체가 "무슨 일이 일어났다"를 알리고 구독받는 기능은 대표적인 믹스인 소재다. `on(name, handler)`로 구독, `off(name, handler)`로 해제, `trigger(name, ...args)`로 등록된 핸들러를 모두 부르는 메서드를 객체 믹스인으로 만들어 `Menu.prototype`에 복사하면, 메뉴가 `select` 이벤트를 내보내고 다른 객체가 반응할 수 있다. 관찰자(Observer) 패턴을 믹스인으로 나눠 준 것이다.

같은 구조를 독립 클래스로 만든 것이 **이벤트 이미터(Event Emitter)** 다. 면접의 JavaScript 코딩 문제로 자주 나온다.

```javascript
class EventEmitter {
  #listeners = new Map() // 이벤트 이름 → 핸들러 Set

  on(name, handler) {
    if (!this.#listeners.has(name)) this.#listeners.set(name, new Set())
    this.#listeners.get(name).add(handler)
    return () => this.off(name, handler) // 구독 해제 함수를 돌려준다
  }

  off(name, handler) {
    this.#listeners.get(name)?.delete(handler)
  }

  once(name, handler) {
    const off = this.on(name, (...args) => { off(); handler(...args) })
    return off
  }

  emit(name, ...args) {
    // 복사본을 돈다: 핸들러 안에서 on/off가 불려도 이번 발행은 흔들리지 않는다
    for (const handler of [...(this.#listeners.get(name) ?? [])]) handler.apply(this, args)
  }
}
```

짚을 지점은 세 가지다. 핸들러를 `Set`에 두면 같은 함수의 중복 등록이 막힌다(중복을 허용하려면 배열). `emit` 중에 구독이 바뀌어도 안전하도록 **복사본을 순회**한다. `on`이 해제 함수를 돌려주면 익명 함수도 해제할 수 있다.

브라우저와 Node.js에서는 직접 만들 필요 없이 표준 `EventTarget`을 상속하면 같은 일을 한다(`class Menu extends EventTarget`, `menu.dispatchEvent(new CustomEvent('select', { detail }))`). 다만 이미 다른 부모가 있으면 상속할 수 없으니, 그때 믹스인이 필요하다. `CustomEvent`는 [[dom-events|DOM 이벤트]]에 있다.

## 정리

- 생성자 패턴은 `class`로, 모듈 패턴은 이제 ES 모듈로 쓴다.
- 싱글톤은 쓸 수 있지만 객체 리터럴로 충분한지 먼저 본다.
- 프로토타입 패턴은 JavaScript 상속의 본모습이다. 복제가 아니라 위임이라는 점을 기억한다.
- 단일 상속으로 부족하면 믹스인으로 메서드를 섞는다. 객체를 `Object.assign`으로 복사하거나, 부모를 받아 확장 클래스를 돌려주는 함수로 만든다.
- 관찰자 패턴은 이벤트 이미터(`on`·`off`·`once`·`emit`)로 구현한다. 발행 중 구독 변경에 대비해 복사본을 순회한다.

관련 노트: [[gof-design-patterns|GoF 디자인 패턴]], [[frontend-interview|프론트엔드 면접 유형과 준비법]], [[class|class 문법]], [[prototype-and-inheritance|프로토타입과 상속]], [[es-modules|모듈: export와 import]], [[singleton-service-pattern|Express 싱글톤 패턴과 서비스 패턴]], [[software-engineering|디자인 패턴(GoF)]]
