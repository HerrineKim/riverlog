---
title: "실시간 채팅 앱의 데이터 흐름: REST와 WebSocket 역할 나누기"
concept: "Realtime Chat"
summary: "채팅 앱은 상태 조회·변경은 REST로, 새로 생기는 이벤트 전달은 WebSocket으로 나눈다. 리소스 계층이 드러나는 URL 설계, 소켓 연결의 수명 관리, optimistic UI와 중복 방지, 긴 메시지 목록의 렌더링 최적화 포인트를 정리한다."
tags: ["react", "websocket", "http", "architecture", "frontend"]
source: til
date: "2026-10-13"
---

채팅 앱의 데이터는 두 종류다. **이미 있는 것**(과거 메시지, 채널 목록, 내 정보)과 **지금 생기는 것**(새 메시지, 접속 상태)이다. 앞은 요청하면 응답이 오는 REST가 맞고, 뒤는 서버가 먼저 밀어 줘야 하므로 [[websocket|WebSocket]]이 맞다. 두 채널을 어떻게 나누고 어디서 만나게 하는지가 채팅 앱 프론트엔드 설계의 핵심이다.

## REST와 WebSocket의 역할

| 채널 | 맡는 일 | 예 |
| --- | --- | --- |
| REST | 상태 **조회**와 **변경**. 페이지네이션, 인증, 파일 업로드 | 채팅 기록 불러오기, 메시지 저장, 멤버 초대 |
| WebSocket | 서버에서 클라이언트로 **이벤트 푸시** | 새 메시지 도착, 온라인 사용자 목록 변화 |

**쓰기는 REST, 알림은 소켓**이다. 메시지를 보낼 때 소켓으로 직접 보내지 않고 `POST`로 저장한다. 서버는 저장에 성공하면 같은 방의 다른 사용자에게 소켓 이벤트를 발생시킨다. 이렇게 하면 저장 실패를 HTTP 응답으로 분명히 알 수 있고, 소켓이 끊겨 있어도 메시지는 유실되지 않는다.

## URL에 리소스 계층이 드러나게

```text
GET  /workspaces/:workspace/channels                    워크스페이스 안의 채널 목록
GET  /workspaces/:workspace/channels/:channel/chats      채널의 채팅 (?perPage=&page=)
POST /workspaces/:workspace/channels/:channel/chats      채팅 저장 → 서버가 message 이벤트 발생
GET  /workspaces/:workspace/channels/:channel/unreads    ?after=timestamp 이후 안 읽은 수
```

- 소속 관계(워크스페이스 → 채널 → 채팅)가 경로에 그대로 보여, URL만 읽어도 무엇을 가져오는지 알 수 있다.
- 목록은 `perPage`·`page` 쿼리로 페이지네이션한다. 채팅처럼 끝없이 쌓이는 데이터를 한 번에 받지 않는다.

## 소켓 연결의 수명

소켓은 **범위(워크스페이스) 하나에 연결 하나**만 유지한다. 컴포넌트마다 연결을 만들면 같은 이벤트를 여러 번 받는다.

```tsx
// 범위별로 소켓을 하나만 보관하는 훅의 골격
const sockets: Record<string, Socket> = {}

function useSocket(scope?: string) {
  const disconnect = useCallback(() => {
    if (!scope) return
    sockets[scope]?.disconnect()
    delete sockets[scope]
  }, [scope])
  if (!scope) return [undefined, disconnect] as const
  sockets[scope] ??= io(`/ws-${scope}`, { transports: ['websocket'] })
  return [sockets[scope], disconnect] as const
}
```

- 범위를 떠나면 `disconnect()`한다. effect의 cleanup이 그 자리다.
- 이벤트 리스너를 `on`으로 등록한 effect는 **반드시 cleanup에서 `off`** 한다. 빠뜨리면 리렌더링마다 리스너가 쌓여 한 메시지가 여러 번 처리된다.

## 두 채널이 만나는 곳: 메시지 캐시

과거 기록과 실시간 메시지는 결국 **같은 목록**에 들어가야 한다. 서버 상태 라이브러리의 캐시가 그 합류점이 된다.

1. **초기 로딩**: 기록을 페이지 단위로 가져온다([[swr|SWR]]의 `useSWRInfinite`나 TanStack Query의 `useInfiniteQuery`).
2. **보내기**: optimistic UI. 캐시에 먼저 넣고 `POST`를 보낸다. 실패하면 되돌린다.
3. **받기**: 소켓 이벤트가 오면 지금 보고 있는 방의 메시지인지 확인한 뒤 캐시 앞에 끼워 넣는다. **내가 보낸 메시지는 이미 optimistic으로 들어가 있으므로 다시 넣지 않는다.**
4. **스크롤**: 새 메시지가 왔을 때 사용자가 바닥 근처에 있으면 맨 아래로 내리고, 위로 올라가 과거를 읽는 중이면 위치를 유지한다.

## 긴 목록의 렌더링 최적화

| 포인트 | 방법 |
| --- | --- |
| 날짜 구분선 | 메시지를 날짜 키(`YYYY-MM-DD`)로 묶는 유틸을 두고 섹션 단위로 그린다([[date-libraries|날짜 라이브러리]]) |
| 무한 스크롤 | 맨 위에 닿으면 이전 페이지를 요청한다. 위에 붙인 뒤 **늘어난 높이만큼 스크롤을 보정**해 보던 위치를 유지한다 |
| 메시지 항목 memo | 메시지 하나는 한 번 그려지면 거의 바뀌지 않는다. `React.memo`로 감싸 새 메시지가 올 때 전체 목록이 다시 그려지는 것을 막는다([[re-rendering|리렌더링 원인 추적하기]]) |

## 정리

- 조회·변경은 REST, 이벤트 푸시는 WebSocket. 쓰기는 REST로 하고 서버가 소켓으로 알린다.
- URL은 리소스의 소속 관계를 드러내고, 목록은 페이지네이션한다.
- 소켓은 범위당 하나, 리스너는 cleanup에서 해제한다.
- 두 채널의 데이터는 메시지 캐시에서 합류한다. optimistic UI와 중복 방지는 그 캐시 위에서 한다.

관련 노트: [[websocket|WebSocket]], [[rest-api|REST API]], [[swr|SWR로 데이터 가져오기]], [[lifecycle|생명주기]]
