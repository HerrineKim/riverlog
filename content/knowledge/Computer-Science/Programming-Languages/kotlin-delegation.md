---
title: "위임 패턴과 Kotlin by"
concept: "Delegation"
summary: "객체가 받은 요청을 다른 객체에 넘겨 처리하는 위임 패턴과, 이를 언어 문법으로 지원하는 Kotlin의 by 키워드를 정리한다. 클래스 위임은 인터페이스 구현을 통째로 다른 객체에 맡기고, 프로퍼티 위임은 getter/setter를 맡기며, by lazy와 by viewModels()가 그 대표적인 쓰임이다."
tags: ["oop", "design-pattern", "mobile", "programming-paradigm"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/6c7136862b56453085d30f48cf702ba4", "https://kotlinlang.org/docs/delegation.html", "https://kotlinlang.org/docs/delegated-properties.html"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「[Kotlin] by 키워드」를 바탕으로 재구성한 노트입니다.

## 위임 패턴이란

위임(delegation)은 객체가 받은 요청을 **직접 처리하지 않고 가지고 있는 다른 객체(helper)에게 넘기는** 방식이다. 상속이 "부모의 구현을 내 것으로 물려받는" 것이라면, 위임은 "구현을 가진 객체를 품고 일을 맡기는" 것이다.

```kotlin
class Rectangle(val width: Int, val height: Int) {
    fun area() = width * height
}

class Window(val bounds: Rectangle) {
    fun area() = bounds.area()   // 요청을 bounds에 넘긴다
}
```

| 비교 | 상속 | 위임(합성) |
| --- | --- | --- |
| 관계 | is-a | has-a |
| 결합 | 부모 구현 세부에 강하게 묶인다 | 인터페이스로만 의존한다 |
| 교체 | 컴파일 시점에 고정 | 실행 중에 다른 객체로 바꿀 수 있다 |
| 단점 | 부모 변경이 자식을 깨뜨린다 | 넘겨주는 메서드를 일일이 써야 한다 |

"상속보다 합성"이 권장되는 이유가 왼쪽 열의 결합 문제다. 오른쪽 열의 단점, 즉 **위임용 보일러플레이트**를 Kotlin은 `by`로 없앤다.

## 클래스 위임

`인터페이스 by 객체`라고 쓰면 컴파일러가 그 인터페이스의 모든 메서드를 해당 객체로 넘기는 코드를 생성한다.

```kotlin
interface ClosedShape { fun area(): Int }
class Rectangle(val w: Int, val h: Int) : ClosedShape { override fun area() = w * h }
class Circle(val r: Int) : ClosedShape { override fun area() = r * r * 3 }

class Window(private val bounds: ClosedShape) : ClosedShape by bounds

Window(Circle(5)).area()        // 75
Window(Rectangle(4, 5)).area()  // 20
```

- `Window`는 `ClosedShape`를 구현하지만 `area()`를 직접 쓰지 않는다.
- 필요한 메서드만 `override`하면 그 메서드는 위임 대신 직접 구현이 쓰인다. 데코레이터 패턴(일부 동작만 감싸기)이 몇 줄로 끝난다.
- 위임 대상은 **인터페이스**여야 한다. 클래스 자체를 `by`로 위임할 수는 없다.

## 프로퍼티 위임

`val/var 이름: 타입 by 위임객체`는 프로퍼티의 접근자(getter/setter)를 위임 객체의 `getValue`/`setValue` 연산자에 맡긴다.

```kotlin
import kotlin.reflect.KProperty

class Logged {
    private var value = ""
    operator fun getValue(thisRef: Any?, property: KProperty<*>): String = value
    operator fun setValue(thisRef: Any?, property: KProperty<*>, newValue: String) {
        println("${property.name}: $value -> $newValue")
        value = newValue
    }
}

class User { var name: String by Logged() }

val u = User()
u.name = "Kim"   // name:  -> Kim 출력
```

`u.name`을 읽으면 `getValue`가, 쓰면 `setValue`가 불린다. 값 검증, 변경 로그, 지연 계산처럼 **여러 프로퍼티에 반복되는 접근 로직**을 한 클래스로 뽑아낼 수 있다.

## 표준 위임

| 위임 | 동작 |
| --- | --- |
| `by lazy { ... }` | 처음 읽을 때 람다를 실행해 값을 만들고, 이후에는 저장된 값을 돌려준다. 기본은 스레드 안전(synchronized) |
| `Delegates.observable(초깃값) { ... }` | 값이 바뀔 때마다 콜백 호출 |
| `Delegates.vetoable(초깃값) { ... }` | 콜백이 `false`를 돌려주면 변경을 거부 |
| `by map` | 프로퍼티를 맵의 같은 이름 키에서 읽는다 (JSON 같은 동적 데이터) |
| `by ::other` | 다른 프로퍼티로 넘긴다 (이름 변경 시 하위 호환) |

```kotlin
val config: Config by lazy {
    println("computed!")
    loadConfig()          // 첫 접근에서 한 번만 실행
}
```

### Android의 by viewModels()

```kotlin
class MainActivity : ComponentActivity() {
    private val viewModel: MainViewModel by viewModels()
}
```

`viewModels()`는 `Lazy<VM>`을 돌려주는 함수다. 내부 구현은 `by lazy`와 같은 원리로, 처음 접근할 때 `ViewModelProvider`에서 ViewModel을 얻어 캐시하고 이후에는 캐시를 돌려준다. 그래서 Activity가 화면 회전으로 다시 만들어져도 같은 ViewModel 인스턴스를 받는다. Fragment에서는 `by viewModels()`(Fragment 범위)와 `by activityViewModels()`(Activity 범위 공유)를 구분해 쓴다.

## 정리

- 위임은 구현을 상속받지 않고 다른 객체에 일을 맡기는 방식이며, 상속보다 결합이 느슨하다.
- Kotlin의 클래스 위임(`: 인터페이스 by 객체`)은 넘겨주기 코드를 컴파일러가 대신 생성한다.
- 프로퍼티 위임은 getter/setter를 `getValue`/`setValue`를 가진 객체에 맡긴다.
- `by lazy`, `Delegates.observable`, `by viewModels()`가 모두 프로퍼티 위임이다.

관련 노트: [[abstract-class-vs-interface|추상 클래스와 인터페이스]], [[js-design-patterns|JavaScript 디자인 패턴: 생성 패턴]], [[mobile-frameworks|모바일 앱 프레임워크 비교]]
