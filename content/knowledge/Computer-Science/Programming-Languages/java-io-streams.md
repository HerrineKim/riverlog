---
title: "Java 입출력 스트림: 바이트와 문자, 보조 스트림, NIO Files"
concept: "Java I/O Stream"
summary: "Java 입출력은 바이트 스트림(InputStream·OutputStream)과 문자 스트림(Reader·Writer) 두 계열로 나뉘고, 버퍼링·자료형 변환 같은 기능은 보조 스트림을 겹쳐 감싸는 데코레이터 구조로 붙인다. 문자 스트림은 바이트에 문자 인코딩을 더한 것이라 인코딩을 명시해야 하며, 파일 단위 작업은 File 대신 java.nio.file의 Path와 Files를 쓴다."
tags: ["java", "io", "file", "design-pattern", "backend"]
source: other
date: "2026-10-31"
sources: ["고려사이버대학교 Java언어 강의(도성룡 교수, 2023-2학기)"]
---

> 고려사이버대학교 「Java언어」(2023-2학기) 강의 내용을 바탕으로 정리했다.

## 스트림이란

스트림(stream)은 데이터가 한 방향으로 순서대로 흘러가는 통로다. 읽는 쪽은 입력 스트림, 쓰는 쪽은 출력 스트림이고, 하나의 스트림이 읽기와 쓰기를 함께 하지는 않는다. 파일, 네트워크 소켓, 메모리 배열, 표준 입출력이 모두 같은 스트림 API로 다뤄지므로, 데이터가 어디서 오는지와 무관하게 같은 코드로 읽고 쓸 수 있다.

운영체제 수준에서는 결국 파일 디스크립터에 대한 `read`·`write` 시스템 콜이다. 그 아래 이야기는 [[unix-file-io|유닉스 파일 입출력]]에 있다.

## 두 계열: 바이트 스트림과 문자 스트림

| 구분 | 최상위 추상 클래스 | 단위 | 쓰는 곳 |
| --- | --- | --- | --- |
| 바이트 스트림 | `InputStream`, `OutputStream` | 1바이트 | 이미지, 압축 파일, 직렬화 데이터 등 모든 이진 데이터 |
| 문자 스트림 | `Reader`, `Writer` | `char`(UTF-16 코드 단위) | 사람이 읽는 텍스트 |

**문자 스트림은 바이트 스트림에 인코딩 변환을 얹은 것이다.** 디스크에는 바이트만 있으므로, 텍스트를 읽으려면 어떤 인코딩(UTF-8, EUC-KR 등)으로 바이트를 문자로 풀지 정해야 한다. 이 다리 역할을 `InputStreamReader`·`OutputStreamWriter`가 한다.

```java
// 바이트 스트림을 UTF-8 문자 스트림으로 바꿔 한 줄씩 읽기
try (var reader = new BufferedReader(
        new InputStreamReader(socket.getInputStream(), StandardCharsets.UTF_8))) {
    String line;
    while ((line = reader.readLine()) != null) {
        handle(line);
    }
}
```

- `FileReader`·`FileWriter`는 `FileInputStream` + `InputStreamReader`를 줄여 쓴 편의 클래스다. 인코딩을 생략하면 플랫폼 기본값을 쓴다. Java 18부터 기본값이 UTF-8로 통일됐지만(JEP 400), 이전 버전과 함께 돌 수 있는 코드라면 `new FileReader(file, StandardCharsets.UTF_8)`(Java 11+)처럼 명시한다.
- 텍스트를 바이트 스트림으로 한 바이트씩 읽어 `(char)`로 바꾸면 ASCII 밖의 글자(한글 등)는 깨진다. UTF-8에서 한글 한 글자는 3바이트다.

## read()가 int를 돌려주는 이유

`InputStream.read()`는 바이트 하나를 0~255 범위의 `int`로 돌려주고, 더 읽을 것이 없으면 `-1`을 돌려준다. 반환 타입이 `byte`(-128~127)라면 데이터 값 `0xFF`와 끝 표시를 구분할 수 없기 때문이다. `Reader.read()`도 같은 이유로 `int`를 쓴다.

```java
int b;
while ((b = in.read()) != -1) {   // 끝(-1)과 데이터를 구분한다
    out.write(b);
}
```

한 바이트씩 읽는 루프는 개념 설명용이다. 실제로는 `read(byte[])`로 덩어리째 읽거나 `in.transferTo(out)`(Java 9+)을 쓴다.

## 노드 스트림과 보조 스트림

스트림 클래스는 두 역할로 나뉜다.

| 역할 | 하는 일 | 예 |
| --- | --- | --- |
| 노드 스트림 | 실제 데이터 원천·목적지에 붙는다 | `FileInputStream`, `ByteArrayInputStream`, `FileReader` |
| 보조(필터) 스트림 | 다른 스트림을 감싸 기능을 더한다 | `BufferedInputStream`, `DataOutputStream`, `ObjectOutputStream`, `PrintWriter` |

보조 스트림은 생성자로 다른 스트림을 받아 감싸고, 같은 타입(`InputStream` 등)을 다시 구현한다. 그래서 여러 겹으로 쌓을 수 있다. [[gof-design-patterns|GoF 디자인 패턴]]의 데코레이터(Decorator) 패턴이 그대로 쓰인 구조다.

```java
// 파일 → 버퍼링 → 기본 자료형 단위 쓰기
try (var out = new DataOutputStream(
        new BufferedOutputStream(new FileOutputStream("scores.bin")))) {
    out.writeInt(3);
    out.writeDouble(91.5);
}
```

맨 바깥 스트림만 닫으면 안쪽 스트림까지 차례로 닫힌다.

| 보조 스트림 | 더하는 기능 |
| --- | --- |
| `BufferedInputStream`·`BufferedReader` | 내부 버퍼(기본 8192)로 몰아 읽기, `readLine()` |
| `BufferedOutputStream`·`BufferedWriter` | 몰아 쓰기, `flush()` 때 실제로 내보냄 |
| `DataInputStream`·`DataOutputStream` | `int`·`double` 같은 기본 자료형을 고정 바이트 형식으로 |
| `ObjectInputStream`·`ObjectOutputStream` | 객체 직렬화 ([[java-serialization-jackson\|Java 직렬화와 Jackson]]) |
| `PrintStream`·`PrintWriter` | `print`·`printf`, 예외 대신 오류 플래그 |

## 버퍼링과 flush

버퍼 없이 `read()`·`write()`를 부르면 호출마다 운영체제까지 내려갈 수 있다. 시스템 콜은 메서드 호출보다 훨씬 비싸므로, 작은 단위로 자주 읽고 쓰는 코드는 버퍼 스트림으로 감싸기만 해도 크게 빨라진다.

출력 버퍼는 가득 차거나 `flush()`·`close()`가 불릴 때 비로소 내보낸다. 그래서 다음 문제가 생긴다.

- 스트림을 닫지 않고 프로그램이 끝나면 버퍼에 남은 마지막 내용이 파일에 쓰이지 않는다.
- 네트워크로 요청을 보낸 뒤 응답을 기다리는데 `flush()`를 안 하면, 요청이 버퍼에 머물러 양쪽이 서로 기다린다.

닫기는 [[java-idioms#try-with-resources|try-with-resources]]에 맡긴다. 예외가 나도 `close()`가 불리고, 그 과정에서 `flush()`도 된다.

## File 대신 Path와 Files

`java.io.File`은 경로를 나타내는 오래된 클래스다. `delete()`, `mkdir()`, `renameTo()` 같은 메서드가 실패 이유 없이 `false`만 돌려주는 등 한계가 있어, Java 7부터는 `java.nio.file`의 `Path`와 `Files`를 쓴다.

| 작업 | `java.io.File` 방식 | `java.nio.file` 방식 |
| --- | --- | --- |
| 경로 만들기 | `new File(dir, "a.txt")` | `Path.of(dir, "a.txt")` |
| 존재 확인 | `file.exists()` | `Files.exists(path)` |
| 삭제 | `file.delete()` → 실패하면 `false` | `Files.delete(path)` → 실패 이유를 담은 예외 |
| 텍스트 전체 읽기 | 스트림을 열어 루프 | `Files.readString(path)` (Java 11+) |
| 줄 단위 읽기 | `BufferedReader` 루프 | `Files.readAllLines(path)`, 큰 파일은 `Files.lines(path)` |
| 텍스트 쓰기 | `FileWriter` | `Files.writeString(path, text)` |
| 스트림 얻기 | `new FileInputStream(file)` | `Files.newInputStream(path)`, `Files.newBufferedReader(path)` |

- `Files`의 텍스트 메서드는 인코딩을 생략하면 UTF-8을 쓴다.
- `Files.lines()`는 파일을 지연해서 읽는 `Stream<String>`을 돌려준다. 내부에 열린 파일이 있으므로 try-with-resources로 닫아야 한다.
- 레거시 API와 섞어 써야 하면 `file.toPath()`, `path.toFile()`로 오간다.

## 표준 입출력

| 객체 | 타입 | 용도 |
| --- | --- | --- |
| `System.in` | `InputStream` | 키보드(표준 입력) |
| `System.out` | `PrintStream` | 일반 출력 |
| `System.err` | `PrintStream` | 오류 출력. 리다이렉션해도 따로 갈 수 있다 |

콘솔 입력은 `Scanner`가 간편하지만 정규식 기반이라 느리다. 입력이 많으면 `BufferedReader`로 줄을 읽고 직접 쪼갠다.

## 정리

- 이진 데이터는 바이트 스트림, 텍스트는 문자 스트림. 문자 스트림에는 인코딩을 명시한다
- 기능은 보조 스트림을 겹쳐 붙인다(데코레이터). 작은 단위로 자주 읽고 쓰면 버퍼 스트림으로 감싼다
- `read()`는 끝을 `-1`로 알리기 위해 `int`를 돌려준다
- 출력은 `flush()`·`close()` 전까지 버퍼에 있을 수 있다. 닫기는 try-with-resources로
- 새 코드의 파일 작업은 `Path`·`Files`로 한다

관련 노트: [[java-idioms|Java 실무 관용구]], [[java-serialization-jackson|Java 직렬화와 Jackson]], [[file-io|C 입력과 파일 입출력]], [[unix-file-io|유닉스 파일 입출력]], [[gof-design-patterns|GoF 디자인 패턴]]
