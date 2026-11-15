---
title: "개발 도구 지형도와 세상을 바꾼 오픈소스"
concept: "Dev Tool Landscape"
summary: "개발 도구를 개발 환경·다이어그램·AI·호스팅·코드 품질·보안·노트·디자인 범주로 나눈 지도와, 범주별로 무엇을 갖추면 되는지 정리한다. 웹·데이터·개발 도구·머신러닝·컨테이너 분야의 판도를 바꾼 오픈소스, 큰 기업이 시작한 오픈소스와 기업이 코드를 공개하는 이유, AI 앱의 쓰임새 범주도 함께 다룬다."
tags: ["tools", "productivity", "open-source", "ai"]
source: other
date: "2026-10-21"
sources: ["https://bytebytego.com/guides/life-is-short-use-dev-tools", "https://bytebytego.com/guides/15-open-source-projects-that-changed-the-world", "https://bytebytego.com/guides/20-popular-open-source-projects-started-or-supported-by-big-companies", "https://bytebytego.com/guides/30-useful-ai-apps-that-can-help-you-in-2025"]
---

> ByteByteGo의 System Design 101 가이드 「[Life is Short, Use Dev Tools](https://bytebytego.com/guides/life-is-short-use-dev-tools)」, 「[15 Open-Source Projects That Changed the World](https://bytebytego.com/guides/15-open-source-projects-that-changed-the-world)」, 「[20 Popular Open Source Projects Started by Big Companies](https://bytebytego.com/guides/20-popular-open-source-projects-started-or-supported-by-big-companies)」, 「[30 Useful AI Apps That Can Help You](https://bytebytego.com/guides/30-useful-ai-apps-that-can-help-you-in-2025)」를 바탕으로 재구성한 노트다.

## 범주로 보는 개발 도구

도구 이름은 몇 년이면 바뀌지만 필요한 범주는 거의 그대로다. 새 환경을 꾸릴 때는 범주마다 하나씩 갖췄는지부터 본다.

| 범주 | 해결하는 문제 | 예 |
| --- | --- | --- |
| 개발 환경 | 코드를 쓰고 실행·디버깅한다 | VS Code, IntelliJ IDEA·PyCharm, Vim·Neovim, 주피터 노트북 |
| 다이어그램 | 생각과 구조를 그림으로 공유한다 | Excalidraw, draw.io, Miro, Mermaid, PlantUML([[diagram-as-code\|다이어그램 코드]]) |
| AI 도구 | 코드 작성·검색·요약을 돕는다 | 코딩 어시스턴트·에이전트, 범용 대화형 AI, 로컬 모델 실행기(Ollama) |
| 호스팅·배포 | 앱을 인터넷에 올린다 | AWS 같은 클라우드, Cloudflare, Vercel·Fly.io 같은 배포 플랫폼, GitHub |
| 코드 품질 | 버그와 스타일 문제를 기계가 잡는다 | 테스트 러너(Jest·Vitest), 브라우저 테스트(Playwright·Selenium), 린터(ESLint), 정적 분석(SonarQube) |
| 보안 | 비밀 값과 취약점을 관리한다 | 비밀번호 관리자(1Password 등), 의존성 취약점 스캔(Snyk), 포트 스캐너(Nmap), OWASP 가이드 |
| 노트 | 배운 것을 쌓고 다시 찾는다 | Notion, Obsidian, Logseq, 마크다운 파일 |
| 디자인 | 화면과 그래픽을 만든다 | Figma, Sketch, Canva, Adobe 도구 |

좋은 도구는 시간을 아껴 주지만, 도구를 고르는 데 쓰는 시간도 비용이다. 범주마다 팀이 이미 쓰는 것을 먼저 쓰고, 불편이 분명해질 때 바꾼다.

### AI 앱의 쓰임새

AI 앱은 매달 새로 나오므로 이름보다 쓰임새로 나눠 기억한다.

| 쓰임새 | 하는 일 |
| --- | --- |
| 범용 대화·검색 | 질문 답변, 자료 조사, 출처가 달린 검색 |
| 코드 작성 | 편집기 안 자동 완성, 코드베이스를 읽고 고치는 에이전트, 브라우저에서 앱을 만드는 도구 |
| 업무 생산성 | 문서·메일 요약, 슬라이드 생성, 음성 받아쓰기, 회의록 작성 |
| 콘텐츠 제작 | 영상 번역·더빙, 자막·편집, 긴 영상을 짧은 클립으로 재가공 |
| 창작 | 음성 합성, 이미지·음악 생성, 사진 보정 |
| 학습 | 자료를 올려 질문하는 학습 노트, 뉴스 요약, 기록·상담 보조 |

코딩에 AI를 쓸 때의 원칙은 [[ai-coding-guardrails|AI 코딩 실무 가드레일]]에 있다.

## 판도를 바꾼 오픈소스

산업 전체에 영향을 주고, 개발자의 일상 작업 방식을 바꾼 프로젝트들이다.

| 분야 | 프로젝트 | 바꾼 것 |
| --- | --- | --- |
| 웹 개발 | Node.js | 자바스크립트를 서버로 가져왔다 |
| | React | 컴포넌트 기반 UI를 표준으로 만들고 수많은 프레임워크의 토대가 됐다 |
| | Apache HTTP Server | 웹 초기부터 쓰인 범용 웹 서버. 이후 웹 서버들의 본보기가 됐다 |
| 데이터 | PostgreSQL | 비싼 상용 DB를 대신할 수 있는 고품질 관계형 DB |
| | Redis | 캐시·메시지 브로커·저장소로 두루 쓰는 인메모리 저장소 |
| | Elasticsearch | 대량 데이터를 검색·분석·시각화하는 분산 검색 엔진 |
| 개발 도구 | Git | 전 세계 개발자가 분산 협업하는 버전 관리 |
| | VS Code | 가장 널리 쓰이는 코드 편집기 중 하나 |
| | Jupyter Notebook | 코드·수식·그래프·설명을 한 문서로 공유한다 |
| 머신러닝·빅데이터 | TensorFlow | 머신러닝을 대중화한 프레임워크 |
| | Apache Spark | 대규모 데이터 처리·분석의 표준 |
| | Apache Kafka | 실시간 데이터 파이프라인의 표준 플랫폼 |
| 인프라 | Docker | 앱을 어디서나 같은 방식으로 포장·실행하게 했다 |
| | Kubernetes | 클라우드 네이티브의 중심. 많은 컨테이너를 관리한다 |
| | Linux | 누구나 쓸 수 있는 운영체제로 소프트웨어 개발을 민주화했다 |

일부 프로젝트는 이후 라이선스를 바꿨다(Redis, Elasticsearch 등). 오픈소스라도 쓰기 전에 **현재 라이선스**를 확인한다.

## 큰 기업이 시작한 오픈소스

| 기업 | 프로젝트 |
| --- | --- |
| Google | Kubernetes, TensorFlow, Go, Angular |
| Meta | React, PyTorch, GraphQL, Cassandra |
| Microsoft | VS Code, TypeScript, Playwright |
| Netflix | Chaos Monkey(카오스 엔지니어링), Hystrix(서킷 브레이커, 지금은 유지보수 모드), Zuul(API 게이트웨이) |
| LinkedIn | Kafka, Samza, Pinot |
| Red Hat | Ansible, OpenShift, Ceph |

기업이 내부 도구를 공개하는 이유는 대체로 같다.

- **표준 선점**: 자사 방식이 업계 표준이 되면 생태계 전체가 그 위에서 만들어진다.
- **유지 비용 분산**: 외부 기여자가 버그를 찾고 기능을 더한다.
- **채용과 평판**: 개발자가 이미 아는 기술을 쓰는 회사가 된다.
- **중립 재단 기증**: Kubernetes처럼 CNCF·리눅스 재단에 넘기면 경쟁사도 안심하고 참여해 생태계가 커진다.

## 정리

- 도구는 이름보다 범주로 기억하고, 범주마다 팀이 쓰는 것부터 갖춘다.
- AI 앱도 쓰임새로 나눠 보면 새 도구가 나와도 어디에 놓일지 판단할 수 있다.
- 오늘의 표준 인프라 상당수는 오픈소스이고, 그중 많은 수가 기업 내부 도구에서 출발했다.
- 오픈소스를 들일 때는 현재 라이선스와 유지보수 상태를 확인한다.

관련 노트: [[diagram-as-code|다이어그램 코드: 코드로 그리는 아키텍처 그림]], [[vscode|VS Code 설정과 활용]], [[eslint-prettier|ESLint와 Prettier 설정]], [[missing-semester|The Missing Semester]], [[ai-coding-guardrails|AI 코딩 실무 가드레일]]
