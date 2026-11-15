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

- [OSSU 입문과 도구](Computer-Science/OSSU/ossu-introduction-and-tools.md): 진입 경로·선수 수학·개발 도구
- [핵심 프로그래밍](Computer-Science/OSSU/ossu-core-programming.md): 설계·언어·타입·테스트
- [핵심 수학](Computer-Science/OSSU/ossu-core-mathematics.md): 미적분·이산수학·증명
- [핵심 시스템](Computer-Science/OSSU/ossu-core-systems.md): 컴퓨터 구조·운영체제·네트워크
- [핵심 이론](Computer-Science/OSSU/ossu-core-theory.md): 알고리즘·계산 복잡도
- [핵심 보안](Computer-Science/OSSU/ossu-core-security.md): 보안 원리·취약점·안전한 코딩
- [응용과 윤리](Computer-Science/OSSU/ossu-core-applications-ethics.md): 데이터베이스·ML·그래픽스·사회적 책임
- [심화 프로그래밍·시스템](Computer-Science/OSSU/ossu-advanced-programming-systems.md): 컴파일러·병렬성·컴퓨터 구조 심화
- [심화 이론·보안·수학](Computer-Science/OSSU/ossu-advanced-theory-security-math.md): 계산이론·웹 보안·선형대수
- [최종 프로젝트](Computer-Science/OSSU/ossu-capstone-and-progress.md): 주제 선정·구현·검증·진도 기록
- [추가 강좌 전체 목록](Computer-Science/OSSU/ossu-additional-courses.md): 분야별 대체·보충 강좌
- [보충 책과 읽을거리](Computer-Science/OSSU/ossu-additional-readings.md): 분야별 서적·기사
- [FAQ·이용·비용·커뮤니티](Computer-Science/OSSU/ossu-faq-community.md): 무료 접근의 조건과 공식 지원 채널

## 원문 사용 시 주의

- 강의 목록과 기간은 **원문에 제시된 계획치**다. 실제 개설·수강료·평가 접근은 각 제공처에서 확인한다.
- 특히 [Coursera 관련 OSSU FAQ](https://github.com/ossu/computer-science/blob/8f8272b1d378d31494240aa1d667aa6b045c6552/FAQ.md#are-coursera-courses-free-to-access)는 무료 청강 축소를 설명하므로, 유료화된 강좌는 대체 링크를 우선 확인한다.
- 정규 과목, 심화 선택, 선택형 언어별 보안 과목, 보충 강좌는 구분한다.
- 이 정리의 원문 기준 커밋은 `8f8272b1d378`이다. [전체 소스 보기](https://github.com/ossu/computer-science/tree/8f8272b1d378d31494240aa1d667aa6b045c6552).

관련 노트: [[ossu-introduction-and-tools|OSSU 입문]], [[ossu-core-systems|핵심 시스템]], [[ossu-core-theory|핵심 알고리즘 이론]]
