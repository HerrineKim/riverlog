---
title: "class 문법"
concept: "Class"
summary: "ES6 class로 객체의 틀을 정의하는 방법: constructor, 인스턴스·정적 멤버, extends 상속, getter·setter."
tags: ["javascript", "oop", "frontend"]
source: notion
---

**class**는 같은 모양의 객체를 찍어 내기 위한 템플릿이다. ES5까지는 생성자 함수와 프로토타입 체인으로 구현했고, ES6(2015)에서 객체 지향 문법에 익숙한 형태로 `class`가 도입됐다. 내부 동작은 여전히 프로토타입 기반이며, class는 이를 읽기 쉽게 감싼 문법이다.

## 기본 형태와 constructor

```javascript
class Person {
  constructor(name, age) {
    this.name = name
    this.age = age
  }

  greet() {
    return `안녕하세요, ${this.name}입니다.`
  }
}

const person = new Person('John Doe', 27)
person.greet() // '안녕하세요, John Doe입니다.'
```

- `constructor`는 `new`로 인스턴스를 만들 때 호출되어 필드를 초기화하는 특수 메서드다. 클래스에 **하나만** 둘 수 있다.
- 메서드는 프로토타입에 한 번만 정의되어 모든 인스턴스가 공유한다.

## 클래스 필드와 static

```javascript
class Counter {
  count = 0               // 인스턴스 필드
  #secret = 'hidden'      // private 필드 (클래스 밖에서 접근 불가)
  static instances = 0    // 정적 필드

  constructor() {
    Counter.instances += 1
  }

  static add(a, b) {      // 정적 메서드
    return a + b
  }
}

Counter.add(1, 3)         // 4 — 인스턴스 없이 클래스 이름으로 호출
new Counter().count       // 0
```

`static`이 붙은 멤버는 인스턴스가 아니라 **클래스 자체**에 속한다. 유틸리티 함수나 인스턴스 개수처럼 클래스 단위로 관리할 값에 쓴다.

## extends: 상속

```javascript
class Parent {
  static family = 'Kim'
  static sayFamily() {
    return `We are the ${this.family}s`
  }

  mother = 'mother'
  sayMother() {
    return "I'm your mother"
  }
}

class Child extends Parent {
  constructor() {
    super() // 자식 constructor에서는 this를 쓰기 전에 반드시 super() 호출
    this.toy = 'robot'
  }
}

Child.family          // 'Kim' — 정적 멤버도 상속된다
Child.sayFamily()     // 'We are the Kims'
const child = new Child()
child.mother          // 'mother' — 인스턴스 필드
child.sayMother()     // "I'm your mother" — 인스턴스 메서드
```

자식 클래스는 부모의 **정적 멤버**와 **인스턴스 멤버**를 모두 물려받는다. 같은 이름의 메서드를 다시 정의하면 오버라이딩되고, 부모 쪽 구현은 `super.method()`로 부를 수 있다.

## getter와 setter

속성처럼 읽고 쓰지만 실제로는 함수가 실행된다. 값 검증이나 계산된 값을 노출할 때 쓴다.

```javascript
class Account {
  #balance = 0

  get balance() {           // 읽기: account.balance
    return this.#balance
  }

  set balance(value) {      // 쓰기: account.balance = 100
    if (value < 0) throw new Error('잔액은 음수가 될 수 없습니다')
    this.#balance = value
  }
}

const account = new Account()
account.balance           // 0
account.balance = 100
account.balance           // 100
```

- getter는 반드시 값을 `return`해야 하고, setter는 인자를 하나 받는다.
- 내장 객체 이름(`Number`, `Map` 등)으로 클래스를 만들면 전역 객체를 가리게 되니 피한다.

## 핵심 정리

- `class` = 프로토타입 기반 객체 생성의 문법적 설탕. `new`로 인스턴스를 만든다.
- `constructor`는 하나, 자식 constructor에서는 `super()`를 먼저 호출한다.
- `static`은 클래스 자체의 멤버, `#`은 private 필드, `get`/`set`은 속성처럼 쓰는 함수다.
