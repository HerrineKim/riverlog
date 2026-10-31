---
title: "결합도를 낮추는 전략"
concept: "Coupling"
summary: "결합도는 코드를 고쳤을 때 영향이 미치는 범위다. 모듈 결합도의 고전적 6단계 분류(자료~내용)와 높은 결합의 신호를 정리하고, 페이지 전체 쿼리 파라미터를 한 훅에 몰지 않고 책임별로 쪼개고, 앞으로 갈라질 수 있는 코드는 중복을 허용하고, Props Drilling은 조합(children) 패턴으로 먼저 풀고 마지막에 Context를 쓴다. 앱 규모에서는 기능 모듈이 서로를 부르지 않고 퍼사드(샌드박스)와 중재자(앱 코어)를 거치게 한다."
tags: ["frontend", "clean-code", "architecture", "react", "software-engineering"]
source: other
date: "2026-10-21"
sources: ["https://frontend-fundamentals.com/code-quality/code/", "https://webactually.com/2018/02/06/%eb%aa%85%ed%99%95%ed%95%9c-%ec%bd%94%eb%93%9c-%ec%9e%91%ec%84%b1%eb%b2%95/", "https://addyosmani.com/largescalejavascript/"]
---

> 토스의 「[Frontend Fundamentals: 코드 품질](https://frontend-fundamentals.com/code-quality/code/)」 결합도 문서들을 바탕으로 재구성한 노트다. 일반 원칙은 Brandon Gregory의 「명확한 코드 작성법」(웹액츄얼리 번역)을, 결합의 종류는 정보처리기사 소프트웨어 설계 범위를 더했다. 중재자·퍼사드로 모듈을 떼는 구조는 Addy Osmani의 「[Patterns For Large-Scale JavaScript Application Architecture](https://addyosmani.com/largescalejavascript/)」를 바탕으로 더했다.

## 결합도란

결합도(Coupling)는 **코드를 수정했을 때의 영향 범위**다. 영향 범위가 좁고, 어디까지 영향이 갈지 예측할 수 있는 코드가 고치기 쉽다. 하나를 고치려는데 여러 곳을 같이 열어야 하거나, 고친 뒤 무관해 보이는 화면까지 다시 테스트해야 한다면 결합도가 높다.

| 전략 | 줄이는 결합 |
| --- | --- |
| 책임을 하나씩 관리하기 | 거대한 훅에 모두가 기대는 결합 |
| 중복 코드 허용하기 | 공통 코드를 쓰는 모든 곳이 묶이는 결합 |
| Props Drilling 지우기 | 값을 쓰지도 않으면서 전달만 하는 중간 컴포넌트와의 결합 |

### 결합의 종류

모듈 사이에 **무엇을 주고받느냐**에 따라 결합의 세기를 여섯 단계로 나눈다. 위로 갈수록 약하고 좋은 결합이다. 모듈 독립성은 결합도는 약하게, 응집도([[code-cohesion|응집도를 높이는 전략]])는 강하게 할수록 높아진다.

| 순서 | 종류 | 주고받는 것 |
| --- | --- | --- |
| 1 (약함) | 자료 | 필요한 데이터 값만 매개변수로 |
| 2 | 스탬프 | 배열·구조체·객체 같은 **자료구조**를 통째로 |
| 3 | 제어 | 처리 방식을 지시하는 **제어 요소(flag)** |
| 4 | 외부 | 외부에서 정의한 데이터 형식·통신 프로토콜 |
| 5 | 공통 | 여러 모듈이 참조·갱신하는 **전역 변수** |
| 6 (강함) | 내용 | 다른 모듈의 내부 데이터·지역 변수를 **직접 참조** |

불리언 플래그 인수가 나쁜 이유도 여기서 나온다. 플래그는 호출하는 쪽이 받는 쪽의 내부 처리를 지시하는 제어 결합이다.

### 높은 결합의 신호

| 신호 | 푸는 방법 |
| --- | --- |
| 거의 같은 함수가 여러 개 있고 복사·붙여넣기가 잦다 | 차이 나는 값을 인자로 받는 함수 하나, 또는 설정 객체를 받는 클래스 하나로 만든다 |
| 함수 안에 ID·선택자·설정값이 하드코딩돼 있다 | 값을 밖에서 넘겨받는다 |
| 매개변수가 지나치게 많다 | 여러 위치 인자 대신 **옵션 객체와 기본값**을 받는다. 매개변수가 늘어도 호출부가 깨지지 않는다 |
| 한 클래스가 다른 클래스를 직접 생성한다 | 의존 대상을 밖에서 주입한다([[frontend-dependency\|프론트엔드에서 의존성 관리하기]]) |

## 1. 책임을 하나씩 관리하기

"이 페이지의 쿼리 파라미터 전부"를 관리하는 `usePageState()` 같은 훅은 책임이 무제한이다.

```ts
export function usePageState() {
  const [query, setQuery] = useQueryParams({
    cardId: NumberParam,
    statementId: NumberParam,
    dateFrom: DateParam,
    dateTo: DateParam,
    statusList: ArrayParam,
  });
  return useMemo(() => ({ values: { /* 다섯 값 */ }, controls: { /* 다섯 setter */ } }), [query, setQuery]);
}
```

- **결합도**: 페이지의 컴포넌트와 훅이 전부 이 훅에 기대게 되어, 수정 영향이 페이지 전체로 퍼진다.
- **가독성**: 파라미터가 늘 때마다 무의식적으로 여기에 추가되고, 이름은 역할을 말해 주지 못한다.
- **성능**: `cardId`만 쓰는 컴포넌트도 `dateFrom`이 바뀌면 리렌더링된다.

파라미터마다 훅을 나눈다.

```ts
export function useCardIdQueryParam() {
  const [cardId, setCardIdParam] = useQueryParam("cardId", NumberParam);
  const setCardId = useCallback((cardId: number) => setCardIdParam(cardId, "replaceIn"), [setCardIdParam]);
  return [cardId ?? undefined, setCardId] as const;
}
```

이름이 분명해지고, 고쳤을 때 영향이 그 파라미터를 쓰는 곳에만 간다. 로직의 **종류**(쿼리 파라미터, 상태, API 호출)가 아니라 **책임** 단위로 나눈다. Next.js처럼 프레임워크가 URL 상태 도구(`useSearchParams`)를 주거나 nuqs 같은 라이브러리를 쓸 때도 원칙은 같다.

## 2. 중복 코드 허용하기

여러 페이지에 반복되는 코드를 훅·컴포넌트로 공통화하면 응집도는 오른다. 하지만 공통 코드를 쓰는 모든 곳이 하나로 묶인다. 처음엔 같아 보였던 페이지들에 저마다 다른 요구사항이 생기면, 공통 코드는 옵션 인자를 늘리며 복잡해지고, 고칠 때마다 쓰는 페이지를 전부 테스트해야 한다.

```ts
export const useOpenMaintenanceBottomSheet = () => {
  const maintenanceBottomSheet = useMaintenanceBottomSheet();
  const logger = useLogger();

  return async (info: TelecomMaintenanceInfo) => {
    logger.log("점검 바텀시트 열림");
    const result = await maintenanceBottomSheet.open(info);
    if (result) logger.log("점검 바텀시트 알림받기 클릭");
    closeView();
  };
};
```

이 훅을 공통화하기 전에 물어볼 것:

- 페이지마다 로깅 값이 달라지지 않는가?
- 바텀시트를 닫아도 화면은 닫지 않아야 하는 페이지가 생기지 않는가?
- 바텀시트의 문구·이미지가 페이지마다 달라지지 않는가?

동작·로깅·모양이 지금도 같고 **앞으로도 같을 예정**이면 공통화한다. 달라질 여지가 있으면 중복을 허용한다. 그 판단은 코드만 보고 할 수 없으니 기획·디자인 동료와 동작을 확인한다. "모양이 같아도 바뀌는 이유가 다르면 중복이 아니다"라는 같은 원칙이 [[component-splitting|컴포넌트를 분리하는 기준과 방법]]에도 있다.

## 3. Props Drilling 지우기

Props Drilling은 부모와 자식 사이에 결합이 생겼다는 분명한 신호다. 중간 컴포넌트가 값을 쓰지도 않으면서 아래로 넘기기만 하면, prop 이름이 바뀌거나(`name` → `firstName`) 기능이 사라질 때(`recommendedItems` 삭제) **경로 위의 모든 컴포넌트**를 고쳐야 한다.

```tsx
// ✗ ItemEditBody는 items·recommendedItems·onConfirm을 쓰지 않고 ItemEditList로 넘기기만 한다
<ItemEditBody items={items} keyword={keyword} onKeywordChange={setKeyword}
  recommendedItems={recommendedItems} onConfirm={onConfirm} onClose={onClose} />
```

### 먼저 조합(Composition) 패턴

중간 컴포넌트가 `children`을 받게 하고, 실제로 값을 쓰는 컴포넌트를 부모가 직접 그린다.

```tsx
function ItemEditModal({ open, items, recommendedItems, onConfirm, onClose }) {
  const [keyword, setKeyword] = useState("");
  return (
    <Modal open={open} onClose={onClose}>
      <ItemEditBody keyword={keyword} onKeywordChange={setKeyword} onClose={onClose}>
        <ItemEditList keyword={keyword} items={items} recommendedItems={recommendedItems} onConfirm={onConfirm} />
      </ItemEditBody>
    </Modal>
  );
}

function ItemEditBody({ children, keyword, onKeywordChange, onClose }) {
  return (
    <>
      <Input value={keyword} onChange={(e) => onKeywordChange(e.target.value)} />
      <Button onClick={onClose}>닫기</Button>
      {children}
    </>
  );
}
```

불필요한 중간 추상화가 사라져 각 컴포넌트의 역할이 분명해진다. 조합의 일반 원리는 [[composition|합성: 상속 대신 Composition]]에 있다.

### 그래도 깊으면 Context

트리가 깊어 조합만으로 안 풀리면 Context로 값을 공유한다. `ItemEditList`가 `useItemEditModalContext()`로 `items`·`recommendedItems`를 직접 읽으면 모달은 더 이상 그 값을 넘기지 않는다.

Context는 **마지막 수단**이다.

1. props는 컴포넌트가 무엇을 쓰는지 드러내는 계약이다. 역할과 의도를 담은 props는 drilling처럼 보여도 문제가 아니다.
2. 값을 전달만 하는 중간 컴포넌트가 문제라면 먼저 `children`으로 깊이를 줄인다.
3. 둘 다 맞지 않을 때 Context를 쓴다. Context 값이 바뀌면 구독하는 컴포넌트가 모두 리렌더링된다는 점도 고려한다([[context|Context와 전역 상태]]).

## 4. 기능 모듈끼리 직접 부르지 않기: 중재자와 퍼사드

앱 규모에서 결합도를 낮추는 고전적인 구조가 있다. Gmail의 채팅·메일 목록처럼 **기능 단위 모듈**이 서로를 직접 import하거나 호출하지 않게 하는 것이다.

```text
모듈 A ─┐                         ┌─ 모듈 C
모듈 B ─┼─▶ 샌드박스(퍼사드) ─▶ 앱 코어(중재자) ─▶ 라이브러리(DOM·Ajax)
        └ 모듈은 "이런 일이 생겼다"를 발행만 한다
```

| 부품 | 패턴 | 하는 일 |
| --- | --- | --- |
| 모듈 | 모듈 패턴 | 자기 일만 하고, 다른 모듈이 있는지 모른다. 바깥과는 샌드박스만 통한다 |
| 샌드박스 | 퍼사드(Facade) | 모듈에게 쓸 수 있는 좁은 API만 보여 준다. 권한 검사도 여기서 한다 |
| 앱 코어 | 중재자(Mediator) | 모듈의 시작·정지를 관리하고, 발행된 메시지를 관심 있는 모듈에 전달한다(발행·구독) |

이렇게 하면 모듈 하나를 빼거나 바꿔도, 오류가 나도 나머지가 무너지지 않는다. 모듈은 다른 모듈의 존재가 아니라 메시지의 모양에만 의존한다.

지금은 같은 생각이 다른 이름으로 쓰인다. 전역 스토어에 액션을 보내고 필요한 쪽이 구독하는 상태 관리([[frontend-mv-architecture|MV* 아키텍처의 흐름]]), 같은 계층의 슬라이스끼리 import를 금지하고 공개 API(`index.ts`)로만 노출하는 [[feature-sliced-design|Feature-Sliced Design]]이 그 예다. 다만 메시지로만 연결하면 누가 무엇에 반응하는지 코드에서 따라가기 어려워진다. 흐름이 단순한 곳에는 직접 호출이 낫다. 각 패턴의 정의는 [[gof-design-patterns|GoF 디자인 패턴]]에 있다.

## 정리

- 결합도는 "고치면 어디까지 영향이 가는가"다. 자료만 주고받을수록 약하고, 남의 내부를 직접 건드릴수록 강하다.
- 훅·함수는 로직 종류가 아니라 책임 하나 단위로 만든다.
- 공통화는 앞으로도 같이 바뀔 것이 확실할 때만 한다. 갈라질 여지가 있으면 중복이 더 싸다.
- Props Drilling은 조합 → Context 순서로 푼다. 의도를 담은 props는 그대로 둔다.
- 기능 모듈끼리는 직접 부르지 않고 좁은 창구(퍼사드)와 중재자·스토어를 거치게 하면 모듈을 빼고 바꿔도 나머지가 버틴다. 대신 흐름을 따라가기 어려워지니 단순한 곳에는 직접 호출을 쓴다.

관련 노트: [[software-engineering|소프트웨어 설계와 공학]], [[changeable-code-criteria|변경하기 쉬운 코드의 네 가지 기준]], [[code-cohesion|응집도를 높이는 전략]], [[component-splitting|컴포넌트를 분리하는 기준과 방법]], [[composition|합성: 상속 대신 Composition]], [[context|Context와 전역 상태]], [[frontend-dependency|프론트엔드에서 의존성 관리하기]]
