---
title: "Feature-Sliced Design"
concept: "FSD"
summary: "프론트엔드 코드를 레이어 → 슬라이스 → 세그먼트 3단계로 나누고, 위 레이어만 아래 레이어를 쓰게 하며, 슬라이스는 Public API로만 드나들게 하는 아키텍처 방법론. 구조, 규칙, 다른 구조와의 비교, Next.js와 함께 쓸 때의 충돌을 정리한다."
tags: ["frontend", "architecture", "design", "react"]
source: other
date: "2026-10-12"
sources: ["https://dev.to/m_midas/feature-sliced-design-the-best-frontend-architecture-4noj", "https://feature-sliced.design/"]
---

> Yan Levin의 글 「[Feature-Sliced Design: The Best Frontend Architecture](https://dev.to/m_midas/feature-sliced-design-the-best-frontend-architecture-4noj)」(2023.07)을 요약·재구성한 노트입니다. 2023년 글이라 레이어 구성이나 Next.js 관련 내용은 [공식 문서](https://feature-sliced.design/) 기준으로 바뀌었을 수 있습니다.

## Feature-Sliced Design이란

**Feature-Sliced Design(FSD)은** 프론트엔드 코드를 **비즈니스 기준**으로 쪼개는 아키텍처 방법론이다. 목표는 모듈 사이의 낮은 결합도와 높은 응집도, 그리고 커져도 무너지지 않는 구조다. 특정 프레임워크에 묶이지 않는다.

코드는 세 단계로 나눈다.

```text
src/
├── app/                  ← 레이어 (Layer): 표준화된 최상위 폴더
├── pages/
├── widgets/
├── features/
│   └── like-post/        ← 슬라이스 (Slice): 비즈니스 도메인별 폴더
│       ├── api/          ← 세그먼트 (Segment): 용도별 폴더
│       ├── ui/
│       ├── model/
│       └── index.ts      ← Public API
├── entities/
└── shared/
```

## 레이어: 위에서 아래로만 의존한다

레이어는 최대 7개로 이름이 정해져 있고, 일부는 선택이다. 위에 있을수록 비즈니스에 가깝고, 아래로 갈수록 추상적이고 재사용성이 높다.

| 레이어 | 맡는 일 | 예시 |
| --- | --- | --- |
| `app` | 앱 진입점. 초기화 | 프로바이더, 라우터, 전역 스타일, 전역 타입 |
| `processes` | 여러 페이지에 걸친 흐름 (선택, 원문 시점에도 deprecated) | 여러 단계의 회원 가입 |
| `pages` | 페이지 | 홈, 상품 상세 |
| `widgets` | 페이지에 놓이는 독립된 UI 덩어리 | 헤더, 피드 |
| `features` | 비즈니스 가치가 있는 사용자 행동 (선택) | 좋아요, 리뷰 쓰기, 평점 매기기 |
| `entities` | 비즈니스 엔티티 (선택) | 사용자, 리뷰, 댓글 |
| `shared` | 비즈니스와 무관한 재사용 코드 | UI 키트, axios 설정, 앱 설정, 헬퍼 |

핵심 규칙은 하나다. **레이어는 자기보다 아래 레이어만 가져다 쓴다.** `entities`는 `features`를 쓸 수 없고, `features`는 `widgets`를 쓸 수 없다. 의존 방향이 한쪽으로만 흐른다.

그래서 **아래 레이어일수록 고치기 위험하다.** `shared`의 UI 키트는 `features`·`widgets`·`pages` 어디서나 쓰이기 때문이다.

## 슬라이스: 비즈니스 도메인으로 묶는다

슬라이스는 레이어 안의 두 번째 단계다. 이름은 표준이 없고 프로젝트의 도메인이 정한다.

| 서비스 | 슬라이스 예 |
| --- | --- |
| 사진 갤러리 | `photo`, `album`, `gallery` |
| SNS | `post`, `user`, `newsfeed` |

밀접한 슬라이스는 폴더로 묶어도 되지만, 묶인 슬라이스끼리도 **서로의 내부를 공유하지 않는다.**

## 세그먼트: 용도로 나눈다

슬라이스 안은 코드의 역할별로 나눈다. 구성과 이름은 팀이 정하되, 흔히 쓰는 것은 다음과 같다.

| 세그먼트 | 내용 |
| --- | --- |
| `api` | 서버 요청 |
| `ui` | 슬라이스의 UI 컴포넌트 |
| `model` | 비즈니스 로직, 상태(액션·셀렉터 등) |
| `lib` | 슬라이스 안에서만 쓰는 보조 함수 |
| `config` | 슬라이스 설정 (드묾) |
| `consts` | 상수 |

## Public API: index 파일로만 드나든다

슬라이스와 세그먼트마다 `index.ts`를 두고, **밖에 보여 줄 것만 export한다.**

- 바깥은 Public API에 있는 것만 가져다 쓴다.
- Public API에 없는 내부 코드는 그 슬라이스·세그먼트 안에서만 쓴다.
- 내부 구조를 바꿔도 index만 유지하면 바깥의 import를 고칠 필요가 없다.

```ts
// features/like-post/index.ts
export { LikeButton } from './ui/LikeButton';
export { useLikePost } from './model/useLikePost';
// api/ 내부 함수는 export하지 않는다
```

## OOP 원칙과의 대응

글쓴이는 FSD가 OOP의 네 원칙을 프론트엔드 폴더 구조로 옮긴 것이라고 본다.

| OOP 원칙 | FSD에서 |
| --- | --- |
| 추상화·다형성 | 아래 레이어는 추상적이라 위 레이어에서 props·파라미터에 따라 다르게 재사용된다 |
| 캡슐화 | Public API가 슬라이스 내부를 숨긴다 |
| 상속 | 위 레이어가 아래 레이어를 재사용한다 |

## 다른 구조와 비교

| 구조 | 장점 | 단점 | 어울리는 곳 |
| --- | --- | --- | --- |
| 클래식 (`components/`, `hooks/`, `utils/` …) | 단순해서 튜토리얼에 많이 쓰인다 | 컴포넌트 사이 연결이 암묵적이고, 오래될수록 엉킨다 | 작은 프로젝트, 유지보수 없는 토이 프로젝트 |
| 단순 모듈 구조 | 빠르게 시작한다 | 어느 모듈에 넣을지 애매하고, 모듈끼리 쓰기 어렵고, 비즈니스 엔티티 둘 곳이 없고, 전역 함수로 의존이 숨는다 | MVP, 수명이 짧은 프로젝트 |
| FSD | 연결이 명시적이고, 표준화돼 있고, 확장된다 | 진입 장벽이 높다 | 중간 이상 복잡도의 프로젝트 |

FSD에서는 규칙을 어긴 코드가 **바로 눈에 띈다.** 문제를 나중이 아니라 지금 풀어야 하는데, 글쓴이는 이것을 단점이자 장점으로 본다.

## Next.js와 함께 쓸 때

원문은 Pages Router 기준으로 두 군데 충돌을 짚는다.

| 충돌 | 내용 | 해결 |
| --- | --- | --- |
| `pages` | Next.js의 `pages`는 파일 라우팅, FSD의 `pages`는 페이지 레이어 | ① Next.js 라우트는 루트 `pages/`, FSD 레이어는 `src/pages/`에 둔다 (글쓴이 선호) ② FSD 쪽을 `pages-flat` 같은 이름으로 바꾸고 Next.js `pages`에서 다시 export한다 |
| `app` | 앱 초기화를 Next.js가 대부분 맡는다 | 앱 전체에 걸 것이 있으면 Layout 패턴을 쓴다 |

App Router에서는 `app/` 폴더가 라우팅을 맡으므로 FSD의 `app` 레이어와 이름이 겹친다. 원문 이후의 일이라 이 부분은 공식 문서의 Next.js 가이드를 따로 확인한다.

## 장단점

| 장점 | 단점 |
| --- | --- |
| 구성 요소를 쉽게 바꾸고 더하고 뺄 수 있다 | 다른 구조보다 진입 장벽이 높다 |
| 구조가 표준화돼 있다 | 팀 전체가 개념을 이해하고 지키는 문화가 필요하다 |
| 확장성이 좋고 기술 스택에 독립적이다 | 규칙 위반이 바로 드러나 즉시 풀어야 한다 |
| 모듈 사이 연결이 명시적이라 예상 못 한 부작용이 적다 | |

## 정리

- 코드는 레이어(표준) → 슬라이스(도메인) → 세그먼트(용도)로 나눈다.
- **위 레이어만 아래 레이어를 쓴다.** 아래 레이어일수록 많이 쓰이니 신중히 고친다.
- 슬라이스는 `index.ts` Public API로만 드나든다.
- 작은 프로젝트·MVP에는 과하고, 오래 유지할 중간 이상 규모에서 값을 한다. 팀이 규칙을 함께 지켜야 효과가 난다.
- "The Best"라는 제목은 글쓴이의 주장이다. 도입 전에는 팀 규모와 프로젝트 수명에 맞는지부터 따진다.

관련 노트: [[frontend-dependency|프론트엔드에서 의존성 관리하기]], [[frontend-solid|프론트엔드와 SOLID 원칙]], [[nextjs-app-router|Next.js App Router의 내비게이션과 데이터 가져오기]], [[frontend-folder-structure|프론트엔드 폴더 구조의 진화]]
