---
title: "프론트엔드와 SOLID 원칙"
concept: "SOLID"
summary: "객체 지향 설계 원칙 SOLID(SRP·OCP·LSP·ISP·DIP)를 React 컴포넌트에 옮겨 본다. 책임은 요구 사항 단위로 나누고, 분기 대신 확장으로 기능을 늘리고, props는 필요한 만큼만 받고, 데이터 소스는 추상화 뒤에 숨긴다."
tags: ["react", "frontend", "javascript", "design"]
source: other
date: "2026-10-12"
sources: ["https://yozm.wishket.com/magazine/detail/2479/"]
---

> pxd Story의 글 「[프론트엔드와 SOLID 원칙 살펴보기](https://yozm.wishket.com/magazine/detail/2479/)」(요즘IT, 2024.03)를 요약·재구성한 노트입니다. 원문 코드는 그대로 옮기지 않고 설명용 예시로 다시 썼습니다.

## SOLID란

SOLID는 코드를 **유지보수하기 쉽고, 재사용·확장하기 좋게** 만드는 객체 지향 설계 원칙 다섯 가지의 머리글자다. 클래스를 기준으로 만들어졌지만 컴포넌트에도 그대로 옮겨 볼 수 있다.

| 원칙 | 한 줄 정의 | 프론트엔드로 옮기면 |
| --- | --- | --- |
| **S**RP 단일 책임 | 한 모듈은 한 가지 책임만 | 컴포넌트를 **요구 사항 단위**로 나눈다 |
| **O**CP 개방-폐쇄 | 확장에는 열고 수정에는 닫는다 | 타입별 `if` 분기 대신 확장 가능한 구조 |
| **L**SP 리스코프 치환 | 자식은 부모를 대신할 수 있어야 한다 | 확장한 컴포넌트도 원래 동작 약속을 지킨다 |
| **I**SP 인터페이스 분리 | 쓰지 않는 것에 의존하지 않는다 | props는 필요한 것만 받는다 |
| **D**IP 의존 역전 | 구체가 아니라 추상에 의존한다 | 컴포넌트가 API를 직접 부르지 않고 서비스에 의존 |

## SRP: 단일 책임 원칙

여러 일을 하는 모듈은 한 기능을 고칠 때 다른 기능까지 망가뜨린다. 그래서 책임을 나눈다.

**흔한 오해는 "책임 = 동작 하나"로 보는 것이다.** 동작마다 컴포넌트를 쪼개면 전체 흐름을 따라가기 어려워지고 작업량만 는다. 책임의 단위는 **하나의 요구 사항을 해내는 범위**다.

- 로그인 폼: 아이디·비밀번호를 받아 인증을 요청한다 → 한 책임
- 비밀번호 재설정: 다른 요구 사항 → 로그인 폼에 붙이지 말고 별도 컴포넌트

React 공식 문서도 컴포넌트를 나누는 기준으로 단일 책임 원칙을 든다.

## OCP: 개방-폐쇄 원칙

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

데이터나 서비스 로직이 바뀌어도 **최소한만 고치면 되도록** 컴포넌트를 설계하는 것이 목표다.

## LSP: 리스코프 치환 원칙

S가 T의 하위 타입이면, T 자리에 S를 넣어도 문제없이 돌아가야 한다. 자식은 부모가 하던 일을 모두 지원하고, 같은 요청에 같은 종류의 응답을 돌려줘야 한다.

- `BaseButton`을 확장한 `SpecialButton`이 `onClick`을 재정의한다면, 부모의 `onClick` 동작은 유지하고 그 위에 덧붙인다.
- 부모가 약속한 동작을 바꾸거나 없애면 위반이다. 어떤 버튼을 쓰든 동작이 일관돼야 한다.

React는 상속보다 [[composition|합성]]을 권하므로, 실제로는 "감싼 컴포넌트가 원래 컴포넌트의 props 계약(받는 값·이벤트 동작)을 깨지 않는다"로 읽으면 된다. (내 해석)

## ISP: 인터페이스 분리 원칙

쓰지 않는 기능에 의존하지 않는다. React에서 컴포넌트의 인터페이스는 props다.

```tsx
// ✗ TextComponent는 photo를 쓰지 않는데도 받는다
function TextComponent({ text, photo }: { text: string; photo: string }) { /* ... */ }

// ✓ 필요한 것만 받는다
function TextComponent({ text }: { text: string }) { /* ... */ }
```

받는 props가 적을수록 컴포넌트 사이 의존이 줄고, 따로 고치고 확장하기 쉬워진다.

## DIP: 의존 역전 원칙

상위 모듈(도구를 쓰는 쪽)과 하위 모듈(실제 일을 하는 도구)이 서로 직접 의존하지 않고 **둘 다 추상화(인터페이스)에 의존**한다.

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

## 정리

- SRP: 책임은 동작이 아니라 **요구 사항 단위**. 너무 잘게 쪼개지 않는다.
- OCP: 타입마다 늘어나는 `if/else` 분기는 확장 구조로 바꿀 신호다.
- LSP: 확장한 컴포넌트도 원래의 동작 약속을 지킨다.
- ISP: props는 쓰는 것만 받는다.
- DIP: 데이터를 가져오는 방법은 서비스 뒤에 숨기고 컴포넌트는 추상에 의존한다.

원칙은 목표가 아니라 기준이다. 지금 코드가 바꾸기 어려운 이유를 설명하는 도구로 쓰면 된다.

관련 노트: [[composition|합성]], [[components-and-props|컴포넌트와 Props]], [[tdd|프론트엔드에서의 TDD]]
