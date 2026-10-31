---
title: "책임감 있는 자바스크립트"
concept: "Responsible JavaScript"
summary: "JS는 압축해도 파싱·실행 비용이 그대로 남아 저사양 기기에서 가장 비싼 자원이다. 웹 플랫폼(HTML·CSS)을 먼저 쓰고, 트리 셰이킹·코드 분할·최신 문법 빌드·작은 대체재로 줄이고, 서드파티 스크립트는 담당자를 두고 관리한다. 성능은 저사양 Android와 느린 4G, 표준 지원은 Baseline으로 기준을 잡는다."
tags: ["frontend", "javascript", "performance", "web", "browser"]
source: other
date: "2026-10-21"
sources: ["https://webactually.com/2019/10/10/%ec%9e%90%eb%b0%94%ec%8a%a4%ed%81%ac%eb%a6%bd%ed%8a%b8%ec%9d%98-%ec%b1%85%ec%9e%84-part-%e2%85%a0/", "https://webactually.com/2019/11/11/%ec%9e%90%eb%b0%94%ec%8a%a4%ed%81%ac%eb%a6%bd%ed%8a%b8%ec%9d%98-%ec%b1%85%ec%9e%84-part-%e2%85%a1/", "https://webactually.com/2020/02/12/%ec%9e%90%eb%b0%94%ec%8a%a4%ed%81%ac%eb%a6%bd%ed%8a%b8%ec%9d%98-%ec%b1%85%ec%9e%84-part-%e2%85%a2/", "https://engineering.linecorp.com/ko/blog/the-baseline-for-web-development-in-2022", "https://web.dev/baseline", "https://medium.com/reloading/javascript-start-up-performance-69200f43b201", "https://v8.dev/blog/code-caching-for-devs"]
---

> Jeremy Wagner의 「자바스크립트의 책임」 Part Ⅰ~Ⅲ(웹액츄얼리 번역, 2019.10~2020.02)과 Alan Dávalos의 「[2022년 웹 개발에서 고려해야 할 환경](https://engineering.linecorp.com/ko/blog/the-baseline-for-web-development-in-2022)」(LINE Engineering, 2022.02)을 바탕으로 재구성한 노트다. 시작 비용과 V8의 대응은 Addy Osmani의 「[JavaScript Start-up Performance](https://medium.com/reloading/javascript-start-up-performance-69200f43b201)」와 V8 블로그 「[Code caching for JavaScript developers](https://v8.dev/blog/code-caching-for-devs)」로 보강했다.

## 왜 자바스크립트가 문제인가

**JS는 전송량보다 처리 비용이 비싸다.** 텍스트 자원은 압축해서 보내지만, 브라우저는 받은 뒤 압축을 풀고 파싱·컴파일·실행해야 한다. 압축 수백 KB는 메가바이트 단위 코드가 된다. 이미지는 내려받으면 바로 그릴 수 있지만 JS는 메인 스레드를 붙잡는다.

같은 코드라도 기기에 따라 처리 시간이 몇 배씩 차이 난다. 고사양 노트북에서 25ms 걸리는 스크립트가 저가 Android 폰에서는 200ms 가까이 걸린다. 네트워크가 아무리 빨라도 CPU가 느리면 JS가 많은 페이지는 느리다.

### 시작 비용: 파싱·컴파일·실행

JS가 메인 스레드를 잡는 시작 비용은 세 단계다. 크기와 비례하지도 않는다. 200KB라도 최상위에서 많은 일을 하는 코드는 더 비싸다.

| 단계 | 엔진이 줄이는 방법 | 개발자가 할 일 |
| --- | --- | --- |
| 파싱 | **스크립트 스트리밍**: 받는 도중 백그라운드 스레드에서 파싱한다. `async`·`defer`든 일반 스크립트든 해당한다. **지연 파싱**: 함수 본문은 미리 훑기만(pre-parse) 하고 호출될 때 제대로 파싱한다 | `<head>`에 `defer`로 두어 일찍 발견되게 한다 |
| 컴파일 | **코드 캐시**: 컴파일 결과를 저장해 다음 방문에 파싱·컴파일을 건너뛴다. Chrome은 첫 방문(cold)에 파일만 저장하고, 두 번째(warm)에 컴파일 결과를 파일에 붙여 두고, 세 번째(hot)부터 컴파일을 건너뛴다. 서비스 워커의 `install`에서 Cache Storage에 넣은 스크립트는 넣는 즉시 코드 캐시를 만든다. 1KiB보다 작은 스크립트는 캐시하지 않는다 | 캐시가 **URL에 묶이므로** 파일 이름에 해시를 붙여 바뀌지 않은 청크의 URL을 유지한다. 자주 바뀌는 코드와 라이브러리를 다른 청크로 나눈다 |
| 실행 | 최상위 코드가 길수록 오래 막는다 | 첫 화면에 필요한 코드만 보낸다([[code-splitting\|코드 분할]]). 프레임워크의 기본 비용(아래)을 비교한다 |

측정은 DevTools Performance 패널의 Bottom-Up에서 Compile Script·Evaluate Script 항목을 본다. 엔진 파이프라인 자체는 [[js-engine-v8|JS 엔진과 V8 파이프라인]]에 있다. 과거에는 즉시 실행 함수를 괄호로 감싸 지연 파싱을 피하는 `optimize-js` 같은 도구도 쓰였지만, 엔진이 이 경우를 스스로 처리하면서 쓰이지 않는다.

## 기준선: 누구를 위해 만드는가

IE가 사라진 뒤에는 "어디까지 지원할까"를 사용자 기기 데이터로 정한다.

| 관점 | 기준선 | 이유 |
| --- | --- | --- |
| 성능 | 저사양 Android 기기 | 중·저가 Android의 CPU 성능은 고가 기기와 격차가 크고, 해마다 거의 오르지 않는다 |
| 네트워크 | 느린 4G | 4G는 대부분 지역에서 쓸 수 있지만 품질이 고르지 않다. Lighthouse 모바일 측정도 느린 4G로 제한해 잰다 |
| 웹 표준 | Baseline | 주요 브라우저(Chrome·Edge·Firefox·Safari) 모두가 지원하는 기능만 기본으로 쓴다 |

**Baseline**은 web.dev와 MDN이 기능마다 붙이는 지원 표시다. 모든 주요 브라우저에 막 들어온 기능은 "Newly available", 그 뒤 30개월이 지나 구형 기기까지 퍼진 기능은 "Widely available"이다. Safari는 iOS 업데이트와 함께만 바뀌고 iOS의 모든 브라우저가 WebKit 엔진을 쓰므로, 표준 지원의 하한은 대개 Safari가 정한다. Widely available을 기준으로 삼으면 이 문제를 따로 계산하지 않아도 된다.

### 예산

저사양 Android + 느린 4G에서 빠른 첫 화면을 내려면 HTML·CSS는 각각 100KB, JS는 350KB 안팎(압축 기준)이 적정 예산으로 꼽힌다. HTTP Archive의 [Web Almanac 2024](https://almanac.httparchive.org/en/2024/javascript)에서 모바일 페이지 JS 중앙값은 558KB로 이 예산을 넘고, 모바일 사이트 가운데 Core Web Vitals를 통과한 비율은 [43%](https://almanac.httparchive.org/en/2024/performance)에 그쳤다. 페이지 무게에서 이미지가 더 크더라도 **먼저 줄일 것은 JS**다.

### 프레임워크의 기본 비용

| 관찰 | 의미 |
| --- | --- |
| React·Vue·Angular 사이트는 프레임워크 없는 사이트보다 JS를 수백 KB 더 보낸다 | 프레임워크를 고르는 순간 줄일 수 없는 기본 비용이 생긴다 |
| 벤치마크에서 Solid·Svelte·Lit은 바닐라 JS에 가깝고, 가상 DOM을 쓰는 React는 그보다 느리다 | 번들 크기만이 아니라 런타임 구현도 성능을 가른다 |

콘텐츠 사이트라면 SPA 프레임워크가 꼭 필요한지 따져 본다. 정적 사이트 생성기 선택은 [[static-site-generator|정적 사이트 생성기와 Jamstack]]에서 다룬다.

## 원칙 1. 웹 플랫폼을 먼저 쓴다

"웹사이트냐 애플리케이션이냐"라는 이름과 상관없이 **사용자의 기기와 네트워크는 똑같다.** 정보성 사이트에 클라이언트 라우팅과 상태 관리 라이브러리를 얹을 이유가 없다.

| JS로 하던 일 | 플랫폼 대안 |
| --- | --- |
| `div` + `onClick`으로 만든 폼 | `<form action method>` + `onSubmit`. JS가 실패해도 폼이 동작한다 |
| 정규식 이메일 검증 | `type="email"`, `required` 같은 내장 검증 |
| `span` 라벨, `role="button"` 붙인 `div` | `<label>`, `<button>`. 키보드·포커스 처리가 공짜다 |
| 레이아웃 계산 패키지 | Flexbox·Grid, `@supports`로 점진적 향상 |
| 모달·툴팁 라이브러리 | `<dialog>`, Popover API |
| SPA 라우터로 빠른 이동 | `rel="prefetch"`, Speculation Rules, View Transitions, 서비스 워커 캐시 |

- 클라이언트 라우터를 쓰면 페이지가 바뀌었다는 사실을 보조 기술에 직접 알려야 한다. 브라우저 내비게이션은 이것을 알아서 한다.
- "모든 브라우저에서 똑같이 보여야 한다"는 목표는 점진적 향상의 적이다.
- 서비스 워커로 재방문 성능을 올리는 것은 사이트 종류와 상관없이 쓸 수 있는 책임감 있는 JS다([[pwa-service-worker|PWA와 서비스 워커 캐시 전략]]).

## 원칙 2. 이미 쓴 JS를 줄인다

| 기법 | 확인할 것 |
| --- | --- |
| 트리 셰이킹 | 앱과 패키지가 ES 모듈인가. 빌드 도구가 모듈을 CommonJS로 바꾸지 않는가. `sideEffects` 표시가 있는가 |
| 코드 분할 | 진입점 사이 중복 코드를 걷어냈나. 클릭·입력 뒤에만 필요한 기능을 동적 `import()`로 미뤘나 |
| 중복 다운로드 | CDN에서 부르는 라이브러리를 번들에도 넣어 두 번 받고 있지 않나 |
| 작은 대체재 | React → Preact, moment.js → date-fns·Day.js, lodash 메서드 → 네이티브 배열 메서드 |
| 빌드 대상 | 트랜스파일 대상을 Baseline 브라우저로 올린다. 구형 대상으로 변환하면 기본 매개변수·전개 구문·async 함수가 헬퍼 코드로 불어나고 폴리필이 붙는다 |

페이지에서 실제로 안 쓰인 JS·CSS 바이트는 DevTools 커버리지 패널로 찾는다([[devtools-performance|DevTools로 성능·메모리 분석하기]]).

과거에는 `type="module"`과 `nomodule`로 최신 브라우저용·구형 브라우저용 번들을 따로 보냈다. IE가 빠진 지금은 빌드 대상만 올리면 된다.

## 원칙 3. 서드파티는 사람이 관리한다

서드파티 스크립트는 **누군가의 고통을 빨리 덜어 주려고** 들어온다. 그래서 기술보다 조직의 문제다. 접근성 오버레이처럼 문제를 고치지 않고 덮는 제품은 메인 스레드를 수백 ms 붙잡으면서 사용성까지 해친다.

도입된 스크립트마다 세 가지를 정해 둔다.

1. **무슨 문제를 푸는가?** 도입 근거가 아직 유효한지 본다.
2. **언제까지 쓰는가?** 임시 처방인지, 분석 도구처럼 사실상 영구인지 구분한다.
3. **누가 책임지는가?** 담당자가 크기를 지켜보고, 끝난 A/B 테스트와 오래된 태그를 정리하고, 기능이 겹치는 도구를 걷어낸다.

기술적 완화책은 다음 순서로 쓴다.

| 순서 | 방법 |
| --- | --- |
| 1 | 필요한 페이지에만 로드한다 |
| 2 | 가능하면 자체 호스팅한다. 다른 출처라는 사실만으로 연결 지연이 생긴다 |
| 3 | 자체 호스팅이 안 되면 `preconnect`·`dns-prefetch`로 연결을 미리 연다 |
| 4 | 렌더링에 필수가 아닌 스크립트는 `preload`하지 않는다. 중요한 자원의 우선순위를 뺏는다 |
| 5 | 좋아요 버튼 같은 비핵심 위젯은 Intersection Observer로 뷰포트에 들어올 때, 또는 클릭할 때 로드한다 |

성능 부채는 자동화로 사라지지 않는다. 정기적으로 시간을 떼어 퍼스트파티·서드파티 코드를 함께 정리한다.

## 정리

- JS는 바이트 수보다 **파싱·실행 비용**이 문제다. 저사양 Android와 느린 4G에서 잰다.
- 표준 지원은 Baseline으로 판단하고, 빌드 대상도 그에 맞춰 올린다.
- CSS·HTML로 되는 일은 그쪽에 맡긴다. 모든 프로젝트가 SPA일 필요는 없다.
- 트리 셰이킹, 코드 분할, 작은 대체재로 이미 쓴 JS를 줄인다.
- 서드파티는 이유·기한·담당자를 정해 관리한다. **가장 좋은 요청은 하지 않은 요청이다.**

관련 노트: [[web-vitals|웹 성능 지표와 Lighthouse]], [[frontend-latency-numbers|프론트엔드 개발자가 알아야 할 지연 시간 숫자]], [[js-engine-v8|JavaScript는 인터프리터 언어일까, 컴파일 언어일까]], [[frontend-frameworks|React와 Vue 말고: 다른 프론트엔드 프레임워크]], [[sustainable-web-design|지속 가능한 웹 디자인]], [[code-splitting|자바스크립트 코드 분할]], [[resource-hints|리소스 힌트와 미리 불러오기]]
