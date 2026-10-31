---
title: "서버 컴포넌트와 클라이언트 컴포넌트 조합 규칙"
concept: "RSC Composition"
summary: "React Server Components에서 서버·클라이언트 컴포넌트를 어떻게 섞을 수 있는지 한 장으로 정리한다. 클라이언트는 서버 안에 넣을 수 있지만 서버를 클라이언트에서 import할 수는 없고, 대신 children·props로 넘길 수 있다. 클라이언트에서 서버 코드를 부르는 Server Function과 그 주의점까지 Next.js 16 문서 기준으로 확인했다."
tags: ["react", "nextjs", "frontend", "rendering"]
source: mixed
date: "2026-10-13"
sources: ["https://nextjs.org/docs/app/getting-started/server-and-client-components", "https://nextjs.org/docs/app/guides/server-and-client-boundary"]
---

> RSC 조합 규칙을 데모 화면으로 보여 주는 스크린샷을 바탕으로 Next.js 16 공식 문서와 대조해 재구성한 노트다.

## 두 종류의 컴포넌트

| | 서버에서 실행 | 브라우저에서 실행 | 코드가 번들에 들어가나 |
| --- | --- | --- | --- |
| 서버 컴포넌트 (기본) | O | X | X |
| 클라이언트 컴포넌트 (`'use client'`) | O (HTML 사전 렌더링) | O (하이드레이션 후) | O |

- **서버 컴포넌트**는 서버에서만 돈다. DB·파일 시스템·비밀값에 바로 접근하고, `async`로 데이터를 가져올 수 있다. 대신 `useState`·`useEffect`·이벤트 핸들러는 못 쓴다.
- **클라이언트 컴포넌트**는 이름과 달리 서버에서도 한 번 렌더링된다(첫 방문 시 HTML). 그다음 브라우저에서 하이드레이션돼 상호작용이 붙는다. 이후 클라이언트 내비게이션에서는 서버 HTML 없이 브라우저에서만 렌더링된다.
- "서버에서 렌더링됐다"는 HTML을 어디서 만들었는지, "서버 컴포넌트"는 코드가 어디서 돌고 브라우저로 가는지를 말한다. 둘은 다른 개념이다.

## 경계를 넘는 두 가지 규칙

`'use client'`는 파일 맨 위(import보다 앞)에 써서 **모듈 그래프에 경계**를 긋는다.

| 무엇이 | 어떻게 넘어가나 |
| --- | --- |
| **코드** | import로 넘어간다. 클라이언트 컴포넌트가 import한 모든 것은 클라이언트 번들에 들어간다 |
| **데이터** | props로 넘어간다. **직렬화 가능해야** 한다. 그래서 일반 함수(`onClick` 등)는 못 넘긴다 |

이 두 규칙에서 아래 조합 규칙이 모두 나온다.

## 조합 규칙 일곱 가지

| # | 규칙 | 비고 |
| --- | --- | --- |
| 1 | 서버 컴포넌트는 서버에서만 렌더링된다 | |
| 2 | 클라이언트 컴포넌트는 서버에서 먼저 렌더링되고, 브라우저에서 다시 렌더링된다 | 첫 방문 기준 |
| 3 | 서버 컴포넌트 안에 클라이언트 컴포넌트를 넣을 수 있다 | |
| 4 | 클라이언트 컴포넌트가 서버 컴포넌트를 **import해서** 넣을 수는 없다 | |
| 5 | 대신 서버 컴포넌트를 `children`·props로 **넘겨 줄 수는** 있다 | 넘기는 쪽이 서버여야 한다 |
| 6 | 클라이언트가 서버에서 코드를 실행할 수 있다 | **Server Function**(`'use server'`). 폼·변경 작업에 쓰면 Server Action |
| 7 | 클라이언트 데이터를 서버로 보내고 결과를 받아올 수 있다 | 가능하지만 **조회용으로는 주의** (아래) |

### 3. 서버 안에 클라이언트

가장 흔한 모양이다. 페이지는 서버 컴포넌트로 두고 상호작용이 필요한 부분만 클라이언트로 만든다. 서버는 클라이언트 컴포넌트 자리에 **참조**와 직렬화한 props를 RSC Payload에 담아 보낸다.

```tsx
// app/[id]/page.tsx: 서버 컴포넌트
import LikeButton from '@/app/ui/like-button'

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const post = await getPost(id)
  return <LikeButton likes={post.likes} />
}
```

### 4·5. 클라이언트 안에 서버: import는 안 되고 children은 된다

클라이언트 파일에서 서버 컴포넌트를 import하면 그 컴포넌트도 **클라이언트 번들로 끌려 들어가** 클라이언트 컴포넌트가 된다. 서버 전용 코드(DB 접근, `fs`, `async` 컴포넌트)가 있으면 깨진다. 서버 전용 모듈에는 `import 'server-only'`를 넣어 실수를 빌드 에러로 바꿀 수 있다.

대신 **이미 렌더링된 React 엘리먼트는 직렬화 가능한 데이터**다. 서버 컴포넌트가 클라이언트 컴포넌트에 서버 컴포넌트를 `children`이나 다른 prop으로 넘기면, 서버가 먼저 렌더링하고 결과만 슬롯에 꽂힌다.

```tsx
// app/ui/modal.tsx
'use client'
export default function Modal({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false)
  return open ? <div>{children}</div> : <button onClick={() => setOpen(true)}>열기</button>
}

// app/page.tsx: 서버 컴포넌트가 조립한다
export default function Page() {
  return (
    <Modal>
      <Cart /> {/* 서버 컴포넌트. 서버에서 미리 렌더링된다 */}
    </Modal>
  )
}
```

넘기는 쪽은 서버여야 한다. `<Cart />`를 쓰는 코드가 서버 컴포넌트 파일에 있어야 서버 그래프에 남는다.

### 6. 클라이언트에서 서버 코드 실행: Server Function

```ts
// app/actions.ts
'use server'
export async function getUptime() {
  return process.uptime()
}
```

`'use server'` 함수를 클라이언트에서 import하면 실제 구현 대신 **참조(액션 ID + 디스패처)만** 번들에 들어가고, 호출하면 서버로 `POST` 요청이 간다. 서버 컴포넌트가 클라이언트 컴포넌트에 prop으로 넘길 수도 있다(일반 함수는 못 넘기지만 Server Function은 참조로 넘어간다). 폼 `action`이나 버튼 `formAction`에 넘기면 Server Action이라 부르고, 결과 데이터와 갱신된 UI가 한 번의 왕복으로 온다.

### 7. 클라이언트 데이터를 서버로 보내 결과 받기: 조회에는 주의

입력값으로 서버에서 검색해 결과를 받아오는 것도 Server Function으로 **할 수는 있다.** 하지만 다음 제약이 있다.

| 주의점 | 내용 |
| --- | --- |
| 순차 실행 | Next.js는 Server Action을 **클라이언트당 하나씩 차례로** 보낸다. 빠르게 세 번 부르면 앞 요청이 끝나야 다음이 간다. `Promise.all`로 병렬화되지 않는다 |
| 용도 | 변경(mutation)용으로 설계됐다. 조회는 서버 컴포넌트에서 가져오거나 **Route Handler**를 쓴다 |
| 보안 | 앱 UI가 아니어도 누구나 그 `POST`를 직접 보낼 수 있다. **모든 Server Function 안에서 인증·권한을 확인**한다 |

입력할 때마다 결과가 바뀌는 검색처럼 호출이 잦은 조회라면, 검색어를 URL 쿼리로 두고 서버 컴포넌트가 다시 렌더링하게 하거나 Route Handler + SWR/TanStack Query가 더 맞다.

## 함께 알아 둘 것

- **props는 브라우저로 간다.** 서버 컴포넌트는 비밀값을 직접 읽을 수 있으니, 클라이언트로 넘기는 props에 민감한 값이 섞이지 않게 한다.
- **Promise도 props로 넘길 수 있다.** 서버에서 요청을 시작하고 Promise를 넘기면, 클라이언트 컴포넌트가 `use()`로 읽고 가장 가까운 `<Suspense>`가 로딩을 맡는다.
- 브라우저 기본 동작으로 충분하면 클라이언트 컴포넌트가 필요 없다. `<details>`, Server Function을 `action`으로 받은 `<form>`, `<video controls>`가 그렇다.
- Context Provider는 클라이언트 컴포넌트라서, 따로 클라이언트 파일로 빼고 루트 레이아웃에서 `children`을 감싼다(규칙 5와 같은 원리).

## 정리

- 서버 컴포넌트가 기본이고, 상호작용이 필요한 잎사귀만 `'use client'`로 만든다.
- 코드는 import로, 데이터는 직렬화된 props로 경계를 넘는다.
- 클라이언트 안에 서버를 넣고 싶으면 import하지 말고 서버 쪽에서 `children`으로 꽂아 준다.
- 클라이언트에서 서버 코드를 부를 땐 Server Function을 쓰되, 순차 실행·인증 확인을 기억하고 잦은 조회는 다른 방법을 고른다.
- 서버에서 실행되는 함수의 총칭은 Server Function이고, Server Action은 그중 폼·변경 작업에 쓰는 경우를 가리킨다.

관련 노트: [[react-server-components|React Server Components의 동작 원리]], [[nextjs-app-router|Next.js App Router의 내비게이션과 데이터 가져오기]], [[nextjs|Next.js를 쓰는 이유]], [[react-use-hook|use 훅과 리액트 비동기 처리]], [[streaming-ssr|스트리밍 SSR]], [[composition|합성: 상속 대신 Composition]]
