---
title: "Node.js 스트림: 데이터를 조각으로 흘려 처리하기"
concept: "Node.js Streams"
summary: "큰 데이터나 끝이 없는 데이터를 통째로 메모리에 올리지 않고 조각(chunk) 단위로 처리하는 Node.js 스트림을 정리한다. Readable·Writable·Duplex·Transform 네 종류, 흐름 모드와 일시정지 모드, 백프레셔와 highWaterMark, objectMode, pipe의 함정과 pipeline, for await 비동기 반복, 웹 스트림과의 관계, streams1~3의 변천까지."
tags: ["nodejs", "backend", "javascript", "streaming", "performance"]
source: other
date: "2026-10-21"
sources: ["https://webapplog.com/you-dont-know-node/", "https://nodesource.com/blog/understanding-object-streams/", "https://nodejs.org/api/stream.html", "https://nodejs.org/en/learn/modules/backpressuring-in-streams"]
---

> 「[You Don't Know Node](https://webapplog.com/you-dont-know-node/)」의 스트림·버퍼 절과 「[Understanding Object Streams](https://nodesource.com/blog/understanding-object-streams/)」를 바탕으로, Node.js 공식 Stream 문서와 백프레셔 가이드로 지금의 API를 확인해 재구성한 노트다.

## 스트림이란

**스트림은 데이터를 한 번에 다 받지 않고, 도착하는 조각(chunk)부터 차례로 처리하는 추상화**다. Unix 파이프(`cat a | gzip > a.gz`)를 JavaScript 객체로 옮긴 것이다.

| 방식 | 흐름 | 문제 |
| --- | --- | --- |
| 버퍼 방식 `fs.readFile` | 파일 전체를 메모리에 올린 뒤 처리·응답 | 파일 크기만큼 메모리를 쓰고, 다 읽을 때까지 첫 바이트도 못 보낸다. `Buffer` 하나의 크기 상한도 있다 |
| 스트림 방식 `fs.createReadStream` | 64KiB씩 읽는 대로 처리·전송 | 메모리 사용이 일정하고, 클라이언트가 첫 조각을 바로 받는다. 끝이 없는 데이터(로그, 소켓)도 다룬다 |

```javascript
// 8MB 이미지를 보낼 때: 스트림 쪽이 첫 바이트를 훨씬 빨리 보낸다
app.get('/non-stream', (req, res) => {
  fs.readFile(imagePath, (err, data) => res.end(data))
})
app.get('/stream', (req, res) => {
  fs.createReadStream(imagePath).pipe(res)
})
```

HTTP 요청·응답, `process.stdin`·`stdout`, 파일, 소켓, `zlib`, `crypto`가 모두 스트림이다. 스트림은 [[nodejs-runtime#EventEmitter|EventEmitter]]를 상속하므로 `data`·`end`·`error`·`finish` 같은 이벤트로도 다룬다. 기본 단위는 `Buffer`나 문자열이다.

## 네 가지 종류

| 종류 | 방향 | 예 | 직접 만들 때 구현할 메서드 |
| --- | --- | --- | --- |
| Readable | 읽기만 | `fs.createReadStream`, HTTP 요청(`req`), `process.stdin` | `_read()` |
| Writable | 쓰기만 | `fs.createWriteStream`, HTTP 응답(`res`), `process.stdout` | `_write()` |
| Duplex | 읽기·쓰기가 **독립** | TCP 소켓 | 둘 다 |
| Transform | 쓴 것을 바꿔 읽게 한다 | `zlib.createGzip()`, `crypto.createCipheriv()` | `_transform()`, `_flush()` |

```javascript
import { Transform } from 'node:stream'

const upper = new Transform({
  transform(chunk, encoding, callback) {
    callback(null, chunk.toString().toUpperCase()) // push + 완료 알림
  },
})
process.stdin.pipe(upper).pipe(process.stdout)
```

과거에는 이런 변환 스트림을 짧게 만들려고 `through2` 같은 패키지를 썼다. 지금은 생성자 옵션으로 바로 만들거나, 아래의 비동기 제너레이터로 대신한다.

## Readable의 두 가지 모드

| 모드 | 들어가는 때 | 읽는 법 |
| --- | --- | --- |
| 흐름(flowing) | `data` 리스너를 달거나 `pipe()`·`resume()` | 데이터가 오는 대로 `data` 이벤트로 밀려 온다(push) |
| 일시정지(paused) | 처음 만든 상태, `pause()` | `readable` 이벤트에서 `read()`를 `null`이 나올 때까지 불러 꺼낸다(pull) |

```javascript
readable.on('readable', () => {
  let chunk
  while ((chunk = readable.read()) !== null) console.log(chunk.length)
})
```

두 방식을 한 스트림에 섞지 않는다. 지금은 대개 아래의 `for await`나 `pipeline`을 쓰므로 모드를 직접 다룰 일이 적다.

## 백프레셔와 highWaterMark

읽는 쪽(디스크)이 쓰는 쪽(느린 네트워크)보다 빠르면 처리되지 못한 조각이 메모리에 쌓인다. **백프레셔(backpressure)는 받는 쪽이 "그만 보내"라고 거꾸로 알리는 장치**다.

- 각 스트림은 내부 버퍼를 갖고, **`highWaterMark`** 를 넘으면 "가득 찼다"고 본다. 기본값은 바이트 스트림 64KiB(Node.js 22부터, 이전 16KiB), objectMode 16개다.
- `writable.write(chunk)`는 버퍼가 `highWaterMark`를 넘으면 `false`를 돌려준다. 이때 쓰기를 멈추고 **`drain` 이벤트**를 기다렸다가 다시 쓴다.
- `pipe()`와 `pipeline()`은 이 신호를 알아서 처리한다. 직접 `write()`를 부르는 코드만 반환값을 확인하면 된다.

```javascript
function writeMany(writable, lines) {
  let i = 0
  const writeNext = () => {
    while (i < lines.length) {
      if (!writable.write(lines[i++])) return writable.once('drain', writeNext) // 가득 차면 기다린다
    }
    writable.end()
  }
  writeNext()
}
```

`write()`의 `false`를 무시해도 데이터는 버퍼에 쌓이며 쓰이긴 한다. 다만 메모리가 계속 늘어 결국 프로세스가 죽는다.

## objectMode: 바이트 대신 객체를 흘린다

기본 스트림은 `Buffer`·문자열만 다룬다. `objectMode: true`면 **아무 JavaScript 값**을 조각으로 흘리고, `highWaterMark`는 바이트가 아니라 **객체 개수**로 센다. 코어 모듈은 쓰지 않지만 사용자 코드에서는 흔하다.

| 쓰임 | 예 |
| --- | --- |
| 프로토콜 파서 | 원시 바이트 → 메시지 객체(IRC·SMTP 메시지 스트림) |
| 파일 형식 파서 | CSV 바이트 → 행 배열 → 도메인 객체(`csv-parse`) |
| DB 레코드 | 쿼리 결과를 한 행씩 흘린다(키-값 저장소의 `createReadStream`) |

**objectMode 스트림을 일반 스트림에 바로 이으면 안 된다.** 객체를 `process.stdout`에 pipe하면 `TypeError`가 난다. 중간에 `JSON.stringify(obj) + '\n'`처럼 문자열로 바꾸는 Transform을 둔다(NDJSON).

## pipe의 함정과 pipeline

`a.pipe(b).pipe(c)`는 백프레셔를 처리해 주지만, **에러를 전파하지 않고 정리도 하지 않는다.** 가운데 스트림에서 에러가 나면 나머지는 열린 채로 남아 파일 디스크립터가 샌다. 각 스트림마다 `error` 리스너를 달아야 한다.

**`pipeline()`은 연결된 스트림 중 하나라도 실패하면 전부 파괴(destroy)하고 에러를 한 곳으로 모은다.** 새 코드는 Promise 버전을 쓴다.

```javascript
import { pipeline } from 'node:stream/promises'
import fs from 'node:fs'
import zlib from 'node:zlib'

await pipeline(
  fs.createReadStream('archive.tar'),
  zlib.createGzip(),
  fs.createWriteStream('archive.tar.gz'),
  { signal: AbortSignal.timeout(10_000) }, // 중단하면 모든 스트림을 정리한다
)
```

마지막 쓰기·읽기 이후 스트림이 완전히 끝났는지는 `stream.finished()`(`stream/promises`에도 있다)로 기다린다.

## 비동기 반복과 제너레이터

Readable은 **비동기 이터러블**이다. `for await...of`로 읽으면 루프 본문이 끝날 때까지 다음 조각을 당기지 않으므로 백프레셔가 자연스럽게 걸리고, 에러는 `try...catch`로 잡힌다([[iterators-and-generators|이터레이터와 제너레이터]]).

```javascript
for await (const chunk of fs.createReadStream('big.log', { encoding: 'utf8' })) {
  handle(chunk)
}
```

`pipeline` 사이에는 **비동기 제너레이터 함수**를 Transform 대신 끼울 수 있고, `Readable.from(iterable)`은 배열·제너레이터를 Readable로 바꾼다.

```javascript
await pipeline(
  fs.createReadStream('lowercase.txt'),
  async function* (source) {
    source.setEncoding('utf8')
    for await (const chunk of source) yield chunk.toUpperCase()
  },
  fs.createWriteStream('uppercase.txt'),
)
```

## 웹 스트림과의 관계

브라우저와 `fetch`는 WHATWG **웹 스트림**(`ReadableStream`·`WritableStream`·`TransformStream`)을 쓴다. 개념(읽기·쓰기·변환, 백프레셔, `pipeTo`·`pipeThrough`)은 같고 API가 다르다. Node.js에는 둘 다 있다.

| | Node 스트림 | 웹 스트림 |
| --- | --- | --- |
| 쓰이는 곳 | `fs`, `net`, `http`, `zlib` | `fetch`의 `response.body`, Deno·Bun·엣지 런타임, 브라우저 |
| 연결 | `pipe`, `pipeline` | `pipeTo`, `pipeThrough` |
| 서로 바꾸기 | `Readable.toWeb(nodeStream)` | `Readable.fromWeb(webStream)` |

여러 런타임에서 돌아야 하는 라이브러리는 웹 스트림을 기준으로 쓰고, Node 전용 I/O와 만날 때만 변환한다. 서버가 HTML을 조각으로 흘려보내는 쓰임은 [[streaming-ssr|스트리밍 SSR]]에 있다.

## 역사: streams1 → streams3

| 세대 | Node 버전 | 특징 |
| --- | --- | --- |
| streams1 | 0.4~0.8 | `data` 이벤트로 밀어내기(push)만 있었다. `pause()`는 권고일 뿐이라 데이터가 계속 와서 유실되기 쉬웠다 |
| streams2 | 0.10 | `readable` 이벤트와 `read()`로 당겨 오기(pull)를 도입하고 `_read`·`_write`·`_transform`으로 구현하는 클래스 구조를 만들었다. 대신 두 모드가 헷갈렸다 |
| streams3 | 0.11~0.12(io.js) | 흐름 모드와 일시정지 모드를 하나의 스트림에서 오갈 수 있게 통합했다. 지금 API의 뼈대다 |

이후 `pipeline`(Node 10), 비동기 반복(Node 10), `stream/promises`(Node 15), 웹 스트림 호환이 더해졌다.

## 정리

- 큰 데이터, 끝이 없는 데이터, 빨리 첫 바이트를 보내야 하는 응답에는 버퍼 대신 스트림을 쓴다.
- Readable·Writable·Duplex·Transform 네 종류이고, 전부 EventEmitter다.
- 백프레셔: `write()`가 `false`면 `drain`을 기다린다. `highWaterMark`는 바이트 64KiB, objectMode 16개가 기본이다.
- `pipe` 대신 `stream/promises`의 `pipeline`을 쓴다. 에러 전파와 정리를 한 번에 해 준다.
- 읽기는 `for await`, 변환은 비동기 제너레이터로 짧게 쓴다. 웹 스트림과는 `toWeb`·`fromWeb`으로 오간다.

관련 노트: [[nodejs-runtime|Node.js 런타임]], [[binary-data-and-files|바이너리 데이터와 파일]], [[iterators-and-generators|이터레이터와 제너레이터]], [[streaming-ssr|스트리밍 SSR]], [[reactive-programming|반응형 프로그래밍]]
