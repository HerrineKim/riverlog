---
title: "바이너리 데이터와 파일: ArrayBuffer, Blob, File"
concept: "Binary Data"
summary: "JavaScript가 바이트를 다루는 층위를 정리한다. 메모리 덩어리 ArrayBuffer와 그것을 읽는 뷰(TypedArray·DataView), 문자열과 바이트를 잇는 TextEncoder·TextDecoder, 타입이 붙은 불변 바이너리 Blob과 그 하위 File, 그리고 Blob을 화면·다운로드·업로드에 쓰는 object URL·data URL·FileReader·Promise 메서드까지."
tags: ["javascript", "browser", "binary", "file", "frontend"]
source: other
date: "2026-10-17"
sources: ["https://ko.javascript.info/arraybuffer-binary-arrays", "https://ko.javascript.info/text-decoder", "https://ko.javascript.info/blob", "https://ko.javascript.info/file", "https://developer.mozilla.org/en-US/docs/Web/API/Blob", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/ArrayBuffer", "https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Uint8Array/toBase64"]
---

> javascript.info(모던 JavaScript 튜토리얼)의 「ArrayBuffer와 이진 배열」, 「TextDecoder와 TextEncoder」, 「Blob」, 「File과 FileReader」 글을 바탕으로, 최신 API는 MDN으로 확인해 재구성한 노트다.

## 층위 한눈에 보기

바이너리를 다루는 객체는 이름이 많아 헷갈리지만 층위로 나누면 단순하다. 아래로 갈수록 저수준이다.

| 층위 | 객체 | 정체 | 어디 소속 |
| --- | --- | --- | --- |
| 파일 | `File` | 이름·수정 시각이 붙은 `Blob` | File API (브라우저) |
| 타입 있는 바이너리 | `Blob` | MIME 타입 + 바이트 묶음. 불변 | File API (브라우저) |
| 뷰 | `Uint8Array` 등 TypedArray, `DataView` | 버퍼의 바이트를 숫자로 해석하는 안경 | ECMAScript |
| 메모리 | `ArrayBuffer` | 고정 길이의 원시 바이트 영역 | ECMAScript |

문서에서 자주 보는 묶음 용어도 있다. **ArrayBufferView**는 모든 뷰(TypedArray·DataView)를, **BufferSource**는 `ArrayBuffer`와 ArrayBufferView를 아우른다. 「BufferSource를 받는다」는 「어떤 형태든 바이트면 된다」는 뜻이다.

## ArrayBuffer와 뷰

`ArrayBuffer`는 **배열이 아니라 메모리 영역**이다. `new ArrayBuffer(16)`은 0으로 채운 16바이트를 잡는다. 인덱스로 읽을 수 없고, 무엇이 들어 있는지도 모른다. 읽고 쓰려면 뷰를 씌운다.

```javascript
const buffer = new ArrayBuffer(16)
const u32 = new Uint32Array(buffer) // 같은 16바이트를 4바이트 정수 4개로 본다
const u8 = new Uint8Array(buffer)   // 같은 16바이트를 1바이트 정수 16개로 본다
u32[0] = 256
u8[1]                               // 1 — 리틀 엔디언 기기에서 256 = 0x00000100
```

**뷰는 데이터를 갖지 않는다.** 여러 뷰가 한 버퍼를 공유하므로 한쪽에 쓰면 다른 쪽에서 보인다. TypedArray의 종류, `%TypedArray%` 공통 부모, 일반 배열과의 차이는 [[arrays-and-objects#형식화 배열(TypedArray)|배열과 객체의 형식화 배열 절]]에 있다. 여기서는 바이너리 처리에 필요한 동작만 정리한다.

| 생성 방법 | 결과 |
| --- | --- |
| `new Uint8Array(buffer, byteOffset?, length?)` | 기존 버퍼(의 일부) 위에 뷰를 만든다. 복사 없음 |
| `new Uint8Array([1, 2, 3])` | 배열 값을 복사한 새 버퍼 + 뷰 |
| `new Uint8Array(otherTypedArray)` | 값을 복사하며 타입을 바꾼다. 범위를 넘는 값은 잘린다 |
| `new Uint8Array(4)` | 요소 4개(바이트 수 = 4 × `BYTES_PER_ELEMENT`)짜리 새 버퍼 |

### 범위를 넘는 값

TypedArray에 범위를 넘는 값을 넣어도 **오류가 나지 않는다.** 정수 배열은 하위 비트만 남긴다(`Uint8Array`에 256을 넣으면 0, 257은 1). `Uint8ClampedArray`만 예외로 255 위는 255, 음수는 0으로 고정한다. 캔버스 픽셀(`ImageData.data`)이 이 타입인 이유다.

### TypedArray에만 있는 것, 없는 것

| 메서드 | 동작 |
| --- | --- |
| `splice`, `concat`, `push` | **없다.** 길이가 고정이라 지울 수도 늘릴 수도 없다 |
| `set(source, offset)` | 다른 배열을 `offset` 위치에 복사한다. 청크를 하나로 이어 붙일 때 쓴다 |
| `subarray(begin, end)` | 같은 버퍼를 가리키는 **새 뷰**. 복사하지 않는다 (`slice`는 복사한다) |
| `map`, `filter`, `find`, `reduce`, `toSorted`, `with` 등 | 일반 배열처럼 쓴다 |

### DataView: 형식을 호출할 때 정한다

TypedArray는 생성자가 형식을 정하고 배열 전체가 같은 형식이다. `DataView`는 **읽을 때마다 형식과 오프셋을 고른다.** 헤더 뒤에 여러 형식의 필드가 이어지는 파일 포맷이나 네트워크 프로토콜을 해석할 때 쓴다.

```javascript
const view = new DataView(new Uint8Array([255, 255, 255, 255]).buffer)
view.getUint8(0)          // 255
view.getUint16(0)         // 65535 — 기본은 빅 엔디언
view.getUint32(0, true)   // 4294967295 — 두 번째 인자 true면 리틀 엔디언
view.setUint32(0, 0)      // 네 바이트 모두 0
```

TypedArray는 기기의 바이트 순서(대부분 리틀 엔디언)를 따르고, DataView는 엔디언을 인자로 고른다. 바이트 순서가 정해진 포맷을 읽을 때 DataView가 안전하다.

### 크기 조절과 소유권 이전 (ES2024)

과거에는 `ArrayBuffer`의 길이를 바꿀 수 없어 더 큰 버퍼를 새로 만들고 복사했다. 지금은 주요 브라우저가 모두 지원한다.

```javascript
const buf = new ArrayBuffer(8, { maxByteLength: 64 }) // 늘릴 수 있는 버퍼
buf.resize(32)                                        // 길이를 따라가는 뷰는 자동으로 커진다

const moved = buf.transfer()    // 내용을 새 버퍼로 옮긴다
buf.detached                    // true — 옛 버퍼는 길이 0, 더 쓸 수 없다
```

`transfer()`는 워커에 `postMessage(data, [buffer])`로 버퍼를 넘길 때와 같은 「복사 없는 이동」을 코드 안에서 한다.

## 문자열 ↔ 바이트: TextEncoder와 TextDecoder

| | TextEncoder | TextDecoder |
| --- | --- | --- |
| 방향 | 문자열 → `Uint8Array` | BufferSource → 문자열 |
| 인코딩 | **UTF-8만** | 기본 UTF-8, `euc-kr`·`windows-1251`·`big5` 등도 지원 |
| 주요 메서드 | `encode(str)`, `encodeInto(str, dest)`(이미 있는 버퍼에 써서 할당을 줄인다) | `decode(input, { stream })` |

```javascript
new TextEncoder().encode('Hi')                   // Uint8Array [72, 105]
new TextDecoder().decode(new Uint8Array([72, 105])) // 'Hi'
new TextDecoder('euc-kr').decode(bytes)          // 옛 한국어 인코딩 파일 읽기
```

- `fatal: true` 옵션을 주면 잘못된 바이트에서 예외를 던진다. 기본은 `�`(�)로 바꾸고 넘어간다.
- 스트림을 청크로 디코딩할 때는 `decode(chunk, { stream: true })`로 부른다. 한글처럼 여러 바이트인 글자가 청크 경계에서 잘려도 다음 청크와 합쳐 해석한다. 이 옵션 없이 청크마다 디코딩하면 경계마다 �가 생긴다. 스트림 전체에는 `TextDecoderStream`을 `pipeThrough`로 끼워도 된다.
- 바이트 배열 중간의 문자열은 `subarray`로 잘라 디코딩하면 복사하지 않는다.

## Blob: 타입이 붙은 불변 바이너리

`Blob`은 MIME 타입(`type`)과 바이트(`size`)를 갖는 **불변** 객체다. 문자열·BufferSource·다른 Blob을 섞어 만든다. 내용을 고칠 수 없고, `slice`로 잘라 새 Blob을 만든다. 바이트를 뷰로 직접 다루는 ArrayBuffer와 달리, Blob은 **업로드·다운로드·화면 표시처럼 통째로 옮기는 용도**에 맞다.

```javascript
const blob = new Blob(['<h1>hi</h1>'], { type: 'text/html' }) // 첫 인자는 반드시 배열
const part = blob.slice(0, 4, 'text/plain')                   // (start, end, type) — 음수도 된다
```

- `fetch`·`XMLHttpRequest`·`WebSocket.send`는 Blob을 그대로 본문으로 받는다. **Blob의 `type`이 요청의 `Content-Type`이 된다.**
- 큰 파일을 조각내 올리는 업로드(재개 가능한 업로드)는 `file.slice(start)`로 이어서 보낸다. 흐름은 [[ajax#업로드 재개|AJAX와 HTTP 요청]]에 있다.

### Blob에서 데이터 꺼내기

지금은 Blob 자체에 Promise 메서드가 있어 `FileReader` 없이 읽는다.

| 원하는 것 | 지금 쓰는 방법 | 과거 방식 |
| --- | --- | --- |
| 문자열 | `await blob.text()` (UTF-8) | `FileReader.readAsText` |
| ArrayBuffer | `await blob.arrayBuffer()` | `FileReader.readAsArrayBuffer` |
| Uint8Array | `await blob.bytes()` (Baseline 2026, 아니면 `new Uint8Array(await blob.arrayBuffer())`) | — |
| 스트림 | `blob.stream()` → `ReadableStream` (큰 파일을 메모리에 다 올리지 않고 처리) | — |
| data URL(base64) | `FileReader.readAsDataURL` | 같음 |

`FileReader`가 여전히 필요한 경우는 data URL 변환, UTF-8이 아닌 인코딩으로 텍스트 읽기(`readAsText(blob, 'euc-kr')`, 또는 TextDecoder), 읽기 진행률(`progress` 이벤트)과 `abort()` 정도다. 이벤트는 `loadstart → progress → load | error | abort → loadend` 순이고 결과는 `reader.result`, 오류는 `reader.error`에 있다. 워커 안에서는 동기 버전 `FileReaderSync`도 쓸 수 있다.

### Blob을 URL로: object URL과 data URL

`<img>`, `<a download>`, `<video>`처럼 URL을 받는 곳에 Blob을 넣는 방법은 두 가지다.

| | `URL.createObjectURL(blob)` | data URL (`data:<type>;base64,…`) |
| --- | --- | --- |
| 모양 | `blob:https://site.com/1e67e00e-…` (짧다) | base64로 인코딩한 내용 전체 (원본보다 약 33% 크다) |
| 비용 | 인코딩 없음, 즉시 | 큰 파일은 인코딩 시간·메모리 손실 |
| 수명 | 문서가 열려 있는 동안. **`URL.revokeObjectURL`로 해제해야** Blob이 메모리에서 빠진다 | 문자열이라 해제할 것이 없다. 저장·전송도 된다 |
| 쓰는 곳 | 미리보기, 다운로드 링크, 미디어 재생 | 작은 아이콘 인라인, 텍스트로 보관해야 할 때 |

```javascript
// 코드로 파일 다운로드 시키기
const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
const a = Object.assign(document.createElement('a'), { href: url, download: 'report.csv' })
a.click()
URL.revokeObjectURL(url) // 한 번 쓰고 버리는 URL은 바로 해제한다
```

브라우저는 object URL마다 「URL → Blob」 연결을 들고 있어서, 해제하지 않으면 SPA처럼 오래 사는 페이지에서 Blob이 계속 메모리에 남는다. 반대로 화면에 계속 걸려 있는 `<img src>`의 URL을 해제하면 다음 로드부터 깨진다. 이미지 미리보기라면 `img.onload`에서 해제한다.

### base64 변환

바이트를 base64 문자열로 바꿀 때 과거에는 `btoa(String.fromCharCode(...bytes))` 같은 우회를 썼다. 이 방식은 큰 배열에서 인자 개수 한도에 걸리고, `btoa`는 Latin-1 문자만 받는다. 지금은 TypedArray에 전용 메서드가 있다(Baseline 2025).

```javascript
const b64 = bytes.toBase64()                  // { alphabet: 'base64url' }로 URL용 변형도 된다
const back = Uint8Array.fromBase64(b64)
bytes.toHex(); Uint8Array.fromHex('ff00')      // 16진 문자열도 같은 방식
```

## File: 이름이 붙은 Blob

`File`은 `Blob`을 상속하고 `name`, `lastModified`(타임스탬프 숫자)를 더한다. 보통 직접 만들기보다 브라우저가 건네준다.

| 얻는 곳 | 코드 |
| --- | --- |
| 파일 입력 | `input.files` — 유사 배열 `FileList`. `multiple`이면 여러 개 |
| 드래그 앤 드롭 | `drop` 이벤트의 `event.dataTransfer.files` |
| 붙여넣기 | `paste` 이벤트의 `event.clipboardData.files` |
| 직접 생성 | `new File([blob], 'photo.png', { type: 'image/png' })` |

```javascript
input.addEventListener('change', async () => {
  const [file] = input.files
  if (!file) return
  preview.src = URL.createObjectURL(file)   // 읽지 않고 바로 미리보기
  const text = await file.text()            // 내용이 필요할 때만 읽는다
})
```

**파일 내용을 꼭 읽어야 하는 것은 아니다.** 미리보기는 object URL로, 업로드는 `fetch(url, { body: file })`나 `FormData`에 그대로 넣으면 된다. 옛 코드의 `file.lastModifiedDate`는 비표준이라 `lastModified`를 쓴다.

## 캔버스와 Blob

이미지를 자르거나 회전한 뒤 업로드할 때는 `<canvas>`에 그리고 Blob으로 뽑는다.

```javascript
ctx.drawImage(img, 0, 0)                                   // 잘라 그리거나 회전해도 된다
const blob = await new Promise((r) => canvas.toBlob(r, 'image/webp', 0.8)) // (콜백, 형식, 품질)
// OffscreenCanvas는 await offscreen.convertToBlob({ type: 'image/png' })로 Promise를 바로 준다
```

페이지 화면을 이미지로 만드는 라이브러리(html2canvas 등)도 DOM을 캔버스에 다시 그린 뒤 같은 방법으로 Blob을 얻는다.

## 정리

- **ArrayBuffer는 메모리, TypedArray·DataView는 그 메모리를 읽는 뷰**다. 뷰는 복사 없이 버퍼를 공유한다. 형식이 섞인 바이트는 DataView로, 엔디언도 명시한다.
- 문자열과 바이트는 TextEncoder(UTF-8)·TextDecoder로 잇는다. 청크 디코딩에는 `stream: true`.
- Blob은 타입이 붙은 불변 바이너리, File은 이름이 붙은 Blob이다. 네트워크 API는 둘 다 그대로 받는다.
- 읽기는 `blob.text()`·`arrayBuffer()`·`stream()`이 기본이고, `FileReader`는 data URL과 진행률이 필요할 때만 쓴다.
- object URL은 빠르지만 **다 쓰면 `revokeObjectURL`** 한다.

관련 노트: [[arrays-and-objects|배열과 객체]], [[ajax|AJAX와 HTTP 요청]], [[audio-recording|React에서 음성 녹음하기]], [[web-workers|웹 워커로 메인 스레드 비우기]], [[indexeddb|IndexedDB]]
