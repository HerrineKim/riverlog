---
title: "알림 시스템 설계: 푸시·이메일·SMS와 실시간 메시지 전달"
concept: "Notification System"
summary: "여러 서비스가 보내는 알림을 게이트웨이 → 분배 서비스 → 메시지 큐 → 채널 서비스로 흘려 인앱·이메일·SMS·모바일 푸시로 전달하는 구조를 정리했다. 템플릿·채널 선호 저장소, 우선순위 큐, APNs·FCM 같은 플랫폼 푸시 서비스, 전달 추적, 그리고 채팅 메시지를 채널 서버와 지역 게이트웨이를 거쳐 웹소켓으로 밀어 주는 실시간 전달 경로까지 다룬다."
tags: ["backend", "architecture", "notification", "message-queue", "websocket", "mobile"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/how-does-a-typical-push-notification-system-work", "https://bytebytego.com/guides/how-does-netflix-scale-push-messaging-for-millions-of-devices", "https://bytebytego.com/guides/what-is-the-journey-of-a-slack-message", "https://developer.apple.com/documentation/usernotifications", "https://firebase.google.com/docs/cloud-messaging", "https://bytebytego.com/guides/how-are-notifications-pushed-to-our-phones-or-pcs", "https://firebase.google.com/docs/cloud-messaging/manage-tokens"]
---

> ByteByteGo의 System Design 101 가이드 「[How Does a Typical Push Notification System Work?](https://bytebytego.com/guides/how-does-a-typical-push-notification-system-work)」, 「[How Netflix Scales Push Messaging](https://bytebytego.com/guides/how-does-netflix-scale-push-messaging-for-millions-of-devices)」, 「[What is the Journey of a Slack Message?](https://bytebytego.com/guides/what-is-the-journey-of-a-slack-message)」, 「[How are notifications pushed to our phones or PCs?](https://bytebytego.com/guides/how-are-notifications-pushed-to-our-phones-or-pcs)」를 바탕으로 재구성한 노트다.

## 알림 시스템이란

알림 시스템은 **여러 비즈니스 서비스가 "이 사용자에게 이걸 알려라"라고 요청하면, 사용자 설정에 맞는 채널로 형식을 갖춰 확실히 전달하는 공용 플랫폼**이다. 서비스마다 이메일·SMS·푸시 연동을 따로 만들지 않게 한다.

| 채널 | 전달 수단 |
| --- | --- |
| 인앱 알림 | 앱이 연결돼 있으면 웹소켓 등으로 바로, 아니면 다음 접속 때 목록으로 |
| 모바일 푸시 | 플랫폼 푸시 서비스: iOS는 APNs, Android는 FCM |
| 웹 푸시 | 브라우저의 Push API와 서비스 워커 |
| 이메일 | 이메일 발송 서비스(SMTP 릴레이, SES 등) |
| SMS·OTP | SMS 게이트웨이 사업자 |
| 메신저·소셜 | 각 플랫폼의 메시지 API |

## 전형적인 구조

```text
비즈니스 서비스들 ──(단건 또는 묶음)──→ 알림 게이트웨이
                                         │
                                         ▼
                               분배 서비스(distribution)
                    검증 · 템플릿 적용 · 채널 선호 확인 · 예약 발송
                      ↑ 템플릿 저장소     ↑ 채널 선호 저장소
                                         │
                                         ▼
                           라우터(채널별 메시지 큐)
                     ┌────────┬────────┬────────┬────────┐
                     ▼        ▼        ▼        ▼
                  인앱      이메일     SMS     푸시 ...   ← 채널 서비스
                     └────────┴────────┴────────┘
                                         │
                                         ▼
                           추적·분석 서비스(전달·열람 지표)
```

| 구성 요소 | 역할 |
| --- | --- |
| 알림 게이트웨이 | 비즈니스 서비스의 입구. 단건 요청과 대량 묶음 요청을 둘 다 받는다. 인증·처리율 제한을 건다 |
| 분배 서비스 | 요청을 검증하고, **템플릿**으로 메시지를 만들고, 사용자가 고른 **채널 선호**에 따라 보낼 채널을 정하고, 예약 시각을 지킨다 |
| 라우터 | 보통 채널별 메시지 큐다. 채널 하나가 느려도 다른 채널이 막히지 않고, 폭주를 흡수한다 |
| 채널 서비스 | 큐에서 꺼내 외부 전달 사업자(APNs, FCM, 이메일·SMS 사업자)를 호출한다. 실패하면 재시도한다 |
| 추적·분석 | 발송·전달·열람·실패를 기록해 운영팀이 전달률을 개선한다 |

### 설계 포인트

- **우선순위를 큐로 분리한다.** OTP·결제 알림처럼 급한 것과 마케팅 알림을 같은 큐에 두면 급한 알림이 밀린다. 대규모 사례(Netflix)는 이벤트 관리 엔진이 규칙에 따라 이벤트를 우선순위별 큐로 보내고, 우선순위별 처리 클러스터가 각각 소비한다.
- **중복 발송을 막는다.** 큐는 보통 최소 한 번 전달이라 같은 알림이 두 번 나갈 수 있다. 알림 ID로 멱등성을 검사한다.
- **사용자 설정을 존중한다.** 수신 거부, 방해 금지 시간, 채널별 빈도 제한을 분배 단계에서 거른다.
- **외부 사업자 장애에 대비한다.** 채널 서비스는 재시도 + 지수 백오프, 대체 사업자 전환을 둔다.
- 기기 토큰(푸시 토큰)은 앱 재설치·만료로 바뀌므로 무효 응답을 받으면 저장소에서 지운다.

## 플랫폼 푸시의 흐름

모바일 기기는 앱마다 서버와 연결을 유지하지 않는다. 운영체제가 플랫폼 푸시 서비스와 **연결 하나를 유지**하고, 앱 서버는 그 서비스를 통해 보낸다.

```text
1. 앱 설치·실행 → OS가 APNs/FCM에서 기기 토큰 발급 → 앱이 토큰을 우리 서버에 등록
2. 이벤트 발생(시계, 사용자 행동, 시스템) → 알림 데이터 생성·저장
3. 우리 서버 → APNs/FCM에 (기기 토큰 + 페이로드) 전송
4. APNs/FCM → 기기 OS → 알림 표시
```

### FCM과 등록 토큰 관리

**FCM(Firebase Cloud Messaging)** 은 Android 전송을 맡으면서 APNs·웹 푸시까지 한 API로 감싸는 중계 서비스로도 쓰인다. 앱 서버는 콘솔에서 직접 작성한 캠페인이나 Admin SDK·HTTP v1 API로 메시지를 넣고, FCM이 큐잉, 오프라인 기기용 보관(만료 시간까지), 플랫폼별 전송을 맡는다.

- 등록 토큰은 **사용자가 아니라 앱 인스턴스**를 가리킨다. 한 사용자의 기기가 셋이면 토큰도 셋이다.
- 토큰은 재설치·데이터 삭제·기기 복원 때 바뀐다. 앱이 켜질 때마다 현재 토큰을 서버에 보내 갱신한다.
- 서버는 토큰과 **마지막 갱신 시각**을 함께 저장하고 오래된 토큰을 주기적으로 지운다. 전송 응답이 "등록되지 않은 토큰"이면 바로 지운다. 죽은 토큰은 전송 비용과 지연만 늘린다.
- 메시지는 OS가 바로 표시하는 **알림 메시지**와 앱 코드가 받아 처리하는 **데이터 메시지**로 나뉜다. 많은 기기에 같은 내용을 보낼 때는 토큰을 하나씩 넣지 않고 **토픽** 구독으로 보낸다.
- 푸시는 전달을 보장하지 않는다. 중요한 데이터는 싣지 말고 "새 것이 있다"는 신호로 쓰고, 앱이 서버에서 가져오게 한다.

TV·셋톱박스·브라우저처럼 플랫폼 푸시가 없거나 부족한 기기에는 **자체 푸시 서버**를 둔다. 기기가 서버와 웹소켓 같은 지속 연결을 맺고, 서버는 어느 기기가 어느 서버 노드에 연결됐는지 레지스트리에 기록해 메시지를 그 노드로 보낸다(Netflix의 Zuul Push). 브라우저 푸시 자체는 [[pwa-service-worker|PWA와 서비스 워커]]에서 다룬다.

## 실시간 메시지 전달: 채팅의 경우

채팅 메시지는 알림과 달리 **채널을 구독 중인 모든 접속자에게 즉시** 퍼져야 한다. 업무 메신저 사례(Slack)의 경로는 다음과 같다.

| 서버 | 역할 |
| --- | --- |
| 웹 앱 서버 | 클라이언트가 쓰는 API를 정의하고 메시지를 받는다 |
| 관리 서버 | 채널 ID로 담당 채널 서버를 찾는다 |
| 채널 서버 | 채널의 메시지 이력을 들고 있다. 채널이 매우 많으므로 **일관된 해싱(consistent hashing)** 으로 채널을 여러 서버에 나눈다 |
| 게이트웨이 서버 | 지역마다 배치돼 클라이언트의 **웹소켓 연결과 채널 구독**을 유지한다 |
| 프록시(Envoy) | 게이트웨이 앞단의 서비스 프록시 |

```text
보낸 사람 → 웹 앱 → 관리 서버 → (해시로 찾은) 채널 서버
  → 채널을 구독 중인 각 지역 게이트웨이 → 프록시 → 웹소켓으로 받는 사람들에게 푸시
```

- 상태(채널 이력)와 연결(웹소켓)을 서로 다른 서버에 둬서 따로 확장한다.
- 게이트웨이를 사용자 가까운 지역에 두어 지연을 줄인다.
- 웹소켓과 폴링·SSE의 비교는 [[websocket|WebSocket]]에서 다룬다.

## 정리

- 알림은 게이트웨이 → 분배(템플릿·채널 선호·예약) → 채널별 큐 → 채널 서비스 → 추적으로 흐른다.
- 급한 알림과 대량 알림은 우선순위별 큐로 분리하고, 알림 ID로 중복 발송을 막는다.
- 모바일 푸시는 OS가 유지하는 APNs·FCM 연결을 빌려 쓰고, 그게 없는 기기에는 자체 지속 연결 서버를 둔다.
- **채팅 같은 실시간 전달은 상태를 든 채널 서버와 연결을 든 지역 게이트웨이를 분리하고, 채널은 일관된 해싱으로 나눈다.**

관련 노트: [[message-queue-kafka|메시지 큐와 Kafka]], [[websocket|WebSocket]], [[realtime-chat-app|실시간 채팅 앱]], [[pwa-service-worker|PWA와 서비스 워커]], [[database-sharding|데이터베이스 샤딩]], [[big-tech-stack-anatomy|대규모 서비스 기술 스택 해부]]
