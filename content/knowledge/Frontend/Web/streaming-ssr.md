---
title: "스트리밍 SSR"
concept: "Streaming SSR"
summary: "HTML을 한 번에 다 만들어 보내지 않고 Suspense 경계 단위로 나눠 흘려보내는 SSR. React 18에서 도입됐고, 지금은 React 19의 부분 사전 렌더링과 Next.js Cache Components의 기반이 되어 기본 동작으로 자리 잡았다."
tags: ["frontend", "react", "rendering", "performance", "web"]
source: other
date: "2026-10-13"
sources: ["https://react.dev/reference/react-dom/server", "https://react.dev/blog/2025/10/01/react-19-2", "https://nextjs.org/docs/app/guides/streaming", "https://prepare-frontend-interview.vercel.app/react", "https://react.dev/blog/2024/04/25/react-19-upgrade-guide"]
---

> React 공식 문서(react-dom/server, React 19.2 릴리스 노트)와 Next.js 16 「Streaming」 가이드를 바탕으로 재구성한 노트다.
> 「[프론트엔드 면접 준비: React](https://prepare-frontend-interview.vercel.app/react)」 정리로 React 19 기준 SSR API 목록을 보강했다.

## 스트리밍 SSR이란

전통적인 SSR은 서버가 **HTML 문서 전체를 완성한 뒤에** 응답한다. 느린 쿼리가 하나만 있어도 페이지 전체가 그만큼 늦는다. 스트리밍 SSR은 HTTP 청크 전송(chunked transfer encoding)으로 **준비된 부분부터 조각조각 보낸다**. 서버가 나머지를 만드는 동안 브라우저는 이미 받은 HTML을 그리기 시작한다.

React에서는 **`<Suspense>` 경계가 조각을 나누는 단위**다. 경계 바깥은 먼저 보내고, 경계 안쪽은 fallback을 먼저 보냈다가 준비되면 진짜 내용으로 바꿔 끼운다.

## 발전 과정

스트리밍은 선택 기능에서 **기본 동작**으로 바뀌었다.

| 시기 | 변화 |
| --- | --- |
| React 17 이전 | `renderToString`: 문자열 한 덩어리, 전체를 기다림. 서버에서 Suspense를 쓸 수 없음 |
| React 18 (2022) | `renderToPipeableStream`·`renderToReadableStream` 도입. 스트리밍 + 선택적 hydration |
| Next.js 13+ App Router | `loading.js`와 `<Suspense>`만으로 별도 설정 없이 스트리밍 |
| React 19.2 (2025.10) | 부분 사전 렌더링(`prerender` → `resume`). Suspense 경계 공개를 묶어서 처리 |
| Next.js 16 Cache Components | 정적 껍데기는 빌드 때 만들어 CDN에서, 동적 부분은 요청 때 스트리밍 |

| API | 쓰임 |
| --- | --- |
| `renderToPipeableStream` | Node.js 스트림으로 스트리밍 SSR |
| `renderToReadableStream` | Web Streams 환경(Deno, 엣지 런타임, 최신 Node.js)의 스트리밍 SSR |
| `prerender`·`prerenderToNodeStream` (`react-dom/static`) | 데이터가 모두 준비될 때까지 기다려 정적 HTML 생성(SSG) |
| `renderToString`·`renderToStaticMarkup` | 레거시. Suspense를 기다리지 않고 문자열 한 덩어리를 만든다 |
| `hydrateRoot` (`react-dom/client`) | 브라우저에서 서버 HTML을 이어받아 hydration |

React 19에서 옛 Node 스트림 API인 `renderToNodeStream`·`renderToStaticNodeStream`과 클라이언트의 `ReactDOM.hydrate`는 제거됐다. 옛 코드에서 보면 각각 `renderToPipeableStream`(정적 결과가 필요하면 `onAllReady`까지 기다린다)과 `hydrateRoot`로 바꾼다.

React 문서는 `renderToString`·`renderToStaticMarkup`을 **레거시(Legacy)** API로 분류한다. 스트리밍 API보다 기능이 제한되기 때문이다. 핵심 원리(Suspense 경계, 선택적 hydration, HTTP 상태 코드 제약)는 React 18 때와 같다. 달라진 점은 렌더링 시점이다. 요청마다 처음부터 렌더링하고 스트리밍하던 것이 **정적 부분은 미리 만들고 동적 부분만 이어서 스트리밍하는 방식**으로 진화했다.

## 동작 흐름

```text
요청
 └─ 첫 청크: 정적 껍데기(static shell)
 │    <head>·CSS·JS 링크, 레이아웃, 내비게이션,
 │    Suspense fallback 자리 <template id="B:0">
 │    → 브라우저가 바로 그리고 CSS·JS 다운로드 시작
 ├─ 다음 청크: 컴포넌트 payload (hydration용)
 ├─ +1s: 경계 0 완료 → <div hidden id="S:0">완성된 HTML</div> + 교체 스크립트
 └─ +3s: 경계 1 완료 → <div hidden id="S:1">…</div> + 교체 스크립트
```

- 교체 스크립트는 인라인이라 **JS 번들이나 hydration을 기다리지 않고** 바로 fallback을 바꾼다.
- 형제 Suspense 경계끼리는 서로를 막지 않는다. 먼저 끝난 것부터 들어온다.
- 중첩 경계는 바깥이 끝나야 안쪽 fallback이 보이므로 단계적으로 드러난다.

## 무엇이 좋아지나

| 지표 | 효과 |
| --- | --- |
| TTFB·FCP | 가장 느린 쿼리를 기다리지 않고 껍데기만 그리면 응답이 나간다 |
| INP | 선택적 hydration(selective hydration): 경계마다 따로 hydration하고, 사용자가 건드린 부분을 먼저 처리한다. 한 번에 길게 막히지 않는다 |
| 리소스 발견 | 첫 청크에 CSS·JS·폰트 링크가 있어 서버가 생각하는 동안 다운로드가 진행된다 |

## 주의할 점

### 1. 상태 코드와 헤더는 첫 청크에서 확정된다

스트리밍이 시작되면 `200 OK`가 이미 나간 상태다. 그 뒤에 `notFound()`가 나오면 404로 바꿀 수 없어서 Next.js는 `noindex` 메타 태그를 넣고, `redirect()`는 클라이언트 측 이동으로 바뀐다. **진짜 404나 리다이렉트가 필요하면 Suspense 경계와 느린 `await`보다 앞에서** 판단하거나 proxy·설정 리다이렉트로 처리한다.

### 2. Suspense를 아무 데나 두면 LCP가 늦어진다

LCP 요소(히어로 이미지, 주요 제목)가 경계 안에 있으면 교체 스크립트가 실행될 때까지 그려지지 않는다. LCP 요소는 경계 **바깥·위**에 둔다. 느린 네트워크나 바쁜 CPU에서는 React가 예상하지 못한 경계의 fallback을 보여 줄 수도 있으니, 필요 없는 경계는 만들지 않는다.

### 3. fallback 크기가 다르면 CLS가 생긴다

스켈레톤을 실제 콘텐츠와 같은 크기로 만들거나, 감싸는 영역에 최소 높이를 준다.

### 4. 중간 계층이 버퍼링하면 효과가 사라진다

| 계층 | 문제 · 대응 |
| --- | --- |
| Nginx 같은 리버스 프록시 | 기본으로 응답을 모았다 보냄 → `X-Accel-Buffering: no` |
| CDN | 응답 전체를 버퍼링하는 곳이 있음 → 스트리밍 지원 여부 확인 |
| 서버리스 | AWS Lambda는 응답 스트리밍 모드를 따로 켜야 함 |
| gzip·Brotli 압축 | 압축기가 데이터를 모으느라 첫 청크가 늦어질 수 있음 |
| Safari | 1024바이트를 받을 때까지 버퍼링(작은 데모에서만 체감) |
| 정적 export | 서버가 없으니 스트리밍 불가 |

DevTools Network 탭에서 문서 요청의 TTFB가 짧고 Content Download가 길면 실제로 스트리밍되고 있는 것이다.

### 5. 봇은 스트리밍을 받지 않을 수 있다

HTML만 읽는 크롤러를 위해 Next.js는 user agent로 봇을 가려 `generateMetadata`가 끝날 때까지 기다렸다가 `<head>`를 채운다. DOM을 실행하는 브라우저·크롤러는 스트리밍 메타데이터를 받는다.

## Next.js에서 쓰는 법

```tsx
export default function Dashboard() {
  return (
    <div>
      <h1>Dashboard</h1> {/* 정적 껍데기: LCP 후보는 바깥에 */}
      <Suspense fallback={<RevenueSkeleton />}>
        <Revenue /> {/* async 서버 컴포넌트 */}
      </Suspense>
      <Suspense fallback={<OrdersSkeleton />}>
        <RecentOrders />
      </Suspense>
    </div>
  )
}
```

- `loading.js`는 페이지 전체를 감싸는 Suspense다. 데이터 없이는 아무것도 그릴 수 없는 페이지에 쓴다. 나머지는 경계를 데이터를 쓰는 곳 가까이 둔다.
- `cookies()`·`params`·`fetch`를 레이아웃 꼭대기에서 `await`하면 그 아래 전체가 동적이 된다. **Promise를 그대로 내려 보내고 필요한 컴포넌트가 경계 안에서 푼다**(클라이언트 컴포넌트라면 [[react-use-hook|use 훅]]). 레이아웃에서 기다리면 왜 하위 구획이 모두 막히는지는 [[nextjs-app-router|App Router 노트]]의 「렌더링을 막는 위치」에 있다.
- Cache Components를 쓰면 경계 없이 동적 데이터에 접근할 때 빌드 오류(blocking route)가 난다. 경계를 강제하는 셈이다.

## 정리

- 스트리밍 SSR은 "SSR이냐 CSR이냐"의 이분법을 깨고 **한 페이지 안에서 빠른 부분과 느린 부분을 따로 보낸다**.
- 원리는 React 18에서 정해졌다. `renderToString`만 쓰는 방식은 레거시다.
- 지금의 흐름은 **정적 껍데기를 최대한 키우고(캐시) Suspense 경계는 동적 데이터 바로 옆에 두는 것**이다.
- 대가도 있다. 상태 코드를 나중에 바꿀 수 없고, 프록시·CDN 버퍼링에 약하며, 경계를 잘못 두면 LCP·CLS가 나빠진다.

어디서 렌더링할지보다 어디에 Suspense 경계를 둘지가 렌더링 전략의 핵심 결정이 되었다.

관련 노트: [[spa-csr-ssr|SPA와 CSR·SSR]], [[nextjs-app-router|Next.js App Router의 내비게이션과 데이터 가져오기]], [[nextjs|Next.js를 쓰는 이유]], [[react-use-hook|use 훅과 리액트 비동기 처리]], [[browser-rendering|브라우저 렌더링 과정]]
