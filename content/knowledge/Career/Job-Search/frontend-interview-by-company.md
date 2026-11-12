---
title: "회사별 프론트엔드 면접 형식과 단골 문제"
concept: "FE Interview by Company"
summary: "Google, Meta, Amazon, Apple부터 Stripe, Discord, OpenAI까지 36개 회사의 프론트엔드 면접 전형 구성, 라운드 종류, 강조점, 실제로 나온 JavaScript·UI 코딩·시스템 디자인·퀴즈·알고리즘 문제를 정리한다. 회사를 가로지르는 패턴(DSA 비중, Vanilla JS 강제, 기존 코드 디버깅, 단계별 확장 문제, 풀스택식 평가, AI 도구 허용)과 여러 회사에서 겹치는 단골 문제도 묶었다."
tags: ["career", "interview", "job-search", "frontend"]
source: other
date: "2026-11-12"
sources: ["https://www.frontendinterviewhandbook.com/company-interview-questions", "https://www.frontendinterviewhandbook.com/companies/adobe-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/airbnb-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/amazon-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/apple-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/atlassian-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/bytedance-tiktok-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/canva-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/coinbase-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/discord-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/doordash-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/dropbox-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/ebay-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/ethos-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/google-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/harvey-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/linkedin-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/lyft-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/meta-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/microsoft-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/mozilla-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/netflix-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/openai-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/oracle-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/palantir-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/pinterest-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/ramp-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/reddit-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/rippling-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/robinhood-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/roblox-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/salesforce-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/shopify-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/squarespace-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/stripe-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/twitter-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/uber-front-end-interview-questions"]
---

> Yangshun Tay·GreatFrontEnd의 「[Front End Interview Handbook](https://www.frontendinterviewhandbook.com/company-interview-questions)」 회사별 면접 질문 페이지(2026.10 갱신)를 바탕으로 재구성한 노트다. 회사 페이지는 Glassdoor와 GreatFrontEnd 커뮤니티에 올라온 2023~2026년 면접 후기를 모은 것이다.

## 이 노트를 읽는 법

회사별 형식은 **후기에서 모은 관찰**이다. 같은 회사라도 팀, 레벨, 트랙(프론트엔드 vs 풀스택)에 따라 라운드가 다르고, 몇 달 단위로 바뀐다. 리크루터가 말한 형식과 실제 문제가 다른 경우도 흔하다. 그래서 이 노트는 「이 회사는 이걸 낸다」는 정답지가 아니라 **무엇을 확인해야 하는지 알려 주는 지도**로 쓴다.

리크루터에게 확인할 것은 다섯 가지다.

| 확인할 것 | 이유 |
| --- | --- |
| 라운드 이름과 순서 | 「Bug Squash」, 「Decomp」, 「Tech execution」처럼 회사 고유 라운드가 많다. 이름을 알면 형식을 찾아볼 수 있다 |
| 트랙(프론트엔드 / 풀스택) | Rippling·DoorDash·Ethos·eBay처럼 프론트엔드 직무도 백엔드 지식을 깊게 보는 곳이 있다 |
| 언어·프레임워크 | Vanilla JS 강제인지, React인지, TypeScript 환경인지 |
| 코딩 환경 | 공유 에디터, 실행 불가 에디터, 자기 IDE, HackerRank·CodeSignal·CoderPad·Karat |
| AI 도구 허용 여부 | 같은 회사 안에서도 라운드마다 다르다 |

전형 단계 전반(리크루터 통화 → 폰 스크린 → 온사이트 → 팀 매칭)은 [[us-hiring-process|미국 개발자 채용 프로세스와 ATS]], 진행 형식별 대비는 [[tech-interview-prep#진행 형식별 대비|기술 면접 준비]], 유형별 준비법은 [[frontend-interview|프론트엔드 면접 유형과 준비법]]에 있다.

## 회사를 가로지르는 패턴

| 패턴 | 해당 회사 | 대비 |
| --- | --- | --- |
| **프론트엔드에도 DSA 라운드** | Google, Meta, Apple, Amazon, Microsoft, Pinterest, Palantir, Salesforce, OpenAI, Roblox, Uber, Oracle, ByteDance | 프론트엔드 직무라도 LeetCode 중간 난이도 이상을 준비한다. 「프론트엔드 문제만 원한다」고 요청해도 뒤 라운드에 알고리즘이 나올 수 있다 |
| **실무형 UI·JS 중심** | Dropbox, Mozilla, DoorDash, Coinbase, Squarespace, Shopify, Ramp, Reddit, Lyft, Stripe | 컴포넌트·작은 앱을 처음부터 빠르게 만드는 연습 |
| **Vanilla JS 강제** | Amazon, Atlassian(스크린), Dropbox, Apple(일부), LinkedIn, Reddit, Squarespace, eBay | 프레임워크 없이 DOM을 만들고 붙이고 지우는 연습, `fetch`를 라이브러리 없이 쓰는 연습 |
| **기존 코드 디버깅·확장·리뷰** | Squarespace, Stripe(Bug Squash), Palantir, Oracle, Ethos, DoorDash, eBay, Apple(Bug Hunt), Coinbase, Harvey, Salesforce, Ramp | 낯선 코드를 읽고 상태 흐름을 추적하는 연습. 마지막에 전체 코드 리뷰를 요구하는 곳도 있다 |
| **단계별로 커지는 문제** | Twitter(피드 4단계), Robinhood(이벤트 이미터 3단계), Rippling(잡 보드 4단계), Airbnb, Mozilla, Stripe, Uber, Discord | 동작하는 기본형을 먼저 끝내고 확장한다. 레벨이 높을수록 더 많은 단계를 통과해야 한다 |
| **풀스택식 평가** | Rippling, DoorDash, Ethos, eBay, OpenAI, Canva, Harvey, Stripe, Roblox(일부), Apple(풀스택 팀) | REST vs GraphQL, BFF, DB 선택, 페이지네이션 커서, ID 생성 같은 백엔드 질문에 답할 준비 |
| **테스트로 채점** | Coinbase | 면접관 판단이 아니라 숨겨진 테스트 스위트 통과 여부로 채점한다 |
| **자기 IDE에서 직접 시작** | Discord, Ramp(연습 권장) | 프로젝트 스캐폴딩을 빠르게 하는 연습 |
| **실행할 수 없는 에디터** | Amazon(사내 일반 에디터), Google(문서), Adobe(손으로 테스트) | 자동완성·문법 강조 없이 쓰고 손으로 예제를 따라가 검증하는 연습 |
| **AI 도구** | Canva(AI 보조 코딩 라운드), LinkedIn(스태프 루프의 AI 보조 세션), Discord(라운드마다 다름), eBay(면접 중 금지), ByteDance(AI 활용에 관한 질문) | 허용 여부를 라운드마다 확인하고, AI로 코딩하는 방식을 설명할 준비 |

## 회사별 한눈에

| 회사 | 전형·라운드 | 특징 |
| --- | --- | --- |
| Adobe | HackerRank → 온사이트 5라운드(라운드마다 기술 30분 + 행동 10분 + 질의응답) | 비프론트엔드 시스템 디자인(LRU 캐시, 체스 OOD)이 나올 수 있다 |
| Airbnb | 폰 스크린 → 온사이트 | 기능을 계속 덧붙이는 UI 문제. `useEffect`와 타이머 정리 |
| Amazon | OA → 폰 스크린 → 온사이트 루프 4~5라운드 | Vanilla JS, 실행 불가 에디터, 리더십 원칙, Bar Raiser, DSA 라운드 |
| Apple | 폰 스크린 → 온사이트 4~6라운드 | 팀마다 다르다. JS 코딩, Bug Hunt, 웹 성능, Product Thinking |
| Atlassian | Karat 스크린(빠른 퀴즈 10분 + 코딩 45분) → 온사이트 | Vanilla JS와 프론트엔드 시스템 디자인. 24시간 안에 재응시 기회 |
| ByteDance·TikTok | 경험·이력서 심문 → 퀴즈 → 코딩 → 알고리즘 | 지난 프로젝트를 흐름도로 그리며 50분 토론하는 설계 라운드 |
| Canva | AI 보조 코딩, 언어 숙련도, 시스템 디자인 | 미리 준 주제와 실제 문제가 어긋날 수 있다. 백엔드 쪽 설계 |
| Coinbase | CodeSignal OA → 코딩 2라운드 + 행동 1라운드 | 테스트 스위트 채점, TypeScript 환경, 검색 금지 |
| Discord | 테크 스크린(채팅 앱) → 온사이트(스프레드시트) | 자기 IDE에서 프로젝트를 직접 만든다 |
| DoorDash | 리크루터 → 테크 스크린 1시간 → 가상 온사이트 4라운드 | 문제 풀이 거의 고정. 시스템 디자인은 백엔드 비중이 크다 |
| Dropbox | 디자인 명세를 주고 구현 | 실무형. Vanilla JS 디버깅 라운드 |
| eBay | 리크루터·매니저·팀 대화 + 기술 스크린 | 지저분한 JS·Node.js 코드 디버깅·리팩터링, 면접 중 AI 금지 |
| Ethos | 백엔드 코딩 + 프론트엔드 디버깅 + 시스템 디자인 + 매니저 | 풀스택 시니어. 기존 React 보드 앱 디버깅 |
| Google | DSA 2 + 프론트엔드 1 + 시스템 디자인 1 + 행동(Googlyness) 1 → 팀 매칭 → HC | 큰 문제 은행, 유출 문제 삭제. DSA 비중이 크다 |
| Harvey | 스크리닝 → 코드 리뷰 → 시스템 디자인 2회 → 프로젝트 심층 → 매니저 | 스프레드시트, 오프라인 우선 앱, ChatGPT형 인터페이스 |
| LinkedIn | 1시간 테크 스크린(퀴즈 + 코딩) → 온사이트 | JS 기본기 집중. 풀스택이면 LeetCode |
| Lyft | 폰 스크린 → 온사이트 | UI 코딩과 JS 유틸. 시스템 디자인이 예상보다 어렵다 |
| Meta | 폰 스크린 → 온사이트 4라운드(코딩 2, 행동 1, 설계 1) → 팀 매칭 | 유출 문제를 지우지 않는다. 40분에 2문제 |
| Microsoft | 팀마다 다르다 | LeetCode 비중, Rabin-Karp 문자열 매칭, Teams·Outlook 관련 설계 |
| Mozilla | 온라인 평가(CSS) → 빌드업 코딩 2문제 | LeetCode보다 실무형 HTML·CSS·JS |
| Netflix | 리크루터 → 기술 라운드 → 매니저 | 빠르고 자신 있게 코딩해야 한다. 컬처 메모 |
| OpenAI | 소개 통화 → 기술 평가 → 최종 | 스크린이 풀스택(DSA 1시간 + 풀스택 설계 1시간)일 수 있다. 스트리밍 UI |
| Oracle | 6라운드(DSA 2, JS 1, 설계 2, 코딩+설계 1) | 라운드마다 행동 질문 1개 이상 |
| Palantir | 폰 스크린(DSA) → 온사이트(Decomp 60분 + React 디버그·확장 90분) | 화이트보드 없는 Decomp 라운드, 미션 공감 |
| Pinterest | 온사이트: 알고리즘 1 + React 코딩 1 + 프론트엔드 설계 1 + 행동 1 | 프론트엔드 트랙과 풀스택 트랙이 따로 있다 |
| Ramp | 시간제한 OA → 기술 면접 | Wordle, 캘린더 CRUD |
| Reddit | 폰 스크린 → 온사이트(코딩, 설계, UI 코딩, 매니저) | 소통·협업 중시, 주니어에게 설명하듯 답하기 |
| Rippling | 폰 스크린 → 온사이트 | 「프론트엔드」도 풀스택으로 평가. Node 서버로 CRUD API 구현 |
| Robinhood | 폰 스크린 | 이벤트 이미터 3단계. 시니어·스태프는 3단계 모두 통과해야 한다 |
| Roblox | JS 스크린 → 알고리즘 → 설계 | 설계의 백엔드 깊이가 팀마다 다르다 |
| Salesforce | OA(DP) → DSA → 설계 또는 클래스 설계 | 프론트엔드 직함이어도 UI 라운드가 없을 수 있다. LMTS는 HackerRank 코드 리뷰 평가 |
| Shopify | 페어 프로그래밍 | Roomba 문제 |
| Squarespace | 라이브 디버그 스크린 → 온사이트 설계 | 과제 전형에서 라이브 디버그로 바뀌었다. 오픈북 |
| Stripe | (풀스택) 1일 차: Programming Exercise, Bug Squash, Integration / 2일 차: Experience and Goals, Full Stack Design | 단계별 검증, 접근성 후속 질문 |
| X(Twitter) | Karat 1차 스크린 → 온사이트 | 단계별 피드 UI, 「Logical & Maintainable」 라운드 |
| Uber | BPS 스크린 → DSA, 웹 기본기, 프론트엔드 설계, 컬처 핏, 매니저 | 비동기 유틸(동시성 큐, 배처, 속도 제한기). 면접관마다 문제 성격이 다르다 |

## 회사별 상세

### Adobe

- **전형**: HackerRank와 매니저 질의응답 뒤 온사이트 5라운드. 다른 형식으로는 기술 스택 전반의 빠른 질문 + 앱 디버깅 + 성능 개선 토론(사전 온사이트), 아키텍처, 행동·기술 토론, 커스텀 훅 코딩, 매니저 대화가 보고됐다.
- **JS 코딩**: 페이지의 링크를 돌려주는 `getAllLinks(url)`로 모든 후손 링크 모으기(순환 참조, Promise 반환, 비동기 효율, 시간 복잡도까지 확장), `Array.prototype.reduce` 폴리필, 배열의 리더 찾기(오른쪽 모든 원소보다 큰 원소), `setInterval`을 쓰는 커스텀 React 훅(콜백을 `useState`가 아니라 `useRef`에 두지 않으면 인터벌이 두 번 실행된다).
- **UI 코딩**: 아코디언(Vanilla JS 또는 React), 문서 상단 헤더 디자인을 React 컴포넌트로, m × n 격자의 플러드 필(도형 안을 클릭하면 그 도형만, 밖을 클릭하면 도형을 뺀 전체를 채운다. 의사 코드 허용).
- **시스템 디자인**: LRU 캐시 설계, 체스 게임의 클래스·인터페이스 설계(OOD). 프론트엔드가 아닌 일반 설계가 나올 수 있다.
- **알고리즘**: 0과 1 배열에서 섬 개수(LC 중간), 날짜 문자열 변환(LC 쉬움).
- 테스트 케이스가 준비되지 않아 코드를 손으로 실행해 보여야 했던 사례가 있다.

### Airbnb

- **JS 코딩**: 간단한 Promise 구현, Backbone 스타일 `StoreData` 클래스(키·값 저장 + `change:foo` 같은 변경 리스너 + 전역 변경 리스너. `unset`은 데이터만 지우고 구독은 남겨, 다시 `set`하면 기존 리스너가 모두 불려야 한다).
- **UI 코딩**: 입력과 JSON 목록 엔드포인트로 자동완성(키보드 탐색 포함), 폼 안의 별점 위젯을 일반 폼 액션으로 제출하고 여러 개 재사용, 탭, 슬라이드마다 시간이 다르고 마지막에서 멈추는 이미지 캐러셀(후속: 슬라이드별 카운트다운, 0이 되면 자동 넘김), 카드 5장을 섞어 한 장씩 애니메이션으로 공개.
- **시스템 디자인**: 채팅 앱, Airbnb(숙박 예약).
- **알고리즘**: 「실무형이 많다」는 안내와 달리 스크린에서 LC 어려움이 나온 사례가 있다.
- 면접관이 시간이 다 될 때까지 기능을 계속 더한다. 접근을 먼저 말하면 잘못된 방향일 때 힌트를 준다. 결정마다 「왜」를 묻는다. 카운트다운이 어려운 부분이므로 `useEffect` 안의 `setInterval`과 정리(cleanup)를 익혀 둔다.

### Amazon

- **전형**
  - **온라인 평가(OA)**: 코딩(LeetCode형 또는 UI 컴포넌트, Vanilla JS), 설계 상황 질문(객관식·단답), 리더십 원칙에 관한 업무 스타일 설문. 단골은 아코디언, 가입 폼, 데이터 테이블, 할 일 목록.
  - **기술 폰 스크린**: 45~60분. 리더십 원칙 행동 질문 + JS·HTML·CSS·DOM 화이트보드식 코딩.
  - **온사이트 루프**: 55~60분짜리 4~5라운드. 중~상 난이도 DSA, 프론트엔드 기본기(JS, HTML, CSS, DOM, 브라우저 API, 이벤트 루프, 접근성, 성능, 작은 컴포넌트 구현·디버깅), 프론트엔드 시스템 디자인(사진 갤러리, 타입어헤드. 미드~시니어에게 중요), 리더십 원칙 행동 라운드. 면접관 한 명은 **Bar Raiser**다.
- **환경**: 사내 일반 에디터에서 코드를 실행할 수 없고 자동완성·문법 강조도 없다. 사내에 프레임워크가 여럿이라 기본기를 보려고 Vanilla JS를 요구한다.
- **기본기 범위**: 시맨틱 HTML·ARIA, CSS 레이아웃·박스 모델·명시도·상속·반응형·애니메이션, JS의 `this`·클로저·프로토타입·이벤트 루프·호이스팅·`var`/`let`/`const`, ES6+ 문법, 이벤트 위임, Local·Session Storage·Web Worker·Geolocation 같은 브라우저 API, 디바운스·스로틀·크리티컬 렌더링 패스, XSS·CSRF·CORS.
- **시스템 디자인 평가 축**: 확장성, 모듈성, 성능(초기 로드·상호작용·데이터 가져오기), 신뢰성(에러·네트워크 문제), 유지 보수성, 접근성, 트레이드오프(CSR vs SSR, 캐시 전략).
- **행동**: 리더십 원칙 16개 각각에 STAR 사례를 2~3개 준비한다. 원칙별 단골 질문은 [[behavioral-interview-questions#Amazon 리더십 원칙과 단골 질문|인성 면접 준비]]에 있다.
- **퀴즈**: CSS 박스 모델, 클로저, URL을 입력하고 엔터를 누르면 일어나는 일.
- **JS 코딩**: `Array.prototype`의 `map`·`reduce`·`filter`·`sort`, 객체를 재귀로 거르는 `filter`, `getElementsByStyle(property, value)`, `promisify`, `JSON.stringify`(OOP식 변형), 상대 시간 표시(「just now」~「n years ago」, `Date.now()`와 비교), 중첩 폼 입력 정화.
- **UI 코딩**: 검색·정렬되는 데이터 테이블, 이메일 수신자 자동 제안 칩(Material UI Chips), 좋아요 버튼, JSON으로 파일 디렉터리 트리, 5개씩 넘기는 주소 페이지 위젯, 검색창, 별점, 틱택토, 접근성을 지킨 Flexbox 적응형 레이아웃, 말을 옮기는 체스판, 배너 이미지 위 텍스트, Vanilla JS 이미지 캐러셀, 주소 목록 무한 스크롤(페이지네이션·기기·느린 네트워크·에러 처리 후속), 하나만 열리다 체크박스로 여러 개 열리게 바뀌는 아코디언, 이름·이메일·전화 검증 후 표에 추가하고 전화번호로 거르는 주소록 폼, 할 일 앱, 질문 1000개·좋아요 수·페이지네이션이 있는 FAQ 아코디언(API 엔드포인트 논의), 클릭한 칸만 강조되는 n × n 체스 격자(재사용성·확장성·최적화), 디바운스 붙은 자동 제안 드롭다운.
- **시스템 디자인**: 토핑을 고르는 음식 주문 앱, 아코디언 컴포넌트, Times of India 같은 뉴스 사이트(스키마·API, 동영상 렌더링, 광고), 모바일 플레이리스트 페이지, 자전거 공유(Citi Bike), 스로틀링·재시도를 갖춘 JS SDK(소비자가 지킬 계약 정의), 목업을 주는 병원 체크인 앱(엔드포인트, 페이지네이션, 로드 밸런싱).
- **알고리즘**: 계산기 구현(LC 772 「Basic Calculator III」와 비슷), 유사어 사전으로 두 캡션이 같은지 판별.
- 렌더링 속도를 높이는 질문에서 지연 로딩·SSR·정적 페이지·적정 크기 이미지 다음으로 [[list-virtualization|리스트 가상화]]를 기대한다.

### Apple

- **전형**: 팀마다 크게 다르다. 한 사례는 가상 45분 × 4라운드였다. JavaScript(테크 스크린과 비슷), **Bug Hunt**(기존 코드베이스에서 작업), **Web Performance**(웹 성능 도메인 지식), **Product Thinking**(협업, 기술과 비즈니스 요구의 균형, 사용자 영향을 보는 행동 라운드). 시니어 풀스택은 React 폰 스크린 + DB 스키마 설계·React 코딩·행동·CSS 라운드였다. 경력과 배경 위주로 묻고 쉬운 JS 문제 하나로 끝난 사례도 있다.
- **JS 코딩**: `Array.prototype`의 `flat`·`map`·`reduce`·`concat` 직접 구현, Promise 배열을 순서대로 실행하기.
- **UI 코딩**: 라이브러리 없이 Vanilla JS 사진 정렬 도구, 진행 바 그룹(폰 스크린은 애니메이션 없이), 단계 사이 데이터를 넘기는 다단계 폼(Redux 필수였던 사례), Pinterest식 메이슨리 레이아웃(CSS 라운드), React 할 일 앱.
- **시스템 디자인**: DB 스키마 설계(풀스택 성격, 이후 프론트·백 중 골라 심화), Pinterest(메이슨리 피드).
- **퀴즈**: npm 패키지를 만드는 법, CSS의 합성 레이어(compositing layer).
- **알고리즘**: 각 값을 다음 두 항목의 곱으로 바꾸기(`[3, 4, 5]` → `[20, 15, 12]`). 기본 문제에 다른 문제의 개념을 후속으로 엮으므로 패턴 인식이 중요하다. Blind 75 수준은 준비한다.

### Atlassian

- **전형**: Karat 60분 화상 면접. 처음 10분은 모던 JavaScript 빠른 질문, 나머지 45분은 Vanilla JS·HTML·CSS 코딩 1~2문제(React 없음, 첫 문제를 끝내야 두 번째로 간다). 24시간 안에 재응시할 수 있고 더 나은 결과를 쓴다. 이후 브라우저 코딩 라운드는 React였고 HackerRank 환경이 TypeScript였던 사례가 있다.
- **퀴즈(자료 없이 말로)**: 배열 메서드(`push`, `pop`, `unshift`), `Promise.any`, 비동기 제너레이터·`await`·`yield`·`for await` 루프·`Promise.resolve`.
- **UI 코딩(자료 허용)**: HTML·CSS만으로 검색 위젯(높이·너비를 고정값 대신 `em`·`%`로), API에서 할 일을 20개씩 가져와 렌더링(헬퍼 없이 `fetch`, DOM 요소 생성·추가·제거), React 위젯, JS 유틸, 쿠키 동의 배너.
- **시스템 디자인**: Jira 스프린트 보드(최근 가장 잦다), 성능 벤치마크 유틸.
- 모든 레벨에서 Vanilla JS와 프론트엔드 시스템 디자인을 강하게 본다. 문제 은행이 커졌고 유출 문제를 의식하므로 기출만 믿지 않는다. 코드를 쓰며 성능상 어떤 자료구조를 고를지 설명할 준비를 한다.

### ByteDance·TikTok

- **전형**: 지난 프로젝트·경험 이야기(약 20분) → React 코딩 → JS 퀴즈 → LC 중간. 다른 사례는 LeetCode와 JS 기본기 → UI 컴포넌트와 후속 → 지난 프로젝트 기반 설계 + JS 코딩. 초기 루프에 행동 라운드가 없는 경우도 있다. 신입에게도 이력서의 모든 기술을 깊게 묻고, 협업보다 엔지니어링 사고를 본다. 제품 전반에 AI를 넣고 있어 **AI로 코딩하는 법**에 관한 질문이 나온다.
- **JS 코딩**: `Promise.all`, `Array.prototype` 확장, `Function.prototype.bind` 폴리필(`new` 호출 처리), 동시성 제한 비동기 매핑(스케줄링 조건을 먼저 확인), Koa식 비동기 미들웨어 `compose`(f1, f2, f3가 `next()`로 중첩 순서대로 실행), DOM 대신 HTML 문자열을 내는 React식 VDOM, Promise와 `console` 출력 순서 맞히기. 세 문제를 30분 안에 순서를 골라 푼 사례가 있다.
- **UI 코딩**: 드롭다운, 선택 항목을 두 목록 사이로 옮기는 전송 목록(React 지원이 제한된 환경일 수 있다), 이미지 가져와 렌더링(로딩·실패 상태), 포인터를 올리면 1초 동안 180도 회전하는 이미지.
- **시스템 디자인**: 지난 프로젝트의 흐름도를 그리고 개선점을 50분 동안 토론, TikTok LIVE 같은 실시간 댓글이 화면에 반영되는 방식.
- **퀴즈**: `localStorage`와 쿠키의 차이([[web-storage|웹 스토리지]]).
- **알고리즘**: 정렬된 두 배열 병합과 중복 제거, 점 목록에서 네 점이 정사각형을 이루는지, 괄호 균형, 두 노드 사이의 트리 구간, 격자의 섬 찾기.

### Canva

- **전형**: 표준 DSA 스크린 대신 **AI 보조 프로그래밍(AIP) 라운드**로 바뀌었고, 시스템 디자인·아키텍처 세션은 백엔드 비중이 크다. 스태프 레벨은 1차가 LeetCode·HackerRank형이었다.
- **JS 코딩**: 흔한 Promise 기반 문제, 「언어 숙련도」 라운드에서 TypeScript로 메모리 내 댓글 서비스 만들기(DOM 변경, 이벤트 처리, 비동기를 준비하라는 안내와 HTML·CSS·JS 시작 파일을 미리 준다. TypeScript 환경을 미리 갖춰 둔다).
- **UI 코딩**: 시작 코드 위에 십자말풀이 게임 로직(규칙을 초반에 확인한다), AI 보조 라운드에서 사용자가 자기 컴포넌트를 추가할 수 있는 React 에디터(HTML5 canvas, react-dnd 드래그 앤 드롭, GrapeJS·CraftJS 같은 모듈형 에디터).
- **시스템 디자인**: 프로덕션 수준의 Figma 클론(그리기 도구. 범위를 지원자가 정하길 기대한다), Netflix·Uber·Google Docs 예시 문제, 「SPA를 확장할 때 어떤 클라이언트 기술을 쓰나, SPA란, 대안은」 같은 쪽지 시험형 설계.

### Coinbase

- **전형**: CodeSignal OA(데이터를 가져오는 작은 앱, 잡 보드와 비슷) → 온사이트 코딩 2라운드 + 행동 1라운드. 레벨에 따라 시스템 디자인이 더해진다.
- **채점**: 면접관의 말 판단이 아니라 **제공된 테스트를 통과하는지**로 채점한다. 환경은 TypeScript지만 타입에 엄격하지 않아 `any`를 써도 된다. 면접 중 검색이 금지라 HTML 이벤트 타입 같은 것도 기억으로 써야 한다. 모든 부분을 끝까지 구현하지 않고 실무라면 어떻게 할지 말로 설명해도 받아 준다.
- **UI 코딩**: 주어진 자료구조를 거르고 보여 주는 검색 입력(도메인 라운드), 부분 구현된 앱의 빈칸 채우기(**Tech execution** 라운드. 유틸 함수, UI 컴포넌트, 데이터 가져오기, JS 기본기를 각 테스트로 검사), 잡 보드형 앱.

### Discord

- **전형**: 테크 스크린과 온사이트 코딩 모두 공유 에디터가 아니라 **자기 IDE에서 원하는 UI 프레임워크로 프로젝트를 직접 만든다**. AI 허용 여부는 라운드마다 다르다.
- **UI 코딩**: Discord식 채팅 웹 앱(풀스택판은 React + Node.js + WebSocket, 프론트엔드 전용판도 있다), Excel 셀처럼 동작하는 React 컴포넌트, Google Sheets 클론(1부: 셀에 입력, 2부: 다른 셀을 참조하는 수식. **수식 해석 로직이 핵심**).
- **시스템 디자인**: 채팅 앱(Discord·Messenger), Google Sheets(공동 스프레드시트).

### DoorDash

- **전형**: 리크루터 → 테크 스크린(약 1시간, 엔드포인트에서 가져와 보여 주는 작은 UI) → 가상 온사이트 4라운드: 매니저(STAR 행동 + 약간의 도메인), 시스템 디자인, **Onsite feature**(기존 코드에 기능 추가), 도메인 지식(프로젝트 심층 + JS·테스트·최적화 퀴즈). 과제 전형은 최근 보고되지 않는다. 팀이 달라도 문제가 거의 같다.
- **JS 코딩**: 망가진 `fetch` 헬퍼 고치기. 맞아 보이지만 `fetch(...)`의 Promise를 `return`하지 않는 버그를 찾아야 한다.
- **UI 코딩**: 엔드포인트(강아지 API·Reddit 강아지 피드)에서 이미지를 가져오는 이미지 슬라이더(온사이트에서 좋아요·싫어요와 저장 추가), 변형으로 API의 상품 카드 목록. 데이터 가공 없이 `.map`으로 필드만 꺼내면 된다. 반응형 CSS를 익혀 둔다.
- **시스템 디자인**: Slack 같은 메시징 제품. Excalidraw에 클라이언트 쪽 상자만 그려진 다이어그램(화살표가 빈 곳을 가리킨다)을 주고 서버·DB 아이콘을 끌어와 **백엔드를 채우게** 한다. REST vs GraphQL, BFF가 필요한지([[bff|BFF]], [[graphql|GraphQL]]), 캐시와 데이터 흐름을 정당화한다. 대안 아키텍처를 2개 이상 내 본다.

### Dropbox

- **전형**: 알고리즘보다 **실무형**이다. 디자인 명세를 주고 웹 기술 숙련을 보여 주는 최선의 구현을 요구한다. 공식 웹 개발자 면접 준비 가이드가 있다. Vanilla JS로만 하는 디버깅 라운드가 있었다.
- **JS 코딩**: `getByClassName()`과 `getByClassnameHierarchy()`, OOP 기반 클래스 관리 시스템.
- **UI 코딩**: 이미지 갤러리(Vanilla JS 캐러셀), 휴대폰 키패드로 단어 만들기, 날씨 API UI를 디자인 명세대로, Dropbox 홈페이지 한 화면을 명세대로, CoderPad에서 비즈니스 로직 중심의 React 컴포넌트(스타일은 덜 본다).
- **시스템 디자인**: Google Calendar, 웹사이트에 i18n 넣기(접근법과 트레이드오프), Google Sheets, 식당 예약 시스템 API 설계(풀스택 성격).
- **알고리즘**: `log_hit()`과 `get_hits_in_last_five_minutes()`로 최근 5분 방문 수 세기.

### eBay

- **전형**: 공식 채용 가이드는 리크루터·매니저·팀 대화와 일부 직무의 기술 스크린·평가를 설명하며 프론트엔드 전용 일정은 정하지 않는다. AI는 준비에는 써도 되지만 **면접·평가 중에는 금지**다.
- **JS·Node.js 코딩**: 지저분한 JS·Node.js 앱을 1시간 동안 디버깅·리팩터링(신뢰성, 보안, 유지 보수성, 확장성 같은 시스템 전반 영향), 여러 데이터 소스를 모으는 비동기 엔드포인트를 서버에 추가(검증, 요청 로깅, 알림, 스트리밍 갱신 후속), UI 프레임워크 없이 JS 문제 풀기. 순수 Node.js 과제로만 진행된 사례도 있다.
- **시스템 디자인**: 상품 목록(PLP)에서 상세(PDP)로 가는 여정. 데이터 가져오기와 내비게이션 상태, 목록으로 돌아올 때 필터 유지, 상세가 느리거나 실패할 때의 처리.

### Ethos

생명보험 회사다. 시니어 풀스택 루프 기준이다.

- **UI 코딩**: 버그가 있는 Trello·Jira형 React 보드 앱에 레인 분류, 필터링, 정렬, 라우팅 구현. 원본 레코드가 화면의 카드로 바뀌는 과정을 설명하고, 보기를 바꿔도 공유 데이터가 망가지지 않는지 확인한다.
- **알고리즘(백엔드 코딩)**: 약 복용 기록(시작일·종료일)에서 하루에 겹치는 최대 개수. 회의실 문제(Meeting Rooms II)와 같은 아이디어지만 끝 날짜를 포함하는지에 따라 답이 달라진다.
- **시스템 디자인**: 브라우저와 백엔드를 아우르는 주식 거래 플랫폼(DB 선택, 지연 보장, 일관성, 데이터 내구성, 장애 조치), 주문이 대기·확정·중단된 상태를 UI가 어떻게 보여 주나.
- **매니저**: 대표 프로젝트 심층(특히 복원력과 장애 조치), 팀 운영 개선.

### Google

- **전형**: 시니어 기준 DSA 2 + 프론트엔드 1 + 시스템 디자인 1(프론트엔드든 백엔드든 될 수 있다) + 행동 1. L4 사례는 DSA → 프론트엔드 → **Googlyness**(행동·이력서) → DSA → 팀 매칭 → HC(채용 위원회) 검토 → 오퍼였다. 예전 면접 준비 PDF는 지금 커리어 페이지로 넘어가므로 직무별 안내는 리크루터에게 받는다.
- **문제 은행**: 크고, **유출된 문제는 지운다**. 기출 암기보다 NeetCode 150 수준의 문제를 깊게 이해해 처음 보는 문제를 푸는 힘이 필요하다. 쉬움~어려움 DSA 모두 나온다.
- **JS 코딩**: 콜백을 타임아웃 뒤에 부르는 함수(디바운스로 확장), Google Docs 개요(outline) 보기 구현, HTML 노드 DFS, 50ms에 한 번만 실행되는 스로틀, 타임라인에서 선택 범위 안의 노드 고르기, 제너레이터로 구현하는 파일 시스템 API·스트리밍 API(DSA 라운드), 실행 불가 문서에서 Vanilla JS로 버튼 같은 작은 기능.
- **UI 코딩**: 슬라이더, 틱택토(게임 또는 알고리즘), 색상 견본(color swatch) + 슬라이더 후속, 중첩 체크박스(부모를 체크하면 자식도, 반대도. `indeterminate` 상태), 바닥에 닿으면 새 글을 불러오는 페이지, 행·열 수를 입력받아 열 방향으로 지그재그 번호를 매긴 표를 그리는 폼.
- **퀴즈**: CSS 박스 모델, URL을 입력하면 일어나는 일, 페이지의 텍스트를 사라지게 하는 방법은 몇 가지인가, 페이지 새로 고침 없이 서버에 데이터를 보내는 법.
- **시스템 디자인**: 이모지 자동완성, JS Bin, 웹페이지에 넣는 Google Analytics SDK.
- **알고리즘**: 지뢰 찾기 `reveal()`, 네 수와 사칙연산으로 24 만들기(순서 유지), k개 최근접 점, 카드 덱에서 조건을 만족하는 부분집합 모두 찾기.

### Harvey

- **전형(풀스택)**: 스크리닝(Google Sheets UI 설계·구현, 여러 셀과 수식으로 확장. 동작하는 결과가 있어야 통과) → **코드 리뷰**(제품 코드베이스에서 로딩·에러 상태, `useEffect` 코드 냄새, 단순화, 에디터 청크 지연 로딩 지적) → 시스템 디자인 → 지난 프로젝트 심층 → Bar Raiser 시스템 디자인 → 매니저(동기, 팀 간 프로젝트 운영).
- **UI 코딩 변형**: 브레드크럼과 폴더 생성·삭제가 있는 파일 트리 탐색.
- **시스템 디자인**: 문서 업로드와 외부 데이터 연결이 있는 ChatGPT형 인터페이스(컴포넌트 구조, 상태 관리, API), **오프라인 우선 앱**(영속 데이터, 동기화, 충돌, 복구 UX). 큰 업로드는 진행률·취소·이어 올리기, 묶음 업로드는 동시성 제한·재시도·파일별 결과를 다룬다. 앱 데이터와 대기 중인 변경은 서비스 워커가 캐시하는 자산과 분리해 IndexedDB 같은 영속 저장소에 두고, 다시 열거나 재연결할 때 재생한다. 서비스 워커가 계속 떠 있다고 가정하지 않는다([[indexeddb|IndexedDB]], [[pwa-offline-storage|PWA 오프라인 저장소]], [[service-worker-lifecycle|서비스 워커 생명주기]]).

### LinkedIn

- **전형**: 시니어 테크 스크린은 1시간에 퀴즈 + 코딩 여러 개. JS 기본기를 집중해서 본다(프론트엔드 코드베이스가 Ember라 프레임워크 경험보다 기본기를 본다는 해석이 있다). 폰 스크린은 JS·웹·HTML 퀴즈와 LC 쉬움. 풀스택은 LeetCode(구간 병합 등). 스태프 풀스택 루프에는 AI 보조 세션이 있었다.
- **JS 코딩**: `getElementsByClassName`, 메모이제이션(요구가 바뀌며 여러 인자로 확장).
- **UI 코딩**: 아코디언, Vanilla JS로 API 가져오기·페이지네이션이 있는 무한 스크롤(스크롤 이벤트 + 스로틀보다 [[intersection-observer|Intersection Observer]]가 낫다), 툴팁, 크로스 브라우저 LinkedIn 상단 내비게이션 바.
- **퀴즈**: padding과 margin, Promise와 콜백, 이벤트 버블링과 캡처링, 콜백과 클로저, 전처리기(Sass, Stylus, Less)의 장점, 이벤트 위임.
- **시스템 디자인**: 프론트엔드·백엔드를 아우르는 채팅 앱.
- **알고리즘**: 이중 연결 리스트 뒤집기.

### Lyft

- **전형**: 1시간 기술 폰 인터뷰(소개 10분, 질문 10분, 나머지 라이브 코딩) → 온사이트. UI 코딩과 JS 유틸 함수 문제가 많고, 프론트엔드 시스템 디자인이 예상보다 어렵다.
- **JS 코딩**: `Promise.all`, Vanilla JS로 지뢰 찾기 로직.
- **UI 코딩**: 자동완성, 디지털 시계.
- **시스템 디자인**: GitHub 저장소 파일 보기 같은 파일 관리 시스템.

### Meta

- **전형**: 폰 스크린 → 온사이트 4라운드(코딩 2, 행동 1, 시스템 디자인 1) → 팀 매칭(오래 걸릴 수 있다). IC6 이상은 설계 라운드가 하나 늘고 코딩이 하나 준다. 코딩은 40분에 2문제(문제당 약 17.5분)이고 변형 문제를 낸다.
- **문제 은행**: **유출 문제를 지우지 않는다.** Meta 태그 LeetCode 상위 100~250문제가 효율이 높다. 다만 프론트엔드 파이프라인이면 문제가 프론트엔드 중심이라, DSA만 준비했다가 이벤트 이미터나 `classnames`에 당황하는 경우가 있다.
- **JS 코딩**: 이벤트 이미터, `classnames`(문자열·배열·조건 객체 조합), Decryption 클래스(호출마다 새 키를 만드는 `decryptEncrypt(key, payload, callback)`의 콜백을 큐에 넣어 순서대로 처리. 이름과 달리 보안이 아니라 비동기 큐 문제), 같은 모양의 두 DOM 트리에서 대응 노드 찾기(`parentNode`로 올라가며 경로를 기록하고 다른 트리에서 재생하는 것이 DFS·BFS보다 효율적).
- **UI 코딩**: 스크롤을 따라다니는 스티키 광고. 스크롤이 끝난 뒤가 아니라 스크롤 중에 위치를 바꿔야 하므로 디바운스보다 **스로틀**이 맞다([[debounce-throttle|Debounce와 Throttle]]).
- **시스템 디자인**: 데이터 테이블 컴포넌트(자주 나온다), 자동완성, 뉴스 피드. RADIO로 접근한다.

### Microsoft

- **전형**: 팀과 매니저 취향에 따라 크게 다르고 추천이 결과를 보장하지 않는다. LeetCode 비중이 큰 루프(시스템 디자인 + React 코딩 + LeetCode), SDE II 루프와 비슷하지만 시스템 디자인 비중이 큰 루프, React 할 일 앱 + LC 쉬움·중간 + 매니저(행동 + 설계) + JS SDK 설계 루프가 보고됐다. 리크루터에게 라운드를 꼭 묻는다.
- **JS 코딩**: Vanilla JS 틱택토, Teams 같은 채팅 화면, OOP 체스, 옛 휴대폰 키패드(2 = abc, 같은 키를 짧은 시간 안에 다시 누르면 다음 글자, 시간이 지나면 다음 글자 추가), 스로틀링·재시도를 갖춘 JS SDK(소비자 계약 정의), **Rabin-Karp** 문자열 매칭(자주 나온다).
- **UI 코딩**: Teams 같은 알림 화면, 이미지 슬라이더, React 할 일 앱(추가·삭제·수정), 페이지네이션 토큰으로 더 불러오는 React 주소록.
- **퀴즈**: 프로토타입, 클로저, `let`·`const`·`var`의 차이, DOM이란.
- **시스템 디자인**: Outlook 같은 이메일 클라이언트, Teams의 일부(프론트·백 중 골라 심화), Microsoft 365 할 일 앱, Copilot을 어떤 앱에도 붙일 수 있게 모듈화하기. API 설계에 무게를 둔 루프도 있다.
- **알고리즘**: 3Sum 변형(LC 중간), LC 어려움.

### Mozilla

- **전형**: LeetCode보다 실무형 HTML·CSS·JS. 기능을 단계적으로 덧붙이는 **빌드업 코딩** 2문제. 일부 직무에는 CSS 중심 온라인 평가·과제가 생겼다.

### Netflix

- **전형**: 몇 달마다 바뀐다. 리크루터 스크리닝은 기술 질문 없이 쓰던 스택과 지난 프로젝트 요약 정도다. 기술 라운드에서는 **빠르고 자신 있게** 코딩해야 하고, 머뭇거리거나 디버깅 중 실수가 이어지면 면접을 중단하기도 한다. 생각을 말하면서도 막히지 않을 만큼 라이브 코딩이 유창해야 한다.
- **코딩·설계**: JavaScript·React 로직과 상태 변화 설명, UI가 보이지 않는 JS·React 코딩일 수 있으니 확인, 팀의 제품·엔지니어링 도메인을 조사해 시스템 디자인 준비.
- **매니저**: 자랑스러운 프로젝트(적당한 깊이의 심층), 다른 엔지니어와의 갈등, 매니저에게 가장 많이 받은 부정적 피드백. 컬처 메모와 「드림 팀」 개념을 알아 두면 협업·피드백 이야기에 맥락이 된다.

### OpenAI

- **전형**: 공식 가이드는 소개 통화 → 기술 평가 → 최종 면접이다. 평가 형식과 AI 도구 허용은 면접마다 다르고 준비 자료에 적혀 있다. 한 사례는 테크 스크린이 **DSA 1시간 + 풀스택 설계 1시간**이고 온사이트는 도메인(프론트엔드) 중심이었다. 프론트엔드 트랙과 풀스택 트랙을 골라 지원하기도 한다. 프론트엔드 면접이어도 DSA를 건너뛰지 않는다.
- **UI 코딩**: 제공 API(시를 돌려주는 API였던 사례)에서 가져와 상호작용과 함께 보여 주는 UI, 응답 조각을 스트리밍하는 함수로 ChatGPT형 화면(응답 중에도 새 요청 받기, 한 글자씩 표시, 참조 레이아웃 맞추기, React 상태 갱신·DOM·CSS 텍스트 렌더링 설명). **받은 응답 데이터와 화면에 표시 중인 텍스트를 분리**하면 스트리밍과 타자기 효과를 따로 다룰 수 있다.
- **시스템 디자인**: 예전 ChatGPT, 모델 선택·파라미터 편집·프리셋 저장·공유·불러오기가 있는 내부 ChatGPT Playground(컴포넌트 트리, 스키마, API, 실시간 갱신, 동시 편집).

### Oracle

OCI SDE-3 사례다. 라운드마다 행동 질문이 하나 이상 섞인다.

- **JS 코딩**: Squash Object(중첩 객체를 점으로 이은 키의 한 단계 객체로), `"1+3-2"` 같은 식 계산(연산자 우선순위 없이, 모든 예외 처리), 두 배열의 공통 원소(`[1, 2, 2, 4, 5]`와 `[3, 2, 4, 2]` → `[2, 2, 4]`, 후속: 행렬로 확장).
- **UI 코딩**: 기능이 빠진 React 앱을 고쳐 끝까지 동작하게 만들기.
- **시스템 디자인**: Jira 보드 프론트엔드, 봇 요청을 막는 백엔드 시스템, URL 단축기 백엔드([[url-shortener-design|URL 단축기 설계]]) + 지금 일하는 앱의 상위 프론트엔드 아키텍처 설명.

### Palantir

- **전형**: 폰 스크린(DSA. 프론트엔드 지식 불필요) → 온사이트 2라운드: 60분 **Decomp**(분해) + 90분 React 앱 디버그·확장(JS 또는 TS). 풀스택 지원이면 기술 면접(LeetCode) + 웹 개발 + Decomp + 매니저였다. 행동·문화 적합성을 강하게 본다. 면접관 모두 「미션」에 끌려 왔다고 말할 만큼, **미션에 공감한다는 이야기**를 준비한다.
- **JS·DSA**: 널리 공유된 「quick fox」 문제, 구간 클래스(삽입, 겹침, 병합), 텍스트에서 두 단어 사이 거리가 k 이하인 위치, 트리·그래프 순회, 그래프가 특정 성질을 만족하는지 검증(시간·공간 복잡도 후속).
- **UI 코딩**: React 앱 디버그·확장. JS 기능은 금방 끝나고 대부분의 시간이 스타일과 서식에 든다.
- **Decomp 라운드**: 일반 프론트엔드 시스템 디자인과 달리 화이트보드가 없고 기술적으로 깊게 들어가지 않는다. **일반 텍스트 에디터**에서 개념을 설명하고 정리한다. 면접관 의존도가 크고, 면접관의 틀과 어휘에 맞춰 「Palantir 사람처럼」 생각하는지 본다. 다이어그램 도구 없이 텍스트로만 설계하는 연습을 한다.

### Pinterest

- **전형**: 온사이트는 보통 알고리즘 1 + React 프론트엔드 코딩 1 + 프론트엔드 시스템 디자인 1 + 행동 1. 프론트엔드 트랙과 풀스택 트랙의 루프가 다르니 확인한다. 예전에는 React 직무인데 Python DSA만 3라운드였던 사례도 있다.
- **DSA**: 「Can you win」(LeetCode Jump Game I·II 변형, 20~30분에 중간 난이도 2문제를 풀 수 있어야 한다), 배열과 시작 위치가 주어질 때 0에 도달할 수 있는지(각 값만큼 좌우로 정확히 이동, 끝에서 넘치면 반대쪽으로 감김. 방문 기록과 재귀로 풀고 후속으로 큐 기반 반복으로 바꾸기), 댓글 스트림에서 부적절한 단어 찾기(트라이).
- **시스템 디자인**: Pinterest(메이슨리 피드). Pinterest의 메이슨리 컴포넌트와 동적 이미지 배치가 참고 자료다.

### Ramp

- **UI 코딩**: 시간제한 평가에서 Wordle(45분), 생성·조회·수정·삭제가 있는 캘린더, 기존 앱의 독립된 버그들 진단(예전 과제 전형). 동작하는 기본형을 먼저 끝내고 기능을 더하며, 잘못된 입력과 반복 동작을 확인한다. 로컬 IDE에서 도움 없이 처음부터 시간을 재며 반복 연습한 것이 효과적이었다.
- **설계·프로젝트**: 비용 청구가 제출에서 승인까지 가는 흐름과 대기·성공·실패 상태, 지난 프로젝트의 상태 관리·데이터 가져오기 선택 이유.

### Reddit

- **전형**: 폰 스크린(GET·POST, XSS 같은 일반 질문, 피드를 말로 설계, 배열·필터 코딩 20분) → 온사이트(배열 다루기 코딩, 퀴즈 게임 앱 설계, 폼 관련 UI 코딩) → 매니저. **소통과 협업**을 중시한다. Vanilla JS와 React 모두 나온다.
- **JS 코딩**: 객체나 `Set` 없이 메시지 목록 중복 제거(시간·공간 비용 논의), 배열 필터·변환, HTML 폼 데이터로 JSON 객체 만들기, **주니어 엔지니어에게 설명하듯** GET vs POST 같은 웹 개념 설명.
- **UI 코딩**: HTML·JS 폼 화면, React에서 `setInterval`·`setTimeout`으로 데이터 애니메이션·시각화(언마운트와 재시작 때 정리).
- **알고리즘**: 입력으로 그래프를 만들고 순회(레코드가 노드·간선이 되는 방식, 끊긴 노드와 사이클 확인).
- **시스템 디자인**: 구현 없이 피드를 말로 설계, 퀴즈·트리비아 앱(클라이언트 구조, API, 성능).

### Rippling

- **전형**: 역할·팀마다 다르다. 「프론트엔드」 직무도 **풀스택으로 평가**하는 경우가 있다. Express 같은 간단한 Node 서버를 가져와 알림 서비스 같은 CRUD API를 구현하고, 시스템 엔지니어링·보안·모니터링 질의응답을 한다. 마케팅 조직 사례는 시스템 디자인 + VP 대화 + LeetCode형 코딩이었다.
- **JS 코딩**: 이벤트 이미터, 라이브러리 없이 직접 쓰는 스로틀, 가져온 항목을 본 ID의 `Set`으로 중복 제거, 중첩 배열 `flatten`, `Function.prototype.bind`.
- **UI 코딩**: 잡 보드. 1시간 폰 스크린에서 빠르게 커진다: 상태 설정 → 에러 처리 있는 API 호출 → 「더 보기」 버튼과 페이지네이션 → 무한 스크롤 + 스로틀 + 중복 제거(라이브러리 금지). [[intersection-observer|Intersection Observer]]를 래퍼 없이 맨손으로 쓰는 연습이 필요하다. React 폼과 레코드 배열 변환(제어 입력, 검증).
- **시스템 디자인**: Shutterstock(이미지 마켓).
- **알고리즘**: 커밋·롤백이 있는 키·값 저장소(가장 자주 보고된다), 중첩 댓글 순회.

### Robinhood

- **폰 스크린**: 이벤트 이미터를 난이도가 올라가는 **3단계**로 구현한다. 레벨별 채점 기준이 있어 시니어·스태프는 3단계를 모두 통과해야 한다. 2.5단계에서 떨어진 사례가 있으니 3단계 모두를 필수로 여긴다.

### Roblox

- **전형**: 프론트엔드 문제를 요청해도 뒤에 알고리즘 라운드가 나올 수 있다. 온사이트에서 프론트엔드와 무관한 LC 중간~어려움이 나온 사례가 있다.
- **JS·UI 코딩**: 중첩 배열 평탄화(후속: 재귀 없이), 메모리 카드 게임, 신호등, 커스텀 Promise 클래스, 로그 레코드 처리.
- **시스템 디자인**: 알림 시스템(스태프·프린시펄. 서버에서 고유 ID 생성, 백엔드의 커서 페이지네이션, 실시간 처리 같은 백엔드 질문까지), Instagram형 사진 공유 앱(프론트엔드 중심). 백엔드를 블랙박스로 두라고 선을 긋는 면접관도 있으니 **프론트엔드·백엔드 깊이를 먼저 확인**한다.

### Salesforce

- **전형**: SMTS 프론트엔드 루프가 직함과 달리 **DSA와 시스템 디자인만** 있고 프론트엔드 라운드가 없는 사례가 있다. React로 코딩할 수 있는지 미리 묻고 CoderPad에서 React 2문제를 낸 변형도, React를 확인하고도 LeetCode 2문제를 낸 사례도 있다. LMTS 파이프라인에는 HackerRank **코드 리뷰 평가**가 있는데 채점 기준(버그 찾기, 코드 품질, 모범 사례, 속도·테스트 케이스)을 리크루터에게 미리 묻는다. 최종 라운드는 시스템 디자인 또는 클래스 설계다.
- **JS 코딩**: 중첩 배열 평탄화, 「high five」 변형(학생별 점수 정렬 후 평균), 명령 순서로 로봇 이동 거리 계산, OA의 CPU 작업 묶기(2차원 DP, 중간~어려움).
- **퀴즈**: 이벤트 루프, 클로저, CSS 위치 지정.

### Shopify

- **페어 프로그래밍**: 「Roomba」 문제. 10 × 10 격자에서 Roomba 아이콘이 클릭에 따라 움직이고, 격자 끝에 닿으면 CSS `transform`으로 방향을 바꾼다. ref 사용과 반응형 디자인을 본다.

### Squarespace

- **전형**: 과제 전형에서 **라이브 디버그 테크 스크린**으로 바뀌었다. 라운드 내용을 투명하게 알려 주는 편이니 리크루터에게 확인한다.
- **테크 스크린**: Vanilla JS. 클래스 여러 개가 든 동작은 하지만 버그 있는 파일(리뷰 댓글과 별점 위젯이 있는 장바구니)을 주고, 면접관이 버그를 하나씩 알려 주면(「별점 위젯으로 리뷰를 두 번 남길 수 있다」) 고친다. 상태 조작, 배열 처리, DOM 갱신 버그다. 오픈북이라 검색해도 된다. 클래스 이름이 일부러 모호해 무엇이 무엇인지 추적하기 어렵다. 마지막에 **파일 전체 코드 리뷰**(전체를 어떻게 다르게 구현했을지, 데이터·상태·성능 개선)를 요구한다.
- **시스템 디자인(온사이트)**: 칸반 보드 구현·설계.

### Stripe

- **전형**: 프론트엔드와 풀스택 일정이 다르니 초대장의 라운드 이름대로 준비 시간을 나눈다. 풀스택은 1일 차 Programming Exercise·**Bug Squash**·**Integration** 각 1시간, 2일 차 Experience and Goals 45분·Full Stack Design 1시간으로 이어진 마라톤이었다.
- **코딩·통합**: 단계별 검증 구현과 마지막 접근성 후속(3단계를 30~35분에), 앞 요구를 유지하며 구조화된 데이터 병합·변환, Bug Squash에서 낯선 코드베이스 결함 고치기, 기존 앱에 로컬 데이터 불러오기와 API 연결.
- **시스템 디자인**: 도메인 데이터 모델링과 주어진 API 계약에 맞춘 핸들러 구현과 컴포넌트 인터페이스 논의, 공유 폼 상태와 재사용 UI 기본 요소가 있는 다단계 프론트엔드 흐름, 재시도·중복 제출·서버 확정 결과가 UI에 주는 영향.

### X(Twitter)

- **전형**: 1차는 Karat 기술 스크린. xAI의 제품 웹 엔지니어 채용은 리크루터 없이 팀 엔지니어가 직접 서류를 거르고 짧은 첫 통화를 한다.
- **JS 코딩**: 2차원 배열 변형(뱀 게임 같은 격자 문제 뒤에 같은 배열 모양의 더 어려운 변형. 끝내면 계속 새 변형을 주니 속도를 조절한다).
- **UI 코딩**: 타입어헤드, 틱택토에 기능 추가, **단계별 Twitter 피드**: 1단계 하드코딩 데이터로 글 표시(글 JSX는 제공) → 2단계 새 글 추가 → 3단계 API로 글 상세와 작성자를 가져와 작성자가 본인이면 이름 대신 「You」 → 4단계 좋아요 수 표시, 누르면 증가하고 피드가 좋아요 순으로 정렬.
- **시스템 디자인**: 프론트엔드에 한정되지 않은 진짜 시스템 디자인(Netflix, Twitter, Facebook 설계 연습), **Logical & Maintainable** 라운드(간단한 문제를 계속 고쳐 가며 유지 보수하기 좋은 코드를 쓰는지 본다. 이유 없는 추상화는 감점이다).
- **퀴즈**: `Array.prototype.map`과 `forEach`의 차이.

### Uber

- **전형**: SDE II 웹은 DSA(LeetCode형 + JS), 웹 기본기(HTML, CSS, JS, API, 인터넷), 프론트엔드 시스템 디자인, 컬처 핏, 매니저의 5라운드였다. 면접관 재량이 커서 리크루터 안내와 다른 문제가 나오기 쉽다(DSA라 들었는데 JS 유틸, JS라 들었는데 React). 프론트엔드 직무에서 DSA를 줄이고 프론트엔드 중심으로 옮겨 가는 중이라는 언급도 있다.
- **JS 코딩**: API 엔드포인트에 붙이는 속도 제한기(분당 N회, 롤링 윈도), 동시성 제어가 있는 비동기 작업 큐(후속: 실패 시 에러 콜백), 배치 크기에 차면 즉시 보내고 타임아웃이 먼저 오면 있는 만큼 보내며 타이머를 다시 시작하는 배치 전송 유틸, 재시도와 `push`·`flush`·`clear`가 있는 비동기 배처.
- **UI 코딩**: 버튼을 누를 때마다 3~5초에 걸쳐 차오르는 진행 바 추가(후속: 동시에 도는 바를 3개로 제한, 네 번째는 첫 번째가 끝나야 시작), 겹치는 원 앱, React 컴포넌트.
- **시스템 디자인**: Google Calendar(SDE-2), 제품 도메인에 묶이지 않은 열린 프론트엔드 설계.

## 여러 회사에서 겹치는 단골 문제

| 문제 | 나온 회사 | 개념 노트 |
| --- | --- | --- |
| 디바운스·스로틀 | Google, Meta(스티키 광고), Rippling, LinkedIn, Amazon | [[debounce-throttle\|Debounce와 Throttle]] |
| `Promise.all`·순차 실행·동시성 제한 | ByteDance, Lyft, Apple, Uber, eBay, Harvey | [[callback-and-promise\|Promise]], [[async-await\|async/await]] |
| 이벤트 이미터·리스너 저장소 | Meta, Rippling, Robinhood, Airbnb | [[js-design-patterns\|JS 디자인 패턴]] |
| `Function.prototype.bind`·배열 메서드 폴리필 | ByteDance, Rippling, Adobe, Amazon, Apple | [[functions\|함수와 this]], [[prototype-and-inheritance\|프로토타입]] |
| `getElementsByClassName` 류 DOM 탐색 | LinkedIn, Dropbox, Amazon, Meta | [[dom-manipulation\|DOM 조작]] |
| 무한 스크롤·「더 보기」 | Amazon, LinkedIn, Rippling, Google | [[intersection-observer\|Intersection Observer]], [[list-virtualization\|리스트 가상화]] |
| 자동완성·타입어헤드 | Airbnb, Lyft, Amazon, Meta, X, Google(이모지) | [[debounce-throttle\|Debounce와 Throttle]] |
| 이미지 캐러셀·슬라이더 | Airbnb, Amazon, DoorDash, Dropbox, Microsoft | [[infinite-carousel\|무한 캐러셀]] |
| 아코디언·탭·별점·틱택토 | Adobe, Amazon, LinkedIn, Airbnb, Google, Microsoft, X | [[accessible-widgets\|접근 가능한 위젯]] |
| 스프레드시트와 수식 | Discord, Harvey, Dropbox(설계) | - |
| 채팅 앱 설계 | Airbnb, Discord, DoorDash, LinkedIn, Microsoft | [[realtime-chat-app\|실시간 채팅 앱의 데이터 흐름]], [[chat-system-design\|채팅 시스템 설계]] |
| 데이터 테이블 | Meta, Amazon, Netflix(연습) | [[list-virtualization\|리스트 가상화]] |
| Jira·칸반 보드 | Atlassian, Oracle, Squarespace, Ethos | - |
| Google Calendar | Dropbox, Uber, Ramp(캘린더 CRUD) | - |

## 정리

- 회사별 형식은 후기에서 모은 관찰이고 팀·레벨·트랙마다 다르며 자주 바뀐다. 라운드 이름, 트랙, 언어, 환경, AI 허용 여부를 리크루터에게 먼저 확인한다.
- 빅테크(Google, Meta, Apple, Amazon, Microsoft)는 프론트엔드에도 DSA를 낸다. Meta는 기출을 지우지 않고 Google은 지운다.
- 실무형 회사는 기존 코드 디버깅, 단계별로 커지는 문제, 테스트 스위트 채점처럼 **실제 업무에 가까운 형식**을 쓴다. 기본형을 빨리 끝내는 유창함이 관건이다.
- 프론트엔드 직무라도 시스템 디자인에서 백엔드(REST vs GraphQL, BFF, DB, 페이지네이션 커서)를 묻는 회사가 늘었다.
- 단골 문제(디바운스·스로틀, Promise 유틸, 이벤트 이미터, 무한 스크롤, 자동완성, 채팅 앱)는 회사를 가리지 않고 겹친다. 이것부터 처음부터 직접 구현해 본다.

관련 노트: [[frontend-interview|프론트엔드 면접 유형과 준비법]], [[tech-interview-prep|기술 면접 준비]], [[us-hiring-process|미국 개발자 채용 프로세스와 ATS]], [[behavioral-interview-questions|인성 면접 준비]], [[coding-interview-rubric|코딩 인터뷰 평가 기준]]
