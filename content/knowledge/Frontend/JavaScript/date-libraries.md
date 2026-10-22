---
title: "날짜 라이브러리: date-fns와 Day.js"
concept: "Date Library"
summary: "기본 Date 다루기(타임스탬프, 생성자 네 형태, 날짜만 쓴 ISO 문자열은 UTC라는 함정, get·set과 범위를 넘으면 넘겨 주는 자동 고침, 빼기로 재는 시간 차, Date.now와 performance.now), 0부터 시작하는 월과 그 유래, 유지보수 모드에 들어간 Moment.js 대신 많이 쓰는 date-fns(함수형·트리 셰이킹)와 Day.js(초경량·Moment 호환 API)의 사용법 비교, 그리고 Date를 대체할 표준 API Temporal의 지원 현황."
tags: ["javascript", "frontend", "library"]
source: mixed
date: "2026-10-17"
sources: ["https://riverkim.kr/260", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal", "https://momentjs.com/docs/#/-project-status/", "https://ko.javascript.info/date", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date"]
---

> 개인 노트를 바탕으로, 기본 `Date` 사용법은 javascript.info(모던 JavaScript 튜토리얼)의 「Date 객체와 날짜」 글로 보강한 노트다.

JavaScript의 기본 `Date`는 API가 불편하고(월이 0부터 시작, 포맷 함수 부재), 값을 직접 바꾸는 가변(mutable) 객체라 버그가 나기 쉽다. 그래서 날짜 라이브러리를 쓰는데, 오랫동안 표준처럼 쓰이던 Moment.js는 2020년부터 새 기능 개발을 멈춘 유지보수 모드이며 공식 문서에서도 다른 라이브러리를 권한다. 그 대안 중 가장 많이 쓰는 두 가지가 **date-fns**와 **Day.js**다.

## 기본 Date의 함정: 0부터 시작하는 월

```javascript
const moonLanding = new Date('July 20, 69 00:20:18')
moonLanding.getMonth() // 6, 7월인데 6이다 (1월이 0)
```

| 메서드 | 범위 |
| --- | --- |
| `getFullYear()` | 실제 연도 |
| `getMonth()` | **0~11** |
| `getDate()` | 1~31 |
| `getDay()` | 0(일요일)~6 |

연·일은 사람이 쓰는 숫자 그대로인데 월만 0부터 시작한다. `new Date(2024, 0, 1)`처럼 생성자에 월을 넘길 때도 같다. 화면에 보여 줄 때는 `getMonth() + 1`을 한다.

이유는 역사에 있다. JS의 `Date`는 Java JDK 1.0의 `java.util.Date`를 그대로 옮긴 것이다. "Java처럼 보이게 하라"는 요구와 열흘의 일정 때문에 브렌던 아이크(Brendan Eich)가 API를 따로 설계하거나 고칠 시간이 없었다. Java는 8버전의 `java.time`으로 정리했지만, JavaScript는 하위 호환 때문에 `Date`를 그대로 두고 새 표준 Temporal을 들였다.

## 기본 Date 다루기

`Date`는 **1970-01-01T00:00:00Z(UTC)부터 흐른 밀리초**, 즉 타임스탬프 하나를 담은 가변 객체다. 날짜만 또는 시각만 담을 수는 없고 늘 둘이 함께다. 그 값을 사람이 읽는 연·월·일로 풀 때 로컬 타임존을 쓴다(타임존 문제는 [[timezone|자바스크립트에서 타임존 다루기]]).

### 만들기

| 호출 | 뜻 |
| --- | --- |
| `new Date()` | 지금 |
| `new Date(ms)` | 타임스탬프(밀리초). 1970년 이전은 음수. **초 단위 값이면 ×1000** |
| `new Date(문자열)` | 문자열을 파싱한다(`Date.parse`와 같은 규칙) |
| `new Date(y, m, d?, h?, min?, s?, ms?)` | **로컬 시각** 기준 구성 요소. 월은 0부터, 일은 생략하면 1, 나머지는 0 |

문자열은 ISO 형식 `YYYY-MM-DDTHH:mm:ss.sssZ`(또는 `±hh:mm` 오프셋)만 믿는다. 그 밖의 형식은 브라우저마다 다르게 읽는다. 그리고 **같은 ISO라도 모양에 따라 기준이 다르다.**

| 문자열 | 해석 |
| --- | --- |
| `'2017-01-26'` (날짜만) | **UTC 자정**. 한국에서 출력하면 26일 09:00, 미국에서는 25일 |
| `'2017-01-26T00:00'` (시각 있음, 오프셋 없음) | **로컬** 자정 |
| `'2017-01-26T00:00Z'`, `'…+09:00'` | 적힌 오프셋 기준 |

날짜만 쓴 문자열로 만든 `Date`를 `getDate()`로 읽으면 타임존에 따라 하루가 어긋난다. 날짜만 다루려면 문자열 그대로 두거나 Temporal의 `PlainDate`를 쓴다.

### 읽기·바꾸기와 자동 고침

`getFullYear`·`getMonth`·`getDate`·`getHours`… 는 로컬 기준, 이름에 `UTC`를 넣은 `getUTCHours` 등은 UTC 기준이다. `getTime()`은 타임스탬프, `getTimezoneOffset()`은 UTC와의 차이(분, 한국은 `-540`)다. `getYear()`는 두 자리 연도를 주는 폐기된 메서드라 쓰지 않는다. 요일 `getDay()`는 늘 0이 일요일이다.

`setFullYear`·`setMonth`·`setDate`·`setHours`…는 원본을 **직접 바꾼다**. 범위를 넘는 값을 넣으면 에러 대신 **넘친 만큼 다음 단위로 넘긴다(자동 고침, autocorrection).** 이 성질로 윤년·월말을 따지지 않고 날짜를 더하고 뺀다.

```javascript
new Date(2013, 0, 32)           // 2013년 2월 1일, 1월 32일은 2월 1일로
const d = new Date(2016, 1, 28)
d.setDate(d.getDate() + 2)      // 2016년 3월 1일, 윤년도 알아서
d.setDate(0)                    // 전달의 마지막 날, 0일은 '1일의 하루 전'
d.setHours(0, 0, 0, 0)          // 그날 자정으로 맞추기
```

`setDate(n + 2)`처럼 원본을 바꾸는 방식은 같은 `Date`를 여러 곳에서 공유할 때 버그가 된다. 이런 계산은 아래 라이브러리나 Temporal이 새 값을 돌려주는 방식으로 하는 편이 안전하다.

### 시간 재기

`Date`를 숫자로 바꾸면 타임스탬프가 되므로 **두 날짜를 빼면 밀리초 차이**다(`end - start`). 객체 변환 규칙은 [[object-to-primitive|객체의 원시형 변환]]에 있다. 지금 시각의 타임스탬프만 필요하면 객체를 만들지 않는 `Date.now()`가 낫다.

경과 시간 측정에는 `performance.now()`를 쓴다. 페이지가 열린 뒤 흐른 시간을 소수점 아래(마이크로초 수준)까지 주고, 시스템 시계를 바꿔도 거꾸로 가지 않는다. 짧은 코드를 비교하는 마이크로 벤치마크는 결과를 믿기 어렵다. CPU 상태에 흔들리고, 엔진이 자주 실행된 코드만 따로 최적화하기 때문이다. 번갈아 여러 번, 예열 실행 뒤에 재고, 가능하면 실제 시나리오를 [[devtools-performance|Performance 패널]]로 잰다.

## Temporal: 표준 날짜 API

불변 객체 기반의 새 표준 날짜 API **Temporal**이 `Date`를 대체한다. 월이 1부터 시작하고, 타임존(`Temporal.ZonedDateTime`)과 날짜만(`PlainDate`)·시각만(`PlainTime`)을 따로 다룬다. Firefox 139(2025.05), Chrome·Edge 144(2026.01)와 Node.js 26이 기본 탑재했지만, Safari 정식 버전의 지원이 늦어 2026년 10월 MDN 기준 아직 Baseline이 아니다. 모든 브라우저를 지원해야 하면 polyfill(`@js-temporal/polyfill`, `temporal-polyfill`)을 쓰거나 아래 라이브러리를 쓴다.

```typescript
Temporal.Now.plainDateISO().add({ months: 1 }).toString() // '2026-11-13'
```

## 한눈에 비교

| | date-fns | Day.js |
| --- | --- | --- |
| 스타일 | 함수형: `format(date, ...)` | 체이닝: `dayjs(date).format(...)` |
| 데이터 | 기본 `Date` 객체를 그대로 사용 | 자체 래퍼 객체 |
| 불변성 | 순수 함수, 항상 새 `Date` 반환 | 모든 조작이 새 인스턴스 반환 |
| 크기 | 필요한 함수만 import → 트리 셰이킹 | 코어가 약 2KB(gzip), 기능은 플러그인으로 |
| Moment에서 옮기기 | API가 다름 | Moment와 거의 같은 API |
| 타입·i18n | TypeScript 지원, 다국어 locale | TypeScript 지원, 다국어 locale |

## date-fns

### 값 꺼내기와 포맷

```typescript
import { format, getYear, getMonth, getDate, getDay } from 'date-fns'

const date = new Date('2021-10-11T10:30:25.495')

format(date, 'yyyy-MM-dd HH:mm:ss.SSS') // '2021-10-11 10:30:25.495'
getYear(date)  // 2021
getMonth(date) // 9   ← 월은 0~11
getDate(date)  // 11  (일)
getDay(date)   // 1   (요일: 일요일 0 ~ 토요일 6)
```

포맷 토큰은 유니코드 표준을 따른다. 연도는 `yyyy`(소문자), 일은 `dd`(소문자)다. `YYYY`·`DD`는 다른 의미라서 에러를 낸다.

### 값 바꾸기

```typescript
import { set, setMonth, setDay } from 'date-fns'

set(date, { year: 2022, month: 11, date: 25, hours: 15 }) // 2022-12-25 15:30:25.495
setMonth(date, 11) // 2021-12-11 ...
setDay(date, 5)    // 2021-10-15 ... (같은 주의 금요일)
```

원본 `date`는 바뀌지 않고 항상 새 `Date`가 반환된다.

### 상대 시간과 다국어

```typescript
import { formatDistance } from 'date-fns'
import { ko } from 'date-fns/locale'

formatDistance(new Date('2023-03-08T10:00'), new Date('2023-03-08T14:00'), {
  locale: ko,
  addSuffix: true,
}) // '약 4시간 전'
```

## Day.js

### 생성과 포맷

```typescript
import dayjs from 'dayjs'

dayjs()                      // 현재 시각
dayjs('2022-12-01 15:38:30') // 지정한 시각

const date = dayjs('2022-12-01 10:30:25')
date.format()                      // '2022-12-01T10:30:25+09:00' (ISO 8601, 로컬 시간대)
date.format('YY-MM-DD')            // '22-12-01'
date.format('YYYY.MM.DD HH:mm:ss') // '2022.12.01 10:30:25'
```

Day.js의 포맷 토큰은 Moment와 같다(`YYYY`, `DD` 대문자).

### 값 꺼내기와 바꾸기

```typescript
const d = dayjs('2022-12-01 17:00:00') // 목요일

d.get('year')   // 2022  (단축: 'y')
d.get('month')  // 11    ← 0~11 ('M')
d.get('date')   // 1     ('D')
d.get('day')    // 4     요일 ('d')

d.set('year', 2023).format('YYYY-MM-DD')  // '2023-12-01'
d.set('month', 0).format('YYYY-MM-DD')    // '2022-01-01'
d.set('date', 25).format('YYYY-MM-DD')    // '2022-12-25'
d.set('day', 5).format('YYYY-MM-DD dddd') // '2022-12-02 Friday' (같은 주의 금요일)
d.set('hour', 15).format('HH:mm')         // '15:00'
```

### 더하기·빼기와 차이

```typescript
dayjs().add(1, 'month')
dayjs().subtract(7, 'day')

const a = dayjs('2022-12-01 12:30:25')
const b = dayjs('2021-10-24 13:23:50')
a.diff(b)               // 밀리초 차이
a.diff(b, 'year')       // 1
a.diff(b, 'month')      // 13
a.diff(b, 'day')        // 402   (소수점 이하 버림)
a.diff(b, 'day', true)  // 402.96... (세 번째 인자 true면 소수까지)
```

## 어떤 걸 고를까

- 기존 Moment 코드를 빠르게 옮기거나 번들 크기가 가장 중요하다면 **Day.js**.
- `Date` 객체를 그대로 다루고 함수 단위로 import해 쓰고 싶다면 **date-fns**.
- 지원 대상 브라우저가 모두 Temporal을 지원하거나 polyfill을 감수할 수 있다면 새 코드는 **Temporal**로 쓴다.
- 프로젝트에 이미 Moment가 있다면 무리하게 바꾸기보다 `moment(...).format('YYMMDD')`처럼 이미 있는 포맷 기능을 활용하고, 새 코드부터 대안을 쓰는 것도 방법이다.

## 핵심 정리

- Moment.js는 유지보수 모드. 대안은 date-fns(함수형)와 Day.js(초경량, Moment 호환).
- 두 라이브러리 모두 불변: 조작 결과는 새 값이다.
- 월은 둘 다 0부터 시작한다. 포맷 토큰은 date-fns `yyyy-MM-dd`, Day.js `YYYY-MM-DD`로 다르다.

관련 노트: [[object-to-primitive|객체의 원시형 변환]], [[json|JSON: stringify와 parse]], [[timezone|자바스크립트에서 타임존 다루기]], [[realtime-chat-app|실시간 채팅 앱(dayjs로 날짜 구분선 만들기)]]
