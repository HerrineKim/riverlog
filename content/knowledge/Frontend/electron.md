---
title: "Electron: 웹 기술로 데스크톱 앱 만들기"
concept: "Electron"
summary: "Electron은 Chromium과 Node.js를 한 앱에 묶어 HTML·CSS·JavaScript로 macOS·Windows·Linux 데스크톱 앱을 만든다. 앱 수명과 OS 기능을 맡는 메인 프로세스, 창마다 뜨는 렌더러 프로세스, 둘을 잇는 preload·contextBridge·IPC 구조와, 기본으로 켜진 컨텍스트 격리·샌드박스 같은 보안 기본값, 패키징과 릴리스 주기, OS 웹뷰를 쓰는 Tauri와의 차이를 정리한다."
tags: ["frontend", "javascript", "nodejs", "browser", "security"]
source: other
date: "2026-10-21"
sources: ["http://jlord.us/essential-electron/", "https://www.electronjs.org/docs/latest/tutorial/process-model", "https://www.electronjs.org/docs/latest/tutorial/security", "https://www.electronjs.org/docs/latest/tutorial/electron-timelines"]
---

> Jessica Lord의 「[Essential Electron](http://jlord.us/essential-electron/)」을 바탕으로, 프로세스 모델·보안 기본값·릴리스 주기는 [Electron 공식 문서](https://www.electronjs.org/docs/latest/)로 확인해 재구성한 노트다.

## Electron이란

**Electron은 Chromium(화면)과 Node.js(파일·네트워크·OS 접근)를 한 실행 파일에 묶은 데스크톱 앱 런타임이다.** 여기에 파일 열기 대화 상자, 알림, 트레이 아이콘, 메뉴 같은 OS 기능 API를 더한다. 한 코드베이스로 macOS·Windows·Linux 앱을 만들고 Mac App Store·Microsoft Store에도 올릴 수 있다.

| 얻는 것 | 대가 |
| --- | --- |
| OS마다 네이티브 언어(Swift·C++·C#)로 세 벌 만들 필요가 없다 | 앱마다 Chromium과 Node를 통째로 싣는다. 설치 파일이 보통 수십~백 MB대이고 메모리도 많이 쓴다 |
| 브라우저 하나(최신 Chromium)만 맞추면 된다. 교차 브라우저 대응이 없다 | Chromium 보안 패치를 따라가려면 Electron을 자주 올려야 한다 |
| npm 생태계와 Node API를 그대로 쓴다 | 렌더러에 Node 권한이 새면 XSS 하나가 원격 코드 실행이 된다 |

VS Code, Slack, Discord, Figma 데스크톱, Notion 데스크톱이 Electron으로 만들어졌다.

## 두 종류의 프로세스

Electron 앱은 Chromium의 [[browser-architecture|다중 프로세스 구조]]를 그대로 물려받는다.

| 프로세스 | 개수 | 하는 일 | 쓸 수 있는 것 |
| --- | --- | --- | --- |
| **메인(main)** | 앱당 하나. 진입점 `main.js` | 앱 수명 주기(시작·종료), 창(`BrowserWindow`) 생성·관리, 메뉴·대화 상자·알림 같은 네이티브 기능 | Node API 전부, Electron 메인 모듈 |
| **렌더러(renderer)** | 창(웹 페이지)마다 하나 | HTML·CSS·JS로 UI를 그린다. 평범한 웹 페이지와 같다 | 웹 API. 기본값으로는 Node API를 **쓸 수 없다** |
| preload 스크립트 | 렌더러마다 | 웹 페이지가 로드되기 전에 렌더러 쪽에서 실행되어, 페이지에 노출할 좁은 API를 만든다 | 제한된 Node·Electron API, `contextBridge` |
| 유틸리티(utility) | 필요할 때 | 메인을 막지 않게 무거운 작업이나 신뢰하지 않는 서비스를 따로 돌린다 | Node API |

비유하면 메인 프로세스는 **운영 체제와 대화하는 뒷단**, 렌더러는 **각 창에 뜬 웹 페이지**다. 렌더러가 파일을 저장하고 싶으면 직접 하지 않고 메인에게 부탁한다.

## IPC: 렌더러와 메인이 대화하는 법

```text
renderer (웹 페이지)            preload                         main
window.api.saveFile(text) ─▶ ipcRenderer.invoke('save', text) ─▶ ipcMain.handle('save', …)
                                                                   └ dialog·fs로 실제 저장
          ◀──────────────────── Promise 결과 ◀────────────────────────┘
```

```javascript
// preload.js: 페이지에 필요한 기능만 좁게 노출한다
const { contextBridge, ipcRenderer } = require('electron')
contextBridge.exposeInMainWorld('api', {
  saveFile: (text) => ipcRenderer.invoke('save-file', text),
})

// main.js
ipcMain.handle('save-file', async (event, text) => {
  const { filePath } = await dialog.showSaveDialog({})
  if (filePath) await fs.promises.writeFile(filePath, text)
  return filePath
})
```

- 요청·응답은 `ipcRenderer.invoke` ↔ `ipcMain.handle`(Promise), 단방향 알림은 `send` ↔ `on`, 메인에서 창으로는 `webContents.send`를 쓴다.
- `ipcRenderer` 자체를 페이지에 통째로 넘기지 않는다. 채널 이름과 인자를 고정한 함수만 노출하고, 메인에서는 `event.senderFrame`으로 보낸 쪽을 검증한다.

## 보안 기본값

렌더러는 원격 콘텐츠나 사용자 입력을 그릴 수 있으므로 **신뢰하지 않는 코드가 돌 수 있는 곳**으로 본다. 그래서 기본값이 점점 잠겼다.

| 설정 | 기본값 | 의미 |
| --- | --- | --- |
| `nodeIntegration` | `false` (Electron 5부터) | 페이지 스크립트에서 `require('fs')`를 못 쓴다 |
| `contextIsolation` | `true` (12부터) | preload와 페이지가 서로 다른 JavaScript 컨텍스트에서 돈다. 페이지가 preload의 객체나 내장 프로토타입을 오염시킬 수 없다 |
| `sandbox` | `true` (20부터) | 렌더러를 Chromium 샌드박스에 가둔다. preload도 제한된 API만 쓴다 |

그 밖에 지킬 것은 공식 보안 체크리스트에 있다. 로컬 파일은 `file://` 대신 사용자 정의 프로토콜로 싣고, 콘텐츠 보안 정책(CSP)을 걸고, 원격 콘텐츠를 연 창에서 `webSecurity`를 끄지 않고, 새 창 열기·이동은 `setWindowOpenHandler`와 `will-navigate`로 허용 목록만 통과시킨다. XSS 자체를 막는 법은 [[web-security|웹 보안: CSRF와 XSS]]에 있다.

과거에는 렌더러에서 `remote` 모듈로 메인 객체를 직접 부르고 `nodeIntegration: true`로 페이지에서 Node를 바로 쓰는 예제가 흔했다. `remote`는 Electron 14에서 빠졌다(`@electron/remote`로 분리).

## 패키징과 릴리스

- 새 프로젝트는 공식 도구 **Electron Forge**로 만들고 패키징·서명·배포한다. electron-builder도 널리 쓴다. macOS는 코드 서명과 공증(notarization), Windows는 코드 서명을 해야 경고 없이 설치된다.
- 자동 업데이트는 `autoUpdater` 모듈과 업데이트 서버(또는 GitHub Releases)로 한다.
- 메이저 버전은 **8주마다** 나오고 최신 세 개 메이저만 지원한다. 메이저마다 Chromium·Node 버전이 함께 오르므로 낡은 Electron을 쓰면 브라우저 보안 패치를 놓친다.

## Tauri와 비교

| | Electron | Tauri |
| --- | --- | --- |
| 화면 엔진 | 앱에 Chromium을 내장 | OS가 가진 웹뷰(macOS WKWebView, Windows WebView2, Linux WebKitGTK) |
| 백엔드 | Node.js | Rust (2.0부터 iOS·Android도 지원) |
| 크기 | 큼 | 수 MB 수준으로 작다 |
| 렌더링 일관성 | 모든 OS에서 같은 Chromium | OS마다 웹뷰 엔진이 달라 브라우저 차이를 다시 맞춰야 한다 |

웹앱으로 충분하면 [[pwa-service-worker|PWA]]가 가장 가볍다. 파일 시스템·트레이·네이티브 메뉴처럼 브라우저가 주지 않는 OS 접근이 필요할 때 Electron이나 Tauri로 간다.

## 정리

- Electron = Chromium + Node.js + OS API. 한 코드로 세 데스크톱 OS를 낸다.
- 메인은 앱과 OS를, 렌더러는 창 하나를 맡는다. 둘은 preload가 노출한 좁은 API와 IPC로만 대화한다.
- 렌더러는 신뢰하지 않는다. Node 통합 끄기, 컨텍스트 격리, 샌드박스가 기본이고 그대로 둔다.
- 8주 주기 메이저를 따라 올려야 Chromium 보안 패치를 받는다.

관련 노트: [[browser-architecture|브라우저 아키텍처: 다중 프로세스, 내비게이션, 렌더러 스레드, 입력 처리]], [[nodejs-runtime|Node.js 런타임과 OS 차이 다루기]], [[mobile-frameworks|모바일 앱 프레임워크 비교: 네이티브·하이브리드·크로스 플랫폼]], [[web-security|웹 보안: CSRF와 XSS]]
