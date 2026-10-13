---
title: "React Native OTA 업데이트와 CodePush"
concept: "OTA Update"
summary: "스토어 심사 없이 React Native 앱의 JavaScript 번들만 교체하는 OTA 업데이트의 원리, 채널 배포 → 확인 → 승격 흐름, 도구 선택(EAS Update, 자체 호스팅 CodePush 서버). App Center CodePush는 2025년 3월 종료됐다."
tags: ["react-native", "mobile", "deployment", "ci-cd"]
source: notion
date: "2026-10-13"
sources: ["https://riverkim.kr/218", "https://aka.ms/appcenter/retire", "https://docs.expo.dev/eas-update/introduction/"]
---

React Native 앱은 네이티브 코드(앱 바이너리)와 **JavaScript 번들**로 나뉜다. JavaScript만 바뀌었다면 스토어에 새 버전을 올리지 않고 번들만 교체해 사용자 앱을 갱신할 수 있다. 이 방식을 **OTA(Over-The-Air) 업데이트**라고 한다. Microsoft의 **CodePush**가 이 방식을 대중화했다.

## 언제 쓰나

| 바뀐 것 | 배포 방법 |
| --- | --- |
| `src`의 JavaScript·이미지 등 번들 리소스만 | OTA 업데이트 |
| 네이티브 코드, 네이티브 라이브러리 추가, 권한·설정 변경, React Native·Expo SDK 업그레이드 | 스토어 배포(새 바이너리) |

OTA로 보낸 번들은 **같은 네이티브 바이너리 버전**에서만 동작해야 한다. 그래서 배포할 때 대상 바이너리 버전(CodePush의 target binary version, Expo의 runtime version)을 반드시 맞춘다.

## 도구

| 도구 | 성격 |
| --- | --- |
| **EAS Update** (Expo) | Expo 프로젝트의 기본 OTA 서비스. 채널·브랜치로 배포 대상을 나누고 `runtimeVersion`으로 호환 바이너리를 지정한다. Expo 모듈을 쓰면 bare React Native 앱에도 붙일 수 있다 |
| 자체 호스팅 CodePush 서버 | App Center 종료에 맞춰 Microsoft가 공개한 독립형 `code-push-server`를 직접 운영한다. 클라이언트 SDK `react-native-code-push`를 그대로 쓴다. 저장소는 2025년에 보관(archived) 처리돼 유지보수는 직접 해야 한다 |
| 관리형 CodePush 호환 서비스 | 서드파티가 CodePush 호환 서버를 서비스로 제공한다. 서비스 지속성과 비용을 확인하고 고른다 |

새 프로젝트라면 Expo 기반으로 시작하고 EAS Update를 쓰는 것이 가장 간단하다.

## 배포 흐름

도구가 달라도 흐름은 같다.

```text
번들 빌드 ─▶ 테스트 채널(Staging/preview)에 배포 ─▶ 테스트 빌드에서 확인
          ─▶ 운영 채널(Production)로 승격(promote) ─▶ 앱이 다음 실행 때 내려받아 반영
```

- **필수 업데이트(mandatory)**: 꼭 받아야 하는 수정이면 즉시 적용되게 표시한다.
- **점진적 배포(rollout)**: 일부 사용자(예: 20%)에게 먼저 내보내고 문제가 없으면 넓힌다.
- **롤백**: 문제가 생기면 이전 릴리스로 되돌린다. 그러려면 릴리스마다 설명을 남긴다.
- 운영 채널 승격은 실제 사용자 앱에 바로 반영되므로 가장 신중하게 한다.

## 주의할 점

- 대상 바이너리 버전을 잘못 지정하면 호환되지 않는 바이너리에 번들이 내려가 앱이 깨진다.
- App Store·Google Play 정책상 OTA로 앱의 핵심 목적을 바꾸는 변경은 허용되지 않는다. 버그 수정·소소한 UI 변경 용도로 쓴다.
- OTA 번들도 코드 서명·HTTPS 전달로 위변조를 막는다(EAS Update의 code signing, CodePush의 code signing 옵션).

## 역사: App Center CodePush

CodePush는 Visual Studio App Center의 서비스로 제공됐고, App Center는 **2025년 3월 31일에 종료**됐다. 당시에는 `appcenter-cli`로 로그인하고, 플랫폼별로 앱을 등록한 뒤 `appcenter codepush release-react -a <owner>/<app> -t "1.0.0 - 1.0.4"`로 Staging에 배포하고, 웹 콘솔이나 `appcenter codepush promote`로 Production에 승격했다. 이 명령들은 더 이상 동작하지 않는다.

## 정리

- OTA 업데이트는 네이티브 바이너리는 그대로 두고 JavaScript 번들만 바꾼다. 네이티브 변경은 스토어 배포다.
- 대상 바이너리(런타임) 버전을 맞추는 것이 가장 중요하다.
- 테스트 채널 → 확인 → 운영 승격, 필요하면 점진적 배포와 롤백.
- App Center는 끝났다. Expo 프로젝트는 EAS Update, 기존 CodePush 앱은 자체 호스팅 서버나 호환 서비스로 옮긴다.

관련 노트: [[react-native-basics|React Native 기초와 스타일링]], [[react-native-practical-tips|React Native 실무 팁]], [[ci-cd|CI/CD]]
