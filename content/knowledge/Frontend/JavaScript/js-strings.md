---
title: "문자열 다루기"
concept: "String"
summary: "JavaScript 문자열은 UTF-16 코드 단위의 나열이고 바꿀 수 없는 원시값이다. 따옴표와 이스케이프, 백틱 템플릿 리터럴(여러 줄·표현식 삽입·중첩)과 styled-components의 바탕인 태그드 템플릿, 글자 접근(at·charAt), 검색(includes·indexOf와 0의 함정), 부분 문자열(slice·substring·substr의 차이), 대소문자·공백·패딩, 유니코드 순 비교와 localeCompare·Intl.Collator, 서로게이트 쌍과 코드 포인트, normalize로 맞추는 유니코드 정규화, 짝 잃은 서로게이트를 찾는 isWellFormed까지 정리한다."
tags: ["javascript", "frontend", "data-structure", "i18n", "styling"]
source: mixed
date: "2026-10-20"
sources: ["https://ko.javascript.info/string", "https://opencollective.com/styled-components/updates", "https://ko.javascript.info/types", "https://ko.javascript.info/primitives-methods", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/isWellFormed", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter", "https://github.com/moonformeli/TIL/blob/master/hangul_unicode.md"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「문자열」, 「자료형」, 「원시값의 메서드」 글을 바탕으로, ES2022 이후 추가된 메서드는 MDN으로 확인해 재구성한 노트다. 템플릿 리터럴과 태그드 템플릿은 노션에 정리해 둔 내용을 합쳤다. 한글의 코드 영역은 「[한글 인코딩과 자바스크립트](https://github.com/moonformeli/TIL/blob/master/hangul_unicode.md)」를 바탕으로 더했다.

## 문자열이란

**문자열은 UTF-16 코드 단위(code unit)의 나열이다.** 페이지 인코딩과 상관없이 엔진 안에서는 늘 UTF-16이다. 글자 하나를 담는 `char` 같은 별도 타입은 없고, 한 글자도 길이 1인 문자열이다.

문자열은 **원시값이라 바꿀 수 없다(immutable)**. 메서드는 원본을 고치지 않고 새 문자열을 돌려준다. 원시값인데도 `'hi'.toUpperCase()`가 되는 이유(래퍼 객체)는 [[variables-and-types|변수와 데이터 타입]]에 있다.

```javascript
let str = 'Hi'
str[0] = 'h'           // 무시된다. strict mode에서는 TypeError
str = 'h' + str.slice(1) // 새 문자열을 만들어 다시 대입한다
```

## 리터럴과 이스케이프

| 따옴표 | 특징 |
| --- | --- |
| `'…'`, `"…"` | 완전히 같다. 소스에서 줄을 바꿀 수 없다 |
| `` `…` `` | 템플릿 리터럴. 여러 줄, `${식}` 삽입, 태그드 템플릿(아래 「템플릿 리터럴」) |

감싼 것과 같은 따옴표를 안에 쓰려면 백슬래시로 **이스케이프**한다(`'I\'m'`). 다른 따옴표로 감싸면 이스케이프가 필요 없다(`"I'm"`, `` `I'm` ``). 백슬래시는 소스를 읽을 때만 쓰이고 메모리의 문자열에는 남지 않는다.

| 이스케이프 | 뜻 |
| --- | --- |
| `\n`, `\t`, `\\` | 줄바꿈, 탭, 백슬래시 자체 |
| `\r` | 캐리지 리턴. Windows 줄바꿈은 `\r\n` |
| `\uXXXX` | UTF-16 코드 단위(16진수 4자리). `'©'` → `©` |
| `\u{X…}` | 코드 포인트(16진수 1~6자리). `'\u{1F60D}'` → `😍` |
| `\xXX` | 16진수 2자리 코드. `'\x7A'` → `z` |

`length`는 메서드가 아니라 **속성**이다(`str.length`). 값은 글자 수가 아니라 **UTF-16 코드 단위 수**라서 이모지는 2가 된다(아래 「유니코드」).

## 템플릿 리터럴

**템플릿 리터럴(template literal)** 은 백틱(`` ` ``)으로 감싼 문자열이다. ES2015 초안에서는 "template strings"라고 불렀다. 따옴표 문자열과 달리 세 가지가 된다.

```javascript
// 여러 줄: 줄바꿈이 그대로 들어간다 ('line 1\n' + 'line 2' 대신)
`line 1
line 2`

// 표현식 삽입: ${} 안에는 변수·연산·함수 호출 등 어떤 식이든 온다
`Fifteen is ${a + b} and not ${2 * a + b}.`

// 중첩: 템플릿 안에 템플릿. 공통 접두사 'icon-'을 한 번만 쓴다
const classes = `header ${
  isLargeScreen() ? '' : `icon-${item.isCollapsed ? 'expander' : 'collapser'}`
}`
```

문자열을 이을 때는 `+`보다 템플릿 리터럴이 안전하다. `+`는 피연산자 하나만 숫자여도 계산 순서에 따라 결과가 바뀐다([[operators-and-control-flow|연산자와 제어문]]).

### 태그드 템플릿

템플릿 앞에 함수 이름을 붙이면 그 함수(태그)가 템플릿을 받아 처리한다. 첫 인자는 `${}` 사이사이의 **문자열 조각 배열**(`TemplateStringsArray`), 나머지 인자는 각 **표현식의 값**이다. 조각 수는 항상 **표현식 수 + 1**이다.

```typescript
function describe(strings: TemplateStringsArray, person: string, age: number) {
  // strings = ['that ', ' is a ', ''] — 마지막 표현식 뒤에도 빈 조각이 있다
  const ageWord = age > 99 ? 'centenarian' : 'youngster'
  return `${strings[0]}${person}${strings[1]}${ageWord}`
}
describe`that ${'Mike'} is a ${28}` // 'that Mike is a youngster'
```

`String.raw`(이스케이프를 해석하지 않은 원문), GraphQL의 `gql`, styled-components가 태그드 템플릿을 쓴다.

**styled-components의 원리**: 표현식 자리에 **함수**를 넣고, 태그 함수가 props를 넣어 그 함수를 실행하면 props에 따라 바뀌는 CSS가 나온다.

```typescript
const props = { primary: true, theme: { colors: { primary: 'coral', secondary: 'peachpuff' } } }
type Props = typeof props

function styled(css: TemplateStringsArray, ...fns: ((p: Props) => string)[]) {
  return css.map((chunk, i) => chunk + (fns[i] ? fns[i](props) : '')).join('')
}

styled`
  background: ${({ primary, theme }) => (primary ? theme.colors.primary : theme.colors.secondary)};
` // 'background: coral;'
```

실제 라이브러리는 이 CSS 문자열에 고유 클래스 이름을 붙여 `<style>` 태그로 넣는다. 런타임에 스타일을 만드는 이 방식은 서버 컴포넌트·스트리밍 SSR과 잘 맞지 않아, styled-components는 2025년 3월 유지보수 모드에 들어갔다. 새 프로젝트는 CSS Modules·Tailwind CSS나 빌드 타임 CSS-in-JS(vanilla-extract, Panda CSS)를 많이 쓴다([React 스타일링](/knowledge/dictionary/frontend/react/styling)).

## 글자 꺼내기

| 방법 | 범위 밖일 때 | 비고 |
| --- | --- | --- |
| `str[i]` | `undefined` | 기본 |
| `str.at(i)` | `undefined` | 음수 인덱스로 뒤에서 센다. `str.at(-1)`은 마지막 글자(ES2022) |
| `str.charAt(i)` | `''`(빈 문자열) | 옛 방식 |

`for...of`로 돌면 코드 포인트 단위로 나뉘어 이모지가 반쪽으로 깨지지 않는다([[iterators-and-generators|이터레이터와 제너레이터]]).

## 검색

| 메서드 | 반환 | 쓰는 때 |
| --- | --- | --- |
| `includes(sub, from)` | 불리언 | 포함 여부만 |
| `startsWith(sub)` / `endsWith(sub)` | 불리언 | 앞·뒤 일치 |
| `indexOf(sub, from)` / `lastIndexOf(sub, from)` | 위치, 없으면 `-1` | 위치가 필요할 때 |
| `search(regex)` / `match` / `matchAll` | 위치 / 결과 | 정규식으로 찾을 때([[regular-expressions\|정규 표현식]]) |

모두 대소문자를 구분한다. **`indexOf`를 그대로 조건에 넣지 않는다.** 맨 앞에서 찾으면 `0`이라 falsy가 된다.

```javascript
if ('Widget'.indexOf('Widget')) {}         // 실행되지 않는다 — 0은 falsy
if ('Widget'.indexOf('Widget') !== -1) {}  // 위치 비교는 -1과
if ('Widget'.includes('Widget')) {}        // 포함 여부는 includes
```

옛 코드의 `if (~str.indexOf(x))`는 비트 NOT이 `-1`만 `0`으로 만드는 성질을 쓴 포함 검사다. 읽기 어려우니 `includes`로 바꾼다.

## 부분 문자열

| 메서드 | 인자 | 음수 | `start > end`일 때 |
| --- | --- | --- | --- |
| `slice(start, end)` | 시작, 끝(미포함) | 뒤에서 센다 | 빈 문자열 |
| `substring(start, end)` | 시작, 끝(미포함) | `0`으로 본다 | 두 값을 바꿔서 처리 |
| `substr(start, length)` | 시작, **길이** | 시작만 뒤에서 센다 | — |

```javascript
'stringify'.slice(2, 6)     // 'ring'
'stringify'.slice(-4, -1)   // 'gif'
'stringify'.substring(6, 2) // 'ring' — slice(6, 2)는 ''
```

**`slice`만 쓰면 된다.** 배열의 `slice`와 규칙이 같고 음수도 받는다. `substr`은 명세 부록 B(웹 호환용 레거시)에 있어 쓰지 않는다.

## 바꾸기·다듬기

| 메서드 | 하는 일 |
| --- | --- |
| `toUpperCase()` / `toLowerCase()` | 대소문자. 로케일 규칙이 필요하면 `toLocaleUpperCase('tr')` |
| `trim()` / `trimStart()` / `trimEnd()` | 앞뒤 공백·줄바꿈 제거 |
| `padStart(n, ch)` / `padEnd(n, ch)` | 길이 `n`까지 채운다. `'7'.padStart(2, '0')` → `'07'` |
| `repeat(n)` | `n`번 반복 |
| `replace(a, b)` / `replaceAll(a, b)` | 처음 하나 / 전부 교체(ES2021). 정규식도 받는다([[regular-expressions\|정규 표현식]]) |
| `split(sep, limit)` / 배열의 `join(sep)` | 문자열 ↔ 배열 |
| `concat(...)` | 이어 붙이기. 보통 `+`나 템플릿 리터럴을 쓴다 |

## 비교하기

`<`, `>`는 문자열을 **코드 단위 값 순서**로 한 글자씩 비교한다. 사전 순과 비슷하지만 다르다.

```javascript
'a' > 'Z'                 // true — 소문자(97~)가 대문자(65~)보다 뒤
'Österreich' > 'Zealand'  // true — Ö(214)가 z(122)보다 뒤
'Bee' > 'Be'              // true — 앞이 같으면 긴 쪽이 크다
```

사람이 기대하는 순서로 정렬하려면 **언어별 정렬 규칙(ECMA-402)** 을 쓴다.

```javascript
'Österreich'.localeCompare('Zealand', 'de')  // 음수 — 앞에 온다
names.sort((a, b) => a.localeCompare(b, 'ko'))

const collator = new Intl.Collator('ko', { numeric: true, sensitivity: 'base' })
const files = ['파일10', '파일2'].sort(collator.compare) // ['파일2', '파일10'] — 숫자를 숫자로 비교
```

`localeCompare`는 음수·0·양수를 돌려준다. 많은 값을 정렬할 때는 `Intl.Collator`를 한 번 만들어 `compare`를 재사용하는 편이 빠르다. `sensitivity: 'base'`면 대소문자·악센트를 무시하고 비교한다.

## 유니코드: 코드 단위, 코드 포인트, 글자

| 단위 | 뜻 | 세는 법 |
| --- | --- | --- |
| 코드 단위 | UTF-16의 16비트 한 칸 | `str.length`, `str[i]`, `charCodeAt` |
| 코드 포인트 | 유니코드 문자 번호 하나. 큰 번호는 코드 단위 2개(서로게이트 쌍) | `[...str].length`, `codePointAt`, `for...of` |
| 자소 클러스터 | 사람이 한 글자로 보는 단위 | `Intl.Segmenter` |

### 서로게이트 쌍

16비트로 표현할 수 없는 이모지·수학 기호·희귀 한자는 **서로게이트 쌍**(앞 `0xD800~0xDBFF`, 뒤 `0xDC00~0xDFFF`) 두 칸으로 저장된다.

```javascript
'😂'.length                  // 2
'😂'[0]                      // '\uD83D' — 반쪽짜리
'😂'.codePointAt(0)          // 128514 — 쌍을 합친 코드 포인트
String.fromCodePoint(128514) // '😂'
[...'a😂'].length            // 2
```

`charCodeAt`·`String.fromCharCode`는 코드 단위만 다루는 옛 메서드다. 코드 포인트는 `codePointAt`·`String.fromCodePoint`를 쓴다. `split('')`·`slice`로 자르면 쌍이 갈라질 수 있다.

**짝 잃은 서로게이트**가 섞인 문자열은 `encodeURI`나 `TextEncoder`에서 오류·대체 문자를 만든다. `str.isWellFormed()`로 검사하고 `str.toWellFormed()`로 대체 문자(U+FFFD)로 고친다(ES2024).

### 보이는 글자 단위: Intl.Segmenter

👨‍👩‍👧(ZWJ로 이은 이모지)나 국기 이모지는 코드 포인트 여러 개가 한 글자로 보인다. 글자 수 제한, 커서 이동처럼 **사람이 세는 글자**가 필요하면 `Intl.Segmenter`를 쓴다.

```javascript
const seg = new Intl.Segmenter('ko', { granularity: 'grapheme' })
const count = [...seg.segment('👨‍👩‍👧가')].length // 2
```

### 정규화: 같은 글자, 다른 바이트

`é`는 미리 합쳐진 코드 하나(`é`)로도, `e` + 결합 악센트(`é`)로도 쓸 수 있다. 한글도 완성형 `가`와 자모를 이은 조합형이 있다. 눈에 같아도 `===`는 `false`다.

```javascript
'Ṩ' === 'Ṩ'                          // false
'Ṩ'.normalize() === 'Ṩ'.normalize()  // true — 'Ṩ' 하나로 합쳐진다
```

`normalize()`의 기본 형식은 `'NFC'`(합친 형태)다. 사용자 입력을 저장·비교·검색하기 전에 NFC로 맞춘다. macOS에서 온 파일 이름처럼 조합형(NFD)이 섞여 들어오는 경우가 흔하다.

#### 한글의 세 가지 코드

한글은 같은 모양이 세 군데 코드 영역에 있다. `replace`·`includes`·정규식은 **모양이 아니라 코드**로 비교하므로, 어느 영역의 글자인지 모르면 검색과 치환이 조용히 실패한다.

| 영역 | 범위 | 예: ㅅ / 스 | 생기는 곳 |
| --- | --- | --- | --- |
| 완성형 음절 | U+AC00–U+D7A3 (11,172자) | `스` = U+C2A4 | 보통의 키보드 입력, NFC |
| 첫가끝 자모(조합용) | U+1100–U+11FF | `ᄉ` = U+1109, 뒤에 모음 `ᅳ` U+1173이 붙는다 | NFD로 분해된 문자열. macOS 파일 이름 |
| 호환 자모 | U+3131–U+318E | `ㅅ` = U+3145 | 자음·모음 하나만 따로 쓸 때 |

완성형 음절은 초성 19 × 중성 21 × 종성 28(받침 없음 포함) 조합을 순서대로 늘어놓은 것이라 계산으로 분해·조립한다. 초성 검색이나 받침 유무에 따른 조사(은/는) 선택이 이 계산을 쓴다.

```javascript
const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
function decompose(ch) {
  const n = ch.normalize('NFC').charCodeAt(0) - 0xac00
  if (n < 0 || n > 11171) return null              // 완성형 음절이 아니다
  return { cho: CHO[Math.floor(n / 588)],          // 588 = 21 × 28
           jung: Math.floor((n % 588) / 28),       // 중성 번호
           jong: n % 28 }                          // 0이면 받침 없음
}
decompose('강')  // { cho: 'ㄱ', jung: 0, jong: 21 }  — 21번 종성이 ㅇ
const josa = (w) => (decompose(w.at(-1))?.jong ? '은' : '는')
```

**입력은 받는 즉시 `normalize('NFC')`로 맞추고, 그다음에 비교·저장·분해한다.** 업로드 파일 이름, 다른 OS에서 붙여 넣은 텍스트, 외부 API 응답이 NFD로 들어오는 대표적인 경로다. 과거에는 `escape`·`unescape`로 코드를 들여다봤지만 둘 다 표준에서 권장하지 않는 레거시 함수다. 코드 확인은 `codePointAt(0).toString(16)`으로 한다.

## 정리

- 문자열은 바꿀 수 없는 UTF-16 코드 단위의 나열이다. `length`는 코드 단위 수다.
- 백틱 템플릿 리터럴은 여러 줄·`${식}` 삽입을 지원하고, 태그드 템플릿은 `(조각 배열, ...값)`을 받는 함수로 문자열을 해석한다.
- 포함 여부는 `includes`, 위치는 `indexOf`와 `-1` 비교. 부분 문자열은 `slice` 하나로 충분하다.
- `<`·`>`는 코드 순서다. 사람용 정렬은 `localeCompare`나 `Intl.Collator`.
- 이모지는 서로게이트 쌍이다. 코드 포인트는 `for...of`·`codePointAt`, 보이는 글자는 `Intl.Segmenter`.
- 비교·저장 전에 `normalize()`로 정규화한다.

관련 노트: [[styling|React 스타일링]], [[arrays-and-objects|배열·객체 다루기]], [[variables-and-types|변수와 데이터 타입]], [[iterators-and-generators|이터레이터와 제너레이터]], [[operators-and-control-flow|연산자와 제어문]], [[regular-expressions|정규 표현식: 문법·플래그·메서드]]
