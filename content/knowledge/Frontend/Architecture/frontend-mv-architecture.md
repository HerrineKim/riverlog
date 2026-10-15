---
title: "프론트엔드 MV* 아키텍처의 흐름: MVC에서 MVI까지"
concept: "MV* Architecture"
summary: "MVC·MVP·MVVM의 구조와 차이, 웹 프론트엔드의 아키텍처가 MVC → MVVM → Container-Presenter → Flux → 가벼운 전역 스토어·서버 상태 관리로 바뀌어 온 흐름과, 그 흐름을 정리한 MVI(Model-View-Intent) 아키텍처. 뷰와 비즈니스 로직을 분리하고, 뷰는 의도만 전하고, 데이터는 한 방향으로 돈다."
tags: ["frontend", "architecture", "state", "design-pattern"]
source: other
date: "2026-10-14"
sources: ["https://velog.io/@teo/프론트엔드에서-MV-아키텍쳐란-무엇인가요", "https://velog.io/@teo/MVI-Architecture", "https://beomy.tistory.com/43"]
---

> 테오(teo)의 「[프론트엔드에서 MV* 아키텍쳐란 무엇인가요?](https://velog.io/@teo/프론트엔드에서-MV-아키텍쳐란-무엇인가요)」(2021.12)와 「[프론트엔드에서 비즈니스 로직과 뷰 로직 분리하기 (feat. MVI 아키텍쳐)](https://velog.io/@teo/MVI-Architecture)」(2022.08)를 바탕으로 재구성하고, 「MVC·MVP·MVVM 비교」는 beomy의 「[MVC, MVP, MVVM 비교](https://beomy.tistory.com/43)」(2018.09)로 보강한 노트다.

## 아키텍처란

불편을 없애려고 만든 규칙이 반복되면 패턴이 되고, **모두가 이해하고 따를 수 있게 굳힌 구조가 아키텍처**다. 모듈은 서로 데이터를 주고받으므로 아키텍처는 **분류**(무엇을 어디에 두나)와 **인터페이스**(어떻게 주고받나) 두 관점으로 본다.

## MVC·MVP·MVVM 비교

UI 소프트웨어의 본질은 데이터를 화면에 그리고, 사용자가 동작하면 데이터가 바뀌고, 다시 화면이 바뀌는 것이다. 화면 문제와 데이터 문제는 성격이 다르므로 둘을 나눠 **한쪽 수정이 다른 쪽으로 번지지 않게** 한다. 세 패턴 모두 Model(화면이 아닌 데이터: JS 객체, API 응답, 서버 DB)과 View(최종 HTML·CSS)는 같고, **둘 사이를 잇는 세 번째 역할**과 의존 방향이 다르다.

```text
MVC   입력 → Controller ─갱신→ Model ←─읽기── View   (Controller는 View를 고르기만 한다)
MVP   입력 → View ⇄ Presenter ⇄ Model              (View와 Model은 서로 모른다)
MVVM  입력 → View ─명령→ ViewModel ⇄ Model
             View ←─데이터 바인딩── ViewModel       (ViewModel은 View를 모른다)
```

| | MVC | MVP | MVVM |
| --- | --- | --- | --- |
| 세 번째 역할 | Controller: 입력을 받아 Model을 바꾸고 보여 줄 View를 고른다 | Presenter: View의 요청으로 Model을 가공해 View에 직접 넘긴다 | ViewModel: View에 보여 줄 상태와 동작만 모은 "View를 위한 Model" |
| 입력이 들어오는 곳 | Controller | View | View (명령으로 ViewModel에 전달) |
| View 갱신 | View가 Model을 직접 읽거나, Model이 알리거나(Observer), View가 주기적으로 확인 | Presenter가 View 인터페이스를 호출 | 바인딩이 ViewModel 변경을 자동 반영 |
| 관계 | Controller : View = 1 : n | Presenter : View = 1 : 1 | ViewModel : View = 1 : n |
| 장점 | 가장 단순하다 | View와 Model의 의존이 끊긴다. View를 가짜로 바꿔 Presenter를 테스트하기 쉽다 | View와 ViewModel까지 느슨해져 각 부분을 따로 개발·테스트할 수 있다 |
| 약점 | View가 Model에 기대므로 앱이 커질수록 얽힌다 | View와 Presenter가 1:1로 단단히 묶이고 Presenter가 비대해진다 | ViewModel 설계가 어렵고, 바인딩이 많으면 흐름을 추적하기 어렵다 |

MVVM은 명령(Command) 패턴과 데이터 바인딩이라는 두 장치로 의존을 끊는다. 웹에서는 Knockout·AngularJS가 시작이었고 Vue의 반응형 템플릿이 같은 모양이다. 모바일에서는 Android Jetpack의 ViewModel, SwiftUI의 `@Observable` 객체가 MVVM 구조로 쓰인다. MVP는 Android가 공식 ViewModel을 내기 전에 많이 쓰였다.

## 웹 프론트엔드 아키텍처의 변천

```text
서버 MVC ─▶ jQuery MVC ─▶ MVVM ─▶ 컴포넌트 + Container-Presenter
                                          │ props drilling
                                          ▼
                    Flux·Redux (뷰와 상태 관리 분리, 단방향)
                                          │ 보일러플레이트 과다
                          ┌───────────────┼────────────────┐
                          ▼               ▼                ▼
                  Context·hooks   가벼운 전역 스토어   서버 상태 관리
                                  (Zustand, Jotai)    (TanStack Query, SWR)
```

| 단계 | Model / View / Controller | 바뀐 점과 남은 불편 |
| --- | --- | --- |
| 서버 MVC (Rails, PHP, JSP) | DB / 클라이언트 전체 / 서버 라우터 | 프론트엔드라는 개념이 없던 시절 |
| jQuery | Ajax 데이터 / HTML·CSS / JS(jQuery) | 핵심은 DOM 탐색·조작, 이벤트, Ajax. 바뀐 곳을 **일일이 찾아 고쳐야** 했다 |
| MVVM (Knockout, AngularJS → React, Vue, Svelte) | 같음 / 템플릿 / **바인딩** | 서버 템플릿처럼 **선언적으로** 쓰고 DOM 조작은 프레임워크가 맡는다. 화면을 그리기 위한 모델만 다룬다는 뜻에서 ViewModel |
| 컴포넌트, Container-Presenter | 로직은 Container, 표시는 Presenter | 재사용을 위해 로직을 위로 모으자 중간 컴포넌트가 쓰지도 않는 props를 나르게 됐다(**props drilling**) |
| Flux·Redux | Store / 하나의 큰 View / Action·Dispatch·Reducer | 비즈니스 로직을 컴포넌트 계층에서 떼어 냈다. 이때부터 **상태 관리**라고 부른다. 대신 학습 곡선과 장황한 문법 |
| Context·hooks | 공통 조상이 데이터를 제공 | 새 개념 없이 props drilling만 막는다 |
| 가벼운 전역 스토어 (Zustand, Jotai, Svelte store) | 컴포넌트 밖 공용 데이터에 간단히 get/set | 중간 과정은 자율, 파생 값(computed·selector)과 동기화를 제공. 과거에 유행한 Recoil은 2025년 1월 저장소가 보관(archived)됐다 |
| 시그널 (Vue 반응성, Svelte 5 runes, Angular Signals, Solid) | 값 단위로 의존을 추적해 바뀐 곳만 갱신 | 반응형 상태가 프레임워크 기본 기능으로 들어왔다 |
| 서버 상태 (TanStack Query, SWR, RTK Query) | 서버 fetch가 Model, query·mutation이 Controller | 전역 상태의 대부분은 결국 API 데이터라는 관찰. 캐싱·무효화·재요청을 맡긴다 |

Flux의 세부 구성은 [[redux|Redux와 react-redux]]에 있다.

### props drilling이 드러낸 문제

**컴포넌트 계층과 데이터 계층은 모양이 다르다.** 독립과 재사용을 위해 컴포넌트를 나눴는데, 데이터를 나르려고 중간 컴포넌트에 props를 뚫다 보니 오히려 위아래 컴포넌트가 더 단단히 묶였다. Facebook이 Flux를 발표하며 "MVC의 양방향이 문제"라고 한 것도, 정확히는 MVC 자체가 아니라 **컴포넌트 단위로 모델이 파편화되는 경계 문제**였다.

## MVI: 흐름을 아키텍처로 정리하기

MVI(Model-View-Intent)는 웹의 cycle.js에서 먼저 나온 개념이 Android·iOS 쪽에서 아키텍처 이름으로 정리된 것이다. Jetpack Compose·SwiftUI 같은 선언형 UI의 단방향 데이터 흐름(UDF) 권장 구조와 같은 모양이다. Flux, Redux, 상태 관리가 줄곧 해 오던 일을 하나의 그림으로 설명한다.

### Intent를 왜 따로 두나

"+" 버튼 클릭과 위쪽 화살표 키는 다른 행동이지만 데이터 입장에서는 같은 "1 증가"다. 그래서 비즈니스 로직은 두 층으로 나뉜다.

| 층 | 하는 일 |
| --- | --- |
| Intent | 사용자 이벤트를 **어떤 데이터 변화인지**로 해석해 전달 |
| Model | 전달받은 요청대로 데이터를 바꾸고, 변화를 감지해 전파 |

```text
   ┌──────────── 데이터 시각화 ────────────┐
   ▼                                        │
 View ── 이벤트 ──▶ Intent ── 액션 ──▶ Model
```

### 특징

| 특징 | 효과 |
| --- | --- |
| 컴포넌트 하나가 아니라 **앱 전체**에 적용, 데이터는 전역 | 컴포넌트 간 통신에 기대지 않아 상태가 일관된다 |
| 데이터가 **한 방향으로 순환** | 흐름을 이해하고 디버깅하기 쉽다 |
| 비즈니스 로직이 뷰에 의존하지 않는다 | UI 요구 변화에 유연하고 따로 테스트하기 쉽다 |
| 상태가 뷰 생명주기와 무관 | 마운트·언마운트에 따른 동기화 문제가 없다 |

뷰는 모델에서 읽는 Query와 모델을 바꾸는 Command를 필요한 대로 조립한다. 뷰는 비즈니스 로직에 의존하지만 **뷰끼리는 느슨하게** 묶인다.

```tsx
// Model: 데이터 변화는 여기서만
const store = createStore({ count: 0 }, (state) => {
  on(INCREASE, (n) => (state.count += n));
  on(RESET, () => (state.count = 0));
});

// View: 읽고(Query), 의도만 보낸다(Intent)
const Counter = () => {
  const count = select(store.count);
  const onClick = () => dispatch(INCREASE(1));
  return <button onClick={onClick}>{count}</button>;
};
```

위 코드는 흐름을 보여 주는 의사 코드다.

### Reducer가 필요한 이유

이벤트 핸들러 안에서 `setVisible`, `setCount`, `setTodos`를 줄줄이 부르면 쓰기는 쉽다. 그런데 디버깅은 결과에서 원인으로 **거꾸로** 추적하는 일이다. 데이터를 바꾸는 코드가 뷰 곳곳에 흩어져 있으면 추적이 어렵고, 모델이 뷰에 묶인다. **뷰는 의도만 보내고 변환은 모델에 모으면** 응집도가 올라가고 뷰와 로직이 느슨해진다.

### 재사용 컴포넌트는 여전히 유효하다

계층 맨 아래의 독립적인 UI 컴포넌트를 조립하는 전략은 그대로다. 문제는 중간 계층이다. 중간 컴포넌트는 대개 재사용되지도 않으면서 비즈니스 로직을 떠안아 거대해진다. **어차피 재사용하지 못할 컴포넌트라면 비즈니스 모듈에 의존하더라도 언제든 갈아 끼울 수 있게** 만드는 편이 변화에 강하다.

## 정리

- 아키텍처는 불편에서 나온 규칙이 굳은 것이다. **분류**와 **인터페이스**를 함께 본다.
- 웹 프론트엔드는 DOM 조작 자동화(MVVM) → 컴포넌트 → 상태 관리 분리(Flux) → 가벼운 스토어·시그널·서버 상태로 움직였다. 원동력은 **컴포넌트 계층과 데이터 계층이 다르다**는 문제였다.
- MVI는 그 흐름의 요약이다. 뷰는 의도를 보내고, 모델만 데이터를 바꾸고, 변화는 한 방향으로 돈다.
- 실제 라이브러리는 어느 이름에도 딱 맞지 않는다(AngularJS는 아예 MVW, Model-View-Whatever라 불렀다). MV* 계열이 수렴해 온 방향은 단방향 데이터 흐름, 선언적으로 바뀐 Controller, 뷰와 비즈니스 로직의 분리, 반응형 변화 전파, 서버 연동 자체를 상태로 다루기, 작게 시작해 필요할 때 복잡해지는 도구다.
- 새 라이브러리를 볼 때는 이름이 아니라 **어떤 불편을 풀었는지**로 판단한다.

관련 노트: [[redux|Redux와 react-redux]], [[getting-started-mtv|Django 시작하기와 MTV 패턴]], [[context|Context와 전역 상태]], [[tanstack-query|TanStack Query(React Query)]], [[frontend-folder-structure|프론트엔드 폴더 구조의 진화]], [[feature-sliced-design|Feature-Sliced Design]]
