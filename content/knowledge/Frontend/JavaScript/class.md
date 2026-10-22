---
title: "class 문법"
concept: "Class"
summary: "ES6 class로 객체의 틀을 정의하는 방법: 선언과 표현식(익명 클래스, TDZ), constructor, 계산된 메서드 이름, 인스턴스·정적 멤버, 클래스 필드와 #private 필드·메서드, _ 관례로 흉내 내는 protected, 정적 초기화 블록, new this를 쓰는 정적 팩토리 메서드, extends와 super(파생 constructor가 super()를 먼저 불러야 하는 이유, 필드 오버라이딩의 함정, HomeObject), 내장 클래스 확장과 Symbol.species, getter·setter, 프론트엔드에서 클래스를 꺼낼 때(관련 함수·데이터 묶기, 값 객체). class가 단순한 문법적 설탕이 아닌 지점(strict mode, new 강제, 열거 불가 메서드)까지."
tags: ["javascript", "oop", "frontend"]
source: mixed
date: "2026-10-17"
sources: ["https://medium.com/@junep/%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C%EC%97%90%EC%84%9C-%ED%81%B4%EB%9E%98%EC%8A%A4%EC%99%80-%EC%A6%89%EC%8B%9C-%EC%8B%A4%ED%96%89-%ED%95%A8%EC%88%98-%EC%93%B0%EA%B8%B0-315c21bb2493", "https://riverkim.kr/178", "https://riverkim.kr/256", "https://web.dev/learn/javascript/classes", "https://web.dev/learn/javascript/classes/extends", "https://web.dev/learn/javascript/classes/class-fields", "https://web.dev/learn/javascript/classes/static-initialization-blocks", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes/Static_initialization_blocks", "https://ko.javascript.info/class", "https://ko.javascript.info/class-inheritance", "https://ko.javascript.info/static-properties-methods", "https://ko.javascript.info/private-protected-properties-methods", "https://ko.javascript.info/extend-natives", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/species"]
---

> 직접 정리한 내용에 web.dev의 「[Learn JavaScript](https://web.dev/learn/javascript)」 강좌의 클래스 모듈과 javascript.info(모던 JavaScript 튜토리얼)의 클래스 글(「클래스와 기본 문법」, 「클래스 상속」, 「정적 메서드와 정적 프로퍼티」, 「private, protected 프로퍼티와 메서드」, 「내장 클래스 확장하기」)을 더해, MDN으로 확인해 보강한 노트다. 프론트엔드에서의 쓰임은 이문기의 「[프론트엔드에서 클래스와 즉시 실행 함수 쓰기](https://medium.com/@junep/%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C%EC%97%90%EC%84%9C-%ED%81%B4%EB%9E%98%EC%8A%A4%EC%99%80-%EC%A6%89%EC%8B%9C-%EC%8B%A4%ED%96%89-%ED%95%A8%EC%88%98-%EC%93%B0%EA%B8%B0-315c21bb2493)」(2023.08)를 더했다.

**class**는 같은 모양의 객체를 찍어 내기 위한 템플릿이다. 데이터, 그 데이터를 다루는 메서드를 한 블록에 묶고, 이들을 통틀어 클래스의 **멤버**라고 한다. ES5까지는 생성자 함수와 프로토타입 체인으로 구현했고, ES6(2015)에서 `class`가 도입됐다. 내부 동작은 여전히 프로토타입 기반이라 `typeof MyClass`는 `'function'`이다.

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

- `constructor`는 `new`로 인스턴스를 만들 때 호출되어 필드를 초기화하는 특수 메서드다. `new Person(...)`에 넘긴 인자가 그대로 들어온다. 클래스에 **하나만** 둘 수 있고(두 개면 SyntaxError), 생략하면 빈 constructor가 있는 것으로 본다.
- 클래스 본문 안의 `this`는 만들어지는 인스턴스다.
- 메서드는 인스턴스가 아니라 `Person.prototype`에 한 번만 정의되어 모든 인스턴스가 공유한다.
- 메서드 사이에는 쉼표를 쓰지 않는다. 객체 리터럴과 달리 쉼표를 넣으면 SyntaxError다.
- 메서드 이름 자리에 `['say' + 'Hi']()`나 `[Symbol.iterator]()`처럼 **계산된 이름**을 쓸 수 있다.
- 이름은 내장 생성자처럼 대문자로 시작한다(PascalCase). 내장 객체 이름(`Number`, `Map` 등)으로 클래스를 만들면 전역 객체를 가리게 되니 피한다.

## class 이전: 생성자 함수와 new

ES2015 이전에는 **생성자 함수**에 `new`를 붙여 같은 모양의 객체를 찍어 냈다. 인스턴스 데이터는 함수 본문에서 `this`에, 공유 메서드는 `Person.prototype`에 따로 붙였다.

```javascript
function Person(name) {
  this.name = name
}
Person.prototype.introduce = function () {
  return 'My name is ' + this.name
}
new Person('river').introduce() // 'My name is river'
```

`class`는 이 두 덩어리를 한 블록으로 묶은 문법이다. `new`가 내부에서 하는 일과 class 문법이 프로토타입 코드로 어떻게 풀리는지는 [[prototype-and-inheritance|프로토타입과 상속]]에, 생성자 함수와 팩토리 함수의 차이는 [[functions|함수와 this]]에 정리했다.

### 문법적 설탕 이상인 지점

class는 흔히 "문법적 설탕"이라 불리지만, 하위 호환 걱정 없이 새 문법을 만든 김에 옛 설계의 함정을 함께 막았다.

| 차이 | 생성자 함수 | class |
| --- | --- | --- |
| strict mode | 따로 켜야 한다 | 본문 전체가 **항상** strict mode([[strict-mode\|strict mode]]) |
| `new` 없이 호출 | 그냥 함수로 실행된다(sloppy면 전역 오염) | `TypeError` |
| 메서드 열거 | `prototype`에 대입한 메서드는 `for...in`에 나온다 | 메서드는 열거 불가 |
| 호이스팅 | 함수 선언처럼 선언 전에 쓸 수 있다 | `let`처럼 TDZ. 선언 전에 쓰면 `ReferenceError` |
| 비공개 멤버 | 클로저로 흉내 | `#private` 문법 |
| 문자열 변환 | 함수 소스 | `String(User)`가 `'class User { … }'`로 시작한다 |

이 차이는 엔진이 class로 만든 함수에 붙이는 내부 표시(`[[IsClassConstructor]]: true`)에서 나온다. `class User {…}`가 실제로 하는 일은 constructor 본문을 가진 함수 `User`를 만들고(`User === User.prototype.constructor`), 메서드를 `User.prototype`에 열거 불가로 넣는 것이다.

## 선언과 표현식

클래스도 함수처럼 **선언**과 **표현식** 두 가지로 만든다.

```javascript
class Declared {}                    // 선언: 같은 스코프에서 다시 선언하면 SyntaxError
let Expr = class {}                  // 익명 클래스 표현식
Expr = class Named {}                // 표현식은 변수에 다시 담을 수 있다
Expr.name                            // 'Named'
typeof Named                         // 'undefined', 표현식의 이름은 클래스 안에서만 보인다

function makeClass(greeting) {       // 클래스를 실행 중에 만들어 돌려준다
  return class {
    greet() { return greeting }
  }
}
```

클래스 선언은 TDZ 규칙을 따르므로 선언 줄보다 위에서 `new`하면 `Cannot access 'X' before initialization`이다. 표현식은 담긴 변수(`let`·`const`)의 규칙을 따른다.

## 클래스 필드

constructor에서 `this.x = …`로 붙이는 대신, 클래스 본문에 **필드**를 바로 선언할 수 있다(ES2022). 결과는 같다. 인스턴스마다 자기 속성이 생기고, 바깥에서 읽고 바꿀 수 있다.

```javascript
class Counter {
  count = 0               // 인스턴스 필드(기본값). 값을 안 주면 undefined
  #secret = 'hidden'      // private 필드
  static instances = 0    // 정적 필드

  constructor() {
    Counter.instances += 1
  }

  static add(a, b) {      // 정적 메서드
    return a + b
  }
}

Counter.add(1, 3)         // 4, 인스턴스 없이 클래스 이름으로 호출
new Counter().count       // 0
```

필드는 메서드와 달리 **`prototype`이 아니라 각 인스턴스에** 생긴다(`User.prototype.name`은 `undefined`). 값 자리에는 함수 호출 같은 식도 쓸 수 있고, 인스턴스를 만들 때마다 평가된다. 필드 초기화는 constructor 본문보다 먼저 실행된다(자식 클래스에서는 `super()`가 끝난 직후). 화살표 함수를 필드에 담으면 `this`가 인스턴스로 고정된 메서드가 된다. 이벤트 리스너로 넘길 때 쓰는 패턴은 [[functions|함수와 this]]에 있다.

## private 필드와 메서드

이름 앞에 `#`을 붙이면 **클래스 본문 밖에서는 접근할 수 없는** 멤버가 된다. `_name` 같은 관례와 달리 언어가 막는다.

```javascript
class Account {
  #balance = 0
  #log(msg) { console.log(msg) }   // private 메서드

  deposit(amount) {
    this.#balance += amount
    this.#log(`입금 ${amount}`)
  }
  static isAccount(obj) {
    return #balance in obj           // 이 클래스의 인스턴스인지 안전하게 확인(ES2022)
  }
}

const acc = new Account()
acc.#balance          // SyntaxError, 파싱 단계에서 거부된다
```

- private 필드는 **본문에 미리 선언**해야 한다. 선언 없이 constructor에서 `this.#x = 1`로 새로 만들 수 없다.
- 스코프가 그 클래스 본문으로 딱 묶여 있어서 **자식 클래스도 부모의 `#필드`에 접근할 수 없다.** 자식에게 열어 줄 값은 getter나 일반 메서드로 노출한다.
- 브라우저 개발자 도구 콘솔은 디버깅 편의상 `#필드`를 읽게 해 주는 경우가 있다. 콘솔에서 됐다고 코드에서 되는 것은 아니다.
- `this['#x']`나 `this[name]`처럼 **문자열로는 접근할 수 없다.** private 이름은 문법으로만 쓴다.
- 같은 이름의 public 속성과 공존할 수 있다. `#waterAmount`를 두고 `get waterAmount()`로 읽기만 열어 주는 식이다.
- 같은 목적을 함수만으로 이루는 방법은 [[scope-and-closures|스코프와 클로저]]의 클로저다.

### protected는 관례로 흉내 낸다

다른 언어의 protected(자기와 자식 클래스만 접근)는 JavaScript에 없다. 대신 **이름 앞에 `_`를 붙여 "내부용이니 클래스와 자식 밖에서는 건드리지 말라"고 약속**한다. 언어가 막지 않으므로 강제력은 없지만, 자식 클래스가 자연스럽게 물려받아 쓴다.

| | `_name` (관례) | `#name` (문법) |
| --- | --- | --- |
| 바깥 접근 | 가능하지만 하지 않기로 약속 | 불가(SyntaxError) |
| 자식 클래스 | 접근 가능 | 불가 |
| 쓰임 | 상속 계층 안에서 공유할 내부 상태 | 그 클래스만 아는 구현 세부 |

읽기 전용 속성은 setter 없이 getter만 둔다(`get power() { return this._power }`). 인자가 여러 개 필요하면 `get`·`set` 문법 대신 `setWaterAmount(value, unit)` 같은 일반 메서드가 더 유연하다. 내부와 외부 인터페이스를 나누는 이유는 [[oop-and-javascript|객체 지향 프로그래밍과 JavaScript]]의 캡슐화 절에 있다.

## static 멤버

`static`이 붙은 멤버는 인스턴스가 아니라 **클래스 자체**에 속한다. 인스턴스에서는 보이지 않고(`instance.add`는 `undefined`), `Counter.add`처럼 클래스 이름으로 쓴다. 정적 메서드 안의 `this`는 클래스 자신이다. 모든 인스턴스가 함께 참조할 설정값, 인스턴스 개수, 인스턴스끼리 비교·정렬하는 유틸리티에 쓴다. 클래스 밖에서 `Counter.helper = function () {}`로 붙여도 정적 메서드가 된다.

### 정적 팩토리 메서드

생성 전에 손질이 필요한 경우, constructor를 복잡하게 만드는 대신 **인스턴스를 만들어 돌려주는 정적 메서드**를 둔다. `Array.from`, `Object.fromEntries`가 같은 모양이다.

```javascript
class User {
  constructor(name, email) {
    this.name = name
    this.email = email
  }
  static fromJSON(obj) {
    return new this(obj.name, obj.email ?? '미입력') // this는 호출한 클래스
  }
}
User.fromJSON({ name: 'river' }) // User { name: 'river', email: '미입력' }
```

`new User` 대신 `new this`로 쓰면, `class Admin extends User`에서 `Admin.fromJSON()`을 불렀을 때 `Admin` 인스턴스가 만들어진다. 정적 메서드도 상속되고, 그 안의 `this`는 점 앞의 클래스이기 때문이다.

### 정적 초기화 블록

`static { … }` 블록은 정적 필드를 **여러 문장의 로직으로** 초기화한다(ES2022, 2023년 3월부터 모든 주요 브라우저에서 쓸 수 있다). 인스턴스를 만들 때가 아니라 **클래스가 처음 평가될 때 한 번** 실행된다.

```javascript
class Config {
  static defaults = { theme: 'light' }
  static merged
  static {
    // this는 클래스 자신. try/catch 같은 문도 쓸 수 있다
    try {
      this.merged = { ...this.defaults, ...JSON.parse(localStorage.getItem('config')) }
    } catch {
      this.merged = this.defaults
    }
  }
}
```

- 한 클래스에 여러 개 둘 수 있고, 정적 필드와 함께 **적힌 순서대로** 실행된다. 블록보다 아래에 선언한 정적 필드는 블록 안에서 아직 `undefined`다.
- 블록 안의 `var`·함수 선언도 블록 밖으로 새지 않는다.
- 클래스 본문 안이라 `#private` 멤버에 접근할 수 있다. 같은 파일의 다른 코드에만 private 값을 읽는 함수를 넘겨줄 때 쓰기도 한다.

## extends: 상속

`class Child extends Parent`는 Parent를 **기반 클래스(base class)** 로, Child를 **파생 클래스(derived class)** 로 만든다. 내부적으로 `Object.getPrototypeOf(Child) === Parent`이고, `Child.prototype`의 프로토타입이 `Parent.prototype`이다.

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
  sayMother() {
    return `${super.sayMother()}, said my mom` // 오버라이딩한 뒤 부모 구현 호출
  }
}

Child.family          // 'Kim', 정적 멤버도 상속된다
Child.sayFamily()     // 'We are the Kims'
const child = new Child()
child.mother          // 'mother', 인스턴스 필드
```

- 자식 클래스는 부모의 **정적 멤버**와 **인스턴스 멤버**를 모두 물려받는다(`#private`만 예외다).
- 같은 이름의 메서드를 다시 정의하면 오버라이딩되고, 부모 쪽 구현은 `super.method()`로 부른다.
- 자식이 constructor를 **생략하면** 받은 인자를 그대로 `super(...args)`에 넘기는 constructor가 자동으로 생긴다. constructor를 **쓰면** `this`를 건드리기 전에 `super()`를 불러야 한다. 안 그러면 `ReferenceError`다.
- `super()`가 필수인 이유: 기반 클래스는 `new` 때 빈 객체를 만들어 `this`로 주지만, 파생 클래스의 constructor(`[[ConstructorKind]]: "derived"`)는 **그 일을 부모 constructor에 맡긴다.** `super()`를 부르기 전에는 `this`가 될 객체 자체가 없다.
- `extends` 뒤에는 **식**이 와도 된다. `class User extends makeBase('Hello') {}`처럼 함수가 돌려준 클래스를 상속할 수 있어, 조건에 따라 부모를 고르거나 믹스인을 만든다([[js-design-patterns|JavaScript 디자인 패턴]]).
- 화살표 함수에는 자기 `super`가 없어서, 메서드 안의 `setTimeout(() => super.stop(), 1000)`은 메서드의 `super`를 쓴다. 일반 함수로 쓰면 SyntaxError다.

### 필드 오버라이딩의 함정

부모 constructor가 **자식이 다시 선언한 필드**를 읽으면 자식 값이 아니라 부모 값이 보인다. 메서드 오버라이딩과 동작이 다르다.

```javascript
class Animal {
  name = 'animal'
  constructor() { console.log(this.name, this.kind()) }
  kind() { return 'animal' }
}
class Rabbit extends Animal {
  name = 'rabbit'
  kind() { return 'rabbit' }
}
new Rabbit() // 'animal' 'rabbit', 필드는 부모 값, 메서드는 자식 것
```

원인은 초기화 순서다. 기반 클래스의 필드는 constructor 실행 전에, **파생 클래스의 필드는 `super()`가 끝난 뒤에** 초기화된다. 부모 constructor가 도는 동안 자식 필드는 아직 없다. 부모 constructor에서 쓸 값이라면 필드 대신 메서드나 getter로 오버라이딩한다.

### super와 `[[HomeObject]]`

`super.method()`는 `this`의 프로토타입을 따라가는 방식으로는 구현할 수 없다. `this`는 항상 맨 아래 객체라서, 3단계 상속에서 중간 메서드가 `this.__proto__.method.call(this)`를 부르면 자기 자신을 다시 불러 무한 재귀에 빠진다. 그래서 메서드는 **자기가 정의된 객체를 내부 속성 `[[HomeObject]]`로 기억**하고, `super`는 `[[HomeObject]]`의 프로토타입에서 부모 메서드를 찾는다.

- 클래스뿐 아니라 객체 리터럴의 메서드도 `super`를 쓸 수 있다. 단 `eat() {}` **메서드 단축 문법**으로 정의해야 `[[HomeObject]]`가 생긴다. `eat: function () {}`에서 `super`를 쓰면 SyntaxError다.
- `[[HomeObject]]`는 바꿀 수 없다. `super`를 쓰는 메서드를 다른 객체로 복사하면, 복사본은 여전히 **원래 객체의 부모**를 부른다. `super`를 쓰지 않는 메서드는 이 제약이 없어 자유롭게 복사할 수 있다.

## 내장 클래스 확장하기

`Array`·`Map`·`Error` 같은 내장 클래스도 `extends`로 확장한다. 커스텀 에러가 대표적이다([[js-error-handling|에러 처리]]).

```javascript
class PowerArray extends Array {
  isEmpty() { return this.length === 0 }
}
const arr = new PowerArray(1, 2, 5, 10)
arr.filter((x) => x > 3).isEmpty() // false, filter 결과도 PowerArray다
```

- `map`·`filter`·`slice` 같은 메서드는 결과 배열을 만들 때 `arr.constructor`를 따라가므로 결과도 하위 클래스 인스턴스가 된다. 정적 getter `static get [Symbol.species]() { return Array }`를 두면 결과를 일반 `Array`로 만들게 바꿀 수 있다. `Map`·`Set`·`Promise`도 같은 장치를 쓴다.
- ES2023의 `toSorted`·`toReversed`·`toSpliced`·`with`는 `Symbol.species`를 보지 않고 **항상 일반 `Array`** 를 돌려준다.
- 내장 클래스끼리는 **정적 메서드를 물려받지 않는다.** `Array.prototype`은 `Object.prototype`을 상속하지만 `Array` 자체는 `Object`를 상속하지 않아 `Array.keys`가 없다. `extends`로 만든 클래스는 정적 메서드까지 상속하는 것과 다른 점이다.

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
- getter·setter는 인스턴스가 아니라 `prototype`에 접근자 속성으로 정의되어 모든 인스턴스가 공유한다([[property-descriptors|속성 설명자]]).
- getter만 두고 setter를 두지 않으면 읽기 전용이 된다. class 본문은 strict mode라 대입하면 `TypeError`다.

## 프론트엔드에서 클래스를 꺼낼 때

프론트엔드 코드는 대부분 함수와 컴포넌트로 짜지만, 다음 두 경우에는 클래스가 낫다.

### 관련 함수와 데이터가 함께 불어날 때

상품 옵션처럼 원본 데이터 하나(`options`)를 두고 `getOption`, `getOptionToActivate`, `getAdditionalPrice` 같은 함수가 서로를 부르며 늘어나는 경우다. 이 함수들은 범용 유틸이 아니라 **이 문맥에서만 쓰이고**, 이벤트 핸들러가 원본 데이터를 직접 만지면 위험하다(실수로 바꾸면 원본을 다시 받으려고 API를 또 불러야 한다).

```javascript
class Options {
  #options

  constructor(options) {
    this.#options = options
  }

  #getOption(selectionId) { /* … */ }

  getOptionToActivate(selectionId) { /* #getOption 사용 */ }
  getAdditionalPrice(selectionId) { /* #getOption 사용 */ }
}
```

- 원본 데이터와 내부 헬퍼를 `#private`로 숨겨 바깥에서 실수로 건드릴 수 없다. 내부가 바뀌어도 살펴볼 범위가 좁다.
- `getAdditionalPrice`라는 모호한 이름이 `options.getAdditionalPrice`가 되어 **어떤 문맥의 함수인지** 드러난다.
- 관련 함수와 공유 값을 더할 자리가 생기고, 단위 테스트를 쓰기 쉬워진다.

처음부터 객체와 협력을 설계하는 것이 정석이지만, 프론트엔드에서는 함수로 쓰다가 이런 신호가 보일 때 클래스로 묶는 경우가 더 흔하다.

### 값 객체

언어가 주는 타입(`Date`, `number`)만으로는 도메인 규칙을 담기 어려울 때 타입을 확장해 **값으로** 쓰는 클래스가 **값 객체(value object)**다. 이벤트 마감일을 `Date` 대신 `EventDate`로 표현하면, 그 값에 딸린 계산(`canShowBanner()`)이 한곳에 모이고 이름 자체가 문맥을 설명한다.

```javascript
class EventDate {
  #lastDate
  #offset

  constructor(lastDate, offset = 0) {
    this.#lastDate = lastDate
    this.#offset = offset
  }

  canShowBanner(agreedToTerms, now = new Date()) {
    return agreedToTerms && now < this.#lastDate - this.#offset
  }

  isEqual(other) {
    return this.#lastDate.getTime() === other.#lastDate.getTime() && this.#offset === other.#offset
  }
}
```

| 규칙 | 이유 |
| --- | --- |
| **setter를 두지 않는다(불변)** | `10 === 20`이 중간 로직을 거친 뒤 `true`가 되면 코드를 믿을 수 없다. 값을 바꾸려면 새 인스턴스를 만든다 |
| **같은 타입끼리 비교 메서드를 둔다** | `isEqual`, `isLaterThan`처럼 값으로 비교한다. `===`는 참조를 비교하므로 쓰지 않는다 |
| **비교가 거짓이면 다른 값이다** | 식별자가 아니라 속성 값이 같은지로 같음을 정한다 |

## 핵심 정리

- `class` = 프로토타입 기반 객체 생성 문법이다. 다만 strict mode·`new` 강제·TDZ·열거 불가 메서드·`#private`처럼 생성자 함수에 없는 안전장치가 있다.
- 선언은 재선언할 수 없고 TDZ에 놓인다. 표현식은 익명으로도 만들고 변수에 다시 담을 수 있다.
- `constructor`는 하나, 자식 constructor에서는 `super()`를 먼저 호출한다. 생략하면 인자를 그대로 넘긴다.
- 필드는 본문에 선언하는 인스턴스 속성이다. `#`은 클래스 본문 밖(자식 포함)에서 접근할 수 없다.
- `static`은 클래스 자체의 멤버다. 생성 로직은 정적 팩토리 메서드(`new this`)로, 복잡한 정적 초기화는 `static {}` 블록으로.
- 파생 클래스는 `this`를 부모 constructor에게서 받으므로 `super()`가 먼저다. 자식 필드는 그 뒤에 초기화되어 부모 constructor에서는 보이지 않는다.
- `super`는 메서드가 기억하는 `[[HomeObject]]`로 부모를 찾는다. `super`를 쓰는 메서드는 다른 객체로 복사하면 원래 부모를 부른다.
- protected는 `_` 관례, private은 `#` 문법이다. 내장 클래스도 확장할 수 있고 결과 타입은 `Symbol.species`가 정한다.
- `get`/`set`은 속성처럼 쓰는 함수이고 프로토타입에 산다.

관련 노트: [[prototype-and-inheritance|프로토타입과 상속]], [[functions|함수와 this]], [[property-descriptors|속성 설명자]], [[oop-and-javascript|객체 지향 프로그래밍과 JavaScript]], [[ecmascript-tc39|ECMAScript 표준과 TC39 프로세스]], [[js-error-handling|에러 처리: try...catch와 커스텀 에러]], [[js-design-patterns|JavaScript 디자인 패턴]]
