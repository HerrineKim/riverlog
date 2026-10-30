---
title: "Android 핵심 개념: 앱 구성 요소, 생명 주기, 관찰 가능한 상태, Context, SDK 버전"
concept: "Android"
summary: "Android 앱의 네 가지 구성 요소와 인텐트, Activity 생명 주기와 구성 변경, 메인 스레드의 Looper·Handler와 ANR, 그리고 자주 헷갈리는 세 가지. UI 상태를 담는 LiveData와 이를 대체해 가는 Kotlin StateFlow, 스트림 처리의 RxJava·Flow, LiveData의 setValue와 postValue 차이, Application Context와 Activity Context의 수명과 쓰임, minSdk·targetSdk·compileSdk의 의미를 정리한다."
tags: ["mobile", "android", "kotlin", "reactive"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/ea28527e359249d1a3fa91af87374b4e", "https://developer.android.com/topic/libraries/architecture/livedata", "https://developer.android.com/kotlin/flow/stateflow-and-sharedflow", "https://developer.android.com/google/play/requirements/target-sdk", "https://engineering.linecorp.com/ko/blog/introduce-android-fetcher-swift-implementation/", "https://developer.android.com/topic/architecture/data-layer/offline-first", "https://github.com/4z7l/tech_interview.zip/blob/main/%EC%A7%81%EB%AC%B4/Android.md"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「Android 기술 면접 확인하세요. livedata, rxjava, context, postvalue, setvalue, minsdk, targetsdk」를 바탕으로 재구성한 노트다.
> 캐시 먼저 보여 주는 데이터 로딩(Fetcher) 부분은 LINE Engineering 블로그의 「[간편하게 서버 데이터를 로딩하는 Fetcher, Swift로 구현하기](https://engineering.linecorp.com/ko/blog/introduce-android-fetcher-swift-implementation/)」를 바탕으로, Android 공식 문서의 「[Build an offline-first app](https://developer.android.com/topic/architecture/data-layer/offline-first)」으로 확인해 보강했다.
> 앱 구성 요소, Activity 생명 주기, Looper·Handler와 ANR은 4z7l의 「[tech_interview.zip](https://github.com/4z7l/tech_interview.zip)」 저장소의 Android 문서를 바탕으로, Android 공식 문서로 확인해 보강했다.

Android 앱은 시스템이 띄우고 거두는 구성 요소로 이뤄지고, 화면(Activity·Fragment·Composable)이 회전·백그라운드 전환으로 수시로 만들어지고 사라진다. 그래서 **상태를 화면보다 오래 사는 곳(ViewModel)에 두고, 화면은 그 상태를 관찰만 하는** 구조가 기본이다. 이 노트는 그 관찰 도구, 시스템 자원에 접근하는 열쇠인 Context, 그리고 앱이 지원하는 OS 범위를 정하는 SDK 버전을 다룬다.

## 앱 구성 요소와 인텐트

Android 앱은 시스템이 직접 띄우고 거둘 수 있는 **네 가지 구성 요소**로 이뤄진다. 모두 `AndroidManifest.xml`에 선언한다(앱 이름·버전·권한도 여기에 둔다).

| 구성 요소 | 역할 | 예 |
| --- | --- | --- |
| Activity | 화면 하나와 사용자 상호작용의 진입점 | 로그인 화면, 상세 화면 |
| Service | 화면 없이 도는 작업 | 음악 재생(포어그라운드 서비스). 미룰 수 있는 백그라운드 작업은 WorkManager로 한다 |
| BroadcastReceiver | 시스템·앱이 보내는 방송 이벤트를 받는다 | 부팅 완료, 충전 연결. Android 8부터 대부분의 암시적 방송은 매니페스트로 받을 수 없어 코드에서 등록한다 |
| ContentProvider | 앱 사이에 데이터를 공유하는 인터페이스 | 연락처, 미디어 저장소 |

구성 요소끼리는 **인텐트(Intent)** 메시지로 서로를 시작한다. 시작할 클래스를 지정하면 **명시적 인텐트**, 「이 URL을 연다」처럼 동작만 적으면 **암시적 인텐트**다. 암시적 인텐트를 받을 수 있는 앱은 매니페스트의 **인텐트 필터**로 「이런 동작·데이터를 처리한다」고 알리고, 후보가 여럿이면 사용자가 고른다. 인텐트로 객체를 넘기려면 프로세스 경계를 넘을 수 있게 `Parcelable`(또는 `Serializable`)로 직렬화해야 하고, 큰 데이터는 ID만 넘긴다. 다른 화면의 결과를 받을 때는 옛 `startActivityForResult` 대신 Activity Result API(`registerForActivityResult`)를 쓴다.

## Activity 생명 주기와 구성 변경

```text
onCreate ─▶ onStart ─▶ onResume ─▶ [실행 중: 보이고 포커스 있음]
                ▲                        │ 다른 화면이 일부 가림
                │                        ▼
            onRestart                 onPause ─▶ [보이지만 포커스 없음]
                ▲                        │ 완전히 가려짐
                │                        ▼
                └──────────────────── onStop ─▶ onDestroy
```

| 콜백 | 맞는 작업 |
| --- | --- |
| `onCreate` | 레이아웃·ViewModel 연결 같은 한 번 할 초기화 |
| `onStart` / `onStop` | 화면이 보이는 동안만 필요한 것(위치 업데이트, UI 관찰) 시작·정지 |
| `onResume` / `onPause` | 포커스가 있는 동안만 필요한 것(카메라 미리보기). `onPause`는 짧게 끝낸다 |
| `onDestroy` | 남은 자원 정리. 시스템이 프로세스를 죽이면 불리지 않을 수 있다 |

화면 회전, 언어·다크 모드 변경 같은 **구성 변경(configuration change)** 이 일어나면 시스템은 Activity를 **파괴하고 다시 만든다**(`onPause` → `onStop` → `onDestroy` → `onCreate` …). 그래서 화면 상태는 ViewModel(구성 변경을 넘어 산다)에, 프로세스가 죽어도 되살려야 할 작은 값은 `SavedStateHandle`·`onSaveInstanceState`에 둔다. Fragment는 Activity 안에서 화면 일부를 맡는 재사용 단위로 자기 생명 주기와 별도의 뷰 생명 주기(`viewLifecycleOwner`)를 가진다. Jetpack Compose에서는 Composable이 상태에 따라 다시 그려지고, 생명 주기는 `LifecycleOwner`를 관찰해 다룬다.

## 메인 스레드: Looper, Handler, ANR

UI는 **메인(UI) 스레드 하나**에서만 그리고 고친다. 메인 스레드는 **Looper**가 메시지 큐에서 메시지를 하나씩 꺼내 처리하는 이벤트 루프다.

| 구성 | 역할 |
| --- | --- |
| `MessageQueue` | 처리할 `Message`·`Runnable`이 쌓이는 큐 |
| `Looper` | 스레드당 하나. 큐가 비면 기다리고, 메시지가 오면 꺼내 주인 Handler에 넘긴다. 메인 스레드는 기본으로 갖고, 새 스레드는 `Looper.prepare()`로 만들어야 한다 |
| `Handler` | 특정 Looper의 큐에 작업을 넣고(`post`, `sendMessage`), 꺼낸 작업을 그 스레드에서 실행한다. 백그라운드 스레드가 결과를 메인 스레드로 넘길 때 쓴다 |

메인 스레드가 오래 막히면 시스템이 **ANR(Application Not Responding)** 대화상자를 띄운다. 입력 이벤트에 **5초** 안에 반응하지 못하거나, BroadcastReceiver의 `onReceive`가 제때 끝나지 않으면 생긴다. 네트워크·디스크·무거운 계산은 메인 스레드에서 하지 않고, 지금은 Handler를 직접 쓰기보다 **코루틴**(`viewModelScope.launch` + `Dispatchers.IO`)으로 옮긴다. 메인 스레드에서 네트워크를 호출하면 `NetworkOnMainThreadException`이 난다.

목록은 화면 밖으로 나간 항목의 뷰를 재활용하는 `RecyclerView`(ViewHolder 패턴 강제, `DiffUtil`로 바뀐 항목만 갱신)를 쓰고, Compose에서는 `LazyColumn`이 같은 역할을 한다. 옛 `ListView`는 쓰지 않는다.

## 관찰 가능한 상태: LiveData, Flow, RxJava

세 도구 모두 **옵저버 패턴**으로 데이터 변화를 구독하고, 바뀌면 미리 등록한 코드(UI 갱신 등)를 실행한다. 차이는 범위와 생명주기 인식이다.

| 도구 | 성격 | 생명주기 인식 | 스레드 제어 | 지금의 자리 |
| --- | --- | --- | --- | --- |
| LiveData | 값 하나를 담는 관찰 가능한 홀더 (Jetpack) | **내장**. 관찰자가 STARTED·RESUMED일 때만 알리고 DESTROYED면 자동 해지 | 없음. 메인 스레드에서 관찰 | 기존 View·DataBinding 코드에서 여전히 쓰인다 |
| `StateFlow` / `SharedFlow` | Kotlin 코루틴의 핫 스트림. StateFlow는 항상 현재 값을 가진 상태 홀더 | 수집하는 쪽에서 `repeatOnLifecycle`, Compose의 `collectAsStateWithLifecycle`로 맞춘다 | 코루틴 디스패처(`flowOn`)로 지정 | **새 코드의 권장 기본값**. 공식 아키텍처 가이드가 UI 상태를 StateFlow로 노출한다 |
| RxJava | 범용 반응형 스트림 라이브러리 | 없음. 직접 `dispose`해야 한다 | `subscribeOn`·`observeOn`으로 세밀하게 | Kotlin 이전의 레거시 코드. 새 코드는 Flow로 옮겨 가는 추세 |

- **LiveData의 장점은 단순함**이다. 생명주기를 알아서 처리해 메모리 누수와 죽은 화면 갱신을 막고, 러닝 커브가 낮다. 대신 변환 연산이 빈약하고, 도메인·데이터 계층에서 쓰기에는 Android 의존성이 생긴다.
- **스트림 처리**(네트워크 호출을 이어 붙이기, 디바운스, 여러 소스 합치기)는 Flow나 RxJava의 연산자로 쓴다. 데이터 계층은 `Flow`, UI 계층에 노출하는 상태는 `StateFlow`(또는 LiveData)로 나누는 것이 일반적인 구성이다.
- **현재 값만 기억하는 홀더**(LiveData, StateFlow)는 채팅 메시지나 일회성 이벤트처럼 **모든 값이 빠짐없이 전달되어야 하는** 흐름에 맞지 않는다. 빠르게 연달아 바뀌면 중간 값이 합쳐진다. 이런 흐름은 `SharedFlow`나 `Channel`로 다루거나, 목록 자체를 상태로 둔다.

```kotlin
class ChatViewModel(repo: ChatRepository) : ViewModel() {
    val uiState: StateFlow<ChatUiState> = repo.messages()      // Flow<List<Message>>
        .map { ChatUiState(messages = it) }
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5_000), ChatUiState())
}

// Compose 화면
val state by viewModel.uiState.collectAsStateWithLifecycle()
```

반응형 스트림의 일반 개념(Hot·Cold, 연산자)은 [[reactive-programming|반응형 프로그래밍과 RxJS]]와 같다.

### LiveData의 setValue와 postValue

`MutableLiveData`의 값을 바꾸는 방법은 둘이다. Kotlin에서는 `value = x`가 `setValue`다.

| | `setValue(v)` | `postValue(v)` |
| --- | --- | --- |
| 호출 스레드 | **메인 스레드에서만** (아니면 예외) | 아무 스레드 |
| 반영 시점 | 즉시. 바로 다음 줄의 `getValue()`가 새 값이다 | 메인 스레드에 작업을 예약해 나중에 반영 |
| 연속 호출 | 매번 관찰자에게 전달 | 반영 전에 여러 번 부르면 **마지막 값만** 전달된다 |

`postValue` 직후 `getValue()`를 읽으면 아직 옛 값일 수 있다. 백그라운드에서 계산한 결과를 넘길 때만 `postValue`를 쓰고, 코루틴이라면 `withContext(Dispatchers.Main)`에서 `setValue`하거나 StateFlow의 `value`(스레드 안전)를 쓰는 편이 예측 가능하다.

### 캐시 먼저, 네트워크 다음: 로컬을 단일 진실 공급원으로

서버 데이터를 보여 주는 화면은 대개 같은 요구를 가진다. 오프라인이어도 **캐시된 내용을 즉시** 보여 주고, 서버에서 새 값을 받아 오고, 다른 화면에서 같은 데이터가 바뀌어도 함께 갱신되어야 한다. 이 로직을 화면마다 짜지 않고 재사용 모듈(Fetcher, Repository)로 묶는다.

```text
fetch()
  ├─ 1. 로컬 저장소(DB·메모리)의 값을 먼저 내보낸다     → UI: 캐시 + 로딩 표시
  ├─ 2. 원격 API 호출
  │     ├─ 성공 → 로컬 저장소에 쓴다                     (UI에 직접 주지 않는다)
  │     └─ 실패 → 캐시는 그대로 두고 에러 상태만 알린다  → UI: 캐시 + 에러 안내
  └─ 3. UI는 로컬 저장소를 관찰한다 → 저장소가 바뀌면 어디서 바꿨든 UI가 갱신된다
```

| 설계 요소 | 내용 |
| --- | --- |
| 상태 | `loading` · `success` · `error`. 각 상태가 **캐시 데이터를 함께** 실어, 오래된 데이터 + 로딩 표시 같은 조합을 그릴 수 있다 |
| 단일 진실 공급원(single source of truth) | UI는 네트워크 응답이 아니라 로컬 저장소만 본다. 원격 결과도 저장소를 거쳐 들어온다 |
| 제네릭 구성 | 원격 호출, 로컬 읽기·관찰·쓰기를 함수(클로저)로 주입받아 데이터 타입과 무관하게 쓴다 |
| 수명 | 구독은 첫 fetch가 끝나도 유지해 이후 로컬 변경을 받는다. 화면이 보일 때 구독하고 사라질 때 해제한다(Rx의 `Disposable`, 코루틴의 `lifecycleScope`) |

Android에서는 Room이 `Flow`로 테이블 변경을 내보내므로, Repository가 Room `Flow`를 UI에 주고 네트워크 결과는 Room에 쓰는 구성이 공식 권장(오프라인 우선 앱)이다. iOS에서는 같은 구조를 RxSwift·Combine과 Core Data·SwiftData 같은 저장소로 만든다.

## Context

**Context**는 앱이 실행되는 환경에 대한 핸들이다. 리소스·테마 읽기, Activity·Service 시작, 브로드캐스트 송수신, 시스템 서비스·파일·데이터베이스 접근이 모두 Context를 거친다. Activity·Service·Application이 모두 Context를 상속한다.

| 종류 | 수명 | 쓸 때 | 주의 |
| --- | --- | --- | --- |
| Application Context (`applicationContext`) | 앱 프로세스 전체. 프로세스가 만들어질 때 가장 먼저 초기화 | 싱글턴, 데이터베이스, 앱 전역 라이브러리 초기화처럼 **화면보다 오래 사는 객체** | 테마가 없어 다이얼로그·레이아웃 inflate 같은 UI 작업에는 맞지 않는다 |
| Activity Context (`this`, `requireContext()`) | 그 Activity의 생명주기 | 다이얼로그, 테마가 적용된 View 생성, 다른 Activity 시작 | **화면보다 오래 사는 객체가 붙들면 메모리 누수**. 회전 후에도 옛 Activity 전체가 해제되지 않는다 |

원칙은 **필요한 범위에 맞는 가장 짧은 수명의 Context를 쓰되, 오래 보관할 것이면 Application Context**다. ViewModel에 Activity Context를 넘기지 않는 것도 같은 이유다(필요하면 `AndroidViewModel`의 `application`).

## SDK 버전: minSdk, targetSdk, compileSdk

`build.gradle(.kts)`의 세 값은 이름이 비슷하지만 역할이 다르다.

| 설정 | 의미 | 바꾸면 |
| --- | --- | --- |
| `minSdk` | 앱이 설치될 수 있는 **최저 API 레벨** | 이보다 낮은 기기에는 설치되지 않는다. 낮출수록 사용자는 늘고, 옛 OS 분기 코드가 늘어난다 |
| `targetSdk` | 앱이 **테스트되고 맞춰진 API 레벨** | OS는 이 값을 보고 새 동작 변경(권한, 백그라운드 제한 등)을 적용할지 정한다. 더 높은 OS에서는 하위 호환 동작으로 실행된다. 생략하면 `minSdk`와 같게 본다 |
| `compileSdk` | 컴파일에 쓰는 SDK 버전 | 어떤 API를 코드에서 쓸 수 있는지 정할 뿐 런타임 동작은 바꾸지 않는다. 보통 최신으로 둔다 |

관계는 `minSdk ≤ targetSdk ≤ compileSdk`다. `targetSdk`를 올리면 새 OS의 동작 변경이 내 앱에도 적용되므로, 올릴 때마다 해당 버전의 동작 변경 문서를 확인하고 테스트한다. **Google Play는 매년 targetSdk 최소 요구치를 올린다.** 2026년 8월 31일부터 신규 앱과 업데이트는 Android 16(API 36) 이상을 타기팅해야 하고(Wear OS·Automotive는 API 35, TV·XR은 API 34), 기존 앱도 API 35 미만이면 더 높은 OS의 새 사용자에게 노출되지 않는다. 최신 기준은 [Play의 타기팅 요구사항 문서](https://developer.android.com/google/play/requirements/target-sdk)에서 확인한다.

## 정리

- 구성 요소는 Activity·Service·BroadcastReceiver·ContentProvider이고 인텐트로 서로를 시작한다.
- 구성 변경은 Activity를 다시 만든다. 상태는 ViewModel과 SavedStateHandle에 둔다.
- 메인 스레드는 Looper가 도는 이벤트 루프다. 5초 넘게 막으면 ANR이므로 무거운 일은 코루틴으로 옮긴다.
- 상태는 ViewModel에 두고 화면은 관찰만 한다. 새 코드는 StateFlow, 기존 코드는 LiveData가 흔하고, RxJava는 Flow로 옮겨 가는 레거시다.
- 현재 값만 기억하는 홀더는 모든 이벤트 전달이 필요한 흐름에 쓰지 않는다.
- `setValue`는 메인 스레드·즉시, `postValue`는 아무 스레드·나중에·마지막 값만.
- 오래 사는 객체에는 Application Context, UI에는 Activity Context. Activity Context를 오래 붙들면 누수다.
- `minSdk`는 설치 하한, `targetSdk`는 동작 기준, `compileSdk`는 쓸 수 있는 API 범위다.

관련 노트: [[ios-app-fundamentals|iOS 앱 기본 개념]], [[kotlin-delegation|위임 패턴과 Kotlin by]], [[mobile-frameworks|모바일 앱 프레임워크 비교]], [[frontend-mv-architecture|프론트엔드 MV* 아키텍처]], [[reactive-programming|반응형 프로그래밍과 RxJS]]
