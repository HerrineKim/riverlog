---
title: "Segment로 사용자 데이터 수집하기"
concept: "Segment"
summary: "한 번 심은 이벤트 추적 코드로 여러 분석·마케팅 도구에 데이터를 보내는 CDP Segment의 Source·Destination 구조, Track·Identify 스펙, Cloud/Device 모드, Warehouse, 디버깅."
tags: ["analytics", "tracking", "data", "marketing"]
source: notion
date: "2026-10-13"
sources: ["https://www.twilio.com/docs/segment", "https://www.twilio.com/docs/segment/unify"]
---

**Segment**(Twilio Segment)는 서비스에서 일어나는 일(가입, 클릭, 결제 등)을 표준 형식의 메시지로 만들어 **여러 도구로 한 번에 보내 주는** 고객 데이터 플랫폼(CDP)이다. GA, 광고 픽셀, 이메일 마케팅 도구마다 추적 코드를 따로 심는 대신 Segment 코드 하나만 심고, 어디로 보낼지는 Segment 대시보드에서 켜고 끈다. 공식 문서는 [Twilio Docs](https://www.twilio.com/docs/segment)로 옮겨졌다.

## 기본 구조

```text
Source(수집) ──► Segment ──► Destination(전송)
 웹·앱·서버·클라우드 툴       GA, 광고 픽셀, CRM, Warehouse ...
```

| 용어 | 의미 |
| --- | --- |
| Source | 데이터를 수집하는 곳(웹사이트, 앱, 서버, 외부 SaaS) |
| Destination | 데이터를 받는 곳(분석·마케팅 도구, 데이터 웨어하우스) |
| Catalog | 연결할 수 있는 모든 Source·Destination 목록 |

## Segment Spec: 이벤트 종류

| 호출 | 용도 |
| --- | --- |
| **Track** | 가장 기본. 사용자가 한 **행동**을 이벤트 이름과 속성(properties)으로 기록 |
| **Identify** | 사용자가 **누구인지** 기록하고 행동과 연결. 특성(traits) 포함 |
| **Page** | 웹에서 보고 있는 페이지 |
| **Screen** | 모바일 앱에서 보고 있는 화면 |
| **Group** | 사용자를 회사·팀 같은 그룹과 연결 |
| **Alias** | 서로 다른 사용자 ID를 하나로 합침 |

E-commerce, Mobile, Video, B2B SaaS처럼 도구들이 바로 이해하는 **업종별 표준 이벤트 이름**(Industry Specs)도 있다. 예를 들어 `Order Completed`를 규격대로 보내면 광고 도구의 구매 전환으로 자동 매핑된다.

### Track

```javascript
analytics.track('Article Bookmarked', {
  articleId: 'a-123',
  category: 'frontend',
})
```

- 필수: 이벤트 이름 + `userId` 또는 `anonymousId`
- 라이브러리가 `context`(기기, IP, UTM 등)를 자동으로 채운다.

### Identify

```javascript
analytics.identify('user_42', { email: 'user@example.com', plan: 'pro' })
```

- **anonymousId**: 로그인 전 방문자에게 라이브러리가 자동 생성하는 ID(쿠키·localStorage에 저장). 직접 지정할 수도 있다.
- **userId**: DB의 사용자 ID. 로그인 후 `identify(userId)`를 호출하면 그 전의 anonymousId 기록과 이어 붙여, 가입 전후 행동을 한 사람의 것으로 합친다.
- 호출 시점: **회원가입·로그인 직후, 회원 정보 변경 시**.

## Source 종류와 선택 기준

| 종류 | 예 | 이럴 때 |
| --- | --- | --- |
| 클라이언트(웹·모바일) | analytics.js, iOS/Android/React Native SDK | 기기·위치별 분석, UTM으로 캠페인 효과 측정, 화면 내 행동 |
| 서버 | Node.js, Java, Go, Python 등 라이브러리, HTTP API | 결제·매출처럼 **정확해야 하는** 이벤트, 광고 차단기에 막히면 안 되는 데이터, 사이트 밖에서 일어난 일(API 호출, 배치 작업) |
| 클라우드 | Salesforce, Zendesk, Stripe, 이메일 도구 | 외부 SaaS에 쌓인 데이터를 가져올 때(코드 불필요). 객체형은 Warehouse로만 보낼 수 있다 |

웹에서는 Segment에서 JavaScript Source를 만든 뒤, 받은 analytics.js 스니펫을 `<head>`에 붙여 넣으면 `page()`가 자동으로 호출된다.

## Connection Mode: Cloud vs Device

Destination으로 데이터를 **어떤 경로로** 보낼지 정한다.

| | Cloud Mode (기본) | Device Mode |
| --- | --- | --- |
| 경로 | 앱 → Segment 서버 → Destination | 앱에서 Destination SDK가 직접 전송 (+ Segment로도 비동기 전송) |
| 장점 | 앱 용량이 작다, 연결이 쉽다, Segment 기능(필터·변환) 활용 | 도구 고유 기능 사용 가능: 푸시 알림, A/B 테스트, 히트맵, 인앱 채팅 |
| 단점 | 기기에서 직접 동작해야 하는 일부 기능은 불가 | 추가 코드, 배터리·용량 부담 |

## Warehouse

여러 Source의 데이터를 관계형 테이블로 모아 두는 중앙 저장소(Amazon Redshift, Google BigQuery, Postgres 등). Destination처럼 실시간 스트리밍이 아니라 **주기적으로 일괄 적재**한다.

1. **Ping**: Segment가 Warehouse에 접속을 확인
2. **Load**: 변환·중복 제거한 데이터를 적재

SQL로 웹 행동과 CS 티켓, 결제 데이터를 함께 분석할 수 있게 된다.

## 디버깅

- **Source → Debugger**(Live): 이벤트가 Segment에 실제로 들어오는지 실시간 확인
- **Event Tester·Mappings Tester**: 특정 이벤트를 골라 Destination으로 보내 보고 응답을 확인(Cloud Mode 연동만 해당)
- **Event Delivery**: Destination별 전송 성공·실패 현황
- 브라우저 네트워크 탭에서 도구별 ID(예: 광고 픽셀 ID)로 필터링해 실제 요청을 대조
- 안 들어온다면 확인할 것: Destination이 첫 Page 호출을 필요로 하는가? 필수 속성이 다 있는가? 그 이벤트 타입을 Destination이 지원하는가? Cloud/Device 모드 설정이 맞는가?

## Unify와 Engage (구 Personas)

수집한 이벤트로 고객 프로필을 만들고 활용하는 유료 기능이다.

| 제품 | 기능 |
| --- | --- |
| **Unify** | **Identity Resolution**(여러 기기·채널의 데이터를 한 프로필로 통합), 프로필 탐색, **Computed Traits**(행동으로 계산한 특성, 예: 최근 30일 구매 횟수), SQL Traits, 예측 |
| **Engage** | **Audiences**(조건으로 고객 그룹을 정의해 광고·이메일 도구로 내보냄), Journeys(단계별 메시지 흐름). Unify가 있어야 쓴다 |

GA4 자체 설정은 [[ga4-setup|GA4 시작하기]] 참고.

## 핵심 정리

- 추적 코드는 Segment 하나, 보낼 곳은 대시보드에서 선택.
- 행동은 Track, 사람은 Identify. 로그인 후 identify로 익명 기록과 합친다.
- 정확해야 하는 이벤트는 서버에서, 화면 맥락이 필요한 이벤트는 클라이언트에서.
- 기본은 Cloud Mode, 도구 고유 기능이 필요할 때만 Device Mode.
