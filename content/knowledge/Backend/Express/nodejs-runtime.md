---
title: "Node.js 런타임과 OS 차이 다루기"
concept: "Node.js"
summary: "브라우저 밖에서 JavaScript를 실행하는 런타임 Node.js가 무엇이고 어디에 강한지, 그리고 Windows·macOS 차이로 깨지는 환경 변수 설정과 파일 경로를 cross-env와 path 모듈로 해결하는 방법."
tags: ["nodejs", "backend", "javascript", "config"]
source: mixed
date: "2026-10-12"
sources: ["https://riverkim.kr/167", "https://riverkim.kr/158", "https://riverkim.kr/230"]
---

> riverkim.kr에 쓴 글들을 다시 정리한 노트입니다.

## Node.js란

**Node.js**는 Chrome의 V8 JavaScript 엔진으로 만든 JavaScript **런타임**(언어가 실행되는 환경)이다. JavaScript는 원래 HTML 문서에 삽입되어 브라우저 안에서만 동작하는 스크립트 언어였다. Node.js를 설치하면 JavaScript를 브라우저와 무관한 프로그램으로 실행할 수 있고, 그중 가장 많이 만드는 것이 **서버**다.

| 특징 | 의미 |
| --- | --- |
| 싱글 스레드 + 비동기 I/O | 요청 하나하나를 기다리지 않고, I/O가 끝나면 콜백으로 이어서 처리한다([[event-loop\|이벤트 루프]]) |
| 잘 맞는 일 | CPU 계산은 적고 **I/O가 많은** 작업. 네트워크·DB·디스크 접근, 채팅, 실시간 주식 차트 |
| 맞지 않는 일 | 영상 인코딩처럼 CPU를 오래 붙잡는 계산. 싱글 스레드가 막혀 다른 요청까지 느려진다 |

Node.js 위에서 서버를 만드는 프레임워크가 **Express**(사실상 표준인 최소 프레임워크)와 **NestJS**(Express·Fastify 위에 모듈·DI 구조를 얹은 프레임워크)다. Express는 자유도가 높고, NestJS는 아키텍처를 프레임워크가 정해 주어 팀원마다 구조가 통일된다([[NestJS|NestJS]]).

## OS 차이로 깨지는 두 가지

같은 코드가 macOS에서는 되고 Windows에서는 안 되는 대표적인 경우가 환경 변수 설정과 파일 경로다.

### 1. 환경 변수: cross-env

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

`.env` 파일은 Node.js 20.6부터 `node --env-file=.env app.js`로 별도 패키지 없이 읽을 수 있다. 과거에는 `dotenv` 패키지가 필수였다. 프레임워크에서 읽는 방법은 [[config-env|NestJS 설정과 환경 변수]]에 있다.

서버를 돌릴 Node.js는 **LTS 버전**을 쓴다. 2026년 10월 기준 LTS는 22와 24이고 20은 2026년 4월에 지원이 끝났다. 짝수 버전이 Current로 나온 뒤 6개월 지나 LTS가 되며, 27부터는 1년 주기로 바뀐다. ([Node.js Releases](https://nodejs.org/en/about/previous-releases))

### 2. 파일 경로: path 모듈

디렉터리 구분자는 Unix 계열이 `/`, Windows가 `\`다. 경로를 문자열로 이어 붙이면 특정 OS에서만 동작하는 코드가 된다. Node.js에 내장된 **path** 모듈을 쓰면 실행 중인 OS에 맞는 구분자로 경로를 만들어 준다.

```javascript
import path from 'path';

path.join('homepage', 'books', 'book');      // 'homepage/books/book' (Windows: 'homepage\\books\\book')
path.join(process.cwd(), 'content', 'blog'); // 프로젝트 기준 절대 경로
path.resolve('content', 'blog');             // 오른쪽부터 붙여 절대 경로를 만든다
path.extname('cover.png');                   // '.png'
```

Next.js 프로젝트를 Vercel에 배포할 때 경로 관련 오류가 난다면, 먼저 문자열로 이어 붙인 경로를 `path.join(process.cwd(), ...)`처럼 path 모듈로 바꿔 본다. 그러면 실행 위치와 OS에 상관없이 같은 파일을 가리킨다.

## 정리

- Node.js는 브라우저 밖의 JavaScript 런타임이고, 싱글 스레드·비동기 I/O라 I/O가 많은 서버에 강하다.
- `NODE_ENV=production node app` 같은 scripts는 Windows에서 깨지므로 `cross-env`를 앞에 붙인다.
- 파일 경로는 문자열로 잇지 말고 `path.join`, `path.resolve`로 만든다.

관련 노트: [[routing-crud|Express 라우팅과 CRUD API]], [[event-loop|브라우저에서 JavaScript가 동작하는 원리: 이벤트 루프]], [[windows-dev-environment|Windows 개발 환경: 터미널, Git 설치, 줄바꿈]], [[package-managers|자바스크립트 패키지 매니저: npm, yarn, pnpm]]

참고 자료

- [cross-env 모듈 사용법 (Inpa Dev)](https://inpa.tistory.com/entry/NODE-%F0%9F%93%9A-cross-env-%EB%AA%A8%EB%93%88-%EC%82%AC%EC%9A%A9%EB%B2%95)
- [Node.js path 모듈 문서](https://nodejs.org/api/path.html)
