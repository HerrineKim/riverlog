---
title: "Node.js 런타임: 구조·이벤트 루프·운영과 OS 차이"
concept: "Node.js"
summary: "브라우저 밖에서 JavaScript를 실행하는 런타임 Node.js를 정리한다. V8·libuv·스레드 풀로 이뤄진 구조, timers·poll·check 단계로 도는 Node 이벤트 루프와 nextTick·setImmediate의 차이, EventEmitter와 Buffer, cluster·worker_threads·child_process로 멀티코어 쓰기, 비동기 에러 처리와 --inspect 디버깅, 힙 크기 설정과 운영 관례, Node의 설계를 반성하며 나온 Deno·Bun, Windows·macOS 차이로 깨지는 환경 변수와 경로를 cross-env와 path 모듈로 푸는 법까지."
tags: ["nodejs", "backend", "javascript", "config", "concurrency"]
source: mixed
date: "2026-10-21"
sources: ["https://riverkim.kr/167", "https://riverkim.kr/158", "https://riverkim.kr/230", "https://blog.ull.im/engineering/2019/04/14/deno-ryan-dahl-2019-04-04.html", "https://docs.deno.com/runtime/fundamentals/security/", "https://nodejs.org/api/permissions.html", "https://webapplog.com/you-dont-know-node/", "https://nodesource.com/blog/understanding-the-nodejs-event-loop/", "https://blog.risingstack.com/node-js-at-scale-understanding-node-js-event-loop/", "https://blog.risingstack.com/node-js-at-scale-node-js-garbage-collection/", "https://blog.risingstack.com/how-to-debug-nodej-js-with-the-best-tools-available/", "https://devcenter.heroku.com/articles/node-best-practices", "https://nodejs.org/en/learn/asynchronous-work/event-loop-timers-and-nexttick", "https://nodejs.org/en/about/previous-releases"]
---

> riverkim.kr에 쓴 글들을 다시 정리하고, Deno 부분은 「[Node 제작자가 만든 Deno : 자바스크립트의 새로운 접근](https://blog.ull.im/engineering/2019/04/14/deno-ryan-dahl-2019-04-04.html)」을 바탕으로 Deno·Node 공식 문서와 대조해 더한 노트다. 구조·이벤트 루프·운영 부분은 「[You Don't Know Node](https://webapplog.com/you-dont-know-node/)」, 「[Understanding the Node.js Event Loop](https://nodesource.com/blog/understanding-the-nodejs-event-loop/)」, RisingStack의 「[Understanding the Node.js Event Loop](https://blog.risingstack.com/node-js-at-scale-understanding-node-js-event-loop/)」·「[Node.js Garbage Collection Explained](https://blog.risingstack.com/node-js-at-scale-node-js-garbage-collection/)」·「[How to Debug Node.js](https://blog.risingstack.com/how-to-debug-nodej-js-with-the-best-tools-available/)」, Heroku의 「[Best Practices for Node.js Development](https://devcenter.heroku.com/articles/node-best-practices)」을 바탕으로 Node.js 공식 문서로 최신화해 보강했다.

## Node.js란

**Node.js**는 Chrome의 V8 JavaScript 엔진으로 만든 JavaScript **런타임**(언어가 실행되는 환경)이다. JavaScript는 원래 HTML 문서에 삽입되어 브라우저 안에서만 동작하는 스크립트 언어였다. Node.js를 설치하면 JavaScript를 브라우저와 무관한 프로그램으로 실행할 수 있고, 그중 가장 많이 만드는 것이 **서버**다.

| 특징 | 의미 |
| --- | --- |
| 싱글 스레드 + 비동기 I/O | 요청 하나하나를 기다리지 않고, I/O가 끝나면 콜백으로 이어서 처리한다([[event-loop\|이벤트 루프]]) |
| 잘 맞는 일 | CPU 계산은 적고 **I/O가 많은** 작업. 네트워크·DB·디스크 접근, 채팅, 실시간 주식 차트 |
| 맞지 않는 일 | 영상 인코딩처럼 CPU를 오래 붙잡는 계산. 싱글 스레드가 막혀 다른 요청까지 느려진다 |

Node.js 위에서 서버를 만드는 프레임워크가 **Express**(사실상 표준인 최소 프레임워크)와 **NestJS**(Express·Fastify 위에 모듈·DI 구조를 얹은 프레임워크)다. Express는 자유도가 높고, NestJS는 아키텍처를 프레임워크가 정해 주어 팀원마다 구조가 통일된다([[NestJS|NestJS]]).

## 구조: V8 + libuv + 코어 모듈

| 층 | 역할 |
| --- | --- |
| V8 | JavaScript를 실행한다. 스레드 하나, 콜 스택 하나다([[js-engine-v8\|JavaScript 엔진과 V8]]) |
| libuv | C로 만든 비동기 I/O 라이브러리. 이벤트 루프와 스레드 풀을 돌린다 |
| 코어 모듈 | `fs`·`net`·`http`·`crypto`·`stream` 등. JavaScript API 아래에서 libuv와 OS를 부른다 |

"싱글 스레드"는 **JavaScript가 도는 스레드가 하나**라는 뜻이다. 네트워크 소켓처럼 OS 커널이 비동기로 처리할 수 있는 일은 커널(epoll·kqueue·IOCP)에 맡기고, 커널이 비동기로 못 하는 일(파일 시스템 대부분, `dns.lookup`, `crypto.pbkdf2`·`scrypt` 같은 무거운 암호 연산, `zlib`)은 **libuv 스레드 풀**(기본 4개, `UV_THREADPOOL_SIZE`로 조정)이 처리한다. 스레드를 직접 다루지 않으니 락과 교착 상태 걱정이 없다.

I/O는 계산보다 몇 자릿수 느리다. SSD에서 1KB를 읽는 1.4µs 동안 2GHz CPU는 약 2만 8천 사이클을 돌고, 왕복 44ms 네트워크 요청 동안에는 약 8,800만 사이클을 돈다. 기다리는 동안 스레드를 놀리지 않는 것이 Node 설계의 핵심이다. 반대로 **동기 코드는 여전히 전부를 막는다.** 10억 번 도는 빈 루프나 `fs.readFileSync`는 그동안 다른 요청을 하나도 처리하지 못하게 한다. `Sync`로 끝나는 API는 시작할 때 설정 파일을 읽는 정도로만 쓴다.

## Node.js의 이벤트 루프

브라우저 이벤트 루프와 원리(콜 스택이 비면 큐의 콜백을 꺼낸다, 매 콜백 뒤 마이크로태스크를 비운다)는 같다([[event-loop|이벤트 루프]]). Node는 libuv가 큐를 **단계(phase)** 로 나눠 돈다.

```text
   ┌─> timers            setTimeout·setInterval 콜백
   │   pending callbacks  미뤄진 일부 시스템 콜백(일부 TCP 오류 등)
   │   idle, prepare      내부용
   │   poll               새 I/O 이벤트를 받아 I/O 콜백 실행. 할 일이 없으면 여기서 기다린다
   │   check              setImmediate 콜백
   └── close callbacks    socket.on('close') 등
```

- 각 콜백이 끝날 때마다 **`process.nextTick` 큐 → Promise 마이크로태스크 큐** 순으로 비운다. `nextTick`을 재귀로 부르면 루프가 poll 단계에 닿지 못해 I/O가 굶는다.
- libuv 1.45(Node.js 20)부터 타이머는 poll 단계 **뒤**에 확인한다(이전에는 앞). 메인 모듈에서 `setTimeout(fn, 0)`과 `setImmediate(fn)`의 순서는 보장되지 않는다. **I/O 콜백 안에서는 `setImmediate`가 항상 먼저**다.
- 이름이 거꾸로다. `process.nextTick`은 루프 단계와 무관하게 **지금 작업 직후** 실행되고, `setImmediate`는 **다음 check 단계**에 실행된다. 공식 문서는 이해하기 쉬운 `setImmediate`를 권하고, `nextTick`은 생성자에서 이벤트를 내보내기 전에 호출자가 리스너를 달 시간을 주는 것처럼 "현재 코드가 끝난 직후"가 꼭 필요할 때만 쓴다.
- 루프는 남은 타이머·I/O·핸들이 없으면 끝나고 프로세스가 종료된다.

## EventEmitter

Node 코어의 비동기 API는 두 모양이다. 성공·실패 한 번으로 끝나면 **에러 우선 콜백**(`(err, result) => {}`)이나 Promise(`fs/promises`), 한 객체가 여러 종류의 사건을 계속 알리면 **EventEmitter**(관찰자 패턴)다. HTTP 서버, 소켓, [[node-streams|스트림]], `process`가 모두 EventEmitter다.

```javascript
import { EventEmitter, once } from 'node:events'

class Job extends EventEmitter {
  run() {
    // ...일을 마치면
    this.emit('done', { completedOn: new Date() })
  }
}
const job = new Job()
job.on('done', ({ completedOn }) => console.log('완료', completedOn))
job.once('done', () => {}) // 한 번만
job.run()

const [details] = await once(job, 'done') // 이벤트 한 번을 Promise로 기다린다
```

- **`emit`은 동기다.** 등록된 리스너를 등록 순서대로 그 자리에서 모두 실행한 뒤에야 다음 줄로 간다. 비동기 작업의 완료를 알리는 데 자주 쓰여 비동기처럼 보일 뿐이다.
- 그래서 생성자 안에서 바로 `emit`하면, 호출자가 아직 `on`을 달기 전이라 이벤트를 놓친다. `process.nextTick`이나 `setImmediate`로 미룬다.
- **`'error'` 이벤트는 특별하다.** 리스너 없이 `emit('error')`하면 예외로 던져져 프로세스가 죽는다. EventEmitter를 쓰는 객체에는 `error` 리스너를 단다.
- 리스너가 한 이벤트에 11개 이상 붙으면 메모리 누수 의심 경고가 뜬다(`setMaxListeners`로 조정). 다 쓴 리스너는 `off`·`removeAllListeners`로 뗀다.

## Buffer

브라우저 JavaScript에 바이너리 타입이 `ArrayBuffer`뿐이던 시절, Node는 **Buffer**를 먼저 만들었다. 지금 Buffer는 `Uint8Array`의 하위 클래스다([[binary-data-and-files|바이너리 데이터와 파일]]). 파일·소켓에서 인코딩 없이 읽으면 데이터는 Buffer로 온다.

```javascript
const buf = Buffer.from('hello', 'utf8') // <Buffer 68 65 6c 6c 6f>
buf.toString('utf8', 0, 2)              // 'he'
Buffer.alloc(26)                         // 0으로 채운 26바이트
Buffer.from(buf).toString('base64')      // 'aGVsbG8='
```

`new Buffer(n)`은 초기화되지 않은 메모리를 노출할 수 있어 폐기됐다. `Buffer.alloc`(0으로 채움)을 쓰고, 성능 때문에 `Buffer.allocUnsafe`를 쓸 때는 바로 덮어쓴다.

## 멀티코어 쓰기

JavaScript 스레드가 하나라 코어 8개짜리 서버에 프로세스 하나만 띄우면 나머지 코어가 논다.

| 방법 | 단위 | 쓰는 때 |
| --- | --- | --- |
| `cluster` 모듈 | 프로세스. 주 프로세스가 워커를 `fork`하고 워커들이 **같은 포트**를 나눠 받는다 | 한 서버에서 HTTP 처리량을 늘릴 때 |
| 프로세스 관리자(PM2 `-i max`) | 위와 같고, 재시작·무중단 리로드·로그를 대신 맡는다 | 직접 cluster 코드를 짜지 않을 때 |
| 컨테이너 여러 개 + 로드 밸런서 | 컨테이너당 프로세스 하나 | 쿠버네티스 등. 요즘의 기본 배치다([[load-balancer\|로드 밸런서]]) |
| `worker_threads` | 같은 프로세스 안의 스레드. 각자 V8 인스턴스·이벤트 루프를 갖고 `postMessage`·`SharedArrayBuffer`로 통신 | 요청 처리 중의 **CPU 집약 작업**(이미지 리사이즈, 해시)을 메인 루프 밖으로 뺄 때([[shared-memory-atomics\|SharedArrayBuffer와 Atomics]]) |

플랫폼이 주는 값(`WEB_CONCURRENCY` 등)으로 워커 수를 정하고, 적절한 수는 부하 테스트로 찾는다. 코어 수를 넘기면 이득이 줄어든다.

외부 프로그램을 실행할 때는 `child_process`를 쓴다.

| 함수 | 특징 |
| --- | --- |
| `spawn(cmd, args)` | 출력을 **스트림**으로 받는다. 큰 출력, 오래 도는 명령 |
| `exec(cmdString, cb)` | 셸을 거쳐 실행하고 출력을 **버퍼에 모아** 콜백에 한 번에 준다. 출력이 크면 `maxBuffer`를 넘는다. 사용자 입력을 넣으면 셸 주입 위험이 있다 |
| `execFile(file, args)` | 셸 없이 실행. 인자를 배열로 넘겨 주입을 피한다 |
| `fork(modulePath)` | 새 Node 프로세스를 띄우고 IPC 채널(`process.send`)을 연다 |

## 비동기 에러 처리

`try...catch`는 **같은 콜 스택**에서 던진 에러만 잡는다. `setTimeout`이나 I/O 콜백 안에서 던지면 이미 바깥 `try`가 끝난 뒤라 잡히지 않는다([[js-error-handling|에러 처리]]).

| 경로 | 처리 |
| --- | --- |
| 에러 우선 콜백 | `if (err) return callback(err)`로 위로 넘긴다 |
| Promise·async 함수 | `await`를 `try...catch`로 감싸거나 `.catch()`. 처리되지 않은 거부는 Node 15부터 **프로세스를 종료**시킨다 |
| EventEmitter | `on('error', …)` 리스너. 없으면 프로세스가 죽는다 |
| 마지막 그물 | `process.on('uncaughtException')`·`'unhandledRejection'`에서 **로그를 남기고 종료**한다. 계속 돌리지 않는다. 예외가 어디서 튀었는지 모르는 프로세스는 상태가 깨졌을 수 있다. 재시작은 프로세스 관리자나 오케스트레이터에 맡긴다 |

과거에는 비동기 문맥을 묶어 에러를 잡는 `domain` 모듈을 썼지만 폐기 예정(deprecated)이다. 요청 단위 문맥을 이어 붙이는 일은 지금 `AsyncLocalStorage`(`node:async_hooks`)가 맡는다.

## 디버깅

```bash
node --inspect app.js        # 9229 포트로 인스펙터를 연다
node --inspect-brk app.js    # 첫 줄에서 멈춘 채 시작(초기화 코드 디버깅)
node inspect app.js          # 터미널 디버거. c(계속) n(다음) s(들어가기) o(나오기) repl
```

Chrome 주소창에 `chrome://inspect`를 열면 인스펙터가 켜진 Node 프로세스가 보이고, 브라우저와 같은 DevTools로 중단점·콜 스택·메모리 힙 스냅샷·CPU 프로파일을 쓴다([[devtools-debugging|DevTools 디버깅]]). VS Code는 `launch.json` 없이도 JavaScript Debug Terminal에서 실행하면 자동으로 붙는다. 코드에 `debugger;`를 두면 그 자리에서 멈춘다.

로그로 보는 방법도 있다. 많은 라이브러리(Express 등)가 `debug` 패키지로 이름 공간별 로그를 숨겨 두어 `DEBUG=express:* node app.js`처럼 켠다. 코어 모듈 내부 로그는 `NODE_DEBUG=http,net node app.js`로 켠다. 과거의 `node debug`·`node-inspector`는 `--inspect`로 대체됐다.

## 메모리와 GC 설정

V8은 메모리를 새 객체가 들어가는 작은 **New Space**와 오래 살아남은 객체의 **Old Space**로 나눠, 각각 다른 방식으로 수거한다([[garbage-collection#엔진의 최적화|가비지 컬렉션]]). Old Space 상한은 `--max-old-space-size`(MB)로 정한다.

```bash
node --max-old-space-size=460 server.js   # 512MB 컨테이너에서 힙이 그 안에 들도록
```

V8의 GC는 게으르게 동작해 꼭 필요할 때까지 회수를 미루기도 한다. 메모리가 계속 오르는 그래프만으로 누수라고 단정하지 말고, 힙 스냅샷을 두 번 떠 비교해 확인한다.

## 운영과 배포 환경

로컬에서 되던 서버가 배포하면 깨지는 원인은 대개 버전, 설정, OS 차이 셋 중 하나다.

### 버전 고르기

서버를 돌릴 Node.js는 **LTS 버전**을 쓴다. 2026년 10월 기준 LTS는 22와 24이고 20은 2026년 4월에 지원이 끝났다. 짝수 버전이 Current로 나온 뒤 6개월 지나 LTS가 되며, 27부터는 1년 주기로 바뀐다. ([Node.js Releases](https://nodejs.org/en/about/previous-releases))

`package.json`의 `engines`에 Node 버전을 적어 두면 배포 플랫폼이 같은 버전을 고른다. 새 프로젝트는 `npm init -y`로 매니페스트부터 만든다.

### 설정은 환경 변수로

DB 주소·포트·모드 같은 설정은 코드나 환경별 설정 파일(`config/dev.js`, `config/qa1.js`, `config/prod.js` …)이 아니라 **환경 변수**로 넣는다([[twelve-factor-app|12요소 앱]]). 로컬 값은 `.gitignore`한 `.env` 파일에 둔다. `.env` 파일은 Node.js 20.6부터 `node --env-file=.env app.js`로 별도 패키지 없이 읽을 수 있다. 과거에는 `dotenv` 패키지가 필수였다. 프레임워크에서 읽는 방법은 [[config-env|NestJS 설정과 환경 변수]]에 있다.

Node 서비스는 `process.env.NODE_ENV` 같은 환경 변수로 개발·운영 모드를 구분한다. 매번 손으로 바꾸기 번거로워 `package.json`의 scripts에 넣어 두는데, 아래 문법은 **macOS·Linux 셸에서만** 동작하고 Windows(CMD)에서는 실패한다.

```json
"scripts": {
  "start": "NODE_ENV=production PORT=80 node app",
  "dev": "nodemon app"
}
```

**cross-env**는 OS마다 다른 환경 변수 설정 문법을 대신 처리해 주는 패키지다. 설치하고 명령 맨 앞에 `cross-env`만 붙이면 된다.

```bash
npm install -D cross-env
```

```json
"scripts": {
  "start": "cross-env NODE_ENV=production PORT=80 node app",
  "dev": "nodemon app",
  "test": "jest"
}
```

남이 만든 Node 서버를 받아 `yarn start`가 실패한다면 scripts에 `cross-env` 같은 OS 관련 도구가 쓰였는지, 그 패키지가 설치됐는지부터 확인한다.

### OS 차이로 깨지는 경로와 파일 이름

디렉터리 구분자는 Unix 계열이 `/`, Windows가 `\`다. 경로를 문자열로 이어 붙이면 특정 OS에서만 동작하는 코드가 된다. Node.js에 내장된 **path** 모듈을 쓰면 실행 중인 OS에 맞는 구분자로 경로를 만들어 준다.

```javascript
import path from 'path';

path.join('homepage', 'books', 'book');      // 'homepage/books/book' (Windows: 'homepage\\books\\book')
path.join(process.cwd(), 'content', 'blog'); // 프로젝트 기준 절대 경로
path.resolve('content', 'blog');             // 오른쪽부터 붙여 절대 경로를 만든다
path.extname('cover.png');                   // '.png'
```

Next.js 프로젝트를 Vercel에 배포할 때 경로 관련 오류가 난다면, 먼저 문자열로 이어 붙인 경로를 `path.join(process.cwd(), ...)`처럼 path 모듈로 바꿔 본다. 그러면 실행 위치와 OS에 상관없이 같은 파일을 가리킨다.

**파일 이름은 소문자 + 하이픈**(`auth-handler.js`)으로 통일한다. macOS·Windows의 기본 파일 시스템은 대소문자를 구분하지 않고 Linux는 구분한다. `require('./Auth')`가 `auth.js`를 찾는 코드는 로컬에서만 되고 Linux 서버에서 깨진다.

### 빌드와 저장소

| 관례 | 이유 |
| --- | --- |
| 빌드는 `scripts`의 `build`, 배포 전 훅은 플랫폼의 `*-prebuild`·`postinstall` | `scripts` 안에서는 `node_modules/.bin`이 PATH에 있다. 스크립트가 길어지면 `scripts/build.sh`로 뺀다 |
| `node_modules`·로그 같은 생성물은 커밋하지 않는다 | 네이티브 모듈은 아키텍처별로 빌드되므로 커밋한 바이너리는 다른 서버에서 깨진다. 이미 올렸다면 `git rm -r --cached node_modules` |

## Node 이후의 런타임: Deno와 Bun

Node.js를 만든 Ryan Dahl은 Node의 설계에서 아쉬운 점을 짚고 **Deno**를 새로 만들었다. 그 문제의식이 지금 런타임 경쟁의 축이다.

| Node의 아쉬운 점 | Deno의 답 | 지금의 Node |
| --- | --- | --- |
| 스크립트가 파일·네트워크·환경 변수에 **무제한 접근**한다 | 기본 차단, `--allow-read=./data`·`--allow-net=api.example.com`처럼 범위를 좁혀 허락한다(`-A`는 전부) | `--permission` 플래그로 켜는 권한 모델이 22.13·23.5부터 안정 단계다. 플래그를 주지 않으면 여전히 무제한이다 |
| `node_modules`와 중앙 레지스트리에 묶인 모듈 해석, CommonJS와 ES 모듈의 공존 | ES 모듈만 쓰고 URL·`jsr:`·`npm:` 지정자로 가져온다 | ESM과 CJS를 함께 지원한다. `require(esm)`이 가능해졌다 |
| TypeScript를 따로 빌드해야 한다 | TypeScript를 바로 실행한다 | 타입 제거(type stripping)로 `.ts`를 바로 실행한다([[typescript-basics\|TypeScript 기초]]) |
| 표준 라이브러리가 얇아 작은 유틸까지 패키지로 받는다 | 검수된 표준 라이브러리(`@std/*`)와 포매터·린터·테스트 러너 내장 | `node:test`, `fetch`, `--env-file`, `--watch`를 내장했다 |
| 브라우저와 API가 다르다 | `fetch`, `URL`, `import.meta` 같은 **웹 표준 API**를 우선한다 | 웹 표준 API를 점점 들이고 있다 |

Deno 2는 `package.json`과 npm 패키지를 그대로 쓸 수 있게 해 Node 생태계와의 벽을 낮췄다. **Bun**은 JavaScriptCore 엔진 위에 런타임·패키지 매니저·번들러·테스트 러너를 한 실행 파일로 묶어 속도를 앞세운다. 세 런타임 모두 서로의 장점을 흡수하는 중이라, 새 프로젝트에서 고를 때는 **배포 환경 지원**과 **쓰려는 npm 패키지의 호환성**을 먼저 확인한다.

## 정리

- Node.js는 브라우저 밖의 JavaScript 런타임이고, 싱글 스레드·비동기 I/O라 I/O가 많은 서버에 강하다. 커널이 못 하는 비동기 일은 libuv 스레드 풀(기본 4개)이 맡는다.
- Node 이벤트 루프는 timers → poll → check 단계로 돌고, 콜백마다 nextTick → Promise 큐를 비운다. 미룰 때는 `setImmediate`를 기본으로 쓴다.
- EventEmitter의 `emit`은 동기이고, `error` 리스너가 없으면 프로세스가 죽는다. 처리되지 않은 예외·거부는 로그를 남기고 종료한 뒤 재시작에 맡긴다.
- 멀티코어는 프로세스(cluster·컨테이너 복제)로, CPU 집약 작업은 `worker_threads`로 푼다. 디버깅은 `--inspect` + `chrome://inspect`.
- 운영에는 LTS를 쓰고, 설정은 환경 변수(`--env-file`)로 넣는다. `NODE_ENV=production node app` 같은 scripts는 Windows에서 깨지므로 `cross-env`를 앞에 붙인다.
- 파일 경로는 문자열로 잇지 말고 `path.join`, `path.resolve`로 만들고, 파일 이름은 소문자로 통일한다.
- Deno·Bun은 권한·웹 표준 API·TypeScript 실행으로 Node의 설계를 다시 짰고, Node도 그 장점을 흡수하고 있다.

관련 노트: [[node-streams|Node.js 스트림]], [[routing-crud|Express 라우팅과 CRUD API]], [[koa|Koa]], [[event-loop|브라우저에서 JavaScript가 동작하는 원리: 이벤트 루프]], [[windows-dev-environment|Windows 개발 환경: 터미널, Git 설치, 줄바꿈]], [[package-managers|자바스크립트 패키지 매니저: npm, yarn, pnpm]]

참고 자료

- [cross-env 모듈 사용법 (Inpa Dev)](https://inpa.tistory.com/entry/NODE-%F0%9F%93%9A-cross-env-%EB%AA%A8%EB%93%88-%EC%82%AC%EC%9A%A9%EB%B2%95)
- [Node.js path 모듈 문서](https://nodejs.org/api/path.html)
