---
title: "OSSU 입문 과정과 이용 안내"
concept: "OSSU Intro CS"
summary: "OSSU 커리큘럼의 단계 구성과 강좌 선정 기준, 선수 지식, Intro CS 강좌, 수강 순서와 소요 기간, 무료 접근의 범위와 Coursera·edX 청강 조건, 빠진 주제와 선수 과목에 대한 원칙, 도움 요청과 기여 방법을 정리한다."
tags: ["computer-science", "curriculum", "learning", "programming", "community"]
source: other
date: "2026-11-15"
sources: ["https://github.com/ossu/computer-science", "https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/README.md", "https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/FAQ.md", "https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/HELP.md", "https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/CURRICULAR_GUIDELINES.md"]
---

> OSSU의 공개 컴퓨터과학 커리큘럼 README와 FAQ, HELP, CURRICULAR_GUIDELINES(기준 커밋 `8f8272b1d378`)를 재구성한 노트다.

## OSSU가 다루는 학습 범위

컴퓨터과학은 특정 언어의 문법을 익히는 것을 넘어 프로그램의 의미, 계산의 한계, 시스템 내부, 자료 표현, 보안을 함께 이해하는 학문이다. **OSSU는 학부 CS 전공의 졸업 요건에서 교양(비전공) 과목을 뺀 부분을 온라인 자료로 재구성한 학습 경로**다. 학위를 주지 않는다.

| 단계 | 목적 | 선택 기준 |
| --- | --- | --- |
| Intro CS | 프로그래밍과 계산 개념을 체험하고 CS가 맞는지 확인한다 | 수학 기초를 점검하고 시작한다 |
| [[ossu-core-cs\|Core CS]] | 전공 첫 3년에 해당하는 프로그래밍·수학·도구·시스템·이론·보안·응용·윤리 | 원칙적으로 전부 필수 |
| [[ossu-advanced-cs\|Advanced CS]] | 전공 마지막 해에 해당하는 심화 과목 | 목표 분야의 영역을 골라 듣는다 |
| [[ossu-advanced-cs#최종 프로젝트\|Final project]] | 배운 개념을 실제 문제에 통합해 검증하고 보여 준다 | 직접 설계·구현·검증 |

정규 커리큘럼에 드는 강좌는 네 가지 기준으로 고른다. 맞는 강좌가 없는 주제는 책으로 보충하고, 품질은 좋지만 기준에 맞지 않는 강좌와 책은 [[ossu-extras|보충 강좌와 읽을거리]]로 간다.

- 수강 신청이 열려 있다.
- 정기적으로 개설된다(자기 진도형이 이상적이고, 아니면 한 해에 여러 번).
- 교재와 교수법의 품질이 높다.
- ACM·IEEE의 학부 CS 교육과정 지침 CS2013에 대응한다. 후속 보고서 CS2023이 2024년에 나왔지만 강좌 평가는 CS2013을 기준으로 한다.

## 선수 지식

- Core CS는 고교 수학(대수, 기하, 프리캘큘러스)을 마쳤다고 가정한다. 부족하면 OSSU의 [Pre-College Math](https://ossu.dev/precollege-math) 과정으로 보충한다.
- 커리큘럼 전체는 영어에 익숙하고, 물리와 프리캘큘러스가 포함된 표준 고교 과정을 마쳤다고 가정한다. 이 가정이 없으면 빈틈을 메우는 강좌가 끝없이 늘어나기 때문에, 그 밖의 배경 지식은 각자 점검하고 보충한다.
- Advanced CS는 Core CS 전체를 전제로 하고, 그중 심화 시스템은 기초 물리도 필요하다.

## Intro CS 강좌

Intro CS는 계산, 명령형 프로그래밍, 기초 자료구조와 알고리즘을 다루는 한 강좌다. 기간과 주당 학습량은 OSSU가 적어 둔 계획치다.

| 강좌 | 기간 | 주당 학습량 | 선수 과목 |
| --- | --- | --- | --- |
| [Introduction to Computer Science and Programming using Python](https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/coursepages/intro-cs/README.md) | 14 weeks | 6-10 hours/week | [high school algebra](https://ossu.dev/precollege-math) |

터미널, 셸 스크립트, 편집기, Git 같은 개발 도구는 Core CS의 [[ossu-core-cs#CS Tools: 도구|CS Tools]] 강좌에서 따로 익힌다.

## 수강 순서와 기간

- 순서는 세 가지 방식이 모두 통한다. 전체를 위에서 아래로 듣거나, 영역 안에서는 순서대로 듣되 여러 영역을 병행하거나, 선수 과목을 길잡이로 자기 순서를 짠다. 수학을 입문 강좌와 나란히 듣는 병행이 흔하다.
- 어느 방식이든 **강좌별 선수 과목은 지킨다.** Core CS는 이미 배운 것이 확실한 강좌만 건너뛴다.
- 계획을 잘 세워 주당 20시간쯤 쓰면 약 2년에 마칠 수 있다.
- 진도는 저장소를 fork해 완료한 강좌에 표시하는 방식으로 관리한다. 과제물을 공개할 때는 강좌가 허용한 파일만 올린다.
- 혼자 해도 되고 모임을 만들어도 된다.

## 비용과 접근 조건

**무료의 범위는 학습 자료까지다.** 정규 커리큘럼의 자료는 무료로 볼 수 있어야 한다는 것이 OSSU의 핵심 목표이지만, 수료증이나 과제 채점, 강사와의 상호작용 같은 부가 기능은 유료일 수 있다. 무료 평가가 없는 강좌에는 대체 평가를 찾아 붙인다.

| 제공처 | 조건 |
| --- | --- |
| Coursera | 2025년 7월에 대부분 강좌의 청강(audit)이 없어져, 커리큘럼에 있던 Coursera 강좌가 모두 무료로 들을 수 없게 됐다. OSSU는 Coursera 강좌를 더 추천하지 않고 무료 대체 자료를 찾고 있다. 목록에 남은 Coursera 링크는 대체 링크나 GitHub 이슈·Discord의 최신 권장을 먼저 확인한다 |
| edX | 영상만 볼 때는 Verified Upgrade(유료 인증)가 필요 없다. 다만 일부 강좌는 예상 수강 주수 동안만 청강할 수 있으므로, 집중해서 끝낼 준비가 됐을 때 시작한다 |
| 공통 | Coursera와 edX 모두 학비 지원 제도가 있다. 실제 수강 가능 여부, 평가 비용, 기간 제한은 강좌 페이지에서 확인한다 |

강좌 이름 옆의 **alt(alternative) 링크**는 품질이 비슷한 다른 플랫폼의 같은 강좌다. 본 강좌가 열리지 않거나 유료가 됐을 때, 또는 그쪽이 더 편할 때 쓴다.

## 커리큘럼 범위에 대한 원칙

| 주제 | 원칙 |
| --- | --- |
| 특정 언어 강좌 | OSSU는 언어별 강좌가 아니라 CS 주제를 가장 잘 가르치는 강좌를 고른다. 특정 언어나 프레임워크는 그 언어 커뮤니티의 위키와 추천 자료 모음에서 찾는다 |
| 빠진 주제 | 강좌는 CS2013 지침에 맞춰 고른다. 지침이 요구하는데 빠진 주제가 있으면 [CONTRIBUTING](https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/CONTRIBUTING.md) 절차로 변경을 제안한다 |
| Software Engineering의 프로젝트 요건 | 소프트웨어 공학은 큰 프로그램을 다루는 문제를 푼다. 조각들이 감당하기 어려워지는 규모의 프로그램을 먼저 만들어 봐야 무엇을 풀려는 것인지 이해된다. Nand to Tetris의 Jack 컴파일러 프로젝트가 권장 예이고, 커리큘럼 밖의 프로젝트도 된다 |
| 정규 목록 밖의 주제 | Core CS를 마친 뒤 관심 주제의 강좌는 [Class Central](https://www.classcentral.com/)(MOOC), [awesome-courses](https://github.com/prakhar1989/awesome-courses)와 [cs-video-courses](https://github.com/Developer-Y/cs-video-courses)(대학 공개 강의)에서 찾는다 |
| 비공식 도구 | 오래된 Firebase 앱은 커리큘럼 변경을 반영하지 않고 로그인 버그가 있는, 지원이 끝난 도구다. Trello 보드와 제3자 Notion 템플릿도 공식 자료가 아니다. 기준은 GitHub 저장소와 [공식 사이트](https://cs.ossu.dev)다 |

## 도움 요청과 기여

- 공식 [Discord](https://discord.gg/wuytwK5s9h)에서 강좌별 질문을 하고 공부 모임에 참여한다.
- 개별 과제에서 막히면 그 강좌의 포럼을 먼저 확인한다. 그래도 안 풀리면 Discord에 **이미 시도한 과정**을 함께 적어 질문한다.
- 강좌에 문제가 있거나 커리큘럼을 바꾸고 싶으면 GitHub 이슈와 CONTRIBUTING 절차를 따른다.

관련 노트: [[ossu-core-cs|OSSU Core CS]], [[ossu-advanced-cs|OSSU Advanced CS와 최종 프로젝트]], [[ossu-extras|OSSU 보충 강좌와 읽을거리]], [[how-programs-run|프로그램 실행 원리]]
