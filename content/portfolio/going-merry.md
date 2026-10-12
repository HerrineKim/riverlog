---
company: "Going Merry"
companyEn: "by Earnest"
role: "Web Application Engineer"
period: "2023.06 – 2024.12"
start: "2023-06"
location: "미국 캘리포니아 오클랜드 · 한국에서 원격"
summary: "미국 고등학생과 대학생이 장학금을 찾고 지원하는 플랫폼에서 학생·학부모·카운슬러·장학금 제공자의 화면 전반을 만들었습니다. 리뉴얼, 신규 도구, A/B 테스트, 이메일까지 제품의 넓은 면을 다뤘어요."
about: "Going Merry는 미국 장학금 검색·지원 플랫폼으로, 나스닥 상장사 Navient의 자회사인 학자금 대출 기업 Earnest의 자회사입니다. 한국에서 원격으로, 미국 팀의 PM·디자이너·데이터 팀과 영어로 협업했습니다."
stack: ["React", "TypeScript", "MUI", "Formik", "SCSS", "Java", "PostgreSQL", "AWS Lambda", "Optimizely", "Segment", "Amplitude", "SendGrid", "Jest"]
highlights:
  - { value: "+30%", label: "제품 참여도 (전년 대비)" }
  - { value: "4종", label: "사용자 포털 (학생·학부모·카운슬러·제공자)" }
  - { value: "A/B/C/D", label: "이메일 템플릿 실험" }
cover: "portfolio/goingmerry/gm-home.png"
---

기획 단계의 요구사항 정의부터 설계, 구현, 코드 리뷰, 배포, 지표 모니터링까지 제품 개발 사이클 전체에 참여했습니다. 학생 대시보드와 신규 도구들을 고도화해 **제품 참여도를 전년보다 약 30% 끌어올리는 데 기여**했어요.

> 아래 스크린샷은 모두 데모 계정 화면입니다.

## 학생 대시보드와 신규 도구

> 장학금 탐색에서 끝나지 않고, 대학 준비 전 과정을 돕는 도구들을 대시보드에 붙였습니다.

- **Financial Aid Appeal Letter Generator**: 학자금 지원 이의신청서를 단계별 폼으로 작성하는 도구입니다. 왼쪽에서 4단계 폼을 채우면 오른쪽에서 편지가 실시간으로 완성되고, 입력한 값이 본문에 강조되어 보입니다. 학교 검색 자동완성, 진행 바, 저장 후 나가기를 지원합니다.
- **Smart Planner**: 학년(예: Class of 2026)에 맞춰 대학 준비 과업을 월 단위로 안내하고, 과업별 하위 작업 진행도를 보여 줍니다.
- **College Match / Explore Colleges**: 대학을 탐색하고 비교·저장합니다. 지원 상태(Researching, Accepted, Will attend) 관리, 희망 전공 기준 재정 데이터, TLDR 요약, CSV 내보내기를 제공합니다.
- **Engagement Scholarship**: 참여형 장학금 기능의 UI와 iframe 연동을 설계하고 구현했습니다.
  - Lottie 애니메이션이 React와 충돌하는 문제가 있었는데, 런칭 일정을 지키려고 **GIF로 대체**했습니다. 기술적으로 완벽한 해법보다 제품 가치와 출시 타이밍을 먼저 둔 결정이었어요.
- **GM Marketplace, Scholarship Tracking**: 대출·보험·카드 등 제휴 상품 마켓플레이스와 장학금 지원 현황(Saved / In Progress / Submitted / Results) 추적 화면을 고도화했습니다.

![[portfolio/goingmerry/gm-appeal-letter.png|Appeal Letter Generator — 폼 입력이 오른쪽 편지에 실시간으로 반영됩니다]]

![[portfolio/goingmerry/gm-smart-planner.png|Smart Planner — 학년별 월간 과업과 하위 작업 진행도]]

![[portfolio/goingmerry/gm-college-compare.png|Explore Colleges — 대학 비교와 지원 상태 관리]]

## 장학금 플랫폼 개발과 유지보수

> 장학금 제공자, 학교 카운슬러, 학생, 학부모 등 여러 사용자 유형의 온보딩·계정·지원 흐름

- 사용자 유형별 **온보딩, 계정, 장학금 지원 플로우** 전반의 신규 기능 개발, 리팩터링, 유지보수를 맡았습니다. Parent / Student / Counselor / Provider 포털을 모두 다뤘어요.
- **웹 접근성**: 전사 웹 접근성 교육을 바탕으로 WCAG, ARIA, 키보드 내비게이션, 명도 대비를 고려해 UI를 구현하고 핵심 화면의 접근성을 꾸준히 개선했습니다.
- **테스트**: Jest로 AAA(Arrange–Act–Assert) 패턴과 사용자 행동 시나리오 중심의 테스트를 작성해 릴리스 안정성을 높였습니다.
- **보안**: AWS Lambda로 CSP(Content-Security-Policy) 허용 목록을 관리했습니다.
- **데이터**: Segment로 주요 사용자 이벤트를 설계·구현하고 Amplitude 대시보드와 연동해 퍼널 분석, 이탈 지점 파악, 실험 결과 모니터링을 지원했습니다.

![[portfolio/goingmerry/gm-browse-scholarships.png|Browse Scholarships — 매치율, 마감일, 태그가 붙은 맞춤 장학금 카드]]

## UI 리뉴얼

> 서비스 전반의 UI를 새 디자인으로 바꾼 장기 프로젝트

MUI를 유지한 채 새 디자인 시스템을 입히다 보니 웹과 모바일 양쪽에서 스타일 충돌이 많이 생겼습니다. 대부분은 MUI 공식 문서와 디버깅으로 풀었고, **3일이 지나도 풀리지 않는 문제는 공통 컴포넌트를 처음부터 새로 작성**하는 기준을 세워 일정이 늘어지지 않게 했습니다. SVG 이미지와 woff2 폰트 용량도 최적화했습니다.

## A/B 테스트

> Optimizely SDK로 문구, 메뉴 순서, 툴팁 등 여러 실험을 구현

- Engagement Tooltip 등 다양한 A/B 테스트를 **Optimizely SDK**로 구현하고 Segment·Amplitude와 연동했습니다.
- 데이터 팀의 요청이 모호할 때는 개발자 관점에서 구현 가능한 시나리오를 먼저 제시해 명확한 답을 받았습니다. **수동적으로 기다리기보다 먼저 묻는 것이 낭비되는 시간을 줄인다**는 걸 배웠어요.
- PM이 서드파티 스펙상 불가능한 요청을 했을 때는 서드파티에 직접 문의해 공식 답변을 받아 개발팀 의견의 설득력을 높였습니다.

## 이메일 템플릿

> Gmail, Outlook, 모바일 어디서 열어도 깨지지 않는 HTML 이메일과 실험 가능한 발송 흐름

- 장학금 다이제스트(Scholarship Digest), 학부모용 뉴스레터 등 **HTML 이메일 템플릿**을 새로 설계하고 구현했습니다.
- 이메일 클라이언트마다 CSS 렌더링이 달라서, 실제 발송 환경에서 테스트하며 클라이언트별 스타일 규칙을 적용했습니다.
- 템플릿을 **SendGrid**에 등록하고, 발송 대상 CSV 추출·업로드부터 **A/B/C/D 템플릿 실험**까지 엔드투엔드 발송 흐름을 만들었습니다. 덕분에 운영팀이 장학금 추천 이메일을 데이터 기반으로 반복 실험할 수 있게 됐습니다.

## WordPress 랜딩과 홈페이지

- WordPress로 관리되는 About 페이지 등 주요 페이지를 개편했고, 'About Us' 리뉴얼을 전담했습니다.
- 팀 페이지와 홈페이지 블록에 대한 **운영 매뉴얼과 How-to**를 작성해, 운영팀이 개발자 없이 콘텐츠를 관리할 수 있게 했습니다.
- Instapage 랜딩 페이지와 Google Analytics 연동도 함께 다뤘습니다.
