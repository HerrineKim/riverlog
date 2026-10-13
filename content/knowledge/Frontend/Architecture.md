---
title: "Frontend Architecture"
concept: "Frontend Architecture"
summary: "폴더 구조, 의존성, SOLID, Feature-Sliced Design처럼 프론트엔드 코드를 어떻게 나누고 어디에 두는지에 관한 설계 원칙 모음."
tags: ["frontend", "architecture", "design-principles"]
source: mixed
---

프론트엔드 아키텍처는 **코드를 어떤 단위로 나누고, 그 단위들이 서로 어떻게 의존하게 할지**를 정하는 일이다. 컴포넌트 하나를 잘 만드는 것과는 다른 문제다. 화면이 늘어나면 "이 파일을 어디에 두나", "이 훅은 어디까지 알아도 되나"가 되풀이해서 나오고, 그 답이 쌓인 것이 폴더 구조와 의존 규칙이다. 이 주제의 노트는 "의존성 → SOLID → 폴더 구조의 진화 → FSD" 순서로 읽으면 원칙에서 방법론으로 자연스럽게 이어진다.

## 노트

- [프론트엔드에서 의존성 관리하기](Frontend/Architecture/frontend-dependency.md): 의존성은 변경에 노출되는 관계다. 변수 스코프 좁히기, 공용 함수의 의존성 역전, API 응답 대신 도메인 타입에 기대기
- [프론트엔드와 SOLID 원칙](Frontend/Architecture/frontend-solid.md): SRP·OCP·LSP·ISP·DIP를 React 컴포넌트 설계에 옮기기
- [프론트엔드에서 관심사의 분리](Frontend/Architecture/separation-of-concerns.md): 역할 → 컴포넌트 → 컴포넌트 안의 계층으로 바뀐 분리 축, 레이어·모듈·데이터 흐름이라는 관심사의 방향, 시기별로 달라지는 구조
- [프론트엔드 폴더 구조의 진화](Frontend/Architecture/frontend-folder-structure.md): 역할 기반 폴더에서 엔티티·위젯·기능 중심 응집으로. 좋은 구조는 팀의 멘탈 모델과 일치하는 구조
- [프론트엔드 MV* 아키텍처의 흐름: MVC에서 MVI까지](Frontend/Architecture/frontend-mv-architecture.md): MVC → MVVM → Flux → 가벼운 스토어·서버 상태로 이어진 변천과 MVI. 뷰는 의도만 보내고 데이터는 한 방향으로 돈다
- [Feature-Sliced Design](Frontend/Architecture/feature-sliced-design.md): 레이어 → 슬라이스 → 세그먼트 3단계 분할, 위 레이어만 아래를 쓰는 규칙, Public API, Next.js와 함께 쓸 때의 충돌, 레이어 경계 찾기와 점진적 도입

관련 주제: 빌드 도구와 폴더를 처음 잡는 과정은 [React](Frontend/React.md), 테스트로 설계를 이끄는 방법은 [Testing](Frontend/Testing.md)에 있다.
