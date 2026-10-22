---
title: "자바스크립트에서 타임존 다루기"
concept: "Timezone"
summary: "타임존은 오프셋이 아니라 한 지역의 표준시·서머타임 변경 이력 전체이고, 표준은 IANA tz database다. JS의 Date는 OS의 로컬 타임존에 묶여 있어 오프셋을 더하고 빼는 방식으로는 다른 타임존의 날짜 연산을 정확히 할 수 없다."
tags: ["javascript", "frontend", "browser", "api"]
source: other
date: "2026-10-13"
sources: ["https://riverkim.kr/213", "https://ui.toast.com/weekly-pick/ko_20170804", "https://ui.toast.com/weekly-pick/ko_20170922", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Temporal/ZonedDateTime"]
---

> 김동우의 TOAST UI 글 「[자바스크립트에서 타임존 다루기](https://ui.toast.com/weekly-pick/ko_20170804)」(2017.08)와 「[자바스크립트에서 타임존 다루기 (2)](https://ui.toast.com/weekly-pick/ko_20170922)」(2017.09)를 바탕으로 재구성한 노트다.

## 용어

| 용어 | 뜻 |
| --- | --- |
| 타임존(time zone) | 같은 로컬 시간을 쓰는 지역. 나라가 법으로 정한다 |
| GMT | 그리니치 천문대 기준의 태양시. 1972년까지 세계 표준시 |
| UTC | 원자시 기반으로 1972년에 다시 정한 표준. 시간 차이는 미미하지만 소프트웨어에서는 UTC가 정확한 표현이다 |
| 오프셋(offset) | UTC와의 차이. `+09:00`, `-03:00`. 30분·45분 단위도 있다 |
| DST(서머타임) | 하절기에 표준시를 한 시간 앞당기는 제도. 시작·종료 규칙은 나라와 연도마다 다르다 |

이름과 오프셋은 1:N이다. `+09:00`은 KST이기도 하고 JST이기도 하다.

## 타임존 ≠ 오프셋

**한 지역의 타임존은 시점에 따라 여러 오프셋을 가진다.** 이유는 두 가지다.

1. **서머타임.** 캘리포니아는 평소 PST(-08:00), 여름엔 PDT(-07:00)를 쓴다.
2. **규칙 자체가 바뀐다.** 정치·경제적 이유로 법이 바뀐다.

| 사례 | 변화 |
| --- | --- |
| 미국 | 2007년부터 DST 시작·종료 날짜 변경 |
| 이집트·러시아 | 2011년부터 DST 폐지 |
| 사모아 | 2011년 UTC-10 → UTC+14로 바꾸며 12월 30일이 사라짐 |

그래서 "캘리포니아의 타임존은 PST다"는 틀린 말이다. 정확히 말하면 **`America/Los_Angeles` 타임존이 겨울에는 PST를, 여름에는 PDT를 쓴다**. 특정 시점의 시각을 계산하려면 그 지역의 **변경 이력 전체**가 필요하다.

## IANA tz database

타임존 표준은 규칙이라기보다 **데이터베이스**다. 가장 믿을 만한 것이 IANA time zone database(tzdata)다.

- 전 세계 지역의 표준시와 DST 변경 이력을 담는다. 1970년 이후 데이터는 정확도를 보장한다.
- 이름은 `Area/Location` 형식이다: `Asia/Seoul`, `America/New_York`. 국가보다 오래가는 **도시 이름**을 쓴다.
- `Asia/Seoul`과 `Asia/Tokyo`는 지금 오프셋이 같아도 이력이 달라 별개의 타임존이다.
- 리눅스·macOS, Java, PHP 등이 내부적으로 쓴다. Windows는 자체 DB를 쓰는데 이력 누락이 많다.

ECMAScript 명세는 DST 계산을 "구현체가 최선을 다하라"고만 적고 IANA DB 사용은 **권장**에 그친다. 그래서 브라우저마다 결과가 다를 수 있다.

## JS의 Date와 타임존

`Date`는 내부적으로 **UTC 기준 밀리초(유닉스 시간)라는** 절대값을 가진다. 하지만 생성자, `parse()`, `getHours()`·`setHours()` 같은 메서드는 모두 **OS에 설정된 로컬 타임존**으로 동작한다. 그리고 로컬 타임존을 바꾸는 API는 없다.

### 서버와 주고받기

서버에는 타임존과 무관한 절대값을 저장해야 다른 타임존의 사용자도 같은 일정을 제 시각으로 본다.

| 방향 | 형식 | 방법 |
| --- | --- | --- |
| 서버 → 클라이언트 | 유닉스 시간(숫자) | `new Date(ms)`. **밀리초**라서 초 단위면 ×1000 |
| 서버 → 클라이언트 | ISO-8601 문자열 | `new Date('2017-03-11T11:30:00Z')`. 오프셋이 없으면 끝에 `Z`를 붙인다 |
| 클라이언트 → 서버 | 유닉스 시간 | `date.getTime()` |
| 클라이언트 → 서버 | ISO-8601 | `toISOString()` (잘못된 날짜면 에러), `toJSON()` (잘못된 날짜면 `null`) |

- `Date.parse()`나 문자열 생성자에 ISO-8601이 아닌 형식(`'2015-10-12 12:00:00'`)을 넘기면 브라우저마다 결과가 다르다. 쓰지 않는다.
- `toString()`·`toLocaleString()`은 환경마다 결과가 달라 데이터 교환에는 맞지 않는다.

### 다른 타임존 기준으로 보여 주기

로컬 타임존을 바꿀 수 없으니 오프셋 차이만큼 시간을 옮긴 `Date`를 만드는 방법이 있다.

```js
const offsetMin = new Date().getTimezoneOffset(); // 서울이면 -540 (부호가 반대다)
const nyOffsetMin = 300;                          // 뉴욕 -05:00
const ny = new Date(ms - (nyOffsetMin - offsetMin) * 60 * 1000);
ny.getHours(); // 뉴욕 기준 시
```

서머타임이 없는 한국 시간이라면 UTC로 맞춘 뒤 +9시간 하는 식으로 단순해진다. 해외 리전 서버에서 "한국 시간 오전 9시~오후 6시에만 배너 표시" 같은 조건을 계산할 때 쓴다.

```js
const now = new Date();
const utcMs = now.getTime() + now.getTimezoneOffset() * 60 * 1000;
const koreaNow = new Date(utcMs + 9 * 60 * 60 * 1000);
koreaNow.getHours(); // 어디서 실행해도 한국 기준 시
```

이렇게 옮긴 `Date`는 getter가 다른 타임존의 숫자를 돌려주도록 **값을 옮겨 놓은** 객체다. 비교와 표시에만 쓰고, `toISOString()`으로 서버에 보내거나 저장하면 오프셋만큼 어긋난다.

**표시만 할 때는 된다. 날짜 연산에서 깨진다.**

```text
서울 기준 3/11 11:30 → 뉴욕 기준 3/10 21:30 (-05:00)
ny.setDate(15)        → 뉴욕 3/15 21:30 … 그런데 3/12부터 DST라 오프셋은 -04:00
서버로 되돌릴 때 300분이 아니라 240분 기준으로 계산해야 한다
```

- 연산도 대상 타임존 기준으로 해야 한다. 서울 기준 11일 → 15일은 4일, 뉴욕 기준 10일 → 15일은 5일이다.
- 받은 오프셋 하나로는 **그 날짜의 오프셋**을 알 수 없다. 결국 tz database가 필요하다.

### 타임존 이름으로 풀기

해법은 오프셋 숫자 대신 **IANA 타임존 이름**을 들고 다니며, tz database를 아는 API에 계산을 맡기는 것이다.

| 필요 | 쓸 것 |
| --- | --- |
| 표시만 | `Intl.DateTimeFormat`·`toLocaleString`의 `timeZone` 옵션. 브라우저·Node에 tz 데이터가 내장돼 있다 |
| 다른 타임존 기준 날짜 연산 | 표준 API **Temporal**의 `ZonedDateTime`. 지원이 부족한 환경은 polyfill([[date-libraries\|날짜 라이브러리]] 참고) |
| 라이브러리 | date-fns의 `@date-fns/tz`, Day.js의 `timezone` 플러그인. 과거에는 Moment Timezone이 표준처럼 쓰였다 |

```js
new Date(ms).toLocaleString('ko-KR', { timeZone: 'America/New_York' }); // 표시만

Temporal.Instant.fromEpochMilliseconds(ms)
  .toZonedDateTimeISO('America/New_York')
  .with({ day: 15 })
  .toString(); // '2017-03-15T21:30:00-04:00[America/New_York]': DST 오프셋이 자동으로 바뀐다
```

## 정리

- 타임존은 오프셋이 아니라 **지역 + 변경 이력**이다. 저장·전달은 UTC 절대값이나 오프셋이 붙은 ISO-8601로 한다.
- 타임존은 `+09:00` 같은 오프셋 대신 `Asia/Seoul` 같은 IANA 이름으로 다룬다.
- `Date`는 로컬 타임존에 묶여 있다. 오프셋을 더하고 빼는 계산은 서머타임이 없고 규칙이 안 바뀌는 지역에서만 버틴다.
- 표시만 필요하면 `Intl`의 `timeZone` 옵션, 연산이 필요하면 Temporal `ZonedDateTime`이나 타임존을 아는 라이브러리를 쓴다.
- 라이브러리를 고르기 전에 문제가 무엇인지 알아야 맞는 도구를 고를 수 있다.

관련 노트: [[date-libraries|날짜 라이브러리: date-fns와 Day.js]], [[calendar-fallacies|달력과 시간에 대한 개발자의 착각]]
