---
title: "Java Swing GUI: 컴포넌트, 레이아웃 관리자, 이벤트 리스너, EDT"
concept: "Java Swing"
summary: "Java 데스크톱 GUI 라이브러리인 AWT·Swing·JavaFX의 차이와, Swing 프로그램의 뼈대인 컴포넌트 계층, 레이아웃 관리자, 위임 이벤트 모델(소스·이벤트·리스너), 그리고 모든 UI 작업을 이벤트 디스패치 스레드(EDT) 하나에서 해야 한다는 규칙을 정리한다."
tags: ["java", "ui", "event", "oop", "concurrency"]
source: other
date: "2026-10-31"
sources: ["고려사이버대학교 Java언어 강의(도성룡 교수, 2023-2학기)"]
---

> 고려사이버대학교 「Java언어」(2023-2학기) 강의 내용을 바탕으로 정리했다.

## Java의 GUI 라이브러리

| 라이브러리 | 그리는 방식 | 현재 위치 |
| --- | --- | --- |
| AWT (Abstract Window Toolkit) | 운영체제의 네이티브 위젯을 빌려 쓴다(중량 컴포넌트) | JDK에 포함. 이벤트·그래픽 기반 클래스는 Swing도 그대로 쓴다 |
| Swing | Java가 직접 그린다(경량 컴포넌트). 룩앤필(Look and Feel)을 바꿀 수 있다 | JDK의 `java.desktop` 모듈에 포함. 사내 도구, IntelliJ 같은 IDE에서 여전히 쓰인다 |
| JavaFX | 장면 그래프(scene graph)와 CSS 스타일, 하드웨어 가속 | JDK 11부터 JDK에서 분리되어 OpenJFX로 따로 받는다 |

AWT는 운영체제마다 위젯이 달라 어디서나 같은 모양을 내기 어려웠다. Swing은 AWT의 창과 이벤트 체계 위에서 버튼·텍스트 필드 같은 위젯을 Java 코드로 직접 그려 이 문제를 풀었다. Swing 클래스 이름 앞의 `J`(`JButton`, `JFrame`)가 AWT 클래스(`Button`, `Frame`)와 구분하는 표시다.

GUI 일반의 개념(WIMP, 위젯, 이벤트 기반 프로그래밍)은 [[graphical-user-interface|그래픽 사용자 인터페이스]]에 있다.

## 컴포넌트 계층

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

- **최상위 컨테이너**(`JFrame`, `JDialog`)만 운영체제 창이 된다. 나머지 컴포넌트는 그 안에 담겨야 화면에 보인다.
- 최상위 컨테이너의 내용은 **콘텐트 팬(content pane)**에 담긴다. `frame.add(c)`는 콘텐트 팬에 넣는 단축 문법이다.
- 화면 구성은 컨테이너 안에 컨테이너를 넣는 트리다. 보통 `JPanel`로 영역을 나누고 그 안에 위젯을 둔다.

## 레이아웃 관리자

컴포넌트의 위치와 크기는 좌표를 직접 주지 않고 **레이아웃 관리자(LayoutManager)**에 맡긴다. 창 크기가 바뀌거나 글꼴·운영체제가 달라도 배치가 다시 계산된다.

| 레이아웃 | 배치 방식 | 기본으로 쓰는 곳 |
| --- | --- | --- |
| `FlowLayout` | 왼쪽에서 오른쪽으로 흘려 놓고, 넘치면 다음 줄 | `JPanel` |
| `BorderLayout` | 동·서·남·북·가운데 다섯 영역. 가운데가 남는 공간을 차지 | `JFrame`의 콘텐트 팬 |
| `GridLayout` | 같은 크기의 칸으로 나눈 격자 | - |
| `BoxLayout` | 한 줄(가로 또는 세로)로 쌓기 | - |
| `GridBagLayout` | 칸마다 병합·비율·여백을 지정하는 격자 | - |

`setLayout(null)`로 절대 좌표를 쓰면 처음엔 쉽지만 창 크기·해상도·글꼴이 바뀔 때 깨진다. 복잡한 화면은 단순한 레이아웃을 패널 단위로 겹쳐 만든다. 웹의 Flexbox·Grid와 같은 발상이다.

## 이벤트 처리: 위임 이벤트 모델

Swing은 사용자의 동작을 세 요소로 처리한다.

| 요소 | 역할 | 예 |
| --- | --- | --- |
| 이벤트 소스 | 이벤트가 일어나는 컴포넌트 | `JButton` |
| 이벤트 객체 | 무슨 일이 있었는지 담은 정보 | `ActionEvent`, `MouseEvent`, `KeyEvent` |
| 리스너 | 이벤트를 받아 처리하는 객체. 소스에 등록한다 | `ActionListener`, `MouseListener` |

컴포넌트가 처리를 직접 하지 않고 등록된 리스너에게 맡기므로 **위임 이벤트 모델**이라 부른다. [[gof-design-patterns|GoF 디자인 패턴]]의 옵저버(Observer) 패턴이다.

```java
JButton button = new JButton("더하기");
button.addActionListener(e -> result.setText(String.valueOf(a() + b())));
```

- 메서드가 하나인 리스너(`ActionListener`)는 람다로 쓴다.
- 메서드가 여럿인 리스너(`MouseListener`는 다섯 개)는 필요한 것만 오버라이딩할 수 있게 빈 구현을 제공하는 **어댑터 클래스**(`MouseAdapter`, `WindowAdapter`)를 상속한다.

## 단일 스레드 규칙: EDT

Swing 컴포넌트는 스레드 안전하지 않다. 그래서 **화면을 만들고 바꾸는 모든 작업은 이벤트 디스패치 스레드(Event Dispatch Thread, EDT) 하나에서만** 한다. 리스너 코드는 원래 EDT에서 실행된다.

| 상황 | 문제 | 해결 |
| --- | --- | --- |
| `main` 스레드에서 바로 `JFrame`을 만든다 | 드물게 화면이 깨지거나 교착이 생길 수 있다 | `SwingUtilities.invokeLater(() -> ...)`로 EDT에 넘긴다 |
| 리스너 안에서 파일 다운로드·DB 조회를 한다 | EDT가 막혀 창이 멈추고 다시 그려지지 않는다 | `SwingWorker`로 작업은 백그라운드 스레드에서, 결과 반영은 `done()`(EDT)에서 |
| 백그라운드 스레드에서 `label.setText()`를 부른다 | 경쟁 상태 | `invokeLater`로 EDT에 넘긴다 |

이벤트 루프 하나가 모든 UI를 처리하고 오래 걸리는 일은 밖으로 빼는 구조는 브라우저의 [[event-loop|JavaScript 이벤트 루프]], Android의 메인 스레드와 같다.

## 기본 뼈대

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
        frame.pack();                                          // 내용 크기에 맞춰 창 크기 계산
        frame.setVisible(true);                                // 구성을 끝낸 뒤 마지막에
    }

    public static void main(String[] args) {
        SwingUtilities.invokeLater(() -> new Counter().show());
    }
}
```

예제와 교재에서는 `JFrame`을 상속한 클래스를 많이 만든다. 창에 새 동작을 더하는 게 아니라 단지 쓰는 것이라면, 위처럼 `JFrame`을 필드나 지역 변수로 들고 쓰는 쪽이 상속보다 결합이 적다(상속보다 컴포지션).

## 정리

- Swing은 AWT의 창·이벤트 위에서 위젯을 Java로 직접 그리는 라이브러리다
- 화면은 컨테이너 트리이고, 배치는 좌표 대신 레이아웃 관리자에 맡긴다
- 이벤트는 소스에 등록한 리스너가 처리한다(옵저버 패턴). 여러 메서드짜리 리스너는 어댑터로 줄인다
- UI 생성·변경은 EDT에서만, 오래 걸리는 작업은 `SwingWorker`로 밖에서

관련 노트: [[graphical-user-interface|그래픽 사용자 인터페이스]], [[java-concurrency|Java 동시성]], [[event-loop|JavaScript 이벤트 루프]], [[gof-design-patterns|GoF 디자인 패턴]]
