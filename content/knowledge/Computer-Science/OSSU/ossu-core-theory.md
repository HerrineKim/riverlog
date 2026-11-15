---
title: "OSSU 핵심 알고리즘 이론"
concept: "Core Theory"
summary: "정렬·그래프·탐욕·동적 계획법·복잡도·NP-완전성까지 알고리즘 설계를 학습한다."
tags: ["computer-science", "curriculum", "algorithm", "complexity"]
source: other
date: "2026-11-15"
sources: ["https://github.com/ossu/computer-science", "https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/README.md"]
---

> OSSU의 공개 컴퓨터과학 커리큘럼과 관련 자료를 주제별로 재구성한 노트다.

## 알고리즘 이론의 핵심

알고리즘을 외우는 것보다 **어떤 성질 때문에 해결책이 옳고 효율적인지 증명하는 일**이 중요하다.

| 접근법 | 적용되는 문제의 성질 |
| --- | --- |
| 분할 정복 | 독립적인 부분 문제로 쪼개고 결합할 수 있음 |
| 탐욕 | 국소 최적 선택이 전역 최적을 보장하는 구조가 있음 |
| 동적 계획법 | 부분 문제가 겹치고 최적 부분 구조가 존재 |
| 그래프 알고리즘 | 관계를 정점과 간선으로 표현 가능 |
| 복잡도 분석 | 입력이 커질 때 시간·공간 비용을 비교 |

## 강좌

### Core theory
| 강좌 | 기간 | 주당 학습량 | 선수 지식·참고 |
| --- | --- | --- | --- |
| [Algorithms: Design and Analysis, Part 1](https://www.edx.org/learn/algorithms/stanford-university-algorithms-design-and-analysis-part-1) ([alternative](https://www.algorithmsilluminated.org/)) | 8 weeks | 4-8 hours/week | any programming language, Mathematics for Computer Science |
| [Algorithms: Design and Analysis, Part 2](https://www.edx.org/learn/algorithms/stanford-university-algorithms-design-and-analysis-part-2) | 8 weeks | 4-8 hours/week | Algorithms Part 1 |


## 실습 점검

정렬·탐색·최단 경로·최소 신장 트리의 구현 뒤, 올바름의 근거와 시간·공간 복잡도를 각각 설명한다. NP-완전성은 어떤 문제가 어렵다는 경험적 표현이 아니라 문제 환원에 기반한 계산 복잡도 분류다.

관련 노트: [[dynamic-programming|동적 계획법]], [[greedy|그리디]], [[divide-and-conquer|분할 정복]], [[shortest-path|최단 경로]], [[big-o|빅오 표기법]]
