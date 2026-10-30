---
title: "기술 면접 준비: 유형별 대비와 시스템 디자인 7단계"
concept: "Tech Interview"
summary: "개발자 기술 면접은 코딩, 시스템 디자인, 객체 지향 설계(OOD), 행동(behavioral) 면접으로 나뉜다. 유형별로 무엇을 보는지와 준비 자료, 퀴즈·온라인 코딩 테스트·과제·화상 면접·온사이트 같은 진행 형식별 대비, 면접 언어 고르기, 남은 시간에 맞춘 준비 계획(주제 우선순위, Blind 75·Grind 75), 코딩 인터뷰를 자기소개 → 질문 명확화 → 접근 논의 → 말하며 코딩 → 테스트 → 역질문으로 진행하는 법을 정리하고, 시스템 디자인 면접의 유형과 요구 사항 확인 → 용량 추정 → 상위 설계 → DB 설계 → 인터페이스 설계 → 확장성 → 신뢰성의 7단계를 다룬다."
tags: ["career", "interview", "job-search", "architecture", "algorithm"]
source: other
date: "2026-10-30"
sources: ["https://bytebytego.com/guides/how-to-ace-system-design-interviews-like-a-boss", "https://bytebytego.com/guides/my-recommended-materials-for-cracking-your-next-technical-interview", "https://jeinalog.tistory.com/30", "https://github.com/donnemartin/system-design-primer", "https://www.techinterviewhandbook.org/software-engineering-interview-guide/", "https://www.techinterviewhandbook.org/coding-interview-prep/", "https://www.techinterviewhandbook.org/coding-interview-study-plan/", "https://www.techinterviewhandbook.org/coding-interview-cheatsheet/", "https://www.techinterviewhandbook.org/best-practice-questions/", "https://www.techinterviewhandbook.org/programming-languages-for-coding-interviews/", "https://www.techinterviewhandbook.org/interview-formats-top-companies/", "https://www.techinterviewhandbook.org/mock-interviews/", "https://www.techinterviewhandbook.org/landscape/", "https://www.techinterviewhandbook.org/system-design/"]
---

> ByteByteGo의 System Design 101 가이드 「[How to Ace System Design Interviews](https://bytebytego.com/guides/how-to-ace-system-design-interviews-like-a-boss)」, 「[Recommended Materials for Technical Interviews](https://bytebytego.com/guides/my-recommended-materials-for-cracking-your-next-technical-interview)」를 바탕으로 재구성한 노트다.
> 진행 형식, 언어, 준비 계획, 코딩 인터뷰 진행 순서, 시스템 디자인 면접 유형은 Tech Interview Handbook의 「[Software Engineer Interview Guide](https://www.techinterviewhandbook.org/software-engineering-interview-guide/)」, 「[Coding Interview Prep](https://www.techinterviewhandbook.org/coding-interview-prep/)」, 「[Study Plan](https://www.techinterviewhandbook.org/coding-interview-study-plan/)」, 「[Best Practice Questions](https://www.techinterviewhandbook.org/best-practice-questions/)」, 「[Programming Languages](https://www.techinterviewhandbook.org/programming-languages-for-coding-interviews/)」, 「[Coding Interview Cheatsheet](https://www.techinterviewhandbook.org/coding-interview-cheatsheet/)」, 「[Interview Formats](https://www.techinterviewhandbook.org/interview-formats-top-companies/)」, 「[Mock Interviews](https://www.techinterviewhandbook.org/mock-interviews/)」, 「[Landscape](https://www.techinterviewhandbook.org/landscape/)」, 「[System Design](https://www.techinterviewhandbook.org/system-design/)」로, 코딩 인터뷰의 말하기 원칙은 「[구글 신입 엔지니어 인터뷰 준비 후기](https://jeinalog.tistory.com/30)」를 바탕으로 보강했다.

## 면접 유형과 준비 자료

| 유형 | 보는 것 | 준비 방법과 자료 |
| --- | --- | --- |
| 코딩 | 자료구조·알고리즘으로 문제를 풀고, 생각을 말로 설명하며 코드로 옮기는 힘. 한 라운드는 보통 30~45분이다 | LeetCode 같은 문제 사이트에서 유형별로 푼다. NeetCode처럼 유형별로 묶은 목록, 『코딩 인터뷰 완전 분석』([[coding-test\|코딩 테스트 접근법]]) |
| 시스템 디자인 | 모호한 요구를 구체화하고, 구성 요소를 조립하고, 트레이드오프를 설명하는 힘. 주로 몇 년 차 이상 경력직에게 내고, 인턴에게는 거의 내지 않는다 | 『가상 면접 사례로 배우는 대규모 시스템 설계 기초』 1·2권, 『데이터 중심 애플리케이션 설계』, 설계 사례 강의 |
| 객체 지향 설계(OOD) | 클래스와 책임을 나누고 관계를 그리는 힘. 주차장, 엘리베이터 같은 문제 | 『헤드 퍼스트 디자인 패턴』, OOD 문제 모음([[gof-design-patterns\|GoF 디자인 패턴]]) |
| 행동(behavioral) | 협업, 갈등, 실패, 주도성에 대한 실제 경험 | STAR 기법(상황 → 과제 → 행동 → 결과)으로 사례를 미리 정리한다. Tech Interview Handbook 같은 공개 자료([[behavioral-interview-questions\|인성 면접 준비]], 평가 기준은 [[behavioral-interview-rubrics\|인성 면접 평가 기준]]) |
| 모의 면접 | 실전 압박 속에서 말하며 푸는 연습 | 동료와 짝을 지어 번갈아 면접관을 맡거나, 현업 엔지니어와 익명으로 연습하는 플랫폼(interviewing.io 등)을 쓴다. 익명이라 부담이 적고, 끝나면 양쪽이 서로 피드백을 남긴다. 처음이라면 녹화된 모의 면접을 먼저 보며 흐름을 익힌다 |

지원은 LinkedIn, Indeed 같은 채용 플랫폼과 회사 채용 페이지, 추천(referral)으로 한다. 빅테크 정규직으로 가는 가장 쉬운 길은 **인턴 전환**이다. 인턴 면접은 보통 2라운드로 정규직(4~5라운드)보다 짧고, 회사는 이미 함께 일해 본 인턴에게 정규직 제안을 주는 것을 위험이 낮은 채용으로 본다. 미국 채용 절차는 [[us-hiring-process|미국 개발자 채용 프로세스와 ATS]], 프론트엔드 면접은 [[frontend-interview|프론트엔드 면접 유형과 준비법]]에 있다.

## 진행 형식별 대비

같은 코딩 문제라도 어떤 형식으로 보느냐에 따라 준비할 것이 다르다. 채용 단계의 순서는 [[us-hiring-process|미국 개발자 채용 프로세스와 ATS]]에 있다.

| 형식 | 빈도 | 특징 | 대비 |
| --- | --- | --- | --- |
| 퀴즈 | 가끔 | 초기 거르기. 리크루터나 자동 채점이 답이 정해진 질문을 낸다(비트 연산 결과, 버블 정렬의 시간 복잡도) | 자료구조·복잡도 같은 기본 개념을 짧게 답할 수 있게 한다 |
| 온라인 코딩 테스트(OA) | 가끔 | 초반에 HackerRank 같은 플랫폼에서 혼자 푼다. **입력을 stdin에서 읽고 결과를 stdout으로 출력**해야 하는 경우가 많다 | LeetCode는 함수만 채우므로, 입출력을 직접 다루는 연습을 따로 해 둔다 |
| 과제(take-home) | 드묾 | 항공편 목록 앱, 칸반 보드, 스네이크 게임처럼 큰 결과물로 설계 감각을 본다. 스타트업·작은 회사에 많다 | 동작보다 구조·테스트·README로 판단 과정을 보여 준다 |
| 화상·전화 면접(phone screen) | 흔함 | Zoom·Meet 등으로 연결해 CoderPad, CodePen(프론트엔드), Google Docs 같은 공유 편집기에서 푼다. **코드를 실행할 수 없는 경우가 많다** | 실행 없이 손으로 예제를 따라가며 검증하는 연습(아래 「코딩 인터뷰 진행 원칙」) |
| 온사이트(final round) | 거의 항상 | 몇 시간 동안 코딩·시스템 디자인·행동 면접을 여러 라운드 연달아 본다. 화이트보드나 본인 노트북을 쓰고, 직원과의 점심이 끼기도 한다 | 노트북을 쓰는 회사라면 편집기·언어 환경을 미리 세팅해 간다 |

온사이트는 회사마다 라운드 구성이 다르지만 다음 꼴이 반복된다. 지원 회사의 후기로 조합을 확인한다.

| 라운드 | 내용 |
| --- | --- |
| 알고리즘 코딩 | 2~4회. 문제를 빨리 풀면 한 라운드에 여러 문제를 받는다. 실행 가능한 코드를 중시하는 회사는 본인 노트북에서 풀게 하고 API 문서 검색을 허용하기도 한다 |
| 시스템 디자인·아키텍처 | 1~2회. 레벨이 높을수록 늘어난다 |
| 프론트엔드 코딩 | 프론트엔드 지원자만. 프레임워크 자유인 곳과 Vanilla JS만 허용하는 곳이 있다([[frontend-interview\|프론트엔드 면접 유형과 준비법]]) |
| 과거 경험·프로젝트 | 엔지니어링 매니저와 이력서·일하는 방식을 이야기한다. 끝에 짧은 기술 질문이 붙기도 한다 |
| 교차 직군(cross-functional)·문화 적합성 | 다른 직군 직원이 비기술 질문으로 문화 적합성을 본다. 비기술이지만 탈락 사유가 될 만큼 비중이 크다 |
| 코드 리뷰, 기술 발표 | 일부 회사가 시니어 레벨에 더한다. 실제 PR을 리뷰하거나 과거 작업을 발표한다 |

- **채용 결정과 레벨 결정은 따로 한다.** 레벨은 면접에서 드러난 경력과 리더십 신호로 정한다.
- 일부 회사(Google 등)는 면접을 통과한 뒤 **팀 매칭**(team matching)을 거쳐야 오퍼가 나온다. 여러 팀 매니저와 이야기해 서로 맞는 팀을 찾는다.
- 서류 단계는 문제 풀이 실력보다 **이력서가 경력을 어떻게 보여 주느냐**로 갈린다([[resume-writing|합격하는 영문 레주메 작성법]]). 서류를 통과한 뒤에는 과거 성과보다 코딩 실력의 비중이 커진다.
- 연봉 이야기는 과정 중 언제든 나올 수 있다. 원칙은 [[job-offer-negotiation|연봉 협상]]에 있다.

## 면접 언어 고르기

**이미 잘 쓰는 언어로 본다.** 면접의 병목은 쓰는 손이 아니라 생각이다. 면접을 위해 새 언어를 익히는 것은 몇 주 이상 걸려 손해다. 고르는 기준은 셋이다.

| 기준 | 내용 |
| --- | --- |
| 면접 적합성 | 표준 라이브러리와 자료구조가 풍부한 고수준 언어가 유리하다. Python은 `len()`, `for ... in`, 슬라이싱(`arr[-1]`, `arr[::-1]`)이 자료구조 전반에 똑같이 통해 코드가 가장 짧다. Java·C++는 타입 선언만큼 타이핑이 늘고, 화이트보드에서 특히 티가 난다 |
| 익숙함 | 회사에서 Java를 쓰고 있고 다른 언어에 익숙해질 시간이 없다면 Java로 본다. 일과 면접 사이에 언어를 오가는 비용을 피한다 |
| 직군 예외 | 프론트엔드·iOS·Android처럼 직군 언어(JavaScript, Swift, Kotlin)가 정해진 면접은 그 언어로 본다 |

| 등급 | 언어 |
| --- | --- |
| 추천 | Python, C++, Java, JavaScript |
| 무난(추천 언어에 익숙하면 그쪽) | Go, Ruby, PHP, C#, Swift, Kotlin |
| 피함 | C(표준 자료구조가 없고 메모리를 직접 관리한다), Haskell, Erlang, Perl, Matlab |

- 새 언어를 배울 이유가 되는 것은 **면접이 그 언어를 요구할 때**와 **준비 시간이 넉넉할 때**뿐이다. 지원 회사가 그 언어를 많이 써서 잘 보이고 싶다는 것은 이유가 되지 않는다.
- JavaScript처럼 큐·힙이 내장되지 않은 언어라면, 「이런 메서드와 시간 복잡도를 가진 힙이 있다고 가정해도 될까요?」라고 묻는다. 그 구현이 문제의 핵심이 아니면 대개 허락된다. 적절한 자료구조를 고르는 것이 구현 세부보다 중요하다.

## 준비 계획

**LeetCode 문제를 처음부터 다 풀려는 것은 시간 낭비다.** 문제당 30분, 하루 3시간이면 3~4주에 160문제 정도이고, 그마저 패턴으로 남지 않는다. 남은 시간을 먼저 계산하고 중요한 주제부터 순서를 정한다.

- **최소 30시간, 제대로 하려면 약 100시간**이 든다. 여유가 있으면 **약 3개월, 주 11시간(하루 2~3시간)**이 기준이다. 일정은 날짜별 남은 시간으로 쪼개 적되, 지치지 않게 보수적으로 잡는다.
- 한 주제를 **공부한 직후 그 주제의 문제를 푼다.** 기억에 남고 효율이 좋다. 해설은 정답 코드보다 **접근하는 사고 과정**을 이해한다.
- 연습할 때부터 아래 「코딩 인터뷰 진행 원칙」의 행동(질문 명확화, 말하며 풀기, 테스트)과 [[coding-test|코딩 테스트 접근법]]의 풀이·최적화 기법을 같이 쓴다. 제출 전에 테스트 케이스를 직접 만들어 따라가 보는 등 실전처럼 푼다.
- 문제 연습은 LeetCode가 면접에 가장 가깝고, HackerRank·Codeforces는 경시대회 쪽이다.

### 학습 순서 세 가지

자료구조·알고리즘 기초가 약하면 문제 연습 전에 먼저 복습한다. 순서는 남은 시간으로 고른다.

| 방식 | 진행 | 맞는 경우 |
| --- | --- | --- |
| 너비 우선 | 모든 주제를 한 번 훑은 뒤 여러 주제의 문제를 섞어 푼다 | 한 달 정도 있을 때 |
| 깊이 우선 | 한 주제를 익히고 문제를 많이 푼 뒤 다음 주제로 간다 | 시간이 적을 때. 우선순위 높은 주제만 한다 |
| 깊이 우선 후 너비 | 주제마다 몇 문제씩 풀며 넘어가고, 마지막에 전 주제를 섞어 푼다 | 한 달보다 많을 때 |

뒤 주제로 넘어가며 앞 주제를 잊지 않도록 **어떤 식으로든 섞어 푸는 너비 단계를 넣는다.**

### 주제 우선순위와 12주 계획

1~4주는 주제별 공부와 연습, 5~12주는 문제 목록으로 심화 연습을 한다.

| 주 | 주제(우선순위, 시간) |
| --- | --- |
| 1 | [[data-structures\|배열]](높음, 2h), 문자열(높음, 3h), [[hash-table\|해시 테이블]](중간, 3h), [[recursion\|재귀]](중간, 3h) |
| 2 | 정렬·탐색(높음, 3h), 행렬(높음, 1h), [[data-structures\|연결 리스트]](중간, 3h), [[queue-deque\|큐]](중간, 2h), [[stack\|스택]](중간, 2h) |
| 3 | [[tree\|트리]](높음, 4h), [[graph-basics\|그래프]](높음, 4h), [[heap-priority-queue\|힙]](중간, 3h), [[data-structures\|트라이]](중간, 3h) |
| 4 | 구간(interval, 중간, 2h), [[dynamic-programming\|동적 계획법]](낮음, 4h), 비트 연산(낮음, 2h), 수학(낮음, 1h), 기하(낮음, 1h) |
| 5~12 | Grind 75 목록으로 심화 연습 |

- **배열·문자열이 가장 많이 나온다.** 다익스트라·플로이드-워셜 같은 고급 그래프 알고리즘은 해외 코딩 인터뷰에서는 드물다. 트리 순회(전위·중위·후위)와 BFS·DFS가 기본이다.
- **동적 계획법은 투자 대비 효과가 낮아 우선순위가 가장 낮다.** 다만 Google처럼 여전히 내는 회사가 있고, 많은 DP 문제는 재귀·백트래킹으로도 풀린다.

### 문제 목록: Blind 75와 Grind 75

| 목록 | 내용 |
| --- | --- |
| Blind 75 | LeetCode에서 다른 문제의 기법이 대부분 들어 있는 75문제를 고른 목록. 익명 커뮤니티 Blind에 공유되며 이 이름이 붙었다. 이후 50문제·5주 일정으로 줄인 판도 있다 |
| Grind 75 | Blind 75의 후속. 남은 주 수, 주당 시간, 난이도·주제 필터에 맞춰 문제 일정을 만들어 주고 진도를 기록한다. 우선순위와 주제 간 균형을 함께 따진다 |

5주 일정은 주제 순서를 보여 준다: 1주 배열·문자열(Two Sum, Valid Parentheses, Product of Array Except Self, Merge Intervals), 2주 연결 리스트·행렬·슬라이딩 윈도우(Reverse Linked List, Number of Islands, Longest Substring Without Repeating Characters), 3주 트리·그래프·힙(Validate BST, Course Schedule, Top K Frequent Elements), 4주 심화 자료구조(Implement Trie, Merge K Sorted Lists, Find Median from Data Stream), 5주 동적 계획법(Coin Change, Word Break).

### 문제 밖의 준비

- **자기소개와 역질문**: 거의 모든 면접의 처음과 끝에 들어간다. 약 3시간을 따로 잡아 준비한다([[behavioral-interview-questions#자기소개: 엘리베이터 피치|자기소개]], [[interview-attitude#마지막 역질문|역질문]]).
- **모의 면접**: 계획의 **60% 정도를 지났을 때** 일정을 잡기 시작한다. 플랫폼은 면접관이 시간대를 미리 열어 두는 방식이라 예약이 필요하다.
- 시간이 남으면 문제 **패턴**(슬라이딩 윈도우, 투 포인터 등)을 익힌다. 자주 나오는 문제 밖의 낯선 문제도 패턴의 조합으로 풀린다.

## 코딩 인터뷰 진행 원칙

코딩 인터뷰는 정답만이 아니라 **풀이 과정을 말로 전달하는 능력**도 본다. 빅테크는 공통으로 **소통, 문제 해결, 기술 역량, 테스트** 네 가지를 평가한다. 항목별 신호와 점수 구간은 [[coding-interview-rubric|코딩 인터뷰 평가 기준]]에 있다.

### 면접 전 준비

| 형식 | 준비 |
| --- | --- |
| 공통 | 편한 옷(대부분 캐주얼이면 된다). 자기소개와 역질문을 준비한다 |
| 화상 | 펜과 종이(트리·그래프는 그려 보면 쉽다), 스피커 대신 이어폰과 조용한 장소, 인터넷·카메라·마이크 점검. CoderPad·CodePen의 단축키, 자동 완성, 탭 간격을 미리 설정한다 |
| 전화 | 이어폰을 끼고 전화기는 내려놓아 두 손으로 타이핑한다. 링크·코드를 주고받기 쉬운 화상 도구로 바꿀 수 있는지 요청한다 |
| 화이트보드 | 나중에 줄을 끼워 넣을 수 있게 줄 사이를 띄워 쓴다 |

### 면접 중 여섯 단계

| 단계 | 할 일 | 하지 않을 것 |
| --- | --- | --- |
| 1. 자기소개 | 1~2분 안에 몇 문장으로, 밝게 | 길게 말해 코딩 시간을 깎는다 |
| 2. 질문 명확화 | 문제를 내 말로 다시 말한다. 질문은 일부러 모호하게 주어지므로 **최소 2~3개를 묻는다**: 트리인가 순환 있는 그래프인가, 입력을 바꿔도 되나, 정렬돼 있나(이진 탐색 가능 여부), 입력 크기와 범위, 음수·실수·빈 값·null·중복이 있나. 간단한 예제(`"KAYAK"` → true)를 면접관과 맞춰 본다 | 바로 코딩을 시작한다 |
| 3. 접근 논의 | 접근 몇 가지를 큰 그림으로 말하고 동료와 의논하듯 트레이드오프를 비교한다. 예: Two Sum은 이중 반복(시간 O(n²), 공간 O(1))과 해시 테이블 한 번 훑기(시간·공간 O(n)). 시간·공간 복잡도와 그 이유를 말하고, 가장 나은 접근에 합의한 뒤 최적화한다. 문제에 따라 5~10분 걸리고, 이때 면접관이 힌트를 준다. 막혀도 어디서 막혔는지 말한다 | 주어진 정보를 흘린다. 자기 분석에 자신 없어 보인다 |
| 4. 말하며 코딩 | 면접관이 동의한 뒤에 시작한다. 무엇을 하려는지 설명하며, 설명할 수 있을 만큼의 속도로 쓴다. 의사 코드가 아니라 **실행 가능한 코드**를 쓰고, 이름은 뜻이 드러나게(`multiplesOfThree`) 짓는다. 상위 함수를 먼저 쓰고 작은 보조 함수로 나눈다. `reduce`, `min` 같은 흔한 함수는 써도 되는지 묻는다. 면접이라 생략하는 부분은 「실무라면 정규식으로 파싱하겠다」처럼 말로 밝힌다 | 면접관 말을 끊는다(대개 힌트다). 주석에 시간을 쓴다. 한 글자나 지나치게 긴 이름을 쓴다. 복사한 코드를 확인 없이 붙인다 |
| 5. 검증과 테스트 | 「다 했다」고 말하기 전에 남이 쓴 코드를 처음 보듯 다시 읽으며 off-by-one 같은 실수를 찾는다. 큰 입력, 빈 입력, 원소 하나, 음수 같은 경계 사례를 면접관과 함께 떠올려 **한 줄씩 손으로 따라간다.** 리팩터링할 곳, 최종 복잡도, 시간이 더 있으면 고칠 점을 말한다 | 끝났다고 바로 선언한다. 면접관과 논쟁한다 |
| 6. 마무리 | 회사에 맞춘 역질문을 하고 감사 인사를 한다 | 질문 없이 끝낸다 |

말하기 원칙은 단계 전체에 걸친다. **떠오르는 접근과 고민 중인 선택지를 계속 말하고**, 혼자 연습할 때부터 말하면서 푼다. 막혀도 침묵하지 않으면 면접관이 힌트를 줄 수 있다. 제한 시간 안에 풀고 설명하는 모의 면접을 반복하고, 준비 기간을 넉넉히 잡아 긴장을 줄이는 루틴을 만든다.

### 면접 후

- 받은 질문과 내 답을 기록해 둔다. 다음 면접 준비의 재료가 된다.
- 면접관에게 감사 메일이나 LinkedIn 연결 요청을 보낸다([[interview-attitude#면접 후: 감사 메일|감사 메일 쓰는 법]]).
- 떨어진 회사에 다시 지원하면 과거 면접 피드백을 면접관이 볼 수 있다. 그때보다 무엇이 나아졌는지 보여 줄 수 있게 원인을 돌아보고 채운다.

### 자주 나오는 문제

기술 면접의 코딩 문제는 생각보다 어렵지 않은 경우가 많다. 자주 나오는 유형은 문자열 조작(뒤집기·조합·자르기), 간단한 길 찾기, [[stack|스택]]·[[queue-deque|큐]]·연결 리스트 응용, [[binary-search|이진 탐색]], [[dfs|깊이 우선 탐색]]·[[bfs|너비 우선 탐색]]이다. **주요 알고리즘의 시간 복잡도([[big-o|빅오 표기법]])는 외워 간다.** 바로 답하는 지원자가 드물어 차이가 난다. 막혔을 때 접근을 찾는 법과 최적화 기법, 출제 유형별 우선순위는 [[coding-test|코딩 테스트 접근법]]에 있다.

## 시스템 디자인 면접 7단계

시스템 디자인 면접은 여러 구성 요소로 된 실제 소프트웨어 시스템을 설계하는 힘을 본다. 문제는 네 갈래로 나온다.

| 갈래 | 다루는 것 |
| --- | --- |
| 백엔드·분산 시스템 | 여러 서버·데이터 센터에 걸친 시스템. 백엔드 구조, DB 스키마, 복제, 장애 허용, 메시지 큐, 일관성 모델. **가장 흔하다** |
| API 설계 | 큰 시스템 안의 HTTP API(REST 등)나 컴포넌트의 메서드 |
| 객체 지향 설계 | 클래스·객체와 관계, 클래스 다이어그램, 인터페이스, 디자인 패턴 |
| 프론트엔드 | 복잡한 클라이언트 앱·UI 컴포넌트 구조와 클라이언트-서버 API([[frontend-interview#프론트엔드 시스템 디자인과 RADIO\|RADIO 프레임워크]]) |

단골 백엔드 문제는 URL 단축기(Bitly), 소셜 미디어(Twitter), 동영상 서비스(YouTube, [[media-processing-pipeline|이미지·동영상 처리 서버 설계]]), 채팅([[chat-system-design|채팅 시스템 설계]]), 파일 공유(Google Drive, Dropbox), 차량 호출([[location-based-service|위치 기반 서비스 설계]]), 사진 공유, 전자상거래, 채용 포털, 웹 크롤러([[web-crawler-at-scale|대규모 웹 크롤러 설계]])다.

시스템 디자인 면접에는 정답이 없다. **요구를 묻고, 숫자로 규모를 잡고, 단순한 그림에서 출발해 병목을 하나씩 푸는 과정**을 보여 주는 것이 핵심이다.

```text
1. 요구 사항 확인   ── 무엇을, 누구를 위해, 얼마나 크게?
2. 용량 추정        ── 사용자 수, QPS, 저장량, 대역폭
3. 상위 설계        ── 클라이언트·LB·서버·DB 블록 다이어그램, 데이터 흐름
4. 데이터베이스 설계 ── 데이터 모델, DB 종류, 스키마
5. 인터페이스 설계   ── API 엔드포인트·이벤트, 통신 방식
6. 확장성과 성능     ── 캐시, 인덱스, 샤딩, 복제, CDN
7. 신뢰성과 복원력   ── 단일 장애 지점 찾기와 완화
```

| 단계 | 할 일 | 흔한 실수 |
| --- | --- | --- |
| 1. 요구 사항 확인 | 핵심 **기능 요구**(무엇을 하나)와 **비기능 요구**(데이터 양, 가용성, 지연, 규모)를 질문으로 확정한다 | 묻지 않고 바로 그리기 시작한다 |
| 2. 용량 추정 | 사용자 수 → 초당 요청 수 → 저장 공간·메모리 → 계산·네트워크 요구를 어림한다 | 정확한 계산에 시간을 쓴다. 자릿수만 맞으면 된다 |
| 3. 상위 설계 | 클라이언트, 서버, 로드 밸런서, DB 같은 구성 요소를 상자로 그리고 **데이터가 어떻게 흐르는지** 보인다 | 처음부터 복잡한 구조를 그린다 |
| 4. DB 설계 | 데이터를 모델링하고 맞는 DB 종류를 고른 뒤 스키마를 정한다 | 이유 없이 NoSQL이나 SQL을 고른다([[database-selection\|용도별 데이터베이스와 고르는 법]]) |
| 5. 인터페이스 설계 | 구성 요소 사이의 API 엔드포인트나 이벤트 모델을 정하고, REST·GraphQL·gRPC·이벤트 기반 중 통신 방식을 고른다 | API의 입력·출력을 구체적으로 적지 않는다 |
| 6. 확장성·성능 | 수직·수평 확장, 캐시, 인덱스, 비정규화, 샤딩, 복제, CDN 중 병목에 맞는 처방을 낸다 | 병목이 어디인지 말하지 않고 기술 이름만 나열한다 |
| 7. 신뢰성·복원력 | 단일 장애 지점을 찾아 이중화, 장애 조치, 재시도·서킷 브레이커로 영향을 줄인다 | 장애 시나리오를 묻기 전까지 다루지 않는다 |

- 각 단계에서 **선택의 이유와 대가**를 말한다. 면접관은 답보다 판단 과정을 본다.
- 시간을 나눠 쓴다. 1~3단계에서 전체 그림을 끝내고, 남은 시간에 면접관이 관심 있는 곳을 깊게 판다.
- 설계 체크리스트와 품질 속성은 [[system-design-fundamentals|시스템 설계의 품질 속성과 트레이드오프]], 단골 선택지와 증상별 처방은 [[system-design-choices|시스템 설계의 선택지와 흔한 문제의 해법]], 자주 쓰이는 알고리즘은 [[real-world-algorithms|현실 시스템을 움직이는 알고리즘과 자료구조]]에 있다.

## 더 볼 자료

- [Tech Interview Handbook](https://www.techinterviewhandbook.org/): 코딩 면접 기법, 3개월 학습 계획, 알고리즘 치트시트, [Grind 75](https://www.techinterviewhandbook.org/grind75/), 행동 면접 질문 모음을 모은 공개 가이드.
- [System Design Primer](https://github.com/donnemartin/system-design-primer): 시스템 설계 개념(확장성, 일관성, 캐시, DB, 비동기)과 면접 예제를 모은 공개 저장소. 플래시 카드와 문제별 풀이가 있다. 가장 방대해서 시간이 넉넉할 때 맞다.
- [System Design in a Hurry](https://www.hellointerview.com/learn/system-design/in-a-hurry/introduction): 면접 진행 방식, 핵심 개념·기술, 단골 문제의 설계 결정을 짧게 정리한 무료 가이드.
- [System Design Roadmap](https://roadmap.sh/system-design): 시스템 설계 주제를 순서대로 잇고 글·영상을 연결한 학습 지도.
- [System Design Cheatsheet](https://gist.github.com/vasanthk/485d1c25737e8e72759f): 면접 직전 복습용 요약. [System Design Interview](https://github.com/checkcheckzz/system-design-interview)는 팁, 주제별 글, 빅테크 엔지니어링 블로그 링크 모음이다.
- [Front End Interview Handbook](https://www.frontendinterviewhandbook.com/): 프론트엔드 면접 유형별 자료([[frontend-interview|프론트엔드 면접 유형과 준비법]]).
- [블록체인 개발자 면접 오픈북](https://hamait.tistory.com/1054): 블록체인(비트코인·이더리움·하이퍼레저), 합의 알고리즘, 분산 시스템, 암호학, 언어별 심화 질문 목록.
- [데이터 사이언스 인터뷰 질문 모음집](https://zzsza.github.io/data/2018/02/17/datascience-interivew-questions/): 통계·수학, 분석 일반, 머신러닝·딥러닝, 추천 시스템, DB, 시각화, 분산 처리, 개인정보까지 데이터 직군 면접 질문을 분야별로 모은 목록.
- [서로 성장하는 기술 면접 만들기](https://hiddenest.dev/good-tech-interview): 면접관 입장에서 평가 기준과 과제를 설계하는 과정을 다룬 시리즈.

## 정리

- 기술 면접은 코딩, 시스템 디자인, OOD, 행동 면접으로 나뉘고 보는 능력이 각각 다르다.
- 준비는 남은 시간을 계산해 우선순위 높은 주제(배열·문자열, 트리·그래프)부터, 공부와 연습을 붙여서 한다. 3개월·주 11시간이 넉넉한 기준이다.
- 코딩 인터뷰는 질문 명확화 → 접근 논의 → 말하며 코딩 → 테스트 순서로 진행하고, 끝났다고 선언하기 전에 스스로 검증한다.
- 시스템 디자인은 요구 확인 → 용량 추정 → 상위 설계 → DB → 인터페이스 → 확장성 → 신뢰성 순으로 진행한다.
- 모든 단계에서 트레이드오프를 말로 설명한다.

관련 노트: [[coding-interview-rubric|코딩 인터뷰 평가 기준]], [[frontend-interview|프론트엔드 면접 유형과 준비법]], [[coding-test|코딩 테스트 접근법]], [[behavioral-interview-questions|인성 면접 준비]], [[system-design-fundamentals|시스템 설계의 품질 속성과 트레이드오프]], [[system-design-choices|시스템 설계의 선택지와 흔한 문제의 해법]]
