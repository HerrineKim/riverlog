---
title: "React와 Vue 말고: Svelte, Angular, Preact, Alpine.js, HTMX"
concept: "Frontend Frameworks"
summary: "React·Vue 다음으로 많이 쓰이는 프레임워크들의 특징을 비교한다. 컴파일러, 풀스택 프레임워크, 경량 대체재, HTML 속성 기반 도구로 성격이 갈린다. Knockout부터 Svelte까지 프레임워크의 계보와 컴파일러 방식이 빠른 이유도 다룬다."
tags: ["frontend", "javascript", "architecture"]
source: mixed
date: "2026-10-13"
sources: ["https://riverkim.kr/315", "https://velog.io/@teo/왜-Svelte스벨트를-좋아하나요", "https://velog.io/@teo/Svelte-Rxjs-Vite-AdorableCSS"]
---

> riverkim.kr에 쓴 글(2025.06)과 테오(teo)의 「[왜 Svelte(스벨트)를 좋아하나요?](https://velog.io/@teo/왜-Svelte스벨트를-좋아하나요)」(2021.12)를 바탕으로 재구성한 노트다.

## 얼마나 쓰이나

국내 채용 시장은 React와 Vue가 대부분이지만, 설문에서는 Svelte와 Angular도 다섯 명 중 한 명꼴로 "써 봤고 좋았다"는 응답을 받는다. 수치는 The Software House의 [State of Frontend](https://tsh.io/state-of-frontend) 설문에 있다.

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

#### 컴파일러 방식이 빠르고 작은 이유

React·Vue·Angular는 브라우저에서 돌아가는 **런타임 라이브러리**다. 한 줄만 써도 엔진 전체를 함께 실어야 한다. Svelte는 빌드할 때 `.svelte` 파일을 분석해, "이 이벤트가 오면 이 값이 바뀌고, 그러면 이 엘리먼트만 고친다"는 코드를 미리 계산한 **바닐라 JavaScript**를 만들어 낸다.

| | 가상 DOM 런타임 (React) | 컴파일러 (Svelte) |
| --- | --- | --- |
| 갱신 방식 | 컴포넌트를 가상으로 다시 그려 이전과 비교한 뒤 바뀐 곳만 반영 | Svelte 5는 룬을 시그널 읽기·쓰기 코드로 컴파일해, 바뀐 값을 읽는 노드만 고친다. Svelte 4까지는 대입 지점에 `$$invalidate` 호출을 심었다 |
| 번들에 실리는 것 | 라이브러리 런타임 전체 | 작은 유틸 정도. 컴파일러가 아무리 커져도 번들 크기와 무관하다 |
| 상태 변경 | `useState`의 setter로 변경을 알린다 | `let count = $state(0)`로 선언한 뒤 `count++` 같은 **평범한 대입**이 곧 반응성이다 |

프레임워크 코드는 적을수록 빠르고, 어떤 알고리즘도 잘 짠 바닐라 JavaScript보다 빠를 수는 없다. 컴파일러 방식은 그 바닐라 코드를 대신 써 주는 셈이다. 그 밖의 특징은 이렇다.

- 상용구(boilerplate)가 없고 문법이 HTML·CSS·JS 그대로다. 퍼블리셔가 만든 `.html`을 확장자만 바꿔도 동작해, HTML·CSS만 아는 사람도 바로 적응한다.
- `<style>`에 쓴 CSS가 자동으로 컴포넌트 범위로 갇힌다(scoped CSS). CSS-in-JS 라이브러리 없이 CSS 변수로 JS 값과 연동한다.
- Svelte 5(2024)부터 반응성을 **룬(rune)** 으로 명시한다. `$state`·`$derived`·`$effect`가 컴파일러에 주는 표시이고, 내부는 시그널(signal)로 바뀌었다. 과거(Svelte 3·4)에는 컴포넌트 최상단의 `let` 대입 자체가 반응형이었고 파생 값은 `$:` 문법으로 썼다. 룬은 `.svelte.ts` 파일에서도 쓸 수 있어 컴포넌트 밖으로 상태를 꺼내기 쉬워졌다.
- 약점은 **작은 커뮤니티**다. 베스트 프랙티스와 라이브러리가 적어 필요한 것을 직접 만들 일이 많다. 성능이 아니라 생태계 문제다. 컴파일러 접근은 React Compiler(2025년 1.0)처럼 주류 프레임워크도 흡수했다. React Compiler는 `useMemo`·`useCallback` 같은 메모이제이션을 빌드 시점에 자동으로 넣는다.

### Angular 2+

Angular 2부터 TypeScript 지원과 컴포넌트 기반 구조로 크게 바뀌었다. 1.x(AngularJS)와 구분하려고 Angular 2+라고 불렀고, 지금은 그냥 Angular라고 부른다. 라우팅·폼·HTTP 같은 기능을 프레임워크가 기본 제공해 선택할 것이 적다. 반응성의 중심은 RxJS에서 **Signals**로 옮겨 갔고, Angular 21(2025.11)부터 새 프로젝트는 Zone.js 없이(zoneless) 변경을 감지하는 것이 기본이다.

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

## 프레임워크의 계보

새 프레임워크는 대개 앞선 것의 불편을 고치며 나왔다. MVC·MVVM 같은 패턴 자체는 [[frontend-mv-architecture|프론트엔드 MV* 아키텍처의 흐름]]에 있다.

```text
jQuery (DOM 직접 조작)
  └ Knockout.js ─ MVVM, 템플릿과 데이터 바인딩의 시작
      └ AngularJS (구글) ─ 모듈·라우터·HTTP까지 갖춘 풀패키지. 값이 바뀔 때마다 전체를 검사하는 dirty checking이라 무거웠다
          ├ React (페이스북) ─ JSX와 가상 DOM. SSR로 SEO 약점을 풀며 아젠다를 선점했다
          ├ Vue ─ AngularJS의 불편을 걷어 내고 dirty checking을 getter/setter 반응성으로 바꿨다. 문서가 뛰어났다
          ├ Angular 2+ ─ AngularJS와 호환되지 않는 재작성. TypeScript·데코레이터·DI 기반, 객체지향에 익숙한 개발자에게 맞는다
          └ Polymer ─ 웹 표준 Web Components 기반
              └ Svelte ─ 라이브러리가 아니라 컴파일러
```

AngularJS가 "더는 업데이트하지 않겠다"고 선언하고 Angular 2가 늦어지는 사이 사용자 대부분이 React와 Vue로 옮겨 갔다. 이후 React가 점유율에서 크게 앞서면서 번들러·라이브러리·백엔드 프레임워크까지 React 중심으로 만들어지고 있다. 프레임워크를 고르는 기준은 [[tech-stack-selection|기술 스택 고르기]]에 있다.

## 정리

- React·Vue가 압도적이지만 Svelte와 Angular도 꾸준히 쓰인다.
- 성격은 넷으로 갈린다: 컴파일러(Svelte), 다 갖춘 프레임워크(Angular), 경량 React(Preact), HTML 속성 기반 도구(Alpine.js, HTMX).
- Svelte는 런타임 대신 **컴파일러**로 바닐라 JS를 생성해 작고 빠르다. 약점은 성능이 아니라 생태계다.
- 회사에서는 생태계가 큰 React·Vue를 쓰게 되는 경우가 많다. 개인 프로젝트에서는 성능 중심인지, 기능 중심인지, 얼마나 가벼워야 하는지에 따라 골라 볼 만하다.

관련 노트: [[spa-csr-ssr|SPA와 CSR·SSR]], [[tech-stack-selection|기술 스택 고르기]], [[bundlers-and-vite|번들러의 역사와 Vite]], [[webs-next-transition|웹 아키텍처의 다음 전환]], [[mobile-frameworks|모바일 프레임워크 비교]], [[react-vs-vue|React와 Vue 비교]]
