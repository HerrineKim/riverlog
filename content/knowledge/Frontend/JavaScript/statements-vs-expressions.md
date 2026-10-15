---
title: "문(Statement)과 식(Expression)"
concept: "Statement vs Expression"
summary: "식은 값을 만들어 내는 코드이고, 문은 무언가를 하라는 명령이다. 문에는 식을 끼우는 자리가 있고, 식은 늘 어떤 문 안에 있다. 함수 인자, 화살표 함수의 간결한 본문, JSX의 중괄호는 식만 받는 자리라서 if·for 대신 삼항 연산자·map을 쓴다."
tags: ["javascript", "frontend", "react", "jsx"]
source: other
date: "2026-10-14"
sources: ["https://www.joshwcomeau.com/javascript/statements-vs-expressions/"]
---

> Josh W. Comeau의 「[Statements Vs. Expressions](https://www.joshwcomeau.com/javascript/statements-vs-expressions/)」(2025.08 갱신)를 바탕으로 재구성한 노트다.

## 식과 문

| 구분 | 정의 | 예 |
| --- | --- | --- |
| 식(expression) | **값을 만들어 내는** 코드 | `1`, `"hello"`, `5 * 10`, `num > 100`, `ok ? "🙂" : "🙁"`, `[1, 2, 3].pop()` |
| 문(statement) | 컴퓨터에 **무언가를 하라는 명령**. 프로그램은 문의 나열이다 | `let hi = 5;`, `if (...) {}`, `for (...) {}`, `throw new Error()`, `return x;` |

**문은 프로그램의 뼈대이고, 식은 그 안의 빈칸을 채운다.** 문에는 식을 끼우는 자리(slot)가 있다.

```js
let hi = /* 식 */;
return /* 식 */;
if (/* 식 */) { }
while (/* 식 */) { }
```

문법상 식끼리는 서로 바꿔 끼울 수 있다. 식 자리에 어떤 식을 넣어도 문법 오류는 나지 않는다. `while ("hello") {}`도 문법은 맞다(무한 루프일 뿐이다).

식은 다른 식을 품을 수 있다. `num > 100 ? a * 2 : b`에는 `num`, `100`, `num > 100`, `a`, `2`, `a * 2`, `b`, 그리고 전체 삼항식까지 여러 식이 겹쳐 있다.

## 식은 혼자 있을 수 없다

파일에 `1 + 2 + 3`만 적어도 프로그램은 돌아간다. 이때 식이 문이 된 것이 아니라, **식 자리 하나만 있는 빈 문(expression statement)**이 식을 감싼 것이다. 투명 랩으로 샌드위치를 싼 것처럼 추가 글자 없이 감쌀 뿐, 식과 문은 다른 것이다.

```js
data.forEach((item) => console.log(item)); // for문은 없지만, 이 줄 전체가 식 문이다
```

세미콜론은 문의 끝을 표시한다. `if`, `while`, 함수 선언처럼 블록으로 끝나는 문은 세미콜론이 필요 없다.

## 구분하는 요령: console.log에 넣어 본다

```js
console.log(/* 의심 가는 코드 */);
```

실행되면 식이고, 문법 오류가 나면 문(또는 잘못된 코드)이다. **함수 인자는 모두 식이어야 하기** 때문이다. 덤으로 그 식이 무슨 값이 되는지도 출력된다.

## 같은 모양, 다른 해석

문이 시작되는 자리에서는 같은 글자도 문으로 해석된다.

| 코드 | 문 자리에서 | 식으로 쓰려면 |
| --- | --- | --- |
| `function f() {}` | 함수 선언문(호이스팅됨) | `const f = function () {}`(함수 표현식) |
| `{ a: 1 }` | 블록 + 레이블 `a` | `({ a: 1 })`처럼 괄호로 감싼다 |
| `function () {}()` | 문법 오류 | `(function () {})()`(IIFE) |

화살표 함수의 간결한 본문도 식 자리다. 객체를 바로 반환하려면 괄호로 감싼다.

```js
const toItem = (id) => ({ id, done: false }); // 괄호가 없으면 { }가 함수 본문 블록이 된다
```

## React에서: JSX 중괄호는 식 자리

JSX의 `{ }`는 **식 자리 하나를 여는 것**이다. 그래서 문인 `if`·`for`는 넣을 수 없다.

```jsx
// 🚫 SyntaxError: if는 문이다
<div>{if (seconds > 0) { `${seconds}초 남음` } else { "시간 종료" }}</div>

// ✅ 삼항 연산자는 식이다
<div>{seconds > 0 ? `${seconds}초 남음` : "시간 종료"}</div>
```

| 하고 싶은 것 | 문 (JSX 밖에서) | 식 (JSX 안에서) |
| --- | --- | --- |
| 조건 분기 | `if` / `else` | `조건 ? A : B`, `조건 && A` |
| 반복 | `for`, `for...of` | `items.map(...)` |
| 계산 | 변수 선언 | 함수 호출 |

이것은 React의 임의 규칙이 아니라 **JavaScript의 제약**이다. JSX는 `React.createElement(...)`(지금은 `jsx(...)`) 호출, 즉 함수 호출로 바뀌고, 중괄호 안의 내용은 그 함수의 인자가 된다. 인자는 식이어야 한다. 컴포넌트가 최상위 요소를 하나만 반환해야 하는 규칙도 같은 이유다. `return` 뒤의 식 자리에는 값 하나만 들어간다.

## 정리

- 식은 값을 만들고, 문은 명령한다. 프로그램은 문의 나열이다.
- 문에는 식 자리가 있고, 식은 늘 어떤 문(최소한 빈 식 문) 안에 있다.
- 함수 인자, 화살표 함수의 간결한 본문, JSX 중괄호, `return` 뒤는 식만 받는다.
- 헷갈리면 `console.log()`에 넣어 본다.

**JSX에서 막히는 규칙 상당수는 "여기는 식 자리다"로 설명된다.**

관련 노트: [[operators-and-control-flow|연산자와 제어문]], [[functions|함수와 this]], [[jsx|JSX와 엘리먼트 렌더링]], [[conditional-rendering|조건부 렌더링]], [[lists-and-keys|리스트와 Key]]
