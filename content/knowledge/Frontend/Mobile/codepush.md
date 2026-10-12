---
title: "CodePush로 React Native 앱 업데이트하기"
concept: "CodePush"
summary: "스토어 심사 없이 React Native 앱의 JavaScript 번들만 교체하는 OTA 업데이트의 원리와, App Center CodePush 배포 절차."
tags: ["react-native", "mobile", "deployment", "ci-cd"]
source: notion
date: "2026-10-12"
sources: ["https://riverkim.kr/218"]
---

React Native 앱은 네이티브 코드(앱 바이너리)와 **JavaScript 번들**로 나뉜다. JavaScript만 바뀌었다면 스토어에 새 버전을 올리지 않고 번들만 교체해 사용자 앱을 갱신할 수 있는데, 이런 방식을 **OTA(Over-The-Air) 업데이트**라고 한다. Microsoft의 **CodePush**(Visual Studio App Center)가 대표적인 OTA 서비스였다.

> 참고: Visual Studio App Center(CodePush 포함)는 **2025년 3월 31일에 서비스가 종료**됐다. 지금은 Expo의 **EAS Update**나 CodePush 서버를 직접 호스팅하는 방식이 대안이다. 아래 절차는 당시 기준 기록이지만, "채널(Staging) 배포 → 확인 → Production 승격" 흐름은 다른 OTA 도구에서도 같다.

## 언제 쓰나

| 바뀐 것 | 배포 방법 |
| --- | --- |
| `src`의 JavaScript·이미지 등 번들 리소스만 | OTA 업데이트(CodePush) |
| 네이티브 코드, 네이티브 라이브러리 추가, 권한·설정 변경 | 스토어 배포(새 바이너리) |

OTA로 보낸 번들은 **같은 네이티브 바이너리 버전**에서만 동작해야 한다. 그래서 배포할 때 대상 바이너리 버전을 반드시 지정한다.

## 배포 절차 (App Center 기준)

1. CLI 설치와 로그인

   ```bash
   npm install -g appcenter-cli
   appcenter login   # 브라우저에 뜬 인증 토큰을 터미널에 붙여 넣는다
   ```

   처음 세팅할 때는 앱을 플랫폼별로 따로 등록하고, 앱에 CodePush 클라이언트 SDK(`react-native-code-push`)를 넣어 iOS·Android 배포 키를 설정한다. 한 번만 하면 된다.

   ```bash
   appcenter apps create -d MyApp-Android -o Android -p React-Native
   appcenter apps create -d MyApp-iOS -o iOS -p React-Native
   ```

2. **Staging**에 배포

   ```bash
   # package.json에 appcenter codepush release-react 래퍼 스크립트를 정의해 두고 사용
   yarn push-android -t "1.0.4"   # -t: 대상 바이너리 버전(범위 지정도 가능)
   yarn push-ios -t "1.0.4"

   # 래퍼 스크립트 없이 직접 부를 때 (기본 배포 대상이 Staging)
   appcenter codepush release-react -a <owner>/MyApp-Android -t "1.0.0 - 1.0.4"
   ```

3. 테스트용 빌드(Staging 키를 쓰는 앱)에서 변경 사항을 확인한다.

4. **Production으로 승격(promote)**
   - App Center 웹의 **Distribute → CodePush**에서 Staging 릴리스를 Production으로 승격한다(CLI의 `appcenter codepush promote`로도 가능).
   - 꼭 받아야 하는 수정이면 **필수 업데이트(mandatory)** 로 표시한다.
   - **점진적 배포(rollout)** 비율을 정하면 일부 사용자(예: 20%)에게만 먼저 내보내고 문제가 없을 때 넓힐 수 있다.
   - Production 승격은 실제 사용자 앱에 바로 반영되므로 가장 신중하게 누른다.

5. 앱이 업데이트를 내려받고 재시작되면 반영된 것을 확인한다.

## 주의할 점

- 대상 버전(`-t`)을 빼먹으면 호환되지 않는 바이너리에 번들이 내려가 앱이 깨질 수 있다.
- 스토어 정책상 OTA로 앱의 핵심 목적을 바꾸는 변경은 허용되지 않는다. 버그 수정·소소한 UI 변경 용도로 쓴다.
- 문제가 생기면 이전 릴리스로 롤백할 수 있도록, 릴리스마다 설명을 남겨 둔다.

관련 노트: [React Native 기초](/knowledge/dictionary/frontend/mobile/react-native-basics), [CI/CD](/knowledge/dictionary/devops/ci-cd)
