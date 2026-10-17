---
title: "Frontend Architecture"
concept: "Frontend Architecture"
summary: "폴더 구조, 의존성, SOLID, Feature-Sliced Design처럼 프론트엔드 코드를 어떻게 나누고 어디에 두는지에 관한 설계 원칙 모음."
tags: ["frontend", "architecture", "design-principles"]
source: mixed
date: "2026-10-14"
---

프론트엔드 아키텍처는 **코드를 어떤 단위로 나누고, 그 단위들이 서로 어떻게 의존하게 할지**를 정하는 일이다. 컴포넌트 하나를 잘 만드는 것과는 다른 문제다. 화면이 늘어나면 "이 파일을 어디에 두나", "이 훅은 어디까지 알아도 되나"가 되풀이해서 나오고, 그 답이 쌓인 것이 폴더 구조와 의존 규칙이다. 이 주제의 노트는 "의존성 → SOLID → 폴더 구조의 진화 → FSD" 순서로 읽으면 원칙에서 방법론으로 자연스럽게 이어진다.

## 노트

- [프론트엔드에서 의존성 관리하기](Frontend/Architecture/frontend-dependency.md): 의존성은 변경에 노출되는 관계다. 변수 스코프 좁히기, 공용 함수의 의존성 역전, API 응답 대신 도메인 타입에 기대기
- [프론트엔드와 SOLID 원칙](Frontend/Architecture/frontend-solid.md): SRP·OCP·LSP·ISP·DIP를 React 컴포넌트 설계에 옮기기
- [프론트엔드에서 관심사의 분리](Frontend/Architecture/separation-of-concerns.md): 역할 → 컴포넌트 → 컴포넌트 안의 계층으로 바뀐 분리 축, 레이어·모듈·데이터 흐름이라는 관심사의 방향, 시기별로 달라지는 구조
- [컴포넌트를 분리하는 기준과 방법](Frontend/Architecture/component-splitting.md): 재사용·복잡성·렌더링 범위라는 세 가지 이유. 모양이 같아도 바뀌는 이유가 다르면 중복이 아니고, 고유한 부분은 props로 넘긴다
- [Atomic Design과 컴포넌트 폴더 구조](Frontend/Architecture/atomic-design.md): 원자 → 분자 → 유기체 → 템플릿 → 페이지는 멘탈 모델이다. 폴더로 쓸 때의 한계와 이름 붙은 영역 먼저 나누는 절충안
- [프론트엔드 폴더 구조의 진화](Frontend/Architecture/frontend-folder-structure.md): 역할 기반 폴더에서 엔티티·위젯·기능 중심 응집으로. 좋은 구조는 팀의 멘탈 모델과 일치하는 구조
- [프론트엔드 MV* 아키텍처의 흐름: MVC에서 MVI까지](Frontend/Architecture/frontend-mv-architecture.md): MVC·MVP·MVVM 비교, MVC → MVVM → Flux → 가벼운 스토어·서버 상태로 이어진 변천과 MVI. 뷰는 의도만 보내고 데이터는 한 방향으로 돈다
- [추상화 계층과 데이터 흐름](Frontend/Architecture/abstraction-layers.md): 구현에 알맞은 이름과 수준을 주면 추상화, 쌓이면 계층. 사용자 중심으로 순환하는 데이터 흐름 위에서 코드의 자리를 정하는 그라데이션 사고
- [변경하기 쉬운 코드의 네 가지 기준](Frontend/Architecture/changeable-code-criteria.md): 가독성·예측 가능성·응집도·결합도로 판단하는 좋은 코드, 서로 부딪히는 기준 사이의 우선순위, 자주 논쟁되는 컨벤션
- [가독성을 높이는 전략](Frontend/Architecture/code-readability.md): 같이 실행되지 않는 코드 분리, 구현 상세 추상화, 조건·매직 넘버에 이름 붙이기, 시점 이동과 중첩 삼항 줄이기
- [예측 가능성을 높이는 전략](Frontend/Architecture/code-predictability.md): 같은 이름은 같은 동작, 같은 종류 함수의 반환 타입 통일, 숨은 부수 효과 드러내기
- [응집도를 높이는 전략](Frontend/Architecture/code-cohesion.md): 함께 바뀌는 파일은 도메인 디렉토리에, 매직 넘버 상수화, 필드 단위 vs 폼 전체 단위 검증
- [결합도를 낮추는 전략](Frontend/Architecture/code-coupling.md): 책임 하나씩 훅 쪼개기, 갈라질 코드는 중복 허용, Props Drilling은 조합 → Context 순서로
- [게슈탈트 법칙으로 보는 읽기 좋은 코드](Frontend/Architecture/readable-code.md): 근접성·공통 영역·유사성·연속성·폐쇄성으로 점검하는 빈 줄과 주석, 코드 배치, 이름 짓기
- [Feature-Sliced Design](Frontend/Architecture/feature-sliced-design.md): 레이어 → 슬라이스 → 세그먼트 3단계 분할, 위 레이어만 아래를 쓰는 규칙, Public API, Next.js와 함께 쓸 때의 충돌, 레이어 경계 찾기와 점진적 도입

관련 주제: 빌드 도구와 폴더를 처음 잡는 과정은 [React](Frontend/React.md), 테스트로 설계를 이끄는 방법은 [Testing](Frontend/Testing.md)에 있다.
