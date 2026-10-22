---
title: "JSON: stringify와 parse"
concept: "JSON"
summary: "JSON은 언어와 무관한 데이터 교환용 텍스트 형식이다. 문법 규칙(큰따옴표, 주석 없음), JSON.stringify가 빠뜨리거나 바꾸는 값(undefined·함수·Symbol·NaN·Date·Map)과 순환 참조·BigInt 오류, replacer·space·toJSON으로 직렬화를 조절하는 법, JSON.parse의 reviver로 Date를 되살리는 법, 큰 정수를 지키는 source 접근과 JSON.rawJSON, 깊은 복사용으로는 structuredClone을 쓰는 이유까지 정리한다."
tags: ["javascript", "frontend", "api", "data-structure"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/json", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/stringify", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/rawJSON", "https://www.rfc-editor.org/rfc/rfc8259", "https://wormwlrm.github.io/2019/12/04/Why-JSON-parse-is-faster-than-object-literal.html"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「JSON과 메서드」 글을 바탕으로, 이후 추가된 기능은 MDN으로 확인해 재구성한 노트다. 파싱 속도 비교는 「[왜 JSON.parse로 객체를 선언하는 방법이 더 빠를까?](https://wormwlrm.github.io/2019/12/04/Why-JSON-parse-is-faster-than-object-literal.html)」를 바탕으로 더했다.

## JSON이란

**JSON(JavaScript Object Notation)은 값을 텍스트로 적는 언어 독립적인 데이터 형식이다.** JavaScript 객체 리터럴에서 왔지만 지금은 RFC 8259와 ECMA-404로 따로 표준화되어 거의 모든 언어가 읽고 쓴다. 객체를 네트워크로 보내거나 저장소에 넣으려면 먼저 문자열로 바꿔야 하는데, 이것을 **직렬화(serialize)**, 되돌리는 것을 **역직렬화(deserialize)** 라 한다.

| 메서드 | 방향 |
| --- | --- |
| `JSON.stringify(value, replacer?, space?)` | 값 → JSON 문자열 |
| `JSON.parse(text, reviver?)` | JSON 문자열 → 값 |

## 문법 규칙

JSON은 객체 리터럴보다 엄격하다. 파서를 단순하고 빠르게 만들기 위해서다.

| 규칙 | 객체 리터럴에서는 되지만 JSON에서는 안 되는 것 |
| --- | --- |
| 키는 **큰따옴표 문자열** | `{ name: 1 }`, `{ 'name': 1 }` |
| 문자열 값도 **큰따옴표** | `'Smith'`, `` `Smith` `` |
| 값은 객체·배열·문자열·숫자·`true`·`false`·`null`만 | `undefined`, `NaN`, `Infinity`, `new Date()`, 함수 |
| 주석 없음 | `// 설명` |
| 끝 쉼표 없음 | `[1, 2,]` |

주석과 끝 쉼표를 허용하는 확장 형식(JSON5, VS Code 설정의 JSONC)은 표준 JSON이 아니라 각자의 파서가 필요하다. 형식을 벗어난 문자열을 `JSON.parse`에 넘기면 `SyntaxError`를 던지므로 외부 입력은 `try...catch`로 감싼다.

## JSON.stringify가 하는 일

```javascript
JSON.stringify({ name: 'John', courses: ['html'], wife: null })
// '{"name":"John","courses":["html"],"wife":null}'
JSON.stringify('hi')  // '"hi"': 원시값도 된다
```

중첩 객체·배열은 재귀적으로 따라 들어간다. 다만 JSON에 없는 값은 버리거나 바꾼다.

| 값 | 객체 속성일 때 | 배열 요소일 때 |
| --- | --- | --- |
| `undefined`, 함수, Symbol 값 | **속성째 빠진다** | `null` |
| Symbol **키** 속성 | 빠진다 | - |
| `NaN`, `Infinity` | `null` | `null` |
| `Date` | `toJSON()`이 만든 ISO 문자열 | 같다 |
| `Map`, `Set` | `{}`(내용이 사라진다) | 같다 |
| `BigInt` | **`TypeError`** | 같다 |
| 순환 참조 | **`TypeError: Converting circular structure to JSON`** | 같다 |
| 열거 불가 속성, 프로토타입의 속성 | 빠진다 | - |

그래서 `JSON.stringify` 왕복은 데이터를 조용히 잃는다. Date는 문자열이 되어 돌아오고, `undefined` 값을 가진 속성은 없던 일이 된다. Map은 `Object.fromEntries(map)`이나 `[...map]`으로 바꿔 보낸다([[map-and-set|Map과 Set]]). BigInt는 문자열로 바꾸거나 아래 `JSON.rawJSON`을 쓴다([[js-numbers|숫자와 Math]]).

### replacer: 무엇을 어떻게 넣을지

두 번째 인자는 **배열**이나 **함수**다.

```javascript
// 배열: 이 키만 넣는다. 중첩 객체 안의 키에도 같은 목록이 적용된다
JSON.stringify(meetup, ['title', 'participants', 'name'])

// 함수: 모든 (key, value)에 불린다. 반환값이 그 자리에 들어가고, undefined면 빠진다
JSON.stringify(meetup, (key, value) => (key === 'occupiedBy' ? undefined : value))
```

- 함수는 중첩 객체와 배열 요소까지 **재귀적으로** 불린다. `this`는 지금 처리 중인 속성을 가진 객체다.
- **첫 호출의 키는 빈 문자열 `''`이고 값은 전체 객체다.** 엔진이 `{ '': value }`로 감싸서 시작하기 때문이다. 키로 거를 때 이 첫 호출을 걸러 내지 않도록 주의한다.
- 순환 참조를 끊는 키를 빼거나, 비밀번호 같은 민감한 필드를 로그에서 지울 때 쓴다.

### space: 사람이 읽을 모양으로

세 번째 인자는 들여쓰기다. 숫자(최대 10칸)나 문자열(`'\t'`)을 넘긴다. 전송용은 생략하고, 로그·디버깅·설정 파일 저장에 `JSON.stringify(obj, null, 2)`를 쓴다.

### toJSON: 객체가 직접 정하기

객체에 `toJSON()` 메서드가 있으면 `stringify`는 그 반환값을 대신 직렬화한다. `Date`가 ISO 문자열이 되는 것도 내장 `Date.prototype.toJSON` 때문이다.

```javascript
const room = { number: 23, toJSON() { return this.number } }
JSON.stringify({ title: 'Conference', room }) // '{"title":"Conference","room":23}'
```

클래스 인스턴스의 JSON 모양을 바꾸고 싶을 때는 `toString`이 아니라 `toJSON`을 재정의한다([[typescript-coding-convention|TypeScript 코딩 컨벤션]]).

## JSON.parse와 reviver

`JSON.parse`는 문자열을 값으로 되돌린다. JSON에는 Date 타입이 없어서 **날짜는 문자열로 돌아온다.** 두 번째 인자 **reviver**는 `stringify`의 replacer 함수처럼 모든 `(key, value)`에 불리고, 반환값이 그 자리를 대신한다. 안쪽 값부터 바깥으로 처리되므로 중첩된 날짜도 한 번에 바꾼다.

```javascript
const text = '{"meetups":[{"title":"Conference","date":"2017-11-30T12:00:00.000Z"}]}'

const schedule = JSON.parse(text, (key, value) =>
  key === 'date' ? new Date(value) : value,
)
schedule.meetups[0].date.getUTCFullYear() // 2017
```

API 응답을 다룰 때는 reviver로 키 이름을 추측하기보다, 받은 뒤 스키마 검증 라이브러리로 타입을 확인하고 변환하는 편이 안전하다.

### 큰 정수 지키기: source 접근과 JSON.rawJSON

`JSON.parse`는 숫자를 모두 double로 읽으므로 2^53을 넘는 ID는 **파싱하는 순간 반올림된다.** reviver의 세 번째 인자 `context.source`로 원래 텍스트를 받아 BigInt로 만들고, 내보낼 때는 `JSON.rawJSON`으로 따옴표 없는 숫자 텍스트를 그대로 넣는다(Baseline 2025).

```javascript
const data = JSON.parse('{"id":12345678901234567890}', (key, value, context) =>
  key === 'id' ? BigInt(context.source) : value,
)
data.id // 12345678901234567890n

JSON.stringify({ id: JSON.rawJSON(data.id.toString()) }) // '{"id":12345678901234567890}'
```

지원 범위가 넉넉하지 않은 환경에서는 처음부터 서버가 큰 ID를 문자열로 내려 주는 것이 가장 단순하다.

### 큰 데이터는 JSON.parse가 더 빨리 읽힌다

번들에 큰 정적 데이터(설정, 사전, 초기 상태)를 실어야 할 때는 객체 리터럴보다 **`JSON.parse('…')` 문자열이 더 빨리 처리된다.**

| | 객체 리터럴 `{ "a": 1, … }` | `JSON.parse('{"a":1,…}')` |
| --- | --- | --- |
| 파서가 보는 것 | 키·값·괄호마다 토큰. 중첩될수록 늘어난다 | 호출식 하나와 문자열 리터럴 하나 |
| 문맥 판단 | `{`가 객체인지, 구조 분해인지, 블록인지 뒤를 봐야 안다 | JSON 문법은 단순해 「객체 시작이거나 오류」뿐이다 |

차이는 수백 KB 이상의 **큰 데이터에서만** 의미가 있다. 손으로 바꾸지 않는다. webpack과 Vite는 `.json` 모듈을 이 형태로 바꿔 내보낼 수 있으므로(Vite는 `json.stringify` 옵션) 큰 데이터는 `.json` 파일로 분리해 `import`한다. `Date`·`Map`·`undefined`처럼 JSON이 표현하지 못하는 값이 있으면 적용할 수 없다. 서버가 그린 HTML에 초기 상태를 실을 때도 같은 이유로 `JSON.parse`와 문자열을 쓴다([[spa-csr-ssr|SPA와 CSR·SSR]]).

## JSON으로 복사하지 않는다

`JSON.parse(JSON.stringify(obj))`는 오랫동안 깊은 복사의 우회법이었다. 위 표처럼 Date·Map·`undefined`·순환 참조에서 데이터가 깨지므로, 지금은 `structuredClone(obj)`를 쓴다([[variables-and-types|변수와 데이터 타입]]의 「복사하기」).

## 정리

- JSON은 큰따옴표·주석 없음·제한된 값 타입의 엄격한 텍스트 형식이다. 외부 입력의 `parse`는 `try...catch`로 감싼다.
- `stringify`는 `undefined`·함수·Symbol을 빼고, `NaN`은 `null`, Date는 문자열, Map은 `{}`로 만든다. BigInt와 순환 참조는 에러다.
- 넣을 것을 고르려면 replacer, 보기 좋게는 `space`, 객체가 스스로 정하려면 `toJSON`.
- 날짜 복원은 reviver, 큰 정수는 `context.source`와 `JSON.rawJSON` 또는 문자열 ID.
- 깊은 복사는 JSON 왕복이 아니라 `structuredClone`.

관련 노트: [[arrays-and-objects|배열·객체 다루기]], [[variables-and-types|변수와 데이터 타입]], [[map-and-set|Map과 Set]], [[js-numbers|숫자와 Math]], [[ajax|AJAX와 HTTP 요청]], [[object-to-primitive|객체의 원시형 변환]]
