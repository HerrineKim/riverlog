---
title: "OSSU 핵심 수학"
concept: "Core Mathematics"
summary: "미적분·이산수학·증명·확률과 통계·점근 분석을 컴퓨터과학 문제 풀이에 연결한다."
tags: ["computer-science", "curriculum", "math", "algorithm"]
source: other
date: "2026-11-15"
sources: ["https://github.com/ossu/computer-science", "https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/README.md"]
---

> OSSU의 공개 컴퓨터과학 커리큘럼과 관련 자료를 주제별로 재구성한 노트다.

## 수학이 필요한 이유

컴퓨터과학에서 수학은 복잡한 시스템을 설명하는 언어다. **이산수학과 증명은 알고리즘이 언제 올바르고 얼마나 빠른지 설명하는 근거**가 된다. 미적분은 변화율과 누적량을, 확률은 불확실한 사건을 정량화한다.

| 영역 | 소프트웨어에서의 쓰임 |
| --- | --- |
| 미적분 | 최적화, 모델링, 머신러닝 |
| 명제·귀납·증명 | 반복문 불변식, 알고리즘의 정당성 |
| 집합·관계·그래프 | 데이터 모델과 네트워크 |
| 확률·통계 | 무작위 알고리즘, 실험 평가 |
| 점근 표기법 | 입력 크기에 따른 계산량 비교 |

## 강좌 및 연계 자료

### Core math
| 강좌 | 기간 | 주당 학습량 | 선수 지식·참고 |
| --- | --- | --- | --- |
| [Calculus 1A: Differentiation](https://openlearninglibrary.mit.edu/courses/course-v1:MITx+18.01.1x+2T2019/about) ([alternative](https://ocw.mit.edu/courses/mathematics/18-01sc-single-variable-calculus-fall-2010/index.htm)) | 13 weeks | 6-10 hours/week | The alternate covers this and the following 2 courses; [high school math](https://ossu.dev/precollege-math) |
| [Calculus 1B: Integration](https://openlearninglibrary.mit.edu/courses/course-v1:MITx+18.01.2x+3T2019/about) | 13 weeks | 5-10 hours/week | -; Calculus 1A |
| [Calculus 1C: Coordinate Systems & Infinite Series](https://openlearninglibrary.mit.edu/courses/course-v1:MITx+18.01.3x+1T2020/about) | 6 weeks | 5-10 hours/week | -; Calculus 1B |
| [Mathematics for Computer Science](https://openlearninglibrary.mit.edu/courses/course-v1:OCW+6.042J+2T2019/about) ([alternative](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2010/)) | 13 weeks | 5 hours/week | [2015/2019 solutions](https://github.com/spamegg1/Math-for-CS-solutions) [2010 solutions](https://github.com/frevib/mit-cs-math-6042-fall-2010-problems) [2005 solutions](https://ocw.mit.edu/courses/6-042j-mathematics-for-computer-science-fall-2005/pages/assignments/).; Calculus 1C |


관련 노트: [[big-o|빅오 표기법]], [[number-theory-basics|정수론 기초]], [[permutation-combination|순열과 조합]], [[calculus-basics|미적분 기초]]
