---
title: "문(Statement)과 식(Expression)"
concept: "Statement vs Expression"
summary: "식은 값을 만들어 내는 코드이고, 문은 무언가를 하라는 명령이다. 문에는 식을 끼우는 자리가 있고, 식은 늘 어떤 문 안에 있다. 블록 문과 그룹 연산자, 세미콜론과 자동 세미콜론 삽입(ASI) 규칙과 함정. 함수 인자, 화살표 함수의 간결한 본문, JSX의 중괄호는 식만 받는 자리라서 if·for 대신 삼항 연산자·map을 쓴다."
tags: ["javascript", "frontend", "react", "jsx"]
source: other
date: "2026-10-21"
sources: ["https://www.joshwcomeau.com/javascript/statements-vs-expressions/", "https://wesbos.com/javascript/01-the-basics/variables-and-statements", "https://web.dev/learn/javascript/introduction", "https://web.dev/learn/javascript/appendix", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Lexical_grammar", "https://ko.javascript.info/structure", "https://ko.javascript.info/javascript-specials", "https://bakyeono.net/post/2018-01-19-javascript-use-semicolon-or-not.html", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%ED%91%9C%ED%98%84%EC%8B%9D%EA%B3%BC%20%EB%AC%B8.md"]
---

> Josh W. Comeau의 「[Statements Vs. Expressions](https://www.joshwcomeau.com/javascript/statements-vs-expressions/)」(2025.08 갱신)를 바탕으로 재구성하고, Wes Bos의 「Beginner JavaScript」 강의 노트(wesbos.com/javascript)와 web.dev의 「[Learn JavaScript](https://web.dev/learn/javascript)」 강좌(소개·부록 모듈), javascript.info(모던 JavaScript 튜토리얼)의 「코드 구조」, 「기본 문법 요약」 글을 함께 참고했다. 세미콜론 논쟁은 「[자바스크립트, 세미콜론을 써야 하나 말아야 하나](https://bakyeono.net/post/2018-01-19-javascript-use-semicolon-or-not.html)」를 바탕으로 더했다. 「[Frontend_TIL: 표현식과 문](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Javascript/%ED%91%9C%ED%98%84%EC%8B%9D%EA%B3%BC%20%EB%AC%B8.md)」을 바탕으로 보강했다.

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

여러 문을 중괄호로 묶은 것을 **블록 문(block statement)** 이라 한다. 문법상 문이 하나만 올 자리(`if (…)` 뒤, `for (…)` 뒤)에 여러 문을 넣게 해 주고, `let`·`const`의 스코프 경계가 된다.

식은 다른 식을 품을 수 있다. `num > 100 ? a * 2 : b`에는 `num`, `100`, `num > 100`, `a`, `2`, `a * 2`, `b`, 그리고 전체 삼항식까지 여러 식이 겹쳐 있다.

## 식은 혼자 있을 수 없다

파일에 `1 + 2 + 3`만 적어도 프로그램은 돌아간다. 이때 식이 문이 된 것이 아니라, **식 자리 하나만 있는 빈 문(expression statement)**이 식을 감싼 것이다. 투명 랩으로 샌드위치를 싼 것처럼 추가 글자 없이 감쌀 뿐, 식과 문은 다른 것이다.

```js
data.forEach((item) => console.log(item)); // for문은 없지만, 이 줄 전체가 식 문이다
```

세미콜론은 문의 끝을 표시한다. `if`, `while`, 함수 선언처럼 블록으로 끝나는 문은 세미콜론이 필요 없고, 붙여도 빈 문으로 무시될 뿐 에러는 아니다.

### 자동 세미콜론 삽입(ASI)

세미콜론을 생략하면 파서가 **자동 세미콜론 삽입(ASI, Automatic Semicolon Insertion)** 으로 넣어 준다. ASI는 너그러운 문법이 아니라 **오류 복구 규칙**이다. 파서가 문법상 올 수 없는 토큰을 만났을 때, 다음 조건 중 하나면 그 토큰 앞에 세미콜론이 있었던 것으로 보고 다시 읽는다.

| 조건 | 예 |
| --- | --- |
| 그 토큰과 앞 토큰 사이에 줄바꿈이 있다 | `let a = 1⏎a + 2` |
| 그 토큰이 `}`다 | `{ a = 1 }` |
| 앞 토큰이 `)`이고, 넣을 세미콜론이 `do…while`을 끝내는 자리다 | `do {} while (x) next()` |
| 입력(파일)의 끝 | 마지막 줄 |

그래서 함정은 두 방향으로 생긴다.

- **이어 붙여 읽는 경우**: 다음 줄이 앞 줄에 이어져도 문법이 맞으면 세미콜론이 들어가지 않는다. 줄이 `+`처럼 끝나지 않은 식으로 끝나면 의도대로 이어진다(`alert(3 +⏎1⏎+ 2)`는 `6`). 문제는 의도와 달리 이어질 때다. 다음 줄이 `(`, `[`, `` ` ``, `+`, `-`, `/`로 시작하면 앞 줄과 하나의 식이 된다(`a⏎[1, 2].forEach(…)`는 `a[1, 2].forEach(…)`). 세미콜론 없는 스타일에서는 그런 줄 앞에 `;`를 붙인다(`;[a, b] = [b, a]`).
- **끊어 읽는 경우**: `return`, `break`, `continue`, `throw`, `yield`, 후위 `++`·`--` 앞뒤의 정해진 자리에 줄바꿈이 오면 무조건 세미콜론이 들어간다. `return` 바로 뒤에서 줄을 바꾸고 객체를 쓰면 `undefined`가 반환되고, `throw` 뒤에서 줄을 바꾸면 SyntaxError다.
- 한 줄에 두 문을 쓰면 ASI가 끼어들 줄바꿈이 없으므로 직접 세미콜론으로 나눠야 한다(`let a = 2 a + 3`은 SyntaxError).

세미콜론을 쓸지 말지는 오래된 논쟁이다.

| 관점 | 근거 |
| --- | --- |
| 쓴다 | ASI 규칙을 다 외우기 어렵다. 명시해 두면 읽는 사람이 규칙을 몰라도 된다. 언어에 새 문법이 들어올 때 생략 스타일이 새 함정을 만날 수 있다고 TC39가 경고한 적이 있다 |
| 생략한다 | 실제로 지킬 규칙은 「`(`·`[`·`` ` ``로 시작하는 줄 앞에 `;`」 하나뿐이다. `return` 줄바꿈 함정은 세미콜론을 써도 똑같이 생긴다. 문제는 세미콜론이 아니라 **줄을 어디서 바꾸느냐**다 |

어느 쪽이든 **사람이 기억하지 말고 도구에 맡긴다.** Prettier가 고른 스타일로 일관되게 맞추고(`semi: false`면 필요한 곳에 `;`를 앞에 붙여 준다), ESLint의 `no-unexpected-multiline`이 의도치 않게 이어진 줄을 잡는다([[eslint-prettier|ESLint와 Prettier 설정]]).

### 공백과 대소문자

공백(스페이스·탭)과 줄바꿈은 **토큰을 구분할 때만** 의미가 있다. `let x`는 토큰 둘이지만 `letx`는 식별자 하나다. 토큰 사이 공백의 양은 결과에 영향이 없어서, 배포용 빌드는 공백을 모두 지우는 압축(minify)을 한다. 들여쓰기 규칙은 읽는 사람을 위한 팀 관례다. 반면 JavaScript는 HTML·CSS 대부분과 달리 **대소문자를 완전히 구분한다.** `console.Log`는 `TypeError`, `myvariable`과 `myVariable`은 다른 이름이다.

## 구분하는 요령: console.log에 넣어 본다

```js
console.log(/* 의심 가는 코드 */);
```

실행되면 식이고, 문법 오류가 나면 문(또는 잘못된 코드)이다. **함수 인자는 모두 식이어야 하기** 때문이다. 덤으로 그 식이 무슨 값이 되는지도 출력된다.

문 중에도 **식인 문**이 있다. 대입문 `x = 100`은 대입한 값으로 평가되는 식이라 `const foo = x = 100`처럼 다른 식 자리에 들어간다. 선언문 `var x`나 `if`문은 값이 되지 않아 그 자리에 넣으면 SyntaxError다. 브라우저 콘솔에서 식이 아닌 문을 실행하면 `undefined`가 찍히는데, 이것은 문의 **완료값(completion value)** 일 뿐 그 문이 `undefined`로 평가되는 식이라는 뜻은 아니다.

## 같은 모양, 다른 해석

문이 시작되는 자리에서는 같은 글자도 문으로 해석된다.

| 코드 | 문 자리에서 | 식으로 쓰려면 |
| --- | --- | --- |
| `function f() {}` | 함수 선언문(호이스팅됨) | `const f = function () {}`(함수 표현식) |
| `{ a: 1 }` | 블록 + 레이블 `a` | `({ a: 1 })`처럼 괄호로 감싼다 |
| `function () {}()` | 문법 오류 | `(function () {})()`(IIFE) |

괄호 `( )`는 여기서 **그룹 연산자**다. 안의 내용을 하나의 식으로 묶어 먼저 평가하므로, 문으로 읽힐 코드를 식 자리로 옮기는 데도 쓰이고 `(2 + 2) * 4`처럼 연산 순서를 바꾸는 데도 쓰인다.

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
- ASI는 오류 복구다. `(`·`[`·`` ` ``로 시작하는 줄과 `return` 뒤 줄바꿈을 조심한다.

**JSX에서 막히는 규칙 상당수는 "여기는 식 자리다"로 설명된다.**

관련 노트: [[operators-and-control-flow|연산자와 제어문]], [[functions|함수와 this]], [[js-comments|JavaScript의 네 가지 주석]], [[jsx|JSX와 엘리먼트 렌더링]], [[conditional-rendering|조건부 렌더링]], [[lists-and-keys|리스트와 Key]]
