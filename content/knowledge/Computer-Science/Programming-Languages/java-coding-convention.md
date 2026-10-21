---
title: "Java 코딩 컨벤션: Google 스타일과 캠퍼스 핵데이 규칙"
concept: "Java Code Style"
summary: "Java 코드 스타일의 대표 기준인 Google Java Style Guide와 네이버 캠퍼스 핵데이 Java 컨벤션을 항목별로 비교하고, 이름 규칙·import·중괄호·줄 길이·Javadoc 같은 공통 원칙과 Checkstyle·EditorConfig·포매터로 규칙을 자동 적용하는 방법을 정리한다."
tags: ["java", "convention", "clean-code", "tools"]
source: other
date: "2026-10-21"
sources: ["https://google.github.io/styleguide/javaguide.html", "https://naver.github.io/hackday-conventions-java/", "https://github.com/google/google-java-format"]
---

> 「[Google Java Style Guide](https://google.github.io/styleguide/javaguide.html)」와 「[캠퍼스 핵데이 Java 코딩 컨벤션](https://naver.github.io/hackday-conventions-java/)」을 바탕으로 재구성한 노트다.

## 컨벤션을 두는 이유

**코딩 컨벤션은 팀이 코드 모양에 대해 다시 토론하지 않도록 미리 정한 약속이다.** 모양이 같으면 리뷰에서 로직에만 집중할 수 있고, diff에 들여쓰기 변경 같은 잡음이 섞이지 않는다. 어떤 규칙을 고르느냐보다 **하나로 정하고 도구로 강제하는 것**이 중요하다.

## 두 기준 비교

| 항목 | Google Java Style | 캠퍼스 핵데이 |
| --- | --- | --- |
| 들여쓰기 | 공백 **2칸**, 탭 금지 | **하드탭**, 탭 너비 4칸 |
| 줄 바꿈 후 이어지는 줄 | 최소 +4칸 | 최소 한 단계 더 |
| 최대 줄 길이 | **100자** | **120자** |
| 와일드카드 import | 금지(static 포함) | static import에서만 허용 |
| import 순서 | static 그룹 → 일반 그룹, 각 그룹 ASCII 순 | 프로젝트에서 정함 |
| 인코딩·줄바꿈 | UTF-8 | UTF-8, LF, 파일 끝 새 줄 |
| 자동화 | `google-java-format` | Checkstyle 설정 + `.editorconfig` 제공 |

## 공통 원칙

### 파일과 선언

- 파일 하나에 최상위 클래스 하나, 파일 이름은 그 클래스 이름과 같다.
- 한 줄에 문장 하나, 선언문 하나에 변수 하나.
- 배열 대괄호는 타입에 붙인다: `String[] args`.
- `long` 리터럴 접미사는 대문자 `L`(`1l`은 `11`과 헷갈린다).
- 지역 변수는 처음 쓰는 곳 가까이에서 선언한다.

### 이름

| 대상 | 표기 | 예 |
| --- | --- | --- |
| 패키지 | 소문자만, 단어를 붙여 쓴다 | `com.example.orderservice` |
| 클래스·인터페이스·enum·record | UpperCamelCase | `OrderService` |
| 메서드·변수·매개변수 | lowerCamelCase | `findOrder`, `orderId` |
| 상수(`static final`이고 깊게 불변) | UPPER_SNAKE_CASE | `MAX_RETRY` |
| 타입 변수 | 대문자 한 글자, 또는 이름 + `T` | `T`, `RequestT` |
| 테스트 클래스 | 대상 + `Test` | `OrderServiceTest` |

- **약어도 단어처럼 쓴다**: `XmlHttpRequest`, `customerId` (`XMLHTTPRequest`, `customerID`가 아니다). 핵데이 규칙처럼 대문자로 둘 약어 목록을 프로젝트에서 따로 정하기도 한다.
- `m_`, `s_`, `_name` 같은 접두사·접미사를 쓰지 않는다.
- 한국어 발음을 로마자로 옮긴 이름(`moohyungJasan`)을 쓰지 않는다.
- 반복 인덱스·람다 매개변수 같은 임시 변수 말고는 한 글자 이름을 쓰지 않는다.
- 불변이어도 지역 변수는 상수 표기로 쓰지 않는다.

### 중괄호와 공백

- **K&R 스타일**: 여는 중괄호는 줄 끝, 닫는 중괄호는 새 줄. `else`, `catch`, `finally`, do-while의 `while`은 닫는 중괄호와 같은 줄에 쓴다.
- `if`, `for`, `while`은 본문이 한 줄이어도 **중괄호를 쓴다.**
- 쉼표·세미콜론 뒤, 이항·삼항 연산자 앞뒤, 제어 키워드와 `(` 사이에 공백을 둔다. 메서드 이름과 `(` 사이에는 두지 않는다.
- 줄 끝 공백을 남기지 않는다.
- 줄을 나눌 때는 상위 문법 단위에서 나누고, `.`, `::`, `&&` 같은 연산자는 **다음 줄 앞**에 둔다.
- 세로 정렬(여러 줄의 `=`를 맞추기)은 하지 않는다. 한 줄을 바꿀 때 주변 줄까지 바뀌어 diff가 커진다.

### 프로그래밍 관행

- 재정의한 메서드에는 항상 `@Override`를 붙인다.
- 잡은 예외를 무시하지 않는다. 정말 할 일이 없으면 이유를 주석으로 쓴다.
- static 멤버는 인스턴스가 아니라 클래스 이름으로 부른다.
- `switch`는 모든 경우를 다룬다(exhaustive). 옛 `switch`의 fall-through는 주석으로 표시하고, 가능하면 화살표(`->`) 형태를 쓴다.
- `Object.finalize`를 재정의하지 않는다.
- 수식자 순서: `public protected private abstract default static final sealed non-sealed transient volatile synchronized native strictfp`.

### Javadoc

- `public`·`protected` 멤버에는 Javadoc을 단다. `getFoo()`처럼 자명한 것은 생략할 수 있다.
- 첫 문장은 요약 조각(summary fragment)이다. `Returns the id.`처럼 쓰고, `@return the id`만 덩그러니 쓰지 않는다.
- 블록 태그 순서는 `@param` → `@return` → `@throws` → `@deprecated`.
- Java 23부터는 `///`로 시작하는 마크다운 문서 주석도 쓸 수 있다.

## 도구로 강제하기

| 도구 | 역할 |
| --- | --- |
| EditorConfig(`.editorconfig`) | 인코딩, 줄바꿈 문자, 들여쓰기를 편집기 공통으로 맞춘다 |
| 포매터(`google-java-format`, IntelliJ 코드 스타일, Spotless) | 저장·커밋 때 자동으로 모양을 바꾼다. 사람이 신경 쓸 일을 없앤다 |
| Checkstyle | 이름 규칙, import, 줄 길이 위반을 빌드에서 검사한다. CI에서 실패시킨다 |

포매터로 고칠 수 있는 것은 포매터에, 고칠 수 없는 것(이름 규칙 등)은 Checkstyle에 맡긴다. 다른 언어의 같은 구성은 [[eslint-prettier|ESLint와 Prettier]], [[cpp-coding-style|C++ 코딩 표준과 clang-format]]에 있다.

## 정리

- 컨벤션의 가치는 내용보다 일관성과 자동화에 있다.
- Google 스타일은 2칸·100자·와일드카드 금지, 핵데이는 탭·120자다. 하나를 고르고 섞지 않는다.
- 이름은 CamelCase, 약어도 단어처럼, 접두사 없이.
- 중괄호는 항상 쓰고 K&R 스타일로 둔다.
- EditorConfig + 포매터 + Checkstyle을 CI에 건다.

관련 노트: [[java-idioms|Java 실무 관용구]], [[clean-code-functions-naming|클린 코드: 함수와 이름]], [[cpp-coding-style|C++ 코딩 표준과 clang-format]], [[typescript-coding-convention|TypeScript 코딩 컨벤션]], [[eslint-prettier|ESLint와 Prettier]]
