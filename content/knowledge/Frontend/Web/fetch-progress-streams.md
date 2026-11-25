---
title: "fetch()와 ReadableStream으로 진행률을 재기 어려운 이유"
concept: "Fetch Progress Streams"
summary: "Fetch API 스트림으로 다운로드·업로드 진행률 바를 만들기 어려운 기술적 원인이다. 응답 압축(gzip/br)으로 인한 Content-Length 불일치, 요청 스트림 버퍼링과 브라우저 지원 제약, 그리고 XMLHttpRequest·청크 업로드 대안을 정리한다."
tags: ["web", "http", "javascript", "frontend", "browser"]
source: other
date: "2026-11-25"
sources: ["https://jakearchibald.com/2025/fetch-streams-not-for-progress/", "https://devowen.com/543"]
---

> Jake Archibald의 「[Fetch streams are not for progress](https://jakearchibald.com/2025/fetch-streams-not-for-progress/)」(오원종 번역 「[Fetch 스트림은 진행률 측정을 위한 게 아닙니다](https://devowen.com/543)」, 2026.08)를 바탕으로 재구성한 노트다.

## Fetch API와 진행률 측정의 오해

`fetch()`에 `ProgressEvent`가 없다는 점 때문에 `response.body.getReader()`로 다운로드 바이트를 합산하거나, 요청 `body`에 `ReadableStream`을 넘겨 업로드 진행률을 계산하려는 시도가 흔하다. 하지만 두 방법 모두 실제 네트워크 전송률과 어긋나거나 브라우저 호환성 문제가 생긴다.

## 다운로드 진행률이 틀어지는 이유

일반적으로 응답 헤더의 `Content-Length`를 전체 크기로 두고 `reader.read()`로 받은 `value.byteLength`를 더한다. 문제는 **압축 인코딩(`Content-Encoding: gzip` · `br` · `zstd`)** 에 있다.

```mermaid
flowchart LR
  S["서버 (원본 1,000KB → gzip 250KB)"] -->|"Content-Length: 250KB"| N["네트워크 전송"]
  N --> B["브라우저 Fetch 레이어 (자동 압축 해제)"]
  B -->|"ReadableStream 청크 합계: 1,000KB"| JS["JavaScript (400% 진행률 출력)"]
```

- `Content-Length` 헤더는 **압축된 전송 크기(250KB)** 를 알려 준다.
- 반면 `response.body` 스트림에서 JavaScript가 읽는 `Uint8Array` 청크는 브라우저가 압축을 푼 뒤의 **비압축 크기(1,000KB)** 다.
- 결과적으로 진행률이 100%를 훨씬 넘겨 300%~400%로 표시되거나, `Transfer-Encoding: chunked`·`Content-Length` 미제공 응답에서는 아예 전체 크기를 알 수 없다.

정확한 전송 진행률을 얻으려면 서버가 비압축 크기용 커스텀 헤더(`X-Uncompressed-Content-Length`)를 따로 주거나, 아예 압축되지 않는 파일 응답을 사용하거나, `XMLHttpRequest`를 써야 한다.

## 업로드 진행률이 부정확하고 호환성이 낮은 이유

요청 `body`에 `ReadableStream`을 넘겨 "스트림에서 청크가 읽힐 때마다 업로드됐다고 간주"하는 방식도 두 가지 벽에 부딪힌다.

1. **버퍼 읽기와 네트워크 전송의 불일치**: `ReadableStream`의 `pull()`은 데이터가 서버에 도착했을 때가 아니라 **브라우저 Fetch 엔진이 내부 소켓 버퍼로 데이터를 퍼 올릴 때** 호출된다. 느린 모바일 망에서도 작은 파일은 즉시 버퍼로 읽혀 시작하자마자 "100% 완료"로 찍힌 뒤, 실제 HTTP 응답이 오기까지 한참 멈춰 보인다.
2. **브라우저·프로토콜 제약**: `fetch()` 요청 스트림은 `duplex: 'half'` 옵션과 **HTTP/2 또는 HTTP/3** 연결을 요구하며, 2026년 11월 기준 Chromium 계열만 지원하고 **Safari와 Firefox는 여전히 요청 바디 스트림을 지원하지 않는다**. 프로덕션 웹 앱의 범용 업로드 진행률 수단으로 쓸 수 없다.

## 실무 대안 비교

| 상황 | 권장 방식 | 이유 |
| --- | --- | --- |
| 일반 파일 업로드 진행률 | `XMLHttpRequest` (`xhr.upload.onprogress`) | 브라우저·OS 네트워크 스택의 전송 진행 이벤트를 직접 노출하며 `e.lengthComputable` 지원 |
| 대용량·재개 가능한 업로드 | 멀티파트 / 청크 분할 업로드 (`Blob.slice`) | 5MB 등 청크 단위 `fetch()` 완료·서버 ACK 횟수로 실제 서버 저장 진행률을 계산하고 실패 청크만 재전송 |
| 다운로드 진행률 | `XMLHttpRequest` (`xhr.onprogress`) 또는 비압축/원본 크기 헤더 + `fetch` 스트림 | `XMLHttpRequest`의 `ProgressEvent`는 전송 크기를 기준으로 비율 계산 (`gzip` 시에도 비율이 맞음) |

## 정리

- `fetch()` + `ReadableStream`은 점진적 데이터 파싱·생성을 위한 스트리밍 도구이지 네트워크 진행률 계측 API가 아니다.
- 다운로드에서는 `Content-Length`(압축 크기)와 스트림 청크(압축 해제 크기)의 단위가 어긋나고, 업로드에서는 버퍼링 시점과 브라우저 미지원(Safari·Firefox) 때문에 믿을 수 없다.
- 업로드 진행률에는 `XMLHttpRequest`의 `xhr.upload.onprogress`나 청크 분할 업로드를 사용한다.

관련 노트: [[http|HTTP: 요청과 응답, 메서드, 상태 코드, 헤더]], [[node-streams|Node.js 스트림]], [[devtools-network|DevTools 네트워크]]
