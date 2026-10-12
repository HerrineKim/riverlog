---
title: "날짜 라이브러리: date-fns와 Day.js"
concept: "Date Library"
summary: "유지보수 모드에 들어간 Moment.js 대신 많이 쓰는 date-fns(함수형·트리 셰이킹)와 Day.js(초경량·Moment 호환 API)의 사용법 비교."
tags: ["javascript", "frontend", "library"]
source: notion
---

JavaScript의 기본 `Date`는 API가 불편하고(월이 0부터 시작, 포맷 함수 부재), 값을 직접 바꾸는 가변(mutable) 객체라 버그가 나기 쉽다. 그래서 날짜 라이브러리를 쓰는데, 오랫동안 표준처럼 쓰이던 Moment.js는 2020년부터 새 기능 개발을 멈춘 유지보수 모드이며 공식 문서에서도 다른 라이브러리를 권한다. 그 대안 중 가장 많이 쓰는 두 가지가 **date-fns**와 **Day.js**다.

> 참고: 장기적으로는 불변 객체 기반의 표준 날짜 API인 **Temporal**이 `Date`를 대체한다. Firefox 139(2025년 5월), Chrome·Edge 144(2026년 1월)가 Temporal을 기본 탑재했지만 Safari 정식 버전은 아직 지원 일정이 확정되지 않았다(2026년 기준). 모든 브라우저를 지원해야 한다면 polyfill을 쓰거나, 당분간 아래 라이브러리를 쓴다.

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
- 프로젝트에 이미 Moment가 있다면 무리하게 바꾸기보다 `moment(...).format('YYMMDD')`처럼 이미 있는 포맷 기능을 활용하고, 새 코드부터 대안을 쓰는 것도 방법이다.

## 핵심 정리

- Moment.js는 유지보수 모드. 대안은 date-fns(함수형)와 Day.js(초경량, Moment 호환).
- 두 라이브러리 모두 불변: 조작 결과는 새 값이다.
- 월은 둘 다 0부터 시작한다. 포맷 토큰은 date-fns `yyyy-MM-dd`, Day.js `YYYY-MM-DD`로 다르다.

관련 노트: [[realtime-chat-app|실시간 채팅 앱(dayjs로 날짜 구분선 만들기)]]
