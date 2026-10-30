---
title: "프론트엔드 면접 유형과 준비법"
concept: "Front End Interview"
summary: "프론트엔드 면접은 알고리즘보다 도메인 지식과 실전 구현을 본다. JavaScript 코딩, UI 코딩, 알고리즘, 퀴즈, 프론트엔드 시스템 디자인, 비헤이비어럴 여섯 유형별로 무엇을 보고 어떻게 준비하는지, 유형별 대표 문제, 시스템 디자인용 RADIO 프레임워크, UI 구현 때 짚을 체크리스트를 정리하고 개념은 Frontend 노트로 잇는다."
tags: ["career", "interview", "job-search", "frontend"]
source: other
date: "2026-10-17"
sources: ["https://www.frontendinterviewhandbook.com/kr/introduction", "https://www.frontendinterviewhandbook.com/introduction", "https://www.frontendinterviewhandbook.com/coding/javascript-utility-function", "https://www.frontendinterviewhandbook.com/coding/build-front-end-user-interfaces", "https://www.frontendinterviewhandbook.com/coding/algorithms", "https://www.frontendinterviewhandbook.com/trivia", "https://www.frontendinterviewhandbook.com/front-end-system-design/ui-components", "https://www.frontendinterviewhandbook.com/front-end-system-design/applications", "https://www.frontendinterviewhandbook.com/behavioral", "https://www.frontendinterviewhandbook.com/resume", "https://velog.io/@tmmoond8/%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EA%B0%9C%EB%B0%9C%EC%9E%90-%EC%9D%B8%ED%84%B0%EB%B7%B0-%ED%9B%84%EA%B8%B0-%EB%A9%B4%EC%A0%91-%EC%A7%88%EB%AC%B8-%EC%A0%95%EB%A6%AC-%EC%9E%91%EC%84%B1-%EC%A4%91"]
---

> Yangshun Tay·GreatFrontEnd의 「[Front End Interview Handbook](https://www.frontendinterviewhandbook.com/introduction)」([한국어판](https://www.frontendinterviewhandbook.com/kr/introduction), 2026.10 갱신)을 바탕으로 재구성한 노트다. 퀴즈 주제 표는 「[프론트엔드 개발자 인터뷰 후기 (면접 질문 정리)](https://velog.io/@tmmoond8/%ED%94%84%EB%A1%A0%ED%8A%B8%EC%97%94%EB%93%9C-%EA%B0%9C%EB%B0%9C%EC%9E%90-%EC%9D%B8%ED%84%B0%EB%B7%B0-%ED%9B%84%EA%B8%B0-%EB%A9%B4%EC%A0%91-%EC%A7%88%EB%AC%B8-%EC%A0%95%EB%A6%AC-%EC%9E%91%EC%84%B1-%EC%A4%91)」를 참고해 보강했다.

## 프론트엔드 면접의 특징

프론트엔드 면접은 일반 소프트웨어 엔지니어 면접보다 **알고리즘 비중이 낮고 도메인 지식 비중이 높다.** HTML, CSS, JavaScript를 실제 상황에 적용하는 능력을 본다. LeetCode만으로는 부족하지만, 기본 자료구조·알고리즘은 여전히 나온다.

유형 구성은 업계 표준이 없고 회사마다 조합이 다르다. 퀴즈를 아예 안 보는 회사도, UI 코딩 대신 시스템 디자인을 보는 회사도 있다. 지원 회사의 후기와 핸드북의 [회사별 질문 모음](https://www.frontendinterviewhandbook.com/company-interview-questions)으로 조합을 확인하고 그에 맞춰 비중을 정한다. 회사는 같은 문제를 자주 재사용한다.

## 기본기: 모든 유형의 바탕

어느 유형이든 **기본기**를 드러내야 한다. 아래 개념은 퀴즈로도 묻고 코딩·설계 중에도 쓰인다.

| 영역 | 확실히 알아야 할 것 | 개념 노트 |
| --- | --- | --- |
| CSS | 명시도(specificity), 박스 모델, 레이아웃, 포지셔닝 | [[css-basics\|CSS 기초]], [[box-model\|박스 모델]], [[flexbox\|Flexbox]], [[css-grid\|그리드]], [[position\|position]] |
| JavaScript | `this`, 프로토타입, 클로저, 비동기 코드, Promise, 타이머(`setTimeout`, `setInterval`) | [[functions\|함수와 this]], [[prototype-and-inheritance\|프로토타입]], [[scope-and-closures\|클로저]], [[callback-and-promise\|Promise]], [[event-loop\|이벤트 루프]] |
| 패턴 | 옵저버 패턴, 모듈 패턴 | [[js-design-patterns\|JS 디자인 패턴]] |
| DOM | 이벤트 위임(거의 모든 면접에 쓸모 있다), DOM 탐색·조작, 폼 검증·제출 | [[dom-events\|DOM 이벤트]], [[dom-manipulation\|DOM 조작]], [[form-submission\|폼 제출]] |

React를 못 쓰게 하는 면접도 있다. 프레임워크 없이 Vanilla JS로 DOM을 다룰 수 있어야 한다.

## 여섯 가지 유형 한눈에

| 유형 | 보는 것 | 대표 문제 | 준비법 |
| --- | --- | --- | --- |
| JavaScript 코딩 | 유틸 함수·내장 API 폴리필을 정확하고 효율적으로 구현하는가. 프론트엔드판 LeetCode | `debounce`, `Promise.all`, `Array.prototype.filter`, `getElementsByClassName` | 직접 구현하고 테스트 케이스를 써 본다 |
| UI 코딩 | HTML·CSS·JS로 컴포넌트·앱·게임을 만들고 극단적 입력·접근성·보안까지 챙기는가 | 자동완성, 이미지 캐러셀, 탭, 틱택토 | 컴포넌트를 처음부터 만들어 보고 체크리스트로 점검한다 |
| 알고리즘 | 기본 자료구조·알고리즘을 JavaScript로 풀 수 있는가 | 트리 탐색, 해시맵 활용 | 패턴 위주로 쉬운~중간 난이도를 푼다 |
| 퀴즈 | 개념을 이해하고 짧게 설명할 수 있는가 | 클로저란? Promise와 콜백 차이? 박스 모델? | 개념을 이해하고 프로젝트에 적용해 본다 |
| 시스템 디자인 | 컴포넌트·앱 구조와 트레이드오프를 스스로 이끌며 설계하는가 | 이미지 캐러셀, 뉴스 피드, 이메일 클라이언트 | RADIO 순서로 말하는 연습을 한다 |
| 비헤이비어럴 | 협업, 소통, 갈등 해결, 멘토링 경험 | 이력서 항목 설명, 이직 이유 | 구체적 사례와 결과를 미리 정리한다 |

## JavaScript 코딩

| 수준 | 시간 | 문제 예 |
| --- | --- | --- |
| 기본 | 10~15분 | `Array.prototype`의 `map`·`reduce`·`filter`·`sort`, `Promise`·`Promise.all`·`Promise.any`, `debounce`·`throttle`, `cloneDeep`·`groupBy`·`flatten`, `classnames`, 객체 키 snake_case ↔ camelCase 변환, `getElementsByClassName`·`getElementsByTagName`, 이벤트 이미터(옵저버 패턴) |
| 고급 (주로 시니어) | 25~30분 | 변수 치환·간단한 조건문이 있는 템플릿 엔진, `JSON.stringify`, HTML 페이지에서 목차 생성 |

- 기본 문제는 시간을 다 쓰지 않는다. **대개 한 문제를 더 받는다.** 후속 질문은 앞 답을 확장하는 꼴이 많다. 예: `chunk()` → `map()` → `Promise.all`로 `mapAsync` → 청크 단위로 나눠 돌리는 `mapWithChunksAsync`.
- lodash처럼 옛 브라우저 예외까지 처리할 필요는 없다. 대신 **시간 복잡도**는 신경 쓴다. 해시맵으로 O(n)이 되면 O(n²)로 쓰지 않는다.
- 외부 상태에 기대지 않고 부수 효과가 없는 **순수 함수**로 쓴다.
- 재귀라면 최대 스택 깊이를, 중첩 객체라면 순환 참조가 있을 수 있는지 먼저 묻는다(보통 없다고 답하지만 확인하는 것 자체가 평가된다).
- 개념 노트: [[debounce-throttle|Debounce와 Throttle]], [[callback-and-promise|Promise]], [[arrays-and-objects|배열과 객체]], [[js-design-patterns|이벤트 믹스인과 이벤트 이미터]].

## UI 코딩

진행 환경은 네 가지다.

| 환경 | 특징 |
| --- | --- |
| 미리보기 있는 온라인 에디터 | CodePen, CodeSandbox. 결과를 보며 고친다 |
| 미리보기 없는 온라인 에디터 | CoderPad 등. 머릿속으로 렌더링 결과를 그려야 한다 |
| 자기 노트북(BYOE) | 주로 현장 면접. Vite 같은 스캐폴딩으로 바로 시작해 설정에 시간을 쓰지 않는다 |
| 화이트보드 | 드물다. 일부 빅테크 현장 면접에서만 보고됐다 |

문제는 네 갈래로 나온다.

| 갈래 | 예 |
| --- | --- |
| 컴포넌트 | 탭, 모달 대화상자, 이미지 캐러셀, 아코디언, 별점, 진행 바, 자동완성(가장 흔하다), 툴팁 |
| 위젯 | 신호등, 디지털 시계, 스톱워치, 전송 목록(Transfer List) |
| 앱 | 할 일 목록, 정렬·필터 되는 데이터 테이블, 파일 탐색기, 칸반 보드 |
| 게임 | 틱택토, 두더지 잡기, Wordle, 고급으로 테트리스·스네이크 |

구현 전후로 아래를 짚는다. 다 구현할 필요는 없지만 **범위를 면접관과 먼저 확인**하고, 못 한 것은 말로 언급한다.

| 관점 | 확인할 것 | 개념 노트 |
| --- | --- | --- |
| 독립성 | 전역 변수가 없나? 한 페이지에 여러 인스턴스를 둬도 서로 영향이 없나? 옵션을 받는 API가 있나? | [[component-splitting\|컴포넌트 분리]] |
| 극단적 입력 | 문자열이 아주 길면(`word-break`)? 이미지가 크면? 항목이 0개면(빈 상태) 또는 수천 개면(최대 높이, 페이지네이션, 가상 리스트)? | [[list-virtualization\|리스트 가상화]] |
| 네트워크 | 앞 요청 응답 전에 새 요청이 나가는 **경쟁 상태**? 타임아웃·에러 복구? 캐싱·지연 로딩·요청 묶기? | [[lazy-loading\|지연 로딩]] |
| UX | 모바일 대응, i18n과 RTL | [[responsive-design\|반응형 디자인]], [[logical-properties\|논리 속성]] |
| 접근성 | 글자 크기, 대비, 포커스 가능 여부, 탭 순서, `aria-label` | [[keyboard-accessibility\|키보드 접근성]], [[accessible-widgets\|접근 가능한 위젯]] |
| 보안 | 사용자 입력을 `innerHTML`로 넣지 않는다(XSS). `textContent`를 쓰고, 원시 HTML이 꼭 필요하면 이스케이프한다. URL에 넣는 값은 인코딩한다 | [[web-security\|웹 보안]] |

- 접근성은 **주니어와 시니어를 가르는 지점**이다. 잘 모르면 모른다고 밝히고 아는 범위에서 반영한다.
- 점검은 DevTools 네트워크 스로틀링(느린 네트워크), 긴 문자열·큰 이미지·많은 항목 입력, 여러 화면 너비로 한다.
- 마무리로 「시간이 더 있으면 프로덕션에선 이렇게 하겠다」(테스트, 키보드 단축키, 반응형 검증 등)를 말한다.

## 알고리즘

프론트엔드 지원자에게는 대체로 쉬운 문제가 나온다. 배열·Set·Map 다음으로 **트리**를 우선한다. DOM이 트리이기 때문이다. BFS, DFS, 레벨 순회를 익혀 둔다. 답을 외우지 말고 문제 **패턴**을 익힌다. 풀이 순서와 우선순위는 [[coding-test|코딩 테스트 접근법]]에 있다.

## 퀴즈

전형 초반에 많이 나온다. 답이 짧고 분명해 비개발자 리크루터도 채점할 수 있기 때문이다. 시니어에게는 「React는 어떻게 동작하나, 가상 DOM은 무엇을 푸나」, 「왜 X 대신 Y 라이브러리를 골랐나」처럼 정답이 없는 질문이 나온다. 암기보다 **개념 이해와 실제 적용 경험**으로 준비한다. 시간이 없을 때만 암기로 메운다.

| 영역 | 자주 나오는 주제 | 개념 노트 |
| --- | --- | --- |
| JavaScript | 호이스팅과 실행 컨텍스트, 클로저, `this` 바인딩, 프로토타입, 이벤트 루프, Promise와 콜백, `async`/`await` | [[execution-context\|실행 컨텍스트]], [[scope-and-closures\|클로저]], [[functions\|함수와 this]], [[event-loop\|이벤트 루프]], [[async-await\|async/await]] |
| HTML·DOM | `<!DOCTYPE>`·`meta`의 역할, `script` 위치와 `defer`·`async`, 이벤트 버블링·캡처링 | [[html-head-metadata\|문서 head]], [[script-loading\|스크립트 로딩]], [[dom-events\|DOM 이벤트]] |
| 브라우저 | 렌더링 과정, 가상 DOM | [[browser-rendering\|브라우저 렌더링]], [[ui-change-detection\|UI 변경 감지]] |
| CSS | 박스 모델, `position` 값의 차이, Flexbox·Grid, CSS 애니메이션과 JS 애니메이션의 차이 | [[box-model\|박스 모델]], [[position\|position]], [[css-animation\|CSS 애니메이션]] |
| 네트워크 | CORS가 생기는 이유와 해결, 캐시, HTTP 메서드와 상태 코드 | [[cors\|CORS]], [[http-cache\|HTTP 캐시]] |
| 라우팅 | SPA에서 해시 라우팅과 History API의 차이 | [[client-side-routing\|클라이언트 사이드 라우팅]] |
| React | 가상 DOM과 재조정·key, state 스냅숏과 불변성·배칭, 훅 규칙과 `useEffect` deps, 리렌더링 원인과 `memo`, 동시성 렌더링, 서버 컴포넌트와 hydration | [[reconciliation\|재조정]], [[lists-and-keys\|리스트와 Key]], [[state\|State]], [[hooks\|Hooks]], [[re-rendering\|리렌더링]], [[concurrent-rendering\|동시성 렌더링]], [[react-server-components\|RSC]] |

`float` 해제나 JSONP 같은 질문도 나오지만, 각각 Flexbox·Grid와 CORS로 대체된 레거시 기법이라 왜 대체됐는지까지 설명할 수 있으면 된다.

## 프론트엔드 시스템 디자인과 RADIO

프론트엔드 시스템 디자인은 분산 시스템 설계가 아니라 **클라이언트 쪽 구조**를 설계한다. UI 코딩보다 범위가 넓고, 1시간 이내 면접이면 코드보다 설계 트레이드오프를 말로 다룬다. DB 스키마, SQL vs NoSQL, 샤딩, 서버 가용성은 보통 다루지 않는다. 서버 쪽 설계 면접은 [[tech-interview-prep|기술 면접 준비]]의 7단계를 따른다.

| 문제 종류 | 예 |
| --- | --- |
| 컴포넌트 | 자동완성, 이미지 캐러셀, 드롭다운 메뉴, 모달 대화상자, 리치 텍스트 에디터, 투표 위젯, 데이터 테이블, 툴팁 |
| 앱 | 뉴스 피드, 채팅, 핀터레스트형 이미지 피드, 공동 문서 편집, 동영상·음악 스트리밍, 디자인 툴, 화상 회의, 숙박 예약, 이커머스, 공동 스프레드시트, 사진 공유, 이메일 클라이언트 |

질문은 일부러 모호하게 주어진다. **지원자가 대화를 이끈다.** 화이트보드에 RADIO를 적어 두고 하나씩 다룬다.

| 단계 | 컴포넌트 문제 | 앱 문제 |
| --- | --- | --- |
| **R**equirements | 지원 기기(주 기기 포함)·브라우저, i18n, 스타일 커스터마이즈 범위를 질문으로 확정한다. **요구사항이 분명해지기 전에 그리지 않는다** | 같은 질문 + 오프라인 지원 여부 |
| **A**rchitecture | 하위 컴포넌트와 그 사이 데이터 흐름. 예: 캐러셀 = 메인 이미지, 썸네일, 클라이언트 이미지 저장소 | MVC, MVVM, Flux, 데이터 계층을 클라이언트에 둔 N-tier 같은 클라이언트 구조([[frontend-mv-architecture\|MV* 아키텍처]]) |
| **D**ata model | 컴포넌트 상태 | 서버 상태(서버에 저장되는 값) + 클라이언트 전용 상태 |
| **I**nterface | props, 기본값, 이벤트 훅(`onClick`, `onChange`, `onFocus`, `onBlur`) | HTTP API 파라미터와 응답 형태 |
| **O**ptimizations | UX, 성능, 접근성, i18n, 멀티 디바이스, 보안 중 관련 있는 것을 깊게 | 같다 |

### 설계 원칙

- **상태는 최소로.** 다른 상태에서 계산되는 값(`items.length`로 알 수 있는 `isEmpty`)은 상태에 넣지 않는다. 인스턴스마다 상태가 독립적이어야 한 페이지에 여러 개를 둘 수 있다. 상태는 최상위에 모으고 하위 컴포넌트는 순수하게 둔다.
- **API는 개방-폐쇄 원칙.** 수정 없이 확장되게 한다([[frontend-solid|프론트엔드 SOLID]]). 외형 커스터마이즈는 컴포지션, 렌더 props, `className`·`style` 주입으로 연다. 다만 `className`·`style` 주입은 내부 구조를 바깥에 묶어 버리는 부작용이 있다.
- **UI 문자열은 props로** 받고 영어 기본값을 둔다. 하드코딩하면 i18n이 막힌다. 순서가 의미를 갖는 UI면 RTL도 고려한다.
- **성능**은 로딩 속도(JS 양, 모듈 분리), 상호작용 응답성(상호작용마다 JS 실행·DOM 갱신 줄이기), 메모리다. 화면에 보이는 것만 렌더링(가상화하되 스크롤 높이는 유지), 뷰포트 안의 것부터 지연 로딩, 다음 것을 미리 로딩(캐러셀이면 다음 한 장이 아니라 다음 N장)이 핵심 기법이다.
- **UX 기본기**: 로딩·에러 상태를 보여 준다. 빈 목록엔 빈 상태를 둔다. 긴 문자열은 잘라 「더 보기」를 둔다. 되돌릴 수 없는 동작엔 확인 단계를 둔다. 비동기 요청 중엔 버튼을 비활성화한다(손 떨림으로 두 번 누르는 사용자도 있다). 검색은 키 입력마다 요청하지 않는다([[debounce-throttle|디바운스]]).
- **모바일**: 메모리를 아끼고 터치 영역을 키운다.
- **보안**: XSS(`innerHTML`, `dangerouslySetInnerHTML`), CSRF, 클릭재킹, 새 창 링크의 `rel="noopener"`.

**성능·접근성·i18n을 먼저 꺼내 깊게 말하는 것이 시니어와 주니어를 가른다.** 면접 시간에 최적화 항목을 다 다룰 수는 없으니 문제와 관련 깊은 것을 골라 깊게 판다. RADIO는 면접 밖에서도 기술 설계 문서의 뼈대로 쓸 수 있다. 실제 앱 설계 사례는 [[realtime-chat-app|실시간 채팅 앱의 데이터 흐름]], 렌더링 전략은 [[spa-csr-ssr|SPA와 CSR·SSR]]에 있다.

## 비헤이비어럴과 레주메

- 코딩·설계를 잘하고도 **비헤이비어럴에서 떨어지는** 경우가 있다. 시니어일수록 비중이 크다. 협업, 소통, 갈등 해결, 멘토링을 본다.
- 준비할 것: 이력서의 모든 항목을 설명할 수 있게 한다. 내가 한 일과 그 결과를 구체적 사례로 말한다. 과거를 스스로 비판하고 배운 점을 말한다. 지금 일에서 좋은 점과 이직 이유를 정리해 둔다. 질문별 답 요소는 [[behavioral-interview-questions|영어 면접 단골 질문 12가지]]에 있다.
- 레주메는 처음부터 만들기보다 검증된 템플릿에서 시작한다. ATS에서 제대로 파싱되는지 확인한다. 내용을 **일반 텍스트 파일에 붙여 넣어** 빠진 항목, 깨진 글자, 뒤섞인 섹션이 없는지 보거나, OpenResume 같은 무료 파서로 검사한다. 쓰는 법은 [[resume-writing|합격하는 영문 레주메 작성법]], ATS는 [[us-hiring-process|미국 개발자 채용 프로세스와 ATS]]에 있다.

## 정리

- 프론트엔드 면접은 도메인 지식과 실전 구현 중심이다. 기본기(CSS 레이아웃, `this`·클로저·Promise, 이벤트 위임)가 모든 유형의 바탕이다.
- 유형은 JS 코딩, UI 코딩, 알고리즘, 퀴즈, 시스템 디자인, 비헤이비어럴이고 회사마다 조합이 다르니 먼저 조합을 확인한다.
- JS 코딩은 빨리 끝내고 후속 문제를 받는다. 복잡도와 순수 함수를 챙긴다.
- UI 코딩은 범위를 먼저 합의하고, 극단적 입력·네트워크·접근성·보안을 짚는다.
- 시스템 디자인은 RADIO로 대화를 이끌고, 최적화 단계에서 깊이를 보여 준다.

관련 노트: [[interview-attitude|면접 잘 보는 법]], [[tech-interview-prep|기술 면접 준비]], [[coding-test|코딩 테스트 접근법]], [[us-hiring-process|미국 개발자 채용 프로세스와 ATS]], [[debounce-throttle|Debounce와 Throttle]], [[Accessibility|웹 접근성]], [[web-security|웹 보안: CSRF와 XSS]]
