---
company: "키트웍스"
companyEn: "Kitworks"
role: "개발자 · 웹/앱 프론트엔드"
period: "2022.12 – 2023.05"
start: "2022-12"
end: "2023-05"
location: "서울 구로구 · 대면"
summary: "첫 회사. 에이전시에서 서울대 행복연구센터, 현대자동차 캐스퍼, 스터디모아 등 성격이 전혀 다른 고객사 서비스를 웹·앱·백엔드를 오가며 맡았습니다."
about: "키트웍스는 여러 고객사의 웹·모바일 서비스를 개발하고 운영하는 개발사입니다. SSAFY를 수료한 직후 입사해, 처음으로 실제 사용자가 있는 서비스를 다뤘습니다."
stack: ["React", "React Native", "TypeScript", "Vue 2", "Nuxt.js", "Nest.js", "Prisma", "PostgreSQL", "MUI", "CodePush"]
highlights:
  - { value: "3개", label: "고객사 서비스" }
  - { value: "웹·앱·서버", label: "맡은 영역" }
---

여섯 달 동안 React, Vue, React Native, Nest.js를 모두 다뤘습니다. 프로젝트마다 스택도 도메인도 달라서, **처음 보는 코드베이스에 빨리 적응하는 법**을 이때 배웠어요. 그 과정에서 정리한 내용은 지식 창고의 [[react-hook-form|react-hook-form과 MUI Select]], [[codepush|CodePush로 React Native 앱 업데이트하기]] 노트에 남아 있습니다.

## 서울대학교 행복연구센터 「오늘의 행복」

> 서울대 행복연구센터의 행복교육 서비스 — 웹, 모바일 앱, 백엔드 유지보수와 기능 고도화

- **서비스**: [happinessclass.snu.ac.kr](https://happinessclass.snu.ac.kr/Main.aspx)
- **스택**: React, React Native, react-hook-form, Vite, MUI, Nest.js, Prisma, PostgreSQL, MariaDB

**한 일**

- 사이트 전체를 컴포넌트 단위로 리팩터링했습니다. **react-hook-form** 기반 공통 폼 컴포넌트를 여러 개 만들어 화면마다 따로 놀던 폼 로직을 정리했어요.
  - MUI `Select` 같은 제어 컴포넌트를 `Controller`로 연결하면서, 빈 값을 "선택 안 함"으로 처리하는 문제와 수정 폼의 초기값 처리를 풀었습니다.
- 학교 정보 저장 기능, 관리자(admin) 화면, 404 페이지를 개발했습니다.
- TypeScript 타입을 정비해 런타임 전에 잡을 수 있는 오류를 늘렸습니다.
- 「오늘의 행복」 앱을 개발해 스토어에 배포하고, **CodePush**로 스토어 심사 없이 JS 번들을 업데이트하는 배포 흐름(Staging → Production 승격)을 구성했습니다.
- Nest.js 서버 유지보수를 맡으며 처음으로 백엔드 코드를 운영 환경에서 다뤘습니다.

## 현대자동차 캐스퍼 온라인

> 현대자동차 캐스퍼의 온라인 판매 사이트 — 고객 화면과 관리자 기능의 프론트엔드 전반

- **서비스**: [casper.hyundai.com](https://casper.hyundai.com/)
- **스택**: Vue 2, Nuxt.js

**한 일**

- 고객 화면: 쿠폰 지급 알림 팝업, 월별 이벤트 페이지, 구매 후기 등록 페이지, 차량 최근 계약 현황 페이지의 UI를 개발했습니다.
- 구매 통계에 따라 노출 옵션이 바뀌는 **다이나믹 옵션 로직**을 구현했습니다.
- 관리자 기능: 관리자 페이지 퀵메뉴 CRUD, 고객 후기 관리 페이지 퍼블리싱과 데이터 필터링을 만들었습니다.
- 반응형 UI를 설계하고 컴포넌트 구조를 정리했으며, 백엔드 API 유지보수와 통합도 함께 맡았습니다.

## 스터디모아

> 키오스크 없이 무인 스터디카페를 예약하고 관리하는 서비스

- **서비스**: [studymoa.me](https://studymoa.me)
- **스택**: React, React Native

**한 일**

- 웹과 앱의 UI/UX 버그를 고치고 접근성을 개선해 사용자 경험을 안정시켰습니다.

## 돌아보며

에이전시 일은 "남이 짠 코드를 빨리 읽고, 고객이 원하는 날짜에 안전하게 고치는 일"이었습니다. 이때 들인 습관, 그러니까 모르는 코드베이스에서 먼저 공통 컴포넌트와 데이터 흐름부터 파악하고 배운 것을 TIL로 남기는 습관이 이후 미국 회사에서 낯선 대규모 코드베이스에 들어갈 때 큰 힘이 됐습니다.
