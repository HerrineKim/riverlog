---
title: "모듈: export와 import, export default"
concept: "ES Modules"
summary: "ES 모듈의 named export와 default export 문법, export default를 쓰는 이유와 반대로 named export를 권하는 이유."
tags: ["javascript", "frontend", "typescript"]
source: mixed
date: "2026-10-12"
sources: ["https://riverkim.kr/174", "https://riverkim.kr/120"]
---

> riverkim.kr에 쓴 글들을 다시 정리한 노트입니다.

## 모듈과 export

ES6부터 JavaScript 파일 하나는 하나의 **모듈**이다. 파일마다 자기 스코프를 가지며, 밖에서 쓰게 할 것만 `export`로 내보내고 다른 파일에서 `import`로 가져온다. 내보내지 않은 것은 자동으로 감춰진다.

### named export

선언 앞에 `export`를 붙이거나, 선언과 떨어진 곳에서 한꺼번에 내보낸다.

```javascript
// say.js
export function sayHi(user) {
  alert(`Hello, ${user}!`)
}

function sayBye(user) {
  alert(`Bye, ${user}!`)
}
export { sayBye }
```

```javascript
import { sayHi, sayBye } from './say.js'      // 이름이 정확히 맞아야 한다
import { sayHi as hi } from './say.js'        // 다른 이름이 필요하면 as
```

함수·클래스 선언 앞에 `export`를 붙일 때는 끝에 세미콜론을 붙이지 않는 것이 일반적인 스타일이다.

### default export

모듈에서 **대표 하나**를 내보낸다. 모듈당 하나만 둘 수 있고, 가져올 때 중괄호 없이 원하는 이름으로 받는다.

```javascript
// User.js
export default class User {
  constructor(name) {
    this.name = name
  }
}
```

```javascript
import User from './User.js'
import Whatever from './User.js' // 이것도 동작한다
```

## export default를 쓰는 이유

- 모듈을 "여러 함수를 담은 묶음"으로 만들 수도 있지만, 개체 하나만 담는 쪽이 리팩터링과 유지보수에 유리하다는 관점이 있다. `export default`는 **이 모듈에는 개체가 하나뿐**이라는 사실을 드러낸다.
- import할 때 중괄호를 쓰지 않아도 되어 짧다. React 컴포넌트 파일(`export default function App()`)에서 흔히 보는 이유다.

## 반대 의견: named export를 쓰자

| 쟁점 | default export | named export |
| --- | --- | --- |
| 이름 | 가져오는 쪽에서 아무 이름이나 붙일 수 있어 이름이 제각각이 된다 | 이름이 틀리면 에러가 난다 |
| 리팩터링·검색 | 이름이 달라 일괄 변경과 검색이 어렵다 | 에디터 자동 import·이름 변경이 잘 된다 |
| 트리 셰이킹 | 객체로 묶어 default로 내보내면 일부만 쓰기 어렵다 | 쓰는 것만 번들에 남기기 쉽다 |

Airbnb 스타일 가이드의 `import/prefer-default-export` 규칙을 두고도 GitHub에서 오래 논쟁이 있었다. 팀 TypeScript 컨벤션 중에는 `export default`를 아예 금지하는 경우도 있다([[typescript-coding-convention|TypeScript 코딩 컨벤션]]). 정답이 있는 문제가 아니라 **팀 안에서 한 방식으로 통일하는 것**이 중요하다.

## 모듈 이전: 모듈 패턴

ES 모듈 이전에는 즉시 실행 함수와 클로저로 private 변수를 숨기는 **모듈 패턴**을 썼다. 지금은 파일 자체가 스코프인 ES 모듈이 그 역할을 맡는다([[js-design-patterns|JavaScript 디자인 패턴]] 참고).

## 정리

- 파일 = 모듈 = 스코프. 내보낼 것만 `export`한다.
- named export는 `{ 이름 }`으로, default export는 중괄호 없이 아무 이름으로 가져온다.
- default는 짧고 "대표 하나"를 드러내지만, 이름 일관성과 도구 지원은 named가 낫다.
- 어느 쪽이든 프로젝트 안에서 통일한다.

## 참고 자료

- [모듈 내보내고 가져오기 — javascript.info](https://ko.javascript.info/import-export)
- [default export를 피해야 하는 이유 — yceffort](https://yceffort.kr/2020/11/avoid-default-export)
- [What is the benefit of prefer-default-export? — airbnb/javascript #1365](https://github.com/airbnb/javascript/issues/1365)

관련 노트: [[typescript-coding-convention|TypeScript 코딩 컨벤션]], [[js-design-patterns|JavaScript 디자인 패턴]]
