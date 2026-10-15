---
title: "React Server Components의 동작 원리"
concept: "React Server Components"
summary: "서버가 컴포넌트 트리를 렌더링해 HTML이 아니라 직렬화된 React 트리(RSC Payload)를 스트리밍하고, 브라우저가 클라이언트 컴포넌트 참조를 실제 코드로 바꿔 트리를 재구성하는 과정을 정리한다. SSR과의 차이, 갱신 방식, 제약까지."
tags: ["react", "nextjs", "frontend", "rendering", "performance"]
source: other
date: "2026-10-15"
sources: ["https://yceffort.kr/2022/01/how-react-server-components-work", "https://react.dev/reference/rsc/server-components"]
---

> yceffort의 「[리액트 서버 컴포넌트의 동작 방식](https://yceffort.kr/2022/01/how-react-server-components-work)」(2022.01)을 바탕으로 React 19 문서와 대조해 재구성한 노트다.

## React Server Components란

**React Server Components(RSC)** 는 컴포넌트 트리의 일부를 서버에서, 나머지를 브라우저에서 렌더링하게 나누는 React의 구조다. 서버 컴포넌트의 코드는 서버에서만 실행되고 **브라우저 번들에 들어가지 않는다.** 브라우저는 그 실행 결과만 받는다.

| 얻는 것 | 이유 |
| --- | --- |
| 데이터에 바로 접근 | DB·파일 시스템·내부 API를 공개 API 계층 없이 부른다 |
| 번들 축소 | 마크다운 파서·날짜 라이브러리처럼 무거운 의존성이 서버에 남는다 |
| 요청 왕복 감소 | 서로 얽힌 여러 데이터 소스를 데이터 가까이에서 한 번에 푼다 |

역할 분담으로 보면 **서버는 데이터를 가져와 내용을 그리고, 브라우저는 상호작용을 맡는다.**

## RSC와 SSR은 다르다

| | SSR | RSC |
| --- | --- | --- |
| 결과물 | HTML 문자열 | 직렬화된 React 트리(RSC Payload) |
| 대상 | 모든 컴포넌트를 똑같이 한 번 렌더링 | 서버 컴포넌트만 서버에서, 클라이언트 컴포넌트는 참조로 남김 |
| 코드가 브라우저로 가나 | 간다 (하이드레이션에 필요) | 서버 컴포넌트 코드는 안 간다 |
| 언제 | 첫 요청 | 첫 요청과 이후 내비게이션 모두 |

둘은 독립적이고 함께 쓸 수 있다. Next.js App Router는 첫 요청에서 **RSC Payload를 만든 뒤 그것으로 HTML까지 SSR**해 함께 보내고, 이후 내비게이션에서는 RSC Payload만 받는다. HTML 측면은 [[spa-csr-ssr|SPA와 CSR·SSR]], 스트리밍은 [[streaming-ssr|스트리밍 SSR]]에 있다.

## 렌더링 과정

```text
요청(URL)
 └─ 서버: 루트 서버 컴포넌트부터 렌더링 (루트는 항상 서버 컴포넌트)
     ├─ HTML 태그          → 그대로 직렬화
     ├─ 서버 컴포넌트      → 함수를 실행해 결과로 치환 (async면 await)
     └─ 클라이언트 컴포넌트 → 함수 대신 "모듈 참조" + 직렬화한 props
 └─ RSC Payload를 줄 단위로 스트리밍
 └─ 브라우저: 모듈 참조를 번들러 매니페스트로 실제 컴포넌트에 연결
     → React 트리 재구성 → 기존 트리와 재조정(reconcile) → DOM 반영
```

### 1. 클라이언트 컴포넌트는 참조로 직렬화된다

함수는 직렬화할 수 없으므로, 서버는 클라이언트 컴포넌트를 "어느 파일의 어느 export인가"라는 **모듈 참조(client reference)** 로 바꾼다. 경계는 파일 맨 위의 `'use client'`가 긋고, 번들러가 그 파일을 별도 청크로 떼어 내 참조 매니페스트를 만든다. 그래서 RSC는 번들러 통합이 필수이고, 보통 프레임워크(Next.js, React Router, Waku 등)를 통해 쓴다.

### 2. props는 직렬화 가능해야 한다

트리가 통째로 직렬화되므로 서버 → 클라이언트 경계를 넘는 props는 직렬화할 수 있는 값이어야 한다. 원시 값, 평범한 객체·배열, `Date`, `Map`, `Set`, Promise, JSX 엘리먼트, Server Function은 넘어가고, 일반 함수(`onClick`)와 클래스 인스턴스는 못 넘어간다. 클라이언트 컴포넌트끼리 주고받는 props는 Payload에 나타나지 않으므로 이 제약이 없다. 구체적인 조합 규칙은 [[server-client-components|서버 컴포넌트와 클라이언트 컴포넌트 조합 규칙]]에 정리했다.

### 3. Payload는 줄 단위 스트림이다

RSC Payload(내부 이름 Flight)는 `ID:값` 한 줄이 하나의 청크인 텍스트 스트림이다. 정확한 형식은 React 내부 구현이라 버전마다 바뀌지만 모양은 이렇다.

```text
1:I["./app/like-button.tsx",["chunk-a.js"],"default"]
0:["$","main",null,{"children":[["$","h1",null,{"children":"글 목록"}],["$","$L1",null,{"likes":3}],["$","$Sreact.suspense",null,{"fallback":"로딩…","children":"$L2"}]]}]
2:["$","ul",null,{"children":[...]}]
```

| 표기 | 뜻 |
| --- | --- |
| `I` 줄 | 클라이언트 컴포넌트 모듈 참조 (파일, 청크, export 이름) |
| `$L1` | 1번 청크를 가리키는 지연(lazy) 참조. 아직 안 왔으면 그 자리에서 suspend한다 |
| `$S…` | `react.suspense` 같은 심벌 |
| `$@` | Promise. 클라이언트에서 `use()`로 읽는다 |

HTML 대신 이 형식을 쓰는 이유는 **브라우저의 목표가 React 트리를 다시 만드는 것**이기 때문이다. HTML을 파싱해 엘리먼트로 되돌리는 것보다 단순하고, 새 Payload를 기존 트리에 재조정해 최소한의 DOM만 바꿀 수 있다.

### 4. Suspense로 스트리밍한다

데이터를 기다리는 서버 컴포넌트는 가장 가까운 `<Suspense>` 자리에 `$L2` 같은 구멍을 남기고, 서버는 나머지를 먼저 보낸다. 데이터가 준비되면 `2:` 줄이 뒤따라 오고 브라우저가 구멍을 채운다. 클라이언트 컴포넌트 청크도 필요해질 때 받으므로, **내용과 코드가 모두 점진적으로 도착한다.**

## 갱신

새 내용을 보려면(내비게이션, `router.refresh()`, Server Action 이후 재검증) 서버에 새 RSC Payload를 요청한다. 브라우저는 받은 트리를 기존 트리와 재조정하므로 **클라이언트 컴포넌트의 state와 포커스가 유지된다.** Next.js는 바뀐 라우트 구획(레이아웃 아래 페이지 등)만 다시 받아 오고, 받은 Payload는 클라이언트 캐시에 둔다([[nextjs-app-router|App Router의 내비게이션]]).

## 언제 쓰나

| 서버 컴포넌트가 맞다 | 클라이언트 컴포넌트가 맞다 |
| --- | --- |
| 가공된 데이터를 그대로 그리는 화면 | 입력·드래그처럼 즉각 반응해야 하는 UI |
| 렌더링에 무거운 라이브러리가 필요 | `useState`·`useEffect`·브라우저 API가 필요 |
| 여러 데이터 소스를 엮어야 함 | 사용자 입력마다 바뀌는 데이터 (SWR·TanStack Query) |

## 한계

- 클라이언트 컴포넌트는 서버 컴포넌트를 import할 수 없다. 서버 쪽에서 `children`으로 꽂아 넘긴다.
- 서버 컴포넌트는 state·이벤트 핸들러를 가질 수 없고, 함수 props를 넘길 수 없다(Server Function은 예외).
- 서버 내용이 바뀌려면 네트워크 왕복이 필요하다. 오프라인·즉각 반응이 중요한 부분은 클라이언트에 둔다.
- 번들러·서버 통합이 필요해 사실상 프레임워크에 묶인다.

## 역사

RSC는 2020년 12월 실험 데모로 처음 공개됐다. 초기에는 `*.server.jsx`·`*.client.jsx` 파일 이름으로 경계를 정했고, 브라우저는 `createFromFetch(...).readRoot()`로 Payload를 읽었다. 이후 파일 이름 규칙 대신 `'use client'`·`'use server'` 지시어로 바뀌었고, Next.js 13 App Router(2023, 안정화)가 첫 대중적 구현이 됐다. React 19(2024.12)에서 서버 컴포넌트가 안정 기능이 됐다. 다만 번들러·프레임워크 연동 API는 여전히 마이너 버전 사이에 바뀔 수 있다.

## 정리

- RSC는 서버 컴포넌트를 서버에서 실행해 **결과만** 보내고, 그 코드는 번들에서 뺀다.
- 결과물은 HTML이 아니라 직렬화된 React 트리이고, 클라이언트 컴포넌트는 모듈 참조로 들어간다.
- 경계를 넘는 props는 직렬화 가능해야 한다.
- Suspense 구멍을 두고 줄 단위로 스트리밍하며, 갱신은 새 Payload를 받아 재조정해 클라이언트 state를 지킨다.
- RSC와 SSR은 별개이고, 프레임워크는 둘을 함께 써서 첫 화면은 HTML로, 이후 이동은 Payload로 처리한다.

관련 노트: [[server-client-components|서버 컴포넌트와 클라이언트 컴포넌트 조합 규칙]], [[nextjs-app-router|Next.js App Router의 내비게이션과 데이터 가져오기]], [[streaming-ssr|스트리밍 SSR]], [[spa-csr-ssr|SPA와 CSR·SSR]], [[react-use-hook|use 훅과 리액트 비동기 처리]]
