---
title: "LaTeX 시작하기"
concept: "LaTeX"
summary: "내용과 서식을 분리해 논문·문서를 조판하는 LaTeX의 특징, 설치(TeX Live·MacTeX)와 Overleaf, 문서 기본 구조와 한글(kotex) 설정, 입문 자료."
tags: ["tools", "documentation", "latex", "productivity"]
source: other
date: "2026-10-14"
sources: ["https://80000coding.notion.site/0fc58551fdae4c119d63ee6102d21ac7", "http://wiki.ktug.org/wiki/wiki.php/%EC%B2%98%EC%9D%8C%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0"]
---

> 팔만코딩경(42Seoul 커뮤니티 위키)의 「LaTeX (시작하는 방법과 참고자료)」를 바탕으로 재구성한 노트다.

## LaTeX이란

**LaTeX**(라텍, 레이텍)은 TeX 조판 시스템 위에서 동작하는 문서 작성 언어다. 워드 프로세서처럼 화면에 보이는 대로 꾸미는 대신, **명령어로 문서의 구조(제목, 절, 수식, 참고 문헌)를 적고 서식은 컴파일러가 입힌다.** 결과물은 보통 PDF다.

| | 워드 프로세서 | LaTeX |
| --- | --- | --- |
| 작성 방식 | 보이는 대로 편집(WYSIWYG) | 소스 파일(`.tex`)을 쓰고 컴파일 |
| 서식 | 문단마다 직접 지정 | 문서 클래스·패키지가 일괄 적용 |
| 수식·참고 문헌 | 별도 도구 필요 | 기본 기능. 번호·상호 참조 자동 |
| 버전 관리 | 바이너리라 diff 어려움 | 텍스트라 Git으로 관리 가능 |

수학·공학 논문의 사실상 표준이고, 학회 논문 양식과 이력서 템플릿도 LaTeX으로 많이 배포된다. 노션·마크다운 에디터·Jupyter의 수식 입력도 TeX 수식 문법을 빌려 쓴다. 서식을 문서 앞부분(프리앰블)에서 정하므로, 용지 크기나 양식을 바꿔도 본문은 그대로 둘 수 있다.

## 설치하거나 웹에서 쓰거나

| 방법 | 내용 |
| --- | --- |
| **Overleaf** | 설치 없이 브라우저에서 쓰는 LaTeX 편집기. 저장할 때마다 PDF 미리보기가 갱신되고, 공동 편집과 템플릿 갤러리를 제공한다. 처음 배울 때 가장 쉽다 |
| TeX Live | Windows·Linux용 표준 배포판. 컴파일러와 패키지를 한 번에 설치 |
| MacTeX | macOS용 TeX Live 배포판 (`brew install --cask mactex`) |

로컬에 설치했다면 편집기는 VS Code의 LaTeX Workshop 확장이 흔히 쓰인다. 한국어 환경의 설치 안내는 [KTUG 위키](http://wiki.ktug.org/)에 운영체제별로 정리되어 있다.

## 문서의 기본 구조

```latex
\documentclass{article}       % 문서 종류: article, report, book, beamer(슬라이드) 등
\usepackage{kotex}            % 한글 사용
\usepackage{fullpage}         % 여백 줄이기

\title{문서 제목}
\author{작성자}
\date{\today}                 % 컴파일한 날짜

\begin{document}              % 여기부터 본문
\maketitle                    % 위의 제목·저자·날짜 출력
\tableofcontents              % 목차 자동 생성
\newpage

\section{대단원}
\subsection{중단원}
\subsubsection{소단원}
본문과 수식 $E = mc^2$.

\end{document}
```

- `\documentclass`와 `\begin{document}` 사이가 **프리앰블**이다. 여기서 패키지를 불러오고 서식을 정한다.
- `\section` 계열 명령으로 절을 나누면 번호와 목차가 자동으로 붙는다.
- 한글은 `kotex` 패키지로 쓴다. 컴파일러는 XeLaTeX이나 LuaLaTeX을 고르면 글꼴 설정이 쉽다. Overleaf에서는 메뉴의 Compiler 항목에서 바꾼다.
- LuaLaTeX은 문서 안에서 Lua 스크립트를 실행할 수 있어, 반복 계산이나 그림 생성을 프로그래밍으로 처리하기도 한다.

## 입문 자료

KTUG의 「[처음시작하기](http://wiki.ktug.org/wiki/wiki.php/%EC%B2%98%EC%9D%8C%EC%8B%9C%EC%9E%91%ED%95%98%EA%B8%B0)」 페이지가 아래 한국어 PDF 입문서들을 모아 둔다.

| 자료 | 수준 |
| --- | --- |
| Essential LaTeX (한글판) | 기본을 빠르게 훑기 |
| 모두를 위한 LaTeX | 기본을 더 자세히 |
| lshort 한국어판 (The Not So Short Introduction to LaTeX2e) | 표준 입문서 |
| 워드 프로세서 사용자를 위한 LaTeX | 문서 디자인까지 |

## 정리

- LaTeX은 구조를 명령어로 쓰고 서식은 컴파일러에 맡기는 조판 언어다.
- 처음에는 Overleaf로 시작하고, 로컬에서는 TeX Live·MacTeX을 설치한다.
- 프리앰블에서 클래스·패키지를 정하고, 본문은 `\section` 계열로 구조를 잡는다. 한글은 `kotex`.

관련 노트: [[markdown|Markdown]], [[jupyter-notebook|Jupyter Notebook]]
