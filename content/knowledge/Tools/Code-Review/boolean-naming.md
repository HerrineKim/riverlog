---
title: "불리언 변수 이름 짓기"
concept: "Boolean Naming"
summary: "불리언 변수 이름을 영어 문법에 맞게 짓는 네 가지 형태(is, 조동사, has, 3인칭 단수 동사)와 흔한 실수(is + 동사원형)를 정리한다. Bool·mutating·nonmutating 함수 이름을 구분하는 법도 함께 다룬다."
tags: ["code-review", "clean-code", "naming", "english", "convention"]
source: other
date: "2026-10-13"
sources: ["https://soojin.ro/blog/naming-boolean-variables"]
---

> 김수진의 글 「[Bool 변수 이름 제대로 짓기 위한 최소한의 영어 문법](https://soojin.ro/blog/naming-boolean-variables)」(2018.04)을 요약·재구성한 노트입니다. 예시는 원문대로 Swift·Cocoa Touch API에서 가져왔습니다.

## 왜 문법까지 따지나

불리언 이름은 한 글자 차이로 뜻이 크게 달라진다. 영어가 모국어가 아니면 실수하기 쉽고, 문법이 틀린 이름은 읽는 사람을 헷갈리게 만든다. **불리언 이름은 "예/아니오"로 답할 수 있는 질문**이어야 하고, 그 질문이 영어 문장으로 말이 되어야 한다.

## 네 가지 형태

| 형태 | 뜻 | 예 |
| --- | --- | --- |
| `is` + 명사 | ~인가? | `isDescendant(of:)` |
| `is` + 현재진행형 | ~하는 중인가? | `isExecuting`, `isPending` |
| `is` + 형용사 | ~한 상태인가? | `isOpaque`, `isVisible` |
| `is` + 과거분사 | ~된 상태인가? (수동) | `isHidden`, `isSelected`, `isCompleted` |
| 조동사 + 동사원형 | ~할 수 있나? / ~해야 하나? / ~할 것인가? | `canBecomeFirstResponder`, `shouldRefreshRefetchedObjects` |
| `has` + 명사 | ~를 가지고 있나? | `hasVideo`, `hasiCloudAccount` |
| `has` + 과거분사 | ~한 상태가 유지되고 있나? (현재완료) | `hasConnected`, `hasEnded` |
| 동사 3인칭 단수 | ~하는가? | `supportsVideo`, `allowsEditing` |

### 1. is

가장 흔하다. 과거분사는 "동사로 만든 형용사"로 보면 된다. hide → hidden(숨겨진), select → selected(선택된). 과거분사 형태를 모르면 사전을 찾는다.

**`is` + 동사원형은 쓰지 않는다.** 가장 흔한 실수다.

```swift
var isEdit: Bool       // ✗ 편집인가? 편집하는가? 뜻이 흐리다

var isEditable: Bool   // 편집할 수 있는가?
var isEditing: Bool    // 편집 중인가?
var canEdit: Bool      // 편집할 수 있는가?
```

예외는 있다. .NET의 `DataRowView.IsEdit`처럼 "edit = edit mode"가 그 생태계의 컨벤션이라면 괜찮을 수 있다. 이름에 신경 쓰는 이유가 다른 사람(과 내일의 나)이 빨리 이해하게 하는 것이기 때문이다.

### 2. 조동사

`can`, `should`, `will` 뒤에는 **동사원형**을 쓴다. 지킬 규칙은 이것 하나다.

### 3. has

- `has` + 명사: "~를 가지고 있나?"
- `has` + 과거분사: 과거에 끝난 일이 지금까지 유지되는지 묻는다. `isConnected`·`isEnded`와 뜻이 거의 같아서 몰라도 지장이 적다.

### 4. 동사 3인칭 단수

가장 자연스럽게 읽히는 형태다. 인스턴스가 주어인 문장으로 읽히므로 동사에 **-s/-es**를 붙인다.

| 동사 | 뜻 | 예 |
| --- | --- | --- |
| `supports` | ~을 지원하는가? | `supportsVideo` |
| `includes` / `contains` | ~을 포함하는가? | `includesCallsInRecents` |
| `shows` | ~을 보여 줄 것인가? | `showsBackgroundLocationIndicator` |
| `allows` | ~을 허용하는가? | `allowsEditing` |
| `accepts` | ~을 받아 주는가? | `acceptsFirstResponder` |
| `preserves`, `returns` | ~을 유지하는가? / 돌려주는가? | `preservesSuperviewLayoutMargins` |

**주어가 그 동작을 하지 않으면 3인칭 단수를 쓰지 않는다.** `CLRegion`의 `notifyOnEntry`는 region이 알림을 보내는 주체가 아니라서 `notifies`가 아니다.

## 불리언·변경·비변경 함수 이름 구분

3인칭 단수를 지켜야 하는 이유는 문법만이 아니다. Swift API 디자인 가이드는 **변경(mutating) 함수는 동사원형**, **새 값을 돌려주는(nonmutating) 함수는 -ed/-ing**로 짓는다. (`sort()` / `sorted()`) 불리언이 동사원형을 쓰면 변경 함수와 헷갈린다.

```swift
let overlaps = region1.overlaps(region2)    // Bool: 둘이 겹치는가?
region1.overlap(region2)                     // mutating: region1을 겹친 부분으로 바꾼다
let region3 = region1.overlapping(region2)   // nonmutating: 겹친 부분을 새로 돌려준다
```

## 정리

- 불리언 이름은 영어 문장으로 읽히는 **예/아니오 질문**이다.
- `is` 뒤에는 명사, -ing, 형용사, 과거분사. **`is` + 동사원형은 쓰지 않는다.**
- 조동사 뒤에는 동사원형, 동사로 시작하면 3인칭 단수.
- `has`는 "가지고 있나?"에 주로 쓴다.
- 불리언(`overlaps`), 변경(`overlap`), 비변경(`overlapping`)을 형태로 구분하면 이름만 보고 동작을 안다.

관련 노트: [[review-patterns|코드 리뷰에서 자주 나온 지적]], [[typescript-coding-convention|TypeScript 코딩 컨벤션]]
