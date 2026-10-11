---
title: "TCP"
concept: "TCP"
summary: "신뢰성 있는 연결 지향 프로토콜 TCP의 헤더와 플래그, 3-way handshake, 순서·확인 번호 규칙, 연결 상태 전이."
tags: ["network", "tcp", "transport-layer", "handshake"]
source: notion
---

TCP(Transmission Control Protocol)는 서로 다른 호스트의 프로그램이 데이터를 **안정적으로, 순서대로, 오류 없이** 주고받게 해 주는 전송 계층 프로토콜이다. 그 대가로 연결 수립과 확인 응답 과정이 필요해 UDP보다 느리다.

## TCP 헤더의 주요 필드

| 필드 | 설명 |
| --- | --- |
| 출발지·목적지 포트 | 각 2바이트 |
| 순서 번호(Sequence Number) | 보내는 데이터의 첫 바이트 번호 |
| 확인 번호(Acknowledgment Number) | 다음에 받기를 기대하는 바이트 번호 |
| Offset | 헤더 길이 (4바이트 단위, 옵션이 없으면 20바이트 → 5) |
| Reserved | 예약 필드 |
| Flags | URG, ACK, PSH, RST, SYN, FIN |
| Window | 수신 측 버퍼에 남은 공간 — 흐름 제어에 사용 |
| Checksum | 오류 검출 |
| Urgent Pointer | 긴급 데이터의 위치 |

## TCP 플래그

| 플래그 | 이름 | 의미 |
| --- | --- | --- |
| URG | Urgent | 긴급 데이터가 있음. Urgent Pointer가 위치를 알려 줌 |
| **ACK** | Acknowledgment | 확인 번호가 유효함. 상대의 패킷을 잘 받았다는 응답 |
| PSH | Push | 버퍼가 찰 때까지 기다리지 말고 즉시 응용 계층으로 전달 (Telnet처럼 대화형일 때) |
| **RST** | Reset | 비정상적인 상황에서 연결을 즉시 끊음 |
| **SYN** | Synchronize | 연결 요청. 초기 순서 번호를 임의로 정해 보냄 |
| **FIN** | Finish | 더 보낼 데이터가 없음. 정상적인 연결 종료 요청 |

## 3-Way Handshake (연결 수립)

데이터를 보내기 전에 양쪽이 서로의 초기 순서 번호를 확인하는 과정이다.

1. **Client → Server: SYN**
   - SEQ = 100 (클라이언트가 임의로 정한 값), ACK = 0
2. **Server → Client: SYN + ACK**
   - SEQ = 2000 (서버가 임의로 정한 값)
   - ACK = 100 + 1 = **101** (받은 SEQ + 1)
3. **Client → Server: ACK**
   - SEQ = **101** (받은 ACK 값)
   - ACK = 2000 + 1 = **2001**

이후 양쪽 모두 `ESTABLISHED` 상태가 되어 데이터를 주고받는다. SYN과 FIN은 데이터가 없어도 순서 번호를 1 소비하기 때문에 +1이 된다.

## 데이터 전송 시 순서·확인 번호 규칙

1. 연달아 보낼 때는 내 SEQ, ACK가 그대로다.
2. 받은 쪽이 응답할 때 **내 SEQ = 받은 ACK**.
3. 받은 쪽이 응답할 때 **내 ACK = 받은 SEQ + 받은 데이터 크기**.

예시: 클라이언트가 100바이트, 서버가 500바이트를 보냄

| 방향 | SEQ | ACK | 데이터 |
| --- | --- | --- | --- |
| Client → Server | 101 | 2001 | 100바이트 |
| Server → Client | 2001 | 201 (101 + 100) | 500바이트 |
| Client → Server | 201 | 2501 (2001 + 500) | — |

ACK를 받지 못하면 송신 측은 해당 데이터를 재전송한다. 이것이 TCP 신뢰성의 기본이다.

## 연결 상태 전이

| 상태 | 의미 |
| --- | --- |
| LISTEN | 서버가 포트를 열고 연결 요청을 기다림 (passive open) |
| SYN_SENT | 클라이언트가 SYN을 보낸 뒤 응답을 기다림 (active open) |
| SYN_RECEIVED | 서버가 SYN을 받고 SYN+ACK를 보낸 상태 |
| ESTABLISHED | 연결 수립 완료, 데이터 송수신 가능 |
| FIN_WAIT, CLOSE_WAIT, TIME_WAIT 등 | 연결 종료 과정의 상태들 |

흐름: 서버는 항상 `LISTEN`이어야 요청을 받을 수 있고, 클라이언트가 SYN을 보내면 `SYN_SENT` → 서버는 `SYN_RECEIVED` → 마지막 ACK 후 양쪽 `ESTABLISHED`.

연결 종료는 보통 FIN → ACK → FIN → ACK의 **4-way handshake**로 이루어진다.

## 흐름 제어와 혼잡 제어

- **흐름 제어**: 수신 측이 처리할 수 있는 만큼만 보내도록 Window 필드로 조절한다(슬라이딩 윈도우).
- **혼잡 제어**: 네트워크가 막히면 전송 속도를 줄인다(슬로 스타트, 혼잡 회피 등).
- **오류 제어**: 체크섬으로 오류를 검출하고, 손실된 세그먼트는 재전송한다.

## 핵심 정리

- 연결 수립 = SYN → SYN+ACK → ACK.
- 응답의 SEQ는 받은 ACK, 응답의 ACK는 받은 SEQ + 데이터 크기.
- 중요 플래그는 SYN, ACK, FIN, RST. 중요 상태는 LISTEN, ESTABLISHED.
