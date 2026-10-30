---
title: "Kotlin 핵심 문법: 널 안전성, 클래스 종류, 지연 초기화, 스코프 함수"
concept: "Kotlin"
summary: "Kotlin이 Java와 다른 핵심 문법을 정리한다. 타입 시스템의 널 안전성, data·sealed·enum 클래스와 object·companion object, lateinit과 by lazy의 차이, let·run·with·apply·also 스코프 함수 고르는 법, 일급 함수와 고차 함수."
tags: ["kotlin", "programming-language", "android", "oop"]
source: other
date: "2026-10-30"
sources: ["https://github.com/4z7l/tech_interview.zip/blob/main/%EC%A7%81%EB%AC%B4/Kotlin.md", "https://kotlinlang.org/docs/scope-functions.html", "https://kotlinlang.org/docs/sealed-classes.html", "https://kotlinlang.org/docs/null-safety.html"]
---

> 4z7l의 「[tech_interview.zip](https://github.com/4z7l/tech_interview.zip)」 저장소 Kotlin 문서를 바탕으로, Kotlin 공식 문서로 확인해 재구성한 노트다.

Kotlin은 JVM·Android·멀티플랫폼에서 도는 정적 타입 언어다. Java와 100% 상호 운용되어 Java 라이브러리와 컬렉션을 그대로 쓰고, Android의 기본 권장 언어다. 위임(`by`)은 [[kotlin-delegation|위임 패턴과 Kotlin by]]에, 함수형 개념 전반은 [[programming-paradigms|프로그래밍 패러다임]]에 있다.

## 널 안전성

Java와 가장 큰 차이는 **널 가능성이 타입의 일부**라는 점이다. `String`에는 `null`을 넣을 수 없고, 넣으려면 `String?`으로 선언해야 한다. 컴파일러가 널 검사 없이 `String?`의 멤버를 부르지 못하게 막아, `NullPointerException`을 대부분 컴파일 단계에서 없앤다.

| 문법 | 뜻 |
| --- | --- |
| `name?.length` | 안전 호출. `name`이 `null`이면 결과도 `null` |
| `name ?: "익명"` | 엘비스 연산자. 왼쪽이 `null`이면 오른쪽 값 |
| `name!!.length` | 「절대 null 아님」 단언. `null`이면 NPE. 가급적 쓰지 않는다 |
| `if (name != null) name.length` | 검사 뒤에는 `String`으로 스마트 캐스트된다 |

Java 코드에서 온 값은 널 여부를 모르는 **플랫폼 타입**(`String!`)이라 검사가 느슨해진다. Java 쪽에 `@Nullable`·`@NonNull`을 붙이면 Kotlin이 그 정보를 읽는다.

## 클래스의 종류

| 종류 | 용도 | 특징 |
| --- | --- | --- |
| `data class` | 데이터만 담는 값 객체 | 주 생성자의 프로퍼티로 `equals`·`hashCode`·`toString`·`copy()`·`componentN()`(구조 분해)을 자동 생성한다 |
| `enum class` | 고정된 상수 집합 | 각 상수는 인스턴스 **하나**뿐이다 |
| `sealed class`·`sealed interface` | 하위 타입을 **같은 모듈·패키지 안으로 제한**한 계층 | 직접 인스턴스화할 수 없다. 하위 타입은 일반 클래스·data class·object 무엇이든 되고, 각각 여러 인스턴스를 가질 수 있다(enum과 다른 점). 컴파일러가 하위 타입을 모두 알아서 `when`이 모든 경우를 다루면 `else`가 필요 없다 |
| `object` | 싱글턴 선언 | 선언과 동시에 하나뿐인 인스턴스가 생긴다(처음 접근할 때 스레드 안전하게 초기화). 클래스를 상속하고 인터페이스를 구현할 수 있다 |
| `companion object` | 클래스에 딸린 객체 | Kotlin에는 `static`이 없다. 클래스 이름으로 부르는 팩터리·상수를 여기에 두고, 클래스의 `private` 멤버에 접근할 수 있다. Java에서 정적 메서드로 보이게 하려면 `@JvmStatic` |

```kotlin
sealed interface UiState {
    data object Loading : UiState
    data class Success(val items: List<Item>) : UiState
    data class Error(val message: String) : UiState
}

fun render(state: UiState) = when (state) {   // else 없이 모든 경우를 검사
    UiState.Loading -> showSpinner()
    is UiState.Success -> showList(state.items)
    is UiState.Error -> showError(state.message)
}
```

화면 상태·네트워크 결과처럼 「정해진 몇 가지 모양 중 하나」를 표현할 때 sealed 계층이 맞다. 새 경우를 추가하면 `when`을 고치지 않은 곳이 컴파일 오류로 드러난다. 같은 발상의 대수적 데이터 타입은 [[functional-programming|함수형 프로그래밍]]에 있다.

## lateinit과 by lazy

둘 다 「선언할 때는 값이 없고 나중에 채운다」를 표현한다.

| 기준 | `lateinit var` | `val ... by lazy { }` |
| --- | --- | --- |
| 변수 | `var`(바꿀 수 있다) | `val`(한 번 정하면 끝) |
| 초기화 시점 | 개발자가 **직접 대입**한다(`onCreate`, DI 주입, 테스트 `@Before`) | **처음 읽을 때** 람다를 실행해 자동으로 만든다 |
| 타입 제한 | 기본형(`Int`, `Boolean` …)과 널 가능 타입에는 못 쓴다 | 제한 없다 |
| 초기화 전에 읽으면 | `UninitializedPropertyAccessException`. `::x.isInitialized`로 확인할 수 있다 | 그 순간 초기화된다 |
| 스레드 | 보호 없음 | 기본 `synchronized`. `lazy(LazyThreadSafetyMode.NONE)`으로 끌 수 있다 |

생명 주기 콜백이나 DI가 값을 넣어 주면 `lateinit`, 비싼 계산을 처음 쓸 때까지 미루고 싶으면 `by lazy`다.

## 스코프 함수

스코프 함수는 객체 하나를 기준으로 짧은 블록을 실행한다. 차이는 **블록 안에서 객체를 무엇으로 부르나(`this`·`it`)** 와 **무엇을 돌려주나(객체 자신·람다 결과)** 두 가지다.

| 함수 | 객체 참조 | 반환값 | 주로 쓰는 곳 |
| --- | --- | --- | --- |
| `let` | `it` | 람다 결과 | 널이 아닐 때만 실행 `user?.let { show(it) }`, 변환 |
| `run` | `this` | 람다 결과 | 객체로 계산해 결과를 얻을 때 |
| `with(obj)` | `this` | 람다 결과 | 확장 함수가 아닌 형태. 이미 있는 객체에 여러 호출을 묶을 때 |
| `apply` | `this` | **객체 자신** | 객체 설정·초기화 `Intent().apply { putExtra(...) }` |
| `also` | `it` | **객체 자신** | 로그·검증 같은 부수 작업을 체인 중간에 끼울 때 |

```kotlin
val request = Request.Builder().apply {
    url(endpoint)
    header("Authorization", token)
}.build()

val length = name?.let { it.trim().length } ?: 0
```

중첩하면 `this`·`it`이 무엇을 가리키는지 헷갈리므로 한 단계로 쓰고, 이름이 중요하면 `let { user -> ... }`처럼 매개변수 이름을 붙인다.

## 함수: 일급 객체와 고차 함수

Kotlin의 함수는 **일급 객체**다. 변수에 담고, 인자로 넘기고, 반환값으로 쓸 수 있다. 함수를 인자로 받거나 돌려주는 함수가 **고차 함수**(`map`, `filter`, `let`)이고, 같은 입력에 늘 같은 출력을 내며 바깥 상태를 바꾸지 않는 함수가 **순수 함수**다. 고차 함수에 넘기는 람다는 `inline` 함수면 객체 생성 없이 호출 자리에 펼쳐져 비용이 거의 없다. 비동기는 콜백 대신 코루틴(`suspend` 함수, `Flow`)으로 쓴다([[android-fundamentals|Android 핵심 개념]]).

## 정리

- 널 가능성이 타입에 들어 있어 `?.`, `?:`로 다루고 `!!`는 피한다
- 값 객체는 data class, 닫힌 경우의 집합은 sealed, 고정 상수는 enum, 싱글턴은 object, 정적 멤버 자리는 companion object다
- 직접 넣어 줄 값은 `lateinit var`, 처음 쓸 때 계산할 값은 `val by lazy`
- 스코프 함수는 참조 방식(`this`/`it`)과 반환값(객체/결과)으로 고른다. 설정은 `apply`, 널 처리는 `let`

관련 노트: [[kotlin-delegation|위임 패턴과 Kotlin by]], [[android-fundamentals|Android 핵심 개념]], [[java-language-basics|Java 언어 기본]], [[singleton-pattern|싱글턴 패턴]], [[dart-language|Dart 핵심 문법]]
