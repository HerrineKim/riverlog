---
title: "프론트엔드와 SOLID 원칙"
concept: "SOLID"
summary: "객체 지향 설계 원칙 SOLID(SRP·OCP·LSP·ISP·DIP)를 React 컴포넌트와 함수 위주 JS·TS 코드에 옮겨 본다. 책임은 요구 사항 단위로 나누고, 분기 대신 확장으로 기능을 늘리고, props는 필요한 만큼만 받고, 데이터 소스는 추상화 뒤에 숨긴다."
tags: ["react", "frontend", "javascript", "design"]
source: other
date: "2026-10-12"
sources: ["https://yozm.wishket.com/magazine/detail/2479/", "https://velog.io/@teo/Javascript에서도-SOLID-원칙이-통할까", "https://80000coding.notion.site/ddedd7bd3558415182930eea33ae6769"]
---

> pxd Story의 글 「[프론트엔드와 SOLID 원칙 살펴보기](https://yozm.wishket.com/magazine/detail/2479/)」(요즘IT, 2024.03)와 테오(teo)의 「[Javascript에서도 SOLID 원칙이 통할까?](https://velog.io/@teo/Javascript에서도-SOLID-원칙이-통할까)」(2022.01)를 바탕으로 재구성한 노트다. 클래스 기준의 원래 정의는 팔만코딩경(42Seoul 커뮤니티 위키)의 「[클린코드] 객체지향과 SOLID 설계 원칙」으로 보강했다.

## SOLID란

SOLID는 코드를 **유지보수하기 쉽고, 재사용·확장하기 좋게** 만드는 객체 지향 설계 원칙 다섯 가지의 머리글자다. 다섯 원칙 모두 **추상화와 다형성으로 변경의 파급을 끊는다**는 같은 목표를 향한다. 클래스에서 나왔지만, 클래스도 결국 데이터·함수·타입의 묶음이라 컴포넌트와 함수 위주 코드에도 그대로 옮겨진다. 도미노 중간을 비워 두면 하나가 쓰러져도 피해가 국지화되는 것과 같다.

| 원칙 | 클래스 설계에서의 정의 | 컴포넌트에서 | 함수 위주 코드에서 | 위반 신호 |
| --- | --- | --- | --- | --- |
| **S**RP 단일 책임 | 클래스를 변경해야 하는 이유는 하나뿐 | 책임은 동작이 아니라 **요구 사항 단위**. 로그인 폼과 비밀번호 재설정은 다른 컴포넌트 | 함수 하나는 한 가지 일. 판별·변환 함수를 떼어 낸다. **순수 함수**가 가장 잘 맞는 모양 | 한 함수가 조회·판별·부수 효과를 다 한다. 반대로 동작마다 쪼개 흐름을 못 따라간다 |
| **O**CP 개방-폐쇄 | 기존 클래스를 고치지 않고 새 구현을 더해 확장 | 타입별 `if` 분기 대신 공통 래퍼와 확장 구조 | 옵션 대신 **함수를 인자로** 받는다(고차 함수). Redux 미들웨어, Vite 플러그인이 같은 구조 | `option`·`flag` 인자와 `if` 분기가 늘고, 새 기능마다 기존 함수를 고친다 |
| **L**SP 리스코프 치환 | 하위 타입은 상위 타입 자리에 들어갈 수 있다. 계약(사전·사후 조건, 예외)을 좁히거나 깨지 않는다 | 감싼 컴포넌트가 원래 컴포넌트의 props 계약(받는 값·이벤트 동작)을 깨지 않는다 | 선언적 코드에서 먼저 선언한 조건과 나중 조건이 충돌하지 않게. 순환 의존 금지 | `useEffect`끼리 서로의 결과를 상태로 고쳐 무한 루프 |
| **I**SP 인터페이스 분리 | 클라이언트는 쓰지 않는 메서드에 의존하지 않는다. 인터페이스의 단일 책임 | props는 쓰는 것만 받는다 | 큰 모듈을 통째로 들이지 않는다(트리 셰이킹과 닮음) | `TextComponent`가 쓰지도 않는 `photo`를 받는다. 서버 스키마 타입에 화면용 필드를 `?`로 덧붙인다 |
| **D**IP 의존 역전 | 상위·하위 모듈 모두 추상에 의존하고, 구현은 주입한다 | 컴포넌트가 API를 직접 부르지 않고 서비스(추상)에 의존 | 컴포넌트 → 커스텀 훅 → API 클라이언트로 층을 둔다 | 컴포넌트에서 `fetch`·`axios`를 직접 부른다. API 모듈이 컴포넌트 props를 건드린다 |

React는 상속보다 [[composition|합성]]을 권하므로 LSP는 "확장한 컴포넌트도 원래의 동작 약속을 지킨다"로 읽는다. 추상 클래스와 인터페이스 중 무엇을 상위 타입으로 쓸지는 [[abstract-class-vs-interface|추상 클래스와 인터페이스]], 타입 분기를 팩터리에 가두는 예시는 [[clean-code-functions-naming|클린 코드: 함수와 이름]]에 있다.

## OCP: 분기 대신 확장

기존 코드를 고치면 그 코드를 쓰는 모든 곳이 영향을 받는다. 새 기능은 **기존 코드를 바꾸지 않고 덧붙여서** 넣을 수 있어야 한다.

```tsx
// ✗ 새 섹션 타입이 생길 때마다 분기를 고쳐야 한다
sections.map((section) => {
  if (section.type === 'banner') return <Banner {...section} />;
  else if (section.type === 'list') return <List {...section} />;
  // ...
});

// ✓ 공통 래퍼가 항목을 그린다. 섹션이 늘거나 줄어도 이 코드는 그대로
sections.map((section) => (
  <Section key={section.id} title={section.title}>
    {section.items.map((item) => <Item key={item.id} {...item} />)}
  </Section>
));
```

## DIP: 데이터 소스는 추상 뒤에

상위 모듈(도구를 쓰는 쪽)과 하위 모듈(실제 일을 하는 도구)이 서로 직접 의존하지 않고 **둘 다 추상화에 의존**한다.

```text
✗ 컴포넌트 ──직접 호출──> 특정 API 서버          (서버가 바뀌면 컴포넌트를 고친다)
✓ 컴포넌트 ──> 데이터 서비스(추상) <── API 구현   (서버가 바뀌면 서비스만 고친다)
```

```ts
interface ItemService {
  getItems(): Promise<Item[]>;
}

// 컴포넌트·훅은 ItemService에만 의존한다. 실제 구현(REST, mock 등)은 바깥에서 넣는다
function useItems(service: ItemService) { /* service.getItems() */ }
```

테스트에서 mock 서비스를 끼워 넣기 쉬워지는 것도 같은 효과다.

## 어디까지 쪼개나

`hasChildren = (item) => !!item.children` 같은 한 줄 함수를 뺄지는 융통성의 문제다. 재사용·변경 여지가 있는지, 이름이 표현식보다 읽기 좋은지, 오히려 파이프라인을 오가게 만드는지로 판단한다. 기준은 **가독성과 응집도**이고, 가독성은 쓴 사람이 아니라 읽는 사람이 판단한다.

## 정리

- SRP: 책임은 동작이 아니라 **요구 사항 단위**. 너무 잘게 쪼개지 않는다.
- OCP: 타입마다 늘어나는 `if/else` 분기는 확장 구조로 바꿀 신호다.
- LSP: 확장한 컴포넌트도 원래의 동작 약속을 지킨다.
- ISP: props는 쓰는 것만 받는다.
- DIP: 데이터를 가져오는 방법은 서비스 뒤에 숨기고 컴포넌트는 추상에 의존한다.

원칙은 목표가 아니라 기준이다. 지금 코드가 바꾸기 어려운 이유를 설명하는 도구로 쓰면 된다.

관련 노트: [[functional-programming|함수형 프로그래밍]], [[oop-and-javascript|객체 지향 프로그래밍과 JavaScript]], [[composition|합성]], [[components-and-props|컴포넌트와 Props]], [[tdd|프론트엔드에서의 TDD]], [[frontend-dependency|프론트엔드에서 의존성 관리하기]], [[clear-code-principles|명확한 코드의 네 가지 원칙]], [[abstract-class-vs-interface|추상 클래스와 인터페이스]]
