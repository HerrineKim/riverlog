---
title: "Feature-Sliced Design"
concept: "FSD"
summary: "프론트엔드 코드를 레이어 → 슬라이스 → 세그먼트 3단계로 나누고, 위 레이어만 아래 레이어를 쓰게 하며, 슬라이스는 Public API로만 드나들게 하는 아키텍처 방법론. 구조, 규칙, 다른 구조와의 비교, Next.js와 함께 쓸 때의 충돌, 그리고 레이어 경계를 정하고 점진적으로 도입하는 법을 정리한다."
tags: ["frontend", "architecture", "design", "react"]
source: other
date: "2026-10-12"
sources: ["https://dev.to/m_midas/feature-sliced-design-the-best-frontend-architecture-4noj", "https://feature-sliced.design/", "https://velog.io/@teo/fsd", "https://feature-sliced.design/docs/guides/tech/with-nextjs"]
---

> Yan Levin의 글 「[Feature-Sliced Design: The Best Frontend Architecture](https://dev.to/m_midas/feature-sliced-design-the-best-frontend-architecture-4noj)」(2023.07), 테오(teo)의 「[FSD 관점으로 바라보는 코드 경계 찾기](https://velog.io/@teo/fsd)」(2024.11), [FSD 공식 문서](https://feature-sliced.design/)를 바탕으로 재구성한 노트다.

## Feature-Sliced Design이란

**Feature-Sliced Design(FSD)은** 프론트엔드 코드를 **비즈니스 기준**으로 쪼개는 아키텍처 방법론이다. 목표는 모듈 사이의 낮은 결합도와 높은 응집도, 그리고 커져도 무너지지 않는 구조다. 특정 프레임워크에 묶이지 않는다.

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

레이어는 최대 7개로 이름이 정해져 있다. 모두 쓸 필요는 없고, 대부분의 프로젝트는 최소 `shared`·`pages`·`app`을 두며 나머지는 값을 할 때 더한다. 새 레이어를 만들지는 않는다. 위에 있을수록 비즈니스에 가깝고, 아래로 갈수록 추상적이고 재사용성이 높다.

| 레이어 | 맡는 일 | 판단 감각 | 예시 |
| --- | --- | --- | --- |
| `app` | 앱 진입점, 초기화 | 이 프로젝트에서만 쓰는 공용 | 프로바이더, 라우터, 전역 스타일 |
| `processes` | 여러 페이지에 걸친 흐름. **deprecated**, 내용은 `features`와 `app`으로 옮긴다 | — | 여러 단계의 회원 가입 |
| `pages` | 페이지 | 경로 단위 화면 | 홈, 상품 상세 |
| `widgets` | 페이지에 놓이는 독립된 UI 덩어리 | 떼어 붙여도 어색하지 않은 블록. 직접 로직 없이 조립만 한다 | 헤더, 피드 |
| `features` | 비즈니스 가치가 있는 사용자 행동 (선택) | 쓰기, 상태 변경. **기능 하나 = 주된 사용자 행동 하나** | 좋아요, 리뷰 쓰기 |
| `entities` | 비즈니스 엔티티 (선택) | 읽기, 데이터 원본, 순수 함수. 상태와 부수 효과가 없다 | 사용자, 리뷰, 댓글 |
| `shared` | 비즈니스와 무관한 재사용 코드 | 다른 프로젝트에서도 쓸 수 있는 공용 | UI 키트, axios 설정, debounce |

핵심 규칙은 하나다. **레이어는 자기보다 아래 레이어만 가져다 쓴다.** `entities`는 `features`를 쓸 수 없고, `features`는 `widgets`를 쓸 수 없다. 그래서 **아래 레이어일수록 고치기 위험하다.** `shared`의 UI 키트는 어디서나 쓰이기 때문이다.

## 슬라이스와 세그먼트

**슬라이스**는 레이어 안의 두 번째 단계로, 이름은 프로젝트의 도메인이 정한다(SNS라면 `post`, `user`, `newsfeed`). 밀접한 슬라이스는 폴더로 묶어도 되지만, 묶인 슬라이스끼리도 **서로의 내부를 공유하지 않는다.**

**세그먼트**는 슬라이스 안을 코드의 용도별로 나눈다.

| 세그먼트 | 내용 |
| --- | --- |
| `api` | 서버 요청 |
| `ui` | 슬라이스의 UI 컴포넌트 |
| `model` | 비즈니스 로직, 상태. **인자에 도메인 타입이 들어가면 model** |
| `lib` | 슬라이스 안에서만 쓰는 보조 함수. 도메인을 모르면 lib |
| `config`, `consts` | 설정, 상수 |

```ts
const addProductToCart = (cart: Cart, product: Product) => [...cart, product]; // model
const addItem = <T,>(arr: T[], item: T) => [...arr, item];                     // lib
```

## Public API: index 파일로만 드나든다

슬라이스마다 `index.ts`를 두고 **밖에 보여 줄 것만 export한다.** 바깥은 Public API에 있는 것만 가져다 쓰고, 내부 구조를 바꿔도 index만 유지하면 바깥의 import를 고칠 필요가 없다.

```ts
// features/like-post/index.ts
export { LikeButton } from './ui/LikeButton';
export { useLikePost } from './model/useLikePost';
// api/ 내부 함수는 export하지 않는다
```

## 다른 구조와 비교

| 구조 | 장점 | 단점 | 어울리는 곳 |
| --- | --- | --- | --- |
| 클래식 (`components/`, `hooks/`, `utils/` …) | 단순해서 시작하기 쉽다 | 컴포넌트 사이 연결이 암묵적이고, 오래될수록 엉킨다 | 작은 프로젝트, 토이 프로젝트 |
| 단순 모듈 구조 | 빠르게 시작한다 | 어느 모듈에 넣을지 애매하고, 모듈끼리 쓰기 어렵고, 전역 함수로 의존이 숨는다 | MVP, 수명이 짧은 프로젝트 |
| FSD | 연결이 명시적이라 부작용이 적고, 표준화돼 있고, 기술 스택과 무관하게 확장된다. 구성 요소를 쉽게 더하고 뺀다 | 진입 장벽이 높고, 팀 전체가 규칙을 이해하고 지켜야 한다. 규칙 위반이 바로 드러나 즉시 풀어야 한다 | 중간 이상 복잡도, 오래 유지할 프로젝트 |

규칙을 어긴 코드가 **바로 눈에 띈다**는 점은 단점이자 장점이다. 문제를 나중이 아니라 지금 풀게 만든다.

## Next.js와 함께 쓸 때

Next.js의 `app/`(App Router)·`pages/`(Pages Router) 폴더는 라우팅을 맡아 FSD의 `app`·`pages` 레이어와 이름이 겹친다. 공식 가이드의 해법은 이렇다.

| 항목 | 방법 |
| --- | --- |
| 이름 충돌 | FSD 쪽 레이어를 `_app`, `_pages`로 바꾼다. Next.js 라우팅 폴더는 프로젝트 루트에 두면 FSD 레이어와 구분되어 편하지만 필수는 아니고, `src/` 안에 함께 둬도 된다 |
| 라우트 파일 | `app/example/page.tsx`(또는 `pages/example/index.tsx`)는 `_pages`의 페이지를 다시 export만 한다 |
| API 라우트 | 구현은 `_app/api-routes/`에 두고 `app/api/…`(또는 `pages/api/…`)에서 다시 export한다 |
| 서버 전용 코드 | 한 슬라이스에 서버·클라이언트 코드가 섞이면 `index.server.ts`로 서버 전용 export를 분리해 클라이언트 번들로 새지 않게 한다 |
| DB 쿼리 | `shared`의 `db` 세그먼트에 두고, 캐싱·재검증 로직을 쿼리 옆에 둔다 |

## 경계 찾기와 점진적 도입

처음 도입하면 "이건 entity인가 feature인가"에서 막힌다. 공식 문서도 딱 맞는 답을 주지 않는다. 그래서 경계는 규칙이 아니라 이미 아는 경계에서 출발한다.

| 원칙 | 내용 |
| --- | --- |
| 아는 경계부터 | 순수 UI와 도메인 컴포넌트, 상태를 바꾸는 훅과 계산만 하는 함수, 서버 상태와 클라이언트 상태, `데이터 → 화면 → 행동 → 데이터` 흐름의 경계로 먼저 나눈다 |
| 일관성이 정확성보다 | 무지개의 빨강과 주황 사이는 정확히 긋기 어렵지만 7색이라는 이름이 있어 7색을 본다. **한번 정한 기준을 일관되게 지키는 것**이 중요하다 |
| 이름은 조합으로 예측 | REST가 `HTTP 메서드 + 리소스`로 API를 예측 가능하게 했듯, `레이어 + 슬라이스 + 세그먼트`를 조합한다. `features/cart/ui`만 보고 "장바구니 행동 UI"를 떠올린다. 그래서 **레이어·세그먼트 이름은 바꾸거나 늘리지 않는다** |
| props 규칙 | `shared/ui`만 이벤트 핸들러·스타일·설정 props를 받는다. 나머지는 **도메인 데이터만** 받고 핸들러는 안에서 훅으로 처리한다. `onAddToCart`를 props로 받는 feature는 책임이 밖으로 샌 것이다 |

| 단계 | 구조 |
| --- | --- |
| 처음 | `app/config`, `shared/ui·lib`, `pages/ui·model·api`만 |
| 도메인 패턴이 보이면 | 읽기·계산 중심이면 `entities`, 이벤트 핸들러가 2~3개로 늘어난 행동이면 `features` |
| 조합이 커지면 | 여러 feature·entity를 묶어 `widgets` |
| 독립 구조가 필요하면 | 새 `app`이나 페이지 안의 중첩 FSD |

프로젝트 시기·성격(관리자 콘솔, 앱형, 대형 웹사이트형)에 따라 어떤 레이어를 많이 쓰는지는 [[frontend-folder-structure#프로젝트 시기·성격에 맞게 변용하기|프론트엔드 폴더 구조의 진화]]에 정리했다.

## 정리

- 코드는 레이어(표준) → 슬라이스(도메인) → 세그먼트(용도)로 나눈다.
- **위 레이어만 아래 레이어를 쓴다.** 아래 레이어일수록 많이 쓰이니 신중히 고친다.
- 슬라이스는 `index.ts` Public API로만 드나든다.
- 경계가 애매하면 이미 아는 경계로 먼저 나누고, 처음부터 모든 레이어를 만들지 않는다.
- 작은 프로젝트·MVP에는 과하다. 도입 전에 팀 규모와 프로젝트 수명에 맞는지부터 따진다.

관련 노트: [[frontend-dependency|프론트엔드에서 의존성 관리하기]], [[frontend-solid|프론트엔드와 SOLID 원칙]], [[nextjs-app-router|Next.js App Router의 내비게이션과 데이터 가져오기]], [[frontend-folder-structure|프론트엔드 폴더 구조의 진화]], [[separation-of-concerns|프론트엔드에서 관심사의 분리]]
