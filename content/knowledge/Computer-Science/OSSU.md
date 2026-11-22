---
title: "OSSU 컴퓨터과학 커리큘럼"
concept: "OSSU Computer Science"
summary: "입문부터 핵심 CS·심화 선택 과목·최종 프로젝트까지 연결한 전체 강좌와 보충 자료의 주제별 안내."
tags: ["computer-science", "curriculum", "learning", "online-learning"]
source: other
date: "2026-11-15"
sources: ["https://github.com/ossu/computer-science", "https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/README.md", "https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/FAQ.md", "https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/extras/courses.md", "https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/extras/readings.md"]
---

> OSSU의 공개 컴퓨터과학 커리큘럼과 관련 자료를 주제별로 재구성한 노트다.

## OSSU 컴퓨터과학 커리큘럼

**OSSU는 학위 발급 서비스가 아니라, 대학 CS 전공의 핵심 학습 목표를 온라인 강좌와 과제로 구성한 학습 가이드**다. 언어 문법이나 취업 면접만 배우는 과정이 아니라 프로그램 설계·수학·시스템·알고리즘·보안·응용·윤리와 프로젝트를 연결한다.

```mermaid
flowchart LR
  A["수학 준비"] --> B["입문"]
  B --> C["Core CS 필수 영역"]
  C --> D["Advanced CS 선택 영역"]
  D --> E["최종 프로젝트"]
```

## 하위 노트

- [OSSU 입문 과정과 이용 안내](Computer-Science/OSSU/ossu-introduction.md): 단계 구성·선정 기준·선수 지식, Intro CS 강좌, 수강 순서, 비용과 청강 조건, 도움 요청
- [OSSU Core CS: 필수 영역과 강좌](Computer-Science/OSSU/ossu-core-cs.md): 프로그래밍·수학·도구·시스템·이론·보안·응용·윤리 영역별 핵심 개념과 강좌 표
- [OSSU Advanced CS와 최종 프로젝트](Computer-Science/OSSU/ossu-advanced-cs.md): 심화 프로그래밍·시스템·이론·정보보안·수학 선택 강좌, 최종 프로젝트 설계 흐름과 프로젝트형 강좌
- [OSSU 보충 강좌와 읽을거리](Computer-Science/OSSU/ossu-extras.md): 정규 커리큘럼 밖의 분야별 보충 강좌와 추천 도서

## 원문 사용 시 주의

- 강의 목록과 기간은 **원문에 제시된 계획치**다. 실제 개설·수강료·평가 접근은 각 제공처에서 확인한다.
- Coursera는 2025년 7월에 무료 청강을 없앴으므로([OSSU FAQ](https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/FAQ.md#are-coursera-courses-free-to-access)), 목록의 Coursera 강좌는 대체 링크를 먼저 확인한다. 자세한 조건은 [[ossu-introduction#비용과 접근 조건|비용과 접근 조건]]에 있다.
- 정규 과목, 심화 선택, 선택형 언어별 보안 과목, 보충 강좌는 구분한다.
- 이 정리의 원문 기준 커밋은 `8f8272b1d378`이다. [전체 소스 보기](https://github.com/ossu/computer-science/tree/8f8272b1d378d31494240aa1d667aa6b045c6552).

관련 노트: [[ossu-introduction|OSSU 입문 과정과 이용 안내]], [[ossu-core-cs|OSSU Core CS]], [[ossu-advanced-cs|OSSU Advanced CS와 최종 프로젝트]]
