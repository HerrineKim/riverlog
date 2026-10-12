---
title: "Next.js"
concept: "Next.js"
summary: "React 위에 라우팅·렌더링 전략·캐싱을 얹은 프레임워크. 왜 쓰는지, App Router가 데이터를 어떻게 가져오는지, 서버·클라이언트 컴포넌트를 어떻게 섞는지 정리한 노트 모음."
tags: ["nextjs", "react", "frontend", "rendering"]
source: mixed
---

Next.js는 React 앱에 **서버 렌더링과 라우팅, 데이터 캐싱**을 기본으로 제공하는 프레임워크다. React만 쓰면 빈 HTML을 내려보내고 브라우저가 화면을 그리지만, Next.js는 서버에서 HTML을 만들어 첫 화면과 검색 노출을 개선한다. Next.js 13부터 도입된 App Router는 서버 컴포넌트를 기본으로 삼아, 데이터를 서버에서 가져오고 상호작용이 필요한 부분만 클라이언트로 보낸다. 이 주제의 노트는 "왜 쓰나 → App Router의 동작 → 컴포넌트 조합 규칙" 순서로 읽으면 자연스럽다.

## 노트

- [Next.js를 쓰는 이유](Frontend/Next.js/nextjs.md): CSR의 한계, SSR·SSG로 얻는 SEO, 파일 기반 라우팅, `fetch` 캐싱·재검증과 Next.js 16의 `'use cache'`
- [Next.js App Router의 내비게이션과 데이터 가져오기](Frontend/Next.js/nextjs-app-router.md): Link·useRouter와 prefetch, soft/hard navigation, 서버 컴포넌트의 병렬·순차 fetch, 요청 중복 제거와 React `cache()`
- [서버 컴포넌트와 클라이언트 컴포넌트 조합 규칙](Frontend/Next.js/server-client-components.md): 클라이언트 안에 서버를 import할 수 없는 이유, children·props로 넘기기, Server Function

관련 주제: 렌더링 방식의 개념은 [SPA와 CSR·SSR](Frontend/Web/spa-csr-ssr.md), 스트리밍은 [스트리밍 SSR](Frontend/Web/streaming-ssr.md)에 있다.
