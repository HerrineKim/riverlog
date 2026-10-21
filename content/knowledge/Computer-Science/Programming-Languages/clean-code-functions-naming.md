---
title: "클린 코드: 함수와 이름"
concept: "Clean Code"
summary: "『클린 코드』의 함수와 이름 규칙을 정리한다. 나쁜 코드가 비싼 이유와 보이스카우트 규칙, 피해야 할 습관도 다룬다. 함수는 작게, 한 가지만, 한 추상화 수준으로 쓰고 위에서 아래로 이야기처럼 읽히게 배치한다. 값을 돌려주는 질의와 상태를 바꾸는 명령은 나눈다(명령-질의 분리). 타입 분기는 팩터리 한 곳에 가두고 나머지는 다형성에 맡기며, 이름은 의도를 드러내고 한 개념에 한 단어만 쓴다."
tags: ["clean-code", "oop", "code-review", "software-engineering", "design"]
source: other
date: "2026-10-20"
sources: ["https://80000coding.notion.site/b43188a4f8554ab19c50401626c84dcd", "https://80000coding.notion.site/7a0a2aeb367a49e8874c403025687071", "https://google.github.io/styleguide/javaguide.html#s5-naming", "https://80000coding.notion.site/2d46fb01aa10486eae950074461d58d9", "https://80000coding.notion.site/a47f00c8e79143cf833283b4c0487eaf", "https://webactually.com/2018/02/06/%eb%aa%85%ed%99%95%ed%95%9c-%ec%bd%94%eb%93%9c-%ec%9e%91%ec%84%b1%eb%b2%95/", "https://github.com/qkraudghgh/clean-code-javascript-ko/blob/master/README.md", "https://github.com/738/clean-code-typescript", "https://var.gg/ko"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「[클린코드] 함수는 작고 간결하게」, 「[클린코드] 2장 의미 있는 이름」, 「[클린코드] 1장 좋은코드와 나쁜코드」, 「동료들 뒷목 잡게 만드는 나쁜 프로그래밍 습관」을 바탕으로 재구성한 노트다. 원 자료는 로버트 C. 마틴의 『클린 코드』 1~3장이다. 명령-질의 분리는 Brandon Gregory의 「명확한 코드 작성법」(웹액츄얼리 번역, 2018.02)을 더했다. JavaScript·TypeScript 규칙은 「[자바스크립트에 적용한 클린코드](https://github.com/qkraudghgh/clean-code-javascript-ko/blob/master/README.md)」와 「[타입스크립트를 위한 클린코드](https://github.com/738/clean-code-typescript)」를 바탕으로 더했다.

## 나쁜 코드는 왜 비싼가

나쁜 코드는 모호한 이름, 중복, 불필요한 연산이 쌓인 코드다. 동작은 하지만 고칠 때마다 비용이 붙는다.

| 비용 | 내용 |
| --- | --- |
| 깨진 유리창 | 한 곳이 지저분하면 다음 사람도 대충 쓴다. 엉망은 번진다 |
| 생산성 저하 | 코드를 건드리기 무서워져 작은 변경에도 시간이 든다 |
| 기술 부채 | 결국 재설계를 하지만, 새 시스템이 옛 시스템을 따라잡는 일은 드물다 |

일정에 쫓겨 대충 쓰면 그 코드가 다음 일정을 놓치게 만든다. 코드를 건드리는 두려움은 테스트로 없앤다. **보이스카우트 규칙**은 지나간 자리를 조금 더 낫게 남기는 것이다. 이름 하나, 중복 하나를 고치되, 동작 변경과 정리를 한 커밋에 섞지 않는다.

## 함수는 작게

함수 규칙의 출발점은 **작게 만드는 것**이다. 수십 줄짜리 함수는 무엇을 하는지 한눈에 들어오지 않고, 이름이 내용을 다 담지 못한다. 『클린 코드』의 예는 위키 페이지에 설정·해제 페이지를 끼워 넣는 60줄 함수를 세 단계로 줄인다.

```java
// 줄인 결과: 무엇을 하는지만 남고, 어떻게는 아래 함수들로 내려갔다
public static String renderPageWithSetupsAndTeardowns(PageData pageData, boolean isSuite) throws Exception {
    if (isTestPage(pageData))
        includeSetupAndTeardownPages(pageData, isSuite);
    return pageData.getHtml();
}
```

| 규칙 | 기준 |
| --- | --- |
| 한 가지만 한다 | 함수 이름으로 설명할 수 없는 일을 하고 있으면 쪼갠다. 기능을 설명할 때 "그리고"가 들어가거나, 의미 있는 이름으로 다른 함수를 추출할 수 있다면 두 가지 이상을 하는 것이다. 기능이 적은 함수가 더 많은 곳에서 쓰인다 |
| 추상화 수준을 맞춘다 | `getHtml()`(높음), `PathParser.render(path)`(중간), `.append("\n")`(낮음)을 한 함수에 섞지 않는다 |
| 내려가기 규칙 | 코드는 위에서 아래로 읽힌다. 호출하는 함수 바로 아래에 호출당하는 함수를 두어, 한 단계씩 추상화 수준이 내려가게 한다 |
| 들여쓰기 2단계 이하 | `if`·`while` 블록 안은 가능하면 한 줄(함수 호출)로 만든다 |

## 타입 분기는 한 곳에 가둔다

직원 유형별로 급여를 계산하는 `switch`는 유형이 늘 때마다 커지고, 같은 `switch`가 `isPayday`, `deliverPay`에도 반복된다. 이는 단일 책임과 개방-폐쇄 원칙을 함께 어긴다.

```java
// 분기는 객체를 만드는 팩터리 한 곳에서만
public class EmployeeFactoryImpl implements EmployeeFactory {
    public Employee makeEmployee(EmployeeRecord r) {
        switch (r.type) {
            case COMMISSIONED: return new CommissionedEmployee(r);
            case HOURLY:       return new HourlyEmployee(r);
            case SALARIED:     return new SalariedEmployee(r);
            default: throw new InvalidEmployeeType(r.type);
        }
    }
}

// 나머지 코드는 다형성으로: employee.calculatePay(), employee.isPayday()
public abstract class Employee {
    public abstract boolean isPayday();
    public abstract Money calculatePay();
}
```

**분기는 생성 지점 한 곳, 나머지는 다형성.** 새 유형이 생기면 클래스 하나와 팩터리의 `case` 하나만 추가된다. 설계 원칙은 [[frontend-solid|SOLID 원칙]] 노트, 추상 클래스와 인터페이스의 선택은 [[abstract-class-vs-interface|추상 클래스와 인터페이스]] 노트에 있다.

## 인수와 부수 효과

- **인수는 적을수록 좋다.** 0~2개가 이상적이고, 3개 이상이면 묶을 개념이 있는지 본다. `makeCircle(double x, double y, double radius)`보다 `makeCircle(Point center, double radius)`가 의도를 드러낸다.
- 불리언 플래그 인수는 "이 함수가 두 가지 일을 한다"는 신호다. 함수를 둘로 나눈다.
- **부수 효과를 숨기지 않는다.** `checkPassword()`가 비밀번호가 맞을 때 `Session.initialize()`까지 호출하면, 이름만 보고 부른 사람은 세션이 지워지는 줄 모른다. 이름에 드러내거나(`checkPasswordAndInitializeSession`) 호출 위치를 분리한다.

### 명령-질의 분리

함수는 두 종류로 나눈다. 이름이 약속하지 않은 부수 효과는 다른 값을 몰래 덮어쓰는 버그가 된다.

| 종류 | 하는 일 | 지킬 것 |
| --- | --- | --- |
| 질의(query) | 값을 돌려준다 | 상태를 바꾸지 않는다 |
| 명령(command) | 상태를 바꾼다 | 값을 돌려주지 않는다 |

```javascript
// 나쁨: 이름은 질의인데 데이터를 바꾸고 쿠키까지 쓴다
function getFirstName() {
  const name = input.value.toLowerCase()
  document.cookie = `firstName=${name}`
  return name
}

// 좋음: 묻기와 바꾸기를 나눈다
function getFirstName() {
  return input.value
}
function saveFirstName(name) {
  document.cookie = `firstName=${name.toLowerCase()}`
}
```

함수가 무슨 일을 하는지 매번 정의를 열어 확인해야 한다면 이 원칙이 깨진 것이다. 프론트엔드 코드에 적용한 모습은 [[code-predictability|예측 가능성을 높이는 전략]]의 「숨은 로직 드러내기」에 있다.

## 처음부터 깔끔하게 쓰지 않는다

작은 함수는 처음부터 나오지 않는다. 순서가 있다.

```text
1. 일단 동작하는 함수를 쓴다       (길고 중복도 많다)
2. 분기·경계값을 모두 덮는 테스트를 쓴다
3. 테스트를 돌리며 리팩터링한다     (쪼개기, 이름 바꾸기, 중복 제거)
```

3단계는 출력이 같다는 전제에서 가독성만 높이는 작업이라, 테스트가 그 전제를 지켜 준다. [[tdd|TDD]]는 이 순서를 테스트 먼저로 뒤집은 것이다.

## 의미 있는 이름

| 규칙 | 나쁜 예 → 좋은 예 |
| --- | --- |
| 의도를 드러낸다. 주석이 필요하면 이름이 부족한 것이다 | `int a; String b;` → `int itemCount; String itemName;` |
| 맥락 있는 이름을 쓴다 | `i, j, k` → `row, col, depth` |
| 함수는 동사 + 대상 (+ 조건) | `process`, `doStuff` → `getActiveUsersByGroup(groupId)` |
| 맥락이 이미 말하는 것은 뺀다 | `cart.calculateCartTotal()` → `cart.calculateTotal()` |
| 인덱스가 필요 없으면 반복 변수를 없앤다 | `for (int i...)` → `for (String word : words)`, `words.forEach(...)` |
| 한 개념에 한 단어만 쓴다 | `fetch`/`retrieve`/`get`, `Member`/`User`/`Customer`, `Manager`/`Service`를 섞지 않는다 |
| 타입을 이름에 넣지 않는다 | `nameString` → `name`, `memberArray` → `members` |
| 인터페이스에 접두사, 구현에 막연한 접미사를 붙이지 않는다 | `IShapeFactory` / `ShapeFactoryImpl` → `ShapeFactory` / `RectangleFactory` |

- 컬렉션은 복수형(`members`)이 기본이고, `Map`처럼 대체할 말이 마땅치 않으면 `memberById`처럼 키를 드러내는 이름이 낫다.
- 한 개념에 한 단어는 **팀 단위 합의**다. 프로젝트 초기에 용어집을 정해 두면 리뷰에서 이름 논쟁이 줄어든다.
- 이름이 막히면 다른 프로젝트의 관례를 찾아본다. [var.gg](https://var.gg/ko) 같은 변수명 검색 도구는 오픈소스에서 실제로 쓰는 이름·약어 후보를 보여 주고 팀 용어집을 한곳에 모으게 돕는다.
- 타입 접두사(헝가리안 표기법)를 금지하는 이 규칙과 반대로, C++ 게임 코드처럼 `m`·`b` 접두사를 표준으로 정한 팀도 있다. 어느 쪽이든 저장소 안에서 통일하는 것이 우선이다([[cpp-coding-style|C++ 코딩 표준과 clang-format]]).

## 피해야 할 습관

| 습관 | 대신 |
| --- | --- |
| `while (i != 50)`처럼 정확한 값으로 끝내기 | 범위로 검사한다 (`i < 50`) |
| 반복문 안 여러 곳에서 탈출 | 종료 조건을 한 곳에 모으거나 함수로 뽑는다 |
| 길고 깊은 반복문 | 이름 붙인 함수로 뽑는다 |
| 함수 하나가 여러 일 | 함수 하나에 일 하나 |
| 입력 검증 없음 | 경계에서 방어적으로 검사하고 일찍 반환한다 |
| `null` 반환 | 빈 배열·기본 객체, 예외나 Result 타입을 쓰고 반환 타입에 드러낸다 |

## JavaScript·TypeScript로 옮길 때

같은 원칙이 JavaScript에서는 언어 기능으로 표현된다.

| 원칙 | JavaScript에서 | 이유 |
| --- | --- | --- |
| 인수는 적게 | 인수가 셋 이상이면 **객체 하나**로 받고 매개변수에서 구조 분해한다 | 호출하는 쪽에서 이름이 보이고 순서를 외울 필요가 없다 |
| 기본값을 명시 | `function f(name = 'guest')`. 설정 객체는 `{ ...defaults, ...options }` | `name \|\| 'guest'`는 `''`·`0`까지 덮어쓴다 |
| 부수 효과를 숨기지 않는다 | 받은 배열·객체를 고치지 않고 복사본을 돌려준다(`toSorted`, 스프레드) | 호출한 쪽의 데이터가 몰래 바뀌지 않는다 |
| 전역을 오염시키지 않는다 | `Array.prototype`에 메서드를 붙이지 않는다. 유틸 함수나 클래스로 둔다 | 다른 라이브러리·미래 표준과 이름이 부딪힌다 |
| 조건을 이름으로 | `if (isEditable(doc))`처럼 조건식을 함수로 감싸고 **긍정형** 이름을 쓴다 | `!isNotEmpty`는 두 번 뒤집어 읽어야 한다 |
| 타입 분기 대신 다형성 | `typeof`·`instanceof` 분기가 반복되면 같은 메서드를 가진 객체들로 바꾼다. 타입 검사가 많으면 TypeScript를 쓴다 | 새 타입을 더할 때 분기를 찾아다니지 않는다 |
| 캡슐화 | 내부 상태는 `#private` 필드로 숨기고 getter·setter로 검증을 끼운다 | 바깥이 상태를 직접 바꾸지 못한다 |
| 상속보다 합성 | `class`의 `extends`는 「is-a」가 분명할 때만 | 깊은 상속은 부모 변경이 자식 전체로 번진다 |
| 비동기 | 콜백 대신 Promise, 체인 대신 `async`/`await` | 흐름이 위에서 아래로 읽힌다([[async-await\|async/await]]) |
| 에러를 삼키지 않는다 | `catch`에서 `console.log`만 하고 넘어가지 않는다. 사용자에게 알리거나 에러 리포터로 보낸다 | 조용한 실패가 가장 찾기 어렵다 |
| 주석 | 주석 처리한 코드, 변경 이력 주석, 구분선 주석을 남기지 않는다 | 이력은 Git이 가진다([[js-comments\|주석]]) |

TypeScript에서는 여기에 타입으로 의도를 드러내는 규칙이 더해진다. `strict`(특히 `strictNullChecks`)를 켜고, 바꾸지 않을 값은 `readonly`·`ReadonlyArray<T>`·`as const`로 표시하고, 유니언·교차가 필요하면 `type`, 확장·구현할 객체 계약이면 `interface`를 쓴다. 세부 규칙은 [[typescript-coding-convention|TypeScript 코딩 컨벤션]]에 있다.

## Google Java 스타일의 이름 규칙

| 대상 | 규칙 | 예 |
| --- | --- | --- |
| 패키지 | 소문자만, 밑줄 없음 | `com.example.deepspace` |
| 클래스 | UpperCamelCase, 명사(구) | `AddressParser`, `ImmutableList` |
| 인터페이스 | UpperCamelCase, 명사 또는 형용사 | `List`, `Readable` |
| 테스트 클래스 | 대상 + `Test` | `MapTest` |
| 메서드 | lowerCamelCase, 동사(구) | `sendMessage` |
| 접근자·변경자·조건자 | `get`·`set`·`is` | `getName`, `isEmpty` |
| 상수 | UPPER_SNAKE_CASE | `MAX_SIZE` |

불리언 이름의 문법은 [[boolean-naming|불리언 변수 이름 짓기]] 노트에 따로 있다.

## 정리

- 나쁜 코드의 비용은 쌓인다. 지나간 자리를 조금씩 낫게 남긴다.
- 함수는 작게, 한 가지만, 한 추상화 수준으로 쓰고 위에서 아래로 읽히게 배치한다.
- 타입 분기는 팩터리 한 곳에 가두고 나머지는 다형성에 맡긴다.
- 인수는 2개 이하를 목표로 하고, 부수 효과는 이름에 드러내거나 분리한다. 값을 돌려주는 함수는 아무것도 바꾸지 않는다.
- 깔끔한 함수는 동작 → 테스트 → 리팩터링 순서로 만든다.
- 이름은 의도를 드러내고, 한 개념에 한 단어를 쓰며, 타입을 넣지 않는다.

관련 노트: [[code-coupling|결합도를 낮추는 전략]], [[code-cohesion|응집도를 높이는 전략]], [[code-predictability|예측 가능성을 높이는 전략]], [[code-readability|가독성을 높이는 전략]], [[boolean-naming|불리언 변수 이름 짓기]], [[simple-design|Simple Design]], [[technical-debt|기술 부채]]
