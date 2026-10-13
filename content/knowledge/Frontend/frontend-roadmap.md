---
title: "프론트엔드 학습 로드맵"
concept: "Roadmap"
summary: "HTML부터 프레임워크, 서버·데이터베이스까지 이어지는 프론트엔드 학습 순서."
tags: ["frontend", "roadmap", "career"]
source: mixed
date: "2026-10-13"
sources: ["https://miryang.dev/blog/how-studied-frontend"]
---

프론트엔드는 배울 것이 많아 보이지만, 앞 단계가 다음 단계의 토대가 되도록 순서를 잡으면 훨씬 수월하다. 아래는 처음 공부할 때 세워 둔 순서에 이 지식 창고의 노트를 연결한 것이다.

## 학습 순서

```text
HTML → CSS → CSS 프레임워크 → JavaScript → DOM → Git/GitHub
     → React / Angular / Vue → Node.js → API → Database → (Web3.js → Solidity)
```

| 단계 | 핵심 질문 | 관련 노트 |
| --- | --- | --- |
| HTML | 문서의 구조와 의미를 어떻게 표현하는가 | [HTML](/knowledge/dictionary/frontend/web/html) |
| CSS | 요소를 어떻게 배치하고 꾸미는가 | [CSS 기초](/knowledge/dictionary/frontend/css/css-basics), [Flexbox](/knowledge/dictionary/frontend/css/flexbox) |
| CSS 프레임워크 | 반복되는 스타일을 어떻게 빠르게 적용하는가 | Bootstrap, MUI 등 |
| JavaScript | 화면을 어떻게 동적으로 바꾸는가 | [변수와 데이터 타입](/knowledge/dictionary/frontend/javascript/variables-and-types) |
| DOM | 브라우저는 문서를 어떤 구조로 들고 있는가 | [DOM](/knowledge/dictionary/frontend/web/dom), [DOM 조작](/knowledge/dictionary/frontend/javascript/dom-manipulation) |
| Git/GitHub | 코드를 어떻게 관리·협업하는가 | Tools 분야 |
| React 등 프레임워크 | UI를 컴포넌트 단위로 어떻게 조립하는가 | [React](/knowledge/dictionary/frontend/react) |
| Node.js · API · DB | 프론트가 데이터를 어디서 어떻게 받아오는가 | [AJAX](/knowledge/dictionary/frontend/javascript/ajax), Backend 분야 |

## 공부하는 방법

> MiryangJung의 「내가 프론트엔드를 학습한 방법」(2022.05)을 요약·재구성했습니다. 보안·백엔드 개발을 하다가 약 4~5개월 준비해 프론트엔드로 옮긴 경험담입니다.

순서보다 중요한 것은 **배운 것을 바로 코드로 옮기는 습관**이다. 글쓴이는 HTML → CSS → JavaScript → React → TypeScript → Redux → Next.js 순서로 배우며 단계마다 개인 프로젝트를 하나씩 만들었다.

| 방법 | 구체적으로 |
| --- | --- |
| 배우고 바로 만들기 | 강의 하나를 끝내면 한 페이지짜리라도 직접 만든다. 긴 강의를 계속 듣는 것보다 낫다 |
| 잘 만든 코드를 통째로 읽기 | 완성도 높은 오픈 소스(예: leerob.io의 Next.js 블로그)를 파일 하나하나 열어 읽는다. 오픈 소스 기여 프로그램에서는 저장소와 PR을 한 줄씩 읽었다 |
| 에러로 배우기 | 기존 프로젝트에 TypeScript를 붙이고 쏟아지는 타입 에러를 직접 고친다 |
| 묻고 기록하기 | 검색, Stack Overflow, 커뮤니티에 묻고, 답을 팀 문서에 정리해 공유한다 |
| README 쓰기 | 프로젝트마다 무엇을 왜 했는지, 어떤 문제를 어떻게 풀었는지 README에 남긴다 |

글쓴이가 쓴 자료(2022년 기준):

| 단계 | 자료 |
| --- | --- |
| JavaScript | 코딩앙마 JavaScript 중급 강좌, 모던 JavaScript 튜토리얼(ko.javascript.info), Just JavaScript, 『모던 자바스크립트 Deep Dive』, 『코어 자바스크립트』 |
| React | 코딩앙마 React 강좌, React 공식 문서(react.dev) |
| TypeScript·Redux·Next.js | 유데미 TypeScript·React 강의, Frontend Masters Redux Fundamentals, Next.js 공식 문서 |

2023년 4월에는 프론트엔드 12주 스터디 커리큘럼 링크를 덧붙였다. 기초를 다시 보되 기초에만 머물지 말고 실제 코드로 연습하라는 것이 글의 결론이다.

## 핵심 정리

- 라이브러리보다 **웹 표준(HTML·CSS·JS·DOM)** 이해가 먼저다. React도 결국 DOM을 효율적으로 바꾸는 도구다.
- 단계마다 작은 프로젝트를 만들고, 잘 만든 코드를 통째로 읽고, 막힌 것과 푼 것을 README에 남긴다.
- 낯선 용어는 [[web-glossary|프론트엔드 웹 개발 용어집]]에서 자리를 잡는다.
- 프레임워크 이후 단계(서버·DB)는 "프론트엔드가 소비하는 데이터가 어디서 오는지"를 이해하는 수준으로 시작해도 충분하다.
