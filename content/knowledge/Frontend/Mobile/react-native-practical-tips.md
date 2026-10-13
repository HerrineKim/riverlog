---
title: "React Native 실무 팁: 키보드, 로컬 저장소, 실기기 디버깅"
concept: "RN Tips"
summary: "입력창이 키보드에 가려질 때 KeyboardAvoidingView와 ScrollView를 함께 쓰는 법, AsyncStorage로 키-값 저장하기, ADB로 안드로이드 실기기 연결하기, Snackbar·전역 폰트 같은 자잘한 도구."
tags: ["react-native", "mobile", "frontend", "tips"]
source: mixed
date: "2026-10-13"
sources: ["https://reactnative.dev/blog/2026/06/11/react-native-0.86", "https://riverkim.kr/165", "https://riverkim.kr/154", "https://riverkim.kr/156", "https://riverkim.kr/152", "https://riverkim.kr/150"]
---

> riverkim.kr에 쓴 글들을 바탕으로 재구성한 노트입니다.

React Native 기본 컴포넌트와 스타일은 [React Native 기초](/knowledge/dictionary/frontend/mobile/react-native-basics)에, 리스트와 상호작용은 [React Native 상호작용과 리스트](/knowledge/dictionary/frontend/mobile/react-native-interaction)에 있다. 이 노트는 실무에서 자주 만나는 문제와 도구를 모았다.

## 1. 입력창이 키보드에 가려질 때

로그인 화면에서 입력창을 누르면 키보드가 올라오면서 아래쪽 입력창·버튼이 가려진다. 최상위 `View`를 **`KeyboardAvoidingView`** 로 바꾸고, 내용은 **`ScrollView`** 로 감싸 키보드가 올라와도 스크롤로 닿을 수 있게 한다.

```jsx
import { KeyboardAvoidingView, ScrollView, Platform } from 'react-native'

<KeyboardAvoidingView
  style={{ flex: 1 }}
  behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
  keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 40}
>
  <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
    {/* 아이디·비밀번호 입력창, 로그인 버튼 */}
  </ScrollView>
</KeyboardAvoidingView>
```

### behavior: 키보드가 올라올 때 화면을 어떻게 바꿀지

| 값 | 동작 |
| --- | --- |
| `padding` | 키보드 높이만큼 아래에 padding을 추가해 내용을 밀어 올린다. iOS에서 주로 쓴다 |
| `height` | 뷰의 높이 자체를 키보드만큼 줄인다. Android에서 많이 쓴다 |
| `position` | 뷰 전체를 위로 옮긴다. 원래 키보드 위치와 떨어져 있던 만큼 떨어진 채로 올라온다 |

- **`keyboardVerticalOffset`**: 키보드와 내용 사이에 추가로 둘 거리. 헤더 높이처럼 기기·OS마다 다른 값이 있어 `Platform.OS`로 나눠 준다.
- 예전 Android 앱은 `AndroidManifest.xml`의 `windowSoftInputMode="adjustResize"`만으로 해결되는 경우가 많았다. 하지만 Android 15(target SDK 35)부터 앱이 기본으로 **edge-to-edge**로 그려지면서 `adjustResize`가 화면을 줄여 주지 않는다. React Native 0.86에서 edge-to-edge 환경의 `KeyboardAvoidingView`가 고쳐졌고, 더 세밀한 제어가 필요하면 `react-native-keyboard-controller`를 쓴다(Expo 문서도 이것을 권한다).

### ScrollView에 정렬 스타일을 줬더니 에러가 날 때

```text
ScrollView child layout (["alignItems"]) must be applied through the contentContainerStyle prop.
```

`ScrollView`는 바깥 틀과 안쪽 내용 컨테이너가 따로 있다. `alignItems`·`justifyContent`처럼 **자식 배치에 관한 스타일은 `style`이 아니라 `contentContainerStyle`** 에 준다. 내용이 짧을 때도 화면을 꽉 채우려면 `contentContainerStyle={{ flexGrow: 1 }}`을 함께 준다.

## 2. 로컬 저장소: AsyncStorage

앱을 껐다 켜도 남아야 하는 작은 데이터(토큰, 설정, 마지막 화면)는 **AsyncStorage**에 둔다. 웹의 `localStorage`에 해당하는 비동기·영구·키-값 저장소이며, 앱 전체에서 공유되고 **암호화되지 않는다**.

> React Native 코어에 있던 `import { AsyncStorage } from 'react-native'`는 제거되었다. 커뮤니티 패키지 `@react-native-async-storage/async-storage`를 쓴다.

```js
import AsyncStorage from '@react-native-async-storage/async-storage'

// 저장: 값은 문자열만 된다
await AsyncStorage.setItem('settings', JSON.stringify({ theme: 'dark' }))

// 읽기: 없으면 null
const raw = await AsyncStorage.getItem('settings')
const settings = raw !== null ? JSON.parse(raw) : null
```

| 메서드 | 하는 일 |
| --- | --- |
| `getItem(key)` / `setItem(key, value)` | 읽기 / 쓰기 |
| `removeItem(key)` | 삭제 |
| `mergeItem(key, value)` | 기존 JSON 문자열 값에 새 JSON을 합친다 |
| `getAllKeys()` | 앱이 저장한 모든 키 |
| `multiGet` / `multiSet` / `multiRemove` | 여러 키를 한 번에 처리 |
| `clear()` | **모든** 데이터 삭제. 다른 라이브러리가 저장한 것까지 지우므로 보통은 `multiRemove`로 내 키만 지운다 |

- 모든 메서드가 Promise를 반환하므로 `async`/`await`와 `try`/`catch`로 쓴다.
- 전역 저장소라 키가 충돌하기 쉽다. 직접 여기저기서 부르기보다 **작은 래퍼 모듈**(예: `storage.getSettings()`)로 감싸 키와 직렬화를 한곳에서 관리한다.
- 비밀번호·토큰처럼 민감한 값은 암호화 저장소(`react-native-keychain`, Expo `SecureStore`)를 쓴다.

## 3. 안드로이드 실기기에서 실행하기: ADB

에뮬레이터 대신 내 안드로이드 폰에서 개발 빌드를 돌리려면 **ADB(Android Debug Bridge)** 로 PC와 기기를 연결한다. ADB는 Android SDK Platform-Tools에 들어 있다.

1. 폰에서 **개발자 옵션**을 켜고(설정 → 휴대전화 정보 → 빌드 번호 7번 탭) **USB 디버깅**을 허용한다.
2. PC에 Platform-Tools를 설치하고 `adb`를 PATH에 추가한다.
3. USB로 연결한 뒤 기기가 보이는지 확인한다.

```bash
adb devices                    # 연결된 기기 목록. unauthorized면 폰에서 허용 팝업을 누른다
adb reverse tcp:8081 tcp:8081  # 기기에서 PC의 Metro 번들러(8081)에 접속할 수 있게 연결
npx expo run:android          # Expo 프로젝트 (Community CLI 프로젝트는 npx react-native run-android)
```

## 4. 자잘한 도구

| 하고 싶은 것 | 도구 | 메모 |
| --- | --- | --- |
| 작업 결과를 잠깐 하단에 알리기("저장했습니다", 실행 취소 버튼) | react-native-paper의 [`Snackbar`](https://callstack.github.io/react-native-paper/docs/components/Snackbar) | `visible`, `onDismiss`, `duration`, `action`으로 제어. 웹의 토스트 메시지와 같은 역할 |
| 앱 전체에 같은 폰트 적용 | react-native-global-props의 `setCustomText` | `Text`의 기본 스타일을 한 번에 바꾼다. 오래 관리되지 않은 패키지라, 공통 `AppText` 컴포넌트를 만들어 쓰는 방법이 더 안전하다 |
| 코드 스타일 통일 | ESLint + Prettier | 설정 원리는 웹과 같다. [React 개발 환경](/knowledge/dictionary/frontend/react/tooling) 참고 |

## 정리

- 키보드 가림은 `KeyboardAvoidingView`(iOS `padding`, Android `height`) + `ScrollView`로 해결한다.
- `ScrollView`의 자식 배치 스타일은 `contentContainerStyle`에 준다.
- 로컬 키-값 저장은 `@react-native-async-storage/async-storage`. 문자열만 저장되고 암호화되지 않는다.
- 실기기 개발은 USB 디버깅 + `adb devices`로 연결을 확인하는 것부터 시작한다.

관련 노트: [[react-native-basics|React Native 기초와 스타일링]], [[react-native-interaction|React Native 상호작용과 리스트]], [[codepush|React Native OTA 업데이트와 CodePush]]
