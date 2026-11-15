---
title: "멀티플레이 게임 서버 설계: 턴제 비동기와 실시간"
concept: "Multiplayer Game Server"
summary: "온라인 멀티플레이 게임을 두 갈래로 정리했다. 턴제 비동기 게임은 게임 상태를 DB에 저장하고 차례가 오면 푸시로 알리며, 상태를 격자 문자열이나 명령 로그로 표현한다. 실시간 게임은 서버가 상태의 권위를 갖고, 클라이언트는 입력 예측·서버 보정·보간으로 지연을 숨긴다."
tags: ["backend", "architecture", "realtime", "game", "websocket"]
source: other
date: "2026-10-31"
sources: ["https://github.com/checkcheckzz/system-design-interview", "http://www.indieflashblog.com/how-to-create-an-asynchronous-multiplayer-game.html", "http://www.indieflashblog.com/how-to-create-async-part2.html", "http://www.indieflashblog.com/how-to-create-async-part3.html", "http://www.indieflashblog.com/how-to-create-async-part4-html.html", "http://buildnewgames.com/real-time-multiplayer/"]
---

> 「[checkcheckzz/system-design-interview](https://github.com/checkcheckzz/system-design-interview)」의 「온라인 멀티플레이 카드 게임 설계」 문항이 가리키는 자료인 Indie Flash Blog의 「How to Create an Asynchronous Multiplayer Game」 연재([1부](http://www.indieflashblog.com/how-to-create-an-asynchronous-multiplayer-game.html), [2부 상태 저장](http://www.indieflashblog.com/how-to-create-async-part2.html), [3부 불러오기](http://www.indieflashblog.com/how-to-create-async-part3.html), [4부 매치메이킹](http://www.indieflashblog.com/how-to-create-async-part4-html.html))와 Build New Games의 「[Real Time Multiplayer in HTML5](http://buildnewgames.com/real-time-multiplayer/)」를 바탕으로 재구성한 노트다.

## 두 갈래

| 구분 | 턴제 비동기 | 실시간 |
| --- | --- | --- |
| 예 | 체스·카드·전략 게임을 하루에 한 수씩 | 액션, 레이싱, 슈팅 |
| 같은 시간에 접속 | 필요 없다 | 필요하다 |
| 통신 | 일반 HTTP 요청 + 푸시 알림 | WebSocket·UDP로 초당 수십 번 상태 교환 |
| 핵심 저장소 | DB의 게임 레코드 | 서버 메모리의 게임 상태 |
| 어려운 점 | 상태 표현, 게임 목록, 상대 찾기 | 네트워크 지연을 숨기면서 공정성 지키기 |

카드 게임 대부분은 턴제다. 다만 턴 안에서 실시간 대화나 관전을 붙이면 두 방식을 섞게 된다.

## 턴제 비동기 게임

### 흐름

```text
1. 새 게임을 만들면 대기 목록에 들어간다. 참가 요청이 오면 대기 중인 게임에 붙인다
2. 차례인 플레이어가 수를 두고(제출 전에는 되돌리기 허용) 제출한다
3. 서버가 게임 레코드의 상태를 갱신하고, 상대에게 「당신 차례」 푸시 알림을 보낸다
4. 제한 시간(예: 24시간) 안에 두지 않으면 기권 처리할 수 있다
5. 플레이어는 게임 목록에서 진행 중인 게임 아무거나 이어 한다
```

- 같은 시간에 접속할 필요가 없어 **플레이어 수가 적은 초기에도 상대가 생긴다.** 비동기 매치메이킹은 「접속해 있어야 한다」는 조건을 없애 임계 인원 문제를 푼다.
- 사용자는 「참가」 버튼을 누르지 않는다. 새 게임을 만들면 서버가 뒤에서 대기 중인 게임과 짝을 지어 준다. 친구를 초대하는 기능은 상대가 오프라인이어도 초대가 남게 한다.
- 피해량이 확률로 정해지는 게임은 되돌리기를 허용하면 결과를 다시 굴려 볼 수 있으므로, 난수는 서버가 정하거나 되돌리기를 막는다.

### 상태를 어떻게 저장하나

| 표현 | 방법 | 맞는 경우 |
| --- | --- | --- |
| 평면 격자 문자열 | 2차원 판을 한 줄 문자열로 펴서 저장한다. 3×3 틱택토는 9글자, 지도는 벽 `X`·빈칸 `O` 문자열 | 판의 현재 모습만으로 게임이 결정될 때 |
| 명령 로그 | 처음부터 지금까지의 명령을 줄인 표기로 저장하고, 불러올 때 게임 엔진으로 다시 재생한다 | 언제 무엇을 했는지가 결과에 영향을 줄 때(카드, 효과의 지속 시간) |

명령 로그는 이벤트 소싱과 같은 발상이다. 상태를 정확히 재현하고, 상대가 자리를 비운 동안 둔 수를 **애니메이션으로 다시 보여 줄 수 있다.** 저장 공간을 아끼려면 명령을 짧은 표기로 줄인다.

게임 목록은 게임 표와 플레이어별 결과 표를 조인해 「상대, 만든 날, 마지막 수 시각, 상태(내 차례, 상대 차례, 승리, 패배)」를 보여 준다. 질의는 클라이언트가 아니라 서버 쪽에서 만든다.

## 실시간 게임

### 서버가 권위를 갖는다

실시간 게임은 게임 로직을 **서버와 클라이언트 양쪽에서** 돌린다. 클라이언트가 결과를 정하게 두면 조작할 수 있으므로 **서버의 상태가 진실**이고, 클라이언트는 화면을 매끄럽게 보이려고 같은 계산을 미리 할 뿐이다.

```text
서버
  물리 루프   15ms마다(약 66Hz) 받은 입력을 적용해 상태를 진행한다
  전송 루프   45ms 정도마다 모든 클라이언트에 상태를 보낸다
              (위치, 마지막으로 처리한 입력 번호, 서버 시각)
클라이언트
  물리 루프   서버와 같은 15ms 간격으로 같은 계산을 한다
  렌더 루프   가능한 한 빠르게(requestAnimationFrame, 보통 60fps) 그린다
```

느리게 바뀌는 값(낮과 밤 주기 같은)은 더 느린 전송 루프로 따로 보내 트래픽을 줄인다.

### 지연을 숨기는 세 기법

| 기법 | 대상 | 동작 |
| --- | --- | --- |
| 클라이언트 예측 | 내 캐릭터 | 입력을 서버 응답을 기다리지 않고 즉시 적용한다. 서버 결과도 같으리라 가정한다 |
| 서버 보정(reconciliation) | 내 캐릭터 | 입력마다 번호를 붙여 보내고 보관한다. 서버 상태가 오면 그 위치로 맞춘 뒤, 서버가 아직 처리하지 않은 번호의 입력만 다시 적용한다. 예측이 틀린 만큼만 조용히 고쳐진다 |
| 보간(interpolation) | 다른 플레이어 | 서버에서 온 위치를 최소 100ms 치 쌓아 두고, 서버 시각보다 100ms 뒤의 시점을 두 위치 사이에서 보간해 그린다. 조금 과거를 보는 대신 움직임이 매끄럽다 |

물리 계산은 프레임 수가 아니라 **경과 시간(delta time)** 에 비례하게 짠다. `x += 속도 × dt`로 쓰면 30fps(약 33ms)와 60fps(약 16.7ms) 기기에서 같은 시간에 같은 거리를 간다. 프레임당 1픽셀씩 움직이면 빠른 기기의 플레이어만 빨리 달린다.

### 전송 계층

브라우저 게임은 WebSocket(예전에는 socket.io가 롱 폴링으로 대체해 주던 것)으로 서버와 연결을 유지한다. 지연이 더 중요한 게임은 순서 보장이 없는 UDP나 WebRTC 데이터 채널을 쓴다. 늦게 도착한 옛 위치는 버리면 그만이라 재전송이 오히려 해롭기 때문이다. 서버 한 대가 맡을 게임 방은 매치메이킹 서비스가 정하고, 방마다 상태가 서버 메모리에 있으므로 같은 방의 플레이어는 같은 서버로 보낸다.

## 정리

- 턴제 비동기는 「DB의 게임 레코드 + 차례 알림 푸시 + 제한 시간」이다. 동시 접속이 필요 없어 매치메이킹이 쉽다.
- 상태는 판 모양이 전부면 격자 문자열로, 순서가 중요하면 명령 로그로 저장한다.
- 실시간은 서버가 권위를 갖고, 내 캐릭터는 예측·보정으로, 남의 캐릭터는 보간으로 지연을 숨긴다.
- 움직임은 경과 시간에 비례하게 계산해 기기 성능과 무관하게 만든다.
- 결론: 게임 서버 설계는 「무엇을 기다려도 되고 무엇은 즉시 보여야 하나」를 나누는 일이다.

관련 노트: [[realtime-websocket-server|실시간 WebSocket 서버]], [[websocket|WebSocket]], [[webrtc|WebRTC]], [[notification-system|알림 시스템 설계]], [[distributed-data-patterns|데이터 관리 패턴: CDC, 이벤트 소싱, CQRS, 최종 일관성]]
