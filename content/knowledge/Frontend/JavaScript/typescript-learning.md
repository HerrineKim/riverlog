---
title: "TypeScript 학습법"
concept: "TypeScript"
summary: "TypeScript는 새 언어가 아니라 JavaScript에 타입 검사와 자동완성을 더한 슈퍼셋이다. JavaScript가 정적 타입을 얻기까지의 역사, 흔한 오해 세 가지, 세팅된 프로젝트에서 시작해 변수·함수 인자 → 타입 추론 → API 스키마 → 콜백 → 좁히기 → strict 순으로 익히는 로드맵을 정리했다."
tags: ["typescript", "javascript", "frontend", "tools"]
source: other
date: "2026-10-13"
sources: ["https://velog.io/@teo/typescript", "https://www.typescriptlang.org/docs/handbook/intro.html"]
---

> 테오(teo)의 「[Typescript는 어떻게 공부해야 하나요?](https://velog.io/@teo/typescript)」(2022.02)를 바탕으로 재구성한 노트다.

## TypeScript란

TypeScript는 **JavaScript의 슈퍼셋(superset)** 이다. 모든 JavaScript 코드는 그대로 TypeScript 코드다. 그 위에 타입 문법을 얹어 **실행 전에 오류를 잡고, 편집기 자동완성을 강하게** 만든다. 빌드할 때 타입은 지워지고 평범한 JavaScript가 남는다. 타입이 틀려도 JavaScript로서는 돌아간다. 타입은 검증 도구일 뿐이다.

웹 프론트엔드에서는 사실상 기본 언어다. npm 주요 라이브러리 대부분이 TypeScript로 쓰였거나 타입 선언을 제공하고, 채용 공고도 TypeScript 경험을 전제로 한다.

## JavaScript가 타입을 얻기까지

JavaScript는 짧은 스크립트용으로 만들어져 타입과 클래스를 빼고 단순하게 설계됐다. 그 결과 **프로토타입 객체 기반·일급 함수·동적 타입**이라는 독특한 조합이 됐다.

| 시도 | 결과 |
| --- | --- |
| ECMAScript 4 (1999~2008) | 클래스·정적 타입·인터페이스·제네릭을 넣으려 했으나 하위 호환과 이해관계 충돌로 폐기됐다. 그래서 ES3 다음이 ES5다. 이 초안을 이어받은 것이 Flash의 ActionScript 3다 |
| CoffeeScript | Python처럼 간결한 문법을 내세웠다. 화살표 함수·구조 분해·템플릿 리터럴이 ES6 표준에 들어가는 데 영향을 줬다 |
| Babel | 제안 단계 문법을 먼저 써 보게 했고, 호응을 얻은 문법(옵셔널 체이닝, `??` 등)이 표준이 됐다 |
| TypeScript (2012, Microsoft) | 언어를 갈아엎지 않고 **슈퍼셋**으로 정적 타입의 장점(빌드 전 오류 검증)만 더했다. IDE 자동완성과 궁합이 좋아 VS Code와 함께 퍼졌다 |

결국 JavaScript는 체계를 유지하면서 문법을 고쳐 가는 방향으로 자랐다. 동적 타입은 작은 코드에서는 유연하지만, 큰 팀이 정해진 스키마 위에서 일할 때는 **오타 하나가 실행해 봐야 드러나는** 비용이 크다. State of JS 설문에서 "JavaScript에 가장 필요한 기능"으로 정적 타입이 해마다 1위에 오르는 이유다. 타입 문법을 주석처럼 무시하고 실행하게 하자는 TC39 제안(Type Annotations)도 이 흐름에 있다.

## 단점이 사라진 과정

| 과거의 단점 | 지금 |
| --- | --- |
| `tsc`가 느리다 | 빌드 도구(Babel, esbuild, Vite 등)는 **타입을 지우기만** 하고, 타입 검사는 편집기와 `tsc --noEmit`이 따로 한다. TypeScript 7.0부터 컴파일러 자체가 Go로 다시 쓰여 큰 프로젝트에서 수 배~10배 이상 빨라졌다 |
| 타입 없는 라이브러리 때문에 빨간 줄과 `any`가 넘친다 | 대부분의 라이브러리가 TypeScript로 쓰였거나 `@types/*`를 제공한다 |
| 실행하려면 빌드가 필요하다 | Node.js는 타입 문법만 지우고 `.ts` 파일을 바로 실행하는 타입 스트리핑(type stripping)을 지원한다. Deno·Bun도 TypeScript를 기본 실행한다 |

**도입 비용보다 얻는 것이 크다.** 어차피 번들러와 트랜스파일러를 쓰는 시대라 TypeScript를 쓰지 않을 이유가 거의 없다.

## 흔한 오해 세 가지

| 오해 | 실제 |
| --- | --- |
| 새 정적 타입 언어라 배우기 어렵다 | JavaScript에 문법이 조금 더해진 것이다. 필요할 때 필요한 만큼만 배우면 된다 |
| 클래스와 객체지향으로 짜야 한다 | Java·C#처럼 쓰라고 만든 언어가 아니다. JavaScript답게 함수와 객체로 짜고 **타입 검사 + 자동완성**만 얹는다고 생각한다 |
| 협업엔 좋지만 당장 생산성은 떨어진다 | 자동완성 덕에 처음 써 보면 오히려 빨라진다. 생산성을 떨어뜨리는 것은 억지로 붙인 타입과 `any` 남발이다 |

## 학습 로드맵

### 1. 세팅된 프로젝트로 시작한다

`tsconfig.json`의 옵션은 방대하다. 처음부터 하나하나 이해하려 하지 말고 `npm create vite@latest`의 TypeScript 템플릿처럼 **이미 설정된 환경**에서 시작한다. 라이브러리를 만든다면 tsdown 같은 번들 도구의 기본값을 쓴다. 처음에 빨간 줄이 너무 거슬리면 `any`로 덮지 말고 차라리 `strict`를 잠시 끈다.

### 2. 변수와 함수 인자부터

기본 타입(`string`, `number`, `boolean`)과 배열(`string[]`)을 붙여 보고, `.`을 눌러 자동완성이 달라지는 것을 체감한다. 함수 인자는 구조 분해와 함께 타입을 주는 법까지 익힌다.

### 3. 쓰기보다 추론에 맡긴다

```typescript
let bad: number = 10  // 중복
let good = 10         // number로 추론된다
```

**타입은 적게 쓸수록 좋다.** 추론이 되는 곳에 타입을 또 쓰면 바꿀 때 두 군데를 고쳐야 한다. 타입은 경계(함수 인자, API 응답, 공개 인터페이스)에 쓴다.

### 4. 백엔드 스키마를 interface로

```typescript
interface User {
  id: string
  name: string
  email: string
}

async function getUser(id: string): Promise<User> { /* ... */ }
```

API 응답에 interface를 붙이면 네트워크 탭을 매번 열지 않아도 필드가 자동완성된다. 이 과정에서 `Promise<User>` 같은 **제네릭**과 `Record` 같은 유틸리티 타입을 자연스럽게 만난다.

### 5. 콜백 타입

콜백 타입은 길어 보이지만, 헷갈리면 별도 `type`으로 빼서 이름을 붙인 뒤 끼워 넣는다. 여기까지 오면 초급은 끝이다.

### 6. 여러 경우의 타입과 좁히기

```typescript
let selected: User | null = null

if (selected) {
  selected.name  // 조건문 안에서는 User로 좁혀진다(narrowing)
}
```

동적 타입 언어의 여러 경우를 표현하는 유니언 타입과, 조건문으로 타입을 좁히는 법이 중급의 관문이다. 공식 핸드북의 Narrowing·Utility Types는 처음부터 정독하지 말고 **필요할 때 찾아 쓴다**.

### 7. strict를 켜고 에러 0에 도전한다

익숙해지면 `strict: true`로 바꾸고 에러를 하나씩 없앤다. `as`·`any`·복잡한 타입 곡예가 생겼다면 잘못된 신호다. 원래 쓰려던 JavaScript 모양에서 **최소한으로만 덧붙인 타입**인지 되묻는다.

## 정리

- TypeScript는 JavaScript의 슈퍼셋이고, 본질은 **타입 검사와 자동완성을 더해 주는 도구**다.
- 속도·라이브러리 호환이라는 옛 단점은 타입 스트리핑과 네이티브 컴파일러로 해소됐다.
- 객체지향으로 짜야 한다는 부담 없이 JavaScript답게 쓰고, 타입은 경계에만 적는다.
- 세팅된 프로젝트 → 변수·인자 → 추론 → API 스키마 → 콜백 → 좁히기 → strict 순으로, 필요할 때 필요한 만큼 배운다.

관련 노트: [[typescript-coding-convention|TypeScript 코딩 컨벤션]], [[variables-and-types|변수와 데이터 타입]], [[bundlers-and-vite|번들러의 역사와 Vite]], [[js-engine-v8|JavaScript는 인터프리터 언어일까, 컴파일 언어일까]], [[typescript-basics|TypeScript 문법 한눈에 보기]]
