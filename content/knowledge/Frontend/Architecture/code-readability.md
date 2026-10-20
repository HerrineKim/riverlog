---
title: "가독성을 높이는 전략"
concept: "Readability"
summary: "읽기 좋은 코드는 한 번에 고려할 맥락이 적고, 위에서 아래로 읽히고, 시각적 배치와 의미적 묶음이 일치한다. 같이 실행되지 않는 코드 분리, 구현 상세 추상화, 로직 종류별 함수 쪼개기로 맥락을 줄이고, 복잡한 조건·매직 넘버에 이름을 붙이고, 시점 이동과 중첩 삼항을 줄이고, 게슈탈트 법칙(근접성·공통 영역·유사성·연속성·폐쇄성)으로 빈 줄·주석·배치·이름을 점검한다."
tags: ["frontend", "clean-code", "react", "code-review", "javascript"]
source: other
date: "2026-10-20"
sources: ["https://frontend-fundamentals.com/code-quality/code/", "https://velog.io/@teo/cleancode"]
---

> 토스의 「[Frontend Fundamentals: 코드 품질](https://frontend-fundamentals.com/code-quality/code/)」 가독성 문서들을 바탕으로 재구성한 노트다. 「시각적 배치와 게슈탈트 법칙」은 테오(teo)의 「[게슈탈트 법칙으로 이해하는 클린코드: 가독성의 비밀](https://velog.io/@teo/cleancode)」(2024.07)로 보강했다.

## 가독성이란

가독성(Readability)은 코드가 읽기 쉬운 정도다. 코드를 고치려면 먼저 무엇을 하는지 이해해야 하므로, 변경하기 쉬운 코드의 첫 조건이다([[changeable-code-criteria|변경하기 쉬운 코드의 네 가지 기준]]).

기준은 쓴 사람이 아니라 **읽는 사람**이다. 한번 알게 된 것은 모르는 상태로 돌아가 상상하기 어려워서(지식의 저주, curse of knowledge) 내 이름과 구조가 남에게도 명확하다고 착각하기 쉽다. 코드 리뷰, 팀 컨벤션, 자동화된 테스트는 이 편향을 깨는 장치다.

사람이 작업 기억에 한 번에 붙잡아 둘 수 있는 정보는 대략 4~7개다. 그래서 읽기 좋은 코드는 **한 번에 고려할 맥락이 적고, 위에서 아래로 자연스럽게 이어진다.**

| 전략 | 방법 |
| --- | --- |
| 맥락 줄이기 | 같이 실행되지 않는 코드 분리, 구현 상세 추상화, 로직 종류별로 합쳐진 함수 쪼개기 |
| 이름 붙이기 | 복잡한 조건, 매직 넘버 |
| 위에서 아래로 읽히게 | 시점 이동 줄이기, 삼항 연산자 단순하게, 범위 조건을 왼쪽에서 오른쪽으로 |
| 배치와 의미 맞추기 | 빈 줄·주석으로 의미 경계 표시, 관련된 것만 한 영역에, 같은 접두어는 같은 역할 |

## 1. 맥락 줄이기

### 같이 실행되지 않는 코드 분리하기

동시에 실행되지 않는 분기가 한 컴포넌트에 섞이면, 읽는 사람이 모든 경우를 한꺼번에 머릿속에 들고 있어야 한다.

```tsx
// ✗ viewer일 때와 아닐 때의 코드가 useEffect와 JSX 곳곳에 교차한다
function SubmitButton() {
  const isViewer = useRole() === "viewer";
  useEffect(() => {
    if (isViewer) return;
    showButtonAnimation();
  }, [isViewer]);
  return isViewer ? <TextButton disabled>Submit</TextButton> : <Button type="submit">Submit</Button>;
}

// ✓ 분기는 한 번만, 각 컴포넌트는 한 경우만 다룬다
function SubmitButton() {
  const isViewer = useRole() === "viewer";
  return isViewer ? <ViewerSubmitButton /> : <AdminSubmitButton />;
}

function AdminSubmitButton() {
  useEffect(() => {
    showButtonAnimation();
  }, []);
  return <Button type="submit">Submit</Button>;
}
```

### 구현 상세 추상화하기

추상화는 글의 단어와 같다. "왼쪽으로 10걸음 걸어라"를 "북쪽을 바라봤을 때 한 회전의 360분의 90만큼…"처럼 풀어 쓰면 아무도 못 읽는다. 코드도 구현 상세를 다 드러내면 **역할이 안 보인다.**

로그인 페이지가 "이미 로그인했으면 홈으로 보내기" 로직까지 들고 있으면, `useCheckLogin`·`onChecked`·`"LOGGED_IN"`을 다 읽어야 페이지의 본래 역할에 닿는다. 이 로직을 Wrapper 컴포넌트로 빼면 페이지는 로그인 UI만 남는다.

```tsx
function App() {
  return (
    <AuthGuard>
      <LoginStartPage />
    </AuthGuard>
  );
}

function AuthGuard({ children }) {
  const status = useCheckLoginStatus();
  useEffect(() => {
    if (status === "LOGGED_IN") location.href = "/home";
  }, [status]);
  return status !== "LOGGED_IN" ? children : null;
}
```

같은 일을 HOC(`withAuthGuard(LoginStartPage)`)로도 할 수 있다. 다만 지금 React에서는 트리에서 구조가 그대로 보이는 Wrapper 컴포넌트나 커스텀 훅이 더 흔하다. 분리한 로직끼리 서로 참조하지 못하게 되어 불필요한 의존도 막힌다.

버튼과 그 클릭 로직(확인 다이얼로그 → 푸시 발송)이 페이지 컴포넌트 위아래로 멀리 떨어져 있을 때도 `<InviteButton />`처럼 **버튼과 로직을 한 컴포넌트로** 묶는다. 페이지는 맥락이 줄고, 함께 바뀌는 버튼과 핸들러가 붙어 있게 되어 응집도도 오른다.

### 로직 종류에 따라 합쳐진 함수 쪼개기

"쿼리 파라미터 전부", "API 호출 전부"처럼 **로직의 종류**로 훅·함수를 만들면, 책임이 끝없이 늘어난다. 새 파라미터가 생기면 무의식적으로 그 훅에 넣게 되고, 훅은 길어지고 이름은 아무것도 말해 주지 않는다. 쪼개는 방법과 결합도·성능 관점은 [[code-coupling|결합도를 낮추는 전략]]의 「책임을 하나씩 관리하기」에 있다.

## 2. 이름 붙이기

### 복잡한 조건에 이름 붙이기

```ts
// ✗ filter·some·&&가 겹겹이 중첩돼 조건을 따라가야 한다
const result = products.filter((product) =>
  product.categories.some(
    (category) =>
      category.id === targetCategory.id &&
      product.prices.some((price) => price >= minPrice && price <= maxPrice)
  )
);

// ✓ 조건에 이름을 붙이면 의도가 문장처럼 읽힌다
const matchedProducts = products.filter((product) =>
  product.categories.some((category) => {
    const isSameCategory = category.id === targetCategory.id;
    const isPriceInRange = product.prices.some((price) => minPrice <= price && price <= maxPrice);
    return isSameCategory && isPriceInRange;
  })
);
```

| 이름을 붙이면 좋을 때 | 붙이지 않아도 될 때 |
| --- | --- |
| 로직이 복잡해 여러 줄에 걸친다 | `arr.map(x => x * 2)`처럼 간단하다 |
| 여러 곳에서 재사용한다 | 한 번만 쓰이고 복잡하지 않다 |
| 따로 단위 테스트하고 싶다 | |

불리언 이름 짓는 규칙은 [[boolean-naming|불리언 변수 이름 짓기]]에 있다.

### 매직 넘버에 이름 붙이기

매직 넘버(magic number)는 뜻을 밝히지 않고 코드에 직접 넣은 숫자다. `await delay(300)`만 보면 애니메이션을 기다리는지, 서버 반영을 기다리는지, 지우지 않은 테스트 코드인지 알 수 없다. `ANIMATION_DELAY_MS`처럼 상수로 이름을 붙인다. 매직 넘버는 응집도 문제이기도 하다. 자세한 내용은 [[code-cohesion|응집도를 높이는 전략]]에 있다.

## 3. 위에서 아래로 읽히게 하기

### 시점 이동 줄이기

코드를 위아래로 오가거나 여러 파일·함수·변수를 넘나들며 읽는 것을 **시점 이동**이라 한다. 버튼이 왜 비활성인지 알려고 `policy.canInvite` → `getPolicyByRole()` → `POLICY_SET`을 차례로 찾아가야 한다면 세 번 이동한 것이다.

권한 체계가 단순하면 그 추상화가 오히려 방해다. 조건을 한 컴포넌트 안에서 보이게 한다.

```tsx
// A. 요구사항 그대로 펼친다: switch (user.role)로 역할별 JSX를 반환
// B. 한눈에 보이는 객체로 둔다
function Page() {
  const user = useUser();
  const policy = {
    admin: { canInvite: true, canView: true },
    viewer: { canInvite: false, canView: true },
  }[user.role];

  return (
    <div>
      <Button disabled={!policy.canInvite}>Invite</Button>
      <Button disabled={!policy.canView}>View</Button>
    </div>
  );
}
```

권한 종류가 많고 복잡해질 때 비로소 별도 정책 모듈로 뺀다.

### 삼항 연산자 단순하게 하기

삼항 연산자를 중첩하면 조건의 구조가 사라진다. `if`로 풀고 조기 반환한다.

```ts
// ✗
const status = A && B ? "BOTH" : A || B ? (A ? "A" : "B") : "NONE";

// ✓
const status = (() => {
  if (A && B) return "BOTH";
  if (A) return "A";
  if (B) return "B";
  return "NONE";
})();
```

### 범위 조건은 왼쪽에서 오른쪽으로

`a >= b && a <= c`는 가운데 값 `a`를 두 번 기준점으로 삼아야 한다. 수학의 부등식 `b ≤ a ≤ c`처럼 **작은 값에서 큰 값 순서**로 쓰면 범위가 한눈에 보인다.

```ts
if (80 <= score && score <= 100) { /* 우수 */ }
if (minPrice <= price && price <= maxPrice) { /* 적정 가격 */ }
```

## 4. 시각적 배치와 게슈탈트 법칙

사람은 글자를 하나씩 읽지 않고 단어·문장 단위의 **패턴**으로 읽는다. 코드도 같아서 **시각적 배치와 의미적 묶음이 일치해야** 읽힌다. 이 일치를 점검하는 틀로 시지각 이론인 게슈탈트 법칙을 쓴다.

| 법칙 | 지각 원리 | 코드에서 |
| --- | --- | --- |
| 근접성(Proximity) | 가까이 있는 것은 한 묶음으로 보인다 | 빈 줄로 의미 단위를 가른다 |
| 공통 영역(Common Region) | 같은 영역 안의 것은 한 그룹이다 | 함수·블록·주석 레이블 안에는 관련된 것만 둔다 |
| 유사성(Similarity) | 비슷하게 생긴 것은 같은 종류다 | `use*`는 훅, `handle*`은 이벤트 핸들러라는 약속을 지킨다. 문자열 변환 함수에 `handle*`을 붙이면 핸들러로 오해된다 |
| 연속성(Continuation) | 이어진 것은 하나의 흐름이다 | 데이터 흐름 순서대로 배치한다 |
| 폐쇄성(Closure) | 일부가 비어도 전체 형태를 알아본다 | 이름에 모든 정보를 넣지 않는다. `calculateTotalPriceOfAllItemsInTheShoppingCart`보다 형태를 알아볼 만큼만 |

### 빈 줄과 주석

들여쓰기·공백·따옴표는 포매터에 맡긴다([[eslint-prettier|ESLint와 Prettier 설정]]). 포매터가 못 하는 것은 **빈 줄과 주석**이다. 어디가 의미의 경계인지는 사람만 안다. 정말로 같은 것끼리만 붙이고, 다른 것 사이에 간격을 둔다.

```js
const processOrder = (items, discountCode) => {
  // 소계
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  // 세금 포함 총액
  const total = subtotal * (1 + TAX_RATE);

  // 할인
  const rate = DISCOUNTS[discountCode] ?? 0;
  return round2(total * (1 - rate));
};
```

### 역할로 묶을까, 로직으로 묶을까

| 방식 | 배치 | 장점 | 약점 |
| --- | --- | --- | --- |
| 역할 기준 | 훅 → 계산 값 → 핸들러 → 이펙트 | 각 블록의 정체가 분명하다 | 한 기능을 보려면 블록 사이를 오간다 |
| 로직 기준 | 카운트 관련 → 데이터 페칭 관련 | 흐름을 따라 읽고 디버깅하기 쉽다 | 길어지면 묶음이 시각적으로 흐려진다 |

둘은 배타적이지 않다. **로직 단위로 커스텀 훅을 만들어 공통 영역을 주고, 컴포넌트 본문은 그 훅을 흐름 순서대로 부르면** 둘 다 만족한다.

```tsx
function Profile() {
  const token = useToken();
  const userInfo = useUserInfo(token);
  return <UserView token={token} userInfo={userInfo} />;
}
```

함수·변수 이름 짓는 구체적인 규칙은 [[clean-code-functions-naming|클린 코드: 함수와 이름]]에 있다.

## 정리

- 가독성의 핵심은 **한 번에 들고 있어야 하는 맥락의 수**이고, 기준은 읽는 사람이다.
- 동시에 실행되지 않는 분기는 컴포넌트를 나누고, 페이지의 본래 역할이 아닌 로직은 Wrapper·훅·작은 컴포넌트로 뺀다.
- 복잡한 조건과 의미 있는 숫자에는 이름을 붙인다. 간단한 것은 그대로 둔다.
- 추상화가 시점 이동만 늘린다면 펼쳐 쓰는 편이 낫다.
- 중첩 삼항은 `if`로, 범위 조건은 부등식 순서로 쓴다.
- 시각적 배치와 의미적 묶음을 맞춘다. 모양은 포매터에, 의미 경계는 빈 줄과 주석에, 흐름은 로직별 커스텀 훅에 맡긴다.

관련 노트: [[changeable-code-criteria|변경하기 쉬운 코드의 네 가지 기준]], [[code-coupling|결합도를 낮추는 전략]], [[clean-code-functions-naming|클린 코드: 함수와 이름]], [[abstraction-layers|추상화 계층과 데이터 흐름]], [[principles|코드 리뷰 원칙과 체크리스트]], [[separation-of-concerns|프론트엔드에서 관심사의 분리]]
