---
title: "React와 Vue 말고: Svelte, Angular, Preact, Alpine.js, HTMX"
concept: "Frontend Frameworks"
summary: "State of Frontend 2024 설문에서 React·Vue 다음으로 많이 쓰인 프레임워크들의 특징을 비교한다. 컴파일러, 풀스택 프레임워크, 경량 대체재, HTML 속성 기반 도구로 성격이 갈린다."
tags: ["frontend", "javascript", "architecture"]
source: mixed
date: "2026-10-12"
sources: ["https://riverkim.kr/315"]
---

> riverkim.kr에 쓴 글(2025.06)을 다시 정리한 노트입니다. 점유율 수치는 2024년 설문 기준입니다.

## 얼마나 쓰이나

국내 채용 시장에서는 React와 Vue 외의 프레임워크를 찾기 어렵다. 하지만 The Software House의 [State of Frontend 2024](https://tsh.io/state-of-frontend) 설문(프론트엔드 개발자 6,028명)에서 "작년에 써 봤고 좋은 경험이었다"는 응답을 보면 다른 선택지도 적지 않다.

![[riverkim/315-3.jpg]]

| 프레임워크 | 응답 비율 |
| --- | --- |
| React | 69.9% |
| Vue | 44.8% |
| Svelte | 25.8% |
| Angular 2+ | 22.1% |
| Preact | 9% |
| Alpine.js | 7% |
| HTMX | 7% |

## 한눈에 비교

| 이름 | 성격 | 강점 | 어울리는 경우 |
| --- | --- | --- | --- |
| Svelte | 런타임이 아닌 **컴파일러** | 작은 번들, 빠른 동작, HTML에 가까운 간결한 문법 | 성능과 코드량이 중요할 때 |
| Angular 2+ | 구글의 TypeScript 기반 **풀스택 프레임워크** | 안정적인 지원, 컴포넌트 구조, 내장 기능·라이브러리가 많음 | 큰 규모의 기업 애플리케이션 |
| Preact | React와 거의 같은 API의 **경량 대체재** | 작고 빠름, React 지식 그대로 사용 | React 문법이 익숙하고 용량을 줄이고 싶을 때 |
| Alpine.js | HTML 속성으로 상태·동작을 붙이는 **경량 라이브러리** | 빌드 설정 없이 바로 사용 | 서버 렌더링 페이지에 약간의 동적 동작을 더할 때 |
| HTMX | HTML 속성으로 AJAX 요청·화면 교체를 선언하는 **라이브러리** | JavaScript를 거의 쓰지 않음, `<script>` 하나로 적용 | 서버 개발자가 가벼운 프론트를 만들 때 |

### Svelte

2016년에 나왔다. 다른 프레임워크처럼 브라우저에서 돌아가는 런타임을 싣지 않고, **빌드 시점에 컴포넌트를 순수 JavaScript로 컴파일**한다. 그래서 번들이 작고 빠르다. 문법이 HTML과 비슷해 코드가 짧고 읽기 쉽다.

### Angular 2+

Angular 2부터 TypeScript 지원과 컴포넌트 기반 구조로 크게 바뀌었고, 2 이상 버전을 묶어 Angular 2+라고 부른다. 라우팅·폼·HTTP 같은 기능을 프레임워크가 기본 제공해 선택할 것이 적다. 모바일 앱에 코드를 거의 그대로 가져갈 수 있다는 점도 장점으로 꼽힌다.

### Preact

React의 무게와 속도를 줄이려고 만들었다. 가상 DOM을 가볍게 구현하고 실제 DOM에 더 가깝게 동작해 용량이 작다. `preact/compat` 호환 계층을 쓰면 React 생태계 라이브러리도 대부분 쓸 수 있다.

### Alpine.js

HTML 요소에 `x-data`, `x-on`, `x-show` 같은 속성으로 상태와 이벤트를 바로 붙인다. 복잡한 설정이나 빌드가 필요 없다.

```html
<div x-data="{ open: false }">
  <button x-on:click="open = !open">토글</button>
  <p x-show="open">내용</p>
</div>
```

### HTMX

`hx-get`, `hx-post`, `hx-target` 같은 HTML 속성으로 "이 버튼을 누르면 서버에 요청하고, 받은 HTML로 이 영역을 바꿔라"를 선언한다. 서버가 JSON이 아니라 **HTML 조각**을 돌려주는 구조다. 아주 복잡한 클라이언트 상태를 다루기에는 한계가 있다.

```html
<button hx-get="/items" hx-target="#list">불러오기</button>
<ul id="list"></ul>
```

## 정리

- React·Vue가 압도적이지만 Svelte와 Angular도 다섯 명 중 한 명꼴로 써 봤다는 응답을 받았다.
- 성격은 넷으로 갈린다: 컴파일러(Svelte), 다 갖춘 프레임워크(Angular), 경량 React(Preact), HTML 속성 기반 도구(Alpine.js, HTMX).
- 회사에서는 생태계가 큰 React·Vue를 쓰게 되는 경우가 많다. 개인 프로젝트에서는 성능 중심인지, 기능 중심인지, 얼마나 가벼워야 하는지에 따라 골라 볼 만하다.

관련 노트: [[spa-csr-ssr|SPA와 CSR·SSR]], [[webs-next-transition|웹 아키텍처의 다음 전환]], [[mobile-frameworks|모바일 프레임워크 비교]]
