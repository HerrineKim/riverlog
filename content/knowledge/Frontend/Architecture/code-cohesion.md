---
title: "응집도를 높이는 전략"
concept: "Cohesion"
summary: "응집도는 함께 수정돼야 할 코드가 항상 함께 수정되는지다. 모듈 응집도의 고전적 7단계 분류(기능적~우연적)와 낮은 응집의 신호를 정리하고, 함께 바뀌는 파일을 도메인 디렉토리에 모으고, 매직 넘버를 상수로 묶어 한쪽만 바뀌는 일을 막고, 폼은 변경 단위에 따라 필드 단위 검증과 스키마 기반 폼 전체 검증 중 하나를 고른다."
tags: ["frontend", "clean-code", "architecture", "react", "software-engineering"]
source: other
date: "2026-10-20"
sources: ["https://frontend-fundamentals.com/code-quality/code/", "https://webactually.com/2018/02/06/%eb%aa%85%ed%99%95%ed%95%9c-%ec%bd%94%eb%93%9c-%ec%9e%91%ec%84%b1%eb%b2%95/"]
---

> 토스의 「[Frontend Fundamentals: 코드 품질](https://frontend-fundamentals.com/code-quality/code/)」 응집도 문서들을 바탕으로 재구성한 노트다. 일반 원칙은 Brandon Gregory의 「명확한 코드 작성법」(웹액츄얼리 번역)을, 응집의 종류는 정보처리기사 소프트웨어 설계 범위를 더했다.

## 응집도란

응집도(Cohesion)는 **수정돼야 할 코드가 항상 같이 수정되는지**다. 응집도가 높으면 한 부분을 고쳐도 다른 곳이 몰래 깨지지 않는다. 함께 바뀌어야 할 것이 구조적으로 함께 바뀌게 되어 있기 때문이다.

응집도를 높이려면 보통 공통화·추상화를 해야 하고, 그만큼 가독성이 떨어진다. **함께 안 고치면 오류가 나는 경우에만** 응집도를 우선한다([[changeable-code-criteria|변경하기 쉬운 코드의 네 가지 기준]]).

| 전략 | 묶는 대상 |
| --- | --- |
| 함께 수정되는 파일을 같은 디렉토리에 | 파일 |
| 매직 넘버 없애기 | 값과 그 값에 기대는 코드 |
| 폼의 응집도 생각하기 | 필드와 검증 로직 |

### 응집의 종류

모듈 안의 요소들이 **왜 한데 모였느냐**에 따라 일곱 단계로 나눈다. 위로 갈수록 강하고 좋은 응집이다.

| 순서 | 종류 | 모인 이유 |
| --- | --- | --- |
| 1 (강함) | 기능적 | 모든 요소가 하나의 기능을 위해 수행된다 |
| 2 | 순차적 | 한 활동의 출력이 다음 활동의 입력이 된다 |
| 3 | 교환적(통신적) | 같은 입력·출력을 쓰지만 서로 다른 기능을 한다 |
| 4 | 절차적 | 입출력 연관은 없지만 정해진 순서대로 수행해야 한다 |
| 5 | 시간적 | 같은 시점에 처리된다 (예: 초기화) |
| 6 | 논리적 | 비슷한 성격의 처리라서 모았다 |
| 7 (약함) | 우연적 | 서로 관련이 없다 |

### 낮은 응집의 신호

- 여러 함수가 같은 변수·DOM 참조를 인자로 주고받는다. 한 객체·클래스로 묶고 인스턴스 속성으로 둔다.
- `Common`, `utils`처럼 관련 없는 것을 한데 모은 덩어리가 있다. 정리한 것 같지만 우연적 응집이라 찾기 어렵다. 데이터 접근, 특정 UI 요소처럼 관심사별 모듈로 나눈다.
- 클래스의 속성을 소수의 메서드만 쓰거나, 쓰이지 않는 메서드가 있다.
- 같은 코드가 반복된다. 비슷한 문장은 함수로, 비슷한 함수는 클래스로 묶는다.

응집도를 높이면 결합도는 대개 낮아진다. 둘이 부딪힐 때 무엇을 먼저 챙길지는 [[changeable-code-criteria|변경하기 쉬운 코드의 네 가지 기준]]에 있다.

## 1. 함께 수정되는 파일을 같은 디렉토리에 두기

`components/`, `hooks/`, `utils/`, `constants/`처럼 **모듈 종류로만** 나누면 어떤 파일이 어떤 파일을 쓰는지 구조에서 보이지 않는다. 기능을 지울 때 관련 훅·유틸이 남아 죽은 코드가 되고, 프로젝트가 커지면 한 폴더에 파일이 수백 개 쌓인다.

함께 바뀌는 파일끼리 도메인 디렉토리로 모은다.

```text
src
├─ components   ← 프로젝트 전체에서 쓰는 것
├─ hooks
├─ utils
└─ domains
   ├─ Domain1   ← Domain1에서만 쓰는 것
   │  ├─ components
   │  ├─ hooks
   │  └─ utils
   └─ Domain2
      └─ ...
```

- 다른 도메인을 참조하는 import(`../../../Domain2/hooks/useFoo`)가 눈에 띄어 **잘못된 의존을 바로 알아챈다.** ESLint의 `no-restricted-imports`나 경계 규칙으로 강제할 수도 있다.
- 기능을 없앨 때 **디렉토리 하나를 통째로 지우면** 끝난다.

이 방향을 레이어·슬라이스 규칙으로 체계화한 것이 [[feature-sliced-design|Feature-Sliced Design]]이고, 역할 기반에서 기능 중심으로 옮겨 온 흐름은 [[frontend-folder-structure|프론트엔드 폴더 구조의 진화]]에 있다.

## 2. 매직 넘버 없애기

매직 넘버(magic number)는 뜻을 밝히지 않고 코드에 직접 쓴 숫자다. HTTP 404, 하루 86400초 같은 값이 그렇다.

```ts
async function onLikeClick() {
  await postLike(url);
  await delay(300); // 애니메이션 길이?
  await refetchPostLike();
}
```

`300`이 애니메이션 완료를 기다리는 값이라면, 애니메이션을 바꿀 때 이 숫자는 같이 바뀌지 않는다. 그러면 **서비스가 조용히 깨진다.** 같이 바뀌어야 할 두 값 중 한쪽만 바뀌는 것, 그것이 낮은 응집도다.

```ts
const ANIMATION_DELAY_MS = 300;

async function onLikeClick() {
  await postLike(url);
  await delay(ANIMATION_DELAY_MS);
  await refetchPostLike();
}
```

상수에 이름이 생기면 읽는 사람도 의도를 안다(가독성). 더 나아가 애니메이션 정의와 같은 곳에서 상수를 export해 **값의 출처를 하나로** 두면 한쪽만 바뀔 여지가 사라진다.

## 3. 폼의 응집도 생각하기

폼은 검증 로직을 어디에 묶을지에 따라 두 가지로 나뉜다.

| 방식 | 검증이 사는 곳 | 장점 | 약점 |
| --- | --- | --- | --- |
| 필드 단위 응집 | 각 필드의 `register(name, { validate })` | 필드가 독립적이다. 한 필드를 고쳐도 다른 필드에 영향이 없고 재사용하기 쉽다 | 폼 전체 흐름이 흩어진다 |
| 폼 전체 단위 응집 | 하나의 스키마(Zod 등) + `resolver` | 검증이 한곳에 모여 흐름이 보이고 상태가 중앙에서 관리된다 | 필드끼리 묶여 재사용성이 떨어진다 |

```tsx
// 폼 전체 단위: react-hook-form + Zod 스키마
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
  email: z.email("유효한 이메일 주소를 입력해주세요."),
});

export function Form() {
  const { register, formState: { errors }, handleSubmit } = useForm({
    defaultValues: { name: "", email: "" },
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(submit)}>
      <input {...register("name")} placeholder="이름" />
      {errors.name && <p>{errors.name.message}</p>}
      <input {...register("email")} placeholder="이메일" />
      {errors.email && <p>{errors.email.message}</p>}
      <button type="submit">제출</button>
    </form>
  );
}
```

Zod 4부터 이메일 같은 문자열 형식 검증은 `z.email()`처럼 최상위 함수로 쓰고, `z.string().email()`은 더 이상 권장되지 않는다.

**변경의 단위가 필드인지 폼인지**로 고른다.

| 필드 단위가 맞을 때 | 폼 전체 단위가 맞을 때 |
| --- | --- |
| 필드마다 복잡하거나 비동기인 검증(아이디 중복 확인, 추천 코드 확인) | 모든 필드가 하나의 기능을 이룬다(결제 정보, 배송 정보) |
| 같은 필드와 검증을 다른 폼에서도 쓴다 | 이전 단계 입력이 다음 단계에 영향을 주는 단계별 폼(회원가입, 설문) |
| | 필드끼리 서로 참조한다(비밀번호 확인, 총액 계산) |

## 정리

- 응집도는 "같이 바뀌어야 할 것이 같이 바뀌게 되어 있는가"다.
- 파일은 종류가 아니라 **함께 바뀌는 단위**로 모은다. 지울 때 폴더째 지울 수 있으면 잘 모인 것이다.
- 의미 있는 숫자는 이름 붙인 상수로, 가능하면 그 값을 정의하는 쪽과 한곳에 둔다.
- 폼 검증은 변경 단위에 맞춰 필드 단위와 스키마 기반 폼 단위 중 고른다.

관련 노트: [[software-engineering|소프트웨어 설계와 공학]], [[changeable-code-criteria|변경하기 쉬운 코드의 네 가지 기준]], [[code-coupling|결합도를 낮추는 전략]], [[frontend-folder-structure|프론트엔드 폴더 구조의 진화]], [[feature-sliced-design|Feature-Sliced Design]], [[forms|폼과 제어 컴포넌트]]
