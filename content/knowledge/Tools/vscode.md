---
title: "VS Code 설정과 활용"
concept: "VS Code"
summary: "settings.json과 설정 동기화, launch.json으로 C 프로그램 디버깅, 브라우저에서 저장소를 여는 github.dev, 생산성을 올리는 확장 프로그램까지 VS Code를 쓰며 알아 두면 좋은 기능 모음."
tags: ["tools", "ide", "vscode", "productivity"]
source: other
date: "2026-10-21"
sources: ["https://80000coding.notion.site/9822b952339f49bb8c417a852bfe9b3e", "https://80000coding.notion.site/b06e3c86359c4d528dfe752e1569e4ad", "https://80000coding.notion.site/97dd08bde65843029c77e4ab2d660047", "https://80000coding.notion.site/f55cced001f74015be57953854bf88e0", "https://80000coding.notion.site/e975e8a22e054a08bb38bb868c2dab7f", "https://code.visualstudio.com/docs/configure/settings-sync", "https://react.vlpt.us/basic/27-useful-tools.html", "https://code.visualstudio.com/docs/editing/userdefinedsnippets", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/VScode%20%EB%8B%A8%EC%B6%95%ED%82%A4.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/%ED%84%B0%EB%AF%B8%EB%84%90%EC%97%90%EC%84%9C%20vscode%EC%97%AC%EB%8A%94%20%EB%B0%A9%EB%B2%95%28code%20.%20%EC%A0%81%EC%9A%A9%20%ED%95%98%EB%8A%94%EB%B2%95%29.md", "https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Vscode%20Javascript%20%EC%9E%90%EB%8F%99%EC%99%84%EC%84%B1%20%EC%95%88%EB%90%A0%EB%95%8C.md", "https://code.visualstudio.com/docs/configure/command-line"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「VS Code 설정 동기화하기」, 「VScode에서 디버깅 하는 간단한 방법」, 「github.dev로 간단하게 코드 살펴보기」, 「VS Code extensions for Flutter」, 「VS Code에서 Flutter Icon 검색 팁」을 바탕으로 재구성한 노트다. 「창·파일 오가기」와 「내장 확장을 꺼서 생기는 문제」는 「[Frontend_TIL: VScode 단축키](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/VScode%20%EB%8B%A8%EC%B6%95%ED%82%A4.md)」, 「[터미널에서 vscode여는 방법](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/%ED%84%B0%EB%AF%B8%EB%84%90%EC%97%90%EC%84%9C%20vscode%EC%97%AC%EB%8A%94%20%EB%B0%A9%EB%B2%95%28code%20.%20%EC%A0%81%EC%9A%A9%20%ED%95%98%EB%8A%94%EB%B2%95%29.md)」, 「[Vscode Javascript 자동완성 안될때](https://github.com/AI-Dev-Lex-Kim/Frontend_TIL/blob/master/Tool/Vscode%20Javascript%20%EC%9E%90%EB%8F%99%EC%99%84%EC%84%B1%20%EC%95%88%EB%90%A0%EB%95%8C.md)」를 바탕으로 보강했다.
> 사용자 스니펫은 벨로퍼트의 「[벨로퍼트와 함께하는 모던 리액트](https://react.vlpt.us/)」 중 「[리액트 개발 할 때 사용하면 편리한 도구들](https://react.vlpt.us/basic/27-useful-tools.html)」을 바탕으로 보강했다.

## VS Code란

Visual Studio Code는 Microsoft가 만든 무료 코드 편집기다. 편집기 자체는 가볍고, 언어 지원·디버거·린터 같은 기능은 **확장 프로그램(extension)** 으로 더해 IDE처럼 쓴다. 대부분의 기능은 **명령 팔레트**(`⇧⌘P`, Windows·Linux는 `Ctrl+Shift+P`)에서 이름으로 찾아 실행한다.

### 창·파일 오가기

| 동작 | macOS | Windows·Linux |
| --- | --- | --- |
| 파일 이름으로 열기(Quick Open) | `⌘P` | `Ctrl+P` (Windows에서는 `Ctrl+E`도 같다) |
| 새 창 | `⇧⌘N` | `Ctrl+Shift+N` |
| 폴더 열기 | `⌘O` | `Ctrl+K Ctrl+O` |
| 최근 폴더·작업 영역으로 전환 | `⌃R` | `Ctrl+R` |

터미널에서 `code .`로 현재 폴더를 열려면 명령 팔레트에서 **Shell Command: Install 'code' command in PATH**를 한 번 실행한다(macOS). Windows와 Linux 설치 프로그램은 기본으로 PATH에 넣는다. `code -r .`은 지금 창에서, `code -d a b`는 두 파일을 비교해 연다.

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

## 사용자 스니펫

자주 치는 코드 뼈대는 단축어로 만들어 둔다. 명령 팔레트에서 **Snippets: Configure Snippets**를 열고 언어(예: `javascriptreact`, `typescriptreact`)를 고르면 그 언어용 JSON 파일이 열린다. 프로젝트 전용이면 `.vscode/*.code-snippets`에 둔다.

```json
{
  "React function component": {
    "prefix": "fc",
    "body": [
      "function ${TM_FILENAME_BASE}() {",
      "  return <div>${1}</div>",
      "}",
      "",
      "export default ${TM_FILENAME_BASE}"
    ],
    "description": "파일 이름으로 함수 컴포넌트 만들기"
  }
}
```

- `${TM_FILENAME_BASE}`는 확장자를 뺀 현재 파일 이름, `${1}`·`${2}`는 Tab으로 차례로 옮겨 가는 커서 자리, `$0`은 마지막 커서 자리다.
- 마켓의 스니펫 확장은 쓰지 않는 단축어까지 딸려 오므로, 자주 쓰는 몇 개만 직접 만드는 편이 깔끔하다. 기존 코드를 JSON `body` 배열로 바꾸는 일은 snippet generator 웹 도구에 맡기면 편하다.

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

### 내장 확장을 꺼서 생기는 문제

JavaScript·TypeScript 자동 완성, 정의로 이동, 오류 표시는 따로 설치하지 않아도 되는 **내장(built-in) 확장** 「TypeScript and JavaScript Language Features」가 맡는다. 경고 알림을 보고 이것을 꺼 버리면 `document`·`Array`·`Math`까지 모든 JS·TS 자동 완성이 사라진다. 확장 탭 검색창에 `@builtin`을 입력하면 내장 확장 목록이 나오고, 거기서 다시 켠다. 마크다운 미리보기·Git·Emmet도 내장 확장이라 같은 방식으로 되살린다.

## 정리

- 모든 설정은 `settings.json`이다. 프로젝트 설정은 `.vscode/settings.json`으로 팀과 공유한다.
- Settings Sync로 여러 기기의 설정·확장을 맞춘다.
- 디버깅은 `-g`로 컴파일하고 `launch.json`에 실행 파일과 인자를 적은 뒤 `F5`.
- 남의 저장소를 잠깐 볼 때는 `.` 키로 github.dev를 연다.

관련 노트: [[vim-and-neovim|Vim과 Neovim]], [[windows-dev-environment|Windows 개발 환경]], [[python-pyenv-setup|macOS에서 pyenv로 Python 환경 잡기]]
