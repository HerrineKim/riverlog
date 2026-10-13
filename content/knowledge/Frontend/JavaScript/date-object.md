---
title: "Date 객체: 0부터 시작하는 월과 시간대 변환"
concept: "Date"
summary: "JavaScript 기본 Date 객체에서 자주 틀리는 두 가지. getMonth()가 0부터 시작하는 이유와, 서버·사용자 시간대와 관계없이 한국 시간을 구하는 방법."
tags: ["javascript", "frontend", "tips"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/260", "https://riverkim.kr/213"]
---

> riverkim.kr에 쓴 글들을 다시 정리한 노트입니다.

기본 `Date`는 API가 불편해서 실무에서는 날짜 라이브러리([[date-libraries|date-fns와 Day.js]])를 많이 쓴다. 그래도 라이브러리 없이 `Date`를 직접 다룰 때 자주 걸리는 함정이 두 가지 있다.

## 1. getMonth()는 0부터 시작한다

```javascript
const moonLanding = new Date('July 20, 69 00:20:18')
moonLanding.getMonth() // 6 — 7월인데 6이다 (1월이 0)
```

| 메서드 | 범위 |
| --- | --- |
| `getFullYear()` | 실제 연도 |
| `getMonth()` | **0~11** |
| `getDate()` | 1~31 |
| `getDay()` | 0(일요일)~6 |

연·일은 사람이 쓰는 숫자 그대로인데 월만 0부터 시작해 일관성이 없다. `new Date(2024, 0, 1)`처럼 생성자에 월을 넘길 때도 마찬가지다. 화면에 보여 줄 때는 `getMonth() + 1`을 한다.

### 왜 이렇게 됐나

JavaScript를 만든 브렌던 아이크(Brendan Eich)가 직접 설명한 적이 있다. JS의 `Date`는 Java JDK 1.0의 `java.util.Date`를 그대로 옮긴 것이다. 당시 "Java처럼 보이게 하라"는 요구를 받았고 데모까지 열흘밖에 없어서, 자체 API를 설계하거나 Java의 것을 고칠 시간이 없었다.

Java는 8버전에서 새 날짜·시간 패키지(`java.time`)로 이 문제를 정리했다. JavaScript는 하위 호환 때문에 `Date`를 그대로 두었고, 대체재로 새 표준 API **Temporal**을 들였다(월이 1부터 시작한다). 브라우저 지원 현황은 [[date-libraries|날짜 라이브러리]]에 있다.

## 2. new Date()는 실행 환경의 시간대를 따른다

`new Date()`가 만드는 시각 자체는 시간대와 무관한 한 순간이다. 하지만 `getHours()` 같은 getter는 **코드가 실행되는 환경(서버나 브라우저)의 로컬 시간대**로 값을 계산한다. 서버가 해외 리전에 있으면 "한국 시간 오전 9시~오후 6시에만 배너 표시" 같은 조건이 엉뚱한 시간에 동작한다.

### 증상 · 원인 · 해결

| 증상 | 원인 | 해결 |
| --- | --- | --- |
| 특정 시간대에만 보여야 할 UI가 로컬에서는 맞는데 배포하면 어긋남 | 서버(또는 사용자)의 로컬 시간대가 KST가 아님 | UTC로 바꾼 뒤 +9시간 해서 한국 시간을 직접 계산 |

```javascript
const now = new Date()

// 1) 로컬 시간을 UTC 기준 밀리초로 맞춘다
//    getTime(): 1970-01-01T00:00:00Z부터 지난 밀리초
//    getTimezoneOffset(): UTC와 로컬 시간의 차이(분). 로컬이 UTC보다 앞서 있으면 음수 (KST는 -540)
const utcNow = now.getTime() + now.getTimezoneOffset() * 60 * 1000

// 2) 한국은 UTC+9
const KST_OFFSET = 9 * 60 * 60 * 1000
const koreaNow = new Date(utcNow + KST_OFFSET)

koreaNow.getHours() // 어디서 실행해도 한국 기준 시
```

`koreaNow`는 getter가 한국 시각 숫자를 돌려주도록 **값을 옮겨 놓은** 객체다. 시각 비교와 표시에만 쓰고, 이 값을 다시 서버에 저장하거나 `toISOString()`으로 보내면 9시간이 어긋난다.

표시만 필요하다면 시간대를 지정해 포맷하는 방법도 있다.

```javascript
new Date().toLocaleString('ko-KR', { timeZone: 'Asia/Seoul' })
```

GMT(그리니치 평균시)와 UTC(협정 세계시)는 초 단위 이하에서만 차이가 나서 웹 개발에서는 사실상 같은 기준으로 다룬다.

이 "+9시간" 계산은 한국처럼 서머타임이 없는 지역에서만 안전하다. 오프셋이 계절마다 바뀌는 타임존에서 왜 이 방식이 틀리는지는 [[timezone|자바스크립트에서 타임존 다루기]]에 있다.

## 정리

- `getMonth()`는 0~11이다. 표시할 때 +1, 생성할 때 -1.
- 월이 0부터인 이유는 Java 1.0의 `Date`를 급하게 옮겨 왔기 때문이다.
- `Date`의 getter는 실행 환경의 시간대를 따른다. 서버 코드에서 "한국 시간"이 필요하면 UTC에서 +9시간을 직접 계산하거나 `timeZone`을 지정한다.

관련 노트: [[date-libraries|날짜 라이브러리: date-fns와 Day.js]], [[timezone|자바스크립트에서 타임존 다루기]]
