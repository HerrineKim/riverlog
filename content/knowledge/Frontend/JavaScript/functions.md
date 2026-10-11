---
title: "함수와 this"
concept: "Function"
summary: "함수 선언식과 표현식, 화살표 함수, rest·spread 연산자, 호출 방식에 따라 달라지는 this와 bind."
tags: ["javascript", "function", "frontend"]
source: til
---

JavaScript의 함수는 **일급 객체(first-class citizen)** 다. 변수에 할당할 수 있고, 다른 함수의 인자로 넘길 수 있고, 함수의 반환값이 될 수 있다. 이 성질 덕분에 콜백, 고차 함수, React 컴포넌트 같은 패턴이 가능하다. 함수 안의 `this`는 함수를 **어떻게 호출했는지**에 따라 달라진다.

## 함수 선언식과 표현식

```javascript
// 선언식(declaration): 이름과 함께 정의
function add(num1, num2) {
  return num1 + num2
}

// 표현식(expression): 함수를 값으로 만들어 변수에 할당
const sub = function (num1, num2) {
  return num1 - num2
}
```

| 구분 | 선언식 | 표현식 |
| --- | --- | --- |
| 익명 함수 | 불가 | 가능(이름 생략) |
| 호이스팅 | 됨 — 선언 전에 호출 가능 | 변수 규칙을 따름 — 선언 전 호출 시 에러 |
| 타입 | `function` | `function` |

```javascript
add(2, 7) // 9 — 선언식은 호이스팅된다
function add(a, b) { return a + b }

sub(7, 2) // ReferenceError: Cannot access 'sub' before initialization
const sub = function (a, b) { return a - b }
```

Airbnb 스타일 가이드는 예측 가능성 때문에 표현식을 권장한다.

## 매개변수

### 기본값

```javascript
const greeting = function (name = 'Anonymous') {
  return `Hi ${name}`
}
greeting() // 'Hi Anonymous'
```

### 매개변수와 인자 개수 불일치 허용

```javascript
const twoArgs = function (a, b) { return [a, b] }
twoArgs(1, 2, 3) // [1, 2] — 남는 인자는 무시

const threeArgs = function (a, b, c) { return [a, b, c] }
threeArgs(1) // [1, undefined, undefined] — 모자란 인자는 undefined
```

### rest와 spread (`...`)

같은 `...` 기호지만 위치에 따라 역할이 반대다.

```javascript
// rest: 남은 인자들을 배열로 모은다 (Python의 *args와 유사)
const restOpr = function (arg1, arg2, ...restArgs) {
  return [arg1, arg2, restArgs]
}
restOpr(1, 2, 3, 4, 5) // [1, 2, [3, 4, 5]]
restOpr(1, 2)          // [1, 2, []] — 넘어온 인자가 없으면 빈 배열

// spread: 배열을 펼쳐 개별 인자로 전달한다
const spreadOpr = function (a, b, c) {
  return a + b + c
}
const numbers = [1, 2, 3]
spreadOpr(...numbers) // 6
```

## 화살표 함수

```javascript
const double = function (num) { return num * 2 }

const double2 = (num) => { return num * 2 } // function 키워드 생략
const double3 = num => num * 2               // 매개변수가 하나면 () 생략, 본문이 표현식 하나면 {}와 return 생략
const makeObj = () => ({ key: 'value' })     // 객체를 바로 반환할 때는 ()로 감싼다
```

화살표 함수는 자기만의 `this`를 가지지 않고, **바깥 스코프의 this**를 그대로 쓴다. 그래서 콜백 안에서 this가 바뀌는 문제를 피할 때 유용하지만, 객체의 메서드로 쓰면 this가 그 객체를 가리키지 않는다.

## this

`this`는 함수가 정의된 위치가 아니라 **호출된 방식(실행 문맥)** 에 따라 결정된다.

| 호출 방식 | this |
| --- | --- |
| 메서드 호출 `obj.method()` | 메서드를 호출한 객체 |
| 생성자·클래스 `new Foo()` | 새로 만들어지는 객체(Python의 `self`) |
| 일반 함수 호출 `fn()` | 브라우저에서는 전역 객체 `window` (strict mode에서는 `undefined`) |
| 화살표 함수 | 바깥 스코프의 this |

```javascript
function getFullName() {
  return this.firstName + this.lastName
}

const me = { firstName: 'John', lastName: 'Doe', getFullName }
const you = { firstName: 'Jack', lastName: 'Lee', getFullName }

me.getFullName()  // 'JohnDoe' (this === me)
you.getFullName() // 'JackLee' (this === you)
getFullName()     // NaN (this === window, undefined + undefined)
```

객체 리터럴 안에서 메서드가 아닌 속성 값으로 `this`를 쓰면 그 객체를 가리키지 않는다.

```javascript
const person = {
  firstName: 'John',
  lastName: 'Doe',
  fullName: this.firstName + this.lastName, // ✗ 여기 this는 바깥(window) → NaN
  getFullName() {
    return this.firstName + this.lastName   // ✓ 메서드 안의 this는 person
  },
}
```

## bind

객체의 메서드를 다른 곳(콜백, `setTimeout`, 이벤트 핸들러)에 넘기면 호출 방식이 바뀌어 `this`를 잃는다. `bind`는 this(와 앞쪽 인자)를 **고정한 새 함수**를 만든다.

```javascript
// func.bind(thisArg[, arg1[, arg2[, ...]]])
const user = {
  firstName: 'John',
  sayHi() {
    console.log(`Hello, ${this.firstName}!`)
  },
}

setTimeout(user.sayHi, 1000) // 'Hello, undefined!' — this를 잃음

const sayHi = user.sayHi.bind(user)
setTimeout(sayHi, 1000)      // 'Hello, John!'
```

인자를 미리 채워 두는 용도로도 쓴다. React Native 예제에서 목록 아이템을 누르면 해당 id로 삭제 함수를 부르게 할 때 `onPress={props.onDeleteItem.bind(this, props.id)}`처럼 사용했다. 같은 일을 화살표 함수로 `onPress={() => props.onDeleteItem(props.id)}`처럼 쓸 수도 있다.

## 핵심 정리

- 함수는 값이다(일급 객체). 선언식만 호이스팅된다.
- `...`은 매개변수 자리에서는 모으고(rest), 호출·리터럴 자리에서는 펼친다(spread).
- `this`는 호출 방식이 결정한다. 메서드로 부르면 그 객체, 그냥 부르면 전역(또는 undefined).
- 화살표 함수는 바깥 this를 쓰고, `bind`는 this를 고정한다.
