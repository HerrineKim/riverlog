---
title: "OSSU 심화 이론·보안·수학"
concept: "Advanced Theory Security Math"
summary: "계산이론·기하·게임이론, 웹 보안·포렌식·안전 개발, 선형대수·확률·수치해석을 다룬다."
tags: ["computer-science", "curriculum", "algorithm", "security", "math"]
source: other
date: "2026-11-15"
sources: ["https://github.com/ossu/computer-science", "https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/README.md"]
---

> OSSU의 공개 컴퓨터과학 커리큘럼과 관련 자료를 주제별로 재구성한 노트다.

## 목적에 따라 선택하는 심화 과목

- **이론**: 계산 가능한 것의 한계, 형식 언어·오토마타, 계산 기하와 게임이론.
- **정보보안**: 웹 취약점, 거버넌스·컴플라이언스, 디지털 포렌식, 안전한 개발 생명주기.
- **수학**: 선형대수·확률·논리·수치해석을 통해 AI·그래픽스·시뮬레이션의 기반을 만든다.

심화 이론 강좌는 선수 과목의 개념을 활용한다. 보안은 Core security, 수학은 미적분과 이산수학 이후에 이어지는 편이 자연스럽다.

## 심화 이론

### Advanced theory
| 강좌 | 기간 | 주당 학습량 | 선수 지식·참고 |
| --- | --- | --- | --- |
| [Theory of Computation](https://ocw.mit.edu/courses/18-404j-theory-of-computation-fall-2020/) ([alternative](https://www.youtube.com/playlist?list=PLEE7DF8F5E0203A56)) | 13 weeks | 10 hours/week | [Mathematics for Computer Science](https://openlearninglibrary.mit.edu/courses/course-v1:OCW+6.042J+2T2019/about), logic, algorithms |
| [Computational Geometry](https://www.edx.org/learn/geometry/tsinghua-university-ji-suan-ji-he-computational-geometry) | 16 weeks | 8 hours/week | algorithms, C++ |
| [Algorithmic Game Theory](https://timroughgarden.org/f13/f13.html) | 10 weeks | 12 hours/week | Core Theory |


## 심화 정보보안

### Advanced Information Security
| 강좌 | 기간 | 주당 학습량 | 선수 지식·참고 |
| --- | --- | --- | --- |
| [Web Security Fundamentals](https://www.edx.org/learn/computer-security/ku-leuven-web-security-fundamentals) | 5 weeks | 4-6 hours/week | understanding basic web technologies |
| [Security Governance & Compliance](https://www.coursera.org/learn/security-governance-compliance) | 3 weeks | 3 hours/week | - |
| [Digital Forensics Concepts](https://www.coursera.org/learn/digital-forensics-concepts) | 3 weeks | 2-3 hours/week | Core Security |
| [Secure Software Development: Requirements, Design, and Reuse](https://www.edx.org/learn/software-development/the-linux-foundation-secure-software-development-requirements-design-and-reuse) | 7 weeks | 1-2 hours/week | Core Programming and Core Security |
| [Secure Software Development: Implementation](https://www.edx.org/learn/software-development/the-linux-foundation-secure-software-development-implementation) | 7 weeks | 1-2 hours/week | Secure Software Development: Requirements, Design, and Reuse |
| [Secure Software Development: Verification and More Specialized Topics](https://www.edx.org/learn/software-engineering/the-linux-foundation-secure-software-development-verification-and-more-specialized-topics) | 7 weeks | 1-2 hours/week | Secure Software Development: Implementation |


## 심화 수학

### Advanced math
| 강좌 | 기간 | 주당 학습량 | 선수 지식·참고 |
| --- | --- | --- | --- |
| [Essence of Linear Algebra](https://www.youtube.com/playlist?list=PLZHQObOWTQDPD3MizzM2xVFitgF8hE_ab) | - | - | [high school math](https://ossu.dev/precollege-math) |
| [Linear Algebra](https://ocw.mit.edu/courses/mathematics/18-06sc-linear-algebra-fall-2011/) | 14 weeks | 12 hours/week | corequisite: Essence of Linear Algebra |
| [Introduction to Numerical Methods](https://ocw.mit.edu/courses/mathematics/18-335j-introduction-to-numerical-methods-spring-2019/index.htm) | 14 weeks | 12 hours/week | [Linear Algebra](https://ocw.mit.edu/courses/mathematics/18-06sc-linear-algebra-fall-2011/) |
| [Introduction to Formal Logic](https://forallx.openlogicproject.org/) | 10 weeks | 4-8 hours/week | [Set Theory](https://www.youtube.com/playlist?list=PL5KkMZvBpo5AH_5GpxMiryJT6Dkj32H6N) |
| [Probability](https://stat110.hsites.harvard.edu/) | 15 weeks | 5-10 hours/week | [Differentiation and Integration](https://mitxonline.mit.edu/courses/course-v1:MITxT+18.01.2x/) |


관련 노트: [[number-theory-basics|정수론]], [[vector-space|벡터공간]], [[type-systems|타입 시스템]]
