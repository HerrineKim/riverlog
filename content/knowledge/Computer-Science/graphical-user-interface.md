---
title: "그래픽 사용자 인터페이스: WIMP, 메타포, 이벤트 기반 프로그래밍, GUI 툴킷"
concept: "Graphical User Interface"
summary: "명령을 기억해 입력하는 CLI와 가능한 동작을 화면에 보여 주는 GUI의 차이, 데스크톱 GUI의 공통 구조인 WIMP(창·아이콘·메뉴·포인터)와 데스크톱 메타포, 재사용 부품인 위젯, GUI 프로그램의 실행 모델인 이벤트 기반 프로그래밍, WYSIWYG를 정리하고, Java Swing을 예로 GUI 툴킷의 컴포넌트 트리·레이아웃 관리자·리스너(옵저버)·UI 스레드 하나만 화면을 바꾸는 EDT 규칙을 다룬다."
tags: ["computer-science", "ui", "ux", "event", "cli", "java"]
source: other
date: "2026-10-23"
sources: ["https://www.youtube.com/watch?v=XIGSJshYb90", "https://www.youtube.com/watch?v=4RPtJ9UyHS0", "고려사이버대학교 Java언어 강의(도성룡 교수, 2023-2학기)"]
---

> CrashCourse의 「[Crash Course Computer Science](https://www.youtube.com/playlist?list=PL8dPuuaLjXtNlUrzyH5r6jN9ulIgZBpdo)」 강의 「Graphical User Interfaces」, 「Keyboards & Command Line Interfaces」 편을 바탕으로 재구성한 노트다.
> GUI 툴킷의 구조(Java Swing)는 고려사이버대학교 「Java언어」(2023-2학기) 강의 내용으로 보강했다.

## GUI란

**그래픽 사용자 인터페이스(GUI, graphical user interface)는 할 수 있는 동작을 그림(창, 아이콘, 버튼)으로 화면에 보여 주고, 사용자가 가리키고 눌러 조작하게 하는 인터페이스다.** 명령을 글자로 입력하는 명령줄 인터페이스(CLI)와 짝을 이룬다.

| | CLI(command line interface) | GUI |
| --- | --- | --- |
| 조작 | 명령과 인자(argument)를 입력하고 엔터, 결과가 글자로 돌아온다 | 화면에서 찾아 가리키고 누른다 |
| 사용자에게 요구하는 것 | 명령 이름을 **기억(recall)** 해야 한다 | 보이는 것 중에서 **알아보면(recognition)** 된다 |
| 배우기 | 어렵다. 무엇이 가능한지 화면이 알려 주지 않는다 | 쉽다. 훈련 없이 둘러보며 익힌다 |
| 강점 | 명령을 이어 붙여 조합하고([[shell-pipeline\|파이프라인]]), 스크립트로 반복을 자동화하고, 원격 서버에 글자만으로 접속한다([[ssh\|SSH]]) | 공간·시각 정보 다루기, 처음 쓰는 사람, 직접 조작 |

프로그래밍은 여전히 글을 쓰는 일이라 CLI가 자연스러운 도구로 남아 있다. 서버 관리와 개발 도구는 대부분 CLI로 쓰고, GUI는 그 위에 얹는 경우가 많다.

## WIMP

데스크톱 운영체제의 GUI는 대부분 같은 네 요소로 짜여 있다. 머리글자를 따 **WIMP**라 한다.

| 요소 | 하는 일 |
| --- | --- |
| 창(Window) | 프로그램 하나를 들여다보는 틀. 여러 개를 띄우고 겹치고 옮긴다 |
| 아이콘(Icon) | 파일·프로그램·동작을 작은 그림으로 나타낸다 |
| 메뉴(Menu) | 할 수 있는 명령의 목록을 펼쳐 보여 준다 |
| 포인터(Pointer) | 마우스 등으로 움직여 화면의 대상을 가리킨다 |

Windows, macOS, 리눅스 데스크톱 환경은 모두 WIMP를 다듬은 형태다. 스마트폰은 포인터 대신 손가락으로 직접 누르고 끄는 터치 인터페이스로 바뀌었지만, 아이콘·메뉴·위젯은 그대로 쓴다([[gesture-interface|제스처 기반 인터페이스]]).

## 메타포: 익숙한 것을 빌려 오기

처음 보는 사람이 바로 쓰려면, 이미 아는 무언가에 빗대야 한다. 데스크톱 GUI는 화면을 **책상 위**에 빗댄 **데스크톱 메타포(desktop metaphor)** 를 쓴다.

| 책상의 물건 | GUI |
| --- | --- |
| 책상 위에 펼쳐 둔 종이 여러 장 | 동시에 열린 여러 창. 겹치면 뒤의 것이 가려진다 |
| 종이 문서와 서류철 | 파일과 폴더 |
| 휴지통 | 지울 파일을 모아 두는 휴지통 |
| 계산기·시계 | 화면에 올려 두는 작은 도구 |
| 가위와 풀로 오려 붙이던 원고 편집 | 잘라내기·복사·붙여넣기 |

- 메타포는 **아래 계층을 감추는 추상화**다. 폴더와 종이 아이콘 아래에는 디렉터리 엔트리와 블록으로 된 [[file-system|파일 시스템]]이 있다. 사용자는 블록을 몰라도 파일을 옮긴다.
- 메타포는 정확한 복제가 아니라 **빗댐**이다. 화면 전체를 방과 가구로 그린 것처럼 현실을 너무 곧이곧대로 옮기면 오히려 쓰기 불편해 실패한다. 살아남은 GUI 요소는 많은 시도가 걸러진 결과다.

### 위젯

GUI 화면은 **위젯(widget)** 이라는 재사용 부품을 조립해 만든다. 버튼, 체크박스, 슬라이더, 탭, 텍스트 상자처럼 실제 물건(누르는 단추, 체크 표시, 미닫이 손잡이, 서류철 색인)을 본떠 쓰임을 짐작하게 한다. 운영체제와 GUI 툴킷이 위젯을 제공하므로 앱마다 버튼을 새로 그리지 않는다. 위젯별 이름과 쓰임은 [[ui-elements-glossary|UI 요소 용어집]]에 있다.

### WYSIWYG

**WYSIWYG(What You See Is What You Get)** 는 화면에 보이는 문서가 인쇄한 결과와 똑같이 보이게 하는 편집 방식이다. 워드프로세서와 디자인 도구가 기본으로 따른다. 반대편에는 소스를 쓰고 컴파일해 결과를 보는 방식이 있다([[latex|LaTeX]]).

## 이벤트 기반 프로그래밍

CLI 프로그램은 대체로 위에서 아래로 실행되고, 입력이 필요한 곳에서 기다린다. GUI 프로그램은 다르다. 사용자가 언제 어느 버튼을 누를지, 어떤 순서로 메뉴를 고를지 알 수 없다. 그래서 GUI는 **이벤트 기반 프로그래밍(event-driven programming)** 으로 짠다. 코드는 정해진 순서로 흐르지 않고, **사건(event)이 일어날 때마다 그 사건에 연결된 함수가 불린다.**

```text
초기화
  ├─ GUI API로 창을 만든다 (제목, 크기)
  ├─ 창 안에 위젯을 놓는다 (어느 창에, 기본 글자, x·y 위치, 너비·높이)
  └─ 위젯의 이벤트에 처리 함수를 등록한다 ("이 버튼의 click은 roll()이 처리한다")
이벤트 루프 (운영체제·툴킷이 돌린다)
  ├─ 클릭·키 입력·스크롤·창 크기 변경을 큐에 쌓는다
  └─ 하나씩 꺼내 등록된 처리 함수(event handler)를 부른다
```

브라우저에서는 같은 구조가 DOM 이벤트로 나타난다.

```js
// 버튼을 누르면 1~20 사이 숫자를 굴려 표시하고, 20이면 배경을 빨갛게
const output = document.querySelector('#result');
const button = document.querySelector('#roll');

function roll() {
  const n = Math.floor(Math.random() * 20) + 1;
  output.value = n;
  document.body.style.background = n === 20 ? 'darkred' : '';
}

button.addEventListener('click', roll);   // click 이벤트의 처리 함수로 등록
```

- `roll`은 한 번도 직접 부르지 않는다. 등록만 해 두면 클릭이 일어날 때마다 루프가 부른다.
- 처리 함수가 오래 걸리면 그동안 다른 이벤트를 처리하지 못해 화면이 멈춘다. 무거운 일은 나눠서 하거나 다른 스레드로 보낸다. 브라우저의 루프는 [[event-loop|이벤트 루프]], 이벤트가 퍼지는 방식은 [[dom-events|DOM 이벤트]], C 그래픽 라이브러리의 루프는 [[c-2d-graphics|C로 하는 2D 그래픽 기초]]에 있다.
- 같은 생각이 서버 쪽에서는 메시지를 사건으로 다루는 구조가 된다([[event-driven-architecture|이벤트 기반 아키텍처]]).

## GUI 툴킷의 구조: Java Swing

GUI 툴킷은 위젯, 배치, 이벤트 연결, 이벤트 루프를 묶어 제공하는 라이브러리다. Java의 Swing은 이 요소들이 이름 붙은 클래스로 드러나 있어 구조를 보기 좋은 사례다.

### Java의 GUI 라이브러리

| 라이브러리 | 그리는 방식 | 현재 위치 |
| --- | --- | --- |
| AWT (Abstract Window Toolkit) | 운영체제의 네이티브 위젯을 빌려 쓴다(중량 컴포넌트) | JDK에 포함. 창·이벤트·그래픽 기반 클래스는 Swing도 그대로 쓴다 |
| Swing | 위젯을 Java가 직접 그린다(경량 컴포넌트). 룩앤필(Look and Feel)을 바꿀 수 있다 | JDK의 `java.desktop` 모듈. 사내 도구, IntelliJ 같은 IDE에서 여전히 쓰인다 |
| JavaFX | 장면 그래프(scene graph), CSS 스타일, 하드웨어 가속 | JDK 11부터 분리되어 OpenJFX로 따로 받는다 |

AWT는 운영체제마다 위젯이 달라 어디서나 같은 모양을 내기 어려웠다. Swing은 AWT의 창과 이벤트 체계 위에서 위젯만 직접 그려 이 문제를 풀었다. 클래스 이름 앞의 `J`(`JButton`, `JFrame`)가 AWT 클래스(`Button`, `Frame`)와 구분하는 표시다.

### 컴포넌트 트리

```text
java.awt.Component          화면에 그려지고 이벤트를 받는 모든 것
└─ java.awt.Container       다른 컴포넌트를 담을 수 있다
   ├─ javax.swing.JComponent    경량 컴포넌트의 공통 부모
   │  ├─ JPanel                 다른 컴포넌트를 묶는 범용 상자
   │  ├─ JLabel, JButton, JCheckBox, JTextField, JTextArea, JList ...
   │  └─ JMenuBar, JMenu, JMenuItem
   └─ java.awt.Window
      ├─ JFrame                 제목 표시줄이 있는 최상위 창
      └─ JDialog                대화상자
```

- **최상위 컨테이너**(`JFrame`, `JDialog`)만 운영체제 창이 되고, 나머지는 그 안에 담겨야 보인다. 최상위 컨테이너의 내용은 **콘텐트 팬(content pane)**에 담기며 `frame.add(c)`는 콘텐트 팬에 넣는 단축 문법이다.
- 화면은 컨테이너 안에 컨테이너를 넣는 트리다. 보통 `JPanel`로 영역을 나누고 그 안에 위젯을 둔다. 브라우저의 DOM 트리와 같은 발상이다.

### 레이아웃 관리자

위치와 크기를 좌표로 주지 않고 **레이아웃 관리자(LayoutManager)**에 맡긴다. 창 크기, 글꼴, 운영체제가 달라져도 배치가 다시 계산된다.

| 레이아웃 | 배치 방식 | 기본으로 쓰는 곳 |
| --- | --- | --- |
| `FlowLayout` | 왼쪽에서 오른쪽으로 흘려 놓고, 넘치면 다음 줄 | `JPanel` |
| `BorderLayout` | 동·서·남·북·가운데 다섯 영역. 가운데가 남는 공간을 차지 | `JFrame`의 콘텐트 팬 |
| `GridLayout` | 같은 크기 칸의 격자 | - |
| `BoxLayout` | 가로나 세로 한 줄로 쌓기 | - |
| `GridBagLayout` | 칸마다 병합·비율·여백을 정하는 격자 | - |

`setLayout(null)`로 절대 좌표를 쓰면 처음엔 쉽지만 창 크기·해상도·글꼴이 바뀔 때 깨진다. 복잡한 화면은 단순한 레이아웃을 패널 단위로 겹쳐 만든다. 웹의 Flexbox·Grid와 같은 발상이다.

### 위임 이벤트 모델

앞 절의 "위젯 이벤트에 처리 함수를 등록한다"가 Swing에서는 세 요소로 나뉜다.

| 요소 | 역할 | 예 |
| --- | --- | --- |
| 이벤트 소스 | 이벤트가 일어나는 컴포넌트 | `JButton` |
| 이벤트 객체 | 무슨 일이 있었는지 담은 정보 | `ActionEvent`, `MouseEvent`, `KeyEvent` |
| 리스너 | 소스에 등록되어 이벤트를 처리하는 객체 | `ActionListener`, `MouseListener` |

컴포넌트가 처리를 등록된 리스너에게 넘기므로 **위임 이벤트 모델**이라 부르며, [[gof-design-patterns|GoF 디자인 패턴]]의 옵저버(Observer) 패턴이다. 메서드가 하나인 리스너(`ActionListener`)는 람다로 쓰고, 메서드가 여럿인 리스너(`MouseListener`는 다섯 개)는 빈 구현을 제공하는 **어댑터 클래스**(`MouseAdapter`, `WindowAdapter`)를 상속해 필요한 것만 오버라이딩한다.

### 단일 스레드 규칙: EDT

Swing 컴포넌트는 스레드 안전하지 않다. 그래서 **화면을 만들고 바꾸는 작업은 모두 이벤트 디스패치 스레드(Event Dispatch Thread, EDT) 하나에서** 한다. EDT가 앞 절에서 말한 이벤트 루프이고, 리스너 코드는 원래 EDT에서 돈다.

| 상황 | 문제 | 해결 |
| --- | --- | --- |
| `main` 스레드에서 바로 `JFrame`을 만든다 | 드물게 화면이 깨지거나 교착이 생길 수 있다 | `SwingUtilities.invokeLater(() -> ...)`로 EDT에 넘긴다 |
| 리스너 안에서 다운로드·DB 조회를 한다 | EDT가 막혀 창이 멈추고 다시 그려지지 않는다 | `SwingWorker`로 작업은 백그라운드 스레드에서, 결과 반영은 `done()`(EDT)에서 |
| 백그라운드 스레드에서 `label.setText()`를 부른다 | 경쟁 상태 | `invokeLater`로 EDT에 넘긴다 |

UI 스레드 하나가 모든 화면 갱신을 맡고 오래 걸리는 일은 밖으로 빼는 구조는 브라우저의 [[event-loop|이벤트 루프]], Android의 메인 스레드도 같다. 백그라운드 작업 쪽 도구는 [[java-concurrency|Java 동시성]]에 있다.

```java
public class Counter {
    private int count = 0;

    private void show() {
        JFrame frame = new JFrame("카운터");
        JLabel label = new JLabel("0", SwingConstants.CENTER);
        JButton plus = new JButton("+1");
        plus.addActionListener(e -> label.setText(String.valueOf(++count)));

        frame.add(label, BorderLayout.CENTER);
        frame.add(plus, BorderLayout.SOUTH);
        frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE); // 기본값은 창만 숨긴다
        frame.pack();                                          // 내용에 맞춰 창 크기 계산
        frame.setVisible(true);                                // 구성을 끝낸 뒤 마지막에
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new Counter().show());
    }
}
```

교재 예제는 흔히 `JFrame`을 상속한 클래스를 만든다. 창에 새 동작을 더하는 게 아니라 쓰기만 한다면 위처럼 필드나 지역 변수로 들고 쓰는 편이 결합이 적다(상속보다 컴포지션).

## 정리

- CLI는 기억해서 입력하고, GUI는 보고 알아본다. CLI는 조합·자동화·원격에, GUI는 배우기 쉬움과 직접 조작에 강하다.
- 데스크톱 GUI는 창·아이콘·메뉴·포인터(WIMP)와, 화면을 책상에 빗댄 데스크톱 메타포로 짜인다. 메타포는 파일 시스템을 감추는 추상화다.
- 화면은 실제 물건을 본뜬 위젯을 조립해 만든다.
- **GUI 프로그램은 이벤트 기반이다. 위젯의 이벤트에 처리 함수를 등록하면 이벤트 루프가 사건마다 그 함수를 부른다.**
- GUI 툴킷(Swing)은 화면을 컨테이너 트리로 짜고, 배치는 좌표 대신 레이아웃 관리자에, 처리는 소스에 등록한 리스너(옵저버)에 맡긴다. 화면 변경은 UI 스레드(EDT)에서만 하고 오래 걸리는 일은 밖으로 뺀다.

관련 노트: [[ui-elements-glossary|UI 요소 용어집]], [[event-loop|브라우저에서 JavaScript가 동작하는 원리: 이벤트 루프]], [[dom-events|DOM 이벤트: 전파, 위임, 커스텀 이벤트]], [[shell-pipeline|셸이 명령을 실행하는 방식]], [[graphics-rendering-basics|컴퓨터 그래픽스 렌더링 기초]], [[gesture-interface|제스처 기반 인터페이스]], [[java-concurrency|Java 동시성]], [[gof-design-patterns|GoF 디자인 패턴]]
