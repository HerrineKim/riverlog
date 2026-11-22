---
title: "회사별 프론트엔드 면접 형식과 단골 문제"
concept: "FE Interview by Company"
summary: "Google, Meta, Amazon, Apple부터 Stripe, Discord, OpenAI까지 36개 회사의 프론트엔드 면접이 무엇을 강조하는지 정리한다. 회사를 가로지르는 패턴(DSA 비중, Vanilla JS 강제, 기존 코드 디버깅, 단계별 확장 문제, 풀스택식 평가, AI 도구 허용), 리크루터에게 확인할 것, 여러 회사에서 겹치는 단골 문제와 그 개념 노트를 묶었다."
tags: ["career", "interview", "job-search", "frontend"]
source: other
date: "2026-11-12"
sources: ["https://www.frontendinterviewhandbook.com/company-interview-questions", "https://www.frontendinterviewhandbook.com/companies/adobe-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/airbnb-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/amazon-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/apple-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/atlassian-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/bytedance-tiktok-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/canva-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/coinbase-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/discord-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/doordash-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/dropbox-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/ebay-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/ethos-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/google-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/harvey-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/linkedin-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/lyft-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/meta-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/microsoft-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/mozilla-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/netflix-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/openai-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/oracle-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/palantir-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/pinterest-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/ramp-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/reddit-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/rippling-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/robinhood-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/roblox-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/salesforce-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/shopify-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/squarespace-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/stripe-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/twitter-front-end-interview-questions", "https://www.frontendinterviewhandbook.com/companies/uber-front-end-interview-questions"]
---

> Yangshun Tay·GreatFrontEnd의 「[Front End Interview Handbook](https://www.frontendinterviewhandbook.com/company-interview-questions)」 회사별 면접 질문 페이지(2026.10 갱신)를 바탕으로 재구성한 노트다. 회사 페이지는 Glassdoor와 GreatFrontEnd 커뮤니티에 올라온 2023~2026년 면접 후기를 모은 것이다.

## 이 노트를 읽는 법

회사별 형식은 **후기에서 모은 관찰**이다. 같은 회사라도 팀, 레벨, 트랙(프론트엔드 vs 풀스택)에 따라 라운드가 다르고, 몇 달 단위로 바뀐다. 리크루터가 말한 형식과 실제 문제가 다른 경우도 흔하다. 그래서 이 노트는 「이 회사는 이걸 낸다」는 정답지가 아니라 **무엇을 확인해야 하는지 알려 주는 지도**로 쓴다.

리크루터에게 확인할 것은 여섯 가지다.

| 확인할 것 | 이유 |
| --- | --- |
| 라운드 이름과 순서 | 「Bug Squash」, 「Decomp」, 「Tech execution」처럼 회사 고유 라운드가 많다. 이름을 알면 형식을 찾아볼 수 있다 |
| 트랙(프론트엔드 / 풀스택) | Rippling·DoorDash·Ethos·eBay처럼 프론트엔드 직무도 백엔드 지식을 깊게 보는 곳이 있다 |
| 언어·프레임워크 | Vanilla JS 강제인지, React인지, TypeScript 환경인지 |
| 코딩 환경 | 공유 에디터, 실행 불가 에디터, 자기 IDE, HackerRank·CodeSignal·CoderPad·Karat |
| AI 도구 허용 여부 | 같은 회사 안에서도 라운드마다 다르다 |
| 시스템 디자인의 범위 | 백엔드를 블랙박스로 두라는 면접관도, ID 생성·커서 페이지네이션까지 묻는 면접관도 있다. 프론트엔드·백엔드 깊이를 시작할 때 확인한다 |

전형 단계 전반(리크루터 통화 → 폰 스크린 → 온사이트 → 팀 매칭)은 [[us-hiring-process|미국 개발자 채용 프로세스와 ATS]], 진행 형식별 대비는 [[tech-interview-prep#진행 형식별 대비|기술 면접 준비]], 유형별 준비법은 [[frontend-interview|프론트엔드 면접 유형과 준비법]]에 있다.

## 회사를 가로지르는 패턴

| 패턴 | 해당 회사 | 대비 |
| --- | --- | --- |
| **프론트엔드에도 DSA 라운드** | Google, Meta, Apple, Amazon, Microsoft, Pinterest, Palantir, Salesforce, OpenAI, Roblox, Uber, Oracle, ByteDance | 프론트엔드 직무라도 LeetCode 중간 난이도 이상을 준비한다. 「프론트엔드 문제만 원한다」고 요청해도 뒤 라운드에 알고리즘이 나올 수 있다 |
| **실무형 UI·JS 중심** | Dropbox, Mozilla, DoorDash, Coinbase, Squarespace, Shopify, Ramp, Reddit, Lyft, Stripe | 컴포넌트·작은 앱을 처음부터 빠르게 만드는 연습 |
| **Vanilla JS 강제** | Amazon, Atlassian(스크린), Dropbox, Apple(일부), LinkedIn, Reddit, Squarespace, eBay | 프레임워크 없이 DOM을 만들고 붙이고 지우는 연습, `fetch`를 라이브러리 없이 쓰는 연습 |
| **기존 코드 디버깅·확장·리뷰** | Squarespace, Stripe(Bug Squash), Palantir, Oracle, Ethos, DoorDash, eBay, Apple(Bug Hunt), Coinbase, Harvey, Salesforce, Ramp | 낯선 코드를 읽고 상태 흐름을 추적하는 연습. 마지막에 전체 코드 리뷰를 요구하는 곳도 있다 |
| **단계별로 커지는 문제** | X(피드), Robinhood(이벤트 이미터), Rippling(잡 보드), Airbnb, Mozilla, Stripe, Uber, Discord | 동작하는 기본형을 먼저 끝내고 확장한다. 레벨이 높을수록 더 많은 단계를 통과해야 한다 |
| **풀스택식 평가** | Rippling, DoorDash, Ethos, eBay, OpenAI, Canva, Harvey, Stripe, Roblox(일부), Apple(풀스택 팀) | REST vs GraphQL, BFF, DB 선택, 페이지네이션 커서, ID 생성 같은 백엔드 질문에 답할 준비 |
| **다이어그램 없이 텍스트로 설계** | Palantir(Decomp) | 일반 텍스트 에디터에서 문제를 쪼개고 개념을 정리해 설명하는 연습. 기술 깊이보다 면접관의 틀과 어휘에 맞춰 생각을 풀어 가는지를 본다 |
| **테스트로 채점** | Coinbase | 면접관 판단이 아니라 숨겨진 테스트 스위트 통과 여부로 채점한다 |
| **자기 IDE에서 직접 시작** | Discord, Ramp(연습 권장) | 프로젝트 스캐폴딩을 빠르게 하는 연습 |
| **실행할 수 없는 에디터** | Amazon(사내 일반 에디터), Google(문서), Adobe(손으로 테스트) | 자동완성·문법 강조 없이 쓰고 손으로 예제를 따라가 검증하는 연습 |
| **AI 도구** | Canva(AI 보조 코딩 라운드), LinkedIn(스태프 루프의 AI 보조 세션), Discord(라운드마다 다름), eBay(면접 중 금지), ByteDance(AI 활용에 관한 질문) | 허용 여부를 라운드마다 확인하고, AI로 코딩하는 방식을 설명할 준비 |

## 회사별 한눈에

2026년 기준 후기에서 되풀이해 보고된 강조점만 적는다. 라운드 수·순서·시간·평가 도구는 팀과 시기에 따라 바뀌므로 싣지 않는다. 초대장과 리크루터 안내가 기준이다.

| 회사 | 강조점 |
| --- | --- |
| Adobe | 기술 라운드마다 행동 질문이 섞인다. 프론트엔드가 아닌 일반 설계(캐시, 객체 지향 설계)가 나올 수 있다 |
| Airbnb | 기능을 계속 덧붙이는 UI 문제. 결정마다 이유를 묻는다. 타이머와 Effect 정리 |
| Amazon | Vanilla JS, 실행할 수 없는 에디터, 리더십 원칙 행동 질문, Bar Raiser, DSA 라운드 |
| Apple | 팀마다 크게 다르다. JS 코딩, 기존 코드베이스에서 작업하는 Bug Hunt, 웹 성능, 제품 사고(Product Thinking) |
| Atlassian | 모든 레벨에서 Vanilla JS와 프론트엔드 시스템 디자인. 말로 답하는 JS 빠른 퀴즈 |
| ByteDance·TikTok | 이력서의 모든 기술을 깊게 묻는다. 지난 프로젝트를 흐름도로 그리며 토론하는 설계. 퀴즈와 알고리즘 |
| Canva | AI 보조 코딩 라운드, 언어 숙련도 라운드. 설계는 백엔드 비중이 크다 |
| Coinbase | 테스트 스위트 통과로 채점. TypeScript 환경, 검색 금지 |
| Discord | 자기 IDE에서 프로젝트를 직접 만든다(채팅 앱, 스프레드시트) |
| DoorDash | 기존 코드에 기능 추가. 시스템 디자인에서 백엔드까지 채우게 한다 |
| Dropbox | 디자인 명세를 주고 구현하게 하는 실무형. Vanilla JS 디버깅 |
| eBay | 지저분한 JS·Node.js 코드 디버깅·리팩터링. 면접 중 AI 금지 |
| Ethos | 풀스택 평가. 기존 React 앱 디버깅과 백엔드 코딩 |
| Google | DSA 비중이 크다. 문제 은행이 크고 유출 문제를 지운다. 행동 라운드(Googlyness) |
| Harvey | 제품 코드 리뷰 라운드, 시스템 디자인 여러 번, 지난 프로젝트 심층 |
| LinkedIn | 프레임워크 경험보다 JS 기본기. 퀴즈와 Vanilla JS 코딩. 풀스택이면 알고리즘 |
| Lyft | UI 코딩과 JS 유틸 함수. 프론트엔드 시스템 디자인의 난도가 높다 |
| Meta | 한 라운드에 코딩 2문제를 빠르게 푼다. 유출 문제를 지우지 않는다. 프론트엔드 파이프라인은 문제도 프론트엔드 중심이다 |
| Microsoft | 팀과 매니저에 따라 크게 다르다. 알고리즘 비중, 자사 제품(Teams·Outlook) 관련 설계 |
| Mozilla | 알고리즘보다 실무형 HTML·CSS·JS. 기능을 단계적으로 덧붙이는 코딩 |
| Netflix | 막힘 없이 빠르게 코딩하는 유창함. 컬처 메모에 바탕한 매니저 면접 |
| OpenAI | 프론트엔드 면접에도 DSA와 풀스택 설계가 들어갈 수 있다. 스트리밍 응답 UI |
| Oracle | 라운드마다 행동 질문이 섞인다. DSA와 백엔드 설계까지 본다 |
| Palantir | 화이트보드 없이 텍스트로 문제를 쪼개는 Decomp 라운드, React 앱 디버그·확장, 미션 공감 |
| Pinterest | 프론트엔드 트랙과 풀스택 트랙의 루프가 다르다. 알고리즘 라운드가 있다 |
| Ramp | 시간제한이 있는 작은 앱 구현(게임, CRUD). 지난 프로젝트의 기술 선택 이유 |
| Reddit | 소통과 협업. 웹 개념을 주니어에게 설명하듯 답하게 한다. Vanilla JS와 React 모두 |
| Rippling | 프론트엔드 직무도 풀스택으로 평가한다. 라이브러리 없이 직접 구현 |
| Robinhood | 단계가 올라가는 구현 문제. 레벨이 높을수록 모든 단계를 통과해야 한다 |
| Roblox | 프론트엔드 문제를 요청해도 알고리즘 라운드가 나올 수 있다. 설계의 백엔드 깊이가 면접관마다 다르다 |
| Salesforce | 프론트엔드 직함이어도 DSA와 시스템 디자인만 볼 수 있다. 코드 리뷰 평가 |
| Shopify | 페어 프로그래밍으로 작은 UI를 함께 만든다 |
| Squarespace | 버그 있는 Vanilla JS 코드를 고치는 라이브 디버그와 전체 코드 리뷰. 오픈북 |
| Stripe | 프론트엔드와 풀스택 일정이 다르다. 낯선 코드베이스의 결함을 고치는 Bug Squash, 기존 앱에 API를 붙이는 Integration, 접근성 후속 질문 |
| X(Twitter) | 단계별로 커지는 UI 문제. 유지 보수하기 좋은 코드를 쓰는지 보는 라운드(이유 없는 추상화는 감점) |
| Uber | 비동기 유틸(동시성 큐, 배처, 속도 제한기). 면접관 재량이 커서 안내와 다른 유형이 나오기 쉽다 |

회사별 기출 문제 목록은 싣지 않는다. 문제 은행은 계속 바뀌고, 문제에 쓰이는 개념은 아래 표의 개념 노트에 있다. 기출은 출처의 회사별 페이지에서 본다.

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
| 스프레드시트와 수식 | Discord, Harvey, Dropbox(설계) | - (셀 입력보다 다른 셀을 참조하는 수식 해석이 핵심이다) |
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
