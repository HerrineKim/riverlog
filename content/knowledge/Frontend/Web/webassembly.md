---
title: "WebAssembly: 브라우저의 두 번째 언어"
concept: "WebAssembly"
summary: "C·C++·Rust 같은 언어를 컴파일해 브라우저에서 거의 네이티브 속도로 돌리는 바이트코드 형식 WebAssembly(Wasm)를 정리한다. JavaScript와 비교해 어디서 시간이 줄어드는지(받기·파싱·컴파일·재최적화·실행·GC), Module·Memory·Table·Instance라는 네 개념과 JS API, 툴체인, MVP 이후 Wasm 2.0·3.0에 들어간 기능, 브라우저 밖 실행(WASI)과 쓸 곳·안 쓸 곳까지."
tags: ["web", "frontend", "performance", "javascript", "browser"]
source: other
date: "2026-10-21"
sources: ["https://developer.mozilla.org/en-US/docs/WebAssembly/Concepts", "https://github.com/WebAssembly/design/blob/main/HighLevelGoals.md", "https://github.com/WebAssembly/design/blob/main/MVP.md", "https://github.com/WebAssembly/design/blob/main/FutureFeatures.md", "https://www.smashingmagazine.com/2017/05/abridged-cartoon-introduction-webassembly/", "https://webassembly.org/news/2025-09-17-wasm-3.0/", "https://webassembly.org/features/"]
---

> MDN의 「[WebAssembly concepts](https://developer.mozilla.org/en-US/docs/WebAssembly/Concepts)」, WebAssembly 설계 저장소의 「[High-Level Goals](https://github.com/WebAssembly/design/blob/main/HighLevelGoals.md)」, 「[An Abridged Cartoon Introduction To WebAssembly](https://www.smashingmagazine.com/2017/05/abridged-cartoon-introduction-webassembly/)」를 바탕으로, webassembly.org의 Wasm 3.0 발표와 기능 표로 최신화해 재구성한 노트다.

## WebAssembly란

**WebAssembly(Wasm)는 컴파일 대상으로 설계된 저수준 바이트코드 형식이다.** 사람이 직접 쓰기보다 C·C++·Rust·Go·Kotlin 같은 언어를 컴파일해 만든다. 브라우저의 JavaScript 엔진 안에서 **JavaScript와 같은 가상 머신, 같은 보안 모델(동일 출처·권한 정책)** 으로 돌고, 거의 네이티브에 가까운 속도를 낸다.

**JavaScript를 대체하지 않고 보완한다.** 앱의 뼈대·UI·생태계는 JavaScript가, 무거운 계산(영상·이미지 처리, 3D, 물리, 압축, 암호화, 기존 C++ 엔진 이식)은 Wasm이 맡는 식이다. Wasm은 DOM에 직접 손대지 못하고, 웹 API는 JavaScript를 거쳐 부른다.

### 설계 목표

| 목표 | 뜻 |
| --- | --- |
| 이식 가능한 효율적 바이너리 | 크기가 작고 빨리 읽히며, 흔한 하드웨어 기능으로 네이티브 속도를 낸다 |
| 점진적 확장 | MVP를 먼저 내고 기능은 독립 제안으로 하나씩 더한다. 하위 호환을 지키고 특정 언어에 치우치지 않는다 |
| 웹과의 통합 | 버전 없이 기능 탐지로 진화하고, JS와 동기 호출을 주고받으며, 같은 웹 API를 쓴다. 바이너리와 1:1로 바뀌는 텍스트 형식(WAT)으로 소스 보기를 지원한다 |
| 브라우저 밖 실행 | 서버·엣지·플러그인 같은 비웹 환경도 처음부터 고려했다 |
| 좋은 플랫폼 | 높은 결정성, 형식 의미론(formal semantics)으로 쓴 명세 |

## 왜 빠른가: JavaScript와 시간 비교

JavaScript도 2008년 JIT 경쟁 이후 10배 넘게 빨라졌다. 엔진은 코드를 돌리며 타입을 관찰하고, 자주 도는(hot) 코드를 최적화 컴파일러에 넘긴다([[js-engine-v8|JavaScript 엔진과 V8]]). Wasm은 그 과정의 여러 단계를 미리 해 두거나 건너뛴다.

| 단계 | JavaScript | WebAssembly |
| --- | --- | --- |
| 받기 | gzip을 해도 텍스트 소스 | 더 작은 바이너리 |
| 파싱 | 소스 → AST → 엔진 고유 바이트코드 | 이미 바이트코드. **디코딩과 검증만** 하고, 받는 도중에 컴파일을 시작한다(스트리밍 컴파일) |
| 컴파일·최적화 | 실행하며 타입을 관찰한 뒤, 타입별로 여러 버전을 컴파일 | 타입이 코드에 들어 있고, LLVM 같은 컴파일러가 미리 최적화했다 |
| 재최적화 | 타입 가정이 틀리면 최적화를 버리고 다시(deopt) | 가정이 없으니 재최적화도 없다 |
| 실행 | JIT가 좋아하는 패턴을 알아야 빠르다 | 기계에 가까운 명령이라 일관되게 빠르다 |
| 메모리 | GC가 관리 | 선형 메모리를 직접 관리(MVP). 지금은 WasmGC도 있다 |

단, **JS ↔ Wasm 경계를 넘는 비용**이 있다. 숫자만 넘나들 수 있었던 MVP에서는 문자열·객체를 선형 메모리에 복사해 옮겨야 했다. 작은 함수를 경계 너머로 자주 부르면 오히려 느려진다. 큰 일을 한 번에 넘기는 구조가 맞다.

## 네 가지 핵심 개념

| 개념 | 정체 | JavaScript API |
| --- | --- | --- |
| **Module** | 컴파일된 Wasm 바이너리. 상태가 없어 Blob처럼 `postMessage`로 워커와 나눠 쓴다. ES 모듈처럼 import·export를 선언한다 | `WebAssembly.compileStreaming()`, `WebAssembly.Module` |
| **Memory** | 늘어날 수 있는 **선형 바이트 배열**. Wasm의 load·store 명령이 읽고 쓴다. JS에서는 `ArrayBuffer`로 보인다 | `WebAssembly.Memory` |
| **Table** | 함수 참조처럼 바이트로 메모리에 둘 수 없는 값을 담는 배열(안전·이식성 때문) | `WebAssembly.Table` |
| **Instance** | Module + 실행 상태(Memory, Table, import한 값). 특정 import로 로드된 ES 모듈과 비슷하다 | `WebAssembly.instantiateStreaming()` |

```javascript
// 서버는 .wasm을 Content-Type: application/wasm 으로 보내야 스트리밍 컴파일이 된다
const { instance } = await WebAssembly.instantiateStreaming(fetch('/add.wasm'), {
  env: { log: (n) => console.log(n) }, // Wasm이 import해서 동기로 부르는 JS 함수
})
instance.exports.add(2, 3) // export된 Wasm 함수는 평범한 JS 함수처럼 호출된다
```

Memory는 JS에서 `new Uint8Array(instance.exports.memory.buffer)`로 들여다본다([[binary-data-and-files|바이너리 데이터와 파일]]). 메모리가 늘어나면 기존 `ArrayBuffer`가 분리되므로 뷰를 다시 만든다.

## 만드는 방법

| 출발점 | 도구 | 특징 |
| --- | --- | --- |
| C/C++ | Emscripten, Clang `--target=wasm32` | Emscripten은 컴파일러를 넘어 POSIX·OpenGL·파일 시스템 같은 플랫폼 API를 흉내 내고, 로드용 JS 글루 코드까지 만든다. 기존 C++ 앱 이식에 쓴다 |
| Rust | `wasm32-unknown-unknown` 타깃 + wasm-bindgen | JS와 주고받는 타입 변환 코드를 생성한다 |
| TypeScript 문법 | AssemblyScript | TypeScript의 엄격한 부분집합을 Wasm으로 컴파일한다. 기존 TS 도구를 그대로 쓴다 |
| GC 언어(Kotlin, Dart/Flutter, Java, OCaml) | WasmGC 타깃 | 자체 GC를 Wasm 안에 싣지 않고 엔진의 GC를 쓴다 |
| 직접 | WAT(텍스트 형식) | 학습·디버깅용. `wat2wasm`으로 바이너리로 바꾼다 |

디버깅은 DWARF 정보를 넣어 DevTools에서 원래 C/C++·Rust 소스에 중단점을 건다([[devtools-debugging|DevTools 디버깅]]).

## MVP 이후: 기능이 붙어 온 순서

2017년 네 브라우저가 MVP(정수·부동소수 연산, 선형 메모리 하나, 함수 테이블)를 동시에 탑재했고, 2019년 W3C 표준(1.0)이 됐다. 그 뒤 기능은 독립 제안으로 하나씩 들어왔다. 버전 번호는 묶음에 붙인 이름일 뿐, 브라우저는 기능별로 지원한다.

| 묶음 | 들어간 기능 |
| --- | --- |
| Wasm 2.0 | SIMD(128비트 벡터 명령), bulk memory(메모리 복사·채우기), 다중 반환값, 참조 타입(`externref`로 JS 값을 그대로 들고 다님) |
| Wasm 3.0 (2025.09 완료) | **GC**(구조체·배열 타입), 타입 있는 참조와 `call_ref`, 꼬리 호출, 예외 처리, 64비트 메모리(브라우저는 16GB 상한), 다중 메모리, relaxed SIMD, JS 문자열 내장 함수 |
| 별도 진행 | 스레드(공유 메모리 + Atomics, [[shared-memory-atomics\|SharedArrayBuffer와 Atomics]]), JSPI(Wasm에서 JS Promise를 동기처럼 기다림), ES 모듈 통합(`import`로 `.wasm` 로드) |

기능별 브라우저 지원은 webassembly.org의 [기능 표](https://webassembly.org/features/)에서 확인한다. 스레드는 교차 출처 격리(COOP·COEP)가 된 페이지에서만 쓸 수 있다.

## 브라우저 밖의 Wasm

Wasm의 샌드박스와 이식성은 서버에서도 쓸모가 있다. **WASI**(WebAssembly System Interface)는 파일·소켓·시계 같은 시스템 기능을 권한 기반으로 노출하는 표준 인터페이스이고, **컴포넌트 모델**은 언어가 다른 Wasm 모듈을 타입 있는 인터페이스로 조립한다. Wasmtime·WasmEdge 같은 독립 런타임, Node.js(`node:wasi`), 엣지 플랫폼(Cloudflare Workers, Fastly)이 Wasm을 실행한다. 컨테이너보다 시작이 빠르고 가벼워 플러그인·서버리스 함수에 쓰인다.

## 쓸 곳과 안 쓸 곳

| 맞는 곳 | 안 맞는 곳 |
| --- | --- |
| 이미 있는 C/C++·Rust 라이브러리 재사용(SQLite, FFmpeg, 이미지 코덱, PDF 렌더러) | DOM 조작 위주의 UI 코드. 어차피 JS를 거친다 |
| CPU를 오래 쓰는 계산(이미지·영상 처리, CAD, 게임 엔진, 압축, 브라우저 안 AI 추론의 CPU 경로) | 작은 함수를 경계 너머로 자주 부르는 코드 |
| 예측 가능한 성능이 필요한 곳(JIT 워밍업·deopt가 없다) | "JS보다 빠르겠지"라는 막연한 기대. 잘 짠 JS와의 차이는 작업에 따라 작다 |
| 브라우저 안 빌드 도구(esbuild-wasm 등) | 번들 크기가 중요한 작은 기능. 런타임·글루 코드가 붙는다 |

실제 사례로 Figma의 렌더링 엔진, Photoshop 웹판, Google Sheets의 계산 엔진(WasmGC) 등이 Wasm으로 돈다. 브라우저 안 AI에서 Wasm은 WebGPU가 없을 때의 안전한 CPU 경로다([[client-side-web-ai|클라이언트 사이드 웹 AI]]).

## 역사

Wasm 이전에는 Mozilla의 **asm.js**(엔진이 알아보는 엄격한 JS 부분집합, Emscripten의 출력)와 Chrome의 **(P)NaCl**(샌드박스 네이티브 코드)이 같은 문제를 풀려 했다. asm.js는 텍스트라 파싱이 무겁고, NaCl은 Chrome 전용이었다. 두 진영이 2015년 함께 설계한 결과가 Wasm이다.

## 정리

- Wasm은 컴파일 대상 바이트코드다. JS와 같은 VM·같은 보안 모델에서 돌며 JS를 보완한다.
- 빠른 이유는 파싱 대신 디코딩, 미리 최적화된 타입 있는 코드, 재최적화가 없는 실행이다. 대신 JS 경계를 넘는 비용이 있다.
- 개념은 Module(코드) · Memory(선형 바이트) · Table(참조) · Instance(실행 상태) 넷이고, `instantiateStreaming`으로 싣는다.
- MVP 이후 SIMD·참조 타입(2.0), GC·예외·꼬리 호출·64비트 메모리(3.0)가 들어와 GC 언어와 큰 앱까지 컴파일 대상이 됐다.
- 기존 네이티브 라이브러리와 무거운 계산에 쓰고, UI는 JS에 맡긴다.

관련 노트: [[js-engine-v8|JavaScript 엔진과 V8]], [[shared-memory-atomics|SharedArrayBuffer와 Atomics]], [[web-workers|Web Worker]], [[client-side-web-ai|클라이언트 사이드 웹 AI]], [[in-browser-preview-runtime|브라우저 안 빌드·프리뷰 환경]]
