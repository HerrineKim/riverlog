---
title: "VS Code 설정과 활용"
concept: "VS Code"
summary: "settings.json과 설정 동기화, launch.json으로 C 프로그램 디버깅, 브라우저에서 저장소를 여는 github.dev, 생산성을 올리는 확장 프로그램까지 VS Code를 쓰며 알아 두면 좋은 기능 모음."
tags: ["tools", "ide", "vscode", "productivity"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/9822b952339f49bb8c417a852bfe9b3e", "https://80000coding.notion.site/b06e3c86359c4d528dfe752e1569e4ad", "https://80000coding.notion.site/97dd08bde65843029c77e4ab2d660047", "https://80000coding.notion.site/f55cced001f74015be57953854bf88e0", "https://80000coding.notion.site/e975e8a22e054a08bb38bb868c2dab7f", "https://code.visualstudio.com/docs/configure/settings-sync"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「VS Code 설정 동기화하기」, 「VScode에서 디버깅 하는 간단한 방법」, 「github.dev로 간단하게 코드 살펴보기」, 「VS Code extensions for Flutter」, 「VS Code에서 Flutter Icon 검색 팁」을 바탕으로 재구성한 노트입니다.

## VS Code란

Visual Studio Code는 Microsoft가 만든 무료 코드 편집기다. 편집기 자체는 가볍고, 언어 지원·디버거·린터 같은 기능은 **확장 프로그램(extension)** 으로 더해 IDE처럼 쓴다. 대부분의 기능은 **명령 팔레트**(`⇧⌘P`, Windows·Linux는 `Ctrl+Shift+P`)에서 이름으로 찾아 실행한다.

## 설정: settings.json

설정 화면(`⌘,`)에서 바꾸는 값은 모두 JSON 파일에 저장된다. 명령 팔레트에서 **Preferences: Open User Settings (JSON)** 을 실행하면 직접 편집할 수 있다.

| 범위 | 위치 | 쓰임 |
| --- | --- | --- |
| 사용자(User) | OS별 사용자 설정 폴더 | 모든 프로젝트에 적용 |
| 워크스페이스 | 프로젝트의 `.vscode/settings.json` | 그 프로젝트에만 적용. 저장소에 커밋해 팀이 공유할 수 있다 |
| 언어별 | `"[dart]": { ... }`처럼 언어 ID로 묶은 블록 | 특정 언어 파일에만 적용 |

```json
{
  "editor.formatOnSave": true,
  "editor.rulers": [80],
  "editor.renderWhitespace": "all",
  "files.trimTrailingWhitespace": true,
  "files.insertFinalNewline": true,
  "[c]": { "editor.insertSpaces": false, "editor.tabSize": 4 }
}
```

편집기와 상관없이 팀 전체의 들여쓰기·줄바꿈 규칙을 맞추려면 저장소 루트에 `.editorconfig`를 두는 방법도 있다. VS Code는 EditorConfig 확장을 설치하면 이 파일을 읽는다.

## 설정 동기화 (Settings Sync)

여러 기기에서 같은 환경을 쓰려면 명령 팔레트에서 **Settings Sync: Turn On**을 실행하고 GitHub 또는 Microsoft 계정으로 로그인한다. 설정, 단축키, 사용자 스니펫, 확장 목록, UI 상태가 클라우드에 올라가고 이후 변경은 자동으로 동기화된다.

다른 기기에서 처음 켤 때 로컬 설정과 클라우드 설정이 다르면 고르게 한다.

| 선택 | 결과 |
| --- | --- |
| Merge | 클라우드 설정을 가져와 로컬과 합친다. 충돌이 나면 Accept Local / Accept Remote / Show Conflicts(diff로 직접 해결) 중에 고른다 |
| Replace Local | 로컬 설정을 버리고 클라우드 설정으로 덮어쓴다 |

동기화된 기기와 기록은 **Settings Sync: Show Synced Data**에서 본다.

## 디버깅: launch.json

`printf`를 찍는 대신 중단점을 걸고 변수를 보며 한 줄씩 실행하려면 디버거를 연결한다. C·C++을 macOS의 LLDB로 디버깅하는 예다.

1. 확장 **CodeLLDB**를 설치한다. (Microsoft의 C/C++ 확장도 디버거를 제공한다.)
2. 실행할 프로그램을 **`-g` 옵션으로 컴파일**해 디버그 정보를 넣는다: `cc -g main.c -o a.out`
3. 실행 및 디버그 패널에서 **create a launch.json file** → LLDB를 고르면 `.vscode/launch.json`이 생긴다.
4. `program`과 `args`를 채우고 `F5`로 시작한다.

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "lldb",
      "request": "launch",
      "name": "Debug a.out",
      "program": "${workspaceFolder}/a.out",
      "args": ["1", "2", "3"],
      "cwd": "${workspaceFolder}"
    }
  ]
}
```

설정에서 `debug.inlineValues`를 켜면 디버깅 중 변수 값이 코드 줄 옆에 바로 표시된다.

## github.dev: 클론 없이 브라우저에서 열기

GitHub 저장소 페이지에서 **`.` 키**를 누르거나 주소의 `github.com`을 `github.dev`로 바꾸면 브라우저 안에서 VS Code 편집기가 열린다. 파일 트리를 보며 탐색하고, 파일을 고쳐 바로 커밋할 수도 있다.

- 터미널이 없고 코드를 실행할 수 없다. 실행·빌드까지 필요하면 클라우드 개발 환경인 **GitHub Codespaces**를 쓴다.
- 함수 정의로 이동 같은 언어 기능은 일부 언어에서만 제한적으로 된다.
- `⌘W` 같은 단축키가 브라우저 단축키와 겹칠 수 있다.

## 쓸 만한 확장 프로그램

확장 탭은 `⇧⌘X`로 연다.

| 확장 | 하는 일 |
| --- | --- |
| Error Lens | 오류·경고를 Problems 탭이 아니라 해당 코드 줄 끝에 바로 표시 |
| Todo Tree | `TODO`, `FIXME` 주석을 모아 트리로 보여 준다 |
| Project Manager | 자주 여는 프로젝트를 즐겨찾기하고, 지정한 폴더 아래의 Git 저장소를 자동으로 목록화 |
| indent-rainbow | 들여쓰기 깊이마다 다른 색을 칠한다 |
| TabOut | 괄호·따옴표 안에서 `Tab`을 누르면 닫는 기호 밖으로 커서가 나간다 |
| Version Lens | `package.json`, `pubspec.yaml` 같은 의존성 파일에서 패키지의 최신 버전을 보여 주고 바꿔 준다 |
| EditorConfig | `.editorconfig` 규칙을 편집기에 적용 |

언어별 공식 확장도 있다. Flutter 확장을 설치하면 Dart 확장이 함께 깔리고 저장 시 포매팅·자동 수정이 켜진다. 자동 완성 목록(IntelliSense, `⌃Space`)에서 항목 오른쪽의 `>`를 누르면 상세 정보가 펼쳐지는데, Flutter의 `Icons.*` 항목은 여기서 아이콘 모양을 미리 볼 수 있다.

## 정리

- 모든 설정은 `settings.json`이다. 프로젝트 설정은 `.vscode/settings.json`으로 팀과 공유한다.
- Settings Sync로 여러 기기의 설정·확장을 맞춘다.
- 디버깅은 `-g`로 컴파일하고 `launch.json`에 실행 파일과 인자를 적은 뒤 `F5`.
- 남의 저장소를 잠깐 볼 때는 `.` 키로 github.dev를 연다.

관련 노트: [[vim-and-neovim|Vim과 Neovim]], [[windows-dev-environment|Windows 개발 환경]], [[python-pyenv-setup|macOS에서 pyenv로 Python 환경 잡기]]
