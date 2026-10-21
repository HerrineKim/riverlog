---
title: "조건부 렌더링"
concept: "Conditional Rendering"
summary: "조건에 따라 서로 다른 컴포넌트를 그리거나 아예 그리지 않는 React의 렌더링 패턴."
tags: ["react", "jsx", "frontend"]
source: til
date: "2026-10-21"
sources: ["https://react.vlpt.us/basic/06-conditional-rendering.html", "https://react.vlpt.us/basic/26-componentDidCatch-and-sentry.html"]
---

> 개인 TIL을 바탕으로, 벨로퍼트의 「[벨로퍼트와 함께하는 모던 리액트](https://react.vlpt.us/)」 중 「[조건부 렌더링](https://react.vlpt.us/basic/06-conditional-rendering.html)」을 바탕으로 보강했다.

**조건부 렌더링**은 조건에 따라 화면에 무엇을 그릴지(또는 그리지 않을지) 달라지는 것이다. JSX의 `{}` 안에는 `if`문을 쓸 수 없으므로, JSX 밖의 `if`나 JSX 안의 표현식(`&&`, `? :`)을 상황에 맞게 고른다.

## 1. JSX 밖에서 if

분기가 크거나 아예 다른 컴포넌트를 반환할 때.

```jsx
function Greeting({ isLoggedIn }) {
  if (isLoggedIn) {
    return <UserGreeting />
  }
  return <GuestGreeting />
}
```

엘리먼트를 변수에 담아 두었다가 쓸 수도 있다(element variable).

```jsx
function LoginControl({ isLoggedIn }) {
  let button
  if (isLoggedIn) {
    button = <LogoutButton />
  } else {
    button = <LoginButton />
  }
  return <div>{button}</div>
}
```

## 2. 인라인 if: `&&`

조건이 참일 때만 그리고, 거짓이면 아무것도 그리지 않는다. 논리 연산자의 **단축 평가**를 이용한다.

```jsx
function Mailbox({ unreadMessages }) {
  return (
    <div>
      <h1>안녕하세요!</h1>
      {unreadMessages.length > 0 && (
        <h2>현재 {unreadMessages.length}개의 읽지 않은 메시지가 있습니다.</h2>
      )}
    </div>
  )
}
```

주의: 왼쪽이 숫자 `0`이면 `false`가 아니라 **`0`이 그대로 화면에 출력**된다. `{count && <A />}` 대신 `{count > 0 && <A />}`처럼 Boolean으로 만든다.

## 3. 인라인 if-else: 삼항 연산자

```jsx
function UserStatus({ isLoggedIn }) {
  return (
    <div>
      이 사용자는 현재 <b>{isLoggedIn ? '로그인' : '로그인하지 않은'}</b> 상태입니다.
    </div>
  )
}
```

여러 갈래로 중첩할 수도 있지만 가독성이 급격히 떨어진다. 세 갈래 이상이면 if나 객체 매핑을 고려한다.

```jsx
{index === '0' ? <MinutesToHours /> : index === '1' ? <KmToMiles /> : null}
```

즉시 실행 함수 `{(() => { if (...) return ...; })()}`로 JSX 안에서 if를 쓰는 방법도 있지만, 대개 컴포넌트를 분리하는 편이 낫다.

## 4. 렌더링 막기: null 반환

컴포넌트가 `null`을 반환하면 아무것도 그려지지 않는다.

```jsx
function WarningBanner({ warning }) {
  if (!warning) {
    return null
  }
  return <div>경고!</div>
}
```

`null`을 반환해도 컴포넌트의 생명주기(effect 등)는 그대로 동작한다.

JSX에서 `null`, `undefined`, `true`, `false`는 아무것도 그리지 않는다. `&&`와 삼항 연산자의 "안 그리는 쪽"이 동작하는 이유다. 숫자 `0`과 빈 문자열은 예외라서 앞의 `&&` 주의가 생긴다. 데이터가 아직 없을 때 `if (!user) return null`로 먼저 빠져나가는 것(null checking)은 `undefined.id`를 읽다가 앱 전체가 흰 화면이 되는 렌더링 에러를 막는 가장 흔한 방어다.

## 핵심 정리

| 상황 | 패턴 |
| --- | --- |
| 완전히 다른 컴포넌트 | JSX 밖에서 `if` / element variable |
| 있거나 없거나 | `cond && <A />` (0 주의) |
| 둘 중 하나 | `cond ? <A /> : <B />` |
| 아무것도 그리지 않기 | `return null` |
