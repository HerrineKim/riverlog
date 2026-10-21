---
title: "정규 표현식: 문법·플래그·메서드"
concept: "Regular Expression"
summary: "JavaScript 정규 표현식을 사전처럼 찾아보는 표 모음. 문자 클래스·세트·앵커·수량자·그룹·역참조·대안·전후방탐색 문법, g·i·m·s·u·v·y·d 플래그, match·matchAll·replace·split·exec·test의 반환값과 lastIndex 함정, 명명된 그룹과 중복 이름, v 플래그의 집합 연산, d 플래그의 indices, 인라인 플래그 수정자, 사용자 입력을 안전하게 넣는 RegExp.escape까지."
tags: ["javascript", "regex", "string", "frontend"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/regexp-introduction", "https://ko.javascript.info/regexp-character-classes", "https://ko.javascript.info/regexp-unicode", "https://ko.javascript.info/regexp-anchors", "https://ko.javascript.info/regexp-multiline-mode", "https://ko.javascript.info/regexp-boundary", "https://ko.javascript.info/regexp-escaping", "https://ko.javascript.info/regexp-character-sets-and-ranges", "https://ko.javascript.info/regexp-quantifiers", "https://ko.javascript.info/regexp-groups", "https://ko.javascript.info/regexp-backreferences", "https://ko.javascript.info/regexp-alternation", "https://ko.javascript.info/regexp-sticky", "https://ko.javascript.info/regexp-methods", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/escape", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp/unicodeSets", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Modifier", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Regular_expressions/Named_capturing_group", "https://github.com/tc39/proposals/blob/main/finished-proposals.md", "https://github.com/ziishaned/learn-regex"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「정규 표현식」 장(패턴과 플래그, 문자 클래스, 유니코드, 앵커, 멀티라인 모드, 단어 경계, 이스케이프, 집합과 범위, 수량자, 캡처 그룹, 역참조, 대안, 스티키 플래그, 정규 표현식과 메서드)을 바탕으로, ES2022 이후 기능은 MDN과 TC39 문서로 확인해 재구성한 노트다. 언어에 묶이지 않은 입문 정리로는 「[Learn Regex the Easy Way](https://github.com/ziishaned/learn-regex)」가 같은 범위(메타 문자, 수량자, 그룹, 전후방탐색, 플래그, 탐욕·게으름)를 다룬다.

## 정규 표현식이란

정규 표현식(regular expression)은 **문자열에서 찾을 모양을 기술하는 작은 언어**다. JavaScript에서는 `RegExp` 객체이고, 패턴과 플래그로 이루어진다. 엔진이 실제로 어떻게 찾는지(탐욕·게으름, 백트래킹, 성능 함정)는 [[regexp-engine|정규식 엔진: 탐욕·게으름·전후방탐색·백트래킹]]에 있다.

```js
const re1 = /\d{3}-\d{4}/g;                       // 리터럴: 패턴을 미리 알 때
const re2 = new RegExp(`^${RegExp.escape(word)}`, 'i'); // 생성자: 실행 중에 만들 때
```

- 리터럴 안에서는 `/`를 `\/`로 쓴다. 생성자에는 필요 없다.
- 생성자에 문자열을 넘기면 **문자열 이스케이프가 먼저 한 번 풀린다.** `"\d"`는 `"d"`가 되므로 `"\\d"`처럼 백슬래시를 두 번 쓴다. 원시 문자열이 필요하면 `` String.raw`\d+` ``를 넘긴다.

## 문법 한눈에

### 문자와 클래스

| 문법 | 뜻 | 반대 |
| --- | --- | --- |
| `\d` | 숫자 `[0-9]` | `\D` |
| `\w` | 단어 문자 `[A-Za-z0-9_]`. **한글은 아니다** | `\W` |
| `\s` | 공백(스페이스, 탭, 줄바꿈 등) | `\S` |
| `.` | 줄바꿈을 뺀 아무 문자. `s` 플래그면 줄바꿈도 | |
| `\p{L}` · `\p{Lu}` · `\p{N}` · `\p{Sc}` | 유니코드 속성(글자, 대문자, 숫자, 통화 기호). `u`·`v` 플래그 필요 | `\P{…}` |
| `\p{Script=Hangul}` · `\p{sc=Han}` | 문자 체계(한글, 한자) | |
| `[abc]` · `[a-z0-9]` | 세트·범위 중 한 글자 | `[^abc]` |
| `\.` `\(` `\[` … | 특수 문자 자체. 특수 문자는 `[ ] \ ^ $ . \| ? * + ( ) { } /` | |

- **공백도 문자다.** `/\d-\d/`는 `"1 - 5"`에 맞지 않는다.
- 세트 하나는 결과에서 **한 글자**다. `V[oi]la`는 `Voila`에 맞지 않는다.
- 세트 안에서는 `. + ( )`를 이스케이프하지 않아도 된다. `-`는 맨 앞·뒤면 문자 그대로, `^`는 맨 앞일 때만 부정이다. `]`와 `\`는 항상 이스케이프한다.
- 한글을 포함한 다국어 단어 문자는 `[\p{Alpha}\p{M}\p{Nd}\p{Pc}\p{Join_C}]`(`u`)로 만든다. 한글 음절만이면 `[가-힣]`이다.
- 과거에는 `s` 플래그가 없던 브라우저를 위해 `[\s\S]`로 「아무 문자」를 썼다.

### 위치(폭이 0인 검사)

| 문법 | 맞는 위치 |
| --- | --- |
| `^` · `$` | 문자열의 시작·끝. `m` 플래그면 각 줄의 시작·끝 |
| `\b` | 단어 경계: `\w`와 `\W`(또는 문자열 끝) 사이. **`\w` 기준이라 한글에는 안 맞는다** |
| `\B` | 단어 경계가 아닌 곳 |
| `X(?=Y)` · `X(?!Y)` | 뒤에 Y가 오는 / 오지 않는 X (전방탐색) |
| `(?<=Y)X` · `(?<!Y)X` | 앞에 Y가 있는 / 없는 X (후방탐색) |

앵커는 글자를 소비하지 않는다. `^\d\d:\d\d$`는 **문자열 전체**가 그 모양인지 검사하고, `^$`는 빈 문자열에만 맞는다. 단순한 시작·끝 검사는 `startsWith`·`endsWith`가 더 읽기 쉽다. `\d$`(m)와 `\d\n`의 차이는 줄바꿈을 결과에 포함하느냐와, 마지막 줄(뒤에 `\n`이 없음)에 맞느냐다.

### 수량자

| 문법 | 횟수 | 예 |
| --- | --- | --- |
| `{n}` · `{n,m}` · `{n,}` | 정확히 n / n~m / n 이상 | `\d{3,4}` |
| `+` | 1 이상 `{1,}` | `\d+` |
| `?` | 0 또는 1 `{0,1}` | `colou?r` |
| `*` | 0 이상 `{0,}` | `\d0*` |
| 뒤에 `?` (`+?`, `*?`, `{n,m}?`) | 게으른(lazy) 모드: 가능한 한 적게 | `".+?"` |

수량자는 바로 앞 한 요소(문자, 클래스, 세트, 그룹)에 붙는다. 기본은 **탐욕(greedy)** 이다. 정밀한 패턴은 길어지므로 오탐을 얼마나 허용할지에 맞춰 고른다(`<\w+>` 대 `<[a-z][a-z0-9]*>`).

### 그룹·역참조·대안

| 문법 | 뜻 |
| --- | --- |
| `(…)` | 캡처 그룹. 결과의 `[1]`, `[2]`…, 수량자를 묶음 전체에 적용 |
| `(?<name>…)` | 명명된 그룹. 결과의 `groups.name` |
| `(?:…)` | 비캡처 그룹. 묶기만 하고 번호를 매기지 않는다 |
| `\1` · `\k<name>` | 역참조: 그 그룹이 **찾은 것과 같은 텍스트** |
| `A\|B` | 대안. 연산자 중 **우선순위가 가장 낮다** |
| `(?i:…)` · `(?-i:…)` | 플래그 수정자: 일부에만 `i`·`m`·`s`를 켜고 끈다 |

- 그룹 번호는 **여는 괄호 순서**로 매긴다. 중첩돼도 바깥부터다. `[0]`은 전체 일치다.
- 일치에 참여하지 않은 선택적 그룹(`(…)?`)도 자리는 있고 값이 `undefined`다.
- 역참조는 패턴 안에서 `\1`, 치환 문자열에서는 `$1`이다. 따옴표 쌍 찾기: `/(['"])(.*?)\1/g`.
- `I love HTML|CSS`는 「I love HTML」 또는 「CSS」다. 범위를 괄호로 묶는다: `I love (HTML|CSS)`.
- 대안은 **왼쪽부터** 시도한다. `Java|JavaScript`는 `JavaScript`에서 `Java`만 찾는다. 긴 쪽을 앞에 두거나 `Java(Script)?`로 합친다.
- 세트는 글자 하나 중 선택, 대안은 식 전체 중 선택이다. 시간 검사: `([01]\d|2[0-3]):[0-5]\d`.

**중복된 그룹 이름(ES2025)**: 서로 다른 대안 안에서는 같은 이름을 쓸 수 있다. 한 번에 한쪽만 맞으므로 `groups.year`로 어느 쪽이든 꺼낸다.

```js
const re = /(?<year>\d{4})-\d{2}|\d{2}-(?<year>\d{4})/;
re.exec('10-2026').groups.year;   // '2026'
```

**플래그 수정자(ES2025)**: `/(?i:hello) world/`는 `HELLO world`에는 맞고 `HELLO WORLD`에는 맞지 않는다. `g`·`y`·`d`·`u`·`v`는 패턴 전체에 걸리는 플래그라 수정자에 쓸 수 없다.

## 플래그

| 플래그 | 속성 | 효과 |
| --- | --- | --- |
| `g` | `global` | 모든 일치를 찾는다. `lastIndex`를 쓴다 |
| `i` | `ignoreCase` | 대소문자 무시 |
| `m` | `multiline` | `^`·`$`가 줄마다 맞는다. 다른 것에는 영향이 없다 |
| `s` | `dotAll` | `.`이 줄바꿈에도 맞는다 |
| `u` | `unicode` | 서로게이트 쌍(이모지, `𝒳`)을 한 글자로 다루고 `\p{…}`를 켠다 |
| `v` | `unicodeSets` | `u`의 상위 호환. 세트 안 집합 연산과 문자열 속성(ES2024) |
| `y` | `sticky` | `lastIndex` **바로 그 위치에서만** 찾는다 |
| `d` | `hasIndices` | 결과에 그룹별 시작·끝 위치 `indices`를 붙인다(ES2022) |

### u와 v: 유니코드

`u`가 없으면 JavaScript 정규식은 문자열을 UTF-16 단위로 본다. `'😄'.length`가 2인 것처럼 `/[𝒳𝒴]/`는 반쪽 글자에 맞고, `[𝒳-𝒵]`는 범위 오류가 난다. **유니코드 텍스트를 다루면 `u` 또는 `v`를 항상 붙인다.**

`v`는 `u`가 하는 일에 다음을 더한다. Baseline이며 `u`와 함께 쓰면 `SyntaxError`다.

```js
/[\p{L}--[a-z]]/v              // 차집합: 라틴 소문자를 뺀 글자
/[\p{Script=Greek}&&\p{Lu}]/v  // 교집합: 그리스 대문자
/[\p{L}[0-9]]/v                // 중첩 세트(합집합)
/^\p{RGI_Emoji}$/v             // 문자열 속성: 여러 코드 포인트로 된 이모지 하나
/[\q{abc|d}]/v                 // 세트 안에 여러 글자 문자열
```

`v`에서는 세트 안에서 `(`, `)`, `[`, `{`, `}`, `/`, `-`, `|` 같은 문자를 이스케이프해야 해서 `u`에서 되던 패턴이 오류가 날 수 있다. 국기처럼 여러 코드 포인트를 합친 자소 클러스터를 세트 한 글자로 묶어 주지는 않는다(`/[🇺🇳]/v`는 `🇺`에 맞는다). 글자 단위 분리는 `Intl.Segmenter`가 맡는다.

### d: 일치 위치

```js
const m = /(?<key>\w+)=(?<val>\w+)/d.exec('a=1; color=red');
m.indices[0];           // [0, 3]   전체 일치의 시작·끝
m.indices.groups.val;   // [2, 3]
```

하이라이트·에디터·파서처럼 「어디서 찾았나」가 필요할 때 쓴다. 위치 계산 비용이 있어 기본으로 켜지 않는다.

## 메서드

| 메서드 | 플래그 | 반환 |
| --- | --- | --- |
| `str.match(re)` | `g` 없음 | 첫 일치 배열(그룹, `index`, `input`, `groups`) 또는 **`null`** |
| `str.match(re)` | `g` | 일치 문자열만 담은 배열(그룹 없음) 또는 `null` |
| `str.matchAll(re)` | `g` **필수** | 일치마다 전체 정보를 주는 이터레이터. 없으면 빈 이터레이터 |
| `str.search(re)` | | 첫 일치 위치, 없으면 `-1` |
| `str.split(re, limit)` | | 나눈 배열. `str.split(/,\s*/)` |
| `str.replace(re, 대체)` | `g`면 전부 | 바꾼 문자열. 문자열 패턴은 첫 하나만 |
| `str.replaceAll(re, 대체)` | `g` **필수** | 전부 바꾼 문자열. 문자열 패턴도 전부 |
| `re.test(str)` | | `true`/`false` |
| `re.exec(str)` | `g`·`y`면 `lastIndex`부터 | 일치 하나 또는 `null` |

```js
const text = 'a=1, b=22';
for (const { groups, index } of text.matchAll(/(?<k>\w)=(?<v>\d+)/g)) {
  console.log(groups.k, groups.v, index);   // a 1 0 / b 22 5
}
const found = text.match(/\d+/g) ?? [];       // null 대비
```

`matchAll`은 결과를 미리 다 만들지 않고 순회할 때 찾는다. 배열이 필요하면 `Array.from()`이나 `[...]`로 바꾸고, 이터레이터 헬퍼(`.map()`, `.take()`)를 바로 이어 쓸 수도 있다(→ [[iterators-and-generators|이터레이터와 제너레이터]]).

### 치환 문자열과 치환 함수

| 패턴 | 들어가는 것 |
| --- | --- |
| `$&` | 일치한 전체 |
| `` $` `` · `$'` | 일치 앞 / 뒤 문자열 |
| `$1` … `$99` | n번 그룹 |
| `$<name>` | 명명된 그룹 |
| `$$` | `$` 문자 |

```js
'John Smith'.replace(/(?<first>\w+) (?<last>\w+)/, '$<last>, $<first>'); // 'Smith, John'

// 함수: (match, p1, …, pn, offset, input, groups) — 명명된 그룹이 있으면 groups가 마지막
'1kg 20kg'.replace(/(\d+)kg/g, (m, n) => `${n * 1000}g`);  // '1000g 20000g'
```

### lastIndex 함정

`g`·`y` 플래그가 있는 정규식은 **상태(`lastIndex`)를 가진 객체**다.

```js
const re = /a/g;
re.test('a');   // true,  lastIndex → 1
re.test('a');   // false! 1번 위치부터 찾았다. lastIndex → 0
```

- `exec`·`test`는 일치하면 `lastIndex`를 일치 끝으로 옮기고, 실패하면 0으로 되돌린다.
- **`g`가 붙은 정규식을 모듈 상수로 두고 여러 문자열에 `test`하면 번갈아 실패한다.** 검사용 정규식에는 `g`를 빼거나, 매번 `re.lastIndex = 0`을 한다.
- 문자열 메서드(`match`, `matchAll`, `replace`)는 시작할 때 `lastIndex`를 직접 관리하므로 이 함정이 없다. `matchAll`은 정규식을 복제해 쓴다.

### y: 정해진 위치에서만

`g`는 `lastIndex`부터 **앞으로 훑고**, `y`는 **그 위치 하나만** 검사한다.

```js
const re = /\w+/y;
re.lastIndex = 3;
re.exec('let varName');   // null — 3번은 공백
re.lastIndex = 4;
re.exec('let varName');   // ['varName']
```

토큰을 앞에서부터 차례로 읽는 렉서(lexer)에 맞다. 그 위치에서 실패하면 바로 끝나므로, 긴 텍스트를 끝까지 훑는 `g`보다 빠르다.

## 사용자 입력으로 패턴 만들기: RegExp.escape

검색어를 그대로 `new RegExp(input)`에 넣으면 `.`이나 `(`가 문법으로 해석되고, 일부러 무거운 패턴을 넣는 공격(ReDoS)도 가능하다. **`RegExp.escape()`(ES2026, Baseline 2025)** 가 입력을 문자 그대로 맞는 패턴으로 바꾼다.

```js
const domain = 'example.com';
new RegExp(`https?://${RegExp.escape(domain)}/`, 'g');
// RegExp.escape('example.com') → '\\x65xample\\.com'
```

- 특수 문자(`^ $ \ . * + ? ( ) [ ] { } | /`)에 백슬래시를 붙인다.
- `-`, `,`, `=`, 공백 같은 기타 구두점은 `\x2d`처럼 16진 이스케이프로 바꾼다. `u`·`v` 모드에서 `\-`가 문법 오류가 되는 것을 피하려는 것이다.
- **첫 글자가 영문자·숫자면 `\x`로 바꾼다.** 앞에 `\1`이나 `\x0`이 와도 이어 붙어 다른 뜻이 되지 않게 하려는 것이다.
- 직접 `replace(/[.*+?^${}()|[\]\\]/g, '\\$&')`로 이스케이프하던 코드는 이 경우들을 놓친다. 지원하지 않는 환경은 core-js 폴리필을 쓴다.

## 정리

- 문법은 다섯 묶음이다: **글자(클래스·세트), 위치(앵커·경계·전후방탐색), 횟수(수량자), 묶음(그룹·역참조), 선택(대안).**
- 유니코드 텍스트에는 `u`, 집합 연산이나 이모지 문자열이 필요하면 `v`. `\w`·`\b`는 한글을 모른다.
- 그룹은 이름을 붙여 `groups`로 꺼내고, 여러 일치는 `matchAll`로 돈다.
- `match`는 실패하면 `null`이고, `g` 정규식의 `test`·`exec`는 `lastIndex` 상태를 가진다.
- 입력값은 반드시 `RegExp.escape()`를 거쳐 패턴에 넣는다.

더 읽을거리: 「[불규칙 속에서 규칙을 찾아내는 정규표현식](https://evan-moon.github.io/2020/07/24/about-regular-expression/)」, 「[정규표현식, 이렇게 시작하자!](https://heropy.blog/2018/10/28/regexp/)」

관련 노트: [[regexp-engine|정규식 엔진: 탐욕·게으름·전후방탐색·백트래킹]], [[arrays-and-objects|배열·객체·문자열 다루기]], [[ecmascript-tc39|ECMAScript 표준과 TC39 프로세스]], [[iterators-and-generators|이터레이터와 제너레이터]]
