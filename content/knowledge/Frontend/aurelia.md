---
title: "Aurelia: 뷰·뷰모델 짝과 의존성 주입 관례"
concept: "Aurelia"
summary: "관례로 뷰(HTML)와 뷰모델(클래스)을 짝짓는 웹 프레임워크 Aurelia의 핵심 개념과 스타일 규칙. 파일 하나에 컴포넌트 하나·작은 함수·서비스 분리, aurelia-app 진입점과 부트스트랩, 생성자 주입을 선언하는 네 가지 방법(@inject, static inject, @autoinject + 데코레이터 메타데이터, Aurelia 2의 resolve), Lazy 같은 리졸버, Aurelia 1과 2의 차이를 정리한다."
tags: ["frontend", "framework", "dependency-injection", "convention", "typescript"]
source: other
date: "2026-11-20"
sources: ["https://github.com/behzad888/Aurelia-styleguide", "https://aurelia.io/blog/2026/1/14/aurelia-2-release-candidate/", "https://docs.aurelia.io/getting-to-know-aurelia/services-and-runtime-hooks/dependency-injection.md"]
---

> behzad888의 「[Aurelia Style Guide](https://github.com/behzad888/Aurelia-styleguide)」(Aurelia 1 기준)를 바탕으로, Aurelia 2의 현재 API를 공식 문서로 확인해 재구성한 노트다.

## Aurelia란

Aurelia는 **설정보다 관례(convention over configuration)** 를 앞세운 웹 프런트엔드 프레임워크다. UI 요소는 **뷰(view)와 뷰모델(view-model)의 짝**으로 이뤄진다.

| 짝 | 무엇으로 | 역할 |
| --- | --- | --- |
| 뷰 | HTML 템플릿(`my-app.html`) | DOM에 그려지는 모양 |
| 뷰모델 | JavaScript·TypeScript 클래스(`my-app.ts`) | 뷰에 줄 데이터와 동작 |

**같은 이름의 두 파일을 프레임워크가 알아서 짝짓는다.** 템플릿 엔진과 의존성 주입(DI) 컨테이너가 짝을 만들고 정해진 생명주기로 관리하며, 데이터 바인딩이 둘을 이어 데이터가 바뀌면 화면이, 입력이 바뀌면 데이터가 따라간다(양방향 바인딩). 마크업과 동작이 파일로 나뉘어 디자이너·개발자 협업과 소스 관리가 쉽다. MVVM 구조 자체는 [[frontend-mv-architecture|프론트엔드 MV* 아키텍처]]에 있다.

- 표준 문법(클래스, 데코레이터, HTML)에 가깝게 쓰고 프레임워크 전용 API 노출을 줄이는 것이 설계 방향이다.
- Aurelia 2는 Aurelia 1의 핵심 개념(뷰·뷰모델 짝, DI, 바인딩)을 유지하며 다시 쓴 판이다. 오랜 알파·베타를 거쳐 **2026년 1월 릴리스 후보(RC)** 에 도달했다. 새 프로젝트는 `npx makes aurelia`로 만든다.

## 스타일 규칙

### 파일 하나에 컴포넌트 하나

컴포넌트 클래스, 모델 클래스, HTTP 설정, 데이터 로딩을 한 파일에 몰아넣지 않는다. 파일 하나에 컴포넌트 하나를 두고 **400줄 아래**로 유지한다.

| 이유 | 설명 |
| --- | --- |
| 테스트 | 하나만 떼어 단위 테스트하고 목(mock)으로 바꾸기 쉽다 |
| 협업 | 읽기 쉽고, 여러 사람이 같은 파일을 고쳐 충돌하는 일이 준다 |
| 숨은 버그 | 한 파일에 섞인 컴포넌트끼리 변수를 공유하거나, 의도치 않은 클로저·의존성 결합이 생기는 것을 막는다 |

나눈 결과는 역할별 파일이 된다.

```text
app.ts              뷰모델: 서비스를 주입받아 activate()에서 데이터를 불러온다
models/user.ts      모델: id, name 같은 필드만
services/base.ts    HttpClient를 주입받아 baseUrl 등 공통 설정을 한 번만
services/user.ts    BaseService를 상속해 getSingleUser(name) 같은 API 호출
```

뷰모델은 HTTP 세부를 모르고 서비스의 메서드만 부른다. 앱이 클수록 이 규칙의 값이 커진다.

### 작은 함수

함수는 **75줄 아래**(짧을수록 좋다). 한 가지 일만 하는 작은 함수는 테스트·재사용·읽기·유지보수가 쉽고, 바깥 스코프 변수를 공유하는 큰 함수의 숨은 버그를 피한다. 함수 크기의 일반 원칙은 [[clean-code-functions-naming|함수와 이름 짓기]]에 있다.

TypeScript를 쓰면 TypeScript 자체의 코딩 가이드라인도 함께 따른다([[typescript-coding-convention|TypeScript 코딩 컨벤션]]).

## 부트스트랩: 앱의 진입점

Aurelia 1은 `<body aurelia-app="main">` 속성으로 진입점 모듈을 지정한다. 부트스트래퍼가 그 모듈의 `configure(aurelia)`를 불러 플러그인과 설정을 등록하고 루트 컴포넌트를 띄운다.

```javascript
// Aurelia 1: src/main.js
export async function configure(aurelia) {
  aurelia.use.standardConfiguration().developmentLogging()
  await aurelia.start()
  aurelia.setRoot('app', document.body)
}
```

Aurelia 2는 진입 코드에서 루트 컴포넌트를 직접 넘겨 시작한다.

```typescript
// Aurelia 2: src/main.ts
import Aurelia from 'aurelia'
import { MyApp } from './my-app'

Aurelia.app(MyApp).start()
```

과거 Aurelia 1은 jspm·SystemJS로 모듈을 불러왔고, IE9~10을 지원하려면 MutationObserver 폴리필을 먼저 불러야 했다. 지금은 Vite·webpack 같은 번들러를 쓴다([[bundlers-and-vite|번들러의 역사와 Vite]]).

## 의존성 주입

뷰모델이 필요한 서비스를 **직접 만들지 않고 생성자로 받는다.** 생성자 안에서 `this.http = new HttpClient()`처럼 만들면 테스트에서 가짜로 바꿀 수 없고, 설정도 인스턴스마다 흩어진다. 컨테이너가 기본적으로 싱글턴 인스턴스를 만들어 넘겨준다. DI 개념 자체는 [[singleton-service-pattern|싱글턴 서비스와 의존성 주입]]에 있다.

### 주입 대상을 선언하는 방법

JavaScript에는 생성자 매개변수의 타입 정보가 실행 시점에 없으므로, 무엇을 넣어 달라는지 따로 적어야 한다.

| 방법 | 코드 | 특징 |
| --- | --- | --- |
| 데코레이터 | `@inject(HttpClient) export class App { constructor(http) {} }` | 가장 흔한 형태. 데코레이터 지원이 필요하다 |
| 정적 속성 | `static inject = [HttpClient]` | 프레임워크 import 없이 표준 문법만으로. 데코레이터가 없어도 된다 |
| 정적 getter | `static get inject() { return [HttpClient] }` | 클래스 필드 문법이 없던 시절의 대안. 정적으로 선언할 때 컨테이너가 찾는 속성 이름은 `inject`다(`parameters` 같은 다른 이름은 읽지 않는다). `@inject`는 데코레이터가 기록한 메타데이터로, `@autoinject`는 TypeScript가 남긴 `design:paramtypes`로 따로 전달된다 |
| `@autoinject` (Aurelia 1, TypeScript) | `@autoinject export class App { constructor(private http: HttpClient) {} }` | `emitDecoratorMetadata`로 TypeScript가 남긴 타입 메타데이터를 읽어 타입을 두 번 적지 않는다 |
| `resolve()` (Aurelia 2) | `private http = resolve(HttpClient)` | 클래스 필드에서 바로 꺼낸다. 생성자도, 데코레이터 메타데이터도 필요 없다 |

`@autoinject`가 기대는 `emitDecoratorMetadata`는 TypeScript 전용 실험 옵션이라 표준 데코레이터·esbuild 계열 도구와 맞지 않는다. Aurelia 2가 `resolve()`를 기본 패턴으로 삼은 이유다.

### 리졸버: 클래스 말고 "받는 방식"을 주입

의존성 자리에 클래스 대신 **리졸버(resolver)** 를 두면 인스턴스를 어떻게 받을지 정할 수 있다.

| 리졸버 | 받는 것 | 쓰는 곳 |
| --- | --- | --- |
| Lazy | 인스턴스가 아니라 **인스턴스를 돌려주는 함수** | 생성 비용이 크거나 항상 필요하지 않은 서비스. 처음 부를 때 만든다 |
| All | 같은 키로 등록된 모든 인스턴스 배열 | 플러그인·핸들러 목록 |
| Optional | 등록돼 있으면 인스턴스, 없으면 `null` | 선택적 기능 |
| NewInstance | 매번 새 인스턴스 | 싱글턴이면 안 되는 객체 |

```javascript
// Aurelia 1
@inject(Lazy.of(HttpClient))
export class App {
  constructor(getHttp) { this.getHttp = getHttp }   // 필요할 때 this.getHttp()
}
```

Aurelia 2에서는 `DI.createInterface()`로 클래스 대신 **계약(인터페이스) 토큰**을 만들어 주입할 수 있어, 구현을 바꿔 끼우기 쉽다. 등록 수명은 `Registration.singleton`·`Registration.transient`로 정한다.

## 정리

- Aurelia = 같은 이름의 **뷰(HTML) + 뷰모델(클래스)** 짝, 양방향 바인딩, DI 컨테이너. 설정보다 관례.
- 파일 하나에 컴포넌트 하나(400줄 아래), 함수는 75줄 아래, HTTP 설정·API 호출은 서비스로 뺀다.
- 의존성은 `new`로 만들지 말고 주입받는다. 선언은 `@inject`·`static inject`, Aurelia 1의 TypeScript는 `@autoinject`, Aurelia 2는 `resolve()`.
- 받는 방식을 바꾸려면 Lazy·All·Optional 같은 리졸버를 쓴다.

관련 노트: [[frontend-mv-architecture|프론트엔드 MV* 아키텍처]], [[singleton-service-pattern|싱글턴 서비스와 의존성 주입]], [[frontend-frameworks|프론트엔드 프레임워크]], [[clean-code-functions-naming|함수와 이름 짓기]]
