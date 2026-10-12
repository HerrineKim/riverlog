---
title: "실시간 채팅 앱의 프론트엔드 구조"
concept: "Realtime Chat"
summary: "Slack 클론을 예로 본 REST API와 WebSocket을 함께 쓰는 실시간 채팅 앱의 화면 구성·데이터 흐름."
tags: ["react", "websocket", "http", "architecture", "frontend"]
source: til
---

채팅 앱은 "과거 데이터는 REST로 불러오고, 새로 생기는 데이터는 WebSocket으로 받는" 구조가 기본이다. Slack 클론(sleact) 프로젝트에서 백엔드 개발자가 남긴 API 문서를 바탕으로 프론트엔드를 구성한 방식을 일반화해 정리했다.

## 화면 구성

```text
Workspace (레이아웃: 로그인 확인, 소켓 연결)
├── WorkspaceList · ChannelList · DMList (사이드바)
└── 라우트별 페이지
    ├── ChannelMessage  ┐
    └── DirectMessage   ┘─ Header + ChatList + ChatBox
                                     └── Chat (메시지 하나)
```

- 공통 틀(사이드바, 소켓 연결)은 **layouts**, 라우트 단위 화면은 **pages**, 재사용 조각은 **components**로 나눈다.
- `ChatBox`(입력창)를 DM과 채널에서 함께 쓰고, 채널에서만 멘션 기능(`react-mentions`)을 켠다.

## API 설계: 리소스 계층이 URL에 드러난다

| 메서드·경로 | 의미 |
| --- | --- |
| `GET /users` | 내 로그인 정보(비로그인이면 `false`) |
| `POST /users`, `POST /users/login`, `POST /users/logout` | 회원가입, 로그인, 로그아웃 |
| `GET /workspaces` / `POST /workspaces` | 내 워크스페이스 목록 / 생성 |
| `GET /workspaces/:workspace/channels` | 워크스페이스 안 내가 속한 채널 목록 |
| `GET /workspaces/:workspace/channels/:channel/chats?perPage=&page=` | 채널 채팅(페이지네이션) |
| `POST /workspaces/:workspace/channels/:channel/chats` | 채널 채팅 저장 → `message` 소켓 이벤트 발생 |
| `POST .../channels/:channel/images` | 이미지 업로드(multipart) |
| `GET .../channels/:channel/unreads?after=timestamp` | 특정 시점 이후 안 읽은 메시지 수 |
| `GET /workspaces/:workspace/dms/:id/chats` / `POST ...` | DM 조회 / 저장 → `dm` 소켓 이벤트 |
| `GET·POST /workspaces/:workspace/members` | 멤버 목록 / 초대 |

설계에서 배울 점:

- 리소스의 소속 관계(워크스페이스 → 채널 → 채팅)가 경로에 그대로 표현된다.
- 목록 조회는 `perPage`, `page` 쿼리로 **페이지네이션**한다.
- 저장 API가 성공하면 서버가 해당 소켓 이벤트를 **함께 발생**시켜, 다른 사용자에게 실시간으로 전달된다. 즉 "쓰기는 REST, 알림은 소켓"이다.
- 응답 타입(`IUser`, `IChannel`, `IChat`, `IDM`)을 공용 타입 파일(`typings/db.ts`)로 공유하면 프론트와 백엔드가 같은 계약을 본다.

## WebSocket(socket.io) 이벤트

| 방향 | 이벤트 | 데이터 |
| --- | --- | --- |
| 서버 → 클라이언트 (`socket.on`) | `hello` | 연결 테스트 |
| | `onlineList` | 현재 온라인인 사용자 id 목록 |
| | `message` | 새 채널 메시지(IChat) |
| | `dm` | 새 DM(IDM) |
| 클라이언트 → 서버 (`socket.emit`) | `login` | `{ id, channels }` — 워크스페이스·채널 로딩이 끝났음을 알림 |
| 연결 종료 | `disconnect()` | 워크스페이스를 떠날 때 |

```tsx
// hooks/useSocket.ts — 워크스페이스별로 소켓 하나만 유지
import io from 'socket.io-client'

const sockets: Record<string, SocketIOClient.Socket> = {}

const useSocket = (workspace?: string) => {
  const disconnect = useCallback(() => {
    if (workspace) {
      sockets[workspace].disconnect()
      delete sockets[workspace]
    }
  }, [workspace])

  if (!workspace) return [undefined, disconnect] as const
  if (!sockets[workspace]) {
    sockets[workspace] = io(`/ws-${workspace}`, { transports: ['websocket'] })
  }
  return [sockets[workspace], disconnect] as const
}
```

```tsx
// Workspace 레이아웃에서 연결·로그인·정리
useEffect(() => {
  if (socket && userData && channelData) {
    socket.emit('login', { id: userData.id, channels: channelData.map((v) => v.id) })
  }
}, [socket, userData, channelData])

useEffect(() => () => disconnect(), [workspace, disconnect]) // 워크스페이스를 바꾸거나 떠날 때 연결 해제
```

```tsx
// DMList: 온라인 목록 구독, 언마운트 시 리스너 제거
useEffect(() => {
  socket?.on('onlineList', (data: number[]) => setOnlineList(data))
  return () => {
    socket?.off('onlineList')
  }
}, [socket])
```

> 참고: 위 코드의 `SocketIOClient.Socket` 타입과 `import io from 'socket.io-client'`는 socket.io-client 2.x(+`@types/socket.io-client`) 시절 방식이다. 3.x 이후로는 라이브러리가 타입을 직접 제공하므로 `import { io, type Socket } from 'socket.io-client'`로 가져오고 `Record<string, Socket>`처럼 쓴다.

리스너를 등록한 effect에서는 반드시 cleanup으로 `off`해야 한다. 그렇지 않으면 리렌더링마다 리스너가 쌓여 같은 메시지가 여러 번 처리된다.

## 데이터 흐름

1. **초기 로딩**: 채팅 기록은 `useSWRInfinite`로 페이지 단위로 가져온다([SWR](/knowledge/dictionary/frontend/react/swr)).
2. **보내기**: optimistic UI — 캐시에 먼저 추가하고 POST 요청, 실패하면 되돌린다.
3. **받기**: `message`/`dm` 소켓 이벤트를 받으면 현재 보고 있는 대화방의 메시지인지 확인한 뒤 `mutate`로 캐시 앞에 끼워 넣는다. 내가 보낸 메시지는 이미 optimistic으로 추가했으므로 중복 추가하지 않는다.
4. **스크롤**: 새 메시지가 오면 사용자가 바닥 근처에 있을 때만 맨 아래로 스크롤한다. 위로 스크롤해 과거 기록을 읽는 중이면 위치를 유지한다.

## 목록 렌더링 최적화

- **날짜별 구분선**: 메시지를 날짜(`dayjs`로 `YYYY-MM-DD` 포맷)로 그룹핑하는 `makeSection` 유틸을 만든다. `dayjs`는 무거운 `moment`를 대체하는 가벼운 날짜 라이브러리다.
- **무한 스크롤**: 커스텀 스크롤바 라이브러리의 `onScrollFrame`(또는 IntersectionObserver)으로 맨 위에 닿았는지 감지해 `setSize(size + 1)`. 이전 페이지를 위에 붙인 뒤 스크롤 높이 차이만큼 보정해 보던 위치를 유지한다([생명주기의 스크롤 유지 예](/knowledge/dictionary/frontend/react/lifecycle)와 같은 원리).
- **memo**: 메시지 하나(`Chat`)는 한 번 그려지면 거의 바뀌지 않는다. React DevTools Profiler로 확인해 보면 새 메시지가 올 때마다 전체 목록이 다시 그려지므로, `Chat`을 `React.memo`로 감싸 리렌더링을 줄인다.

## 배포

빌드 결과물(번들 JS와 `index.html`)을 서버 개발자에게 전달하거나, 정적 호스팅에 올린다. 개발 중 쓰던 devServer proxy는 배포 환경에서는 동작하지 않으므로, 실제 서버의 CORS 설정이나 같은 도메인 배포를 준비해야 한다.

## 핵심 정리

- 과거 데이터는 REST + 페이지네이션, 새 데이터는 WebSocket 이벤트.
- 쓰기는 REST로 하고, 서버가 저장 성공 시 소켓으로 브로드캐스트한다.
- 소켓은 워크스페이스당 하나만 유지하고, 리스너는 effect cleanup에서 반드시 해제한다.
- 긴 메시지 목록은 날짜 섹션 + 무한 스크롤 + `memo`로 다룬다.

관련 노트: [[rest-api|REST API]], [[websocket|WebSocket]], [[date-libraries|날짜 라이브러리: date-fns와 Day.js]]
