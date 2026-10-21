---
title: "API 모킹: MSW와 json-server"
concept: "API Mocking"
summary: "백엔드 API가 없거나 불안정할 때 프론트엔드가 가짜 응답으로 개발·테스트하는 방법. 코드 속 가짜 데이터, json-server 같은 가짜 REST 서버, 네트워크 단에서 요청을 가로채는 MSW를 비교하고, MSW 2의 핸들러(http·HttpResponse)와 브라우저(Service Worker)·Node(setupServer) 설정, 테스트에서 핸들러를 바꿔 끼우는 법을 정리한다."
tags: ["testing", "api", "mocking", "frontend"]
source: other
date: "2026-10-21"
sources: ["https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/MSW.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/GIt/JSON%20server.md", "https://mswjs.io/docs/", "https://github.com/typicode/json-server"]
---

> 「[Frontend_TIL: MSW](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/MSW.md)」와 「[JSON server](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/GIt/JSON%20server.md)」를 바탕으로, API는 MSW 2 공식 문서로 확인해 재구성한 노트다.

## API 모킹이란

**API 모킹**은 실제 서버 대신 미리 정한 가짜 응답을 돌려줘서, 서버 없이도 프론트엔드를 개발·테스트하는 일이다. 쓰는 때는 크게 셋이다.

| 상황 | 이유 |
| --- | --- |
| 백엔드와 동시에 개발 | API가 완성될 때까지 기다리지 않는다. 미리 합의한 API 명세(OpenAPI 등)대로 응답을 흉내 낸다 |
| 테스트 | 실제 네트워크는 느리고, 결과가 바뀌고, 오류 응답을 마음대로 만들 수 없다 |
| 재현 | 빈 목록·500 오류·느린 응답·특정 사용자 상태처럼 실서버에서 만들기 어려운 경우를 고정해 본다 |

## 방법 비교

| 방법 | 어떻게 | 장점 | 단점 |
| --- | --- | --- | --- |
| 코드 속 가짜 데이터 | `fetchUser = () => Promise.resolve({...})`, 모듈 목 | 설치가 필요 없다 | 실제 요청 코드(`fetch`·헤더·상태 코드 처리)를 거치지 않는다. API가 생기면 코드를 고쳐야 한다 |
| 가짜 REST 서버 (json-server) | JSON 파일 하나로 CRUD 서버를 띄운다 | 실제 HTTP 요청이라 앱 코드를 바꾸지 않는다. 저장까지 된다 | 서버 프로세스를 따로 띄운다. 응답 모양을 세밀하게 만들기 어렵다. 테스트에 넣기 번거롭다 |
| 네트워크 가로채기 (MSW) | 나가는 요청을 가로채 핸들러가 응답한다 | 앱 코드는 실제 URL로 요청한다. **같은 핸들러를 브라우저·테스트·Storybook에서** 쓴다 | 핸들러를 직접 써야 한다 |

API가 생긴 뒤에는 가짜 쪽만 끄면 된다는 점에서 **앱 코드가 실제 URL로 요청하는 방식**(json-server, MSW)이 낫다. 테스트까지 함께 쓰려면 MSW가 표준이다.

## json-server: JSON 파일 하나로 REST 서버

`db.json`의 최상위 키가 곧 리소스 경로가 된다.

```json
{
  "todos": [
    { "id": "1", "content": "HTML", "completed": true },
    { "id": "2", "content": "CSS", "completed": false }
  ]
}
```

```bash
npm install -D json-server
npx json-server db.json          # 기본 http://localhost:3000
```

| 요청 | 동작 |
| --- | --- |
| `GET /todos`, `GET /todos/1` | 목록, 하나 |
| `POST /todos` | 추가. `db.json` 파일에 실제로 저장된다 |
| `PUT`·`PATCH`·`DELETE /todos/1` | 수정, 삭제 |
| `GET /todos?completed=true&_sort=content` | 필터·정렬. 연산자와 페이지네이션 문법은 버전마다 다르니 README를 본다 |

자주 띄운다면 `package.json`의 `scripts`에 `"mock": "json-server db.json --port 4000"`처럼 등록한다. 앱의 개발 서버와 포트가 겹치지 않게 한다.

## MSW: 네트워크 단에서 가로채기

**MSW(Mock Service Worker)** 는 앱이 보낸 요청을 **나가는 길목에서 가로채** 핸들러가 만든 응답을 돌려준다. 앱은 실제 서버와 통신한다고 생각한다.

| 환경 | 가로채는 방법 | 설정 함수 |
| --- | --- | --- |
| 브라우저 | Service Worker가 페이지의 `fetch` 요청을 받는다. 개발자 도구 Network 탭에도 보인다 | `setupWorker` (`msw/browser`) |
| Node (Vitest·Jest·SSR) | Node의 요청 모듈(`http`, `fetch`)을 가로챈다. Service Worker가 없기 때문이다 | `setupServer` (`msw/node`) |

Service Worker 자체는 [[pwa-service-worker|서비스 워커]]에 정리했다.

### 핸들러

```ts
// src/mocks/handlers.ts
import { http, HttpResponse, delay } from 'msw'

export const handlers = [
  http.get('/api/user', async () => {
    await delay(400)                                    // 응답 지연 재현
    return HttpResponse.json({ username: 'admin' })
  }),
  http.post('/api/todos', async ({ request }) => {
    const todo = await request.json()
    return HttpResponse.json(todo, { status: 201 })
  }),
  http.get('/api/todos/:id', ({ params }) => {
    if (params.id === '0') return new HttpResponse(null, { status: 404 })
    return HttpResponse.json({ id: params.id })
  }),
]
```

- `http.get`·`post`·`put`·`delete`·`all`이 메서드와 경로를 맞춘다. 경로에는 `:id` 같은 매개변수와 와일드카드를 쓴다. GraphQL은 `graphql.query`·`graphql.mutation`.
- 응답은 Fetch API의 `Response`를 그대로 쓰거나 `HttpResponse.json()`·`.text()` 같은 도우미를 쓴다.
- 과거(MSW 1)에는 `rest.get(url, (req, res, ctx) => res(ctx.status(200), ctx.json(...)))` 꼴이었다. MSW 2(2023)에서 `rest`는 `http`로, `res`·`ctx`는 표준 `Response`로 바뀌었다. 옛 코드를 볼 때 이 대응만 알면 읽힌다.

### 브라우저에서 켜기

```bash
npx msw init public/ --save      # Service Worker 스크립트를 정적 파일 폴더에 생성
```

`public/`처럼 **개발 서버가 루트(`/`)에서 그대로 내주는 폴더**에 `mockServiceWorker.js`가 생긴다. 이 파일은 저장소에 커밋한다. `--save`는 경로를 `package.json`에 적어 MSW를 업데이트할 때 같이 갱신되게 한다.

```ts
// src/mocks/browser.ts
import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'
export const worker = setupWorker(...handlers)

// src/main.tsx: 개발 모드에서만, 워커가 준비된 뒤 렌더링한다
async function enableMocking() {
  if (!import.meta.env.DEV) return
  const { worker } = await import('./mocks/browser')
  return worker.start()
}
enableMocking().then(() => createRoot(root).render(<App />))
```

`worker.start()`는 Promise다. 기다리지 않고 렌더링하면 첫 요청이 가로채지기 전에 나가 버린다. 켜지면 브라우저 콘솔에 `[MSW] Mocking enabled.`가 찍힌다. 동적 `import`로 불러오면 배포 번들에 모킹 코드가 들어가지 않는다.

### 테스트에서 쓰기

```ts
// test/setup.ts
import { setupServer } from 'msw/node'
import { handlers } from '../src/mocks/handlers'

export const server = setupServer(...handlers)
beforeAll(() => server.listen({ onUnhandledRequest: 'error' }))
afterEach(() => server.resetHandlers())   // 테스트에서 바꾼 핸들러를 되돌린다
afterAll(() => server.close())
```

```ts
test('서버 오류면 안내 문구를 보여 준다', async () => {
  server.use(http.get('/api/user', () => new HttpResponse(null, { status: 500 })))
  render(<Profile />)
  expect(await screen.findByText('잠시 후 다시 시도해 주세요')).toBeInTheDocument()
})
```

- 기본 핸들러는 성공 경로로 두고, 오류·빈 응답은 테스트 안에서 `server.use()`로 **덮어쓴다.**
- `onUnhandledRequest: 'error'`로 핸들러가 없는 요청을 실패로 만들면 빠뜨린 모킹을 바로 안다.
- 같은 `handlers`를 Storybook에도 붙인다([[storybook|Storybook]]).

`fetch`를 직접 바꿔 끼우는 방식에서 MSW로 넘어가는 시점은 [[component-test-dependencies|의존성이 있는 컴포넌트 테스트하기]]에 있다.

## 주의할 점

- 모킹 응답은 **명세의 사본**이다. API가 바뀌면 조용히 어긋난다. OpenAPI 스키마에서 핸들러를 생성하거나, 실제 서버를 쓰는 E2E·계약 테스트를 일부 둔다.
- 배포 빌드에서는 반드시 꺼져 있어야 한다. 환경 변수와 동적 import로 막는다.
- Service Worker는 HTTPS나 `localhost`에서만 등록된다. 다른 서비스 워커(PWA)를 쓰는 앱이면 범위가 겹치지 않는지 본다.

## 정리

- API 모킹은 서버 없이 개발하고, 테스트 결과를 고정하고, 드문 상황을 재현하려고 한다.
- 앱 코드를 바꾸지 않는 방식이 낫다: 저장까지 되는 가짜 서버는 json-server, 개발·테스트·Storybook 공용은 MSW.
- MSW 2는 `http.get(url, () => HttpResponse.json(...))`. 브라우저는 `setupWorker`, Node는 `setupServer`.
- 테스트에서는 기본 핸들러 + `server.use()` 덮어쓰기 + `resetHandlers()`.

관련 노트: [[frontend-test-types|프론트엔드 테스트의 종류와 도구]], [[component-test-dependencies|의존성이 있는 컴포넌트 테스트하기]], [[storybook|Storybook]], [[pwa-service-worker|서비스 워커]], [[rest-api|REST API]]
