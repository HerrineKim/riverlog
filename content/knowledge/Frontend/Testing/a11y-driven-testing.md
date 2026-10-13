---
title: "접근성 기반 UI 테스트 자동화"
concept: "A11y-driven Testing"
summary: "UI 테스트가 xpath·CSS 선택자 때문에 쉽게 깨지던 문제를 WAI-ARIA의 role과 접근 가능한 이름(accessible name)으로 요소를 찾는 방식으로 푸는 법. getByRole 쿼리, aria-label·aria-labelledby·aria-current·aria-expanded 활용, 헤드리스 컴포넌트, 인수·회귀 테스트로서의 효과를 정리한다."
tags: ["testing", "frontend", "accessibility", "html", "react"]
source: other
date: "2026-10-12"
sources: ["https://tech.wonderwall.kr/articles/a11ydriventestautomation/"]
---

> 원더월 김태희의 글 「[접근성이 이끄는 웹 프론트엔드 테스트 자동화](https://tech.wonderwall.kr/articles/a11ydriventestautomation/)」(2023.06)를 요약·재구성한 노트입니다. 예시 코드는 Playwright 기준입니다.

## 왜 UI 테스트는 자동화하기 어렵다고 여겨졌나

예전 테스트 책은 "UI 테스트는 자동화하지 말고 모델을 단위 테스트하라"고 했다. 명령형 UI 시절에는 View를 최대한 얇게 만들고 모델만 테스트하면 됐다. 지금은 사정이 다르다.

- 선언형 UI(React·Vue·Svelte)는 UI를 **상태의 함수**로 만들어 예측하고 테스트하기 쉬워졌다.
- 백엔드가 모델과 로직을 대부분 가져가면서, 프론트엔드에 남은 복잡성은 **UI 로직과 상태**다. 접히고 펼쳐지는 UI, disabled, hover, 서버와의 상호작용은 단위 테스트만으로 검증하기 어렵다.

그래서 **프론트엔드는 UI를 테스트해야 한다.** 문제는 요소를 찾는 방법이었다.

## 요소를 찾는 방법 비교

| 방식 | 예 | 문제 |
| --- | --- | --- |
| 좌표 (캡처 & 리플레이) | `x=200, y=300` 클릭 | 버튼 위치만 바뀌어도 깨진다 |
| xpath | `//*[@id="main"]/div/section[1]/div[3]/label/div/div[1]/input` | DOM 트리가 조금만 바뀌어도 깨지고, 읽을 수 없어 주석이 필요하다 |
| CSS 클래스 | `section.customer-info-section input.phone-input` | 같은 입력이 여러 개면 겹친다. CSS Modules·styled-components는 `sc-781e12f9-2` 같은 무작위 이름을 만든다 |
| test id | `data-testid="..."` | 테스트만을 위한 인위적인 표시를 계속 달아야 한다 |
| **role + 접근 가능한 이름** | `getByRole('button', { name: '구매하기' })` | 사용자가 보는 의미로 찾으므로 구조·스타일이 바뀌어도 버틴다 |

앞의 네 방식은 **기술 기준**으로 찾는다. 기술이 바뀌면 테스트도 바뀌어야 한다. 사용자 인터페이스를 테스트하는데 사용자 관점이 빠져 있다.

## 접근성 정보로 요소 찾기

스크린 리더는 화면을 읽어 주려면 요소의 의미를 알아야 한다. 이 의미를 표준화한 것이 **ARIA(Accessible Rich Internet Applications)다**. `<button>구매하기</button>`는 스크린 리더가 "구매하기, 버튼"으로 읽는다.

**스크린 리더가 읽기 쉬운 코드는 테스트 도구도 찾기 쉽다.** Testing Library가 처음 이 방식을 만들었고 Playwright도 받아들였다.

```ts
await page.getByRole('button', { name: '구매하기' }).click();

await page
  .getByRole('region', { name: '주문자 정보' })
  .getByPlaceholder('*휴대전화')
  .fill('01011112222');
```

프레임워크, CSS, DOM 구조에 기대지 않는다. "주문자 정보" 영역 안에 "*휴대전화" 입력이 있는 한 테스트는 깨지지 않는다.

## 테스트하기 좋은 마크업 만들기

### 1. div에는 role과 동작을 준다

role은 대부분 시맨틱 HTML에 대응한다. `button` → button, `input[type=checkbox]` → checkbox, `section`(이름 있음) → region. 디자인 때문에 `div`로 컴포넌트를 만들면 role이 없어서 스크린 리더도 테스트 도구도 못 찾는다. **role을 달고, 그 role에 맞는 동작(키보드 등)을 구현하면** 시맨틱 요소처럼 다뤄진다. 필요한 동작은 MDN의 role 문서에 나와 있다.

```jsx
function Button({ children, onClick, disabled = false }) {
  function handleCommand(event) {
    if (disabled) return;
    if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return;
    onClick();
  }

  return (
    <div tabIndex={0} role="button" aria-disabled={disabled}
         onClick={handleCommand} onKeyDown={handleCommand}>
      {children}
    </div>
  );
}
```

### 2. 텍스트 없는 버튼에는 aria-label

아이콘 버튼은 기계가 읽을 이름이 없다. 스크린 리더는 파일명이나 "라벨이 지정되지 않음"을 읽는다. `aria-label`로 이름을 붙인다.

- 라벨은 **이미지 대신 그 텍스트를 놓아도 말이 되게** 쓴다. `test menu button` 같은 테스트용 이름은 안 된다.
- 다국어 사이트라면 i18n으로 번역한 값을 넣는다.

```jsx
<Button aria-label={t('header-menu-alt')} onClick={showMenu}>
  <Icon src={menuIcon} />
</Button>
```

### 3. 같은 이름이 여럿이면 aria-labelledby로 영역을 나눈다

여러 단계 회원 가입처럼 단계마다 "확인" 버튼이 있으면 `getByRole('button', { name: '확인' })`이 여러 요소를 찾아 실패한다. `section`을 제목과 `aria-labelledby`로 연결하면 이름 있는 region이 되고, 그 안에서 찾을 수 있다.

```jsx
<section aria-labelledby="email-section-title"
         aria-current={isCurrent ? 'step' : undefined}>
  <h2 id="email-section-title">가입하실 이메일 주소를 입력해주세요</h2>
  <Button>확인</Button>
</section>
```

```ts
await page.getByRole('region', { name: '가입하실 이메일 주소' })
  .getByRole('button', { name: '확인' }).click();

await expect(page.getByRole('region', { name: '가입약관' }))
  .toHaveAttribute('aria-current', 'step');
```

현재 단계는 `aria-current="step"`으로 표시한다. 단계 이동을 테스트할 때 쓴다.

### 4. 접고 펼치는 상태는 aria-expanded

애니메이션, 탭 키 접근, 검색 노출 때문에 접힌 내용도 DOM에 남아 있어야 할 때가 있다. 그러면 눈에 안 보일 뿐이라 기계는 상태를 모른다. `aria-expanded`와 `aria-controls`로 알린다.

```jsx
<button aria-expanded={isOpen} aria-controls="delivery-info"
        onClick={() => setIsOpen((v) => !v)}>
  배송정보 <Arrow />
</button>
<div id="delivery-info" aria-hidden={!isOpen}>…</div>
```

```ts
const toggle = page.getByRole('button', { name: '배송정보' });
await expect(toggle).toHaveAttribute('aria-expanded', 'false');
await toggle.click();
await expect(toggle).toHaveAttribute('aria-expanded', 'true');
```

aria 속성은 DOM에 렌더되므로 **스타일도 여기에 건다.** `&[aria-expanded='true'] svg { transform: rotateZ(180deg); }`처럼 쓰면 테스트한 상태와 화면의 연결을 더 믿을 수 있다.

### 5. 복잡한 컴포넌트는 헤드리스 라이브러리로

Tab, Select, Dropdown, Datepicker를 직접 만들면 접근성도 테스트도 포기하기 쉽다. **Radix UI, Ariakit, Ark UI** 같은 헤드리스 컴포넌트 라이브러리는 로직·ARIA·키보드·포커스 관리를 갖추고 스타일만 맡긴다. Radix의 Select는 `combobox`·`option` role을 가져서 그대로 테스트할 수 있다.

```ts
await page.getByRole('combobox', { name: '옵션을 선택하세요' }).click();
await page.getByRole('option', { name: 'Night .version' }).click();
```

## 테스트가 주는 것

### 실행되는 기획서 (인수 테스트)

접근성 용어는 사람과 기계의 공용어라서 **기획서 문장을 거의 그대로 테스트로 옮길 수 있다.** "로그인하지 않으면 장바구니에 못 들어간다"는 정책은 이렇게 된다.

```ts
await page.getByRole('link', { name: '장바구니' }).click();
const dialog = page.getByRole('alertdialog', { name: '로그인' });
await dialog.getByRole('button', { name: '확인' }).click();
await expect(page.getByRole('heading', { name: '로그인' })).toBeVisible();
```

- 코드보다 테스트를 먼저 짤 수 있고, 테스트 작성자와 개발자를 나눌 수도 있다.
- 기획자와 함께 보며 빠진 케이스를 찾는다.

### 강건한 회귀 테스트

회귀 테스트는 **안정적이어야** 한다. 코드 한 줄에 테스트 수백 줄을 고쳐야 한다면 유지보수 비용이 구현보다 커진다.

원문 팀의 "정렬할 수 있다" e2e 테스트는 상품 목록을 inline-block에서 grid로, CSR에서 SSG로, `img`에서 Next.js `Image`로 바꾸는 동안 한 번도 깨지지 않았다. 사용자 동작이 그대로였기 때문이다. 반대로 헤더를 고치다 `useEffect` 의존성 배열에 참조가 바뀌는 `cancel` 함수를 넣어 정렬 요청이 취소되는 버그는, 코드 리뷰는 통과했지만 머지 직전 e2e가 잡았다.

이 방식에서 e2e가 깨지는 경우는 대부분 진짜 버그이거나 잘못된 접근성을 바로잡은 경우였다.

## 정리

- 테스트가 실제 사용 방식과 닮을수록 더 믿을 수 있다(Kent C. Dodds).
- 요소는 좌표·xpath·클래스가 아니라 **role과 접근 가능한 이름**으로 찾는다. 구조와 스타일을 바꿔도 테스트가 살아남는다.
- 테스트가 요소를 못 찾으면 스크린 리더도 못 찾는다. 테스트를 쓰다 보면 접근성이 같이 고쳐진다.
- 직접 만든 컴포넌트에는 role·aria 속성과 그에 맞는 동작을 넣고, 복잡한 컴포넌트는 헤드리스 라이브러리를 쓴다.
- 접근성은 시각 장애인만이 아니라 테스트, 검색 엔진, 기획 소통까지 모두에게 이득이다.

관련 노트: [[tdd|프론트엔드에서의 TDD]], [[jest-practices|JavaScript 테스트 원칙과 Jest 실행 팁]], [[html|HTML 기초와 HTML5]], [[design-system|디자인 시스템을 패키지로 배포하기]], [[semantic-html|시맨틱 HTML과 문서 구조]]
